'use strict';
/*
 * 성도수첩 0.1.0 (제작: 목회자 PKM 연구소) — 성도를 위한 수첩 하나: 기도 · 감사 · 전도(접촉 기록) · 맥체인 성경읽기
 * - 기록은 모두 볼트 안 마크다운 노트에 남습니다. 인터넷·AI 호출 없음.
 * - 전도는 「누구와 접촉했는지」만 적습니다. 단계·목표·기도 연결 같은 관리 기능은 두지 않았습니다.
 * - 맥체인 본문 읽기는 「역본대조」 플러그인이 켜져 있으면 그 창으로 엽니다.
 */
const { Plugin, ItemView, Modal, Notice, PluginSettingTab, Setting, TFile, normalizePath } = require('obsidian');

// 맥체인식 성경읽기표 365일 (하루 네 본문) — 설치 파일이 main.js 하나로 충분하도록 안에 넣어 둠
const PLAN_TEXT = `
창1|마1|스1|행1
창2|마2|스2|행2
창3|마3|스3|행3
창4|마4|스4|행4
창5|마5|스5|행5
창6|마6|스6|행6
창7|마7|스7|행7
창8|마8|스8|행8
창9,창10|마9|스9|행9
창11|마10|스10|행10
창12|마11|느1|행11
창13|마12|느2|행12
창14|마13|느3|행13
창15|마14|느4|행14
창16|마15|느5|행15
창17|마16|느6|행16
창18|마17|느7|행17
창19|마18|느8|행18
창20|마19|느9|행19
창21|마20|느10|행20
창22|마21|느11|행21
창23|마22|느12|행22
창24|마23|느13|행23
창25|마24|에1|행24
창26|마25|에2|행25
창27|마26|에3|행26
창28|마27|에4|행27
창29|마28|에5|행28
창30|막1|에6|롬1
창31|막2|에7|롬2
창32|막3|에8|롬3
창33|막4|에9,에10|롬4
창34|막5|욥1|롬5
창35,창36|막6|욥2|롬6
창37|막7|욥3|롬7
창38|막8|욥4|롬8
창39|막9|욥5|롬9
창40|막10|욥6|롬10
창41|막11|욥7|롬11
창42|막12|욥8|롬12
창43|막13|욥9|롬13
창44|막14|욥10|롬14
창45|막15|욥11|롬15
창46|막16|욥12|롬16
창47|눅1:1-38|욥13|고전1
창48|눅1:39-80|욥14|고전2
창49|눅2|욥15|고전3
창50|눅3|욥16,욥17|고전4
출1|눅4|욥18|고전5
출2|눅5|욥19|고전6
출3|눅6|욥20|고전7
출4|눅7|욥21|고전8
출5|눅8|욥22|고전9
출6|눅9|욥23|고전10
출7|눅10|욥24|고전11
출8|눅11|욥25,욥26|고전12
출9|눅12|욥27|고전13
출10|눅13|욥28|고전14
출11|눅14|욥29|고전15
출12|눅15|욥30|고전16
출13|눅16|욥31|고후1
출14|눅17|욥32|고후2
출15|눅18|욥33|고후3
출16|눅19|욥34|고후4
출17|눅20|욥35|고후5
출18|눅21|욥36|고후6
출19|눅22|욥37|고후7
출20|눅23|욥38|고후8
출21|눅24|욥39|고후9
출22|요1|욥40|고후10
출23|요2|욥41|고후11
출24|요3|욥42|고후12
출25|요4|잠1|고후13
출26|요5|잠2|갈1
출27|요6|잠3|갈2
출28|요7|잠4|갈3
출29|요8|잠5|갈4
출30|요9|잠6|갈5
출31|요10|잠7|갈6
출32|요11|잠8|엡1
출33|요12|잠9|엡2
출34|요13|잠10|엡3
출35|요14|잠11|엡4
출36|요15|잠12|엡5
출37|요16|잠13|엡6
출38|요17|잠14|빌1
출39|요18|잠15|빌2
출40|요19|잠16|빌3
레1|요20|잠17|빌4
레2,레3|요21|잠18|골1
레4|시1,시2|잠19|골2
레5|시3,시4|잠20|골3
레6|시5,시6|잠21|골4
레7|시7,시8|잠22|살전1
레8|시9|잠23|살전2
레9|시10|잠24|살전3
레10|시11,시12|잠25|살전4
레11,레12|시13,시14|잠26|살전5
레13|시15,시16|잠27|살후1
레14|시17|잠28|살후2
레15|시18|잠29|살후3
레16|시19|잠30|딤전1
레17|시20,시21|잠31|딤전2
레18|시22|전1|딤전3
레19|시23,시24|전2|딤전4
레20|시25|전3|딤전5
레21|시26,시27|전4|딤전6
레22|시28,시29|전5|딤후1
레23|시30|전6|딤후2
레24|시31|전7|딤후3
레25|시32|전8|딤후4
레26|시33|전9|딛1
레27|시34|전10|딛2
민1|시35|전11|딛3
민2|시36|전12|몬1
민3|시37|아1|히1
민4|시38|아2|히2
민5|시39|아3|히3
민6|시40,시41|아4|히4
민7|시42,시43|아5|히5
민8|시44|아6|히6
민9|시45|아7|히7
민10|시46,시47|아8|히8
민11|시48|사1|히9
민12,민13|시49|사2|히10
민14|시50|사3,사4|히11
민15|시51|사5|히12
민16|시52,시53,시54|사6|히13
민17,민18|시55|사7|약1
민19|시56,시57|사8|약2
민20|시58,시59|사9|약3
민21|시60,시61|사10|약4
민22|시62,시63|사11,사12|약5
민23|시64,시65|사13|벧전1
민24|시66,시67|사14|벧전2
민25|시68|사15|벧전3
민26|시69|사16|벧전4
민27|시70,시71|사17,사18|벧전5
민28|시72|사19,사20|벧후1
민29|시73|사21|벧후2
민30|시74|사22|벧후3
민31|시75,시76|사23|요일1
민32|시77|사24|요일2
민33|시78:1-39|사25|요일3
민34|시78:40-72|사26|요일4
민35|시79|사27|요일5
민36|시80|사28|요이1
신1|시81,시82|사29|요삼1
신2|시83,시84|사30|유1
신3|시85|사31|계1
신4|시86,시87|사32|계2
신5|시88|사33|계3
신6|시89|사34|계4
신7|시90|사35|계5
신8|시91|사36|계6
신9|시92,시93|사37|계7
신10|시94|사38|계8
신11|시95,시96|사39|계9
신12|시97,시98|사40|계10
신13,신14|시99,시100,시101|사41|계11
신15|시102|사42|계12
신16|시103|사43|계13
신17|시104|사44|계14
신18|시105|사45|계15
신19|시106|사46|계16
신20|시107|사47|계17
신21|시108,시109|사48|계18
신22|시110,시111|사49|계19
신23|시112,시113|사50|계20
신24|시114,시115|사51|계21
신25|시116|사52|계22
신26|시117,시118|사53|마1
신27|시119:1-24|사54|마2
신28|시119:25-48|사55|마3
신29|시119:49-72|사56|마4
신30|시119:73-96|사57|마5
신31|시119:97-120|사58|마6
신32|시119:121-144|사59|마7
신33,신34|시119:145-176|사60|마8
수1|시120,시121,시122|사61|마9
수2|시123,시124,시125|사62|마10
수3|시126,시127,시128|사63|마11
수4|시129,시130,시131|사64|마12
수5|시132,시133,시134|사65|마13
수6|시135,시136|사66|마14
수7|시137,시138|렘1|마15
수8|시139|렘2|마16
수9|시140,시141|렘3|마17
수10|시142,시143|렘4|마18
수11|시144|렘5|마19
수12,수13|시145|렘6|마20
수14,수15|시146,시147|렘7|마21
수16,수17|시148|렘8|마22
수18,수19|시149,시150|렘9|마23
수20,수21|행1|렘10|마24
수22|행2|렘11|마25
수23|행3|렘12|마26
수24|행4|렘13|마27
삿1|행5|렘14|마28
삿2|행6|렘15|막1
삿3|행7|렘16|막2
삿4|행8|렘17|막3
삿5|행9|렘18|막4
삿6|행10|렘19|막5
삿7|행11|렘20|막6
삿8|행12|렘21|막7
삿9|행13|렘22|막8
삿10|행14|렘23|막9
삿11|행15|렘24|막10
삿12|행16|렘25|막11
삿13|행17|렘26|막12
삿14|행18|렘27|막13
삿15|행19|렘28|막14
삿16|행20|렘29|막15
삿17|행21|렘30,렘31|막16
삿18|행22|렘32|눅1
삿19|행23|렘33|눅2
삿20|행24|렘34|눅3
삿21|행25|렘35|눅4
룻1|행26|렘36|눅5
룻2|행27|렘37|눅6
룻3,룻4|행28|렘38|눅7
삼상1|롬1|렘39|눅8
삼상2|롬2|렘40|눅9
삼상3|롬3|렘41|눅10
삼상4|롬4|렘42|눅11
삼상5,삼상6|롬5|렘43|눅12
삼상7,삼상8|롬6|렘44,렘45|눅13
삼상9|롬7|렘46|눅14
삼상10|롬8|렘47|눅15
삼상11|롬9|렘48|눅16
삼상12|롬10|렘49|눅17
삼상13|롬11|렘50|눅18
삼상14|롬12|렘51|눅19
삼상15|롬13|렘52|눅20
삼상16|롬14|애1|눅21
삼상17|롬15|애2|눅22
삼상18|롬16|애3|눅23
삼상19|고전1|애4|눅24
삼상20|고전2|애5|요1
삼상21,삼상22|고전3|겔1|요2
삼상23|고전4|겔2|요3
삼상24|고전5|겔3|요4
삼상25|고전6|겔4|요5
삼상26|고전7|겔5|요6
삼상27|고전8|겔6|요7
삼상28|고전9|겔7|요8
삼상29,삼상30|고전10|겔8|요9
삼상31|고전11|겔9|요10
삼하1|고전12|겔10|요11
삼하2|고전13|겔11|요12
삼하3|고전14|겔12|요13
삼하4,삼하5|고전15|겔13|요14
삼하6|고전16|겔14|요15
삼하7|고후1|겔15|요16
삼하8,삼하9|고후2|겔16|요17
삼하10|고후3|겔17|요18
삼하11|고후4|겔18|요19
삼하12|고후5|겔19|요20
삼하13|고후6|겔20|요21
삼하14|고후7|겔21|시1,시2
삼하15|고후8|겔22|시3,시4
삼하16|고후9|겔23|시5,시6
삼하17|고후10|겔24|시7,시8
삼하18|고후11|겔25|시9
삼하19|고후12|겔26|시10
삼하20|고후13|겔27|시11,시12
삼하21|갈1|겔28|시13,시14
삼하22|갈2|겔29|시15,시16
삼하23|갈3|겔30|시17
삼하24|갈4|겔31|시18
왕상1|갈5|겔32|시19
왕상2|갈6|겔33|시20,시21
왕상3|엡1|겔34|시22
왕상4,왕상5|엡2|겔35|시23,시24
왕상6|엡3|겔36|시25
왕상7|엡4|겔37|시26,시27
왕상8|엡5|겔38|시28,시29
왕상9|엡6|겔39|시30
왕상10|빌1|겔40|시31
왕상11|빌2|겔41|시32
왕상12|빌3|겔42|시33
왕상13|빌4|겔43|시34
왕상14|골1|겔44|시35
왕상15|골2|겔45|시36
왕상16|골3|겔46|시37
왕상17|골4|겔47|시38
왕상18|살전1|겔48|시39
왕상19|살전2|단1|시40,시41
왕상20|살전3|단2|시42,시43
왕상21|살전4|단3|시44
왕상22|살전5|단4|시45
왕하1|살후1|단5|시46,시47
왕하2|살후2|단6|시48
왕하3|살후3|단7|시49
왕하4|딤전1|단8|시50
왕하5|딤전2|단9|시51
왕하6|딤전3|단10|시52,시53,시54
왕하7|딤전4|단11|시55
왕하8|딤전5|단12|시56,시57
왕하9|딤전6|호1|시58,시59
왕하10,왕하11|딤후1|호2|시60,시61
왕하12|딤후2|호3,호4|시62,시63
왕하13|딤후3|호5,호6|시64,시65
왕하14|딤후4|호7|시66,시67
왕하15|딛1|호8|시68
왕하16|딛2|호9|시69
왕하17|딛3|호10|시70,시71
왕하18|몬1|호11|시72
왕하19|히1|호12|시73
왕하20|히2|호13|시74
왕하21|히3|호14|시75,시76
왕하22|히4|욜1|시77
왕하23|히5|욜2|시78
왕하24|히6|욜3|시79
왕하25|히7|암1|시80
대상1,대상2|히8|암2|시81,시82
대상3,대상4|히9|암3|시83,시84
대상5,대상6|히10|암4|시85
대상7,대상8|히11|암5|시86
대상9,대상10|히12|암6|시87,시88
대상11,대상12|히13|암7|시89
대상13,대상14|약1|암8|시90
대상15|약2|암9|시91
대상16|약3|옵1|시92,시93
대상17|약4|욘1|시94
대상18|약5|욘2|시95,시96
대상19,대상20|벧전1|욘3|시97,시98
대상21|벧전2|욘4|시99,시100,시101
대상22|벧전3|미1|시102
대상23|벧전4|미2|시103
대상24,대상25|벧전5|미3|시104
대상26,대상27|벧후1|미4|시105
대상28|벧후2|미5|시106
대상29|벧후3|미6|시107
대하1|요일1|미7|시108,시109
대하2|요일2|나1|시110,시111
대하3,대하4|요일3|나2|시112,시113
대하5|요일4|나3|시114,시115
대하6|요일5|합1|시116
대하7|요이1|합2|시117,시118
대하8|요삼1|합3|시119:1-24
대하9|유1|습1|시119:25-48
대하10|계1|습2|시119:49-72
대하11,대하12|계2|습3|시119:73-96
대하13|계3|학1|시119:97-120
대하14,대하15|계4|학2|시119:121-144
대하16|계5|슥1|시119:145-176
대하17|계6|슥2|시120,시121,시122
대하18|계7|슥3|시123,시124,시125
대하19,대하20|계8|슥4|시126,시127,시128
대하21|계9|슥5|시129,시130,시131
대하22,대하23|계10|슥6|시132,시133,시134
대하24|계11|슥7|시135,시136
대하25|계12|슥8|시137,시138
대하26|계13|슥9|시139
대하27,대하28|계14|슥10|시140,시141
대하29|계15|슥11|시142
대하30|계16|슥12|시143
대하31|계17|슥13|시144
대하32|계18|슥14|시145
대하33|계19|말1|시146,시147
대하34|계20|말2|시148
대하35|계21|말3|시149
대하36|계22|말4|시150
`;
const PLAN = { v: 1, days: PLAN_TEXT.trim().split('\n').map((l) => l.split('|').map((c) => c.split(','))) };

const VIEW = 'seongdo-notebook-view';
const DEFAULTS = { root: '성도수첩', thanksGoal: 5, methods: '만남,통화,메시지,식사,선물,기도,초대,기타', mcheyneDone: {} };

const pad = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dateKey(new Date());
const safeName = (s) => String(s).replace(/[\\/:*?"<>|#^\[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);

/* ---------- 맥체인 ---------- */
const BOOKS = {
  창: '창세기', 출: '출애굽기', 레: '레위기', 민: '민수기', 신: '신명기', 수: '여호수아', 삿: '사사기', 룻: '룻기',
  삼상: '사무엘상', 삼하: '사무엘하', 왕상: '열왕기상', 왕하: '열왕기하', 대상: '역대상', 대하: '역대하',
  스: '에스라', 느: '느헤미야', 에: '에스더', 욥: '욥기', 시: '시편', 잠: '잠언', 전: '전도서', 아: '아가',
  사: '이사야', 렘: '예레미야', 애: '예레미야애가', 겔: '에스겔', 단: '다니엘', 호: '호세아', 욜: '요엘',
  암: '아모스', 옵: '오바댜', 욘: '요나', 미: '미가', 나: '나훔', 합: '하박국', 습: '스바냐', 학: '학개',
  슥: '스가랴', 말: '말라기', 마: '마태복음', 막: '마가복음', 눅: '누가복음', 요: '요한복음', 행: '사도행전',
  롬: '로마서', 고전: '고린도전서', 고후: '고린도후서', 갈: '갈라디아서', 엡: '에베소서', 빌: '빌립보서',
  골: '골로새서', 살전: '데살로니가전서', 살후: '데살로니가후서', 딤전: '디모데전서', 딤후: '디모데후서',
  딛: '디도서', 몬: '빌레몬서', 히: '히브리서', 약: '야고보서', 벧전: '베드로전서', 벧후: '베드로후서',
  요일: '요한일서', 요이: '요한이서', 요삼: '요한삼서', 유: '유다서', 계: '요한계시록',
};
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
function planDay(d) {
  let doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  if (isLeap(d.getFullYear()) && doy >= 60) doy -= 1; // 윤년 2/29는 28일 본문을 한 번 더
  return Math.min(365, Math.max(1, doy));
}
function monthDay(day) {
  const dm = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let m = 0, left = day;
  while (m < 11 && left > dm[m]) { left -= dm[m]; m++; }
  return `${m + 1}월 ${left}일`;
}
function refLabel(ref) {
  const m = /^([가-힣]+)(\d+)(?::(\d+-\d+))?$/.exec(ref);
  if (!m) return ref;
  const book = BOOKS[m[1]] || m[1];
  const unit = m[1] === '시' ? '편' : '장';
  return m[3] ? `${book} ${m[2]}${unit} ${m[3]}절` : `${book} ${m[2]}${unit}`;
}
const refQuery = (ref) => ref.replace(/^([가-힣]+)(\d+)/, '$1 $2');

/* ---------- 입력 모달 ---------- */
class FormModal extends Modal {
  // fields: [{key,label,type:'text'|'area'|'select',value,options}]
  constructor(app, title, fields, onSubmit) {
    super(app);
    this.title = title; this.fields = fields; this.onSubmit = onSubmit; this.vals = {};
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: this.title });
    this.fields.forEach((f) => {
      this.vals[f.key] = f.value || '';
      contentEl.createEl('div', { text: f.label, cls: 'sd-meta' });
      let el;
      if (f.type === 'area') el = contentEl.createEl('textarea', { cls: 'sd-input' });
      else if (f.type === 'select') {
        el = contentEl.createEl('select', { cls: 'sd-input' });
        f.options.forEach((o) => el.createEl('option', { text: o, value: o }));
        if (!this.vals[f.key]) this.vals[f.key] = f.options[0];
      } else el = contentEl.createEl('input', { type: 'text', cls: 'sd-input' });
      el.value = this.vals[f.key];
      el.oninput = el.onchange = () => { this.vals[f.key] = el.value; };
      if (f.type === 'area') el.rows = 3;
    });
    const row = contentEl.createDiv({ cls: 'sd-actions' });
    row.createEl('button', { text: '저장', cls: 'mod-cta' }).onclick = async () => { const ok = await this.onSubmit(this.vals); if (ok !== false) this.close(); };
    row.createEl('button', { text: '취소' }).onclick = () => this.close();
  }
  onClose() { this.contentEl.empty(); }
}

/* ---------- 기도 모드 ---------- */
class PrayModal extends Modal {
  constructor(app, plugin, cards) { super(app); this.plugin = plugin; this.cards = cards; this.i = 0; }
  onOpen() { this.render(); }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    if (!this.cards.length) { contentEl.createDiv({ cls: 'sd-empty', text: '기도 중인 제목이 없습니다.' }); return; }
    if (this.i >= this.cards.length) {
      contentEl.createDiv({ cls: 'sd-pray' }).createDiv({ cls: 'sd-big', text: '🙏 오늘 기도를 마쳤습니다. 아멘.' });
      contentEl.createEl('button', { text: '닫기' }).onclick = () => this.close();
      return;
    }
    const c = this.cards[this.i];
    const box = contentEl.createDiv({ cls: 'sd-pray' });
    box.createDiv({ cls: 'sd-meta', text: `${this.i + 1} / ${this.cards.length}` });
    box.createDiv({ cls: 'sd-big', text: c.title });
    if (c.body) box.createDiv({ cls: 'sd-body', text: c.body });
    const row = box.createDiv({ cls: 'sd-actions' });
    row.style.justifyContent = 'center';
    row.createEl('button', { text: '🙏 기도했습니다', cls: 'mod-cta' }).onclick = async () => { await this.plugin.markPrayed(c.file); this.i++; this.render(); };
    row.createEl('button', { text: '다음 ▶' }).onclick = () => { this.i++; this.render(); };
  }
  onClose() { this.contentEl.empty(); }
}

/* ---------- 본 화면 ---------- */
class SeongdoView extends ItemView {
  constructor(leaf, plugin) { super(leaf); this.plugin = plugin; this.tab = '기도'; this.filter = '기도 중'; this.readDay = planDay(new Date()); this.readDate = today(); }
  getViewType() { return VIEW; }
  getDisplayText() { return '성도수첩'; }
  getIcon() { return 'book-heart'; }
  async onOpen() { await this.render(); }
  async render() {
    const root = this.contentEl;
    root.empty();
    root.addClass('sd-view');
    ['기도', '감사', '전도', '성경읽기'].forEach((k) => root.removeClass('sd-t-' + k));
    root.addClass('sd-t-' + this.tab);
    const tabs = root.createDiv({ cls: 'sd-tabs' });
    [['기도', '🙏 기도'], ['감사', '☀️ 감사'], ['전도', '👣 전도'], ['성경읽기', '📖 성경읽기']].forEach(([k, t]) => {
      const b = tabs.createEl('button', { text: t });
      if (this.tab === k) b.addClass('is-active');
      b.onclick = () => { this.tab = k; this.render(); };
    });
    if (this.tab === '기도') await this.renderPrayer(root);
    else if (this.tab === '감사') await this.renderThanks(root);
    else if (this.tab === '전도') await this.renderContacts(root);
    else this.renderReading(root);
    root.createDiv({ cls: 'sd-credit', text: '성도수첩 · 만든 곳 목회자 PKM 연구소' });
  }

  async renderPrayer(root) {
    const P = this.plugin;
    const head = root.createDiv({ cls: 'sd-head' });
    head.createEl('h3', { text: '기도수첩' });
    head.createEl('button', { text: '＋ 새 기도제목' }).onclick = () => P.newPrayer(() => this.render());
    head.createEl('button', { text: '🙏 기도 모드' }).onclick = () => P.openPrayMode();
    const sel = root.createDiv({ cls: 'sd-tabs' });
    ['기도 중', '응답', '전체'].forEach((f) => {
      const b = sel.createEl('button', { text: f });
      if (this.filter === f) b.addClass('is-active');
      b.onclick = () => { this.filter = f; this.render(); };
    });
    let list = P.prayers();
    if (this.filter === '기도 중') list = list.filter((c) => c.status !== '응답');
    else if (this.filter === '응답') list = list.filter((c) => c.status === '응답');
    if (!list.length) { root.createDiv({ cls: 'sd-empty', text: this.filter === '응답' ? '아직 응답 기록이 없습니다.' : '기도제목이 없습니다. 「＋ 새 기도제목」으로 시작하세요.' }); return; }
    list.forEach((c) => {
      const card = root.createDiv({ cls: 'sd-card' });
      card.createDiv({ cls: 'sd-title', text: (c.status === '응답' ? '✅ ' : '') + c.title });
      if (c.status === '응답') card.addClass('is-answered');
      const meta = c.status === '응답' ? `응답 ${c.answered || ''}` : `기도 ${c.count}번${c.last ? ' · 마지막 ' + c.last : ''}`;
      card.createDiv({ cls: 'sd-meta', text: meta });
      if (c.body) card.createDiv({ cls: 'sd-meta', text: c.body.split('\n')[0] });
      const row = card.createDiv({ cls: 'sd-actions' });
      if (c.status !== '응답') {
        row.createEl('button', { text: '🙏 기도했습니다' }).onclick = async () => { await P.markPrayed(c.file); this.render(); };
        row.createEl('button', { text: '✅ 응답 기록' }).onclick = () => P.answerPrayer(c, () => this.render());
      }
      row.createEl('button', { text: '노트 열기' }).onclick = () => P.app.workspace.getLeaf(false).openFile(c.file);
    });
  }

  async renderThanks(root) {
    const P = this.plugin;
    const items = await P.thanksOf(today());
    const goal = P.settings.thanksGoal;
    const head = root.createDiv({ cls: 'sd-head' });
    head.createEl('h3', { text: '감사수첩' });
    const s = await P.thanksStats();
    head.createSpan({ cls: 'sd-meta', text: `연속 ${s.streak}일 · 이번 달 ${s.month}일 · 모두 ${s.total}일` });
    const prog = root.createDiv({ cls: 'sd-progress' });
    prog.createDiv({ cls: 'sd-progress-bar' }).style.width = `${Math.min(100, Math.round((items.length / goal) * 100))}%`;
    root.createDiv({ cls: 'sd-meta', text: `오늘 ${items.length} / ${goal}가지${items.length >= goal ? ' 🎉' : ''}` });
    const input = root.createEl('input', { type: 'text', cls: 'sd-input' });
    input.placeholder = '오늘 감사한 일 한 가지';
    const add = async () => { const v = input.value.trim(); if (!v) return; await P.addThanks(v); this.render(); };
    input.onkeydown = (e) => { if (e.key === 'Enter') add(); };
    root.createEl('button', { text: '적기', cls: 'mod-cta' }).onclick = add;
    items.forEach((t, i) => root.createDiv({ cls: 'sd-card sd-thank', text: `${i + 1}. ${t}` }));
    const past = await P.pastThanks(3);
    if (past.length) {
      root.createEl('h4', { text: '지난 감사 돌아보기' });
      past.forEach((p) => root.createDiv({ cls: 'sd-meta', text: `${p.date} · ${p.text}` }));
    }
  }

  async renderContacts(root) {
    const P = this.plugin;
    const head = root.createDiv({ cls: 'sd-head' });
    head.createEl('h3', { text: '전도수첩 — 접촉 기록' });
    head.createEl('button', { text: '＋ 접촉 기록' }).onclick = () => P.newContact(() => this.render());
    root.createDiv({ cls: 'sd-meta', text: '내가 누구를 만났는지만 적습니다. 연락처·주소·민감한 사정은 적지 마세요.' });
    const rows = await P.contacts();
    if (!rows.length) { root.createDiv({ cls: 'sd-empty', text: '아직 기록이 없습니다.' }); return; }
    const byName = new Map();
    rows.forEach((r) => { const o = byName.get(r.name) || { name: r.name, count: 0, last: r.date, lastRow: r }; o.count++; if (r.date >= o.last) { o.last = r.date; o.lastRow = r; } byName.set(r.name, o); });
    const people = [...byName.values()].sort((a, b) => (a.last < b.last ? 1 : -1));
    root.createEl('h4', { text: `만난 분 ${people.length}명` });
    people.forEach((p) => {
      const card = root.createDiv({ cls: 'sd-card' });
      card.createDiv({ cls: 'sd-title', text: p.name });
      card.createDiv({ cls: 'sd-meta', text: `${p.count}번 · 마지막 ${p.last} (${daysBetween(p.last, today())}일 전) · ${p.lastRow.method}` });
      card.createDiv({ cls: 'sd-actions' }).createEl('button', { text: '＋ 또 만남' }).onclick = () => P.newContact(() => this.render(), p.name);
    });
    root.createEl('h4', { text: '최근 기록' });
    rows.slice(0, 15).forEach((r) => root.createDiv({ cls: 'sd-meta', text: `${r.date} · ${r.name} · ${r.method}${r.memo ? ' · ' + r.memo : ''}` }));
  }

  renderReading(root) {
    const P = this.plugin;
    root.createDiv({ cls: 'sd-head' }).createEl('h3', { text: '맥체인 성경읽기' });
    if (!P.plan) { root.createDiv({ cls: 'sd-empty', text: '읽기표를 읽지 못했습니다.' }); return; }
    const nav = root.createDiv({ cls: 'sd-head' });
    nav.createEl('button', { text: '◀' }).onclick = () => this.moveRead(-1);
    nav.createSpan({ text: ` ${this.readDay}일차 · ${monthDay(this.readDay)}${this.readDate === today() ? ' (오늘)' : ''} ` });
    nav.createEl('button', { text: '▶' }).onclick = () => this.moveRead(1);
    if (this.readDate !== today()) nav.createEl('button', { text: '오늘' }).onclick = () => { this.readDay = planDay(new Date()); this.readDate = today(); this.render(); };
    const done = P.settings.mcheyneDone[this.readDate] || [false, false, false, false];
    P.plan.days[this.readDay - 1].forEach((cell, i) => {
      const row = root.createDiv({ cls: 'sd-read-row' });
      const cb = row.createEl('input', { type: 'checkbox' });
      cb.checked = !!done[i];
      cb.onchange = async () => { await P.setRead(this.readDate, i, cb.checked); this.render(); };
      row.createSpan({ text: ['①', '②', '③', '④'][i] });
      cell.forEach((ref) => { row.createEl('button', { text: refLabel(ref) }).onclick = () => P.openReader(ref); });
    });
    const s = P.readStats();
    root.createDiv({ cls: 'sd-foot', text: done.every(Boolean) ? '✅ 오늘 네 본문을 모두 읽었습니다.' : '본문 이름을 누르면 역본대조 창에 열립니다. 읽은 뒤 칸을 체크하세요.' });
    root.createDiv({ cls: 'sd-foot', text: `올해 모두 읽은 날 ${s.year}일 · 연속 ${s.streak}일` });
  }
  moveRead(delta) {
    const d = new Date(this.readDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    this.readDate = dateKey(d); this.readDay = planDay(d);
    this.render();
  }
}

module.exports = class SeongdoNotebookPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, (await this.loadData()) || {});
    this.settings.mcheyneDone = this.settings.mcheyneDone || {};
    this.plan = PLAN;
    this.registerView(VIEW, (leaf) => new SeongdoView(leaf, this));
    this.addRibbonIcon('book-heart', '성도수첩', () => this.activateView());
    this.addCommand({ id: 'open', name: '성도수첩 열기', callback: () => this.activateView() });
    this.addCommand({ id: 'new-prayer', name: '새 기도제목', callback: () => this.newPrayer() });
    this.addCommand({ id: 'pray-mode', name: '기도 모드', callback: () => this.openPrayMode() });
    this.addCommand({ id: 'add-thanks', name: '오늘 감사 적기', callback: () => new FormModal(this.app, '오늘 감사', [{ key: 'v', label: '한 줄에 하나씩 적으세요', type: 'area' }], async (v) => { const lines = v.v.split('\n').map((x) => x.trim()).filter(Boolean); for (const l of lines) await this.addThanks(l); this.refresh(); }).open() });
    this.addCommand({ id: 'new-contact', name: '접촉 기록 남기기', callback: () => this.newContact() });
    this.addCommand({ id: 'mcheyne', name: '오늘 성경읽기 (맥체인)', callback: async () => { await this.activateView('성경읽기'); } });
    this.addSettingTab(new SeongdoSettings(this.app, this));
  }

  async activateView(tab) {
    let leaf = this.app.workspace.getLeavesOfType(VIEW)[0];
    if (!leaf) { leaf = this.app.workspace.getLeaf(true); await leaf.setViewState({ type: VIEW, active: true }); }
    this.app.workspace.revealLeaf(leaf);
    if (tab && leaf.view) { leaf.view.tab = tab; await leaf.view.render(); }
  }
  refresh() { this.app.workspace.getLeavesOfType(VIEW).forEach((l) => l.view && l.view.render && l.view.render()); }
  async save() { await this.saveData(this.settings); }

  /* ----- 파일 도우미 ----- */
  dir(sub) { return normalizePath(`${this.settings.root}/${sub}`); }
  async ensureFolder(path) {
    const parts = normalizePath(path).split('/');
    let cur = '';
    for (const p of parts) {
      cur = cur ? `${cur}/${p}` : p;
      if (!this.app.vault.getAbstractFileByPath(cur)) { try { await this.app.vault.createFolder(cur); } catch (e) { /* 이미 있음 */ } }
    }
  }
  async uniquePath(folder, base) {
    let p = normalizePath(`${folder}/${base}.md`), n = 2;
    while (this.app.vault.getAbstractFileByPath(p)) p = normalizePath(`${folder}/${base} ${n++}.md`);
    return p;
  }
  fm(file) { const c = this.app.metadataCache.getFileCache(file); return (c && c.frontmatter) || {}; }

  /* ----- 기도 ----- */
  prayers() {
    const f = this.app.vault.getAbstractFileByPath(this.dir('기도'));
    if (!f || !f.children) return [];
    return f.children.filter((x) => x instanceof TFile && x.extension === 'md').map((file) => {
      const m = this.fm(file);
      return { file, title: file.basename, status: m['상태'] || '기도중', count: Number(m['기도횟수']) || 0, last: m['마지막기도일'] || '', answered: m['응답일'] || '', body: m['내용'] || '' };
    }).sort((a, b) => (a.last < b.last ? -1 : a.last > b.last ? 1 : 0));
  }
  newPrayer(done) {
    new FormModal(this.app, '새 기도제목', [{ key: 'title', label: '기도제목', type: 'text' }, { key: 'body', label: '내용 (선택)', type: 'area' }], async (v) => {
      const t = safeName(v.title);
      if (!t) { new Notice('기도제목을 적어 주세요.'); return false; }
      await this.ensureFolder(this.dir('기도'));
      const path = await this.uniquePath(this.dir('기도'), t);
      const body = (v.body || '').trim().replace(/\n+/g, ' ');
      await this.app.vault.create(path, ['---', 'type: 기도제목', '상태: 기도중', `시작일: ${today()}`, '마지막기도일: ""', '기도횟수: 0', '응답일: ""', `내용: ${JSON.stringify(body)}`, 'tags: [성도수첩]', '---', '', `# ${t}`, '', '## 응답 기록', ''].join('\n'));
      this.refresh(); if (done) done();
    }).open();
  }
  async markPrayed(file) {
    await this.app.fileManager.processFrontMatter(file, (m) => { m['기도횟수'] = (Number(m['기도횟수']) || 0) + 1; m['마지막기도일'] = today(); });
  }
  answerPrayer(c, done) {
    new FormModal(this.app, `응답 기록 — ${c.title}`, [{ key: 'v', label: '어떻게 응답해 주셨습니까?', type: 'area' }], async (v) => {
      await this.app.fileManager.processFrontMatter(c.file, (m) => { m['상태'] = '응답'; m['응답일'] = today(); });
      const txt = await this.app.vault.read(c.file);
      await this.app.vault.modify(c.file, txt.replace(/\s*$/, '') + `\n- ${today()} ${(v.v || '').trim()}\n`);
      this.refresh(); if (done) done();
    }).open();
  }
  openPrayMode() {
    const cards = this.prayers().filter((c) => c.status !== '응답');
    new PrayModal(this.app, this, cards).open();
  }

  /* ----- 감사 ----- */
  thanksPath(d) { return normalizePath(`${this.dir('감사')}/${d}.md`); }
  async thanksOf(d) {
    const f = this.app.vault.getAbstractFileByPath(this.thanksPath(d));
    if (!(f instanceof TFile)) return [];
    return (await this.app.vault.read(f)).split('\n').filter((l) => /^- /.test(l)).map((l) => l.slice(2).trim());
  }
  async addThanks(text) {
    const p = this.thanksPath(today());
    await this.ensureFolder(this.dir('감사'));
    const f = this.app.vault.getAbstractFileByPath(p);
    if (f instanceof TFile) { const t = await this.app.vault.read(f); await this.app.vault.modify(f, t.replace(/\s*$/, '') + `\n- ${text}\n`); }
    else await this.app.vault.create(p, `---\ntype: 감사\ntags: [성도수첩]\n---\n\n# ${today()} 감사\n\n- ${text}\n`);
  }
  thanksDates() {
    const f = this.app.vault.getAbstractFileByPath(this.dir('감사'));
    if (!f || !f.children) return [];
    return f.children.filter((x) => x instanceof TFile && /^\d{4}-\d{2}-\d{2}$/.test(x.basename)).map((x) => x.basename).sort();
  }
  async thanksStats() {
    const dates = []; // 실제로 한 줄 이상 적은 날만
    for (const d of this.thanksDates()) if ((await this.thanksOf(d)).length) dates.push(d);
    const set = new Set(dates);
    let streak = 0; const c = new Date();
    if (!set.has(dateKey(c))) c.setDate(c.getDate() - 1);
    while (set.has(dateKey(c))) { streak++; c.setDate(c.getDate() - 1); }
    const ym = today().slice(0, 7);
    return { streak, month: dates.filter((d) => d.startsWith(ym)).length, total: dates.length };
  }
  async pastThanks(n) {
    const dates = this.thanksDates().filter((d) => d !== today());
    const all = [];
    for (const d of dates) for (const t of await this.thanksOf(d)) all.push({ date: d, text: t });
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    return all.slice(0, n);
  }

  /* ----- 전도: 접촉 기록 (누구와 접촉했는지만) ----- */
  contactPath() { return normalizePath(`${this.settings.root}/접촉 기록.md`); }
  async contacts() {
    const f = this.app.vault.getAbstractFileByPath(this.contactPath());
    if (!(f instanceof TFile)) return [];
    const rows = [];
    (await this.app.vault.read(f)).split('\n').forEach((l) => {
      const m = /^- (\d{4}-\d{2}-\d{2}) · ([^·]+?) · ([^·]+?)(?: · (.*))?$/.exec(l.trim());
      if (m) rows.push({ date: m[1], name: m[2].trim(), method: m[3].trim(), memo: (m[4] || '').trim() });
    });
    return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }
  newContact(done, name) {
    const methods = this.settings.methods.split(',').map((s) => s.trim()).filter(Boolean);
    new FormModal(this.app, '접촉 기록', [
      { key: 'name', label: '누구와 (이름)', type: 'text', value: name || '' },
      { key: 'date', label: '날짜', type: 'text', value: today() },
      { key: 'method', label: '어떻게', type: 'select', options: methods.length ? methods : ['만남'] },
      { key: 'memo', label: '한 줄 메모 (선택)', type: 'text' },
    ], async (v) => {
      const n = safeName(v.name).replace(/·/g, ' ');
      if (!n) { new Notice('이름을 적어 주세요.'); return false; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) { new Notice('날짜는 2026-11-24 처럼 적어 주세요.'); return false; }
      const line = `- ${v.date} · ${n} · ${v.method.replace(/·/g, ' ')}${v.memo.trim() ? ' · ' + v.memo.trim().replace(/[\n·]/g, ' ') : ''}`;
      await this.ensureFolder(this.settings.root);
      const p = this.contactPath();
      const f = this.app.vault.getAbstractFileByPath(p);
      if (f instanceof TFile) { const t = await this.app.vault.read(f); await this.app.vault.modify(f, t.replace(/\s*$/, '') + `\n${line}\n`); }
      else await this.app.vault.create(p, `---\ntype: 접촉기록\ntags: [성도수첩]\n---\n\n# 접촉 기록\n\n> 한 줄 형식: \`- 날짜 · 이름 · 방법 · 메모\`\n\n${line}\n`);
      this.refresh(); if (done) done();
    }).open();
  }

  /* ----- 맥체인 ----- */
  openReader(ref) {
    const btc = this.app.plugins && this.app.plugins.plugins && this.app.plugins.plugins['bible-translation-compare'];
    if (!btc || typeof btc.openWith !== 'function') { new Notice('「역본대조」 플러그인이 켜져 있어야 본문을 읽을 수 있습니다.'); return; }
    btc.openWith(refQuery(ref));
  }
  async setRead(d, i, v) {
    const a = this.settings.mcheyneDone[d] || [false, false, false, false];
    a[i] = v;
    if (a.some(Boolean)) this.settings.mcheyneDone[d] = a; else delete this.settings.mcheyneDone[d];
    await this.save();
  }
  readStats() {
    const full = (k) => (this.settings.mcheyneDone[k] || []).filter(Boolean).length === 4;
    const now = new Date(), y = String(now.getFullYear());
    const year = Object.keys(this.settings.mcheyneDone).filter((k) => k.startsWith(y) && full(k)).length;
    let streak = 0; const d = new Date(now);
    if (!full(dateKey(d))) d.setDate(d.getDate() - 1);
    while (full(dateKey(d))) { streak++; d.setDate(d.getDate() - 1); }
    return { year, streak };
  }
};

class SeongdoSettings extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const S = this.plugin.settings;
    containerEl.createEl('p', { cls: 'sd-credit', text: '성도수첩 0.1.0 · 제작 목회자 PKM 연구소 (주명철) · pkm-institute.netlify.app' });
    new Setting(containerEl).setName('성도수첩 폴더').setDesc('기도·감사·접촉 기록 노트가 쌓이는 폴더 (볼트 안)').addText((t) => t.setValue(S.root).onChange(async (v) => { S.root = v.trim() || DEFAULTS.root; await this.plugin.save(); }));
    new Setting(containerEl).setName('하루 감사 목표').addText((t) => t.setValue(String(S.thanksGoal)).onChange(async (v) => { S.thanksGoal = Math.max(1, parseInt(v, 10) || DEFAULTS.thanksGoal); await this.plugin.save(); }));
    new Setting(containerEl).setName('접촉 방법 목록').setDesc('쉼표로 구분').addText((t) => t.setValue(S.methods).onChange(async (v) => { S.methods = v; await this.plugin.save(); }));
  }
}
