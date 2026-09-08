// Vercel Serverless Function: 식약처 의약품 제품 허가정보 실시간 연동 프록시
export default async function handler(req, res) {
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

  // 식약처 의약품 제품 허가정보 최신 엔드포인트 (DrugPrdtPrmsnInfoService07)
  const url = `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService07/getDrugPrdtPrmsnInq07?serviceKey=${serviceKey}&item_name=${encodeURIComponent(q)}&type=json&numOfRows=30`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const items = data?.body?.items || [];
      return res.status(200).json({ success: true, items });
    }
  } catch (e) {
    console.error('API Error:', e.message);
  }

  return res.status(200).json({ success: true, items: [] });
}
