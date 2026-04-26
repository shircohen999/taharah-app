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

  const selectedInfo=selected?map[iso(selected)]:null;
  const [addDate,setAddDate]=React.useState('');
  const [addTime,setAddTime]=React.useState('');
  const [addHpst,setAddHpst]=React.useState('');
  const handleAdd=()=>{
    if(!addDate||!addTime){alert(t('alertNoDateOnah'));return;}
    onAddCycle({date:addDate,time:addTime,hpst:addHpst||null});
    setAddDate('');setAddTime('');setAddHpst('');
  };

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
                if(c.other){
                  setViewDate(new Date(c.date.getFullYear(),c.date.getMonth(),1));
                  setKey(prev=>prev+1);
                }
                setSelected(c.date);
                const dateStr=iso(c.date);
                setAddDate(dateStr);
                const existing=cycles.find(cy=>cy.date===dateStr);
                if(existing){setAddTime(existing.time||'');setAddHpst(existing.hpst||'');}
                else{setAddTime('');setAddHpst('');}
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
        </div>
      ) : (
        <div className="detail-panel"><div className="d-empty">{t('calClickInfo')}</div></div>
      )}

      <div style={{padding:'0 16px 40px'}}>
        <div className="sec-label">{t('calAddTitle')}</div>
        <div className="card">
          <div className="field">
            <label>{t('calDateLabel')}</label>
            <input type="date" dir="ltr" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
          </div>
          <div className="field">
            <label>{t('calOnahLabel')}</label>
            <select value={addTime} onChange={e=>setAddTime(e.target.value)}>
              <option value="">{t('calOnahPlaceholder')}</option>
              <option value="day">{t('calOnahDay')}</option>
              <option value="night">{t('calOnahNight')}</option>
            </select>
          </div>
          <div className="field">
            <label>{t('calHpstLabel')}</label>
            <input type="date" dir="ltr" value={addHpst} onChange={e=>setAddHpst(e.target.value)}/>
          </div>
        </div>
        <button className="btn-primary" onClick={handleAdd}>{t('calAddBtn')}</button>
      </div>
    </div>
  );
}
