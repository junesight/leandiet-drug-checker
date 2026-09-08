const keyEncoded = 'TQlkY3w0pbDwrIkmNiO6dCr7YqfC2RdGfi8O%2FJDIqGuIfAHJJHup87%2FZ2xSKzpEXZNb0gjvqi%2F0BR%2BUwEO86BA%3D%3D';
const keyDecoded = decodeURIComponent(keyEncoded);

const endpoints = [
  'https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList',
  'https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService06/getDrugPrdtPrmsnDtlInq06',
  'https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService05/getDrugPrdtPrmsnInq05',
  'https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService04/getDrugPrdtPrmsnInq04',
  'https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService03/getDrugPrdtPrmsnInq03',
  'https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService02/getDrugPrdtPrmsnInq02',
  'https://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService01/getMdcinGrnIdntfcInfoList01',
  'https://apis.data.go.kr/1471000/DURPrdlstInfoService03/getDurPrdlstInfoList03'
];

async function run() {
  for (const ep of endpoints) {
    const epName = ep.split('/').slice(-2).join('/');
    for (const [kType, k] of [['raw', keyEncoded], ['enc(dec)', encodeURIComponent(keyDecoded)]]) {
      const url = `${ep}?serviceKey=${k}&itemName=${encodeURIComponent('타이레놀')}&type=json`;
      try {
        const res = await fetch(url);
        const text = await res.text();
        if (text.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
          console.log(`[403 NOT_REG] ${epName} (${kType})`);
        } else if (text.includes('NO_OPENAPI_SERVICE_ERROR')) {
          console.log(`[400 NO_SERVICE] ${epName} (${kType})`);
        } else {
          console.log(`[SUCCESS] ${epName} (${kType}) -> ${text.slice(0, 150)}`);
        }
      } catch (e) {
        console.log(`[ERR] ${epName}: ${e.message}`);
      }
    }
  }
}

run();
