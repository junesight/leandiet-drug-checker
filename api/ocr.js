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

    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!effectiveApiKey) {
      return res.status(200).json({ 
        success: false, 
        fallback: true,
        message: '서버에 GEMINI_API_KEY가 설정되어 있지 않아 브라우저 전처리 고성능 OCR로 분석합니다.' 
      });
    }

    // Google Gemini 1.5 Flash / 2.0 Flash Vision API 호출
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveApiKey}`;

    const prompt = `
당신은 한국 병원 처방전 및 약봉투 전문 판독 AI입니다.
첨부된 이미지에서 처방/조제된 모든 약물 정보를 정확하게 추출하세요.

다음 JSON 형식으로만 응답하세요:
{
  "drugs": [
    {
      "name": "약품명 (예: 렉시핀정400mg, 아세브론캡슐, 타이레놀정500mg)",
      "ingredient": "주요 성분명 (알 수 있는 경우, 예: 독소필린, 아세브로필린, 아세트아미노펜)",
      "dosage": "용량/용법 (예: 1회 1정 1일 2회)"
    }
  ],
  "rawSummary": "추출된 전체 텍스트 요약"
}

규칙:
1. 약품명에서 오타나 불필요한 기호를 제거하고 정식 의약품명으로 정제하세요.
2. 약봉투나 처방전에 적힌 조제약 목록을 하나도 빠짐없이 모두 포함하세요.
3. 반드시 유효한 JSON 형식으로만 답변하세요 (마크다운 백틱 제외 또는 json 코드블록 허용).
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
        temperature: 0.1,
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
      // 마크다운 코드블록 정제
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
