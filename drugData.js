/**
 * 린다이어트 의약품 종합 마스터 DB (전수 확장판)
 * - [병용 불가] 67종 및 [병용 주의] 187종 성분 & 연구진 검토 소견 100% 수록
 * - 국내 다빈도 처방/일반의약품(150+ 브랜드) 및 식약처 실시간 연동 지원
 */

const API_SERVICE_KEY = "TQlkY3w0pbDwrIkmNiO6dCr7YqfC2RdGfi8O%2FJDIqGuIfAHJJHup87%2FZ2xSKzpEXZNb0gjvqi%2F0BR%2BUwEO86BA%3D%3D";

// 1. 금기(PROHIBITED) 67종 및 주의(CAUTION) 187종 전체 성분 마스터 DB
const ALL_DRUG_INGREDIENTS = [
  // ==========================================
  // === [1] 병용 불가 (PROHIBITED) 67종 전수 ===
  // ==========================================
  {
    id: "acebrophylline",
    koreanName: "아세브로필린",
    englishName: "Acebrophylline",
    synonyms: ["아세브로필린"],
    category: "호흡기/기관지확장제",
    status: "PROHIBITED",
    opinion: "PDE 억제 + 아데노신 길항 → 에페드린과 심장 자극 상가, 부정맥·경련 위험",
    commonBrands: ["아세브론", "에어브론", "서브론", "브론코"]
  },
  {
    id: "aminophylline",
    koreanName: "아미노필린",
    englishName: "Aminophylline",
    synonyms: ["아미노필린정", "아미노필린주사"],
    category: "호흡기/천식치료제",
    status: "PROHIBITED",
    opinion: "PDE 억제 + 아데노신 길항 → 에페드린과 심장 자극 상가, 부정맥·경련 위험",
    commonBrands: ["아미노필린"]
  },
  {
    id: "amitriptyline_hcl",
    koreanName: "아미트리프틸린염산염",
    englishName: "Amitriptyline Hydrochloride",
    synonyms: ["아미트리프틸린", "아미트립틸린"],
    category: "삼환계 항우울제(TCA)",
    status: "PROHIBITED",
    opinion: "노르에피네프린 재흡수 차단 + 에페드린 → 카테콜아민 축적, 고혈압 위기, 부정맥 위험",
    commonBrands: ["에나폰", "에나폰정"]
  },
  {
    id: "amoxapine",
    koreanName: "아목사핀",
    englishName: "Amoxapine",
    synonyms: ["아목사핀"],
    category: "항우울제",
    status: "PROHIBITED",
    opinion: "노르에피네프린 재흡수 차단 + 에페드린 → 카테콜아민 축적, 고혈압 위기, 부정맥 위험",
    commonBrands: ["아목사핀"]
  },
  {
    id: "bambuterol_hcl",
    koreanName: "밤부테롤염산염",
    englishName: "Bambuterol Hydrochloride",
    synonyms: ["밤부테롤"],
    category: "기관지확장제/천식",
    status: "PROHIBITED",
    opinion: "교감신경계 상가 자극 → 심박수 증가, 저칼륨혈증, 부정맥 위험",
    commonBrands: ["밤벡", "밤벡정"]
  },
  {
    id: "bupropion_hcl",
    koreanName: "부프로피온염산염",
    englishName: "Bupropion Hydrochloride",
    synonyms: ["부프로피온"],
    category: "항우울제/금연보조/식욕억제",
    status: "PROHIBITED",
    opinion: "노르에피네프린·도파민 재흡수 억제 + 에페드린 → 경련 역치 저하, 고혈압 위기 위험",
    commonBrands: ["웰부트린", "콘트라브", "웰콘트", "니코피온"]
  },
  {
    id: "cabergoline",
    koreanName: "카베르고린",
    englishName: "Cabergoline",
    synonyms: ["카베르고린"],
    category: "도파민작용제/유즙분비억제",
    status: "PROHIBITED",
    opinion: "5-HT2B 수용체 작용 → 심장 판막 섬유화(valvulopathy) 위험 + 에페드린 심장 부하 추가 → 심혈관 위험 증폭 (카테콜아민 직접 증폭이 아닌 판막 손상 기전)",
    commonBrands: ["카버락틴", "도스티넥스"]
  },
  {
    id: "caffeine_anhydrous",
    koreanName: "카페인무수물",
    englishName: "Caffeine Anhydrous",
    synonyms: ["무수카페인", "카페인"],
    category: "중추신경흥분/복합진통제",
    status: "PROHIBITED",
    opinion: "PDE 억제 + 아데노신 길항 → 에페드린과 심장 자극 상가, 부정맥·경련 위험",
    commonBrands: ["게보린", "펜잘", "그날엔", "판콜", "판피린"]
  },
  {
    id: "carteolol_hcl",
    koreanName: "카르테올롤염산염",
    englishName: "Carteolol Hydrochloride",
    synonyms: ["카르테올롤"],
    category: "안과/녹내장치료제",
    status: "PROHIBITED",
    opinion: "비선택적 베타차단 + 에페드린 → 비길항 알파 자극(unopposed alpha stimulation)으로 심한 고혈압 위험",
    commonBrands: ["미케란", "미케란점안액"]
  },
  {
    id: "clomipramine_hcl",
    koreanName: "클로미프라민염산염",
    englishName: "Clomipramine Hydrochloride",
    synonyms: ["클로미프라민"],
    category: "삼환계 항우울제/강박장애",
    status: "PROHIBITED",
    opinion: "노르에피네프린 재흡수 차단 + 에페드린 → 카테콜아민 축적, 고혈압 위기, 부정맥 위험",
    commonBrands: ["그로파민"]
  },
  {
    id: "clonidine",
    koreanName: "클로니딘",
    englishName: "Clonidine",
    synonyms: ["클로니딘"],
    category: "혈압약/ADHD",
    status: "PROHIBITED",
    opinion: "클로니딘은 반동성 고혈압 위험이 높은 약물로 에페드린 병용 시 위험 증폭",
    commonBrands: ["캡베이", "카타프레스"]
  },
  {
    id: "clonidine_hcl",
    koreanName: "클로니딘염산염",
    englishName: "Clonidine Hydrochloride",
    synonyms: ["클로니딘염산염"],
    category: "혈압약/ADHD",
    status: "PROHIBITED",
    opinion: "클로니딘은 반동성 고혈압 위험이 높은 약물로 에페드린 병용 시 위험 증폭",
    commonBrands: ["캡베이", "카타프레스"]
  },
  {
    id: "cyclosporine",
    koreanName: "사이클로스포린",
    englishName: "Cyclosporine",
    synonyms: ["사이클로스포린", "시클로스포린"],
    category: "면역억제제",
    status: "PROHIBITED",
    opinion: "신독성·고혈압 유발약 + 에페드린의 혈관수축·혈압상승 → 신독성·고혈압 악화",
    commonBrands: ["산디문", "사이폴엔", "임프란트"]
  },
  {
    id: "dasatinib",
    koreanName: "다사티닙",
    englishName: "Dasatinib",
    synonyms: ["다사티닙수화물"],
    category: "항암제/표적치료제",
    status: "PROHIBITED",
    opinion: "QT 간격 연장 유발 + 에페드린 심장 자극 → 중증 부정맥 위험, 악성 종양 치료 중인 환자에게 다이어트 처방 부적절",
    commonBrands: ["스프라이셀"]
  },
  {
    id: "desvenlafaxine",
    koreanName: "데스벤라팍신",
    englishName: "Desvenlafaxine",
    synonyms: ["데스벤라팍신"],
    category: "SNRI 항우울제",
    status: "PROHIBITED",
    opinion: "세로토닌·노르에피네프린 재흡수 이중 차단 + 에페드린 → 세로토닌 증후군 + 고혈압 이중 위험",
    commonBrands: ["프리스틱"]
  },
  {
    id: "desvenlafaxine_benzoate",
    koreanName: "데스벤라팍신벤조산염",
    englishName: "Desvenlafaxine Benzoate",
    synonyms: ["데스벤라팍신벤조산염"],
    category: "SNRI 항우울제",
    status: "PROHIBITED",
    opinion: "세로토닌·노르에피네프린 재흡수 이중 차단 + 에페드린 → 세로토닌 증후군 + 고혈압 이중 위험",
    commonBrands: ["프리스틱"]
  },
  {
    id: "desvenlafaxine_succinate",
    koreanName: "데스벤라팍신숙신산염",
    englishName: "Desvenlafaxine Succinate",
    synonyms: ["데스벤라팍신숙신산염수화물"],
    category: "SNRI 항우울제",
    status: "PROHIBITED",
    opinion: "세로토닌·노르에피네프린 재흡수 이중 차단 + 에페드린 → 세로토닌 증후군 + 고혈압 이중 위험",
    commonBrands: ["프리스틱", "데스벤"]
  },
  {
    id: "diethylaminoethyltheophylline_hcl",
    koreanName: "디에틸아미노에틸테오필린염산염",
    englishName: "Diethylaminoethyltheophylline Hydrochloride",
    synonyms: ["디에틸아미노에틸테오필린"],
    category: "기관지확장제",
    status: "PROHIBITED",
    opinion: "PDE 억제 + 아데노신 길항 → 에페드린과 심장 자극 상가, 부정맥·경련 위험"
  },
  {
    id: "dl_methylephedrine_hcl",
    koreanName: "DL-메틸에페드린염산염",
    englishName: "DL-Methylephedrine Hydrochloride",
    synonyms: ["DL-메틸에페드린", "메틸에페드린", "디엘메틸에페드린", "메칠에페드린"],
    category: "감기약/진해거담제",
    status: "PROHIBITED",
    opinion: "동일 기전 약물 중복 → 과도한 교감신경 자극, 고혈압 위기, 부정맥, 뇌졸중 위험",
    commonBrands: ["코푸", "코대원", "판콜", "판피린", "화이투벤", "콜대원"]
  },
  {
    id: "dl_methylephedrine_maleate",
    koreanName: "DL-메틸에페드린말레산염",
    englishName: "DL-Methylephedrine Maleate",
    synonyms: ["메틸에페드린말레산염"],
    category: "감기약/진해거담제",
    status: "PROHIBITED",
    opinion: "동일 기전 약물 중복 → 과도한 교감신경 자극, 고혈압 위기, 부정맥, 뇌졸중 위험"
  },
  {
    id: "doxepin_hcl",
    koreanName: "독세핀염산염",
    englishName: "Doxepin Hydrochloride",
    synonyms: ["독세핀"],
    category: "삼환계 항우울제/수면제",
    status: "PROHIBITED",
    opinion: "노르에피네프린 재흡수 차단 + 에페드린 → 카테콜아민 축적, 고혈압 위기, 부정맥 위험",
    commonBrands: ["사일레노"]
  },
  {
    id: "doxofylline",
    koreanName: "독소필린",
    englishName: "Doxofylline",
    synonyms: ["독소필린"],
    category: "기관지확장제/천식",
    status: "PROHIBITED",
    opinion: "PDE 억제 + 아데노신 길항 → 에페드린과 심장 자극 상가, 부정맥·경련 위험",
    commonBrands: ["렉시핀", "액시마", "독소마", "앤도스", "슈로피", "독시마", "덱시필린", "독소필"]
  },
  {
    id: "duloxetine_hcl",
    koreanName: "둘록세틴염산염",
    englishName: "Duloxetine Hydrochloride",
    synonyms: ["둘록세틴"],
    category: "SNRI 항우울제/신경통",
    status: "PROHIBITED",
    opinion: "세로토닌·노르에피네프린 재흡수 이중 차단 + 에페드린 → 세로토닌 증후군 + 고혈압 이중 위험",
    commonBrands: ["심발타", "듀록셉", "드록틴"]
  },
  {
    id: "ephedrine_hcl",
    koreanName: "에페드린염산염",
    englishName: "Ephedrine Hydrochloride",
    synonyms: ["에페드린"],
    category: "교감신경흥분제",
    status: "PROHIBITED",
    opinion: "동일 성분 중복 투여 → 과량 투여 위험"
  },
  {
    id: "epinephrine",
    koreanName: "에피네프린",
    englishName: "Epinephrine",
    synonyms: ["아드레날린"],
    category: "응급혈관수축제",
    status: "PROHIBITED",
    opinion: "동일 기전 약물 중복 → 과도한 교감신경 자극, 고혈압 위기, 부정맥 위험",
    commonBrands: ["에피펜"]
  },
  {
    id: "epinephrine_bitartrate",
    koreanName: "에피네프린디타르타르산염",
    englishName: "Epinephrine Bitartrate",
    synonyms: ["에피네프린타르타르산염"],
    category: "응급혈관수축제",
    status: "PROHIBITED",
    opinion: "동일 기전 약물 중복 → 과도한 교감신경 자극, 고혈압 위기, 부정맥 위험"
  },
  {
    id: "ergotamine_tartrate",
    koreanName: "에르고타민타르타르산염",
    englishName: "Ergotamine Tartrate",
    synonyms: ["에르고타민"],
    category: "편두통치료제",
    status: "PROHIBITED",
    opinion: "강력한 혈관수축 작용 + 에페드린 → 심각한 말초·관상동맥 허혈 위험",
    commonBrands: ["크래밍", "카펠고트"]
  },
  {
    id: "escitalopram_oxalate",
    koreanName: "에스시탈로프람옥살산염",
    englishName: "Escitalopram Oxalate",
    synonyms: ["에스시탈로프람"],
    category: "SSRI 항우울제/공황장애",
    status: "PROHIBITED",
    opinion: "세로토닌 재흡수 차단 + 에페드린 → 세로토닌 증후군 위험",
    commonBrands: ["렉사프로", "에스시탐", "산도스에스시탈로프람"]
  },
  {
    id: "flecainide_acetate",
    koreanName: "플레카이니드아세트산염",
    englishName: "Flecainide Acetate",
    synonyms: ["플레카이니드"],
    category: "항부정맥제",
    status: "PROHIBITED",
    opinion: "에페드린의 부정맥 유발 작용이 항부정맥 치료 효과를 무력화 → 위험한 심실 부정맥 유발 가능",
    commonBrands: ["템보코"]
  },
  {
    id: "fluconazole",
    koreanName: "플루코나졸",
    englishName: "Fluconazole",
    synonyms: ["플루코나졸"],
    category: "항진균제/질염/무좀약",
    status: "PROHIBITED",
    opinion: "CYP 억제 → QT 간격 연장 + 에페드린 심장 자극 → 부정맥(TdP) 위험; 마황 간독성 + 항진균제 간독성 상가",
    commonBrands: ["디푸루칸", "후나졸", "플루칸"]
  },
  {
    id: "fluoxetine_hcl",
    koreanName: "플루옥세틴염산염",
    englishName: "Fluoxetine Hydrochloride",
    synonyms: ["플루옥세틴"],
    category: "SSRI 항우울제/폭식증",
    status: "PROHIBITED",
    opinion: "세로토닌 증후군 위험 + CYP2D6 강력 억제로 에페드린 대사 지연 가능",
    commonBrands: ["푸로작", "폭세틴", "프로작"]
  },
  {
    id: "fluvoxamine_maleate",
    koreanName: "플루복사민말레산염",
    englishName: "Fluvoxamine Maleate",
    synonyms: ["플루복사민"],
    category: "SSRI 항우울제/강박장애",
    status: "PROHIBITED",
    opinion: "세로토닌 재흡수 차단 + 에페드린 → 세로토닌 증후군 위험",
    commonBrands: ["루복스"]
  },
  {
    id: "formoterol_fumarate",
    koreanName: "포르모테롤푸마르산염수화물",
    englishName: "Formoterol Fumarate Hydrate",
    synonyms: ["포르모테롤", "포모테롤"],
    category: "기관지확장제/천식",
    status: "PROHIBITED",
    opinion: "교감신경계 상가 자극 → 심박수 증가, 저칼륨혈증, 부정맥 위험",
    commonBrands: ["아토크", "심비코트", "포라딜"]
  },
  {
    id: "frovatriptan_succinate",
    koreanName: "프로바트립탄숙신산염일수화물",
    englishName: "Frovatriptan Succinate Monohydrate",
    synonyms: ["프로바트립탄"],
    category: "편두통치료제",
    status: "PROHIBITED",
    opinion: "혈관수축 기전 + 에페드린 혈관수축 → 관상동맥 수축, 혈관 경련 위험",
    commonBrands: ["프로믹스"]
  },
  {
    id: "hydroxychloroquine",
    koreanName: "옥시클로로퀸",
    englishName: "Hydroxychloroquine",
    synonyms: ["히드록시클로로퀸", "옥시클로로퀸", "히드록시클로로퀸황산염"],
    category: "류마티스/면역조절제",
    status: "PROHIBITED",
    opinion: "QT 간격 연장 (명확히 확인됨, COVID-19 논란 당시 부각) + 에페드린 심장 자극 → TdP (Torsades de Pointes) 부정맥 위험; 장기 복용 시 심근병증(cardiomyopathy) 유발 가능 + 에페드린 심장 부하",
    commonBrands: ["할록신", "듀록"]
  },
  {
    id: "imipramine_hcl",
    koreanName: "이미프라민염산염",
    englishName: "Imipramine Hydrochloride",
    synonyms: ["이미프라민"],
    category: "삼환계 항우울제/야뇨증",
    status: "PROHIBITED",
    opinion: "노르에피네프린 재흡수 차단 + 에페드린 → 카테콜아민 축적, 고혈압 위기, 부정맥 위험",
    commonBrands: ["에프람", "이미프라민정"]
  },
  {
    id: "itraconazole",
    koreanName: "이트라코나졸",
    englishName: "Itraconazole",
    synonyms: ["이트라코나졸"],
    category: "항진균제/손발톱무좀",
    status: "PROHIBITED",
    opinion: "CYP 억제 → QT 간격 연장 + 에페드린 심장 자극 → 부정맥(TdP) 위험; 마황 간독성 + 항진균제 간독성 상가",
    commonBrands: ["스포라녹스", "이트라정", "스포나졸"]
  },
  {
    id: "levothyroxine_sodium",
    koreanName: "레보티록신나트륨수화물",
    englishName: "Levothyroxine Sodium Hydrate",
    synonyms: ["레보티록신", "신지로이드", "씬지로이드", "씬지록신"],
    category: "갑상선호르몬제",
    status: "PROHIBITED",
    opinion: "갑상선 호르몬이 카테콜아민 감수성 증가 → 에페드린과 빈맥, 부정맥, 고혈압 위험 증폭 (신지로이드 동일 성분)",
    commonBrands: ["씬지로이드", "씬지록신"]
  },
  {
    id: "micronized_formoterol",
    koreanName: "포르모테롤푸마르산염수화물(미분화)",
    englishName: "Micronized Formoterol Fumarate Hydrate",
    synonyms: ["미분화포르모테롤", "포르모테롤"],
    category: "기관지확장제/천식",
    status: "PROHIBITED",
    opinion: "교감신경계 상가 자극 → 심박수 증가, 저칼륨혈증, 부정맥 위험",
    commonBrands: ["아토크", "심비코트"]
  },
  {
    id: "milnacipran_hcl",
    koreanName: "밀나시프란염산염",
    englishName: "Milnacipran Hydrochloride",
    synonyms: ["밀나시프란"],
    category: "SNRI 항우울제/섬유근육통",
    status: "PROHIBITED",
    opinion: "세로토닌·노르에피네프린 재흡수 이중 차단 + 에페드린 → 세로토닌 증후군 + 고혈압 이중 위험",
    commonBrands: ["익셀"]
  },
  {
    id: "mirtazapine",
    koreanName: "미르타자핀",
    englishName: "Mirtazapine",
    synonyms: ["미르타자핀"],
    category: "항우울제/수면유도",
    status: "PROHIBITED",
    opinion: "알파2 차단으로 노르에피네프린 분비 촉진 → 에페드린과 상가 작용, 고혈압 위험",
    commonBrands: ["레메론", "미르탁스", "미르젠"]
  },
  {
    id: "moclobemide",
    koreanName: "모클로베미드",
    englishName: "Moclobemide",
    synonyms: ["모클로베미드"],
    category: "MAO-A 억제제/항우울제",
    status: "PROHIBITED",
    opinion: "MAO-A 억제 + 에페드린 → 고혈압 위기(hypertensive crisis). 교감신경 흥분제와 MAO 억제제의 가장 위험한 조합",
    commonBrands: ["오로릭스"]
  },
  {
    id: "naratriptan_hcl",
    koreanName: "나라트립탄염산염",
    englishName: "Naratriptan Hydrochloride",
    synonyms: ["나라트립탄"],
    category: "편두통치료제",
    status: "PROHIBITED",
    opinion: "혈관수축 기전 + 에페드린 혈관수축 → 관상동맥 수축, 혈관 경련 위험",
    commonBrands: ["나라믹"]
  },
  {
    id: "nortriptyline",
    koreanName: "노르트립틸린",
    englishName: "Nortriptyline",
    synonyms: ["노르트립틸린"],
    category: "삼환계 항우울제",
    status: "PROHIBITED",
    opinion: "노르에피네프린 재흡수 차단 + 에페드린 → 카테콜아민 축적, 고혈압 위기, 부정맥 위험",
    commonBrands: ["센시발"]
  },
  {
    id: "nortriptyline_hcl",
    koreanName: "노르트립틸린염산염",
    englishName: "Nortriptyline Hydrochloride",
    synonyms: ["노르트립틸린염산염"],
    category: "삼환계 항우울제",
    status: "PROHIBITED",
    opinion: "노르에피네프린 재흡수 차단 + 에페드린 → 카테콜아민 축적, 고혈압 위기, 부정맥 위험",
    commonBrands: ["센시발"]
  },
  {
    id: "paroxetine_hcl",
    koreanName: "파록세틴염산염수화물",
    englishName: "Paroxetine Hydrochloride Hydrate",
    synonyms: ["파록세틴", "파록세틴염산염"],
    category: "SSRI 항우울제/공황장애",
    status: "PROHIBITED",
    opinion: "세로토닌 재흡수 차단 + 에페드린 → 세로토닌 증후군 위험",
    commonBrands: ["팍실", "세로자트", "파록스"]
  },
  {
    id: "phenylephrine_hcl",
    koreanName: "페닐레프린염산염",
    englishName: "Phenylephrine Hydrochloride",
    synonyms: ["페닐레프린"],
    category: "비충혈제거제/혈관수축제",
    status: "PROHIBITED",
    opinion: "동일 기전 약물 중복 → 과도한 혈관수축, 고혈압 위험",
    commonBrands: ["테라플루", "콘택", "코메키나"]
  },
  {
    id: "pilsicainide_hcl",
    koreanName: "필시카이니드염산염수화물",
    englishName: "Pilsicainide Hydrochloride Hydrate",
    synonyms: ["필시카이니드"],
    category: "항부정맥제",
    status: "PROHIBITED",
    opinion: "에페드린의 부정맥 유발 작용이 항부정맥 치료 효과를 무력화 → 위험한 심실 부정맥 유발 가능",
    commonBrands: ["선리듬"]
  },
  {
    id: "posaconazole",
    koreanName: "포사코나졸",
    englishName: "Posaconazole",
    synonyms: ["포사코나졸"],
    category: "항진균제",
    status: "PROHIBITED",
    opinion: "CYP 억제 → QT 간격 연장 + 에페드린 심장 자극 → 부정맥(TdP) 위험; 마황 간독성 + 항진균제 간독성 상가",
    commonBrands: ["녹사필"]
  },
  {
    id: "procaterol_hcl",
    koreanName: "프로카테롤염산염수화물",
    englishName: "Procaterol Hydrochloride Hydrate",
    synonyms: ["프로카테롤"],
    category: "기관지확장제/진해거담",
    status: "PROHIBITED",
    opinion: "교감신경계 상가 자극 → 심박수 증가, 저칼륨혈증, 부정맥 위험",
    commonBrands: ["메프틴", "프론테롤"]
  },
  {
    id: "pseudoephedrine_hcl",
    koreanName: "슈도에페드린염산염",
    englishName: "Pseudoephedrine Hydrochloride",
    synonyms: ["슈도에페드린", "의사슈도에페드린"],
    category: "코막힘/비충혈제거제",
    status: "PROHIBITED",
    opinion: "동일 기전 약물 중복 → 과도한 교감신경 자극, 고혈압 위기, 부정맥 위험",
    commonBrands: ["슈다페드", "액티피드", "그린노즈"]
  },
  {
    id: "salbutamol_sulfate",
    koreanName: "살부타몰황산염",
    englishName: "Salbutamol Sulfate",
    synonyms: ["살부타몰", "알부테롤"],
    category: "기관지확장제/천식발작",
    status: "PROHIBITED",
    opinion: "교감신경계 상가 자극 → 심박수 증가, 저칼륨혈증, 부정맥 위험",
    commonBrands: ["벤토린", "부톨린"]
  },
  {
    id: "sertraline_hcl",
    koreanName: "설트랄린염산염",
    englishName: "Sertraline Hydrochloride",
    synonyms: ["설트랄린"],
    category: "SSRI 항우울제/불안장애",
    status: "PROHIBITED",
    opinion: "세로토닌 재흡수 차단 + 에페드린 → 세로토닌 증후군 위험",
    commonBrands: ["졸로푸트", "트라린", "산도스설트랄린"]
  },
  {
    id: "sumatriptan_succinate",
    koreanName: "수마트립탄숙신산염",
    englishName: "Sumatriptan Succinate",
    synonyms: ["수마트립탄"],
    category: "편두통치료제",
    status: "PROHIBITED",
    opinion: "혈관수축 기전 + 에페드린 혈관수축 → 관상동맥 수축, 혈관 경련 위험",
    commonBrands: ["이미그란", "수마트란"]
  },
  {
    id: "tacrolimus_hydrate",
    koreanName: "타크로리무스수화물",
    englishName: "Tacrolimus Hydrate",
    synonyms: ["타크로리무스"],
    category: "면역억제제",
    status: "PROHIBITED",
    opinion: "신독성·고혈압 유발약 + 에페드린의 혈관수축·혈압상승 → 신독성·고혈압 악화",
    commonBrands: ["프로토픽", "프로그랍", "타크로벨"]
  },
  {
    id: "tetrahydrozoline_hcl",
    koreanName: "테트라히드로졸린염산염",
    englishName: "Tetrahydrozoline Hydrochloride",
    synonyms: ["테트라히드로졸린"],
    category: "비충혈제거제/안약",
    status: "PROHIBITED",
    opinion: "동일 기전 약물 중복 → 과도한 교감신경 자극, 고혈압 위험",
    commonBrands: ["나프콘", "아이미루"]
  },
  {
    id: "theobromine",
    koreanName: "테오브로민",
    englishName: "Theobromine",
    synonyms: ["테오브로민"],
    category: "진해제/호흡기",
    status: "PROHIBITED",
    opinion: "PDE 억제 + 아데노신 길항 → 에페드린과 심장 자극 상가 위험",
    commonBrands: ["애니코프"]
  },
  {
    id: "theophylline",
    koreanName: "테오필린",
    englishName: "Theophylline",
    synonyms: ["테오필린"],
    category: "천식/기관지확장제",
    status: "PROHIBITED",
    opinion: "PDE 억제 + 아데노신 길항 → 에페드린과 심장 자극 상가, 부정맥·경련 위험",
    commonBrands: ["테오크로노", "유니필", "아시마"]
  },
  {
    id: "theophylline_complex",
    koreanName: "테오필린폴리메릭젤드콤플렉스",
    englishName: "Theophylline Polymeric Gelled Complex",
    synonyms: ["테오필린콤플렉스", "테오필린"],
    category: "천식/기관지확장제",
    status: "PROHIBITED",
    opinion: "PDE 억제 + 아데노신 길항 → 에페드린과 심장 자극 상가, 부정맥·경련 위험",
    commonBrands: ["테오크로노"]
  },
  {
    id: "tramadol_hcl",
    koreanName: "트라마돌염산염",
    englishName: "Tramadol Hydrochloride",
    synonyms: ["트라마돌"],
    category: "중증진통제/마약성유사",
    status: "PROHIBITED",
    opinion: "세로토닌 증후군 + 경련 역치 저하 위험",
    commonBrands: ["울트라셋", "아트놀셋", "트라락", "파라마셋", "트라마돌"]
  },
  {
    id: "trazodone_hcl",
    koreanName: "트라조돈염산염",
    englishName: "Trazodone Hydrochloride",
    synonyms: ["트라조돈"],
    category: "항우울제/수면유도",
    status: "PROHIBITED",
    opinion: "세로토닌 조절 작용 + 에페드린 → 세로토닌 증후군 위험",
    commonBrands: ["트리티코", "트라조돈정"]
  },
  {
    id: "tulobuterol",
    koreanName: "툴로부테롤",
    englishName: "Tulobuterol",
    synonyms: ["툴로부테롤패치", "투브론"],
    category: "기관지확장 패치제",
    status: "PROHIBITED",
    opinion: "교감신경계 상가 자극 → 심박수 증가, 저칼륨혈증, 부정맥 위험",
    commonBrands: ["호쿠날린", "노테몬", "투브론", "호쿠테롤"]
  },
  {
    id: "venlafaxine_hcl",
    koreanName: "벤라팍신염산염",
    englishName: "Venlafaxine Hydrochloride",
    synonyms: ["벤라팍신"],
    category: "SNRI 항우울제",
    status: "PROHIBITED",
    opinion: "세로토닌·노르에피네프린 재흡수 차단 + 에페드린 → 세로토닌 증후군 + 고혈압 이중 위험",
    commonBrands: ["이팩사", "코팩사", "벤라"]
  },
  {
    id: "vilanterol_trifenatate",
    koreanName: "미분화빌란테롤트리페나테이트",
    englishName: "Micronized Vilanterol Trifenatate",
    synonyms: ["빌란테롤", "빌란테롤트리페나테이트"],
    category: "천식/COPD 흡입제",
    status: "PROHIBITED",
    opinion: "교감신경계 상가 자극 → 심박수 증가, 저칼륨혈증, 부정맥 위험",
    commonBrands: ["렐바", "아노로"]
  },
  {
    id: "voriconazole",
    koreanName: "보리코나졸",
    englishName: "Voriconazole",
    synonyms: ["보리코나졸"],
    category: "항진균제",
    status: "PROHIBITED",
    opinion: "CYP 억제 → QT 간격 연장 + 에페드린 심장 자극 → 부정맥(TdP) 위험; 마황 간독성 + 항진균제 간독성 상가",
    commonBrands: ["브이펜드"]
  },
  {
    id: "vortioxetine_hydrobromide",
    koreanName: "보티옥세틴브롬화수소산염",
    englishName: "Vortioxetine Hydrobromide",
    synonyms: ["보티옥세틴"],
    category: "다중작용 항우울제",
    status: "PROHIBITED",
    opinion: "세로토닌 조절 + 에페드린 → 세로토닌 증후군 위험",
    commonBrands: ["브린텔릭스"]
  },
  {
    id: "synthroid",
    koreanName: "신지로이드",
    englishName: "Synthroid",
    synonyms: ["신지로이드", "씬지로이드", "씬지록신"],
    category: "갑상선호르몬제",
    status: "PROHIBITED",
    opinion: "갑상선 호르몬이 카테콜아민 감수성 증가 → 에페드린과 빈맥, 부정맥, 고혈압 위험 증폭 (신지로이드 동일 성분)",
    commonBrands: ["씬지로이드", "씬지록신"]
  },
  {
    id: "phentermine_hcl",
    koreanName: "펜터민염산염",
    englishName: "Phentermine Hydrochloride",
    synonyms: ["펜터민"],
    category: "양방 식욕억제제",
    status: "PROHIBITED",
    opinion: "교감신경 자극 및 노르에피네프린 분비 중복 → 극심한 두근거림, 불면, 급성 고혈압 위기 위험",
    commonBrands: ["디에타민", "아디펙스", "휴터민", "판베시", "큐시미아"]
  },
  {
    id: "phendimetrazine_tartrate",
    koreanName: "펜디메트라진타르타르산염",
    englishName: "Phendimetrazine Tartrate",
    synonyms: ["펜디메트라진"],
    category: "양방 식욕억제제",
    status: "PROHIBITED",
    opinion: "교감신경계 과다 흥분 중복 → 심계항진, 혈압 상승, 중추신경계 부작용 위험",
    commonBrands: ["푸링", "엔슬림", "아트라진"]
  },
  {
    id: "methylphenidate_hcl",
    koreanName: "메틸페니데이트염산염",
    englishName: "Methylphenidate Hydrochloride",
    synonyms: ["메틸페니데이트"],
    category: "ADHD치료제",
    status: "PROHIBITED",
    opinion: "도파민·노르에피네프린 재흡수 억제로 에페드린과 교감신경 및 심혈관계 자극 상승",
    commonBrands: ["콘서타", "페니드", "메디키넷"]
  },

  // ==========================================
  // === [2] 병용 주의 (CAUTION) 187종 전수 ===
  // ==========================================
  // --- 1차 캡처분 (아세클로페낙 ~ 에제티미브) ---
  {
    id: "aceclofenac",
    koreanName: "아세클로페낙",
    englishName: "Aceclofenac",
    synonyms: ["아세클로페낙", "아세클로", "에어탈"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["에어탈", "아세클로"]
  },
  {
    id: "acetaminophen",
    koreanName: "아세트아미노펜",
    englishName: "Acetaminophen",
    synonyms: ["파라세타몰", "타이레놀", "세토펜", "타세놀", "써스펜", "펜잘"],
    category: "해열진통제",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 마황의 CYP2E1 부하·산화 스트레스 + 아세트아미노펜 NAPQI 독성 상가 → 3개월 장기 복용 시 간손상 누적 위험 (음주자+아세트아미노펜 조합과 동일 기전)",
    commonBrands: ["타이레놀", "타세놀", "세토펜", "써스펜", "펜잘"]
  },
  {
    id: "acetaminophen_encapsulated",
    koreanName: "아세트아미노펜제피세립",
    englishName: "Acetaminophen Encapsulated",
    synonyms: ["아세트아미노펜"],
    category: "해열진통제",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 마황의 CYP2E1 부하·산화 스트레스 + 아세트아미노펜 NAPQI 독성 상가 → 3개월 장기 복용 시 간손상 누적 위험 (음주자+아세트아미노펜 조합과 동일 기전)"
  },
  {
    id: "adenine_hcl",
    koreanName: "아데닌염산염",
    englishName: "Adenine Hydrochloride",
    synonyms: ["아데닌"],
    category: "간장약/대사보조",
    status: "CAUTION",
    opinion: "간질환 치료 중일 가능성 고려; 간질환 없는 경우 병용 가능"
  },
  {
    id: "alprazolam",
    koreanName: "알프라졸람",
    englishName: "Alprazolam",
    synonyms: ["자낙스", "알프람", "알프라졸람정"],
    category: "신경안정제/항불안제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["자낙스", "알프람"]
  },
  {
    id: "amlodipine_adipate",
    koreanName: "암로디핀아디프산염",
    englishName: "Amlodipine Adipate",
    synonyms: ["암로디핀"],
    category: "고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["노바스크", "아모디핀"]
  },
  {
    id: "amlodipine_besylate",
    koreanName: "암로디핀베실산염",
    englishName: "Amlodipine Besylate",
    synonyms: ["암로디핀"],
    category: "고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["노바스크", "아모디핀"]
  },
  {
    id: "amlodipine_camsylate",
    koreanName: "암로디핀캄실산염",
    englishName: "Amlodipine Camsylate",
    synonyms: ["암로디핀", "아모디핀"],
    category: "고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["아모디핀"]
  },
  {
    id: "amlodipine_maleate",
    koreanName: "암로디핀말레산염",
    englishName: "Amlodipine Maleate",
    synonyms: ["암로디핀"],
    category: "고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가"
  },
  {
    id: "amlodipine_mesylate_monohydrate",
    koreanName: "암로디핀메실산염일수화물",
    englishName: "Amlodipine Mesylate Monohydrate",
    synonyms: ["암로디핀"],
    category: "고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가"
  },
  {
    id: "apixaban",
    koreanName: "아픽사반",
    englishName: "Apixaban",
    synonyms: ["엘리퀴스"],
    category: "항응고제(NOAC)",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기",
    commonBrands: ["엘리퀴스"]
  },
  {
    id: "apraclonidine_hcl",
    koreanName: "아프라클로니딘염산염",
    englishName: "Apraclonidine Hydrochloride",
    synonyms: ["아프라클로니딘"],
    category: "안과/녹내장치료제",
    status: "CAUTION",
    opinion: "도파민 수용체와 에페드린 간 카테콜아민 직접 증폭 효과 없음; 정신과 질환 치료 중 교감신경 흥분제 처방 임상적 적합성 우선 검토 필요"
  },
  {
    id: "aripiprazole",
    koreanName: "아리피프라졸",
    englishName: "Aripiprazole",
    synonyms: ["아빌리파이"],
    category: "항정신병약/우울보조",
    status: "CAUTION",
    opinion: "도파민 수용체와 에페드린 간 카테콜아민 직접 증폭 효과 없음; 정신과 질환 치료 중 교감신경 흥분제 처방 임상적 적합성 우선 검토 필요",
    commonBrands: ["아빌리파이"]
  },
  {
    id: "aripiprazole_monohydrate",
    koreanName: "아리피프라졸일수화물",
    englishName: "Aripiprazole Monohydrate",
    synonyms: ["아리피프라졸"],
    category: "항정신병약",
    status: "CAUTION",
    opinion: "도파민 수용체와 에페드린 간 카테콜아민 직접 증폭 효과 없음; 정신과 질환 치료 중 교감신경 흥분제 처방 임상적 적합성 우선 검토 필요",
    commonBrands: ["아빌리파이"]
  },
  {
    id: "aspirin",
    koreanName: "아스피린",
    englishName: "Aspirin",
    synonyms: ["아스피린프로텍트", "아스피린정", "아스피린장용정"],
    category: "소염진통/항혈전제",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["아스피린프로텍트", "바이엘아스피린"]
  },
  {
    id: "aspirin_dl_lysine",
    koreanName: "아스피린리신",
    englishName: "Aspirin DL-Lysine",
    synonyms: ["아스피린"],
    category: "소염진통제",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "aspirin_enteric_pellet",
    koreanName: "아스피린장용펠렛",
    englishName: "Aspirin Enteric Coated Pellet",
    synonyms: ["아스피린"],
    category: "소염진통/항혈전제",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "aspirin_enteric_granule",
    koreanName: "아스피린장용과립",
    englishName: "Aspirin Enteric Granule",
    synonyms: ["아스피린"],
    category: "소염진통/항혈전제",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "baclofen",
    koreanName: "바클로펜",
    englishName: "Baclofen",
    synonyms: ["바클론", "리오레살"],
    category: "근이완제",
    status: "CAUTION",
    opinion: "중추신경계 억제 + 에페드린 자극 → 상호 효과 감소, 직접 위험은 낮음",
    commonBrands: ["바클론", "리오레살"]
  },
  {
    id: "barnidipine_hcl",
    koreanName: "바니디핀염산염",
    englishName: "Barnidipine Hydrochloride",
    synonyms: ["바니디핀"],
    category: "고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["올데카"]
  },
  {
    id: "benzydamine_hcl",
    koreanName: "벤지다민염산염",
    englishName: "Benzydamine Hydrochloride",
    synonyms: ["벤지다민", "탄툼"],
    category: "소염진통제/구강소염",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["탄툼", "디프람"]
  },
  {
    id: "beraprost_sodium",
    koreanName: "베라프로스트나트륨",
    englishName: "Beraprost Sodium",
    synonyms: ["베라프로스트"],
    category: "혈관확장/말초순환개선",
    status: "CAUTION",
    opinion: "혈관확장 vs 에페드린 혈관수축 → 혈역학적 반대 효과",
    commonBrands: ["베라실", "베라스트"]
  },
  {
    id: "betamethasone",
    koreanName: "베타메타손",
    englishName: "Betamethasone",
    synonyms: ["베타메타손", "베타베이트", "라벤다"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["베타베이트", "라벤다"]
  },
  {
    id: "betamethasone_sodium_phosphate",
    koreanName: "베타메타손포스페이트나트륨",
    englishName: "Betamethasone Sodium Phosphate",
    synonyms: ["베타메타손"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충"
  },
  {
    id: "betamethasone_valerate",
    koreanName: "베타메타손발레레이트",
    englishName: "Betamethasone Valerate",
    synonyms: ["베타메타손"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충"
  },
  {
    id: "bethanechol_chloride",
    koreanName: "베타네콜염화물",
    englishName: "Bethanechol Chloride",
    synonyms: ["베타네콜"],
    category: "부교감신경흥분/배뇨장애",
    status: "CAUTION",
    opinion: "에페드린 길항 작용; 직접 위험한 상호작용 아님",
    commonBrands: ["베시콜", "마이토닌"]
  },
  {
    id: "biphenyl_dimethyl_dicarboxylate",
    koreanName: "비페닐디메틸디카르복실레이트",
    englishName: "Biphenyl Dimethyl Dicarboxylate",
    synonyms: ["DDB", "펜넬", "헤파디프"],
    category: "간장약",
    status: "CAUTION",
    opinion: "간질환 치료 중일 가능성 고려; 오미자 성분 유사체, 직접 상호작용 없음",
    commonBrands: ["펜넬", "헤파디프"]
  },
  {
    id: "bromfenac_sodium_hydrate",
    koreanName: "브롬페낙나트륨수화물",
    englishName: "Bromfenac Sodium Hydrate",
    synonyms: ["브롬페낙"],
    category: "소염진통제/안과용제",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["브로낙", "브롬페낙"]
  },
  {
    id: "budesonide",
    koreanName: "부데소니드",
    englishName: "Budesonide",
    synonyms: ["심비코트", "풀미코트", "리노코트"],
    category: "흡입 스테로이드",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["풀미코트", "심비코트", "리노코트"]
  },
  {
    id: "budesonide_micronized",
    koreanName: "부데소니드(미분화)",
    englishName: "Budesonide (Micronized)",
    synonyms: ["부데소니드"],
    category: "흡입 스테로이드",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충"
  },
  {
    id: "candesartan_cilexetil",
    koreanName: "칸데사르탄실렉세틸",
    englishName: "Candesartan Cilexetil",
    synonyms: ["칸데사르탄", "아타칸"],
    category: "고혈압약(ARB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["아타칸", "칸데모어"]
  },
  {
    id: "carvedilol",
    koreanName: "카르베딜롤",
    englishName: "Carvedilol",
    synonyms: ["딜라트렌", "카르베디롤"],
    category: "베타차단 혈압약",
    status: "CAUTION",
    opinion: "에페드린이 항고혈압 효과 감소시킴",
    commonBrands: ["딜라트렌"]
  },
  {
    id: "celecoxib",
    koreanName: "셀레콕시브",
    englishName: "Celecoxib",
    synonyms: ["세레콕시브", "쎄레콕시브", "쎄레브렉스", "세레브렉스", "레일라디에스", "셀콕", "콕시브"],
    category: "소염진통제 (COX-2 선택적)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험, COX-2 선택적 억제제도 독립적 심혈관 위험 존재; 에페드린과 상가 심혈관 부담",
    commonBrands: ["쎄레브렉스", "레일라디에스정", "셀콕", "쎄레브레"]
  },
  {
    id: "chenodeoxycholic_acid",
    koreanName: "케노데옥시콜산",
    englishName: "Chenodeoxycholic Acid",
    synonyms: ["케노데옥시콜산", "씨앤디"],
    category: "담석치료/간장약",
    status: "CAUTION",
    opinion: "간질환 치료 중일 가능성 고려; 간질환 없는 경우 병용 가능"
  },
  {
    id: "chlordiazepoxide",
    koreanName: "클로르디아제폭시드",
    englishName: "Chlordiazepoxide",
    synonyms: ["리브락스"],
    category: "신경안정제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["리브락스"]
  },
  {
    id: "chlordiazepoxide_hcl",
    koreanName: "클로르디아제폭시드염산염",
    englishName: "Chlordiazepoxide Hydrochloride",
    synonyms: ["클로르디아제폭시드"],
    category: "신경안정제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님"
  },
  {
    id: "chlorphenesin_carbamate",
    koreanName: "클로르페네신카르바메이트",
    englishName: "Chlorphenesin Carbamate",
    synonyms: ["클로르페네신", "리락스"],
    category: "근이완제",
    status: "CAUTION",
    opinion: "에페드린과 직접 위험한 상호작용 없음; CNS 억제 vs 에페드린 자극으로 효과 상쇄 정도",
    commonBrands: ["리락스", "클로페신"]
  },
  {
    id: "chlorpheniramine_maleate",
    koreanName: "클로르페니라민말레산염",
    englishName: "Chlorpheniramine Maleate",
    synonyms: ["클로르페니라민", "페니라민"],
    category: "1세대 항히스타민제",
    status: "CAUTION",
    opinion: "체중 증가 효과로 다이어트 효과 감소 + 에페드린과 항콜린 상가 작용(빈맥·구갈·요폐 증폭)",
    commonBrands: ["페니라민", "코푸", "코대원"]
  },
  {
    id: "chlorthalidone",
    koreanName: "클로르탈리돈",
    englishName: "Chlorthalidone",
    synonyms: ["클로르탈리돈", "하이그로톤"],
    category: "이뇨 혈압약",
    status: "CAUTION",
    opinion: "고혈압 치료 시 에페드린이 항고혈압 효과 감소시킴",
    commonBrands: ["하이그로톤"]
  },
  {
    id: "cilostazol",
    koreanName: "실로스타졸",
    englishName: "Cilostazol",
    synonyms: ["프레탈", "실로스텐"],
    category: "혈소판응집억제/말초순환개선",
    status: "CAUTION",
    opinion: "PDE3 억제 → 심박수 증가 + 에페드린 빈맥 → 부정맥 상가 위험; 심혈관 질환자에게 교감신경 흥분제 부적절",
    commonBrands: ["프레탈", "실로스텐"]
  },
  {
    id: "clonazepam",
    koreanName: "클로나제팜",
    englishName: "Clonazepam",
    synonyms: ["리보트릴", "클로나제팜정"],
    category: "항전간제/공황장애",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["리보트릴"]
  },
  {
    id: "clopidogrel_bisulfate",
    koreanName: "클로피도그렐황산수소염",
    englishName: "Clopidogrel Bisulfate",
    synonyms: ["플라빅스", "플라비톨", "클로피도그렐"],
    category: "항혈전제",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기",
    commonBrands: ["플라빅스", "플라비톨"]
  },
  {
    id: "codeine",
    koreanName: "코데인",
    englishName: "Codeine",
    synonyms: ["인산코데인", "마약성진통제"],
    category: "진통·진해제",
    status: "CAUTION",
    opinion: "CNS 억제(진통·진해) vs 에페드린 각성 → 약효 상쇄; 직접 위험한 약리 상호작용 아님"
  },
  {
    id: "codeine_phosphate_hydrate",
    koreanName: "코데인인산염수화물",
    englishName: "Codeine Phosphate Hydrate",
    synonyms: ["코데인인산염", "코데인"],
    category: "진통·진해제",
    status: "CAUTION",
    opinion: "CNS 억제(진통·진해) vs 에페드린 각성 → 약효 상쇄; 직접 위험한 약리 상호작용 아님"
  },
  {
    id: "d_chlorpheniramine_maleate",
    koreanName: "D-클로르페니라민말레산염",
    englishName: "D-Chlorpheniramine Maleate",
    synonyms: ["디클로르페니라민", "폴라라민"],
    category: "1세대 항히스타민제",
    status: "CAUTION",
    opinion: "체중 증가 효과로 다이어트 효과 감소 + 에페드린과 항콜린 상가 작용(빈맥·구갈·요폐 증폭)",
    commonBrands: ["폴라라민"]
  },
  {
    id: "dabigatran",
    koreanName: "다비가트란",
    englishName: "Dabigatran",
    synonyms: ["프라닥사"],
    category: "항응고제(NOAC)",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기",
    commonBrands: ["프라닥사"]
  },
  {
    id: "dabigatran_etexilate",
    koreanName: "다비가트란에텍실레이트",
    englishName: "Dabigatran Etexilate",
    synonyms: ["프라닥사"],
    category: "항응고제(NOAC)",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기",
    commonBrands: ["프라닥사"]
  },
  {
    id: "dabigatran_etexilate_mesylate",
    koreanName: "다비가트란에텍실레이트메실산염",
    englishName: "Dabigatran Etexilate Mesylate",
    synonyms: ["프라닥사"],
    category: "항응고제(NOAC)",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기",
    commonBrands: ["프라닥사"]
  },
  {
    id: "dexamethasone",
    koreanName: "덱사메타손",
    englishName: "Dexamethasone",
    synonyms: ["덱사메타손정", "덱사메타손주사"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["덱사메타손정"]
  },
  {
    id: "dexamethasone_disodium_phosphate",
    koreanName: "덱사메타손디소듐포스페이트",
    englishName: "Dexamethasone Disodium Phosphate",
    synonyms: ["덱사메타손포스페이트"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충"
  },
  {
    id: "dexibuprofen",
    koreanName: "덱시부프로펜",
    englishName: "Dexibuprofen",
    synonyms: ["이지엔6프로", "탁센덱시", "애니펜", "덱시부"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["이지엔6프로", "탁센덱시", "애니펜"]
  },
  {
    id: "dexibuprofen_dc",
    koreanName: "덱시부프로펜 디.씨.",
    englishName: "Dexibuprofen D.C.",
    synonyms: ["덱시부프로펜"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "dexketoprofen_trometamol",
    koreanName: "덱스케토프로펜트로메타몰",
    englishName: "Dexketoprofen Trometamol",
    synonyms: ["덱스케토프로펜"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["에니드"]
  },
  {
    id: "diazepam",
    koreanName: "디아제팜",
    englishName: "Diazepam",
    synonyms: ["바륨", "디아제팜정"],
    category: "신경안정제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["바륨", "디아제팜정"]
  },
  {
    id: "diclofenac_beta_dimethylaminoethanol",
    koreanName: "디클로페낙베타-디메틸아미노에탄올",
    englishName: "Diclofenac Beta-Dimethyl Aminoethanol",
    synonyms: ["디클로페낙"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "diclofenac_sodium",
    koreanName: "디클로페낙나트륨",
    englishName: "Diclofenac Sodium",
    synonyms: ["디클로페낙", "볼타렌"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["볼타렌", "디클로페낙"]
  },
  {
    id: "diflucortolone_valerate",
    koreanName: "디플루코르톨론발레레이트",
    englishName: "Diflucortolone Valerate",
    synonyms: ["디플루코르톨론", "네리소나"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["네리소나"]
  },
  {
    id: "diflunisal",
    koreanName: "디플루니살",
    englishName: "Diflunisal",
    synonyms: ["디플루니살"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "difluprednate",
    koreanName: "디플루프레드네이트",
    englishName: "Difluprednate",
    synonyms: ["디플루프레드네이트"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충"
  },
  {
    id: "dihydrocodeine_tartrate",
    koreanName: "디히드로코데인타르타르산염",
    englishName: "Dihydrocodeine Tartrate",
    synonyms: ["디히드로코데인", "코푸", "코대원"],
    category: "진해거담제 (처방약)",
    status: "CAUTION",
    opinion: "CNS 억제(진통·진해) vs 에페드린 각성 → 약효 상쇄; 직접 위험한 약리 상호작용 아님",
    commonBrands: ["코푸", "코대원"]
  },
  {
    id: "diltiazem_hcl",
    koreanName: "딜티아젬염산염",
    englishName: "Diltiazem Hydrochloride",
    synonyms: ["헤르벤", "딜티아젬"],
    category: "고혈압/부정맥약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["헤르벤", "딜티아젬"]
  },
  {
    id: "dimenhydrinate",
    koreanName: "디멘히드리네이트",
    englishName: "Dimenhydrinate",
    synonyms: ["보나링에이", "멀미약"],
    category: "항구토/멀미약/항히스타민",
    status: "CAUTION",
    opinion: "체중 증가 효과로 다이어트 효과 감소 + 에페드린과 항콜린 상가 작용(빈맥·구갈·요폐 증폭)",
    commonBrands: ["보나링에이"]
  },
  {
    id: "domperidone",
    koreanName: "돔페리돈",
    englishName: "Domperidone",
    synonyms: ["모틴", "돔페리돈정"],
    category: "위장운동촉진제",
    status: "CAUTION",
    opinion: "QT 연장 우려 + 에페드린 심장 자극 → 부정맥 주의",
    commonBrands: ["모틴", "돔페리돈"]
  },
  {
    id: "domperidone_maleate",
    koreanName: "돔페리돈말레산염",
    englishName: "Domperidone Maleate",
    synonyms: ["돔페리돈"],
    category: "위장운동촉진제",
    status: "CAUTION",
    opinion: "QT 연장 우려 + 에페드린 심장 자극 → 부정맥 주의"
  },
  {
    id: "edoxaban",
    koreanName: "에독사반",
    englishName: "Edoxaban",
    synonyms: ["릭시아나"],
    category: "항응고제(NOAC)",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기",
    commonBrands: ["릭시아나"]
  },
  {
    id: "edoxaban_besilate_hydrate",
    koreanName: "에독사반베실산염수화물",
    englishName: "Edoxaban Besilate Hydrate",
    synonyms: ["에독사반", "릭시아나"],
    category: "항응고제(NOAC)",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기"
  },
  {
    id: "edoxaban_tosylate",
    koreanName: "에독사반토실산염",
    englishName: "Edoxaban Tosylate",
    synonyms: ["에독사반", "릭시아나"],
    category: "항응고제(NOAC)",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기"
  },
  {
    id: "edoxaban_tosylate_hydrate",
    koreanName: "에독사반토실산염수화물",
    englishName: "Edoxaban Tosylate Hydrate",
    synonyms: ["에독사반", "릭시아나"],
    category: "항응고제(NOAC)",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기",
    commonBrands: ["릭시아나"]
  },
  {
    id: "empagliflozin",
    koreanName: "엠파글리플로진",
    englishName: "Empagliflozin",
    synonyms: ["자디앙"],
    category: "당뇨병치료제(SGLT-2)",
    status: "CAUTION",
    opinion: "혈당 조절 상태 모니터링 필요",
    commonBrands: ["자디앙"]
  },
  {
    id: "empagliflozin_l_proline",
    koreanName: "엠파글리플로진 L-프롤린",
    englishName: "Empagliflozin L-Proline",
    synonyms: ["엠파글리플로진", "자디앙"],
    category: "당뇨병치료제(SGLT-2)",
    status: "CAUTION",
    opinion: "혈당 조절 상태 모니터링 필요"
  },
  {
    id: "esomeprazole",
    koreanName: "에스오메프라졸",
    englishName: "Esomeprazole",
    synonyms: ["넥시움", "에소메졸", "에소메프라졸"],
    category: "위산분비억제제(PPI)",
    status: "CAUTION",
    opinion: "위산 분비 감소 → 에페드린 흡수 촉진, 약효·부작용 빠르게 나타날 수 있음",
    commonBrands: ["넥시움", "에소메졸"]
  },
  {
    id: "esomeprazole_magnesium_dihydrate",
    koreanName: "에스오메프라졸마그네슘이수화물",
    englishName: "Esomeprazole Magnesium Dihydrate",
    synonyms: ["에스오메프라졸", "넥시움"],
    category: "위산분비억제제(PPI)",
    status: "CAUTION",
    opinion: "위산 분비 감소 → 에페드린 흡수 촉진, 약효·부작용 빠르게 나타날 수 있음"
  },
  {
    id: "esomeprazole_magnesium_trihydrate",
    koreanName: "에스오메프라졸마그네슘삼수화물",
    englishName: "Esomeprazole Magnesium Trihydrate",
    synonyms: ["에스오메프라졸", "넥시움"],
    category: "위산분비억제제(PPI)",
    status: "CAUTION",
    opinion: "위산 분비 감소 → 에페드린 흡수 촉진, 약효·부작용 빠르게 나타날 수 있음"
  },
  {
    id: "esomeprazole_sodium",
    koreanName: "에스오메프라졸나트륨",
    englishName: "Esomeprazole Sodium",
    synonyms: ["에스오메프라졸", "넥시움"],
    category: "위산분비억제제(PPI)",
    status: "CAUTION",
    opinion: "위산 분비 감소 → 에페드린 흡수 촉진, 약효·부작용 빠르게 나타날 수 있음"
  },
  {
    id: "esomeprazole_sodium_trihydrate",
    koreanName: "에스오메프라졸나트륨삼수화물",
    englishName: "Esomeprazole Sodium Trihydrate",
    synonyms: ["에스오메프라졸", "넥시움"],
    category: "위산분비억제제(PPI)",
    status: "CAUTION",
    opinion: "위산 분비 감소 → 에페드린 흡수 촉진, 약효·부작용 빠르게 나타날 수 있음"
  },
  {
    id: "esomeprazole_strontium_tetrahydrate",
    koreanName: "에스오메프라졸스트론튬사수화물",
    englishName: "Esomeprazole Strontium Tetrahydrate",
    synonyms: ["에스오메프라졸", "에소메졸"],
    category: "위산분비억제제(PPI)",
    status: "CAUTION",
    opinion: "위산 분비 감소 → 에페드린 흡수 촉진, 약효·부작용 빠르게 나타날 수 있음",
    commonBrands: ["에소메졸"]
  },
  {
    id: "eszopiclone",
    koreanName: "에스조피클론",
    englishName: "Eszopiclone",
    synonyms: ["루네스타", "조피스타"],
    category: "수면진정제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["루네스타", "조피스타"]
  },
  {
    id: "etodolac",
    koreanName: "에토돌락",
    englishName: "Etodolac",
    synonyms: ["로딘", "에토돌락"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["로딘"]
  },
  {
    id: "etoricoxib",
    koreanName: "에토리콕시브",
    englishName: "Etoricoxib",
    synonyms: ["알콕시아"],
    category: "소염진통제 (COX-2 선택적)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험, COX-2 선택적 억제제도 독립적 심혈관 위험 존재; 에페드린과 상가 심혈관 부담",
    commonBrands: ["알콕시아"]
  },
  {
    id: "ezetimibe",
    koreanName: "에제티미브",
    englishName: "Ezetimibe",
    synonyms: ["이지트롤", "에제티미브"],
    category: "고지혈증약/콜레스테롤흡수억제",
    status: "CAUTION",
    opinion: "병용 가능하나 간수치 증가 가능, 혈액검사 팔로우업 필요",
    commonBrands: ["이지트롤", "아토젯", "로수젯"]
  },

  // --- 2차 캡처분 (피마사르탄 ~ 텔미사르탄) ---
  {
    id: "fimasartan_trihydrate",
    koreanName: "피마사르탄칼륨삼수화물",
    englishName: "Fimasartan Potassium Trihydrate",
    synonyms: ["피마사르탄", "카나브"],
    category: "고혈압약(ARB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["카나브"]
  },
  {
    id: "fimasartan_granule",
    koreanName: "피마사르탄칼륨삼수화물과립",
    englishName: "Fimasartan Potassium Trihydrate Granule",
    synonyms: ["피마사르탄", "카나브"],
    category: "고혈압약(ARB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가"
  },
  {
    id: "flunitrazepam",
    koreanName: "플루니트라제팜",
    englishName: "Flunitrazepam",
    synonyms: ["라제팜", "로히프놀"],
    category: "수면진정제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["라제팜"]
  },
  {
    id: "flurazepam_hcl",
    koreanName: "플루라제팜염산염",
    englishName: "Flurazepam Hydrochloride",
    synonyms: ["달마돔"],
    category: "수면진정제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["달마돔"]
  },
  {
    id: "flurbiprofen",
    koreanName: "플루르비프로펜",
    englishName: "Flurbiprofen",
    synonyms: ["스트렙실", "플루르비프로펜"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["스트렙실", "플루르비"]
  },
  {
    id: "flurbiprofen_sodium_hydrate",
    koreanName: "플루르비프로펜나트륨수화물",
    englishName: "Flurbiprofen Sodium Hydrate",
    synonyms: ["플루르비프로펜"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "fluticasone_propionate",
    koreanName: "플루티카손프로피오네이트",
    englishName: "Fluticasone Propionate",
    synonyms: ["플루티카손", "후릭소나제", "세레타이드", "아바미스", "플루티카손푸로에이트"],
    category: "비염 스프레이/흡입스테로이드",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["아바미스", "후릭소나제", "세레타이드"]
  },
  {
    id: "furosemide",
    koreanName: "푸로세미드",
    englishName: "Furosemide",
    synonyms: ["라식스", "후로세미드"],
    category: "루프 이뇨제",
    status: "CAUTION",
    opinion: "에페드린이 이뇨 효과 감소시킬 수 있음; 직접 위험한 상호작용은 낮음",
    commonBrands: ["라식스"]
  },
  {
    id: "glycopyrrolate",
    koreanName: "글리코피롤레이트",
    englishName: "Glycopyrrolate",
    synonyms: ["스웨트롤", "글리코피롤레이트"],
    category: "항콜린제/다한증치료",
    status: "CAUTION",
    opinion: "에페드린과 항콜린 상가 작용 → 빈맥·배뇨 곤란·구갈 부작용 증폭",
    commonBrands: ["스웨트롤"]
  },
  {
    id: "glimepiride",
    koreanName: "글리메피리드",
    englishName: "Glimepiride",
    synonyms: ["아마릴"],
    category: "당뇨병약",
    status: "CAUTION",
    opinion: "저혈당 위험 주의",
    commonBrands: ["아마릴"]
  },
  {
    id: "heparin_sodium",
    koreanName: "헤파린나트륨",
    englishName: "Heparin Sodium",
    synonyms: ["헤파린"],
    category: "항응고제",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기"
  },
  {
    id: "hepatoprotective_extract",
    koreanName: "생동성간장엑스",
    englishName: "Hepatoprotective Extract",
    synonyms: ["간장엑스", "가네진"],
    category: "간장약",
    status: "CAUTION",
    opinion: "간질환 치료 중일 가능성 고려; 간질환 없는 경우 병용 가능"
  },
  {
    id: "hydrochlorothiazide",
    koreanName: "히드로클로로티아지드",
    englishName: "Hydrochlorothiazide",
    synonyms: ["다이크로짇", "히드로클로로티아짓"],
    category: "티아지드계 이뇨/혈압약",
    status: "CAUTION",
    opinion: "고혈압 치료 시 에페드린이 항고혈압 효과 감소시킴",
    commonBrands: ["다이크로짇"]
  },
  {
    id: "hydrocortisone",
    koreanName: "히드로코르티손",
    englishName: "Hydrocortisone",
    synonyms: ["락티케어", "히드로코르티손"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["락티케어"]
  },
  {
    id: "hydrocortisone_probutate",
    koreanName: "히드로코르티손프로부테이트",
    englishName: "Hydrocortisone Probutate",
    synonyms: ["히드로코르티손"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충"
  },
  {
    id: "ibuprofen",
    koreanName: "이부프로펜",
    englishName: "Ibuprofen",
    synonyms: ["이지엔6애니", "이지엔6이브", "애드빌", "탁센400", "부루펜"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["이지엔6애니", "애드빌", "부루펜", "탁센400", "이지엔6이브"]
  },
  {
    id: "imidafenacin",
    koreanName: "이미다페나신",
    englishName: "Imidafenacin",
    synonyms: ["유리토스"],
    category: "과민성방광치료제/항콜린",
    status: "CAUTION",
    opinion: "에페드린과 항콜린 상가 작용 → 빈맥·배뇨 곤란·구갈 부작용 증폭",
    commonBrands: ["유리토스"]
  },
  {
    id: "indometacin",
    koreanName: "인도메타신",
    englishName: "Indometacin",
    synonyms: ["인도메타신", "인도신"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "ipratropium_bromide_hydrate",
    koreanName: "이프라트로퓸브롬화물수화물",
    englishName: "Ipratropium Bromide Hydrate",
    synonyms: ["아트로벤트", "이프라트로퓸"],
    category: "기관지확장/항콜린",
    status: "CAUTION",
    opinion: "에페드린과 항콜린 상가 작용 → 빈맥·배뇨 곤란·구갈 부작용 증폭",
    commonBrands: ["아트로벤트"]
  },
  {
    id: "irbesartan",
    koreanName: "이르베사르탄",
    englishName: "Irbesartan",
    synonyms: ["아프로벨"],
    category: "고혈압약(ARB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["아프로벨", "코아프로벨"]
  },
  {
    id: "itopride_hcl",
    koreanName: "이토프리드염산염",
    englishName: "Itopride Hydrochloride",
    synonyms: ["가나톤", "이토메드"],
    category: "위장관운동조절제",
    status: "CAUTION",
    opinion: "병용 가능하나 에페드린에 의한 효능 감소 가능",
    commonBrands: ["가나톤"]
  },
  {
    id: "ketoprofen",
    koreanName: "케토프로펜",
    englishName: "Ketoprofen",
    synonyms: ["케토톱", "케토프로펜패취", "케토톱플라스타"],
    category: "소염진통제/관절염약",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["케토톱", "케토톱플라스타"]
  },
  {
    id: "ketorolac_tromethamine",
    koreanName: "케토롤락트로메타민염",
    englishName: "Ketorolac Tromethamine",
    synonyms: ["케토롤락", "타라신"],
    category: "소염진통제 (처방/주사)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["타라신"]
  },
  {
    id: "labetalol_hcl",
    koreanName: "라베탈롤염산염",
    englishName: "Labetalol Hydrochloride",
    synonyms: ["라베신", "라베탈롤"],
    category: "알파/베타차단 혈압약",
    status: "CAUTION",
    opinion: "에페드린이 항고혈압 효과 감소시킴",
    commonBrands: ["라베신"]
  },
  {
    id: "lercanidipine_hcl",
    koreanName: "레르카니디핀염산염",
    englishName: "Lercanidipine Hydrochloride",
    synonyms: ["자니딥", "레르카니디핀"],
    category: "고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["자니딥"]
  },
  {
    id: "lorazepam",
    koreanName: "로라제팜",
    englishName: "Lorazepam",
    synonyms: ["아티반", "로라반", "로라제팜정"],
    category: "신경안정제/항불안제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["아티반", "로라반"]
  },
  {
    id: "losartan_potassium",
    koreanName: "로사르탄칼륨",
    englishName: "Losartan Potassium",
    synonyms: ["코자", "로사르탄"],
    category: "고혈압약(ARB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["코자", "코자플러스"]
  },
  {
    id: "loteprednol_etabonate",
    koreanName: "로테프레드놀에타보네이트",
    englishName: "Loteprednol Etabonate",
    synonyms: ["로테맥스", "로테프레드놀"],
    category: "안과 스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["로테맥스"]
  },
  {
    id: "loxoprofen_sodium_hydrate",
    koreanName: "록소프로펜나트륨수화물",
    englishName: "Loxoprofen Sodium Hydrate",
    synonyms: ["록소프로펜", "록소닌", "록스펜"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["록소닌", "록스펜"]
  },
  {
    id: "mefenamic_acid",
    koreanName: "메페남산",
    englishName: "Mefenamic Acid",
    synonyms: ["폰탈", "메페남산"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["폰탈"]
  },
  {
    id: "meloxicam",
    koreanName: "멜록시캄",
    englishName: "Meloxicam",
    synonyms: ["모빅", "멜록시캄"],
    category: "소염진통제 (관절염 처방약)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험, COX-2 선택적 억제제도 독립적 심혈관 위험 존재; 에페드린과 상가 심혈관 부담",
    commonBrands: ["모빅", "멜록시캄"]
  },
  {
    id: "methimazole",
    koreanName: "메티마졸",
    englishName: "Methimazole",
    synonyms: ["안티로이드", "메티마졸"],
    category: "갑상선기능항진증치료제",
    status: "CAUTION",
    opinion: "직접 상호작용보다 갑상선기능항진증 치료 중인 환자 상태가 문제; 갑상선 기능 정상화 후 복용 고려",
    commonBrands: ["안티로이드", "메티마졸"]
  },
  {
    id: "methylprednisolone",
    koreanName: "메틸프레드니솔론",
    englishName: "Methylprednisolone",
    synonyms: ["메드롤", "프레나", "피디정"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["메드롤", "프레나", "피디정"]
  },
  {
    id: "methylprednisolone_aceponate",
    koreanName: "메틸프레드니솔론아세포네이트",
    englishName: "Methylprednisolone Aceponate",
    synonyms: ["아드반탄"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["아드반탄"]
  },
  {
    id: "methylprednisolone_acetate",
    koreanName: "메틸프레드니솔론아세테이트",
    englishName: "Methylprednisolone Acetate",
    synonyms: ["데포메드롤"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충"
  },
  {
    id: "methylprednisolone_micronized",
    koreanName: "메틸프레드니솔론(미분화)",
    englishName: "Methylprednisolone Micronized",
    synonyms: ["메틸프레드니솔론"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충"
  },
  {
    id: "methylprednisolone_sodium_succinate",
    koreanName: "메틸프레드니솔론숙시네이트나트륨",
    englishName: "Methylprednisolone Sodium Succinate",
    synonyms: ["솔루메드롤"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["솔루메드롤"]
  },
  {
    id: "metoprolol_tartrate",
    koreanName: "메토프로롤타르타르산염",
    englishName: "Metoprolol Tartrate",
    synonyms: ["베타록", "메토프로롤"],
    category: "베타차단 혈압약",
    status: "CAUTION",
    opinion: "에페드린이 항고혈압 효과 감소시킴",
    commonBrands: ["베타록"]
  },
  {
    id: "midazolam",
    koreanName: "미다졸람",
    englishName: "Midazolam",
    synonyms: ["바스캄", "도미컴"],
    category: "수면진정제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님"
  },
  {
    id: "minoxidil",
    koreanName: "미녹시딜",
    englishName: "Minoxidil",
    synonyms: ["마이녹실", "로게인", "미녹시딜정"],
    category: "탈모치료/혈압약",
    status: "CAUTION",
    opinion: "탈모 목적: 병용 가능 / 고혈압 치료 목적: 병용 주의",
    commonBrands: ["마이녹실", "로게인", "현대미녹시딜"]
  },
  {
    id: "morniflumate",
    koreanName: "모니플루메이트",
    englishName: "Morniflumate",
    synonyms: ["모니플루메이트", "모니반"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["모니반"]
  },
  {
    id: "mosapride_citrate_dihydrate",
    koreanName: "모사프리드시트르산염이수화물",
    englishName: "Mosapride Citrate Dihydrate",
    synonyms: ["모사프리드", "가스모틴"],
    category: "위장관운동촉진제",
    status: "CAUTION",
    opinion: "세로토닌 수용체 작용 → 중추신경계 영향, 에페드린 부작용 강화 가능성",
    commonBrands: ["가스모틴", "모사원"]
  },
  {
    id: "mosapride_citrate_hydrate",
    koreanName: "모사프리드시트르산염수화물",
    englishName: "Mosapride Citrate Hydrate",
    synonyms: ["모사프리드", "가스모틴"],
    category: "위장관운동촉진제",
    status: "CAUTION",
    opinion: "세로토닌 수용체 작용 → 중추신경계 영향, 에페드린 부작용 강화 가능성",
    commonBrands: ["가스모틴", "모사원"]
  },
  {
    id: "nabumetone",
    koreanName: "나부메톤",
    englishName: "Nabumetone",
    synonyms: ["나부메톤", "나부톤"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["나부톤"]
  },
  {
    id: "nafromyl_oxalate",
    koreanName: "나프록실옥살산염",
    englishName: "Nafromyl Oxalate",
    synonyms: ["나프로닐"],
    category: "말초혈관확장제",
    status: "CAUTION",
    opinion: "에페드린(혈관수축) vs 나프로닐(혈관확장) → 혈역학적 반대 효과, 직접 위험한 상호작용은 아님"
  },
  {
    id: "naproxen",
    koreanName: "나프록센",
    englishName: "Naproxen",
    synonyms: ["탁센", "낙센", "이지엔6스트롱", "아나프록스"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["탁센", "낙센", "이지엔6스트롱", "아나프록스"]
  },
  {
    id: "naproxen_sodium",
    koreanName: "나프록센나트륨",
    englishName: "Naproxen Sodium",
    synonyms: ["나프록센", "아나프록스"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["아나프록스"]
  },
  {
    id: "nebivolol_hcl",
    koreanName: "네비볼롤염산염",
    englishName: "Nebivolol Hydrochloride",
    synonyms: ["네비레트"],
    category: "베타차단 혈압약",
    status: "CAUTION",
    opinion: "에페드린이 항고혈압 효과 감소시킴",
    commonBrands: ["네비레트"]
  },
  {
    id: "nicorandil",
    koreanName: "니코란딜",
    englishName: "Nicorandil",
    synonyms: ["시그마트"],
    category: "협심증/혈관확장제",
    status: "CAUTION",
    opinion: "혈관확장 vs 에페드린 혈관수축 → 혈역학적 반대 효과, 직접 위험한 상호작용 아님",
    commonBrands: ["시그마트"]
  },
  {
    id: "olmesartan_medoxomil",
    koreanName: "올메사르탄메독소밀",
    englishName: "Olmesartan Medoxomil",
    synonyms: ["올메텍", "올메사르탄"],
    category: "고혈압약(ARB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["올메텍", "올메텍플러스"]
  },
  {
    id: "orphenadrine_citrate",
    koreanName: "오르페나드린시트르산염",
    englishName: "Orphenadrine Citrate",
    synonyms: ["오르페나드린"],
    category: "근이완제",
    status: "CAUTION",
    opinion: "에페드린과 항콜린 상가 작용 → 빈맥·배뇨 곤란·구갈 부작용 증폭"
  },
  {
    id: "pelubiprofen",
    koreanName: "펠루비프로펜",
    englishName: "Pelubiprofen",
    synonyms: ["펠루비", "펠루비서방정"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["펠루비", "펠루비서방정"]
  },
  {
    id: "pelubiprofen_micronized",
    koreanName: "펠루비프로펜(미분화)",
    englishName: "Pelubiprofen (Micronized)",
    synonyms: ["펠루비"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "pelubiprofen_tromethamine",
    koreanName: "펠루비프로펜트로메타민",
    englishName: "Pelubiprofen Tromethamine",
    synonyms: ["펠루비에스", "펠루비"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["펠루비에스"]
  },
  {
    id: "pelubiprofen_tromethamine_micronized",
    koreanName: "펠루비프로펜트로메타민(미분화)",
    englishName: "Pelubiprofen Tromethamine (Micronized)",
    synonyms: ["펠루비"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "phloroglucinol",
    koreanName: "플로로글루시놀",
    englishName: "Phloroglucinol",
    synonyms: ["후로스판", "스파스몰"],
    category: "진경제/위장관진경",
    status: "CAUTION",
    opinion: "에페드린 교감신경 활성이 더 오래 유지될 수 있다는 이론적 우려; 직접 근거는 미약",
    commonBrands: ["후로스판"]
  },
  {
    id: "phloroglucinol_hydrate",
    koreanName: "플로로글루시놀수화물",
    englishName: "Phloroglucinol Hydrate",
    synonyms: ["후로스판"],
    category: "진경제",
    status: "CAUTION",
    opinion: "에페드린 교감신경 활성이 더 오래 유지될 수 있다는 이론적 우려; 직접 근거는 미약"
  },
  {
    id: "pilocarpine_hcl",
    koreanName: "필로카르핀염산염",
    englishName: "Pilocarpine Hydrochloride",
    synonyms: ["살라겐", "필로카르핀"],
    category: "쇼그렌증후군/녹내장치료제",
    status: "CAUTION",
    opinion: "에페드린(교감신경) vs 필로카르핀(부교감신경) 길항 작용, 직접 위험한 상호작용 아님",
    commonBrands: ["살라겐"]
  },
  {
    id: "pimasartan_potassium_trihydrate_granules",
    koreanName: "피마사르탄칼륨삼수화물과립",
    englishName: "Pimasartan Potassium Trihydrate Granules",
    synonyms: ["카나브", "피마사르탄"],
    category: "고혈압약(ARB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["카나브"]
  },
  {
    id: "piroxicam",
    koreanName: "피록시캄",
    englishName: "Piroxicam",
    synonyms: ["트라스트", "트라스트패취", "피록시캄겔"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["트라스트", "트라스트패취"]
  },
  {
    id: "piroxicam_potassium",
    koreanName: "피록시캄칼륨",
    englishName: "Piroxicam Potassium",
    synonyms: ["피록시캄", "트라스트"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "polmacoxib",
    koreanName: "폴마콕시브",
    englishName: "Polmacoxib",
    synonyms: ["아셀렉스"],
    category: "소염진통제 (COX-2 선택적)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험, COX-2 선택적 억제제도 독립적 심혈관 위험 존재; 에페드린과 상가 심혈관 부담",
    commonBrands: ["아셀렉스"]
  },
  {
    id: "pramipexole_hcl",
    koreanName: "프라미펙솔염산염",
    englishName: "Pramipexole Hydrochloride",
    synonyms: ["미라펙스", "프라미펙솔"],
    category: "파킨슨병/하지불안증후군",
    status: "CAUTION",
    opinion: "D2/D3 수용체 작용 → 기립성 저혈압 유발 + 에페드린 원인 상승 → 혈역학적 불안정; 카테콜아민 직접 증폭 효과 없음",
    commonBrands: ["미라펙스"]
  },
  {
    id: "prednisolone",
    koreanName: "프레드니솔론",
    englishName: "Prednisolone",
    synonyms: ["소론도", "프레드닌"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["소론도", "프레드닌"]
  },
  {
    id: "prednisolone_acetate",
    koreanName: "프레드니솔론아세테이트",
    englishName: "Prednisolone Acetate",
    synonyms: ["소론도", "프레드포르테"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["프레드포르테"]
  },
  {
    id: "prednisolone_valeroacetate",
    koreanName: "프레드니솔론발레로아세테이트",
    englishName: "Prednisolone Valeroacetate",
    synonyms: ["리도멕스"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["리도멕스"]
  },
  {
    id: "pregabalin",
    koreanName: "프레가발린",
    englishName: "Pregabalin",
    synonyms: ["리리카", "프레가발린"],
    category: "신경병증성 통증/뇌전증",
    status: "CAUTION",
    opinion: "뇌전증 치료 중: 처방 불가 / 통증 치료 중: 복용 종료 후 처방 가능",
    commonBrands: ["리리카"]
  },
  {
    id: "procyclidine_hcl",
    koreanName: "프로시클리딘염산염",
    englishName: "Procyclidine Hydrochloride",
    synonyms: ["케마드린"],
    category: "항파킨슨/항콜린제",
    status: "CAUTION",
    opinion: "에페드린과 항콜린 상가 작용 → 빈맥·배뇨 곤란·구갈 부작용 증폭"
  },
  {
    id: "propacetamol_hcl",
    koreanName: "프로파세타몰염산염",
    englishName: "Propacetamol Hydrochloride",
    synonyms: ["데놀간", "프로파세타몰"],
    category: "해열진통 주사제",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 마황의 CYP2E1 부하·산화 스트레스 + 아세트아미노펜 NAPQI 독성 상가 → 3개월 장기 복용 시 간손상 누적 위험 (음주자+아세트아미노펜 조합과 동일 기전)",
    commonBrands: ["데놀간"]
  },
  {
    id: "propranolol_hcl",
    koreanName: "프로프라놀롤염산염",
    englishName: "Propranolol Hydrochloride",
    synonyms: ["인데놀", "프로프라놀롤"],
    category: "비선택적 베타차단제/면접떨림약",
    status: "CAUTION",
    opinion: "에페드린과 병용 시 비길항 알파 자극 가능 → 고혈압 위험; 항고혈압 효과 감소",
    commonBrands: ["인데놀"]
  },
  {
    id: "quazepam",
    koreanName: "쿠아제팜",
    englishName: "Quazepam",
    synonyms: ["도랄"],
    category: "수면진정제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["도랄"]
  },
  {
    id: "rabeprazole_sodium",
    koreanName: "라베프라졸나트륨",
    englishName: "Rabeprazole Sodium",
    synonyms: ["파리에트", "라베원", "라베프라졸"],
    category: "위산분비억제제(PPI)",
    status: "CAUTION",
    opinion: "위산 분비 감소 → 에페드린 흡수 촉진",
    commonBrands: ["파리에트", "라베원"]
  },
  {
    id: "rivaroxaban",
    koreanName: "리바록사반",
    englishName: "Rivaroxaban",
    synonyms: ["자렐토"],
    category: "항응고제(NOAC)",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기",
    commonBrands: ["자렐토"]
  },
  {
    id: "lobeglitazone_sulfate",
    koreanName: "로베글리타존황산염",
    englishName: "Lobeglitazone Sulfate",
    synonyms: ["듀비에"],
    category: "당뇨병치료제(TZD)",
    status: "CAUTION",
    opinion: "저혈당 위험 주의",
    commonBrands: ["듀비에"]
  },
  {
    id: "roxatidine_acetate_hcl",
    koreanName: "록사티딘아세테이트염산염",
    englishName: "Roxatidine Acetate Hydrochloride",
    synonyms: ["록산", "록사티딘"],
    category: "위장약 (H2차단제)",
    status: "CAUTION",
    opinion: "위산 분비 감소 → 위 pH 상승 → 에페드린(약염기) 흡수 촉진, 약효·부작용이 빠르게 나타날 수 있음",
    commonBrands: ["록산"]
  },
  {
    id: "s_amlodipine_besylate_2_5_hydrate",
    koreanName: "에스암로디핀베실산염2.5수화물",
    englishName: "S-Amlodipine Besylate 2.5 Hydrate",
    synonyms: ["에스암로디핀", "레보텐션"],
    category: "고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["레보텐션"]
  },
  {
    id: "s_amlodipine_besylate_dihydrate",
    koreanName: "에스암로디핀베실산염이수화물",
    englishName: "S-Amlodipine Besylate Dihydrate",
    synonyms: ["에스암로디핀"],
    category: "고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가"
  },
  {
    id: "s_amlodipine_nicotinate",
    koreanName: "S-암로디핀니코틴산염",
    englishName: "S-Amlodipine Nicotinate",
    synonyms: ["에스암로디핀"],
    category: "고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가"
  },
  {
    id: "sarpogrelate_hcl",
    koreanName: "사르포그렐레이트염산염",
    englishName: "Sarpogrelate Hydrochloride",
    synonyms: ["안플라그", "사포그릴"],
    category: "항혈소판/말초순환개선",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기",
    commonBrands: ["안플라그"]
  },
  {
    id: "spironolactone",
    koreanName: "스피로노락톤",
    englishName: "Spironolactone",
    synonyms: ["알닥톤"],
    category: "칼륨보존 이뇨/혈압약",
    status: "CAUTION",
    opinion: "고혈압 치료 시 에페드린이 항고혈압 효과 감소시킴",
    commonBrands: ["알닥톤"]
  },
  {
    id: "sulindac",
    koreanName: "설린닥",
    englishName: "Sulindac",
    synonyms: ["설린닥", "클리노릴"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담"
  },
  {
    id: "talniflumate",
    koreanName: "탈니플루메이트",
    englishName: "Talniflumate",
    synonyms: ["소말겐", "탈니플루메이트"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["소말겐"]
  },
  {
    id: "tegoprazan",
    koreanName: "테고프라잔",
    englishName: "Tegoprazan",
    synonyms: ["케이캡", "케이캡정", "케이캡구강붕해정"],
    category: "위식도역류치료제(P-CAB)",
    status: "CAUTION",
    opinion: "위산 분비 감소 → 에페드린 흡수 촉진 가능",
    commonBrands: ["케이캡"]
  },
  {
    id: "telmisartan",
    koreanName: "텔미사르탄",
    englishName: "Telmisartan",
    synonyms: ["미카르디스", "텔미누보", "트윈스타"],
    category: "고혈압약(ARB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["미카르디스", "텔미누보", "트윈스타"]
  },

  // --- 3차 캡처분 (텔미사르탄파우더 ~ 졸피뎀타르타르산염) ---
  {
    id: "telmisartan_powder",
    koreanName: "텔미사르탄파우더(23.9%)",
    englishName: "Telmisartan Powder(23.9%)",
    synonyms: ["텔미사르탄"],
    category: "고혈압약(ARB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가"
  },
  {
    id: "temazepam",
    koreanName: "테마제팜",
    englishName: "Temazepam",
    synonyms: ["테마제팜"],
    category: "수면진정제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님"
  },
  {
    id: "teneligliptin_bromide_hcl_hydrate",
    koreanName: "테네릴글립틴브롬화수소산염수화물",
    englishName: "Teneligliptin Bromide Hydrochloride Hydrate",
    synonyms: ["테네리아", "테네릴글립틴"],
    category: "당뇨병약(DPP-4)",
    status: "CAUTION",
    opinion: "당뇨 치료 시 혈당 조절 불량 환자 가능성 고려; 직접 상호작용보다 환자 상태 모니터링 필요",
    commonBrands: ["테네리아"]
  },
  {
    id: "teneligliptin_ditosylate_dihydrate",
    koreanName: "테네릴글립틴이도시실산염이수화물",
    englishName: "Teneligliptin Ditosylate Dihydrate",
    synonyms: ["테네릴글립틴"],
    category: "당뇨병약(DPP-4)",
    status: "CAUTION",
    opinion: "당뇨 치료 시 혈당 조절 불량 환자 가능성 고려; 직접 상호작용보다 환자 상태 모니터링 필요"
  },
  {
    id: "teneligliptin_hcl_hydrate",
    koreanName: "테네릴글립틴염산염수화물",
    englishName: "Teneligliptin Hydrochloride Hydrate",
    synonyms: ["테네릴글립틴"],
    category: "당뇨병약(DPP-4)",
    status: "CAUTION",
    opinion: "당뇨 치료 시 혈당 조절 불량 환자 가능성 고려; 직접 상호작용보다 환자 상태 모니터링 필요"
  },
  {
    id: "tofisopam",
    koreanName: "토피소팜",
    englishName: "Tofisopam",
    synonyms: ["그란닥신", "토피소팜"],
    category: "자율신경조절/항불안제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["그란닥신"]
  },
  {
    id: "triamcinolone",
    koreanName: "트리암시놀론",
    englishName: "Triamcinolone",
    synonyms: ["오라메디", "트리암시놀론정", "트리암시놀론아세토니드"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["오라메디", "트리코트"]
  },
  {
    id: "triamcinolone_acetonide",
    koreanName: "트리암시놀론아세토니드",
    englishName: "Triamcinolone Acetonide",
    synonyms: ["오라메디", "트리암시놀론"],
    category: "스테로이드제",
    status: "CAUTION",
    opinion: "스테로이드의 체지방 증가·근육 분해로 다이어트 효과 방해; 직접 약물상호작용보다 치료 목적 상충",
    commonBrands: ["오라메디"]
  },
  {
    id: "triazolam",
    koreanName: "트리아졸람",
    englishName: "Triazolam",
    synonyms: ["할시온", "트리아졸람"],
    category: "수면진정제",
    status: "CAUTION",
    opinion: "GABA 수용체 작용(진정) vs 에페드린(각성) → 양방향 효과 감소; 위험한 약리 상호작용 아님",
    commonBrands: ["할시온"]
  },
  {
    id: "trimetazidine_hcl",
    koreanName: "트리메타지딘염산염",
    englishName: "Trimetazidine Hydrochloride",
    synonyms: ["바스티난", "트리메타지딘"],
    category: "협심증치료제",
    status: "CAUTION",
    opinion: "직접 상호작용 없음; 심장질환 환자라는 점 고려 주의",
    commonBrands: ["바스티난"]
  },
  {
    id: "trimethylphloroglucinol",
    koreanName: "트리메틸플로로글루시놀",
    englishName: "Trimethylphloroglucinol",
    synonyms: ["후로스판", "플로로글루시놀"],
    category: "진경제",
    status: "CAUTION",
    opinion: "에페드린 교감신경 활성이 더 오래 유지될 수 있다는 이론적 우려; 직접 근거는 미약",
    commonBrands: ["후로스판"]
  },
  {
    id: "ursodeoxycholic_acid",
    koreanName: "우르소데옥시콜산",
    englishName: "Ursodeoxycholic Acid",
    synonyms: ["우루사", "대웅우루사", "UDCA", "우르소"],
    category: "간장약/담즙분비촉진",
    status: "CAUTION",
    opinion: "간질환 치료 중일 가능성 고려; 간질환 없는 경우 병용 가능",
    commonBrands: ["우루사", "대웅우루사"]
  },
  {
    id: "valaciclovir_hcl",
    koreanName: "발라시클로비르염산염",
    englishName: "Valaciclovir Hydrochloride",
    synonyms: ["발트렉스", "발라시클로버"],
    category: "항바이러스제/대상포진",
    status: "CAUTION",
    opinion: "약물상호작용보다 면역력 저하 상태 환자일 수 있어 다이어트에 부적합; 치료 후 다이어트 권장",
    commonBrands: ["발트렉스"]
  },
  {
    id: "valsartan",
    koreanName: "발사르탄",
    englishName: "Valsartan",
    synonyms: ["디오반", "엑스포지"],
    category: "고혈압약(ARB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["디오반", "엑스포지"]
  },
  {
    id: "varenicline_fumarate",
    koreanName: "바레니클린푸마르산염",
    englishName: "Varenicline Fumarate",
    synonyms: ["챔픽스", "바레니클린"],
    category: "금연치료제",
    status: "CAUTION",
    opinion: "에페드린과 직접 상호작용 없음; 심혈관 부작용 모니터링 주의",
    commonBrands: ["챔픽스"]
  },
  {
    id: "varenicline_oxalate_hydrate",
    koreanName: "바레니클린옥살산염수화물",
    englishName: "Varenicline Oxalate Hydrate",
    synonyms: ["챔픽스", "바레니클린"],
    category: "금연치료제",
    status: "CAUTION",
    opinion: "에페드린과 직접 상호작용 없음; 심혈관 부작용 모니터링 주의"
  },
  {
    id: "varenicline_salicylate",
    koreanName: "바레니클린살리실산염",
    englishName: "Varenicline Salicylate",
    synonyms: ["챔픽스", "바레니클린"],
    category: "금연치료제",
    status: "CAUTION",
    opinion: "에페드린과 직접 상호작용 없음; 심혈관 부작용 모니터링 주의"
  },
  {
    id: "varenicline_tartrate",
    koreanName: "바레니클린디타르타르산염",
    englishName: "Varenicline Tartrate",
    synonyms: ["챔픽스", "바레니클린"],
    category: "금연치료제",
    status: "CAUTION",
    opinion: "에페드린과 직접 상호작용 없음; 심혈관 부작용 모니터링 주의",
    commonBrands: ["챔픽스"]
  },
  {
    id: "verapamil_hcl",
    koreanName: "베라파밀염산염",
    englishName: "Verapamil Hydrochloride",
    synonyms: ["이솝틴", "베라파밀"],
    category: "부정맥/고혈압약(CCB)",
    status: "CAUTION",
    opinion: "에페드린이 혈압 상승시켜 항고혈압 효과 감소, 심부전 치료 시에는 병용 불가",
    commonBrands: ["이솝틴"]
  },
  {
    id: "warfarin",
    koreanName: "와파린",
    englishName: "Warfarin",
    synonyms: ["쿠마딘", "와파린정"],
    category: "항응고제",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기; 에페드린 → 간혈류 변화 → INR 예측 불가; 혈압 상승 → 항응고 상태에서 고혈압성 뇌출혈 위험",
    commonBrands: ["쿠마딘", "와파린정"]
  },
  {
    id: "warfarin_sodium",
    koreanName: "와파린나트륨",
    englishName: "Warfarin Sodium",
    synonyms: ["쿠마딘", "와파린"],
    category: "항응고제",
    status: "CAUTION",
    opinion: "심혈관 질환자 확인 필요 → 혈전·출혈 고위험 환자에 혈압 상승 약물 금기; 에페드린 → 간혈류 변화 → INR 예측 불가; 혈압 상승 → 항응고 상태에서 고혈압성 뇌출혈 위험",
    commonBrands: ["쿠마딘", "와파린정"]
  },
  {
    id: "zaltoprofen",
    koreanName: "잘토프로펜",
    englishName: "Zaltoprofen",
    synonyms: ["솔레톤", "잘토프로펜"],
    category: "소염진통제 (NSAIDs)",
    status: "CAUTION",
    opinion: "복용 시 다이어트환은 중단. 장기 복용 시 심혈관·신장 손상 누적 위험: 에페드린(혈관수축·혈압↑) + NSAID(COX 억제→신장 프로스타글란딘↓→신장관류↓) 이중 신장 손상; 지속성 고혈압으로 심혈관 부담",
    commonBrands: ["솔레톤"]
  },
  {
    id: "zolpidem_tartrate",
    koreanName: "졸피뎀타르타르산염",
    englishName: "Zolpidem Tartrate",
    synonyms: ["스틸녹스", "졸피드", "졸피뎀"],
    category: "수면진정제",
    status: "CAUTION",
    opinion: "진정·수면 촉진 vs 에페드린 각성·불면 유발 → 상반 작용, 양방향 효과 감소",
    commonBrands: ["스틸녹스", "졸피드"]
  },

  // ==========================================
  // === [3] 안전 (SAFE) 다빈도 대표 성분 ===
  // ==========================================
  {
    id: "erdosteine",
    koreanName: "에르도스테인",
    englishName: "Erdosteine",
    synonyms: ["엘도스", "뮤코메드", "에르도스테인"],
    category: "진해거담제 (처방약)",
    status: "SAFE",
    opinion: "에페드린과의 심혈관계 및 중추신경계 상호작용이 없어 안전하게 병용 가능합니다.",
    commonBrands: ["엘도스", "뮤코메드"]
  },
  {
    id: "acetylcysteine",
    koreanName: "아세틸시스테인",
    englishName: "Acetylcysteine",
    synonyms: ["뮤코펙트", "아세틸시스테인"],
    category: "진해거담제",
    status: "SAFE",
    opinion: "호흡기 점액 용해제로 다이어트 한약과 안전하게 병용 가능합니다.",
    commonBrands: ["뮤코펙트"]
  },
  {
    id: "ambroxol_hcl",
    koreanName: "암브록솔염산염",
    englishName: "Ambroxol Hydrochloride",
    synonyms: ["암브록솔", "뮤코펙트"],
    category: "진해거담제",
    status: "SAFE",
    opinion: "기관지 분비 촉진제로 다이어트 한약과 안전하게 병용 가능합니다.",
    commonBrands: ["뮤코펙트"]
  },
  {
    id: "levodropropizine",
    koreanName: "레보드로프로피진",
    englishName: "Levodropropizine",
    synonyms: ["레보투스", "레보드로피진"],
    category: "진해제 (처방약)",
    status: "SAFE",
    opinion: "말초성 진해제로 중추신경계 자극이 없어 안전하게 병용 가능합니다.",
    commonBrands: ["레보투스"]
  },
  {
    id: "cetirizine_hcl",
    koreanName: "세티리진염산염",
    englishName: "Cetirizine Hydrochloride",
    synonyms: ["지르텍", "세티리진"],
    category: "2세대 항히스타민제",
    status: "SAFE",
    opinion: "슈도에페드린이 포함되지 않은 순수 항히스타민 단일제는 복용 가능합니다.",
    commonBrands: ["지르텍"]
  },
  {
    id: "levocetirizine_hcl",
    koreanName: "레보세티리진염산염",
    englishName: "Levocetirizine Hydrochloride",
    synonyms: ["씨잘", "레보세티리진"],
    category: "3세대 항히스타민제",
    status: "SAFE",
    opinion: "졸음과 심혈관 부작용이 적은 안전한 항히스타민제입니다.",
    commonBrands: ["씨잘"]
  },
  {
    id: "fexofenadine_hcl",
    koreanName: "펙소페나딘염산염",
    englishName: "Fexofenadine Hydrochloride",
    synonyms: ["알레그라", "펙소페나딘"],
    category: "3세대 항히스타민제",
    status: "SAFE",
    opinion: "다이어트 한약과 상호작용이 없는 안전한 비염/알레르기 치료제입니다.",
    commonBrands: ["알레그라"]
  },
  {
    id: "loratadine",
    koreanName: "로라타딘",
    englishName: "Loratadine",
    synonyms: ["클라리틴", "로라타딘"],
    category: "2세대 항히스타민제",
    status: "SAFE",
    opinion: "다이어트 한약과 병용 가능한 안전한 항히스타민제입니다.",
    commonBrands: ["클라리틴"]
  },
  {
    id: "ebastine",
    koreanName: "에바스틴",
    englishName: "Ebastine",
    synonyms: ["에바스텔", "에바스틴"],
    category: "2세대 항히스타민제",
    status: "SAFE",
    opinion: "다이어트 한약과 안전하게 병용 가능한 항히스타민제입니다.",
    commonBrands: ["에바스텔"]
  },
  {
    id: "magnesium_oxide",
    koreanName: "산화마그네슘",
    englishName: "Magnesium Oxide",
    synonyms: ["마그밀", "마그네슘"],
    category: "변비완화제/제산제",
    status: "SAFE",
    opinion: "다이어트 한약 복용 중 변비 시 안전하게 병용 복용 가능합니다.",
    commonBrands: ["마그밀"]
  },
  {
    id: "rebamipide",
    koreanName: "레바미피드",
    englishName: "Rebamipide",
    synonyms: ["무코스타", "뮤코라민", "레바미피드"],
    category: "위점막보호제 (처방약)",
    status: "SAFE",
    opinion: "위점막 보호제로 다이어트 한약과 안전하게 병용 가능합니다.",
    commonBrands: ["무코스타", "뮤코라민"]
  },
  {
    id: "almagate",
    koreanName: "알마게이트",
    englishName: "Almagate",
    synonyms: ["알마겔", "알마게이트"],
    category: "제산제",
    status: "SAFE",
    opinion: "위산 중화제로 다이어트 한약 복용 시 속쓰림 완화에 병용 가능합니다.",
    commonBrands: ["알마겔"]
  },
  {
    id: "famotidine",
    koreanName: "파모티딘",
    englishName: "Famotidine",
    synonyms: ["가스터", "파모티딘"],
    category: "위장약 (H2차단제)",
    status: "SAFE",
    opinion: "위산분비 억제제로 다이어트 한약과 안전하게 복용 가능합니다.",
    commonBrands: ["가스터"]
  },
  {
    id: "trimebutine_maleate",
    koreanName: "트리메부틴말레산염",
    englishName: "Trimebutine Maleate",
    synonyms: ["포리부틴", "트리메부틴"],
    category: "위장관운동조절제",
    status: "SAFE",
    opinion: "위장관 운동 정상화제로 복통, 소화불량 시 안전하게 병용 가능합니다.",
    commonBrands: ["포리부틴"]
  },
  {
    id: "artemisia_extract",
    koreanName: "애엽에탄올추출물",
    englishName: "Artemisia Extract",
    synonyms: ["스티렌", "스티렌투엑스"],
    category: "위염치료제 (처방약)",
    status: "SAFE",
    opinion: "천연물 유래 위염치료제로 다이어트 한약과 안전하게 병용 가능합니다.",
    commonBrands: ["스티렌", "스티렌투엑스"]
  },
  {
    id: "cefixime_hydrate",
    koreanName: "세픽심수화물",
    englishName: "Cefixime Hydrate",
    synonyms: ["세픽심", "슈프락스", "위더스세픽심"],
    category: "세팔로스포린계 항생제 (처방약)",
    status: "SAFE",
    opinion: "항생제 치료제로 다이어트 한약과 안전하게 병용 가능합니다.",
    commonBrands: ["슈프락스", "위더스세픽심"]
  }
];

// 2. 국내 다빈도 처방/일반의약품 상표명(Brand) 매핑 데이터셋
const POPULAR_COMMERCIAL_DRUGS = [
  // --- 소염진통제 복합제 / 유명 브랜드 ---
  { id: "layla_ds", brandName: "레일라디에스정", company: "한국피엠지제약", category: "골관절염/소염진통 복합제 (처방약)", ingredients: [{ name: "세레콕시브", amount: "100mg" }, { name: "당귀·모과·방풍·속단 복합추출물", amount: "405mg" }] },
  { id: "layla", brandName: "레일라정", company: "한국피엠지제약", category: "골관절염/소염진통제 (처방약)", ingredients: [{ name: "당귀·모과·방풍 복합추출물", amount: "405mg" }] },
  { id: "taxen", brandName: "탁센연질캡슐", company: "GC녹십자", category: "소염진통제 (나프록센)", ingredients: [{ name: "나프록센", amount: "250mg" }] },
  { id: "taxen_eve", brandName: "탁센이브연질캡슐", company: "GC녹십자", category: "생리통 진통제", ingredients: [{ name: "이부프로펜", amount: "200mg" }, { name: "파마브롬", amount: "25mg" }] },
  { id: "taxen_lady", brandName: "탁센레이디연질캡슐", company: "GC녹십자", category: "생리통 진통제", ingredients: [{ name: "이부프로펜", amount: "200mg" }, { name: "파마브롬", amount: "25mg" }] },
  { id: "taxen_dexi", brandName: "탁센덱시연질캡슐", company: "GC녹십자", category: "소염진통제", ingredients: [{ name: "덱시부프로펜", amount: "300mg" }] },
  { id: "taxen_400", brandName: "탁센400이부프로펜", company: "GC녹십자", category: "소염진통제", ingredients: [{ name: "이부프로펜", amount: "400mg" }] },
  { id: "tylenol_500", brandName: "타이레놀정 500mg", company: "한국존슨앤드존슨", category: "해열진통제", ingredients: [{ name: "아세트아미노펜", amount: "500mg" }] },
  { id: "tylenol_er", brandName: "타이레놀 8시간 이알 서방정", company: "한국존슨앤드존슨", category: "서방형 해열진통제", ingredients: [{ name: "아세트아미노펜", amount: "650mg" }] },
  { id: "tacenol", brandName: "타세놀정 500mg / 타세놀이알", company: "대웅제약", category: "해열진통제", ingredients: [{ name: "아세트아미노펜", amount: "500~650mg" }] },
  { id: "setopen", brandName: "세토펜정 / 세토펜현탁액", company: "삼아제약", category: "해열진통제 (처방약)", ingredients: [{ name: "아세트아미노펜", amount: "325~500mg" }] },
  { id: "suspen", brandName: "써스펜이알서방정", company: "한미약품", category: "해열진통제", ingredients: [{ name: "아세트아미노펜", amount: "650mg" }] },
  { id: "ezn6_ani", brandName: "이지엔6애니연질캡슐", company: "대웅제약", category: "소염진통제", ingredients: [{ name: "이부프로펜", amount: "200mg" }] },
  { id: "ezn6_pro", brandName: "이지엔6프로연질캡슐", company: "대웅제약", category: "소염진통제", ingredients: [{ name: "덱시부프로펜", amount: "300mg" }] },
  { id: "ezn6_eve", brandName: "이지엔6이브연질캡슐", company: "대웅제약", category: "생리통 진통제", ingredients: [{ name: "이부프로펜", amount: "200mg" }, { name: "파마브롬", amount: "25mg" }] },
  { id: "ezn6_ace", brandName: "이지엔6에이스", company: "대웅제약", category: "해열진통제", ingredients: [{ name: "아세트아미노펜", amount: "325mg" }] },
  { id: "ezn6_strong", brandName: "이지엔6스트롱연질캡슐", company: "대웅제약", category: "소염진통제", ingredients: [{ name: "나프록센", amount: "250mg" }] },
  { id: "advil", brandName: "애드빌정 / 애드빌리퀴겔", company: "GSK", category: "소염진통제", ingredients: [{ name: "이부프로펜", amount: "200mg" }] },
  { id: "naxen", brandName: "낙센정 / 낙센에프", company: "종근당", category: "소염진통제", ingredients: [{ name: "나프록센", amount: "250~500mg" }] },
  { id: "loxonin", brandName: "록소닌정 / 록스펜정", company: "동화약품", category: "소염진통제 (처방약)", ingredients: [{ name: "록소프로펜나트륨수화물", amount: "68.1mg" }] },
  { id: "airtal", brandName: "에어탈정 / 아세클로정", company: "대웅제약", category: "소염진통제 (처방약)", ingredients: [{ name: "아세클로페낙", amount: "100mg" }] },
  { id: "celebrex", brandName: "쎄레브렉스캡슐 (100mg / 200mg)", company: "한국비아트리스", category: "소염진통제 (처방약)", ingredients: [{ name: "셀레콕시브", amount: "100~200mg" }] },
  { id: "pelubi", brandName: "펠루비정 / 펠루비서방정", company: "대원제약", category: "소염진통제 (처방약)", ingredients: [{ name: "펠루비프로펜", amount: "30~45mg" }] },
  { id: "mobic", brandName: "모빅캡슐 (7.5mg / 15mg)", company: "한국베링거", category: "소염진통제 (처방약)", ingredients: [{ name: "멜록시캄", amount: "7.5~15mg" }] },
  { id: "soleton", brandName: "솔레톤정 (80mg)", company: "CJ헬스케어/HK이노엔", category: "소염진통제 (처방약)", ingredients: [{ name: "잘토프로펜", amount: "80mg" }] },
  { id: "pontal", brandName: "폰탈캡슐 (250mg / 500mg)", company: "유한양행", category: "소염진통제", ingredients: [{ name: "메페남산", amount: "250~500mg" }] },
  { id: "aspirin_protect", brandName: "아스피린프로텍트정 100mg", company: "바이엘", category: "항혈전/소염진통", ingredients: [{ name: "아스피린", amount: "100mg" }] },
  { id: "geborin", brandName: "게보린정", company: "삼진제약", category: "복합진통제", ingredients: [{ name: "아세트아미노펜", amount: "300mg" }, { name: "카페인무수물", amount: "50mg" }] },
  { id: "penzal_q", brandName: "펜잘큐정", company: "종근당", category: "복합진통제", ingredients: [{ name: "아세트아미노펜", amount: "300mg" }, { name: "카페인무수물", amount: "50mg" }] },
  { id: "gralen", brandName: "그날엔정", company: "경동제약", category: "복합진통제", ingredients: [{ name: "이부프로펜", amount: "75mg" }, { name: "카페인무수물", amount: "40mg" }] },
  { id: "ultracet", brandName: "울트라셋정 / 울트라셋이알 / 파라마셋", company: "한국얀센", category: "중증진통제 (처방약)", ingredients: [{ name: "트라마돌염산염", amount: "37.5mg" }, { name: "아세트아미노펜", amount: "325mg" }] },
  { id: "artnolset", brandName: "아트놀셋정", company: "대웅바이오", category: "복합 진통제 (처방약)", ingredients: [{ name: "아세트아미노펜", amount: "325mg" }, { name: "트라마돌염산염", amount: "37.5mg" }] },
  { id: "artnolset_semi", brandName: "아트놀셋세미정", company: "대웅바이오", category: "복합 진통제 (처방약)", ingredients: [{ name: "아세트아미노펜", amount: "162.5mg" }, { name: "트라마돌염산염", amount: "18.75mg" }] },
  { id: "tralac", brandName: "트라락정 / 울트라셋정", company: "한국얀센", category: "중증/만성 진통제 (처방약)", ingredients: [{ name: "아세트아미노펜", amount: "325mg" }, { name: "트라마돌염산염", amount: "37.5mg" }] },
  { id: "ultracet_semi", brandName: "울트라셋세미정", company: "한국얀센", category: "복합 진통제 (처방약)", ingredients: [{ name: "아세트아미노펜", amount: "162.5mg" }, { name: "트라마돌염산염", amount: "18.75mg" }] },
  { id: "avamys", brandName: "아바미스나잘스프레이", company: "GSK", category: "비염 스프레이/스테로이드 (처방약)", ingredients: [{ name: "플루티카손프로피오네이트", amount: "27.5mcg" }] },
  { id: "nasonex", brandName: "나조넥스나잘스프레이", company: "한국MSD/오가논", category: "비염 스프레이/스테로이드 (처방약)", ingredients: [{ name: "모메타손", amount: "50mcg" }] },
  { id: "ketotop", brandName: "케토톱플라스타 / 케토톱", company: "한독", category: "소염진통 파스", ingredients: [{ name: "케토프로펜", amount: "30mg" }] },
  { id: "trast", brandName: "트라스트패취 / 트라스트", company: "SK케미칼", category: "관절염 패치", ingredients: [{ name: "피록시캄", amount: "48mg" }] },
  { id: "solondo", brandName: "소론도정 (5mg)", company: "유한양행", category: "부신피질호르몬/스테로이드", ingredients: [{ name: "프레드니솔론", amount: "5mg" }] },
  { id: "medrol", brandName: "메드롤정 (4mg)", company: "한국화이자", category: "부신피질호르몬/스테로이드", ingredients: [{ name: "메틸프레드니솔론", amount: "4mg" }] },
  { id: "prena", brandName: "프레나정", company: "태극제약", category: "부신피질호르몬/스테로이드 (처방약)", ingredients: [{ name: "메틸프레드니솔론", amount: "4mg" }] },
  { id: "oramedy", brandName: "오라메디연고", company: "동국제약", category: "구내염 연고", ingredients: [{ name: "트리암시놀론", amount: "1mg/g" }] },

  // --- 호흡기 / 감기약 / 진해거담제 ---
  { id: "pancol_a", brandName: "판콜에이내복액", company: "동화약품", category: "종합감기약 (액상)", ingredients: [{ name: "DL-메틸에페드린염산염", amount: "17.5mg" }, { name: "카페인무수물", amount: "30mg" }, { name: "아세트아미노펜", amount: "300mg" }] },
  { id: "pancol_s", brandName: "판콜에스내복액", company: "동화약품", category: "종합감기약 (액상)", ingredients: [{ name: "DL-메틸에페드린염산염", amount: "17.5mg" }, { name: "카페인무수물", amount: "30mg" }, { name: "아세트아미노펜", amount: "300mg" }] },
  { id: "panpyrin_q", brandName: "판피린큐액 / 판피린티", company: "동아제약", category: "종합감기약", ingredients: [{ name: "DL-메틸에페드린염산염", amount: "10mg" }, { name: "카페인무수물", amount: "30mg" }, { name: "아세트아미노펜", amount: "300mg" }] },
  { id: "theraflu_night", brandName: "테라플루나이트타임건조시럽", company: "GSK", category: "종합감기약", ingredients: [{ name: "페닐레프린염산염", amount: "10mg" }, { name: "아세트아미노펜", amount: "650mg" }] },
  { id: "theraflu_day", brandName: "테라플루데이타임건조시럽", company: "GSK", category: "종합감기약", ingredients: [{ name: "페닐레프린염산염", amount: "10mg" }, { name: "아세트아미노펜", amount: "650mg" }] },
  { id: "codaewon_forte", brandName: "코대원포르테시럽", company: "대원제약", category: "진해거담제 (처방약)", ingredients: [{ name: "DL-메틸에페드린염산염", amount: "1.31mg/mL" }, { name: "디히드로코데인타르타르산염", amount: "0.5mg/mL" }] },
  { id: "cofu_syrup", brandName: "코푸시럽 / 코푸정", company: "유한양행", category: "진해거담제 (처방약)", ingredients: [{ name: "DL-메틸에페드린염산염", amount: "1.31mg/mL" }, { name: "디히드로코데인타르타르산염", amount: "0.5mg/mL" }] },
  { id: "codaewon_s", brandName: "코대원에스시럽", company: "대원제약", category: "진해거담제 (처방약)", ingredients: [{ name: "DL-메틸에페드린염산염", amount: "1.31mg/mL" }, { name: "디히드로코데인타르타르산염", amount: "0.5mg/mL" }] },
  { id: "codaewon_tab", brandName: "코대원정", company: "대원제약", category: "진해거담제 (처방약)", ingredients: [{ name: "DL-메틸에페드린염산염", amount: "17.5mg" }, { name: "디히드로코데인타르타르산염", amount: "5mg" }, { name: "클로르페니라민말레산염", amount: "1.5mg" }] },
  { id: "cofu_tab", brandName: "코푸정", company: "유한양행", category: "진해거담제 (처방약)", ingredients: [{ name: "DL-메틸에페드린염산염", amount: "17.5mg" }, { name: "디히드로코데인타르타르산염", amount: "5mg" }, { name: "클로르페니라민말레산염", amount: "1.5mg" }] },
  { id: "lexipin", brandName: "렉시핀정 (400mg)", company: "대화제약", category: "기관지확장제/천식 (처방약)", ingredients: [{ name: "독소필린", amount: "400mg" }] },
  { id: "axima", brandName: "액시마정 (400mg)", company: "부광약품", category: "기관지확장제/천식 (처방약)", ingredients: [{ name: "독소필린", amount: "400mg" }] },
  { id: "doxoma", brandName: "독소마정 (400mg)", company: "삼아제약", category: "기관지확장제/천식 (처방약)", ingredients: [{ name: "독소필린", amount: "400mg" }] },
  { id: "acebron", brandName: "아세브론정 / 에어브론캡슐", company: "삼아제약/대원제약", category: "기관지확장제 (처방약)", ingredients: [{ name: "아세브로필린", amount: "100mg" }] },
  { id: "theochrono", brandName: "테오크로노서방정 (200mg / 300mg)", company: "보령", category: "기관지확장제 (처방약)", ingredients: [{ name: "테오필린", amount: "200~300mg" }] },
  { id: "uniphyl", brandName: "유니필서방정 (200mg / 400mg)", company: "대웅제약", category: "기관지확장제 (처방약)", ingredients: [{ name: "테오필린", amount: "200~400mg" }] },
  { id: "meptin", brandName: "메프틴정 / 메프틴흡입액", company: "한국오츠카", category: "기관지확장제 (처방약)", ingredients: [{ name: "프로카테롤염산염수화물", amount: "50mcg" }] },
  { id: "atock", brandName: "아토크정 / 삼아아토크건조시럽", company: "삼아제약", category: "기관지확장제 (처방약)", ingredients: [{ name: "포르모테롤푸마르산염수화물", amount: "20~40mcg" }] },
  { id: "hokunalin", brandName: "호쿠날린패치 (0.5mg / 1mg / 2mg)", company: "한국애보트", category: "기관지확장 패치 (처방약)", ingredients: [{ name: "툴로부테롤", amount: "0.5~2mg" }] },
  { id: "notemon", brandName: "노테몬패치", company: "대원제약", category: "기관지확장 패치 (처방약)", ingredients: [{ name: "툴로부테롤", amount: "0.5~2mg" }] },
  { id: "ventolin", brandName: "벤토린에어로솔 / 벤토린흡입액", company: "GSK", category: "급성 천식치료제 (처방약)", ingredients: [{ name: "살부타몰황산염", amount: "100mcg" }] },
  { id: "symbicort", brandName: "심비코트터부헬러 / 라피헬러", company: "아스트라제네카", category: "천식/COPD 흡입제 (처방약)", ingredients: [{ name: "부데소니드", amount: "160mcg" }, { name: "포르모테롤푸마르산염수화물", amount: "4.5mcg" }] },
  { id: "relvar", brandName: "렐바엘립타", company: "GSK", category: "천식/COPD 흡입제 (처방약)", ingredients: [{ name: "미분화빌란테롤트리페나테이트", amount: "25mcg" }, { name: "플루티카손프로피오네이트", amount: "100~200mcg" }] },
  { id: "sudafed", brandName: "슈다페드정 (60mg)", company: "삼일제약", category: "비염/코막힘약", ingredients: [{ name: "슈도에페드린염산염", amount: "60mg" }] },
  { id: "actifed", brandName: "액티피드정", company: "삼일제약", category: "코감기/비염약", ingredients: [{ name: "슈도에페드린염산염", amount: "60mg" }, { name: "트리프롤리딘염산염", amount: "2.5mg" }] },
  { id: "zyrtec", brandName: "지르텍정 (10mg)", company: "한국유씨비", category: "알레르기/비염약", ingredients: [{ name: "세티리진염산염", amount: "10mg" }] },
  { id: "allegra", brandName: "알레그라정 (120mg / 180mg)", company: "사노피", category: "알레르기/비염약", ingredients: [{ name: "펙소페나딘염산염", amount: "120~180mg" }] },
  { id: "xyzal", brandName: "씨잘정 (5mg) / 씨잘액", company: "한국유씨비", category: "알레르기/비염약 (처방약)", ingredients: [{ name: "레보세티리진염산염", amount: "5mg" }] },
  { id: "claritin", brandName: "클라리틴정 (10mg)", company: "바이엘", category: "알레르기/비염약", ingredients: [{ name: "로라타딘", amount: "10mg" }] },
  { id: "ebastel", brandName: "에바스텔정 (10mg)", company: "보령", category: "알레르기/비염약 (처방약)", ingredients: [{ name: "에바스틴", amount: "10mg" }] },
  { id: "eldos", brandName: "엘도스캡슐 / 에르도스", company: "대웅제약", category: "진해거담제 (처방약)", ingredients: [{ name: "에르도스테인", amount: "300mg" }] },
  { id: "mucomed", brandName: "뮤코메드캡슐", company: "대원제약", category: "진해거담제 (처방약)", ingredients: [{ name: "에르도스테인", amount: "300mg" }] },
  { id: "levotuss", brandName: "레보투스시럽 / 레보드로피진", company: "현대약품", category: "진해제 (처방약)", ingredients: [{ name: "레보드로프로피진", amount: "60mg" }] },

  // --- 위장약 / 소화기계 ---
  { id: "k_cab", brandName: "케이캡정 (50mg / 구강붕해정)", company: "HK이노엔", category: "위식도역류약(P-CAB)", ingredients: [{ name: "테고프라잔", amount: "50mg" }] },
  { id: "nexium", brandName: "넥시움정 (20mg / 40mg)", company: "아스트라제네카", category: "위산분비억제제(PPI)", ingredients: [{ name: "에스오메프라졸", amount: "20~40mg" }] },
  { id: "esomezole", brandName: "에소메졸캡슐 / 에소메졸디알", company: "한미약품", category: "위산분비억제제(PPI)", ingredients: [{ name: "에스오메프라졸스트론튬사수화물", amount: "20~40mg" }] },
  { id: "pariet", brandName: "파리에트정 (10mg / 20mg)", company: "한국에자이", category: "위산분비억제제(PPI)", ingredients: [{ name: "라베프라졸나트륨", amount: "10~20mg" }] },
  { id: "gasmotin", brandName: "가스모틴정 (5mg) / 모사원정", company: "대웅제약", category: "위장관운동촉진제 (처방약)", ingredients: [{ name: "모사프리드시트르산염수화물", amount: "5mg" }] },
  { id: "ganaton", brandName: "가나톤정 (50mg) / 이토메드", company: "JW중외제약", category: "위장관운동조절제", ingredients: [{ name: "이토프리드염산염", amount: "50mg" }] },
  { id: "stilrex", brandName: "스티렌정 / 스티렌투엑스", company: "동아ST", category: "위염치료제 (처방약)", ingredients: [{ name: "애엽에탄올추출물", amount: "60~90mg" }] },
  { id: "mucosta", brandName: "무코스타정 (100mg)", company: "한국오츠카", category: "위점막보호제 (처방약)", ingredients: [{ name: "레바미피드", amount: "100mg" }] },
  { id: "mucoramin", brandName: "뮤코라민정", company: "유니메드제약", category: "위점막보호제 (처방약)", ingredients: [{ name: "레바미피드", amount: "100mg" }] },
  { id: "almagel", brandName: "알마겔정 / 알마겔현탁액", company: "유한양행", category: "제산제", ingredients: [{ name: "알마게이트", amount: "500~1000mg" }] },
  { id: "famotidine_brand", brandName: "파모티딘정 (20mg) / 가스터정", company: "동아에스티/다양", category: "위장약 (H2차단제)", ingredients: [{ name: "파모티딘", amount: "20mg" }] },
  { id: "polybutin", brandName: "포리부틴정 (100mg / 150mg / 300mg)", company: "삼일제약", category: "위장관운동조절제", ingredients: [{ name: "트리메부틴말레산염", amount: "100~300mg" }] },
  { id: "magmil", brandName: "마그밀정 (500mg)", company: "삼남제약", category: "변비완화제/제산제", ingredients: [{ name: "산화마그네슘", amount: "500mg" }] },
  { id: "urusa", brandName: "우루사정 / 대웅우루사 (100mg / 200mg)", company: "대웅제약", category: "간장약/담즙개선", ingredients: [{ name: "우르소데옥시콜산", amount: "100~200mg" }] },

  // --- 정신신경 / 수면제 / 갑상선 / 뇌전증 ---
  { id: "synthroid_brand", brandName: "씬지로이드정 / 씬지록신정", company: "부광약품/다림", category: "갑상선호르몬제", ingredients: [{ name: "레보티록신나트륨수화물", amount: "50~100mcg" }] },
  { id: "stilnox", brandName: "스틸녹스정 (10mg / CR 12.5mg)", company: "한독", category: "수면제 (처방약)", ingredients: [{ name: "졸피뎀타르타르산염", amount: "10mg" }] },
  { id: "zolpid", brandName: "졸피드정 / 졸피뎀정", company: "한미약품", category: "수면제 (처방약)", ingredients: [{ name: "졸피뎀타르타르산염", amount: "10mg" }] },
  { id: "halcion", brandName: "할시온정 (0.125mg / 0.25mg)", company: "한국화이자", category: "수면진정제", ingredients: [{ name: "트리아졸람", amount: "0.25mg" }] },
  { id: "zanax", brandName: "자낙스정 / 알프람정", company: "한국화이자/환인", category: "항불안제/신경안정", ingredients: [{ name: "알프라졸람", amount: "0.25~0.5mg" }] },
  { id: "ativan", brandName: "아티반정 / 로라반정", company: "일동제약/환인", category: "항불안제/신경안정", ingredients: [{ name: "로라제팜", amount: "0.5~1mg" }] },
  { id: "valium", brandName: "바륨정 (2mg / 5mg)", company: "한국로슈", category: "신경안정제", ingredients: [{ name: "디아제팜", amount: "2~5mg" }] },
  { id: "rivotril", brandName: "리보트릴정 (0.5mg)", company: "한국로슈", category: "항전간제/공황장애", ingredients: [{ name: "클로나제팜", amount: "0.5mg" }] },
  { id: "lyrica", brandName: "리리카캡슐 (75mg / 150mg)", company: "한국화이자", category: "신경병증성 통증 (처방약)", ingredients: [{ name: "프레가발린", amount: "75~150mg" }] },
  { id: "indnol", brandName: "인데놀정 (10mg / 40mg)", company: "동광제약", category: "베타차단제/면접떨림", ingredients: [{ name: "프로프라놀롤염산염", amount: "10~40mg" }] },
  { id: "concerta", brandName: "콘서타OROS서방정 (18mg / 27mg / 36mg / 54mg)", company: "한국얀센", category: "ADHD 치료제", ingredients: [{ name: "메틸페니데이트염산염", amount: "18~54mg" }] },
  { id: "lexapro", brandName: "렉사프로정 (5mg / 10mg / 20mg)", company: "한국룬드벡", category: "SSRI 항우울제", ingredients: [{ name: "에스시탈로프람옥살산염", amount: "5~20mg" }] },
  { id: "prozac", brandName: "푸로작캡슐 (20mg)", company: "한국릴리", category: "SSRI 항우울제", ingredients: [{ name: "플루옥세틴염산염", amount: "20mg" }] },
  { id: "zoloft", brandName: "졸로푸트정 (50mg / 100mg)", company: "한국비아트리스", category: "SSRI 항우울제", ingredients: [{ name: "설트랄린염산염", amount: "50mg" }] },
  { id: "cymbalta", brandName: "심발타캡슐 (30mg / 60mg)", company: "한국릴리", category: "SNRI 항우울제/신경통", ingredients: [{ name: "둘록세틴염산염", amount: "30~60mg" }] },
  { id: "paxil_cr", brandName: "팍실CR정 (12.5mg / 25mg)", company: "GSK", category: "SSRI 항우울제", ingredients: [{ name: "파록세틴염산염수화물", amount: "12.5~25mg" }] },
  { id: "effexor", brandName: "이팩사XR서방캡슐", company: "한국비아트리스", category: "SNRI 항우울제", ingredients: [{ name: "벤라팍신염산염", amount: "37.5~75mg" }] },
  { id: "enafon", brandName: "에나폰정 (10mg / 25mg)", company: "하나제약", category: "TCA 항우울제/신경통", ingredients: [{ name: "아미트리프틸린염산염", amount: "10mg" }] },
  { id: "wellbutrin", brandName: "웰부트린서방정 (150mg)", company: "GSK", category: "항우울제/금연치료", ingredients: [{ name: "부프로피온염산염", amount: "150mg" }] },
  { id: "trittico", brandName: "트리티코정 (25mg / 50mg)", company: "국제약품", category: "항우울/수면진정", ingredients: [{ name: "트라조돈염산염", amount: "25~50mg" }] },
  { id: "remeron", brandName: "레메론정 (15mg / 30mg)", company: "한국MSD", category: "항우울제", ingredients: [{ name: "미르타자핀", amount: "15~30mg" }] },
  { id: "abilify", brandName: "아빌리파이정 (2mg / 5mg / 10mg)", company: "한국오츠카", category: "항정신병/우울보조", ingredients: [{ name: "아리피프라졸", amount: "2~10mg" }] },

  // --- 식욕억제제 ---
  { id: "dietamin", brandName: "디에타민정 (나비약)", company: "대웅제약", category: "양방 식욕억제제", ingredients: [{ name: "펜터민염산염", amount: "37.5mg" }] },
  { id: "adipex", brandName: "아디펙스정", company: "광동제약", category: "양방 식욕억제제", ingredients: [{ name: "펜터민염산염", amount: "37.5mg" }] },
  { id: "puring", brandName: "푸링정", company: "알보젠코리아", category: "양방 식욕억제제", ingredients: [{ name: "펜디메트라진타르타르산염", amount: "35mg" }] },
  { id: "qsymia", brandName: "큐시미아캡슐", company: "알보젠코리아", category: "비만치료제 (복합제)", ingredients: [{ name: "펜터민염산염", amount: "3.75~15mg" }, { name: "토피라메이트", amount: "23~92mg" }] },
  { id: "contravez", brandName: "콘트라브서방정", company: "광동제약", category: "비만치료제", ingredients: [{ name: "부프로피온염산염", amount: "90mg" }, { name: "날트렉손염산염", amount: "8mg" }] },

  // --- 순환기 / 고혈압 / 당뇨 / 항응고제 ---
  { id: "norvasc", brandName: "노바스크정 (5mg / 10mg)", company: "한국비아트리스", category: "고혈압약(CCB)", ingredients: [{ name: "암로디핀베실산염", amount: "5~10mg" }] },
  { id: "kanarb", brandName: "카나브정 (60mg / 120mg)", company: "보령", category: "고혈압약(ARB)", ingredients: [{ name: "피마사르탄칼륨삼수화물", amount: "60~120mg" }] },
  { id: "cozaar", brandName: "코자정 (50mg / 100mg)", company: "한국MSD", category: "고혈압약(ARB)", ingredients: [{ name: "로사르탄칼륨", amount: "50~100mg" }] },
  { id: "micardis", brandName: "미카르디스정 (40mg / 80mg)", company: "한국베링거", category: "고혈압약(ARB)", ingredients: [{ name: "텔미사르탄", amount: "40~80mg" }] },
  { id: "diovan", brandName: "디오반정 (80mg / 160mg)", company: "한국노바티스", category: "고혈압약(ARB)", ingredients: [{ name: "발사르탄", amount: "80~160mg" }] },
  { id: "jardiance", brandName: "자디앙정 (10mg / 25mg)", company: "한국베링거", category: "당뇨병약(SGLT-2)", ingredients: [{ name: "엠파글리플로진", amount: "10~25mg" }] },
  { id: "amaryl", brandName: "아마릴정 (1mg / 2mg / 4mg)", company: "한독", category: "당뇨병약", ingredients: [{ name: "글리메피리드", amount: "1~4mg" }] },
  { id: "plavix", brandName: "플라빅스정 75mg", company: "사노피", category: "항혈소판제", ingredients: [{ name: "클로피도그렐황산수소염", amount: "75mg" }] },
  { id: "xarelto", brandName: "자렐토정 (10mg / 15mg / 20mg)", company: "바이엘", category: "항응고제", ingredients: [{ name: "리바록사반", amount: "10~20mg" }] },
  { id: "eliquis", brandName: "엘리퀴스정 (2.5mg / 5mg)", company: "BMS", category: "항응고제", ingredients: [{ name: "아픽사반", amount: "2.5~5mg" }] },
  { id: "lixiana", brandName: "릭시아나정 (15mg / 30mg / 60mg)", company: "한국다이이찌산쿄", category: "항응고제", ingredients: [{ name: "에독사반토실산염수화물", amount: "15~60mg" }] },
  { id: "coumadin", brandName: "쿠마딘정 / 와파린정", company: "제일약품", category: "항응고제", ingredients: [{ name: "와파린나트륨", amount: "2~5mg" }] },
  { id: "pletal", brandName: "프레탈정 (50mg / 100mg)", company: "한국오츠카", category: "혈전예방/말초순환 (처방약)", ingredients: [{ name: "실로스타졸", amount: "50~100mg" }] },
  { id: "diflucan", brandName: "디푸루칸캡슐 (50mg / 150mg)", company: "한국화이자", category: "항진균제 (질염/무좀)", ingredients: [{ name: "플루코나졸", amount: "50~150mg" }] },
  { id: "sporanox", brandName: "스포라녹스캡슐", company: "한국얀센", category: "항진균제 (손발톱무좀)", ingredients: [{ name: "이트라코나졸", amount: "100mg" }] }
];
