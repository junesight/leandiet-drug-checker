/**
 * 린다이어트 양약 복용 안전 체커 (식약처 공공데이터 연동 & 처방전 OCR 이미지 분석 & 초간단 UI)
 * - 🔴 병용 불가 (빨간색)
 * - 🟡 주의 필요 (노란색)
 * - 🟢 병용 가능 (초록색)
 */

// 초성 추출 유틸리티
const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

function getChosung(str) {
  if (!str) return '';
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code >= 0 && code <= 11171) {
      result += CHOSUNG[Math.floor(code / 588)];
    } else {
      result += str.charAt(i);
    }
  }
  return result.toLowerCase();
}

let debounceTimer = null;
let currentTab = 'text';

function init() {
  renderInitialGuide();
  renderAllModalList();
  setupClipboardPaste();
  if (window.lucide) lucide.createIcons();
}

// 탭 전환 네비게이션
function switchTab(tab) {
  currentTab = tab;
  const tabTextBtn = document.getElementById('tab-text-btn');
  const tabImageBtn = document.getElementById('tab-image-btn');
  const viewText = document.getElementById('view-text');
  const viewImage = document.getElementById('view-image');

  if (tab === 'text') {
    if (viewText) viewText.classList.remove('hidden');
    if (viewImage) viewImage.classList.add('hidden');

    if (tabTextBtn) {
      tabTextBtn.className = 'flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all bg-white text-[#6340cd] shadow-sm';
    }
    if (tabImageBtn) {
      tabImageBtn.className = 'flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-slate-500 hover:text-slate-800';
    }
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.focus();
  } else {
    if (viewText) viewText.classList.add('hidden');
    if (viewImage) viewImage.classList.remove('hidden');

    if (tabImageBtn) {
      tabImageBtn.className = 'flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all bg-white text-[#6340cd] shadow-sm';
    }
    if (tabTextBtn) {
      tabTextBtn.className = 'flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-slate-500 hover:text-slate-800';
    }
  }

  if (window.lucide) lucide.createIcons();
}

// 클립보드 붙여넣기 (Ctrl + V) 이벤트 등록
function setupClipboardPaste() {
  window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        switchTab('image');
        processPrescriptionImage(blob);
        break;
      }
    }
  });
}

// 드래그 앤 드롭 핸들러
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('dropzone');
  if (dropzone) {
    dropzone.classList.add('border-[#6340cd]', 'bg-[#f3f0fc]/60', 'scale-[1.01]');
  }
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('dropzone');
  if (dropzone) {
    dropzone.classList.remove('border-[#6340cd]', 'bg-[#f3f0fc]/60', 'scale-[1.01]');
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('dropzone');
  if (dropzone) {
    dropzone.classList.remove('border-[#6340cd]', 'bg-[#f3f0fc]/60', 'scale-[1.01]');
  }

  const files = e.dataTransfer.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      processPrescriptionImage(file);
    } else {
      alert('이미지 파일(JPG, PNG 등)만 첨부할 수 있습니다.');
    }
  }
}

function handleImageFileSelect(files) {
  if (files && files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      processPrescriptionImage(file);
    } else {
      alert('이미지 파일(JPG, PNG 등)만 첨부할 수 있습니다.');
    }
  }
}

// 처방전 이미지 OCR 인식 및 분석 메인 파이프라인
async function processPrescriptionImage(file) {
  const statusArea = document.getElementById('image-status-area');
  const resultArea = document.getElementById('image-result-area');
  if (!statusArea || !resultArea) return;

  const imageUrl = URL.createObjectURL(file);

  statusArea.classList.remove('hidden');
  resultArea.innerHTML = '';

  // 진행 상태 UI 렌더링
  statusArea.innerHTML = `
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center gap-4">
        <img src="${imageUrl}" alt="첨부 처방전" class="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0" />
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center justify-between">
            <span id="ocr-status-text" class="text-xs sm:text-sm font-bold text-slate-800">처방전 텍스트 인식 준비 중...</span>
            <span id="ocr-percentage" class="text-xs font-extrabold text-[#6340cd]">0%</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div id="ocr-progress-bar" class="bg-[#6340cd] h-2.5 rounded-full transition-all duration-200" style="width: 5%"></div>
          </div>
          <p class="text-[11px] text-slate-400 truncate">${file.name || '처방전 이미지'}</p>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();

  try {
    const statusText = document.getElementById('ocr-status-text');
    const progressBar = document.getElementById('ocr-progress-bar');
    const percentage = document.getElementById('ocr-percentage');

    if (typeof Tesseract === 'undefined') {
      throw new Error('OCR 엔진(Tesseract.js)을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.');
    }

    const worker = await Tesseract.createWorker('kor+eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          const pct = Math.round((m.progress || 0) * 100);
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (percentage) percentage.innerText = `${pct}%`;
          if (statusText) statusText.innerText = `처방전 글자 인식 중... (${pct}%)`;
        } else if (m.status === 'loading tesseract core' || m.status === 'loading language traineddata') {
          if (statusText) statusText.innerText = '한국어/의약품 문자 인식 모델 로딩 중...';
        }
      }
    });

    const ret = await worker.recognize(file);
    await worker.terminate();

    const recognizedText = ret.data.text || '';

    if (statusText) statusText.innerText = '약물 및 성분 대조 분석 중...';
    if (progressBar) progressBar.style.width = '100%';
    if (percentage) percentage.innerText = '100%';

    await analyzePrescriptionText(recognizedText, imageUrl);
  } catch (err) {
    console.error('OCR Error:', err);
    statusArea.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-2">
        <p class="text-sm font-bold text-red-800">이미지 분석 중 오류가 발생했습니다.</p>
        <p class="text-xs text-red-600">${err.message || '사진이 너무 흐리거나 형식이 올바르지 않습니다. 선명한 사진으로 다시 시도해 주세요.'}</p>
      </div>
    `;
  }
}

// 추출된 처방전 텍스트에서 의약품 및 성분 분석
async function analyzePrescriptionText(rawText, imageUrl) {
  const resultArea = document.getElementById('image-result-area');
  const statusArea = document.getElementById('image-status-area');
  if (!resultArea) return;

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let detectedIngredients = [];
  let detectedCommercials = [];
  let matchedRuleIds = new Set();
  let matchedCommercialIds = new Set();

  // 1. 금기/주의 성분 전수 검색
  ALL_DRUG_INGREDIENTS.forEach(rule => {
    const kor = rule.koreanName;
    const eng = rule.englishName;
    const brands = rule.commonBrands || [];

    let isMatch = false;
    if (rawText.includes(kor)) isMatch = true;
    if (eng && rawText.toLowerCase().includes(eng.toLowerCase())) isMatch = true;
    if (brands.some(b => rawText.includes(b))) isMatch = true;

    if (isMatch && !matchedRuleIds.has(rule.id)) {
      matchedRuleIds.add(rule.id);
      detectedIngredients.push(rule);
    }
  });

  // 2. 주요 시판 약물 DB 검색
  POPULAR_COMMERCIAL_DRUGS.forEach(drug => {
    if (rawText.includes(drug.brandName) && !matchedCommercialIds.has(drug.id)) {
      matchedCommercialIds.add(drug.id);
      detectedCommercials.push(drug);
    }
  });

  // 3. 처방전 특화 의약품 단어 패턴 추출 (예: 록소닌정, 슈다페드정, 아세브론캡슐, 타이레놀8시간이알서방정 등)
  const drugPattern = /([가-힣A-Za-z0-9]+(?:정|캡슐|시럽|액|산|패치|과립|서방정|장용정|서방캡슐|건조시럽|점안액|흡입제))/g;
  const potentialDrugNames = new Set();

  lines.forEach(line => {
    // 특수문자 및 기호 정제
    const cleaned = line.replace(/[\[\]\(\)\{\}\<\>\:\;\,\/]/g, ' ');
    const words = cleaned.split(/\s+/);
    words.forEach(w => {
      const match = w.match(drugPattern);
      if (match) {
        match.forEach(m => {
          if (m.length >= 2 && !['일정', '용정', '수정', '개정', '과정', '행정', '지정'].includes(m)) {
            potentialDrugNames.add(m);
          }
        });
      }
    });
  });

  // 미매칭 잠재 약품 목록 중 식약처 API 추가 검색 시도 (상위 최대 5개)
  const candidateList = Array.from(potentialDrugNames).filter(cand => {
    return !detectedCommercials.some(d => d.brandName.includes(cand) || cand.includes(d.brandName)) &&
           !detectedIngredients.some(i => cand.includes(i.koreanName));
  }).slice(0, 5);

  let apiFetchedDrugs = [];
  if (candidateList.length > 0) {
    for (const cand of candidateList) {
      try {
        let items = [];
        const serverRes = await fetch(`/api/search?q=${encodeURIComponent(cand)}`);
        if (serverRes.ok) {
          const serverData = await serverRes.json();
          if (serverData.items && serverData.items.length > 0) {
            items = serverData.items;
          }
        }
        if (items.length > 0) {
          apiFetchedDrugs.push(items[0]);
        }
      } catch (e) {}
    }
  }

  // 완료 상태 UI로 전환
  if (statusArea) {
    statusArea.innerHTML = `
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="${imageUrl}" alt="첨부 처방전" class="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0" />
          <div>
            <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> 분석 완료
            </div>
            <p class="text-xs text-slate-500">처방전 글자 인식 및 의약품 DB 대조가 완료되었습니다.</p>
          </div>
        </div>
        <button onclick="document.getElementById('image-file-input').click()" class="px-3 py-1.5 bg-[#f3f0fc] text-[#6340cd] hover:bg-[#e2d9f9] text-xs font-bold rounded-xl transition">
          다른 처방전 첨부
        </button>
      </div>
    `;
  }

  // 통계 산출
  let prohibitedCount = 0;
  let cautionCount = 0;
  let safeCount = 0;

  detectedIngredients.forEach(i => {
    if (i.status === 'PROHIBITED') prohibitedCount++;
    else if (i.status === 'CAUTION') cautionCount++;
    else safeCount++;
  });

  detectedCommercials.forEach(d => {
    let hasPro = false;
    let hasCau = false;
    d.ingredients.forEach(ing => {
      const rule = ALL_DRUG_INGREDIENTS.find(r => r.koreanName.includes(ing.name) || ing.name.includes(r.koreanName));
      if (rule) {
        if (rule.status === 'PROHIBITED') hasPro = true;
        if (rule.status === 'CAUTION') hasCau = true;
      }
    });
    if (hasPro) prohibitedCount++;
    else if (hasCau) cautionCount++;
    else safeCount++;
  });

  apiFetchedDrugs.forEach(item => {
    const itemName = item.ITEM_NAME || item.itemName || '';
    const ingrName = item.ITEM_INGR_NAME || item.MAIN_ITEM_INGR || '';
    const detectedRules = ALL_DRUG_INGREDIENTS.filter(rule => 
      itemName.includes(rule.koreanName) || 
      ingrName.includes(rule.koreanName) ||
      (rule.commonBrands || []).some(b => itemName.includes(b))
    );
    if (detectedRules.some(r => r.status === 'PROHIBITED')) prohibitedCount++;
    else if (detectedRules.some(r => r.status === 'CAUTION')) cautionCount++;
    else safeCount++;
  });

  const totalDetected = detectedIngredients.length + detectedCommercials.length + apiFetchedDrugs.length;

  let summaryBanner = '';
  if (prohibitedCount > 0) {
    summaryBanner = `
      <div class="bg-red-50 border-2 border-red-300 rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-600 shrink-0">
            <i data-lucide="alert-octagon" class="w-4 h-4"></i>
          </span>
          <h3 class="text-base sm:text-lg font-extrabold text-red-800">
            처방전에 병용 복용 불가 약물이 감지되었습니다!
          </h3>
        </div>
        <p class="text-xs sm:text-sm text-red-900 leading-relaxed pl-9">
          감지된 약물 중 다이어트 한약(마황제)과 함께 복용하면 위험한 성분이 포함되어 있습니다. 한약 복용 전 담당 한의사와 반드시 상의하세요.
        </p>
        <div class="flex items-center gap-2 pl-9 pt-1 text-xs font-bold">
          <span class="px-2 py-0.5 rounded bg-red-200 text-red-900">🔴 불가 ${prohibitedCount}건</span>
          ${cautionCount > 0 ? `<span class="px-2 py-0.5 rounded bg-amber-200 text-amber-900">🟡 주의 ${cautionCount}건</span>` : ''}
          ${safeCount > 0 ? `<span class="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">🟢 가능 ${safeCount}건</span>` : ''}
        </div>
      </div>
    `;
  } else if (cautionCount > 0) {
    summaryBanner = `
      <div class="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-600 shrink-0">
            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
          </span>
          <h3 class="text-base sm:text-lg font-extrabold text-amber-900">
            처방전에 복용 주의 약물이 감지되었습니다.
          </h3>
        </div>
        <p class="text-xs sm:text-sm text-amber-950 leading-relaxed pl-9">
          복용 시간 간격을 두거나 증상에 따라 조절이 필요한 약물이 포함되어 있습니다. 아래 개별 연구진 소견을 확인하세요.
        </p>
        <div class="flex items-center gap-2 pl-9 pt-1 text-xs font-bold">
          <span class="px-2 py-0.5 rounded bg-amber-200 text-amber-900">🟡 주의 ${cautionCount}건</span>
          ${safeCount > 0 ? `<span class="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">🟢 가능 ${safeCount}건</span>` : ''}
        </div>
      </div>
    `;
  } else if (totalDetected > 0) {
    summaryBanner = `
      <div class="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
            <i data-lucide="check-circle-2" class="w-4 h-4"></i>
          </span>
          <h3 class="text-base sm:text-lg font-extrabold text-emerald-800">
            감지된 모든 약물이 병용 가능합니다.
          </h3>
        </div>
        <p class="text-xs sm:text-sm text-emerald-950 leading-relaxed pl-9">
          처방전에서 감지된 약물들은 다이어트 한약(마황제)과 충돌하지 않는 안전한 약물입니다.
        </p>
        <div class="flex items-center gap-2 pl-9 pt-1 text-xs font-bold">
          <span class="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">🟢 안심 복용 가능 ${safeCount}건</span>
        </div>
      </div>
    `;
  } else {
    summaryBanner = `
      <div class="bg-slate-100 border border-slate-200 rounded-2xl p-5 shadow-sm text-center space-y-2">
        <p class="text-sm font-bold text-slate-800">처방전에서 명확한 약물명을 자동으로 식별하지 못했습니다.</p>
        <p class="text-xs text-slate-500">처방전이나 약봉투에 인쇄된 약 이름을 좌측 [이름/성분명 검색] 탭에서 직접 검색해 보세요.</p>
      </div>
    `;
  }

  // 처방전 추출 원본 텍스트 접기/펼치기 아코디언
  const rawTextAccordion = `
    <details class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-xs group">
      <summary class="font-bold text-slate-700 cursor-pointer flex items-center justify-between list-none">
        <span class="flex items-center gap-1.5">
          <i data-lucide="file-text" class="w-4 h-4 text-[#6340cd]"></i>
          처방전에서 추출된 텍스트 확인 (${lines.length}줄)
        </span>
        <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
      </summary>
      <div class="mt-3 pt-3 border-t border-slate-100 text-slate-600 bg-slate-50 p-3 rounded-xl whitespace-pre-wrap font-mono text-[11px] max-h-48 overflow-y-auto leading-relaxed">
${rawText || '추출된 텍스트가 없습니다.'}
      </div>
    </details>
  `;

  // 카드 렌더링
  let cardsHtml = '';

  // 1. 감지된 성분 카드
  detectedIngredients.forEach(ing => {
    cardsHtml += renderIngredientCard(ing);
  });

  // 2. 감지된 시판 약물 카드
  detectedCommercials.forEach(drug => {
    cardsHtml += renderCommercialCard(drug);
  });

  // 3. 식약처 실시간 API로 가져온 약물 카드
  apiFetchedDrugs.forEach(item => {
    const itemName = item.ITEM_NAME || item.itemName || '';
    const entpName = item.ENTP_NAME || item.entpName || '';
    const ingrName = item.ITEM_INGR_NAME || item.MAIN_ITEM_INGR || item.efcyQesitm || '';
    const spclty = item.SPCLTY_PBLC || '의약품';
    const prductType = item.PRDUCT_TYPE ? ` · ${item.PRDUCT_TYPE.replace(/^\[\d+\]/, '')}` : '';

    const detectedRules = ALL_DRUG_INGREDIENTS.filter(rule => 
      itemName.includes(rule.koreanName) || 
      ingrName.includes(rule.koreanName) ||
      (rule.englishName && (itemName.toLowerCase().includes(rule.englishName.toLowerCase()) || ingrName.toLowerCase().includes(rule.englishName.toLowerCase()))) ||
      (rule.commonBrands || []).some(b => itemName.includes(b))
    );

    let status = 'SAFE';
    let statusHtml = '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> 🟢 병용 복용 가능</span>';
    let borderClass = 'border-emerald-200 bg-emerald-50/20';

    const hasProhibited = detectedRules.some(r => r.status === 'PROHIBITED');
    const hasCaution = detectedRules.some(r => r.status === 'CAUTION');

    if (hasProhibited) {
      status = 'PROHIBITED';
      statusHtml = '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-red-100 text-red-700 border-2 border-red-300 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="alert-octagon" class="w-4 h-4 text-red-600"></i> 🔴 병용 복용 불가</span>';
      borderClass = 'border-red-300 bg-red-50/20';
    } else if (hasCaution) {
      status = 'CAUTION';
      statusHtml = '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i> 🟡 병용 주의 약물</span>';
      borderClass = 'border-amber-300 bg-amber-50/30';
    }

    cardsHtml += `
      <div class="bg-white rounded-2xl p-5 border-2 ${borderClass} shadow-sm space-y-3.5 mb-3">
        <!-- 1. 처방명, 제약회사 & 판정 뱃지 -->
        <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div class="space-y-1">
            <div class="text-sm text-slate-600 font-medium">
              처방명 : <span class="text-base font-bold text-slate-900">${itemName}</span>
            </div>
            <div class="text-xs text-slate-500 font-medium">
              제약회사 : <span class="text-slate-700">${entpName}</span>
            </div>
          </div>
          <div class="shrink-0 whitespace-nowrap">
            ${statusHtml}
          </div>
        </div>

        <!-- 2. 성분명 (글씨 키움) -->
        <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div class="text-xs text-slate-500 font-semibold mb-0.5">성분명 :</div>
          <div class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
            ${ingrName || '성분 정보 확인'}
          </div>
        </div>

        <!-- 3. 전문의약품, 분류 -->
        <div class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">${spclty}</span>
          ${prductType ? `<span class="text-slate-500">${prductType}</span>` : ''}
        </div>

        <!-- 4. 연구진 검토 소견 -->
        ${detectedRules.length > 0 ? `
          <div class="p-4 rounded-xl ${status === 'PROHIBITED' ? 'bg-red-50 border border-red-200 text-red-950' : 'bg-amber-50 border border-amber-300 text-amber-950'} text-xs sm:text-sm leading-relaxed space-y-1.5">
            <strong class="font-extrabold block text-sm sm:text-base ${status === 'PROHIBITED' ? 'text-red-700' : 'text-amber-800'}">연구진 검토 소견:</strong>
            ${detectedRules.map(r => `<p>• <strong>[${r.koreanName}]</strong> ${r.opinion}</p>`).join('')}
          </div>
        ` : `
          <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm leading-relaxed">
            <strong class="font-bold text-emerald-800 block mb-1">연구진 검토 소견:</strong>
            현재 등록된 160여 종의 다이어트 한약 금기/주의 성분과 중복되지 않는 안전한 약물입니다.
          </div>
        `}
      </div>
    `;
  });

  resultArea.innerHTML = `
    ${summaryBanner}
    ${cardsHtml ? `<div class="space-y-3">${cardsHtml}</div>` : ''}
    ${rawTextAccordion}
  `;

  if (window.lucide) lucide.createIcons();
}

function clearInput() {
  const input = document.getElementById('search-input');
  if (input) {
    input.value = '';
    handleSearch('');
    input.focus();
  }
}

function handleSearch(query) {
  clearTimeout(debounceTimer);
  query = (query || '').trim().toLowerCase();
  const clearBtn = document.getElementById('clear-btn');
  const resultArea = document.getElementById('result-area');

  if (clearBtn) {
    if (query.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  if (!query) {
    renderInitialGuide();
    return;
  }

  // 1. 성분명 검색 우선 확인 (성분명 검색 시에는 개별 약품 목록 없이 성분 판정 카드만 단독 표시)
  const isPureChosung = /^[ㄱ-ㅎ]+$/.test(query);

  const matchedIngredients = ALL_DRUG_INGREDIENTS.filter(ing => {
    const kor = ing.koreanName.toLowerCase();
    const eng = (ing.englishName || '').toLowerCase();
    if (!isPureChosung) {
      return kor.includes(query) || eng.includes(query);
    }
    return getChosung(kor).includes(query);
  });

  if (matchedIngredients.length > 0) {
    let html = '';
    matchedIngredients.forEach(ing => {
      html += renderIngredientCard(ing);
    });
    resultArea.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // 2. 약 이름(처방명 / 상표명) 로컬 DB 검색
  const matchedCommercial = POPULAR_COMMERCIAL_DRUGS.filter(drug => {
    const brand = drug.brandName.toLowerCase();
    const comp = (drug.company || '').toLowerCase();
    if (!isPureChosung) {
      return brand.includes(query) || comp.includes(query);
    }
    return getChosung(brand).includes(query);
  });

  if (matchedCommercial.length > 0) {
    let html = '';
    matchedCommercial.forEach(drug => {
      html += renderCommercialCard(drug);
    });
    resultArea.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // 3. 로컬에 없는 처방명인 경우: 식약처 국가 허가 DB 실시간 API 조회
  renderSearchingIndicator(query);

  debounceTimer = setTimeout(() => {
    fetchFromMfdsApi(query);
  }, 400);
}

// 식약처 Open API 실시간 호출 (의약품 제품 허가정보 Service07 실시간 연동)
async function fetchFromMfdsApi(query) {
  const resultArea = document.getElementById('result-area');
  try {
    const serviceKey = API_SERVICE_KEY;
    let items = [];

    // 1. Vercel 서버리스 API 프록시 호출
    try {
      const serverRes = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.items && serverData.items.length > 0) {
          items = serverData.items;
        }
      }
    } catch (e) {
      // 프록시 실패 시 직접 호출 시도
    }

    // 2. 직접 API 호출 (로컬 등)
    if (items.length === 0) {
      const url = `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService07/getDrugPrdtPrmsnInq07?serviceKey=${serviceKey}&item_name=${encodeURIComponent(query)}&type=json&numOfRows=30`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          items = data?.body?.items || [];
        }
      } catch (e) {}
    }

    if (items.length > 0) {
      let html = `<div class="text-xs text-slate-400 mb-2 flex items-center gap-1"><i data-lucide="cloud" class="w-3.5 h-3.5 text-[#6340cd]"></i> 식약처 국가 의약품 제품 허가정보 실시간 조회 결과 (${items.length}건)</div>`;
      
      items.forEach(item => {
        const itemName = item.ITEM_NAME || item.itemName || '';
        const entpName = item.ENTP_NAME || item.entpName || '';
        const ingrName = item.ITEM_INGR_NAME || item.MAIN_ITEM_INGR || item.efcyQesitm || '';
        const spclty = item.SPCLTY_PBLC || '의약품';
        const prductType = item.PRDUCT_TYPE ? ` · ${item.PRDUCT_TYPE.replace(/^\[\d+\]/, '')}` : '';
        
        // 린다이어트 170종 성분과 자동 대조
        const detectedRules = ALL_DRUG_INGREDIENTS.filter(rule => 
          itemName.includes(rule.koreanName) || 
          ingrName.includes(rule.koreanName) ||
          (rule.englishName && (itemName.toLowerCase().includes(rule.englishName.toLowerCase()) || ingrName.toLowerCase().includes(rule.englishName.toLowerCase()))) ||
          (rule.commonBrands || []).some(b => itemName.includes(b))
        );

        let status = 'SAFE';
        let statusHtml = '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> 🟢 병용 복용 가능</span>';
        let borderClass = 'border-emerald-200 bg-emerald-50/20';

        const hasProhibited = detectedRules.some(r => r.status === 'PROHIBITED');
        const hasCaution = detectedRules.some(r => r.status === 'CAUTION');

        if (hasProhibited) {
          status = 'PROHIBITED';
          statusHtml = '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-red-100 text-red-700 border-2 border-red-300 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="alert-octagon" class="w-4 h-4 text-red-600"></i> 🔴 병용 복용 불가</span>';
          borderClass = 'border-red-300 bg-red-50/20';
        } else if (hasCaution) {
          status = 'CAUTION';
          statusHtml = '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i> 🟡 병용 주의 약물</span>';
          borderClass = 'border-amber-300 bg-amber-50/30';
        }

        html += `
          <div class="bg-white rounded-2xl p-5 border-2 ${borderClass} shadow-sm space-y-3.5 mb-3">
            <!-- 1. 처방명, 제약회사 & 판정 뱃지 -->
            <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div class="space-y-1">
                <div class="text-sm text-slate-600 font-medium">
                  처방명 : <span class="text-base font-bold text-slate-900">${itemName}</span>
                </div>
                <div class="text-xs text-slate-500 font-medium">
                  제약회사 : <span class="text-slate-700">${entpName}</span>
                </div>
              </div>
              <div class="shrink-0 whitespace-nowrap">
                ${statusHtml}
              </div>
            </div>

            <!-- 2. 성분명 (글씨 키움) -->
            <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
              <div class="text-xs text-slate-500 font-semibold mb-0.5">성분명 :</div>
              <div class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                ${ingrName || '성분 정보 확인'}
              </div>
            </div>

            <!-- 3. 전문의약품, 분류 (아래로 분리 배치) -->
            <div class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">${spclty}</span>
              ${prductType ? `<span class="text-slate-500">${prductType}</span>` : ''}
            </div>

            <!-- 4. 연구진 검토 소견 -->
            ${detectedRules.length > 0 ? `
              <div class="p-4 rounded-xl ${status === 'PROHIBITED' ? 'bg-red-50 border border-red-200 text-red-950' : 'bg-amber-50 border border-amber-300 text-amber-950'} text-xs sm:text-sm leading-relaxed space-y-1.5">
                <strong class="font-extrabold block text-sm sm:text-base ${status === 'PROHIBITED' ? 'text-red-700' : 'text-amber-800'}">연구진 검토 소견:</strong>
                ${detectedRules.map(r => `<p>• <strong>[${r.koreanName}]</strong> ${r.opinion}</p>`).join('')}
              </div>
            ` : `
              <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm leading-relaxed">
                <strong class="font-bold text-emerald-800 block mb-1">연구진 검토 소견:</strong>
                현재 등록된 160여 종의 다이어트 한약 금기/주의 성분과 중복되지 않는 안전한 약물입니다.
              </div>
            `}
          </div>
        `;
      });

      resultArea.innerHTML = html;
      if (window.lucide) lucide.createIcons();
    } else {
      renderNotFound(query);
    }
  } catch (err) {
    console.warn('MFDS API 통신:', err.message);
    renderNotFound(query);
  }
}

function renderSearchingIndicator(query) {
  const resultArea = document.getElementById('result-area');
  if (!resultArea) return;

  resultArea.innerHTML = `
    <div class="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3 shadow-sm">
      <div class="w-8 h-8 border-4 border-[#6340cd] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-slate-800">'${query}' 식약처 공공데이터 실시간 검색 중...</p>
      <p class="text-xs text-slate-400">식품의약품안전처 국가 의약품 DB에서 유효성분을 조회하고 있습니다.</p>
    </div>
  `;
}

// 초기 화면 안내 (가로 3단 상태 박스)
function renderInitialGuide() {
  const resultArea = document.getElementById('result-area');
  if (!resultArea) return;

  resultArea.innerHTML = `
    <div class="grid grid-cols-3 gap-2.5 sm:gap-3.5 pt-1">
      <!-- 1. 초록색: 병용 가능 -->
      <div class="bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm">
        <div class="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <i data-lucide="check-circle-2" class="w-4 h-4"></i>
        </div>
        <span class="text-sm sm:text-base font-extrabold text-emerald-800">병용 가능</span>
      </div>

      <!-- 2. 노란색: 병용 주의 -->
      <div class="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm">
        <div class="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
          <i data-lucide="alert-triangle" class="w-4 h-4"></i>
        </div>
        <span class="text-sm sm:text-base font-extrabold text-amber-900">병용 주의</span>
      </div>

      <!-- 3. 빨간색: 병용 불가 -->
      <div class="bg-red-50/90 border-2 border-red-300 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm">
        <div class="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <i data-lucide="alert-octagon" class="w-4 h-4"></i>
        </div>
        <span class="text-sm sm:text-base font-extrabold text-red-700">병용 불가</span>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

// 시판 의약품 카드 렌더링
function renderCommercialCard(drug) {
  let isProhibited = false;
  let isCaution = false;
  let opinions = [];

  const parsedIngredients = drug.ingredients.map(ing => {
    const rule = ALL_DRUG_INGREDIENTS.find(r => 
      r.koreanName.toLowerCase().includes(ing.name.toLowerCase()) || 
      ing.name.toLowerCase().includes(r.koreanName.toLowerCase())
    );

    if (rule) {
      if (rule.status === 'PROHIBITED') {
        isProhibited = true;
        opinions.push({ name: ing.name, text: rule.opinion, status: 'PROHIBITED' });
      } else if (rule.status === 'CAUTION') {
        isCaution = true;
        opinions.push({ name: ing.name, text: rule.opinion, status: 'CAUTION' });
      }
      return { name: ing.name, amount: ing.amount, status: rule.status, opinion: rule.opinion };
    }
    return { name: ing.name, amount: ing.amount, status: 'SAFE' };
  });

  let statusHtml = '';
  let borderClass = '';

  if (isProhibited) {
    statusHtml = `
      <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-red-100 text-red-700 border-2 border-red-300 shadow-sm shrink-0 whitespace-nowrap">
        <i data-lucide="alert-octagon" class="w-4 h-4 text-red-600"></i> 🔴 병용 복용 불가
      </span>
    `;
    borderClass = 'border-red-300 bg-red-50/20';
  } else if (isCaution) {
    statusHtml = `
      <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-sm shrink-0 whitespace-nowrap">
        <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i> 🟡 병용 주의 약물
      </span>
    `;
    borderClass = 'border-amber-300 bg-amber-50/30';
  } else {
    statusHtml = `
      <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-sm shrink-0 whitespace-nowrap">
        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> 🟢 병용 복용 가능
      </span>
    `;
    borderClass = 'border-emerald-200 bg-emerald-50/20';
  }

  const ingrSummary = parsedIngredients.map(i => `${i.name}${i.amount ? ` (${i.amount})` : ''}`).join(', ');

  return `
    <div class="bg-white rounded-2xl p-5 border-2 ${borderClass} shadow-sm space-y-3.5 mb-3">
      <!-- 1. 처방명, 제약회사 & 판정 뱃지 -->
      <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div class="space-y-1">
          <div class="text-sm text-slate-600 font-medium">
            처방명 : <span class="text-base font-bold text-slate-900">${drug.brandName}</span>
          </div>
          <div class="text-xs text-slate-500 font-medium">
            제약회사 : <span class="text-slate-700">${drug.company || '제조사 정보'}</span>
          </div>
        </div>
        <div class="shrink-0 whitespace-nowrap">
          ${statusHtml}
        </div>
      </div>

      <!-- 2. 성분명 (글씨 키움) -->
      <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
        <div class="text-xs text-slate-500 font-semibold mb-0.5">성분명 :</div>
        <div class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
          ${ingrSummary}
        </div>
      </div>

      <!-- 3. 전문의약품 및 효능 분류 -->
      <div class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
        <span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">${drug.category && drug.category.includes('처방약') ? '전문의약품' : '일반의약품'}</span>
        ${drug.category ? `<span class="text-slate-500">· ${drug.category}</span>` : ''}
      </div>

      <!-- 4. 연구진 검토 소견 -->
      ${opinions.length > 0 ? `
        <div class="p-4 rounded-xl ${isProhibited ? 'bg-red-50 border border-red-200 text-red-950' : 'bg-amber-50 border border-amber-300 text-amber-950'} text-xs sm:text-sm leading-relaxed space-y-1.5">
          <strong class="font-extrabold block text-sm sm:text-base ${isProhibited ? 'text-red-700' : 'text-amber-800'}">연구진 검토 소견:</strong>
          ${opinions.map(op => `<p>• <strong>[${op.name}]</strong> ${op.text}</p>`).join('')}
        </div>
      ` : `
        <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm leading-relaxed">
          <strong class="font-bold text-emerald-800 block mb-1">연구진 검토 소견:</strong>
          린다이어트 한약과 충돌하거나 위험한 상호작용 성분이 없습니다. 안심하고 복용하셔도 됩니다.
        </div>
      `}
    </div>
  `;
}

// 단일 성분 카드 렌더링
function renderIngredientCard(ing) {
  const isProhibited = ing.status === 'PROHIBITED';
  const isCaution = ing.status === 'CAUTION';

  let statusBadge = isProhibited 
    ? `<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-red-100 text-red-700 border-2 border-red-300 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="alert-octagon" class="w-4 h-4 text-red-600"></i> 🔴 병용 복용 불가</span>`
    : (isCaution 
    ? `<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i> 🟡 병용 주의 약물</span>`
    : `<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> 🟢 병용 복용 가능</span>`);

  return `
    <div class="bg-white rounded-2xl p-5 border-2 ${isProhibited ? 'border-red-300 bg-red-50/20' : (isCaution ? 'border-amber-300 bg-amber-50/30' : 'border-emerald-200')} shadow-sm space-y-3.5 mb-3">
      <!-- 1. 성분명 & 판정 뱃지 -->
      <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div class="space-y-1">
          <div class="text-sm text-slate-600 font-medium">
            성분 검색 : <span class="text-base font-bold text-slate-900">${ing.koreanName}</span>
          </div>
          <div class="text-xs text-slate-500 font-medium">
            영문명 : <span class="text-slate-700">${ing.englishName || '-'}</span>
          </div>
        </div>
        <div class="shrink-0 whitespace-nowrap">
          ${statusBadge}
        </div>
      </div>

      <!-- 2. 성분명 (글씨 키움) -->
      <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
        <div class="text-xs text-slate-500 font-semibold mb-0.5">성분명 :</div>
        <div class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
          ${ing.koreanName} <span class="text-sm font-semibold text-slate-500">(${ing.englishName || ''})</span>
        </div>
      </div>

      <!-- 3. 약효 분류 -->
      <div class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
        <span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">성분 분류</span>
        <span class="text-slate-500">· ${ing.category}</span>
      </div>

      <!-- 4. 연구진 검토 소견 -->
      <div class="p-4 rounded-xl ${isProhibited ? 'bg-red-50 border border-red-200 text-red-950' : (isCaution ? 'bg-amber-50 border border-amber-300 text-amber-950' : 'bg-emerald-50 border border-emerald-200 text-emerald-950')} text-xs sm:text-sm leading-relaxed space-y-1.5">
        <strong class="font-extrabold block text-sm sm:text-base ${isProhibited ? 'text-red-700' : (isCaution ? 'text-amber-800' : 'text-emerald-800')}">연구진 검토 소견:</strong>
        <p>${ing.opinion}</p>
      </div>
    </div>
  `;
}

function quickInput(val) {
  const input = document.getElementById('search-input');
  if (input) {
    input.value = val;
    handleSearch(val);
    input.focus();
  }
}

// 검색 결과 없을 때
function renderNotFound(query) {
  const resultArea = document.getElementById('result-area');
  if (!resultArea) return;

  const naverUrl = `https://terms.naver.com/search.naver?query=${encodeURIComponent(query)}`;

  resultArea.innerHTML = `
    <div class="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-3 shadow-sm">
      <p class="text-sm font-bold text-slate-800">'${query}'에 대한 등록 정보를 찾지 못했습니다.</p>
      <p class="text-xs text-slate-500">약봉투에 적힌 성분명(예: 록소프로펜, 에르도스테인 등)으로 검색하시거나 네이버 지식백과에서 성분을 확인해 보세요.</p>
      <div class="pt-2">
        <a href="${naverUrl}" target="_blank" class="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i> 네이버 지식백과에서 '${query}' 성분 확인하기
        </a>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

// 전체 목록 팝업 렌더링
function renderAllModalList() {
  const container = document.getElementById('modal-list');
  if (!container) return;

  container.innerHTML = ALL_DRUG_INGREDIENTS.map((ing, idx) => `
    <div class="py-2.5">
      <div class="flex items-center justify-between font-bold text-slate-900">
        <span>${idx + 1}. ${ing.koreanName} (${ing.englishName || '-'})</span>
        <span class="text-[11px] px-2 py-0.5 rounded font-extrabold ${ing.status === 'PROHIBITED' ? 'bg-red-100 text-red-700 border border-red-300' : (ing.status === 'CAUTION' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300')}">
          ${ing.status === 'PROHIBITED' ? '🔴 복용불가' : (ing.status === 'CAUTION' ? '🟡 주의필요' : '🟢 복용가능')}
        </span>
      </div>
      <p class="text-slate-600 mt-1 leading-relaxed">${ing.opinion}</p>
    </div>
  `).join('');
}

function toggleAllIngredientsModal() {
  const modal = document.getElementById('all-modal');
  if (modal) {
    modal.classList.toggle('hidden');
    if (window.lucide) lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', init);
