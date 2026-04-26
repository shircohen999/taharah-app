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
    case 'lida':           return t('phaseLida');
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

// All non-veset event types available in the custom form
const EXTRA_EVENT_TYPES = [
  'kesem','bedika_lo_nekia','lida','hapala','herayon','bedika_rofea','sheilat_rav',
];

function Calendar({cycles, onAddCycle, onDeleteCycle, lang}) {
  const [viewDate, setViewDate] = React.useState(()=>new Date());
  const [selected, setSelected]   = React.useState(null);
  const [key, setKey]             = React.useState(0);
  const [showSheet, setShowSheet] = React.useState(false);
  // formMode: null | 'recommended' | 'custom'
  const [formMode, setFormMode]   = React.useState(null);
  const [deleteMode, setDeleteMode] = React.useState(false);
  // recommended sub-type (sefirah phase)
  const [recSubType, setRecSubType] = React.useState('kesem');
  // custom form
  const [customType, setCustomType]     = React.useState('veset');
  const [addDate, setAddDate]           = React.useState('');
  const [addTime, setAddTime]           = React.useState('');
  const [addHpst, setAddHpst]           = React.useState('');
  const [sheilatAnswer, setSheilatAnswer] = React.useState('');

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

  // Determine the recommended event type for the selected day
  const getRecommendedType = (date) => {
    const info  = date ? map[iso(date)] : null;
    const types = info?.types;
    if (types?.has('veset') || types?.has('dam')) return 'hpst';
    if (types?.has('sefirah'))                    return 'sefirah_sub';
    return 'veset';
  };

  const recommendedType  = selected ? getRecommendedType(selected) : 'veset';
  const recommendedLabel =
    recommendedType === 'hpst'        ? t('calRecHpst') :
    recommendedType === 'sefirah_sub' ? t('calRecKesem') :
    t('calRecVeset');
  const recommendedDesc  =
    recommendedType === 'hpst'        ? t('calRecHpstDesc') :
    recommendedType === 'sefirah_sub' ? t('calRecKesemDesc') :
    t('calRecVesetDesc');

  // Find most recent veset cycle starting on or before `date`
  const getParentCycle = (date) => {
    if (!date || !cycles.length) return null;
    return [...cycles]
      .filter(c => !c.type || c.type === 'veset')
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
    setRecSubType('kesem');
    setCustomType('veset');
    setAddDate('');setAddTime('');setAddHpst('');setSheilatAnswer('');
  };

  const openSheet = () => { setShowSheet(true); setFormMode(null); };

  const chooseMode = (mode) => {
    setShowSheet(false);
    setFormMode(mode);
    if (!selected) return;
    const dateStr = iso(selected);
    setAddDate(dateStr);
    if (mode === 'recommended') {
      if (recommendedType === 'hpst') { setAddHpst(dateStr); setAddTime(''); }
      else { setAddHpst(''); setAddTime(''); }
    } else {
      // custom — pre-fill from existing veset if any
      const existing = cycles.find(cy => cy.date === dateStr && (!cy.type || cy.type === 'veset'));
      setCustomType('veset');
      setAddTime(existing?.time || '');
      setAddHpst(existing?.hpst || '');
      setSheilatAnswer('');
    }
  };

  const saveRecommended = () => {
    if (recommendedType === 'hpst') {
      if (!addHpst) { alert(t('alertNoDate')); return; }
      const parent = getParentCycle(selected);
      if (!parent) { alert(t('calNoParentCycle')); return; }
      onAddCycle({...parent, hpst: addHpst});
    } else if (recommendedType === 'sefirah_sub') {
      onAddCycle({type: recSubType, date: addDate});
    } else {
      // veset
      if (!addDate || !addTime) { alert(t('alertNoDateOnah')); return; }
      onAddCycle({date: addDate, time: addTime, hpst: addHpst || null});
    }
    resetForm();
  };

  const saveCustom = () => {
    if (customType === 'veset') {
      if (!addDate || !addTime) { alert(t('alertNoDateOnah')); return; }
      onAddCycle({date: addDate, time: addTime, hpst: addHpst || null});
    } else if (customType === 'sheilat_rav') {
      onAddCycle({type: 'sheilat_rav', date: addDate, answer: sheilatAnswer || null});
    } else {
      onAddCycle({type: customType, date: addDate});
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

  // Radio-style toggle for recommended sefirah sub-type
  const subTypeBtn = (type) => {
    const active = recSubType === type;
    return (
      <button
        onClick={()=>setRecSubType(type)}
        style={{
          flex:1, padding:'8px 6px', fontSize:12, fontWeight: active?600:400,
          background: active?'var(--primary)':'var(--bg-soft)',
          color: active?'#fff':'var(--muted)',
          border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit',
          transition:'background 160ms,color 160ms',
        }}
      >
        {type === 'kesem' ? t('calRecSubKesem') : t('calRecSubBedika')}
      </button>
    );
  };

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
          // Small dot indicator for non-veset events on this day
          const hasExtra=info?.types&&[...info.types].some(t=>EXTRA_EVENT_TYPES.includes(t));
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
              <div className="d-dot">
                <div className="d-greg">{c.date.getDate()}</div>
                <div className="d-heb">{fhebDay(c.date)}</div>
                {hasExtra && !phase && (
                  <div style={{position:'absolute',bottom:2,width:4,height:4,borderRadius:2,background:'var(--phase-sheilat)'}}/>
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
                return <span key={i} className={`dtag${ph?` dtag-${ph}`:''}`}>{renderLabel(lbl)}</span>;
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
              <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>
                {recommendedLabel}
              </div>

              {/* hpst (dam phase) */}
              {recommendedType === 'hpst' && (
                <>
                  <div className="field" style={fieldStyle}>
                    <label>{t('calHpstLabel')}</label>
                    <input type="date" dir="ltr" value={addHpst} onChange={e=>setAddHpst(e.target.value)}/>
                  </div>
                  <div style={btnRow}>{saveBtn(saveRecommended)}{cancelBtn}</div>
                </>
              )}

              {/* sefirah sub-type (kesem / bedika lo nekia) */}
              {recommendedType === 'sefirah_sub' && (
                <>
                  <div style={{display:'flex',gap:6,marginBottom:10}}>
                    {subTypeBtn('kesem')}{subTypeBtn('bedika_lo_nekia')}
                  </div>
                  <div className="field" style={fieldStyle}>
                    <label>{t('calDateLabel')}</label>
                    <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
                  </div>
                  <div style={btnRow}>{saveBtn(saveRecommended)}{cancelBtn}</div>
                </>
              )}

              {/* veset (default / tahora phase) */}
              {recommendedType === 'veset' && (
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
                  <div style={btnRow}>{saveBtn(saveRecommended)}{cancelBtn}</div>
                </>
              )}
            </div>
          )}

          {/* ── Custom / all-events form ── */}
          {formMode === 'custom' && (
            <div style={{marginTop:14,borderTop:'0.5px solid var(--border)',paddingTop:14}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>
                {t('calAddTitle')}
              </div>

              {/* Event type selector */}
              <div className="field" style={fieldStyle}>
                <label>{t('calEventTypeLabel')}</label>
                <select value={customType} onChange={e=>{setCustomType(e.target.value);setAddTime('');setAddHpst('');setSheilatAnswer('');}}>
                  <option value="veset">{t('calEventTypeVeset')}</option>
                  <option value="kesem">{t('calEventTypeKesem')}</option>
                  <option value="bedika_lo_nekia">{t('calEventTypeBedikaLoNekia')}</option>
                  <option value="lida">{t('calEventTypeLida')}</option>
                  <option value="hapala">{t('calEventTypeHapala')}</option>
                  <option value="herayon">{t('calEventTypeHerayon')}</option>
                  <option value="bedika_rofea">{t('calEventTypeBedikaRofea')}</option>
                  <option value="sheilat_rav">{t('calEventTypeSheilat')}</option>
                </select>
              </div>

              {/* Date — always */}
              <div className="field" style={fieldStyle}>
                <label>{t('calDateLabel')}</label>
                <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
              </div>

              {/* Veset-only extra fields */}
              {customType === 'veset' && (
                <>
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

              {/* Sheilat rav — answer field */}
              {customType === 'sheilat_rav' && (
                <div className="field" style={fieldStyle}>
                  <label>{t('calSheilatAnswerLabel')}</label>
                  <select value={sheilatAnswer} onChange={e=>setSheilatAnswer(e.target.value)}>
                    <option value="">{t('calSheilatNoAnswer')}</option>
                    <option value="tahora">{t('calSheilatTahora')}</option>
                    <option value="tamea">{t('calSheilatTamea')}</option>
                  </select>
                </div>
              )}

              <div style={btnRow}>{saveBtn(saveCustom)}{cancelBtn}</div>
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
                <div style={{fontSize:12,color:'var(--primary)',marginTop:3,fontWeight:500}}>{recommendedLabel}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{recommendedDesc}</div>
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
