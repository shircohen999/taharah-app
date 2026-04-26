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

// labelPhase: maps a label object {key, n?} → CSS phase class
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
    default:           return lbl.key;
  }
};

function Calendar({cycles, onAddCycle, lang}) {
  const [viewDate, setViewDate] = React.useState(()=>new Date());
  const [selected, setSelected] = React.useState(null);
  const [key, setKey] = React.useState(0);
  const [showSheet, setShowSheet] = React.useState(false);
  const [formMode, setFormMode] = React.useState(null); // null | 'recommended' | 'custom'
  const [addDate, setAddDate] = React.useState('');
  const [addTime, setAddTime] = React.useState('');
  const [addHpst, setAddHpst] = React.useState('');

  const map = React.useMemo(()=>buildMap(cycles),[cycles]);
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

  const changeMonth=(d)=>{
    setViewDate(prev=>new Date(prev.getFullYear(),prev.getMonth()+d,1));
    setKey(k=>k+1);
  };
  const goToday=()=>{const n=new Date();setViewDate(new Date(n.getFullYear(),n.getMonth(),1));setKey(k=>k+1);};

  const selectedInfo = selected ? map[iso(selected)] : null;

  // Determine recommended event type based on the selected day's phase
  const getRecommendedType = (date) => {
    const info = date ? map[iso(date)] : null;
    const types = info?.types;
    if (types?.has('veset') || types?.has('dam')) return 'hpst';
    return 'veset';
  };

  const recommendedType = selected ? getRecommendedType(selected) : 'veset';
  const recommendedLabel = recommendedType === 'hpst' ? t('calRecHpst') : t('calRecVeset');
  const recommendedDesc  = recommendedType === 'hpst' ? t('calRecHpstDesc') : t('calRecVesetDesc');

  // Find the most recent cycle that started on or before the given date
  const getParentCycle = (date) => {
    if (!date || !cycles.length) return null;
    return [...cycles]
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .find(c => new Date(c.date) <= date) || null;
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
      const existing = cycles.find(cy => cy.date === dateStr);
      setAddTime(existing?.time || '');
      setAddHpst(existing?.hpst || '');
    }
  };

  const saveRecommended = () => {
    if (recommendedType === 'hpst') {
      if (!addHpst) { alert(t('alertNoDate')); return; }
      const parent = getParentCycle(selected);
      if (!parent) { alert(t('calNoParentCycle')); return; }
      onAddCycle({...parent, hpst: addHpst});
    } else {
      if (!addDate || !addTime) { alert(t('alertNoDateOnah')); return; }
      onAddCycle({date: addDate, time: addTime, hpst: addHpst || null});
    }
    setFormMode(null);
  };

  const saveCustom = () => {
    if (!addDate || !addTime) { alert(t('alertNoDateOnah')); return; }
    onAddCycle({date: addDate, time: addTime, hpst: addHpst || null});
    setFormMode(null);
  };

  const fieldStyle = {background:'var(--bg-soft)', borderRadius:10, marginBottom:6};
  const btnRowStyle = {display:'flex', gap:8, marginTop:10};

  return (
    <div className="page active" style={{padding:0}}>
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

      <div className="cal-grid" key={key}>
        {cells.map((c,i)=>{
          const k=iso(c.date);
          const info=map[k];
          const phase=getDayPhase(info?.types);
          const isToday=iso(c.date)===iso(today);
          const isSelected=selected&&iso(selected)===k;
          const bar=info?.types.has('prisha')?'prisha':info?.types.has('fertile')?'fertile':null;
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
                setShowSheet(false);
              }}
            >
              <div className="d-dot">
                <div className="d-greg">{c.date.getDate()}</div>
                <div className="d-heb">{fhebDay(c.date)}</div>
              </div>
              {bar&&<div className="d-bar" style={{background:bar==='prisha'?'var(--phase-prisha)':'var(--phase-fertile)'}}/>}
            </div>
          );
        })}
      </div>

      <div className="legend">
        <div className="li"><div className="ld" style={{background:'var(--phase-veset)'}}/>{ t('legendVeset')}</div>
        <div className="li"><div className="ld" style={{background:'var(--veset-soft)'}}/>{ t('legendDam')}</div>
        <div className="li"><div className="ld" style={{background:'#FFFFFF',border:'1.5px solid var(--phase-hpst)'}}/>{ t('legendHpst')}</div>
        <div className="li"><div className="ld" style={{background:'var(--sefirah-soft)',border:'1.5px dashed var(--phase-sefirah)'}}/>{ t('legendSefirah')}</div>
        <div className="li"><div className="ld" style={{background:'var(--tvila-soft)',border:'1.5px solid var(--phase-tvila)'}}/>{ t('legendTvila')}</div>
        <div className="li"><div className="lb" style={{background:'var(--phase-prisha)'}}/>{ t('legendPrisha')}</div>
        <div className="li"><div className="lb" style={{background:'var(--phase-fertile)'}}/>{ t('legendFertile')}</div>
      </div>

      {/* Day detail panel */}
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

          {/* Add-event button — hidden while a form is open */}
          {!formMode && (
            <button
              onClick={openSheet}
              style={{
                display:'inline-flex',alignItems:'center',gap:6,marginTop:12,
                padding:'8px 18px',background:'var(--primary)',color:'#fff',
                border:'none',borderRadius:999,fontSize:13,cursor:'pointer',
                fontWeight:600,fontFamily:'inherit',
                boxShadow:'0 2px 8px rgba(0,0,0,0.12)',
                transition:'transform 160ms,filter 160ms',
              }}
            >
              <span style={{fontSize:18,lineHeight:1,marginTop:-1}}>+</span>
              {t('calAddEventBtn')}
            </button>
          )}

          {/* Recommended event form */}
          {formMode === 'recommended' && (
            <div style={{marginTop:14,borderTop:'0.5px solid var(--border)',paddingTop:14}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>
                {recommendedLabel}
              </div>
              {recommendedType === 'hpst' ? (
                <>
                  <div className="field" style={fieldStyle}>
                    <label>{t('calHpstLabel')}</label>
                    <input type="date" dir="ltr" value={addHpst} onChange={e=>setAddHpst(e.target.value)}/>
                  </div>
                  <div style={btnRowStyle}>
                    <button className="btn-primary" style={{flex:1,margin:0,padding:'11px 0',fontSize:14}} onClick={saveRecommended}>{t('calSaveBtn')}</button>
                    <button className="btn-ghost" style={{margin:0,padding:'11px 16px',fontSize:13,width:'auto'}} onClick={()=>setFormMode(null)}>{t('calCancelBtn')}</button>
                  </div>
                </>
              ) : (
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
                  <div style={btnRowStyle}>
                    <button className="btn-primary" style={{flex:1,margin:0,padding:'11px 0',fontSize:14}} onClick={saveRecommended}>{t('calSaveBtn')}</button>
                    <button className="btn-ghost" style={{margin:0,padding:'11px 16px',fontSize:13,width:'auto'}} onClick={()=>setFormMode(null)}>{t('calCancelBtn')}</button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Full / custom event form */}
          {formMode === 'custom' && (
            <div style={{marginTop:14,borderTop:'0.5px solid var(--border)',paddingTop:14}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>
                {t('calAddTitle')}
              </div>
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
              <div style={btnRowStyle}>
                <button className="btn-primary" style={{flex:1,margin:0,padding:'11px 0',fontSize:14}} onClick={saveCustom}>{t('calSaveBtn')}</button>
                <button className="btn-ghost" style={{margin:0,padding:'11px 16px',fontSize:13,width:'auto'}} onClick={()=>setFormMode(null)}>{t('calCancelBtn')}</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="detail-panel"><div className="d-empty">{t('calClickInfo')}</div></div>
      )}

      {/* Bottom sheet — event type picker */}
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

            {/* Custom / all events option */}
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
