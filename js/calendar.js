// ═══════════════════════════════════════════════════════
// CALENDAR — MoonIcon + Calendar component
// ═══════════════════════════════════════════════════════
const MoonIcon = ({phase='full',size=18,color='currentColor'}) => {
  const shapes = {
    new:      <circle cx="9" cy="9" r="8" fill="none" stroke={color} strokeWidth="1.5"/>,
    crescent: <><circle cx="9" cy="9" r="8" fill={color} opacity="0.15"/><path d="M9 1a8 8 0 000 16 6 6 0 010-16z" fill={color}/></>,
    half:     <><circle cx="9" cy="9" r="8" fill={color} opacity="0.15"/><path d="M9 1a8 8 0 010 16V1z" fill={color}/></>,
    gibbous:  <><circle cx="9" cy="9" r="8" fill={color}/><path d="M9 1a8 8 0 000 16 5 5 0 010-16z" fill={color} opacity="0.3"/></>,
    full:     <circle cx="9" cy="9" r="8" fill={color}/>,
  };
  return <svg width={size} height={size} viewBox="0 0 18 18" className="moon-svg">{shapes[phase]}</svg>;
};

// labelPhase: maps a label key → CSS class for dtag colouring
const labelPhase = (lbl) => {
  if (!lbl) return null;
  const k = lbl.key;
  if (k === 'veset')    return 'veset';
  if (k === 'dam')      return 'dam';
  if (k === 'hpst')     return 'hpst';
  if (k === 'sefirah')  return 'sefirah';
  if (k === 'tvila')    return 'tvila';
  if (k === 'ovulation' || k === 'fertile') return 'fertile';
  if (k === 'haflagah' || k === 'avg_onah' || k === 'month_onah') return 'prisha';
  // New event types — כתם and בדיקה לא נקיה share veset colour per user request
  if (k === 'kesem' || k === 'bedika_lo_nekia') return 'veset';
  if (k === 'lida')         return 'lida';
  if (k === 'hapala')       return 'hapala';
  if (k === 'herayon')      return 'herayon';
  if (k === 'bedika_rofea') return 'rofea';
  if (k === 'sheilat_rav')  return 'sheilat';
  return null;
};

// renderLabel: translates a label object to display text
const renderLabel = (lbl) => {
  if (!lbl) return '';
  switch (lbl.key) {
    case 'veset':      return t('phaseVeset');
    case 'dam':        return t('phaseDam', lbl.n);
    case 'hpst':       return t('phaseHpst');
    case 'sefirah':    return t('phaseSefirah', lbl.n);
    case 'tvila':      return t('phaseTvila');
    case 'fertile':    return t('phaseFertile');
    case 'ovulation':  return t('phaseOvulation');
    case 'avg_onah':   return t('phaseAvgOnah');
    case 'haflagah':   return t('phaseHaflagah', lbl.n);
    case 'month_onah': return t('phaseMonthOnah');
    case 'kesem':          return t('phaseKesem');
    case 'bedika_lo_nekia':return t('phaseBedikaLoNekia');
    case 'lida':
      if (lbl.subtype === 'ben')           return t('phaseLidaBen');
      if (lbl.subtype === 'bat')           return t('phaseLidaBat');
      if (lbl.subtype === 'twins_ben_ben') return t('phaseLidaTwinsBenBen');
      if (lbl.subtype === 'twins_bat_bat') return t('phaseLidaTwinsBatBat');
      if (lbl.subtype === 'twins_ben_bat') return t('phaseLidaTwinsBenBat');
      return t('phaseLida');
    case 'hapala':         return t('phaseHapala');
    case 'herayon':        return t('phaseHerayon');
    case 'bedika_rofea':   return t('phaseBedikaRofea');
    case 'sheilat_rav':
      if (lbl.answer === 'tahora') return t('phaseSheilatTahora');
      if (lbl.answer === 'tamea')  return t('phaseSheilatTamea');
      return t('phaseSheilat');
    default: return lbl.key;
  }
};

const PRISHA_KEYS = new Set(['haflagah','avg_onah','month_onah']);
const prishaTimeText = (lbl, date) => {
  if (!date || !PRISHA_KEYS.has(lbl.key) || !lbl.time) return null;
  const s = fhebShort(date);
  if (lbl.time === 'day')   return t('prishaTimeDay', s);
  if (lbl.time === 'night') return t('prishaTimeNight', fhebShort(ad(date,-1)), s);
  return null;
};

// All non-veset event types (for hasExtra detection)
const EXTRA_EVENT_TYPES = [
  'kesem','bedika_lo_nekia','lida','hapala','herayon','bedika_rofea','sheilat_rav',
];

// All addable types (ordered for display)
const ALL_ADDABLE_TYPES = [
  'veset','hpst','kesem','bedika_lo_nekia','lida','hapala','herayon','bedika_rofea','sheilat_rav',
];

// Extra-event color maps (main color + soft bg) for circle/dot coloring
const EXTRA_TYPE_COLOR = {
  kesem:'var(--phase-veset)', bedika_lo_nekia:'var(--phase-veset)',
  lida:'var(--phase-lida)', hapala:'var(--phase-hapala)',
  herayon:'var(--phase-herayon)', bedika_rofea:'var(--phase-rofea)',
  sheilat_rav:'var(--phase-sheilat)',
};
const EXTRA_TYPE_SOFT = {
  kesem:'var(--veset-soft)', bedika_lo_nekia:'var(--veset-soft)',
  lida:'var(--lida-soft)', hapala:'var(--hapala-soft)',
  herayon:'var(--herayon-soft)', bedika_rofea:'var(--rofea-soft)',
  sheilat_rav:'var(--sheilat-soft)',
};

function Calendar({cycles, onAddCycle, onDeleteCycle, lang}) {
  const [viewDate, setViewDate] = React.useState(()=>new Date());
  const [selected, setSelected]   = React.useState(null);
  const [key, setKey]             = React.useState(0);
  const [showSheet, setShowSheet] = React.useState(false);
  // formMode: null | 'recommended' | 'custom'
  const [formMode, setFormMode]   = React.useState(null);
  const [deleteMode, setDeleteMode] = React.useState(false);
  // which recommended type the user has drilled into (null = showing list)
  const [recSelectedType, setRecSelectedType] = React.useState(null);
  const [customSelectedType, setCustomSelectedType] = React.useState(null);
  const [addDate, setAddDate]           = React.useState('');
  const [addTime, setAddTime]           = React.useState('');
  const [addHpst, setAddHpst]           = React.useState('');
  const [sheilatAnswer, setSheilatAnswer] = React.useState('');
  const [lidaSubtype, setLidaSubtype]   = React.useState('');
  const [bedikaRofeaAnswer, setBedikaRofeaAnswer] = React.useState('');

  const map   = React.useMemo(()=>buildMap(cycles),[cycles]);
  const today = React.useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);return d;},[]);

  const vy=viewDate.getFullYear(), vm=viewDate.getMonth();
  const first=new Date(vy,vm,1);
  const lastDate=new Date(vy,vm+1,0).getDate();
  const startDow=first.getDay();
  const cells=[];
  for(let i=0;i<startDow;i++) cells.push({date:new Date(vy,vm,1-startDow+i),other:true});
  for(let d=1;d<=lastDate;d++) cells.push({date:new Date(vy,vm,d),other:false});
  const tail=7-((startDow+lastDate)%7);
  if(tail<7) for(let i=1;i<=tail;i++) cells.push({date:new Date(vy,vm+1,i),other:true});

  const changeMonth=(d)=>{setViewDate(prev=>new Date(prev.getFullYear(),prev.getMonth()+d,1));setKey(k=>k+1);};
  const goToday=()=>{const n=new Date();setViewDate(new Date(n.getFullYear(),n.getMonth(),1));setKey(k=>k+1);};

  const selectedInfo = selected ? map[iso(selected)] : null;

  // Context-aware list of recommended event types for the selected day
  const getRecommendedOptions = (date) => {
    const info  = date ? map[iso(date)] : null;
    const types = info?.types;
    if (types?.has('veset') || types?.has('dam')) return ['hpst'];
    if (types?.has('sefirah')) return ['kesem', 'bedika_lo_nekia'];
    if (types?.has('herayon')) return ['hapala', 'kesem', 'lida'];
    if (types?.has('prisha')) return ['veset', 'kesem', 'herayon', 'bedika_lo_nekia'];
    return ['veset', 'kesem', 'herayon'];
  };

  const recOptions = selected ? getRecommendedOptions(selected) : [];
  // Custom list = all types minus those already in the recommended list
  const customOptions = ALL_ADDABLE_TYPES.filter(tp => !recOptions.includes(tp));

  const recTypeLabel = (type) => {
    if (type === 'hpst')            return t('calRecHpst');
    if (type === 'veset')           return t('calEventTypeVeset');
    if (type === 'kesem')           return t('calEventTypeKesem');
    if (type === 'bedika_lo_nekia') return t('calEventTypeBedikaLoNekia');
    if (type === 'lida')            return t('calEventTypeLida');
    if (type === 'hapala')          return t('calEventTypeHapala');
    if (type === 'sheilat_rav')     return t('calEventTypeSheilat');
    if (type === 'herayon')         return t('calEventTypeHerayon');
    if (type === 'bedika_rofea')    return t('calEventTypeBedikaRofea');
    return type;
  };

  // Find most recent dam-triggering event starting on or before `date`
  const DAM_TRIGGER_TYPES = new Set(['veset','kesem','bedika_lo_nekia','lida','hapala']);
  const getParentCycle = (date) => {
    if (!date || !cycles.length) return null;
    return [...cycles]
      .filter(c => {
        const tp = c.type || 'veset';
        if (DAM_TRIGGER_TYPES.has(tp)) return true;
        if (tp === 'bedika_rofea' && c.answer === 'tamea') return true;
        if (tp === 'sheilat_rav' && c.answer === 'tamea') return true;
        return false;
      })
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .find(c => new Date(c.date) <= date) || null;
  };

  // Events that originate on the selected day (deletable)
  const originatingEvents = React.useMemo(()=>
    selected ? cycles.filter(c => c.date === iso(selected)) : [],
  [cycles, selected]);

  // Human-readable label for a raw cycle/event object
  const getCycleLabel = (c) => {
    if (!c.type || c.type === 'veset') {
      const timeStr = c.time === 'night' ? ` · ${t('calOnahNight')}` : c.time === 'day' ? ` · ${t('calOnahDay')}` : '';
      return t('phaseVeset') + timeStr;
    }
    return renderLabel({key: c.type, answer: c.answer || null});
  };

  const resetForm = () => {
    setFormMode(null);
    setDeleteMode(false);
    setRecSelectedType(null);
    setCustomSelectedType(null);
    setAddDate('');setAddTime('');setAddHpst('');setSheilatAnswer('');
    setLidaSubtype('');setBedikaRofeaAnswer('');
  };

  const openSheet = () => { setShowSheet(true); setFormMode(null); };

  const chooseMode = (mode) => {
    setShowSheet(false);
    setFormMode(mode);
    setRecSelectedType(null);
    setCustomSelectedType(null);
    if (!selected) return;
    const dateStr = iso(selected);
    setAddDate(dateStr);
    setAddHpst('');
    setAddTime('');
    setSheilatAnswer('');
  };

  const saveRecommended = () => {
    const type = recSelectedType;
    if (type === 'hpst') {
      if (!addHpst) { alert(t('alertNoDate')); return; }
      const parent = getParentCycle(selected);
      if (!parent) { alert(t('calNoParentCycle')); return; }
      const isVeset = !parent.type || parent.type === 'veset';
      if (isVeset && diff(addHpst, parent.date) < 4) { alert(t('alertHpstTooEarly')); return; }
      onAddCycle({...parent, hpst: addHpst});
    } else if (type === 'veset') {
      if (!addDate || !addTime) { alert(t('alertNoDateOnah')); return; }
      onAddCycle({date: addDate, time: addTime, hpst: addHpst || null});
    } else if (type === 'lida') {
      if (!addDate) { alert(t('alertNoDate')); return; }
      onAddCycle({type: 'lida', date: addDate, subtype: lidaSubtype || null});
    } else if (type === 'bedika_rofea') {
      if (!addDate) { alert(t('alertNoDate')); return; }
      onAddCycle({type: 'bedika_rofea', date: addDate, answer: bedikaRofeaAnswer || null});
    } else if (type === 'sheilat_rav') {
      onAddCycle({type: 'sheilat_rav', date: addDate, answer: sheilatAnswer || null});
    } else {
      if (!addDate) { alert(t('alertNoDate')); return; }
      onAddCycle({type, date: addDate});
    }
    resetForm();
  };

  const saveCustom = () => {
    const type = customSelectedType;
    if (type === 'hpst') {
      if (!addHpst) { alert(t('alertNoDate')); return; }
      const parent = getParentCycle(selected || new Date(addHpst));
      if (!parent) { alert(t('calNoParentCycle')); return; }
      const isVeset = !parent.type || parent.type === 'veset';
      if (isVeset && diff(addHpst, parent.date) < 4) { alert(t('alertHpstTooEarly')); return; }
      onAddCycle({...parent, hpst: addHpst});
    } else if (type === 'veset') {
      if (!addDate || !addTime) { alert(t('alertNoDateOnah')); return; }
      onAddCycle({date: addDate, time: addTime, hpst: addHpst || null});
    } else if (type === 'lida') {
      if (!addDate) { alert(t('alertNoDate')); return; }
      onAddCycle({type: 'lida', date: addDate, subtype: lidaSubtype || null});
    } else if (type === 'bedika_rofea') {
      if (!addDate) { alert(t('alertNoDate')); return; }
      onAddCycle({type: 'bedika_rofea', date: addDate, answer: bedikaRofeaAnswer || null});
    } else if (type === 'sheilat_rav') {
      onAddCycle({type: 'sheilat_rav', date: addDate, answer: sheilatAnswer || null});
    } else {
      if (!addDate) { alert(t('alertNoDate')); return; }
      onAddCycle({type, date: addDate});
    }
    resetForm();
  };

  // --- helpers ---
  const fieldStyle = {background:'var(--bg-soft)', borderRadius:10, marginBottom:6};
  const btnRow = {display:'flex', gap:8, marginTop:10};
  const cancelBtn = (
    <button className="btn-ghost" style={{margin:0,padding:'11px 16px',fontSize:13,width:'auto'}} onClick={resetForm}>
      {t('calCancelBtn')}
    </button>
  );
  const saveBtn = (onClick) => (
    <button className="btn-primary" style={{flex:1,margin:0,padding:'11px 0',fontSize:14}} onClick={onClick}>
      {t('calSaveBtn')}
    </button>
  );


  return (
    <div className="page active" style={{padding:0}}>
      {/* ── Month nav ── */}
      <div className="month-nav">
        <button className="mnav-btn" onClick={()=>changeMonth(-1)}>‹</button>
        <div style={{textAlign:'center'}}>
          <div className="mlabel">{gregM(vm)} {vy}</div>
          <div className="mlabel2">{fhebMonth(first)}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <button className="today-chip" onClick={goToday}>{t('calToday')}</button>
          <button className="mnav-btn" onClick={()=>changeMonth(1)}>›</button>
        </div>
      </div>

      <div className="dow-row">
        {t('dayHeaders').map((d,i)=><div key={i} className="dow-cell">{d}</div>)}
      </div>

      {/* ── Calendar grid ── */}
      <div className="cal-grid" key={key}>
        {cells.map((c,i)=>{
          const k=iso(c.date);
          const info=map[k];
          const phase=getDayPhase(info?.types);
          const isToday=iso(c.date)===iso(today);
          const isSelected=selected&&iso(selected)===k;
          const bar=info?.types.has('prisha')?'prisha':info?.types.has('fertile')?'fertile':null;
          // First extra event type on this day (for color)
          const extraType=info?.types ? EXTRA_EVENT_TYPES.find(et=>info.types.has(et)) : null;
          const extraColor=extraType ? EXTRA_TYPE_COLOR[extraType] : null;
          const extraSoft=extraType ? EXTRA_TYPE_SOFT[extraType] : null;
          return (
            <div
              key={i}
              className={`cal-day${c.other?' other':''}${isToday?' today':''}${isSelected?' selected':''}`}
              data-phase={phase||undefined}
              style={{animationDelay:`${Math.min(i,35)*12}ms`}}
              onClick={()=>{
                if(c.other){setViewDate(new Date(c.date.getFullYear(),c.date.getMonth(),1));setKey(prev=>prev+1);}
                setSelected(c.date);
                setFormMode(null);
                setDeleteMode(false);
                setShowSheet(false);
              }}
            >
              <div
                className="d-dot"
                style={extraType&&!phase ? {background:extraSoft,boxShadow:`inset 0 0 0 1.5px ${extraColor}`} : undefined}
              >
                <div className="d-greg">{c.date.getDate()}</div>
                <div className="d-heb">{fhebDay(c.date)}</div>
                {extraType && phase && (
                  <div style={{position:'absolute',bottom:2,width:4,height:4,borderRadius:2,background:extraColor}}/>
                )}
              </div>
              {bar&&<div className="d-bar" style={{background:bar==='prisha'?'var(--phase-prisha)':'var(--phase-fertile)'}}/>}
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="legend">
        <div className="li"><div className="ld" style={{background:'var(--phase-veset)'}}/>{ t('legendVeset')}</div>
        <div className="li"><div className="ld" style={{background:'var(--veset-soft)'}}/>{ t('legendDam')}</div>
        <div className="li"><div className="ld" style={{background:'#FFFFFF',border:'1.5px solid var(--phase-hpst)'}}/>{ t('legendHpst')}</div>
        <div className="li"><div className="ld" style={{background:'var(--sefirah-soft)',border:'1.5px dashed var(--phase-sefirah)'}}/>{ t('legendSefirah')}</div>
        <div className="li"><div className="ld" style={{background:'var(--tvila-soft)',border:'1.5px solid var(--phase-tvila)'}}/>{ t('legendTvila')}</div>
        <div className="li"><div className="lb" style={{background:'var(--phase-prisha)'}}/>{ t('legendPrisha')}</div>
        <div className="li"><div className="lb" style={{background:'var(--phase-fertile)'}}/>{ t('legendFertile')}</div>
        <div className="li"><div className="ld" style={{background:'var(--lida-soft)',border:'1.5px solid var(--phase-lida)'}}/>{ t('legendLida')}</div>
        <div className="li"><div className="ld" style={{background:'var(--hapala-soft)',border:'1.5px solid var(--phase-hapala)'}}/>{ t('legendHapala')}</div>
        <div className="li"><div className="ld" style={{background:'var(--herayon-soft)',border:'1.5px solid var(--phase-herayon)'}}/>{ t('legendHerayon')}</div>
        <div className="li"><div className="ld" style={{background:'var(--rofea-soft)',border:'1.5px solid var(--phase-rofea)'}}/>{ t('legendRofea')}</div>
        <div className="li"><div className="ld" style={{background:'var(--sheilat-soft)',border:'1.5px solid var(--phase-sheilat)'}}/>{ t('legendSheilat')}</div>
      </div>

      {/* ── Day detail panel ── */}
      {selected ? (
        <div className="detail-panel" key={iso(selected)}>
          <div className="d-date">{dayFull(selected.getDay())}, {selected.getDate()}/{selected.getMonth()+1} · {fheb(selected)}</div>

          {selectedInfo?.labels?.length ? (
            <div className="d-tags">
              {selectedInfo.labels.map((lbl,i)=>{
                const ph=labelPhase(lbl);
                const sub=prishaTimeText(lbl, selected);
                return (
                  <span key={i} className={`dtag${ph?` dtag-${ph}`:''}`} style={sub?{display:'inline-flex',flexDirection:'column',gap:2,alignItems:'flex-start'}:{}}>
                    <span>{renderLabel(lbl)}</span>
                    {sub && <span style={{fontSize:11,opacity:0.85,fontWeight:400,lineHeight:1.3}}>{sub}</span>}
                  </span>
                );
              })}
            </div>
          ) : <div className="d-empty">{t('calNoEvents')}</div>}

          {/* Add + Delete buttons row */}
          {!formMode && !deleteMode && (
            <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
              <button
                onClick={openSheet}
                style={{
                  display:'inline-flex',alignItems:'center',gap:6,
                  padding:'8px 18px',background:'var(--primary)',color:'#fff',
                  border:'none',borderRadius:999,fontSize:13,cursor:'pointer',
                  fontWeight:600,fontFamily:'inherit',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.12)',
                }}
              >
                <span style={{fontSize:18,lineHeight:1,marginTop:-1}}>+</span>
                {t('calAddEventBtn')}
              </button>
              {originatingEvents.length > 0 && (
                <button
                  onClick={()=>setDeleteMode(true)}
                  style={{
                    display:'inline-flex',alignItems:'center',gap:5,
                    padding:'8px 14px',background:'transparent',color:'var(--muted)',
                    border:'0.5px solid var(--border-mid)',borderRadius:999,fontSize:13,
                    cursor:'pointer',fontFamily:'inherit',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                  {t('calDeleteEventBtn')}
                </button>
              )}
            </div>
          )}

          {/* Delete list */}
          {deleteMode && (
            <div style={{marginTop:14,borderTop:'0.5px solid var(--border)',paddingTop:14}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>
                {t('calDeleteEventTitle')}
              </div>
              {originatingEvents.length === 0 ? (
                <div className="d-empty">{t('calDeleteEmpty')}</div>
              ) : (
                originatingEvents.map((c,i) => (
                  <div key={c.id||i} style={{
                    display:'flex',justifyContent:'space-between',alignItems:'center',
                    padding:'10px 14px',background:'var(--bg-soft)',borderRadius:10,marginBottom:6,
                  }}>
                    <div style={{fontSize:13,color:'var(--text)',fontWeight:500}}>
                      {getCycleLabel(c)}
                    </div>
                    <button
                      onClick={()=>{
                        onDeleteCycle(c.id);
                        if(originatingEvents.length <= 1) setDeleteMode(false);
                      }}
                      style={{
                        background:'transparent',border:'none',cursor:'pointer',
                        color:'var(--muted)',fontSize:20,padding:'2px 6px',
                        fontWeight:300,lineHeight:1,flexShrink:0,
                      }}
                      aria-label="מחקי"
                    >×</button>
                  </div>
                ))
              )}
              <button className="btn-ghost" style={{margin:0,marginTop:6,padding:'10px',fontSize:13}} onClick={()=>setDeleteMode(false)}>
                {t('calCancelBtn')}
              </button>
            </div>
          )}

          {/* ── Recommended event form ── */}
          {formMode === 'recommended' && (
            <div style={{marginTop:14,borderTop:'0.5px solid var(--border)',paddingTop:14}}>

              {/* LIST: choose from context-aware options */}
              {!recSelectedType && (
                <>
                  <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>
                    {t('calRecEventTitle')}
                  </div>
                  {recOptions.map(type=>(
                    <div
                      key={type}
                      onClick={()=>{
                        setRecSelectedType(type);
                        if(type==='hpst') setAddHpst(addDate);
                      }}
                      style={{
                        display:'flex',justifyContent:'space-between',alignItems:'center',
                        padding:'12px 14px',background:'var(--bg-soft)',borderRadius:12,
                        marginBottom:8,cursor:'pointer',
                      }}
                    >
                      <div style={{fontSize:14,fontWeight:500,color:'var(--text)'}}>{recTypeLabel(type)}</div>
                      <div style={{fontSize:20,color:'var(--muted)',lineHeight:1,flexShrink:0}}>›</div>
                    </div>
                  ))}
                  <div style={{marginTop:8}}>{cancelBtn}</div>
                </>
              )}

              {/* MINI-FORM: fields for the chosen type */}
              {recSelectedType && (
                <>
                  <button
                    onClick={()=>setRecSelectedType(null)}
                    style={{background:'none',border:'none',cursor:'pointer',padding:'0 0 10px',color:'var(--primary)',fontSize:13,fontFamily:'inherit'}}
                  >
                    ‹ {t('calRecBack')}
                  </button>
                  <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>
                    {recTypeLabel(recSelectedType)}
                  </div>

                  {recSelectedType === 'hpst' && (
                    <div className="field" style={fieldStyle}>
                      <label>{t('calHpstLabel')}</label>
                      <input type="date" dir="ltr" value={addHpst} onChange={e=>setAddHpst(e.target.value)}/>
                    </div>
                  )}

                  {['kesem','bedika_lo_nekia','herayon','hapala'].includes(recSelectedType) && (
                    <div className="field" style={fieldStyle}>
                      <label>{t('calDateLabel')}</label>
                      <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                    </div>
                  )}

                  {recSelectedType === 'lida' && (
                    <>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calDateLabel')}</label>
                        <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                      </div>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calLidaSubtypeLabel')}</label>
                        <select value={lidaSubtype} onChange={e=>setLidaSubtype(e.target.value)}>
                          <option value="">{t('calLidaUnknown')}</option>
                          <option value="ben">{t('calLidaBen')}</option>
                          <option value="bat">{t('calLidaBat')}</option>
                          <option value="twins_ben_ben">{t('calLidaTwinsBenBen')}</option>
                          <option value="twins_bat_bat">{t('calLidaTwinsBatBat')}</option>
                          <option value="twins_ben_bat">{t('calLidaTwinsBenBat')}</option>
                        </select>
                      </div>
                    </>
                  )}

                  {recSelectedType === 'veset' && (
                    <>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calDateLabel')}</label>
                        <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                      </div>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calOnahLabel')}</label>
                        <select value={addTime} onChange={e=>setAddTime(e.target.value)}>
                          <option value="">{t('calOnahPlaceholder')}</option>
                          <option value="day">{t('calOnahDay')}</option>
                          <option value="night">{t('calOnahNight')}</option>
                        </select>
                      </div>
                    </>
                  )}

                  {recSelectedType === 'bedika_rofea' && (
                    <>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calDateLabel')}</label>
                        <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                      </div>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calBedikaResultLabel')}</label>
                        <select value={bedikaRofeaAnswer} onChange={e=>setBedikaRofeaAnswer(e.target.value)}>
                          <option value="">{t('calSheilatNoAnswer')}</option>
                          <option value="tahora">{t('calSheilatTahora')}</option>
                          <option value="tamea">{t('calSheilatTamea')}</option>
                        </select>
                      </div>
                    </>
                  )}

                  {recSelectedType === 'sheilat_rav' && (
                    <>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calDateLabel')}</label>
                        <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                      </div>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calSheilatAnswerLabel')}</label>
                        <select value={sheilatAnswer} onChange={e=>setSheilatAnswer(e.target.value)}>
                          <option value="">{t('calSheilatNoAnswer')}</option>
                          <option value="tahora">{t('calSheilatTahora')}</option>
                          <option value="tamea">{t('calSheilatTamea')}</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div style={btnRow}>{saveBtn(saveRecommended)}{cancelBtn}</div>
                </>
              )}
            </div>
          )}

          {/* ── Custom / all-events form ── */}
          {formMode === 'custom' && (
            <div style={{marginTop:14,borderTop:'0.5px solid var(--border)',paddingTop:14}}>

              {/* LIST: types not covered by recommended */}
              {!customSelectedType && (
                <>
                  <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>
                    {t('calCustomEventTitle')}
                  </div>
                  {customOptions.map(type=>(
                    <div
                      key={type}
                      onClick={()=>{
                        setCustomSelectedType(type);
                        if(type==='hpst') setAddHpst(addDate);
                        else { setAddHpst(''); setAddTime(''); setSheilatAnswer(''); }
                      }}
                      style={{
                        display:'flex',justifyContent:'space-between',alignItems:'center',
                        padding:'12px 14px',background:'var(--bg-soft)',borderRadius:12,
                        marginBottom:8,cursor:'pointer',
                      }}
                    >
                      <div style={{fontSize:14,fontWeight:500,color:'var(--text)'}}>{recTypeLabel(type)}</div>
                      <div style={{fontSize:20,color:'var(--muted)',lineHeight:1,flexShrink:0}}>›</div>
                    </div>
                  ))}
                  <div style={{marginTop:8}}>{cancelBtn}</div>
                </>
              )}

              {/* MINI-FORM: fields for the chosen type */}
              {customSelectedType && (
                <>
                  <button
                    onClick={()=>setCustomSelectedType(null)}
                    style={{background:'none',border:'none',cursor:'pointer',padding:'0 0 10px',color:'var(--primary)',fontSize:13,fontFamily:'inherit'}}
                  >
                    ‹ {t('calRecBack')}
                  </button>
                  <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>
                    {recTypeLabel(customSelectedType)}
                  </div>

                  {customSelectedType === 'hpst' && (
                    <div className="field" style={fieldStyle}>
                      <label>{t('calHpstLabel')}</label>
                      <input type="date" dir="ltr" value={addHpst} onChange={e=>setAddHpst(e.target.value)}/>
                    </div>
                  )}

                  {['kesem','bedika_lo_nekia','herayon','hapala'].includes(customSelectedType) && (
                    <div className="field" style={fieldStyle}>
                      <label>{t('calDateLabel')}</label>
                      <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                    </div>
                  )}

                  {customSelectedType === 'lida' && (
                    <>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calDateLabel')}</label>
                        <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                      </div>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calLidaSubtypeLabel')}</label>
                        <select value={lidaSubtype} onChange={e=>setLidaSubtype(e.target.value)}>
                          <option value="">{t('calLidaUnknown')}</option>
                          <option value="ben">{t('calLidaBen')}</option>
                          <option value="bat">{t('calLidaBat')}</option>
                          <option value="twins_ben_ben">{t('calLidaTwinsBenBen')}</option>
                          <option value="twins_bat_bat">{t('calLidaTwinsBatBat')}</option>
                          <option value="twins_ben_bat">{t('calLidaTwinsBenBat')}</option>
                        </select>
                      </div>
                    </>
                  )}

                  {customSelectedType === 'veset' && (
                    <>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calDateLabel')}</label>
                        <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                      </div>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calOnahLabel')}</label>
                        <select value={addTime} onChange={e=>setAddTime(e.target.value)}>
                          <option value="">{t('calOnahPlaceholder')}</option>
                          <option value="day">{t('calOnahDay')}</option>
                          <option value="night">{t('calOnahNight')}</option>
                        </select>
                      </div>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calHpstLabel')}</label>
                        <input type="date" dir="ltr" value={addHpst} onChange={e=>setAddHpst(e.target.value)}/>
                      </div>
                    </>
                  )}

                  {customSelectedType === 'bedika_rofea' && (
                    <>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calDateLabel')}</label>
                        <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                      </div>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calBedikaResultLabel')}</label>
                        <select value={bedikaRofeaAnswer} onChange={e=>setBedikaRofeaAnswer(e.target.value)}>
                          <option value="">{t('calSheilatNoAnswer')}</option>
                          <option value="tahora">{t('calSheilatTahora')}</option>
                          <option value="tamea">{t('calSheilatTamea')}</option>
                        </select>
                      </div>
                    </>
                  )}

                  {customSelectedType === 'sheilat_rav' && (
                    <>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calDateLabel')}</label>
                        <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                      </div>
                      <div className="field" style={fieldStyle}>
                        <label>{t('calSheilatAnswerLabel')}</label>
                        <select value={sheilatAnswer} onChange={e=>setSheilatAnswer(e.target.value)}>
                          <option value="">{t('calSheilatNoAnswer')}</option>
                          <option value="tahora">{t('calSheilatTahora')}</option>
                          <option value="tamea">{t('calSheilatTamea')}</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div style={btnRow}>{saveBtn(saveCustom)}{cancelBtn}</div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="detail-panel"><div className="d-empty">{t('calClickInfo')}</div></div>
      )}

      {/* ── Event-type selection sheet ── */}
      {showSheet && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'flex-end'}}
          onClick={()=>setShowSheet(false)}
        >
          <div
            style={{
              width:'100%',maxWidth:430,margin:'0 auto',
              background:'var(--bg)',
              borderRadius:'20px 20px 0 0',
              padding:'8px 16px 44px',
              animation:'drawerIn 280ms cubic-bezier(0.22,1,0.36,1)',
            }}
            onClick={e=>e.stopPropagation()}
          >
            <div style={{width:36,height:4,background:'var(--border-mid)',borderRadius:2,margin:'8px auto 16px'}}/>
            <div style={{fontSize:16,fontWeight:700,marginBottom:2}}>{t('calEventSheetTitle')}</div>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:18}}>
              {selected && `${dayFull(selected.getDay())} · ${selected.getDate()}/${selected.getMonth()+1} · ${fheb(selected)}`}
            </div>

            {/* Recommended option */}
            <div
              onClick={()=>chooseMode('recommended')}
              style={{
                display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'14px 16px',background:'var(--card)',borderRadius:16,
                marginBottom:10,cursor:'pointer',
                boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div>
                <div style={{fontSize:14,fontWeight:600}}>{t('calRecEventTitle')}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{t('calRecEventSub')}</div>
              </div>
              <div style={{fontSize:22,color:'var(--muted)',lineHeight:1,flexShrink:0,marginRight:4}}>›</div>
            </div>

            {/* All-events option */}
            <div
              onClick={()=>chooseMode('custom')}
              style={{
                display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'14px 16px',background:'var(--card)',borderRadius:16,
                cursor:'pointer',
                boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div>
                <div style={{fontSize:14,fontWeight:600}}>{t('calCustomEventTitle')}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{t('calCustomEventDesc')}</div>
              </div>
              <div style={{fontSize:22,color:'var(--muted)',lineHeight:1,flexShrink:0,marginRight:4}}>›</div>
            </div>
          </div>
        </div>
      )}

      <div style={{height:40}}/>
    </div>
  );
}
