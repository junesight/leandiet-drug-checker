// Vercel Serverless Function: 식약처 공공데이터 CORS 우회 및 실시간 조회 프록시
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: '검색어를 입력해주세요.' });
  }

  const serviceKey = "TQlkY3w0pbDwrIkmNiO6dCr7YqfC2RdGfi8O%2FJDIqGuIfAHJJHup87%2FZ2xSKzpEXZNb0gjvqi%2F0BR%2BUwEO86BA%3D%3D";

  // 식약처 의약품 제품 허가정보 및 e약은요 엔드포인트
  const endpoints = [
    `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService05/getDrugPrdtPrmsnDtlInq05?serviceKey=${serviceKey}&item_name=${encodeURIComponent(q)}&type=json`,
    `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService05/getDrugPrdtPrmsnInq05?serviceKey=${serviceKey}&item_name=${encodeURIComponent(q)}&type=json`,
    `https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList?serviceKey=${serviceKey}&itemName=${encodeURIComponent(q)}&type=json`
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const items = data?.body?.items || [];
        if (items.length > 0) {
          return res.status(200).json({ success: true, items });
        }
      }
    } catch (e) {
      console.error('API Error:', e.message);
    }
  }

  return res.status(200).json({ success: true, items: [] });
}
