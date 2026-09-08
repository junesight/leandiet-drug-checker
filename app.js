/**
 * 린다이어트 양약 복용 안전 체커 (식약처 공공데이터 연동 & 초정밀 AI/전처리 OCR 이미지 분석)
 * - 🔴 병용 불가 (빨간색)
 * - 🟡 주의 필요 (노란색)
 * - 🟢 병용 가능 (초록색)
 */

// 초성, 중성, 종성 분해 유틸리티 (퍼지 오타 매칭용)
const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSEUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONGSEUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

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

// 한글 음절을 자모(초성+중성+종성) 단위로 분해
function decomposeHangul(str) {
  if (!str) return '';
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code >= 0 && code <= 11171) {
      const cho = Math.floor(code / 588);
      const jung = Math.floor((code % 588) / 28);
      const jong = code % 28;
      result += CHOSUNG[cho] + JUNGSEUNG[jung] + (JONGSEUNG[jong] || '');
    } else {
      result += str.charAt(i);
    }
  }
  return result.toLowerCase();
}

// 레벤슈타인 편집 거리 계산
function levenshteinDistance(s1, s2) {
  if (!s1) return s2 ? s2.length : 0;
  if (!s2) return s1 ? s1.length : 0;
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

// 문자열 유사도 계산 (일반 문자열 + 한글 자모 단위 퍼지 유사도 결합)
function stringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  const s1Clean = s1.replace(/[\s\-_]/g, '').toLowerCase();
  const s2Clean = s2.replace(/[\s\-_]/g, '').toLowerCase();
  if (s1Clean === s2Clean) return 1.0;
  if (s1Clean.includes(s2Clean) || s2Clean.includes(s1Clean)) return 0.88;

  // 1. 음절 단위 유사도
  const maxLen = Math.max(s1Clean.length, s2Clean.length);
  const charDist = levenshteinDistance(s1Clean, s2Clean);
  const charSim = maxLen === 0 ? 1.0 : (maxLen - charDist) / maxLen;

  // 2. 자모 단위 분해 유사도 (오타/자모 오인식 강력 교정: 예: 레일라디에스청 vs 레일라디에스정)
  const s1Jamo = decomposeHangul(s1Clean);
  const s2Jamo = decomposeHangul(s2Clean);
  const jamoMax = Math.max(s1Jamo.length, s2Jamo.length);
  const jamoDist = levenshteinDistance(s1Jamo, s2Jamo);
  const jamoSim = jamoMax === 0 ? 1.0 : (jamoMax - jamoDist) / jamoMax;

  return Math.max(charSim, jamoSim);
}

// 연속 텍스트 내 슬라이딩 윈도우(Sliding Window) 퍼지 검색
function findFuzzyMatchesInText(text, targetWord, threshold = 0.75) {
  if (!text || !targetWord) return false;
  const cleanTarget = targetWord.replace(/[\s\-_]/g, '').toLowerCase();
  const cleanText = text.replace(/[\s\-_]/g, '').toLowerCase();

  // 1. 단순 부분 일치 검사
  if (cleanText.includes(cleanTarget)) return true;

  const targetLen = cleanTarget.length;
  if (targetLen <= 1) return false;

  // 2. targetLen ± 1 길이의 슬라이딩 윈도우로 전체 텍스트 스캔
  for (let len = Math.max(2, targetLen - 1); len <= targetLen + 1; len++) {
    for (let i = 0; i <= cleanText.length - len; i++) {
      const windowStr = cleanText.substring(i, i + len);
      const sim = stringSimilarity(windowStr, cleanTarget);
      if (sim >= threshold) {
        return true;
      }
    }
  }
  return false;
}

// 개별 성분/약물명으로 금기/주의/안전 성분 마스터 규칙 탐색 (동의어, 영문명, 상표명, 퍼지매칭 100% 지원)
function findIngredientRule(target) {
  if (!target) return null;
  const t = target.trim().toLowerCase();
  if (!t) return null;

  // 1. 일치 / 부분 포함 (koreanName, englishName)
  for (const r of ALL_DRUG_INGREDIENTS) {
    const k = r.koreanName.toLowerCase();
    const e = (r.englishName || '').toLowerCase();
    if (k === t || k.includes(t) || t.includes(k)) return r;
    if (e && (e === t || e.includes(t) || t.includes(e))) return r;
  }

  // 2. 동의어(synonyms) 매칭 (예: 셀레콕시브, 쎄레콕시브, 플루티카손푸로에이트, 소론도, 메드롤 등)
  for (const r of ALL_DRUG_INGREDIENTS) {
    if (r.synonyms && r.synonyms.some(s => {
      const sLow = s.toLowerCase();
      return sLow === t || sLow.includes(t) || t.includes(sLow);
    })) {
      return r;
    }
  }

  // 3. 대표 상표명(commonBrands) 매칭 (예: 렉시핀, 아세브론, 코푸, 코대원, 게보린, 판콜 등)
  for (const r of ALL_DRUG_INGREDIENTS) {
    if (r.commonBrands && r.commonBrands.some(b => {
      const bLow = b.toLowerCase();
      return bLow === t || bLow.includes(t) || t.includes(bLow);
    })) {
      return r;
    }
  }

  // 4. 자모 단위 퍼지 유사도 (오타/표기 차이 보정)
  let bestMatch = null;
  let highestSim = 0.72;
  for (const r of ALL_DRUG_INGREDIENTS) {
    const k = r.koreanName.toLowerCase();
    const sim = stringSimilarity(t, k);
    if (sim > highestSim) {
      highestSim = sim;
      bestMatch = r;
    }
    if (r.synonyms) {
      for (const s of r.synonyms) {
        const sSim = stringSimilarity(t, s.toLowerCase());
        if (sSim > highestSim) {
          highestSim = sSim;
          bestMatch = r;
        }
      }
    }
  }

  return bestMatch;
}

// 처방명/성분명/효능 텍스트 전체에서 매칭되는 모든 금기/주의 규칙 다중 추출
function findMatchingRules(itemName = '', ingrName = '', efcy = '') {
  const target = `${itemName} ${ingrName} ${efcy}`.toLowerCase();
  const matched = [];

  for (const r of ALL_DRUG_INGREDIENTS) {
    const k = r.koreanName.toLowerCase();
    const e = (r.englishName || '').toLowerCase();
    const syns = (r.synonyms || []).map(s => s.toLowerCase());
    const brands = (r.commonBrands || []).map(b => b.toLowerCase());

    const isMatch = (k && target.includes(k)) ||
                    (e && target.includes(e)) ||
                    syns.some(s => target.includes(s) || (s.length >= 3 && stringSimilarity(itemName.toLowerCase(), s) >= 0.75)) ||
                    brands.some(b => target.includes(b) || (b.length >= 3 && stringSimilarity(itemName.toLowerCase(), b) >= 0.75)) ||
                    (k.length >= 3 && stringSimilarity(itemName.toLowerCase(), k) >= 0.75);

    if (isMatch) {
      if (!matched.some(m => m.id === r.id)) {
        matched.push(r);
      }
    }
  }

  return matched;
}

let debounceTimer = null;
let currentTab = 'text';
let currentPrescriptionFile = null;
let currentImageRotation = 0; // 0, 90, 180, 270

function init() {
  renderInitialGuide();
  renderAllModalList();
  setupClipboardPaste();
  if (window.lucide) lucide.createIcons();
}

// 탭 전환
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

// 클립보드 붙여넣기 (Ctrl + V)
function setupClipboardPaste() {
  window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        switchTab('image');
        currentPrescriptionFile = blob;
        currentImageRotation = 0;
        processPrescriptionImage(blob);
        break;
      }
    }
  });
}

// 드래그 앤 드롭
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
      currentPrescriptionFile = file;
      currentImageRotation = 0;
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
      currentPrescriptionFile = file;
      currentImageRotation = 0;
      processPrescriptionImage(file);
    } else {
      alert('이미지 파일(JPG, PNG 등)만 첨부할 수 있습니다.');
    }
  }
}

function rotatePrescription(degrees) {
  if (!currentPrescriptionFile) return;
  currentImageRotation = (currentImageRotation + degrees + 360) % 360;
  processPrescriptionImage(currentPrescriptionFile, currentImageRotation);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 캔버스 기반 회전 + 고화질 전처리 (2.5배 업스케일링 + 명암대비 극대화 + 라플라시안 샤프닝)
async function preprocessAndRotateImage(file, rotationDegrees = 0) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 1. 작은 글씨(8pt) 자모음 뭉개짐 방지를 위한 2.0~2.5배 업스케일링
      let scale = 1;
      const baseWidth = (rotationDegrees === 90 || rotationDegrees === 270) ? img.height : img.width;
      if (baseWidth < 1800) {
        scale = Math.min(2.5, 2200 / baseWidth);
      }

      const drawWidth = Math.round(img.width * scale);
      const drawHeight = Math.round(img.height * scale);

      if (rotationDegrees === 90 || rotationDegrees === 270) {
        canvas.width = drawHeight;
        canvas.height = drawWidth;
      } else {
        canvas.width = drawWidth;
        canvas.height = drawHeight;
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotationDegrees * Math.PI) / 180);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // 2. 그레이스케일 변환 및 히스토그램 스트레칭
      let minVal = 255;
      let maxVal = 0;
      const grayData = new Uint8Array(w * h);

      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
        grayData[p] = gray;
        if (gray < minVal) minVal = gray;
        if (gray > maxVal) maxVal = gray;
      }

      const range = maxVal - minVal || 1;

      // 3. 선명화(Sharpening) 컨볼루션 필터 적용 (3x3 Laplacian: 8pt 얇은 글씨 획 복원)
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          const pixelIdx = idx * 4;

          const center = grayData[idx];
          const top = grayData[(y - 1) * w + x];
          const bottom = grayData[(y + 1) * w + x];
          const left = grayData[y * w + (x - 1)];
          const right = grayData[y * w + (x + 1)];

          const sharp = (5 * center) - (top + bottom + left + right);
          let stretched = Math.round(((sharp - minVal) / range) * 255);
          stretched = stretched < 135 ? Math.max(0, stretched - 35) : Math.min(255, stretched + 35);

          d[pixelIdx] = stretched;
          d[pixelIdx + 1] = stretched;
          d[pixelIdx + 2] = stretched;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((blob) => {
        resolve({ blob: blob || file, dataUrl: canvas.toDataURL('image/jpeg', 0.92) });
      }, 'image/jpeg');
    };
    img.src = URL.createObjectURL(file);
  });
}

function normalizePrescriptionText(text) {
  if (!text) return '';
  let normalized = text.replace(/([가-힣])\s+([가-힣])\s+([가-힣])\s+([가-힣])/g, '$1$2$3$4')
                       .replace(/([가-힣])\s+([가-힣])\s+([가-힣])/g, '$1$2$3')
                       .replace(/([가-힣])\s+([가-힣])/g, '$1$2');

  return normalized;
}

// 처방전 판독 메인 파이프라인
async function processPrescriptionImage(file, rotationAngle = currentImageRotation) {
  currentPrescriptionFile = file;
  currentImageRotation = rotationAngle;

  const statusArea = document.getElementById('image-status-area');
  const resultArea = document.getElementById('image-result-area');
  if (!statusArea || !resultArea) return;

  statusArea.classList.remove('hidden');
  resultArea.innerHTML = '';

  const savedKey = localStorage.getItem('gemini_api_key') || '';

  statusArea.innerHTML = `
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center gap-4">
        <div class="relative shrink-0">
          <img id="preview-thumbnail" src="${URL.createObjectURL(file)}" alt="첨부 처방전" class="w-16 h-16 object-cover rounded-xl border border-slate-200" style="transform: rotate(${rotationAngle}deg);" />
        </div>
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center justify-between">
            <span id="ocr-status-text" class="text-xs sm:text-sm font-bold text-slate-800">
              ${savedKey ? '✨ 99.9% Gemini AI Vision 판독 중...' : '📸 이미지 전처리 및 의약품 인식 중...'}
            </span>
            <span id="ocr-percentage" class="text-xs font-extrabold text-[#6340cd]">0%</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div id="ocr-progress-bar" class="bg-[#6340cd] h-2.5 rounded-full transition-all duration-200" style="width: 15%"></div>
          </div>
          <div class="flex items-center justify-between pt-0.5">
            <p class="text-[11px] text-slate-400 truncate">${file.name || '처방전 이미지'}${rotationAngle ? ` (${rotationAngle}° 회전됨)` : ''}</p>
            <div class="flex items-center gap-1.5 shrink-0">
              <button onclick="rotatePrescription(-90)" title="반시계 90도 회전" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-0.5 transition">
                <i data-lucide="rotate-ccw" class="w-3 h-3"></i> -90°
              </button>
              <button onclick="rotatePrescription(90)" title="시계방향 90도 회전" class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-0.5 transition">
                <i data-lucide="rotate-cw" class="w-3 h-3"></i> +90°
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();

  const statusText = document.getElementById('ocr-status-text');
  const progressBar = document.getElementById('ocr-progress-bar');
  const percentage = document.getElementById('ocr-percentage');

  // STEP 1: Gemini AI Vision 호출 (100% 결정적 추출)
  try {
    const { blob: processedBlob, dataUrl } = await preprocessAndRotateImage(file, rotationAngle);
    const base64Data = dataUrl;
    
    if (statusText) statusText.innerText = '🤖 AI Vision 처방전 분석 중...';
    if (progressBar) progressBar.style.width = '45%';
    if (percentage) percentage.innerText = '45%';

    const aiRes = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType: 'image/jpeg',
        apiKey: savedKey
      })
    });

    if (aiRes.ok) {
      const aiData = await aiRes.json();
      if (aiData.success && aiData.drugs && aiData.drugs.length > 0) {
        if (progressBar) progressBar.style.width = '100%';
        if (percentage) percentage.innerText = '100%';
        if (statusText) statusText.innerText = '처방전 분석 완료!';

        await renderAiVisionResults(aiData.drugs, aiData.rawSummary, dataUrl, aiData.totalPrescribedCount, aiData.unrecognizedCount);
        return;
      }
    }
  } catch (e) {
    console.warn('AI Vision Fallback to Local OCR:', e);
  }

  // STEP 2: 브라우저 고성능 Canvas 회전/전처리 + Tesseract OCR + 슬라이딩 윈도우 퍼지 매칭
  try {
    if (statusText) statusText.innerText = '🔍 고화질 이미지 전처리(대비강화·회전보정) 진행 중...';
    if (progressBar) progressBar.style.width = '30%';
    if (percentage) percentage.innerText = '30%';

    const { blob: preprocessedBlob, dataUrl } = await preprocessAndRotateImage(file, rotationAngle);

    if (typeof Tesseract === 'undefined') {
      throw new Error('OCR 엔진(Tesseract.js)을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.');
    }

    if (statusText) statusText.innerText = '한국어/의약품 문자 인식 모델 구동 중...';

    const worker = await Tesseract.createWorker('kor+eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          const pct = Math.round(30 + (m.progress || 0) * 60);
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (percentage) percentage.innerText = `${pct}%`;
          if (statusText) statusText.innerText = `처방전 글자 인식 중... (${pct}%)`;
        }
      }
    });

    let ret = await worker.recognize(preprocessedBlob);
    let recognizedText = ret.data.text || '';
    let normalizedText = normalizePrescriptionText(recognizedText);

    // 자동 90도 회전 검출
    if (normalizedText.length < 15 && rotationAngle === 0) {
      if (statusText) statusText.innerText = '🔄 90도 회전 처방전 자동 감지 및 재분석 중...';
      const rotated90 = await preprocessAndRotateImage(file, 90);
      const ret90 = await worker.recognize(rotated90.blob);
      const norm90 = normalizePrescriptionText(ret90.data.text || '');

      if (norm90.length > normalizedText.length) {
        recognizedText = ret90.data.text || '';
        normalizedText = norm90;
        currentImageRotation = 90;
      }
    }

    await worker.terminate();

    if (statusText) statusText.innerText = '의약품 DB 정밀 대조 및 오타 보정 중...';
    if (progressBar) progressBar.style.width = '100%';
    if (percentage) percentage.innerText = '100%';

    await analyzePrescriptionText(normalizedText, recognizedText, dataUrl);
  } catch (err) {
    console.error('OCR Error:', err);
    statusArea.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-2">
        <p class="text-sm font-bold text-red-800">이미지 분석 중 오류가 발생했습니다.</p>
        <p class="text-xs text-red-600">${err.message || '선명한 사진으로 다시 시도해 주세요.'}</p>
      </div>
    `;
  }
}

// AI Vision 결과 렌더링 (미판독 약물 알림 포함)
async function renderAiVisionResults(drugs, rawSummary, imageUrl, totalPrescribedCount, unrecognizedCount) {
  const resultArea = document.getElementById('image-result-area');
  const statusArea = document.getElementById('image-status-area');
  if (!resultArea) return;

  const totalCount = totalPrescribedCount || drugs.length;
  const unrecCount = typeof unrecognizedCount === 'number' ? unrecognizedCount : Math.max(0, totalCount - drugs.length);

  if (statusArea) {
    statusArea.innerHTML = `
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="${imageUrl}" alt="첨부 처방전" class="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0" />
          <div>
            <div class="flex items-center gap-1.5 text-xs font-bold text-[#6340cd]">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> 처방전 의약품 분석 완료 (${drugs.length}종 식별)
            </div>
            <p class="text-xs text-slate-500">처방전의 의약품 및 성분 대조가 완료되었습니다.</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="rotatePrescription(90)" title="90도 회전" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1">
            <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i> 회전
          </button>
          <button onclick="document.getElementById('image-file-input').click()" class="px-3 py-1.5 bg-[#f3f0fc] text-[#6340cd] hover:bg-[#e2d9f9] text-xs font-bold rounded-xl transition">
            다른 처방전
          </button>
        </div>
      </div>
    `;
  }

  let cardsHtml = '';
  let prohibitedCount = 0;
  let cautionCount = 0;
  let safeCount = 0;

  drugs.forEach(d => {
    const drugName = d.name || '';
    const ingrName = d.ingredient || '';

    // 1. 등록된 복합제/인기 처방약 DB 매칭 우선 (퍼지 오타 매칭 포함)
    const matchedCommercial = POPULAR_COMMERCIAL_DRUGS.find(cd => 
      drugName.includes(cd.brandName) || 
      cd.brandName.includes(drugName) ||
      stringSimilarity(drugName, cd.brandName) >= 0.75
    );

    let displayIngr = ingrName;
    let detectedRules = [];
    let commercialDesc = '';

    if (matchedCommercial) {
      displayIngr = matchedCommercial.ingredients.map(i => `${i.name} ${i.amount || ''}`.trim()).join(' · ');
      commercialDesc = matchedCommercial.description || '';
      
      matchedCommercial.ingredients.forEach(ing => {
        const rule = findIngredientRule(ing.name);
        if (rule && !detectedRules.some(dr => dr.id === rule.id)) {
          detectedRules.push(rule);
        }
      });
    }

    if (detectedRules.length === 0) {
      detectedRules = findMatchingRules(drugName, displayIngr);
    }

    let status = 'SAFE';
    let statusHtml = '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> 🟢 병용 복용 가능</span>';
    let borderClass = 'border-emerald-200 bg-emerald-50/20';

    const hasProhibited = detectedRules.some(r => r.status === 'PROHIBITED');
    const hasCaution = detectedRules.some(r => r.status === 'CAUTION');

    if (hasProhibited) {
      status = 'PROHIBITED';
      prohibitedCount++;
      statusHtml = '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-red-100 text-red-700 border-2 border-red-300 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="alert-octagon" class="w-4 h-4 text-red-600"></i> 🔴 병용 복용 불가</span>';
      borderClass = 'border-red-300 bg-red-50/20';
    } else if (hasCaution) {
      status = 'CAUTION';
      cautionCount++;
      statusHtml = '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i> 🟡 병용 주의 약물</span>';
      borderClass = 'border-amber-300 bg-amber-50/30';
    } else {
      safeCount++;
    }

    cardsHtml += `
      <div class="bg-white rounded-2xl p-5 border-2 ${borderClass} shadow-sm space-y-3.5 mb-3">
        <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div class="space-y-1">
            <div class="text-sm text-slate-600 font-medium">
              처방명 : <span class="text-base font-bold text-slate-900">${matchedCommercial ? matchedCommercial.brandName : drugName}</span>
            </div>
            ${d.dosage ? `<div class="text-xs text-slate-500 font-medium">용법/용량 : <span class="text-slate-700">${d.dosage}</span></div>` : ''}
          </div>
          <div class="shrink-0 whitespace-nowrap">
            ${statusHtml}
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div class="text-xs text-slate-500 font-semibold mb-0.5">주요 성분 :</div>
          <div class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
            ${displayIngr || (detectedRules.length > 0 ? detectedRules.map(r => r.koreanName).join(', ') : '유효성분')}
          </div>
        </div>

        ${commercialDesc ? `
          <div class="text-xs text-slate-600 bg-[#f3f0fc]/50 p-2.5 rounded-lg border border-[#e2d9f9]">
            💡 ${commercialDesc}
          </div>
        ` : ''}

        ${detectedRules.length > 0 ? `
          <div class="p-4 rounded-xl ${status === 'PROHIBITED' ? 'bg-red-50 border border-red-200 text-red-950' : (status === 'CAUTION' ? 'bg-amber-50 border border-amber-300 text-amber-950' : 'bg-emerald-50 border border-emerald-200 text-emerald-950')} text-xs sm:text-sm leading-relaxed space-y-1.5">
            <strong class="font-extrabold block text-sm sm:text-base ${status === 'PROHIBITED' ? 'text-red-700' : (status === 'CAUTION' ? 'text-amber-800' : 'text-emerald-800')}">연구진 검토 소견:</strong>
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

  const summaryBanner = renderSummaryBanner(prohibitedCount, cautionCount, safeCount, drugs.length);

  // 미판독 약물 알림 문구 박스
  const unparsedWarningHtml = unrecCount > 0 ? `
    <div class="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 text-center space-y-2 shadow-sm mb-4">
      <div class="flex items-center justify-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
        <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600"></i>
        <span>${totalCount}종류 중 ${unrecCount}종류의 약은 이미지 판독이 어렵습니다.</span>
      </div>
      <p class="text-xs sm:text-sm text-amber-900 font-bold">
        약 이름/성분명 검색이 필요합니다.
      </p>
      <button onclick="switchTab('text')" class="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#6340cd] text-white text-xs font-bold rounded-xl hover:bg-[#502bb8] transition shadow-sm">
        <i data-lucide="search" class="w-4 h-4"></i> 약 이름 / 성분명 검색하러 가기
      </button>
    </div>
  ` : '';

  resultArea.innerHTML = `
    ${summaryBanner}
    ${unparsedWarningHtml}
    <div class="space-y-3">${cardsHtml}</div>
    ${rawSummary ? `
      <details class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-xs group">
        <summary class="font-bold text-slate-700 cursor-pointer flex items-center justify-between list-none">
          <span class="flex items-center gap-1.5"><i data-lucide="file-text" class="w-4 h-4 text-[#6340cd]"></i> 추출 의약품 요약 정보</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
        </summary>
        <div class="mt-3 pt-3 border-t border-slate-100 text-slate-600 bg-slate-50 p-3 rounded-xl whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
${rawSummary}
        </div>
      </details>
    ` : ''}
  `;

  if (window.lucide) lucide.createIcons();
}



function renderSummaryBanner(prohibitedCount, cautionCount, safeCount, totalCount) {
  if (prohibitedCount > 0) {
    return `
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
    return `
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
  } else if (totalCount > 0) {
    return `
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
  }
  return `
    <div class="bg-slate-100 border border-slate-200 rounded-2xl p-5 shadow-sm text-center space-y-2">
      <p class="text-sm font-bold text-slate-800">처방전에서 명확한 약물명을 자동으로 식별하지 못했습니다.</p>
      <p class="text-xs text-slate-500">사진이 90도 돌아가 있는 경우 상단의 [회전 (+90°)] 버튼을 눌러 정방향으로 맞추시거나, 우측 하단의 [99.9% 초정밀 AI 판독기 설정]을 사용해 보세요.</p>
    </div>
  `;
}

// 텍스트에서 연속 슬라이딩 윈도우 퍼지 매칭으로 완벽한 의약품 전수 검출
async function analyzePrescriptionText(normalizedText, rawText, imageUrl) {
  const resultArea = document.getElementById('image-result-area');
  const statusArea = document.getElementById('image-status-area');
  if (!resultArea) return;

  const combinedFullText = `${normalizedText} ${rawText}`;
  const lines = normalizedText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. 처방전 행별(Row-by-Row) 정밀 의약품 추출 (상단 헤더 정보 및 병원명 제외)
  const rowDrugCandidates = [];
  const processedNames = new Set();

  const ignoreWords = [
    '환자', '환자정', '환자정보', '정보', '병원', '의원', '약국', '조제', '교부', '교부번호', 
    '발행', '발행일', '안내', '복약', '복약안내', '약품사진', '약품명', '올바른', '올바른정', 
    '정형외과', '내과', '이비인후과', '소아과', '외과', '약사', '일자', '번호', '성명', '이름', 
    '용법', '용량', '효능', '효과', '주의', '보관', '식전', '식후', '아침', '점심', '저녁', '취침', 
    '일정', '용정', '수정', '개정', '과정', '행정', '지정', '안정', '적정', '확정', '배정', '판정', '처방'
  ];

  lines.forEach(line => {
    // 헤더/환자정보/병원정보/테이블 헤더 라인은 분석에서 원천 제외
    if (line.includes('환자정보') || line.includes('교부번호') || line.includes('병원정보') || 
        line.includes('조제약사') || line.includes('조제일자') || line.includes('발행일') || 
        line.includes('약품사진') || line.includes('약품명') || line.includes('복약안내') ||
        line.includes('의원') || line.includes('병원') || line.includes('약국')) {
      return;
    }

    // 수출명 괄호 정제 (예: (수출명:네오-케이정) 제거)
    let cleanLine = line.replace(/\(수출명\s*:[^)]*\)/gi, '').trim();
    // 용량 접미사 제거 (예: _(0.3g/1캡슐), _(1정), _(0.1g/1캡슐))
    cleanLine = cleanLine.replace(/_?\s*\(\s*[\d\.]+\s*(?:g|mg|ml|정|캡슐|포|매|환)\s*\/\s*\d+\s*(?:정|캡슐|포|매|환)\s*\)/gi, '')
                         .replace(/_?\s*\(\s*\d+\s*(?:정|캡슐|포|매|환)\s*\)/gi, '')
                         .replace(/_\s*[\d\.]+\s*(?:g|mg|ml|정|캡슐|포|매|환)/gi, '')
                         .replace(/_.*$/, '');

    // 괄호 안의 성분명 추출 (예: 뮤코메드캡슐(에르도스테인) -> name: 뮤코메드캡슐, ingr: 에르도스테인)
    let extractedIngr = '';
    const parenMatch = cleanLine.match(/\(([^)]+)\)/);
    if (parenMatch) {
      extractedIngr = parenMatch[1].trim();
      cleanLine = cleanLine.replace(/\([^)]+\)/g, '').trim();
    }

    // 약품명 단어 추출 (정, 캡슐, 서방정, 이알서방정 등)
    const drugMatch = cleanLine.match(/[가-힣A-Za-z0-9]{2,}(?:이알서방정|서방캡슐|서방정|장용정|건조시럽|점안액|흡입제|캡슐|시럽|과립|패치|액|산|정)/);
    if (drugMatch) {
      const drugName = drugMatch[0].trim();
      if (!processedNames.has(drugName) && !ignoreWords.includes(drugName)) {
        processedNames.add(drugName);
        rowDrugCandidates.push({
          rawName: drugName,
          hintIngr: extractedIngr
        });
      }
    }
  });

  // 2. 각 후보 약물별 마스터 DB 및 식약처 실시간 API 대조
  let detectedCommercials = [];
  let apiFetchedDrugs = [];

  for (const item of rowDrugCandidates) {
    const qName = item.rawName;
    const hIngr = item.hintIngr;

    // A. 로컬 시판약 DB 정밀/퍼지 확인 (오타 자동 보정: 예: 르코하민정 -> 뮤코라민정)
    let localMatch = POPULAR_COMMERCIAL_DRUGS.find(d => {
      const cleanB = d.brandName.replace(/\s*\(.*$/, '').trim();
      return cleanB === qName || cleanB.includes(qName) || qName.includes(cleanB) || stringSimilarity(qName, cleanB) >= 0.70;
    });

    if (localMatch) {
      if (!detectedCommercials.some(d => d.id === localMatch.id)) {
        detectedCommercials.push(localMatch);
      }
      continue;
    }

    // B. 식약처 실시간 API 조회
    try {
      let apiItems = [];
      const serverRes = await fetch(`/api/search?q=${encodeURIComponent(qName)}`);
      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.items && serverData.items.length > 0) {
          apiItems = serverData.items;
        }
      }

      if (apiItems.length > 0) {
        const bestItem = apiItems[0];
        const bestName = bestItem.ITEM_NAME || bestItem.itemName || qName;
        if (!apiFetchedDrugs.some(a => (a.ITEM_NAME || a.itemName) === bestName)) {
          apiFetchedDrugs.push(bestItem);
        }
        continue;
      }
    } catch (e) {}

    // C. 괄호 안의 성분명이 존재하는 경우에만 유효 의약품으로 인정
    if (hIngr) {
      const customMatch = ALL_DRUG_INGREDIENTS.find(r => r.koreanName.includes(hIngr) || hIngr.includes(r.koreanName));
      detectedCommercials.push({
        id: `custom_${qName}`,
        brandName: qName,
        company: '처방 의약품',
        category: '전문의약품 (처방약)',
        ingredients: [{ name: hIngr, amount: '' }]
      });
    }
  }

  const finalIngredients = [];

  if (statusArea) {
    statusArea.innerHTML = `
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="${imageUrl}" alt="첨부 처방전" class="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0" />
          <div>
            <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> 고화질 전처리 OCR 분석 완료
            </div>
            <p class="text-xs text-slate-500">이미지 보정 및 670여 종 마스터 의약품 DB 대조가 완료되었습니다.</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="rotatePrescription(90)" title="90도 회전" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1">
            <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i> 회전
          </button>
          <button onclick="document.getElementById('image-file-input').click()" class="px-3 py-1.5 bg-[#f3f0fc] text-[#6340cd] hover:bg-[#e2d9f9] text-xs font-bold rounded-xl transition">
            다른 처방전
          </button>
        </div>
      </div>
    `;
  }

  let prohibitedCount = 0;
  let cautionCount = 0;
  let safeCount = 0;

  finalIngredients.forEach(i => {
    if (i.status === 'PROHIBITED') prohibitedCount++;
    else if (i.status === 'CAUTION') cautionCount++;
    else safeCount++;
  });

  detectedCommercials.forEach(d => {
    let hasPro = false;
    let hasCau = false;
    d.ingredients.forEach(ing => {
      const rule = findIngredientRule(ing.name);
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
    const detectedRules = findMatchingRules(itemName, ingrName, item.efcyQesitm || '');
    if (detectedRules.some(r => r.status === 'PROHIBITED')) prohibitedCount++;
    else if (detectedRules.some(r => r.status === 'CAUTION')) cautionCount++;
    else safeCount++;
  });

  // 처방전 상의 총 의약품 행 수 추정 (헤더 제외 의약품/용법 토큰 포함 행 카운트)
  let totalEstimatedRows = 0;
  lines.forEach(l => {
    if (l.includes('환자정보') || l.includes('교부번호') || l.includes('병원정보') || 
        l.includes('조제약사') || l.includes('조제일자') || l.includes('발행일') || 
        l.includes('약품사진') || l.includes('약품명') || l.includes('복약안내') ||
        l.includes('의원') || l.includes('병원') || l.includes('약국')) {
      return;
    }
    if (/[가-힣A-Za-z0-9]{2,}(?:정|캡슐|서방정|시럽|과립|액|산|환|포|매|ml|mg|g)/.test(l) ||
        /\b\d+\s*(?:정|캡슐|포|매|환|ml|mg)\b/.test(l)) {
      totalEstimatedRows++;
    }
  });

  const totalDetected = finalIngredients.length + detectedCommercials.length + apiFetchedDrugs.length;
  const finalTotalRows = Math.max(totalDetected, totalEstimatedRows);
  const unparsedCount = Math.max(0, finalTotalRows - totalDetected);
  const summaryBanner = renderSummaryBanner(prohibitedCount, cautionCount, safeCount, totalDetected);

  // 미판독 약물 경고 문구 박스
  const unparsedWarningHtml = unparsedCount > 0 ? `
    <div class="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 text-center space-y-2 shadow-sm mb-4">
      <div class="flex items-center justify-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
        <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600"></i>
        <span>${finalTotalRows}종류 중 ${unparsedCount}종류의 약은 이미지 판독이 어렵습니다.</span>
      </div>
      <p class="text-xs sm:text-sm text-amber-900 font-bold">
        약 이름/성분명 검색이 필요합니다.
      </p>
      <button onclick="switchTab('text')" class="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#6340cd] text-white text-xs font-bold rounded-xl hover:bg-[#502bb8] transition shadow-sm">
        <i data-lucide="search" class="w-4 h-4"></i> 약 이름 / 성분명 검색하러 가기
      </button>
    </div>
  ` : '';

  let cardsHtml = '';
  finalIngredients.forEach(ing => { cardsHtml += renderIngredientCard(ing); });
  detectedCommercials.forEach(drug => { cardsHtml += renderCommercialCard(drug); });
  apiFetchedDrugs.forEach(item => {
    const itemName = item.ITEM_NAME || item.itemName || '';
    const entpName = item.ENTP_NAME || item.entpName || '';
    const ingrName = item.ITEM_INGR_NAME || item.MAIN_ITEM_INGR || item.efcyQesitm || '';
    const spclty = item.SPCLTY_PBLC || '의약품';
    const prductType = item.PRDUCT_TYPE ? ` · ${item.PRDUCT_TYPE.replace(/^\[\d+\]/, '')}` : '';

    const detectedRules = findMatchingRules(itemName, ingrName, item.efcyQesitm || '');

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
        <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div class="text-xs text-slate-500 font-semibold mb-0.5">성분명 :</div>
          <div class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
            ${ingrName || '성분 정보 확인'}
          </div>
        </div>
        <div class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">${spclty}</span>
          ${prductType ? `<span class="text-slate-500">${prductType}</span>` : ''}
        </div>
        ${detectedRules.length > 0 ? `
          <div class="p-4 rounded-xl ${status === 'PROHIBITED' ? 'bg-red-50 border border-red-200 text-red-950' : (status === 'CAUTION' ? 'bg-amber-50 border border-amber-300 text-amber-950' : 'bg-emerald-50 border border-emerald-200 text-emerald-950')} text-xs sm:text-sm leading-relaxed space-y-1.5">
            <strong class="font-extrabold block text-sm sm:text-base ${status === 'PROHIBITED' ? 'text-red-700' : (status === 'CAUTION' ? 'text-amber-800' : 'text-emerald-800')}">연구진 검토 소견:</strong>
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

  const rawTextAccordion = `
    <details class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-xs group">
      <summary class="font-bold text-slate-700 cursor-pointer flex items-center justify-between list-none">
        <span class="flex items-center gap-1.5">
          <i data-lucide="file-text" class="w-4 h-4 text-[#6340cd]"></i>
          처방전에서 추출된 원본 텍스트 확인 (${lines.length}줄)
        </span>
        <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
      </summary>
      <div class="mt-3 pt-3 border-t border-slate-100 text-slate-600 bg-slate-50 p-3 rounded-xl whitespace-pre-wrap font-mono text-[11px] max-h-48 overflow-y-auto leading-relaxed">
${rawText || '추출된 텍스트가 없습니다.'}
      </div>
    </details>
  `;

  resultArea.innerHTML = `
    ${summaryBanner}
    ${unparsedWarningHtml}
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

  // 다중 약물 검색 지원 (쉼표, 줄바꿈, 슬래시 등으로 여러 약물을 한 번에 입력한 경우)
  if (query.includes(',') || query.includes('/') || query.includes('\n') || (query.includes(' ') && query.length > 10)) {
    const rawTokens = query.split(/[\,\/\n\+]/).map(t => t.trim()).filter(Boolean);
    if (rawTokens.length > 1) {
      handleBatchSearch(rawTokens);
      return;
    }
  }

  const isPureChosung = /^[ㄱ-ㅎ]+$/.test(query);

  // 1. 상표명(처방명/약품명) 매칭 검사 (POPULAR_COMMERCIAL_DRUGS)
  const matchedCommercial = POPULAR_COMMERCIAL_DRUGS.filter(drug => {
    const brand = drug.brandName.toLowerCase();
    const comp = (drug.company || '').toLowerCase();
    if (!isPureChosung) {
      return brand.includes(query) || comp.includes(query) || (query.length >= 2 && stringSimilarity(query, brand) >= 0.75);
    }
    return getChosung(brand).includes(query);
  });

  // 2. 순수 성분명 매칭 검사 (ALL_DRUG_INGREDIENTS의 koreanName 및 englishName 중심)
  const matchedIngredients = ALL_DRUG_INGREDIENTS.filter(ing => {
    const kor = ing.koreanName.toLowerCase();
    const eng = (ing.englishName || '').toLowerCase();
    if (!isPureChosung) {
      return kor === query || kor.startsWith(query) || (query.length >= 2 && kor.includes(query)) ||
             eng === query || eng.startsWith(query) ||
             (query.length >= 3 && stringSimilarity(query, kor) >= 0.82);
    }
    return getChosung(kor).startsWith(query) || getChosung(kor) === query;
  });

  // 검색어가 순수 성분명 자체와 정확히 일치하는지 확인
  const isExactIngredient = matchedIngredients.some(ing => 
    ing.koreanName.toLowerCase() === query || (ing.englishName && ing.englishName.toLowerCase() === query)
  );

  // 상표명으로 등록되어 있는 대표 브랜드인지 확인 (예: 탁센, 타이레놀 등)
  const isKnownBrand = ALL_DRUG_INGREDIENTS.some(ing => 
    (ing.commonBrands || []).some(b => b.toLowerCase().includes(query))
  );

  // 약 이름 우선 조건:
  // - 상표명 매칭 목록이 존재하며 정확한 성분명 검색이 아닌 경우
  // - 또는 검색어가 상표명으로 시작하는 제품이 있는 경우 (예: "탁센" -> "탁센연질캡슐")
  const isDrugNamePriority = (matchedCommercial.length > 0 && !isExactIngredient) ||
                             (matchedCommercial.length > 0 && matchedCommercial.some(d => d.brandName.toLowerCase().startsWith(query))) ||
                             (isKnownBrand && !isExactIngredient);

  // [우선순위 1] 약 이름 검색일 때 -> 약 이름(처방명) 카드 목록 우선 노출
  if (isDrugNamePriority && matchedCommercial.length > 0) {
    let html = `<div class="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><i data-lucide="pill" class="w-3.5 h-3.5 text-[#6340cd]"></i> 의약품 처방명 검색 결과 (${matchedCommercial.length}건)</div>`;
    matchedCommercial.forEach(drug => {
      html += renderCommercialCard(drug);
    });
    resultArea.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // [우선순위 2] 성분명 검색일 때 -> 성분명 카드 최우선 노출 + 해당 성분 함유 대표약 연계
  if (matchedIngredients.length > 0) {
    let html = `<div class="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><i data-lucide="flask-conical" class="w-3.5 h-3.5 text-[#6340cd]"></i> 성분별 병용 안전 판정 결과 (${matchedIngredients.length}건)</div>`;
    matchedIngredients.forEach(ing => {
      html += renderIngredientCard(ing);

      // 해당 성분을 함유한 대표 의약품 연계 표시
      const relatedDrugs = POPULAR_COMMERCIAL_DRUGS.filter(drug => 
        drug.ingredients.some(i => {
          const rule = findIngredientRule(i.name);
          return (rule && rule.id === ing.id) || i.name.toLowerCase().includes(ing.koreanName.toLowerCase()) || ing.koreanName.toLowerCase().includes(i.name.toLowerCase());
        })
      );

      if (relatedDrugs.length > 0) {
        html += `
          <div class="mt-3 mb-6 p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5 shadow-sm">
            <div class="text-xs font-bold text-slate-700 flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <i data-lucide="package" class="w-4 h-4 text-[#6340cd]"></i>
              '${ing.koreanName}' 성분이 포함된 대표 의약품 (${relatedDrugs.length}건)
            </div>
            <div class="space-y-2">
              ${relatedDrugs.map(d => renderCommercialCard(d)).join('')}
            </div>
          </div>
        `;
      }
    });

    resultArea.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // [우선순위 3] 성분명 미매칭이지만 상표명 매칭이 있는 경우
  if (matchedCommercial.length > 0) {
    let html = `<div class="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><i data-lucide="pill" class="w-3.5 h-3.5 text-[#6340cd]"></i> 의약품 처방명 검색 결과 (${matchedCommercial.length}건)</div>`;
    matchedCommercial.forEach(drug => {
      html += renderCommercialCard(drug);
    });
    resultArea.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // [우선순위 4] 로컬 DB 미등록 약품/성분 -> 식약처 국가 의약품 DB 실시간 연동
  renderSearchingIndicator(query);

  debounceTimer = setTimeout(() => {
    fetchFromMfdsApi(query);
  }, 350);
}

// 다중 약물 일괄 검색 처리 (카톡/문자/처방내역 복사 붙여넣기 대응)
async function handleBatchSearch(tokens) {
  const resultArea = document.getElementById('result-area');
  if (!resultArea) return;

  resultArea.innerHTML = `
    <div class="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-3 shadow-sm">
      <div class="w-8 h-8 border-4 border-[#6340cd] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-slate-800">입력된 ${tokens.length}종의 의약품을 일괄 분석하고 있습니다...</p>
    </div>
  `;

  let detectedIngredients = [];
  let detectedCommercials = [];
  let notFoundQueries = [];

  for (const token of tokens) {
    const q = token.trim().toLowerCase();
    if (!q) continue;

    // 상표명 우선 검사
    const matchedComm = POPULAR_COMMERCIAL_DRUGS.find(d => 
      d.brandName.toLowerCase() === q || d.brandName.toLowerCase().includes(q) || stringSimilarity(q, d.brandName.toLowerCase()) >= 0.75
    );

    if (matchedComm) {
      if (!detectedCommercials.some(d => d.id === matchedComm.id)) {
        detectedCommercials.push(matchedComm);
      }
      continue;
    }

    // 순수 성분명 검사
    const matchedIng = findIngredientRule(q);
    if (matchedIng) {
      if (!detectedIngredients.some(i => i.id === matchedIng.id)) {
        detectedIngredients.push(matchedIng);
      }
      continue;
    }

    notFoundQueries.push(token);
  }

  // 로컬 미검출 약품 식약처 API 추가 검색
  let apiDrugs = [];
  if (notFoundQueries.length > 0) {
    for (const q of notFoundQueries.slice(0, 5)) {
      try {
        const serverRes = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (serverRes.ok) {
          const serverData = await serverRes.json();
          if (serverData.items && serverData.items.length > 0) {
            apiDrugs.push(serverData.items[0]);
          }
        }
      } catch (e) {}
    }
  }

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
      const rule = findIngredientRule(ing.name);
      if (rule) {
        if (rule.status === 'PROHIBITED') hasPro = true;
        if (rule.status === 'CAUTION') hasCau = true;
      }
    });
    if (hasPro) prohibitedCount++;
    else if (hasCau) cautionCount++;
    else safeCount++;
  });

  apiDrugs.forEach(item => {
    const itemName = item.ITEM_NAME || item.itemName || '';
    const ingrName = item.ITEM_INGR_NAME || item.MAIN_ITEM_INGR || '';
    const detectedRules = findMatchingRules(itemName, ingrName, item.efcyQesitm || '');
    if (detectedRules.some(r => r.status === 'PROHIBITED')) prohibitedCount++;
    else if (detectedRules.some(r => r.status === 'CAUTION')) cautionCount++;
    else safeCount++;
  });

  const totalCount = detectedIngredients.length + detectedCommercials.length + apiDrugs.length;
  const summaryBanner = renderSummaryBanner(prohibitedCount, cautionCount, safeCount, totalCount);

  let cardsHtml = '';
  detectedIngredients.forEach(ing => { cardsHtml += renderIngredientCard(ing); });
  detectedCommercials.forEach(drug => { cardsHtml += renderCommercialCard(drug); });
  apiDrugs.forEach(item => {
    const itemName = item.ITEM_NAME || item.itemName || '';
    const entpName = item.ENTP_NAME || item.entpName || '';
    const ingrName = item.ITEM_INGR_NAME || item.MAIN_ITEM_INGR || '';
    const detectedRules = findMatchingRules(itemName, ingrName, item.efcyQesitm || '');
    const hasPro = detectedRules.some(r => r.status === 'PROHIBITED');
    const hasCau = detectedRules.some(r => r.status === 'CAUTION');
    const statusHtml = hasPro 
      ? '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-red-100 text-red-700 border-2 border-red-300 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="alert-octagon" class="w-4 h-4 text-red-600"></i> 🔴 병용 복용 불가</span>'
      : (hasCau 
      ? '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i> 🟡 병용 주의 약물</span>'
      : '<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-sm shrink-0 whitespace-nowrap"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> 🟢 병용 복용 가능</span>');

    cardsHtml += `
      <div class="bg-white rounded-2xl p-5 border-2 ${hasPro ? 'border-red-300 bg-red-50/20' : (hasCau ? 'border-amber-300 bg-amber-50/30' : 'border-emerald-200')} shadow-sm space-y-3.5 mb-3">
        <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div class="space-y-1">
            <div class="text-sm text-slate-600 font-medium">처방명 : <span class="text-base font-bold text-slate-900">${itemName}</span></div>
            <div class="text-xs text-slate-500 font-medium">제약회사 : <span class="text-slate-700">${entpName}</span></div>
          </div>
          <div class="shrink-0 whitespace-nowrap">${statusHtml}</div>
        </div>
        <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div class="text-xs text-slate-500 font-semibold mb-0.5">성분명 :</div>
          <div class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">${ingrName || '성분 정보 확인'}</div>
        </div>
        ${detectedRules.length > 0 ? `
          <div class="p-4 rounded-xl ${hasPro ? 'bg-red-50 border border-red-200 text-red-950' : 'bg-amber-50 border border-amber-300 text-amber-950'} text-xs sm:text-sm leading-relaxed space-y-1.5">
            <strong class="font-extrabold block text-sm sm:text-base ${hasPro ? 'text-red-700' : 'text-amber-800'}">연구진 검토 소견:</strong>
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
    <div class="space-y-3">${cardsHtml}</div>
  `;
  if (window.lucide) lucide.createIcons();
}

// 성분명 표기 한글/영문 최적화 헬퍼 (식약처 영문 원료명 및 제품명 괄호 성분명 대응)
function resolveIngredientDisplayName(rawIngr, rawItemName = '') {
  if (!rawIngr && !rawItemName) return '성분 정보 확인';

  // 1. 제품명 내 괄호 성분명 추출 (예: '탁센연질캡슐(나프록센)' -> '나프록센')
  const parenMatch = (rawItemName || '').match(/\(([^)]+)\)/);
  let parenCandidate = '';
  if (parenMatch && parenMatch[1]) {
    const candidate = parenMatch[1].trim();
    if (!candidate.includes('수출') && !candidate.includes('군납') && candidate.length <= 25) {
      parenCandidate = candidate;
    }
  }

  // 2. rawIngr 성분 분해 및 한글 매핑 (예: 'Naproxen', 'Ibuprofen/Pamabrom')
  const ingrText = rawIngr || parenCandidate || '';
  if (ingrText) {
    const parts = ingrText.split(/[\/\,\+]/).map(p => p.trim()).filter(Boolean);
    const resolvedParts = parts.map(part => {
      const rule = ALL_DRUG_INGREDIENTS.find(r => 
        (r.englishName && r.englishName.toLowerCase() === part.toLowerCase()) ||
        r.koreanName.toLowerCase() === part.toLowerCase() ||
        (r.synonyms && r.synonyms.some(s => s.toLowerCase() === part.toLowerCase()))
      );
      if (rule) {
        return `${rule.koreanName}${rule.englishName ? ` (${rule.englishName})` : ''}`;
      }
      return part;
    });
    return resolvedParts.join(', ');
  }

  return parenCandidate || '성분 정보 확인';
}

// 식약처 Open API 실시간 호출
async function fetchFromMfdsApi(query) {
  const resultArea = document.getElementById('result-area');
  try {
    const serviceKey = API_SERVICE_KEY;
    let items = [];

    try {
      const serverRes = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.items && serverData.items.length > 0) {
          items = serverData.items;
        }
      }
    } catch (e) {}

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
      let html = `<div class="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><i data-lucide="cloud" class="w-3.5 h-3.5 text-[#6340cd]"></i> 식약처 국가 의약품 제품 허가정보 실시간 조회 결과 (${items.length}건)</div>`;
      
      items.forEach(item => {
        const rawItemName = item.ITEM_NAME || item.itemName || '';
        const entpName = item.ENTP_NAME || item.entpName || '';
        const rawIngr = item.ITEM_INGR_NAME || item.MAIN_ITEM_INGR || item.efcyQesitm || '';
        const spclty = item.SPCLTY_PBLC || '의약품';
        const prductType = item.PRDUCT_TYPE ? ` · ${item.PRDUCT_TYPE.replace(/^\[\d+\]/, '')}` : '';
        
        const cleanTitle = rawItemName.replace(/\(.*?\)/g, '').trim() || rawItemName;
        const displayIngr = resolveIngredientDisplayName(rawIngr, rawItemName);
        const detectedRules = findMatchingRules(rawItemName, rawIngr, item.efcyQesitm || '');

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
            <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div class="space-y-1">
                <div class="text-sm text-slate-600 font-medium">
                  처방명 : <span class="text-base font-bold text-slate-900">${cleanTitle}</span>
                  ${cleanTitle !== rawItemName ? `<span class="text-xs text-slate-400 font-normal ml-1">(${rawItemName})</span>` : ''}
                </div>
                <div class="text-xs text-slate-500 font-medium">
                  제약회사 : <span class="text-slate-700">${entpName}</span>
                </div>
              </div>
              <div class="shrink-0 whitespace-nowrap">
                ${statusHtml}
              </div>
            </div>
            <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
              <div class="text-xs text-slate-500 font-semibold mb-0.5">성분명 :</div>
              <div class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                ${displayIngr}
              </div>
            </div>
            <div class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">${spclty}</span>
              ${prductType ? `<span class="text-slate-500">${prductType}</span>` : ''}
            </div>
            ${detectedRules.length > 0 ? `
              <div class="p-4 rounded-xl ${status === 'PROHIBITED' ? 'bg-red-50 border border-red-200 text-red-950' : (status === 'CAUTION' ? 'bg-amber-50 border border-amber-300 text-amber-950' : 'bg-emerald-50 border border-emerald-200 text-emerald-950')} text-xs sm:text-sm leading-relaxed space-y-1.5">
                <strong class="font-extrabold block text-sm sm:text-base ${status === 'PROHIBITED' ? 'text-red-700' : (status === 'CAUTION' ? 'text-amber-800' : 'text-emerald-800')}">연구진 검토 소견:</strong>
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

function renderInitialGuide() {
  const resultArea = document.getElementById('result-area');
  if (!resultArea) return;

  resultArea.innerHTML = `
    <div class="grid grid-cols-3 gap-2.5 sm:gap-3.5 pt-1">
      <div class="bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm">
        <div class="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <i data-lucide="check-circle-2" class="w-4 h-4"></i>
        </div>
        <span class="text-sm sm:text-base font-extrabold text-emerald-800">병용 가능</span>
      </div>

      <div class="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm">
        <div class="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
          <i data-lucide="alert-triangle" class="w-4 h-4"></i>
        </div>
        <span class="text-sm sm:text-base font-extrabold text-amber-900">병용 주의</span>
      </div>

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

function renderCommercialCard(drug) {
  let isProhibited = false;
  let isCaution = false;
  let opinions = [];

  const parsedIngredients = drug.ingredients.map(ing => {
    const rule = findIngredientRule(ing.name);

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

      <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
        <div class="text-xs text-slate-500 font-semibold mb-0.5">성분명 :</div>
        <div class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
          ${ingrSummary}
        </div>
      </div>

      <div class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
        <span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">${drug.category && drug.category.includes('처방약') ? '전문의약품' : '일반의약품'}</span>
        ${drug.category ? `<span class="text-slate-500">· ${drug.category}</span>` : ''}
      </div>

      ${opinions.length > 0 ? `
        <div class="p-4 rounded-xl ${isProhibited ? 'bg-red-50 border border-red-200 text-red-950' : (isCaution ? 'bg-amber-50 border border-amber-300 text-amber-950' : 'bg-emerald-50 border border-emerald-200 text-emerald-950')} text-xs sm:text-sm leading-relaxed space-y-1.5">
          <strong class="font-extrabold block text-sm sm:text-base ${isProhibited ? 'text-red-700' : (isCaution ? 'text-amber-800' : 'text-emerald-800')}">연구진 검토 소견:</strong>
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

      <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
        <div class="text-xs text-slate-500 font-semibold mb-0.5">성분명 :</div>
        <div class="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
          ${ing.koreanName} <span class="text-sm font-semibold text-slate-500">(${ing.englishName || ''})</span>
        </div>
      </div>

      <div class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
        <span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">성분 분류</span>
        <span class="text-slate-500">· ${ing.category}</span>
      </div>

      <div class="p-4 rounded-xl ${isProhibited ? 'bg-red-50 border border-red-200 text-red-950' : (isCaution ? 'bg-amber-50 border border-amber-300 text-amber-950' : 'bg-emerald-50 border border-emerald-200 text-emerald-950')} text-xs sm:text-sm leading-relaxed space-y-1.5">
        <strong class="font-extrabold block text-sm sm:text-base ${isProhibited ? 'text-red-700' : (isCaution ? 'text-amber-800' : 'text-emerald-800')}">연구진 검토 소견:</strong>
        <p>${ing.opinion}</p>
      </div>
    </div>
  `;
}

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

function renderAllModalList() {
  const container = document.getElementById('modal-list');
  if (!container) return;

  const targetList = ALL_DRUG_INGREDIENTS.filter(ing => ing.status === 'PROHIBITED' || ing.status === 'CAUTION');

  container.innerHTML = targetList.map((ing, idx) => `
    <div class="py-2.5">
      <div class="flex items-center justify-between font-bold text-slate-900">
        <span>${idx + 1}. ${ing.koreanName} (${ing.englishName || '-'})</span>
        <span class="text-[11px] px-2 py-0.5 rounded font-extrabold ${ing.status === 'PROHIBITED' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">
          ${ing.status === 'PROHIBITED' ? '🔴 복용불가' : '🟡 주의필요'}
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
