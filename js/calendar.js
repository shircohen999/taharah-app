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

const labelPhase = (txt) => {
  if (!txt) return null;
  if (txt === 'תחילת ווסת') return 'veset';
  if (txt === 'הפסק טהרה') return 'hpst';
  if (txt === 'תחילת ספירת 7 נקיים') return 'sefirah';
  if (txt === 'ליל הטבילה') return 'tvila';
  if (txt === 'ביוץ משוער') return 'fertile';
  if (txt.startsWith('עונת') || txt === 'עונה בינונית') return 'prisha';
  return null;
};

function Calendar({cycles, onAddCycle}) {
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
    if(!addDate||!addTime){alert('אנא בחרי תאריך ועונה');return;}
    onAddCycle({date:addDate,time:addTime,hpst:addHpst||null});
    setAddDate('');setAddTime('');setAddHpst('');
  };

  return (
    <div className="page active" style={{padding:0}}>
      <div className="month-nav">
        <button className="mnav-btn" onClick={()=>changeMonth(-1)}>‹</button>
        <div style={{textAlign:'center'}}>
          <div className="mlabel">{GREG_M[vm]} {vy}</div>
          <div className="mlabel2">{fhebMonth(first)}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <button className="today-chip" onClick={goToday}>היום</button>
          <button className="mnav-btn" onClick={()=>changeMonth(1)}>›</button>
        </div>
      </div>

      <div className="dow-row">
        {['א','ב','ג','ד','ה','ו','ש'].map(d=><div key={d} className="dow-cell">{d}</div>)}
      </div>

      <div className="cal-grid" key={key}>
        {cells.map((c,i)=>{
          const k=iso(c.date);
          const info=map[k];
          const phase=getDayPhase(info?.types);
          const isToday=iso(c.date)===iso(today);
          const isSelected=selected&&iso(selected)===k;
          const bar=info?.types.has('prisha')?'prisha':info?.types.has('fertile')&&!phase?'fertile':null;
          return (
            <div
              key={i}
              className={`cal-day${c.other?' other':''}${isToday?' today':''}${isSelected?' selected':''}`}
              data-phase={phase||undefined}
              style={{animationDelay:`${Math.min(i,35)*12}ms`}}
              onClick={()=>{ if(!c.other){setSelected(c.date);setAddDate(iso(c.date));} }}
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
        <div className="li"><div className="ld" style={{background:'var(--phase-veset)'}}/>תחילת ווסת</div>
        <div className="li"><div className="ld" style={{background:'#FFFFFF',border:'1.5px solid var(--phase-hpst)'}}/>הפסק טהרה</div>
        <div className="li"><div className="ld" style={{background:'var(--sefirah-soft)',border:'1.5px dashed var(--phase-sefirah)'}}/>7 נקיים</div>
        <div className="li"><div className="ld" style={{background:'var(--tvila-soft)',border:'1.5px solid var(--phase-tvila)'}}/>ליל הטבילה</div>
        <div className="li"><div className="ld" style={{background:'var(--tahora-soft)'}}/>טהורה</div>
        <div className="li"><div className="lb" style={{background:'var(--phase-prisha)'}}/>עונת פרישה</div>
        <div className="li"><div className="lb" style={{background:'var(--phase-fertile)'}}/>חלון פוריות</div>
      </div>

      {selected ? (
        <div className="detail-panel" key={iso(selected)}>
          <div className="d-date">{DAY_FULL[selected.getDay()]}, {selected.getDate()}/{selected.getMonth()+1} · {fheb(selected)}</div>
          {selectedInfo?.labels?.length ? (
            <div className="d-tags">
              {selectedInfo.labels.map((l,i)=>{
                const ph=labelPhase(l);
                return <span key={i} className={`dtag${ph?` dtag-${ph}`:''}`}>{l}</span>;
              })}
            </div>
          ) : <div className="d-empty">אין אירועים ביום זה</div>}
        </div>
      ) : (
        <div className="detail-panel"><div className="d-empty">לחצי על יום לפרטים</div></div>
      )}

      <div style={{padding:'0 16px 40px'}}>
        <div className="sec-label">הוסיפי ווסת חדש</div>
        <div className="card">
          <div className="field">
            <label>תאריך</label>
            <input type="date" value={addDate} onChange={e=>setAddDate(e.target.value)}/>
          </div>
          <div className="field">
            <label>עונה</label>
            <select value={addTime} onChange={e=>setAddTime(e.target.value)}>
              <option value="">— בחרי עונה —</option>
              <option value="day">🌞 יום (לפני שקיעה)</option>
              <option value="night">🌙 לילה (אחרי שקיעה)</option>
            </select>
          </div>
          <div className="field">
            <label>הפסק טהרה בפועל (אופציונלי)</label>
            <input type="date" value={addHpst} onChange={e=>setAddHpst(e.target.value)}/>
          </div>
        </div>
        <button className="btn-primary" onClick={handleAdd}>הוסיפי ללוח</button>
      </div>
    </div>
  );
}
