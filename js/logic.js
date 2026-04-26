// ═══════════════════════════════════════════════════════
// LOGIC — date math, gematria, phase map, stats
// ═══════════════════════════════════════════════════════
const ad   = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
const iso  = d => { const y=d.getFullYear(),mo=String(d.getMonth()+1).padStart(2,'0'),dy=String(d.getDate()).padStart(2,'0'); return `${y}-${mo}-${dy}`; };
const diff = (a,b) => Math.round((new Date(a)-new Date(b))/864e5);

// i18n-aware month / day helpers (read from translation at render time)
const gregM   = i => (t('months')||['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])[i];
const dayFull = i => (t('days')||['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])[i];

const PKEY = 'niddah_notif_v1';
const MKEY = 'tahara_minhag_v1';

const MINHAGIM = [
  {id:'ashkenaz',      labelKey:'minhagAshkenaz',      subKey:'minhagAshkenazSub'},
  {id:'sefard',        labelKey:'minhagSefard',         subKey:'minhagSefardSub'},
  {id:'chabad',        labelKey:'minhagChabad',         subKey:'minhagChabadSub'},
  {id:'teiman_baladi', labelKey:'minhagTeimanBaladi',   subKey:'minhagTeimanBaladiSub'},
  {id:'teiman_shami',  labelKey:'minhagTeimanShami',    subKey:'minhagTeimanShamiSub'},
];
const getMinhag = () => {
  try { return localStorage.getItem(MKEY) || 'ashkenaz'; }
  catch { return 'ashkenaz'; }
};
const minhagLabel = (id) => {
  const m = MINHAGIM.find(m=>m.id===id)||MINHAGIM[0];
  return t(m.labelKey);
};

const GEMATRIA_TABLE = [
  [400,'ת'],[300,'ש'],[200,'ר'],[100,'ק'],
  [90,'צ'],[80,'פ'],[70,'ע'],[60,'ס'],[50,'נ'],[40,'מ'],[30,'ל'],[20,'כ'],[10,'י'],
  [9,'ט'],[8,'ח'],[7,'ז'],[6,'ו'],[5,'ה'],[4,'ד'],[3,'ג'],[2,'ב'],[1,'א'],
];
function numToGematria(n) {
  if (!n||n<1) return '';
  let s='', r=n;
  for (const [v,l] of GEMATRIA_TABLE) { while (r>=v){s+=l;r-=v;} }
  s=s.replace(/יה$/,'טו').replace(/יו$/,'טז');
  if (s.length===1) return s+'׳';
  return s.slice(0,-1)+'״'+s.slice(-1);
}
function numToGematriaYear(n) {
  if (!n) return '';
  const thousands = Math.floor(n/1000);
  const rest = n%1000;
  const thoPart = thousands>0 ? numToGematria(thousands).replace(/[׳״]/g,'')+'׳' : '';
  let s='', r=rest;
  for (const [v,l] of GEMATRIA_TABLE) { while (r>=v){s+=l;r-=v;} }
  s=s.replace(/יה$/,'טו').replace(/יו$/,'טז');
  if (s.length>1) s=s.slice(0,-1)+'״'+s.slice(-1);
  else if (s.length===1) s=s+'׳';
  return thoPart+s;
}
function fheb(d) {
  try {
    const parts=new Intl.DateTimeFormat('he-u-ca-hebrew-nu-latn',{year:'numeric',month:'long',day:'numeric'}).formatToParts(d);
    const day=parseInt(parts.find(p=>p.type==='day')?.value||'0');
    const mon=parts.find(p=>p.type==='month')?.value||'';
    const yr=parseInt(parts.find(p=>p.type==='year')?.value||'0');
    return `${numToGematria(day)} ${mon} ${numToGematriaYear(yr)}`;
  } catch { return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; }
}
function fhebMonth(d) {
  try {
    const parts=new Intl.DateTimeFormat('he-u-ca-hebrew-nu-latn',{year:'numeric',month:'long'}).formatToParts(d);
    const mon=parts.find(p=>p.type==='month')?.value||'';
    const yr=parseInt(parts.find(p=>p.type==='year')?.value||'0');
    return `${mon} ${numToGematriaYear(yr)}`;
  } catch { return ''; }
}
function fhebDay(d) {
  try {
    const p=new Intl.DateTimeFormat('he-u-ca-hebrew-nu-latn',{day:'numeric'}).formatToParts(d);
    const x=p.find(q=>q.type==='day');
    return x ? numToGematria(parseInt(x.value)) : '';
  } catch { return ''; }
}
function getHebDayNum(d) {
  try {
    const p=new Intl.DateTimeFormat('he-u-ca-hebrew-nu-latn',{day:'numeric'}).formatToParts(d);
    const x=p.find(q=>q.type==='day');
    return x?parseInt(x.value):null;
  } catch { return null; }
}
function nextHebSameDay(from) {
  const hd=getHebDayNum(from);
  if (!hd) return ad(from,29);
  for (let i=25;i<=35;i++) if (getHebDayNum(ad(from,i))===hd) return ad(from,i);
  return ad(from,30);
}

// Labels stored as structured objects so calendar.js can translate them
// at render time via renderLabel(). Format: {key, n?}
function buildMap(cycles) {
  const map={};
  const mark=(date,type)=>{
    const k=iso(date);
    if(!map[k]) map[k]={types:new Set(),labels:[]};
    map[k].types.add(type);
  };
  const label=(date,obj)=>{
    const k=iso(date);
    if(!map[k]) map[k]={types:new Set(),labels:[]};
    const dup=map[k].labels.some(l=>l.key===obj.key&&l.n===obj.n&&l.answer===obj.answer);
    if(!dup) map[k].labels.push(obj);
  };
  // Only veset entries drive the phase logic
  const vesetCycles=cycles.filter(c=>!c.type||c.type==='veset');
  const sorted=[...vesetCycles].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const today=new Date(); today.setHours(0,0,0,0);
  sorted.forEach((c,idx)=>{
    const start=new Date(c.date);
    mark(start,'veset'); label(start,{key:'veset'});

    // ימי ראייה — open-ended until hpst is entered, next cycle, or today.
    const nextCycleStart=idx<sorted.length-1?new Date(sorted[idx+1].date):null;
    let damEnd;
    if(c.hpst) damEnd=ad(new Date(c.hpst),-1);
    else if(nextCycleStart) damEnd=ad(nextCycleStart,-1);
    else damEnd=today;
    const damCap=ad(start,60);
    if(damEnd>damCap) damEnd=damCap;
    let dayNum=2;
    for(let d=ad(start,1); d<=damEnd && dayNum<=61; d=ad(d,1)){
      mark(d,'dam');
      label(d,{key:'dam',n:dayNum});
      dayNum++;
    }

    if(c.hpst){
      const hpstDate=new Date(c.hpst);
      const sef=ad(hpstDate,1);
      const tvila=ad(hpstDate,7);
      mark(hpstDate,'hpst'); label(hpstDate,{key:'hpst'});
      for(let i=0;i<7;i++){
        mark(ad(sef,i),'sefirah');
        label(ad(sef,i),{key:'sefirah',n:i+1});
      }
      mark(tvila,'tvila'); label(tvila,{key:'tvila'});
    }

    if(idx>0){
      const gap=diff(c.date,sorted[idx-1].date);
      mark(ad(start,gap),'prisha'); label(ad(start,gap),{key:'haflagah',n:gap});
    }
    mark(ad(start,30),'prisha'); label(ad(start,30),{key:'avg_onah'});
    const monthOnah=nextHebSameDay(start);
    mark(monthOnah,'prisha'); label(monthOnah,{key:'month_onah'});
    let nextV;
    if(idx<sorted.length-1) nextV=new Date(sorted[idx+1].date);
    else if(sorted.length>=2) nextV=ad(new Date(sorted[sorted.length-1].date),diff(sorted[sorted.length-1].date,sorted[sorted.length-2].date));
    else nextV=ad(start,30);
    const ov=ad(nextV,-14);
    for(let i=-4;i<=1;i++){const fd=ad(ov,i);if(!map[iso(fd)]?.types.has('veset')){mark(fd,'fertile');if(i!==0)label(fd,{key:'fertile'});}}
    label(ov,{key:'ovulation'});
  });
  // Non-veset events: mark as simple labels on their date
  cycles.filter(c=>c.type&&c.type!=='veset').forEach(ev=>{
    const date=new Date(ev.date);
    mark(date,ev.type);
    label(date,ev.type==='sheilat_rav'?{key:'sheilat_rav',answer:ev.answer||null}:{key:ev.type});
  });
  return map;
}

function getDayPhase(types) {
  if(!types) return null;
  if(types.has('veset'))   return 'veset';
  if(types.has('dam'))     return 'dam';
  if(types.has('tvila'))   return 'tvila';
  if(types.has('hpst'))    return 'hpst';
  if(types.has('sefirah')) return 'sefirah';
  return null;
}

function computeStats(cycles) {
  const vesets=cycles.filter(c=>!c.type||c.type==='veset');
  if(vesets.length<2) return null;
  const sorted=[...vesets].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const gaps=sorted.slice(1).map((c,i)=>diff(c.date,sorted[i].date));
  const avg=gaps.reduce((a,b)=>a+b,0)/gaps.length;
  const stddev=Math.sqrt(gaps.reduce((a,b)=>a+(b-avg)**2,0)/gaps.length);
  let ws=0,wt=0; gaps.forEach((g,i)=>{ws+=g*(i+1);wt+=i+1;});
  const wavg=ws/wt;
  const nextV=ad(new Date(sorted[sorted.length-1].date),Math.round(wavg));
  const ov=ad(nextV,-14);
  const today=new Date(); today.setHours(0,0,0,0);
  const stdR=Math.round(stddev*10)/10;
  const reg=stdR<=2?'high':stdR<=5?'mid':'low';
  const damLens=sorted.map(c=>c.hpst?diff(c.hpst,c.date):null).filter(x=>x!==null&&x>0);
  const avgDamLen=damLens.length?Math.round(damLens.reduce((a,b)=>a+b,0)/damLens.length):4;
  const nextHpst=ad(nextV,avgDamLen);
  return {
    avg:Math.round(avg*10)/10, wavg:Math.round(wavg*10)/10, stddev:stdR,
    min:Math.min(...gaps), max:Math.max(...gaps), count:gaps.length,
    nextV, ov, fertStart:ad(ov,-4), fertEnd:ad(ov,1),
    reg, regKey:reg,
    get regLabel() { return t(reg==='high'?'predictRegHigh':reg==='mid'?'predictRegMid':'predictRegLow'); },
    daysUntil:diff(nextV,today),
    avgDamLen, nextHpst, hasRealDamAvg: damLens.length>0,
  };
}
