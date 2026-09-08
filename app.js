/**
 * 린다이어트 양약 복용 안전 체커 (식약처 공공데이터 연동 & 초간단 UI)
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

function init() {
  renderInitialGuide();
  renderAllModalList();
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

  // 1. 로컬 내장 마스터 DB (250+ 의약품 및 170+ 성분)에서 0.01초 즉시 검색
  const isPureChosung = /^[ㄱ-ㅎ]+$/.test(query);

  const matchedCommercial = POPULAR_COMMERCIAL_DRUGS.filter(drug => {
    const brand = drug.brandName.toLowerCase();
    if (!isPureChosung) {
      if (brand.includes(query) || (drug.company && drug.company.toLowerCase().includes(query))) return true;
      return drug.ingredients.some(i => i.name.toLowerCase().includes(query));
    }
    return getChosung(brand).includes(query);
  });

  const matchedIngredients = ALL_DRUG_INGREDIENTS.filter(ing => {
    const kor = ing.koreanName.toLowerCase();
    const eng = (ing.englishName || '').toLowerCase();
    if (!isPureChosung) {
      if (kor.includes(query) || eng.includes(query)) return true;
      return (ing.commonBrands || []).some(b => b.toLowerCase().includes(query));
    }
    return getChosung(kor).includes(query);
  });

  if (matchedCommercial.length > 0 || matchedIngredients.length > 0) {
    let html = '';
    matchedCommercial.forEach(drug => { html += renderCommercialCard(drug); });
    matchedIngredients.forEach(ing => {
      const alreadyCovered = matchedCommercial.some(c => c.brandName.includes(ing.koreanName));
      if (!alreadyCovered) { html += renderIngredientCard(ing); }
    });
    resultArea.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // 2. 로컬 DB에 없을 경우: 식약처 공공데이터 Open API 실시간 비동기 조회
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
      let html = `<div class="text-xs text-slate-400 mb-2 flex items-center gap-1"><i data-lucide="cloud" class="w-3.5 h-3.5 text-teal-600"></i> 식약처 국가 의약품 제품 허가정보 실시간 조회 결과 (${items.length}건)</div>`;
      
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
        let statusHtml = '<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">🟢 복용 가능</span>';
        let borderClass = 'border-emerald-200 bg-emerald-50/20';

        const hasProhibited = detectedRules.some(r => r.status === 'PROHIBITED');
        const hasCaution = detectedRules.some(r => r.status === 'CAUTION');

        if (hasProhibited) {
          status = 'PROHIBITED';
          statusHtml = '<span class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-red-100 text-red-700 border-2 border-red-300">🔴 병용 복용 불가</span>';
          borderClass = 'border-red-300 bg-red-50/20';
        } else if (hasCaution) {
          status = 'CAUTION';
          statusHtml = '<span class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-amber-100 text-amber-900 border-2 border-amber-400">🟡 병용 주의 약물</span>';
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
      <div class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-slate-800">'${query}' 식약처 공공데이터 실시간 검색 중...</p>
      <p class="text-xs text-slate-400">식품의약품안전처 국가 의약품 DB에서 유효성분을 조회하고 있습니다.</p>
    </div>
  `;
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

// 초기 화면 안내
function renderInitialGuide() {
  const resultArea = document.getElementById('result-area');
  if (!resultArea) return;

  resultArea.innerHTML = `
    <div class="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3 shadow-sm">
      <i data-lucide="search" class="w-8 h-8 text-slate-300 mx-auto"></i>
      <p class="text-sm font-semibold text-slate-700">약 이름을 검색창에 입력해 보세요</p>
      <div class="flex flex-wrap justify-center gap-1.5 text-xs pt-2">
        <button onclick="quickInput('탁센')" class="px-3 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-800 font-bold border border-amber-200">🟡 탁센</button>
        <button onclick="quickInput('타이레놀')" class="px-3 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-800 font-bold border border-amber-200">🟡 타이레놀</button>
        <button onclick="quickInput('뮤코펙트')" class="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 font-bold border border-emerald-200">🟢 뮤코펙트</button>
        <button onclick="quickInput('판콜')" class="px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-bold border border-red-200">🔴 판콜</button>
        <button onclick="quickInput('소론도')" class="px-3 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-800 font-bold border border-amber-200">🟡 소론도 (스테로이드)</button>
        <button onclick="quickInput('스틸녹스')" class="px-3 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-800 font-bold border border-amber-200">🟡 스틸녹스</button>
        <button onclick="quickInput('씬지로이드')" class="px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-bold border border-red-200">🔴 씬지로이드</button>
        <button onclick="quickInput('케이캡')" class="px-3 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-800 font-bold border border-amber-200">🟡 케이캡</button>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
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
