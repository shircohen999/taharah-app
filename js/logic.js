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
// at render time via renderLabel(). Format: {key, n?, answer?, subtype?}
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
    const dup=map[k].labels.some(l=>l.key===obj.key&&l.n===obj.n&&l.answer===obj.answer&&l.subtype===obj.subtype);
    if(!dup) map[k].labels.push(obj);
  };
  const today=new Date(); today.setHours(0,0,0,0);

  // Veset cycles (drive prisha + fertile window logic)
  const vesetCycles=cycles.filter(c=>!c.type||c.type==='veset');
  const sortedVesets=[...vesetCycles].sort((a,b)=>new Date(a.date)-new Date(b.date));

  // Non-veset events that trigger a dam cycle
  const NON_VESET_TRIGGERS=['kesem','bedika_lo_nekia','lida','hapala'];
  const nonVesetDamCycles=cycles.filter(c=>
    NON_VESET_TRIGGERS.includes(c.type)||
    (c.type==='bedika_rofea'&&c.answer==='tamea')||
    (c.type==='sheilat_rav'&&c.answer==='tamea')
  );

  // All dam-trigger dates sorted (used to cap dam extension at next trigger)
  const allDamTriggerDates=[
    ...sortedVesets.map(c=>c.date),
    ...nonVesetDamCycles.map(c=>c.date),
  ].filter((v,i,a)=>a.indexOf(v)===i).sort();

  // Returns end-of-dam date for a trigger starting at startDate with optional ownHpst
  const getDamEnd=(startDate,ownHpst)=>{
    if(ownHpst) return ad(new Date(ownHpst),-1);
    const startIso=iso(startDate);
    const nextTrigger=allDamTriggerDates.find(d=>d>startIso);
    const rawEnd=nextTrigger?ad(new Date(nextTrigger),-1):today;
    const cap=ad(startDate,60);
    return rawEnd<cap?rawEnd:cap;
  };

  // Marks dam + optional hpst/sefirah/tvila for any dam trigger
  const applyDamCycle=(startDate,ownHpst,skipDamOnVeset,startDayNum=2)=>{
    const damEnd=getDamEnd(startDate,ownHpst);
    let dayNum=startDayNum;
    for(let d=ad(startDate,1);d<=damEnd&&dayNum<=61;d=ad(d,1)){
      const k=iso(d);
      if(skipDamOnVeset&&map[k]?.types.has('veset')) {dayNum++;continue;}
      mark(d,'dam'); label(d,{key:'dam',n:dayNum}); dayNum++;
    }
    if(ownHpst){
      const hpstDate=new Date(ownHpst);
      const sef=ad(hpstDate,1);
      const tvila=ad(hpstDate,7);
      mark(hpstDate,'hpst'); label(hpstDate,{key:'hpst'});
      for(let i=0;i<7;i++){mark(ad(sef,i),'sefirah');label(ad(sef,i),{key:'sefirah',n:i+1});}
      mark(tvila,'tvila'); label(tvila,{key:'tvila'});
    }
  };

  // Process veset cycles: mark start, dam cycle, prisha, fertile window
  sortedVesets.forEach((c,idx)=>{
    const start=new Date(c.date);
    mark(start,'veset'); label(start,{key:'veset'});
    applyDamCycle(start,c.hpst,false);

    if(idx>0){
      const gap=diff(c.date,sortedVesets[idx-1].date);
      mark(ad(start,gap),'prisha'); label(ad(start,gap),{key:'haflagah',n:gap});
    }
    mark(ad(start,30),'prisha'); label(ad(start,30),{key:'avg_onah'});
    mark(nextHebSameDay(start),'prisha'); label(nextHebSameDay(start),{key:'month_onah'});

    let nextV;
    if(idx<sortedVesets.length-1) nextV=new Date(sortedVesets[idx+1].date);
    else if(sortedVesets.length>=2) nextV=ad(new Date(sortedVesets[sortedVesets.length-1].date),diff(sortedVesets[sortedVesets.length-1].date,sortedVesets[sortedVesets.length-2].date));
    else nextV=ad(start,30);
    const ov=ad(nextV,-14);
    for(let i=-4;i<=1;i++){const fd=ad(ov,i);if(!map[iso(fd)]?.types.has('veset')){mark(fd,'fertile');if(i!==0)label(fd,{key:'fertile'});}}
    label(ov,{key:'ovulation'});
  });

  // Mark all non-veset events on their own date first
  cycles.filter(c=>c.type&&c.type!=='veset').forEach(ev=>{
    const date=new Date(ev.date);
    mark(date,ev.type);
    if(ev.type==='sheilat_rav') label(date,{key:'sheilat_rav',answer:ev.answer||null});
    else if(ev.type==='lida') label(date,{key:'lida',subtype:ev.subtype||null});
    else label(date,{key:ev.type});
  });

  // DAM TRIGGER: non-veset triggers extend dam → hpst → sefirah → tvila
  // lida/hapala: bleeding starts the day after the event → dam count starts at 1
  // kesem/bedika: the event day is implicitly day 1 → dam count starts at 2
  [...nonVesetDamCycles].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(ev=>{
    const startDayNum=(ev.type==='lida'||ev.type==='hapala')?1:2;
    applyDamCycle(new Date(ev.date),ev.hpst,true,startDayNum);
  });

  // Cancel sefirah/tvila periods interrupted by non-veset dam triggers (kesem/bedika during 7 clean days)
  [...nonVesetDamCycles].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(ev=>{
    const triggerDate=new Date(ev.date);
    const trigIso=iso(triggerDate);
    if(!map[trigIso]?.types.has('sefirah')&&!map[trigIso]?.types.has('tvila')) return;
    // Find the hpst that started this sefirah period (scan backward up to 7 days)
    let hpstDate=null;
    for(let i=1;i<=7;i++){const d=ad(triggerDate,-i);if(map[iso(d)]?.types.has('hpst')){hpstDate=d;break;}}
    if(!hpstDate) return;
    // Remove sefirah and tvila from trigger date through tvila date
    const tvilaDate=ad(hpstDate,7);
    for(let d=new Date(triggerDate);d<=tvilaDate;d=ad(d,1)){
      const k=iso(d);
      if(map[k]){
        map[k].types.delete('sefirah'); map[k].types.delete('tvila');
        map[k].labels=map[k].labels.filter(l=>l.key!=='sefirah'&&l.key!=='tvila');
      }
    }
  });

  // Herayon: extend coloring + label until next lida (capped 365 days from start)
  const herCycles=cycles.filter(c=>c.type==='herayon').sort((a,b)=>new Date(a.date)-new Date(b.date));
  const lidaCycles=cycles.filter(c=>c.type==='lida').sort((a,b)=>new Date(a.date)-new Date(b.date));
  herCycles.forEach(her=>{
    const herStart=new Date(her.date);
    const nextLida=lidaCycles.find(l=>new Date(l.date)>herStart);
    const rawEnd=nextLida?ad(new Date(nextLida.date),-1):ad(herStart,365);
    const end=rawEnd<ad(herStart,365)?rawEnd:ad(herStart,365);
    const PHASE_TYPES=['veset','dam','hpst','sefirah','tvila'];
    for(let d=ad(herStart,1);d<=end;d=ad(d,1)){
      const k=iso(d);
      if(PHASE_TYPES.some(p=>map[k]?.types.has(p))) continue;
      mark(d,'herayon'); label(d,{key:'herayon'});
    }
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
