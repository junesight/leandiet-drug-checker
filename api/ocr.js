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
첨부된 처방전/약봉투 이미지에 기재된 [처방 의약품 / 조제약 목록]을 첫 번째 줄부터 마지막 줄까지 단 하나의 약품도 누락하지 말고 전수(100%) 추출하세요.

[추출 규칙]
1. 처방전에 4개 약물이 적혀 있으면 반드시 4개 모두, 5개면 5개 모두 추출해야 합니다.
2. 약품명에 기재된 정식 처방명을 추출하세요 (예: 레일라디에스정, 뮤코라민정, 프레나정, 아트놀셋세미정, 코대원정, 펜잘8시간이알서방정, 뮤코메드캡슐, 위더스세픽심캡슐).
3. 환자 이름, 병원명, 의원명, 질병코드, 조제일자 등은 절대 약품명으로 추출하지 마세요.
4. (수출명:...) 같은 수출용 명칭이나 _(1정) 같은 포장단위 표기는 제거하고 국내 정식 처방명을 우선하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "drugs": [
    {
      "name": "정식 의약품명",
      "ingredient": "주요 성분명 (처방전에 적혀 있거나 명확한 경우)",
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

    return res.status(200).json({
      success: true,
      aiVision: true,
      drugs: parsedJson.drugs || [],
      rawSummary: parsedJson.rawSummary || resultText
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(200).json({ success: false, fallback: true, error: err.message });
  }
}
