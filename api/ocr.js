// Vercel Serverless Function: 초정밀 처방전 AI Vision 인식 (Gemini Vision API)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 지원합니다.' });
  }

  try {
    const { imageBase64, mimeType, apiKey } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ error: '이미지 데이터(base64)가 필요합니다.' });
    }

    // 기본 내장 AI 키 (Base64 디코딩)
    const defaultKey = Buffer.from('QVEuQWI4Uk42TDB1aEVnV2tSS1VPOVdoeTFzbVRlZUE2VVZ4Nm1VQkgtRjdtMzEtSWZDTEE=', 'base64').toString('utf-8');
    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || defaultKey;

    // Google Gemini 3.6 Flash Vision API 호출 (최신 초정밀 모델)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${effectiveApiKey}`;

    const prompt = `
당신은 대한민국 병원 처방전 및 약봉투 전문 판독 의료 AI입니다.
첨부된 처방전/약봉투 이미지에 기재된 [처방 의약품 / 조제약 목록]을 분석하세요.

[분석 및 추출 규칙]
1. 처방전의 조제약 표에서 처방된 '전체 약품의 개수(행 수)'를 정확히 파악하여 totalPrescribedCount 에 기록하세요.
2. 약품명이 명확히 판독 가능한 의약품은 정식 의약품명(처방명)으로 drugs 배열에 추출하세요 (예: 레일라디에스정, 뮤코라민정, 프레나정, 아트놀셋세미정, 코대원정, 펜잘8시간이알서방정, 뮤코메드캡슐, 위더스세픽심캡슐).
3. 만약 흐림, 잘림, 빛반사 등으로 인해 판독이 어려운 약품 행이 있다면, 억지로 가짜 약 이름을 만들지 말고 unrecognizedCount(미판독 약물 수)에 숫자를 기록하세요.
4. 환자 이름, 병원/의원명, 질병분류기호, 조제일자 등은 절대 의약품으로 추출하지 마세요.
5. (수출명:...) 또는 _(1정) 등의 포장 단위는 제거하고 국내 정식 처방명을 우선하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "totalPrescribedCount": 4,
  "unrecognizedCount": 0,
  "drugs": [
    {
      "name": "정식 의약품명",
      "ingredient": "주요 성분명 (알 수 있는 경우)",
      "dosage": "1회 투약량 및 1일 투여횟수 (예: 1회 1정 1일 2회)"
    }
  ],
  "rawSummary": "추출된 전체 조제약 요약"
}
`;

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType || 'image/jpeg',
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.0,
        response_mime_type: "application/json"
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return res.status(200).json({ success: false, fallback: true, error: errText });
    }

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    let parsedJson = {};
    try {
      const cleanedText = resultText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedJson = JSON.parse(cleanedText);
    } catch (e) {
      console.warn('JSON parsing error:', e.message);
    }

    const extractedDrugs = parsedJson.drugs || [];
    const totalCount = parsedJson.totalPrescribedCount || extractedDrugs.length;
    const unrecCount = typeof parsedJson.unrecognizedCount === 'number' 
      ? parsedJson.unrecognizedCount 
      : Math.max(0, totalCount - extractedDrugs.length);

    return res.status(200).json({
      success: true,
      aiVision: true,
      totalPrescribedCount: totalCount,
      unrecognizedCount: unrecCount,
      drugs: extractedDrugs,
      rawSummary: parsedJson.rawSummary || resultText
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(200).json({ success: false, fallback: true, error: err.message });
  }
}
