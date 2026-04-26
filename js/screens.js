// ═══════════════════════════════════════════════════════
// SCREENS — CalcScreen, PredictScreen, HistoryScreen, Toggle
// ═══════════════════════════════════════════════════════
function CalcScreen({cycles, onSave}) {
  const [date,setDate]=React.useState('');
  const [time,setTime]=React.useState('');
  const [prev,setPrev]=React.useState(cycles[0]?.date||'');
  const [hpst,setHpst]=React.useState('');
  const [results,setResults]=React.useState(null);
  React.useEffect(()=>{if(!prev&&cycles[0])setPrev(cycles[0].date);},[cycles]);

  const calc=()=>{
    if(!date){alert(t('alertNoDate'));return;}
    if(!time){alert(t('alertNoOnah'));return;}
    const vDate=new Date(date);
    const isNight=time==='night';
    const hpstDate=hpst?new Date(hpst):ad(vDate,4);
    const sef=ad(hpstDate,1);
    const tvila=ad(hpstDate,7);
    const onot=[];
    if(prev&&diff(date,prev)>0) onot.push({name:t('phaseHaflagah',diff(date,prev)),sub:t('calcHaflagahSub',diff(date,prev)),d:ad(vDate,diff(date,prev))});
    else onot.push({name:t('phaseHaflagah','?'),sub:t('calcHaflagahNoSub'),d:null});
    onot.push({name:t('phaseAvgOnah'),sub:t('calcMiddleSub'),d:ad(vDate,30)});
    onot.push({name:t('phaseMonthOnah'),sub:t('calcMonthSub'),d:nextHebSameDay(vDate)});
    setResults({vDate,isNight,hpstDate,sef,tvila,onot,customHpst:!!hpst});
    onSave({date,time,hpst:hpst||null});
  };

  return (
    <div>
      <div className="sec-label">{t('calcTitle')}</div>
      <div className="card">
        <div className="field"><label>{t('calcDateLabel')}</label><input type="date" dir="ltr" value={date} onChange={e=>setDate(e.target.value)}/></div>
        <div className="field">
          <label>{t('calOnahLabel')}</label>
          <select value={time} onChange={e=>setTime(e.target.value)}>
            <option value="">{t('calOnahPlaceholder')}</option>
            <option value="day">{t('calOnahDay')}</option>
            <option value="night">{t('calOnahNight')}</option>
          </select>
        </div>
        <div className="field"><label>{t('calHpstLabel')}</label><input type="date" dir="ltr" value={hpst} onChange={e=>setHpst(e.target.value)}/></div>
      </div>
      <div className="sec-label">{t('calcPrevTitle')}</div>
      <div className="card">
        <div className="field"><label>{t('calcPrevLabel')}</label><input type="date" dir="ltr" value={prev} onChange={e=>setPrev(e.target.value)}/></div>
      </div>
      <button className="btn-primary" onClick={calc}>{t('calcBtn')}</button>

      {results && (
        <div key={date+time+hpst}>
          <div className="sec-label">{t('calcResultsTitle')}</div>
          <div className="card reveal">
            <div className="result-row">
              <div>
                <div className="rl">{t('calcTvilaLabel')}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{t('calcTvilaSub', results.isNight?t('calcTvilaNight'):t('calcTvilaDay'))}</div>
              </div>
              <div className="rv accent">{fheb(results.tvila)}</div>
            </div>
            <div className="result-row">
              <div className="rl">{t('calcHpstLabel')}</div>
              <div className="rv">{fheb(results.hpstDate)}{results.customHpst&&<div style={{fontSize:10,color:'var(--phase-hpst)',marginTop:2}}>{t('calcHpstCustom')}</div>}</div>
            </div>
            <div className="result-row">
              <div className="rl">{t('calcSefirahLabel')}</div>
              <div className="rv">{fheb(results.sef)}</div>
            </div>
            <div className="result-row">
              <div className="rl">{t('calcBedikotLabel')}</div>
              <div className="rv" style={{fontSize:11}}>
                <div>{t('calcBedikotDay1',fheb(results.sef))}</div>
                <div>{t('calcBedikotDay7',fheb(ad(results.sef,6)))}</div>
              </div>
            </div>
          </div>
          <div className="sec-label">{t('calcOnahTitle')}</div>
          <div className="card reveal">
            {results.onot.map((o,i)=>(
              <div key={i} className="result-row">
                <div>
                  <div className="rl" style={{fontWeight:500,color:'var(--text)'}}>{o.name}</div>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{o.sub}</div>
                </div>
                <div className="rv">
                  {o.d ? (
                    <><div>{fheb(o.d)}</div><div style={{fontSize:10,color:'var(--muted)'}}>{dayFull(o.d.getDay())} · {results.isNight?t('calcTvilaNight'):t('calcTvilaDay')}</div></>
                  ) : <span style={{color:'var(--muted)',fontSize:12}}>{t('calcUnknown')}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="tip" dangerouslySetInnerHTML={{__html:t('calcTip')}}/>
        </div>
      )}
    </div>
  );
}

function PredictScreen({cycles}) {
  if(cycles.length<2) return <div style={{textAlign:'center',padding:'60px 20px',color:'var(--muted)',fontSize:14,lineHeight:1.7}}>{t('predictMinCycles')}</div>;
  const s=computeStats(cycles);
  if(!s) return null;
  const dt=s.daysUntil>0?t('predictDaysUntil',s.daysUntil):s.daysUntil===0?t('predictToday'):t('predictDaysAgo',Math.abs(s.daysUntil));
  return (
    <div className="reveal">
      <div className="sec-label">{t('predictTitle')}</div>
      <div className="card">
        <div className="result-row"><div><div className="rl">{t('predictNextLabel')}</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{dt}</div></div><div className="rv accent">{fheb(s.nextV)}</div></div>
        <div className="result-row"><div><div className="rl">{t('predictOvLabel')}</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{t('predictOvSub')}</div></div><div className="rv" style={{color:'var(--phase-fertile)'}}>{fheb(s.ov)}</div></div>
        <div className="result-row"><div className="rl">{t('predictFertLabel')}</div><div className="rv" style={{fontSize:11}}><div>{fheb(s.fertStart)}</div><div style={{color:'var(--muted)'}}>{t('predictFertTo',fheb(s.fertEnd))}</div></div></div>
      </div>
      <div className="sec-label">{t('predictStatsTitle')}</div>
      <div className="card">
        <div className="result-row"><div className="rl">{t('predictAvg')}</div><div className="rv">{s.avg} {t('predictDaysUnit')}</div></div>
        <div className="result-row"><div className="rl">{t('predictWavg')}</div><div className="rv">{s.wavg} {t('predictDaysUnit')}</div></div>
        <div className="result-row"><div className="rl">{t('predictStddev')}</div><div className="rv">± {s.stddev} {t('predictDaysUnit')}</div></div>
        <div className="result-row"><div className="rl">{t('predictRange')}</div><div className="rv">{s.min}–{s.max} {t('predictDaysUnit')}</div></div>
        <div className="result-row"><div className="rl">{t('predictReg')}</div><div className="rv"><span style={{fontSize:11,padding:'3px 10px',borderRadius:999,color:'var(--phase-tahora)',background:'var(--tahora-soft)'}}>{s.regLabel}</span></div></div>
      </div>
      {s.count<3 && (
        <div className="tip" style={{background:'var(--hpst-soft)',color:'var(--phase-hpst-ink)'}} dangerouslySetInnerHTML={{__html:t('predictWarnSmall',s.count)}}/>
      )}
      <div className="tip" dangerouslySetInnerHTML={{__html:t('predictTip',s.count+1,s.count)}}/>
    </div>
  );
}

function HistoryScreen({cycles, onClear, onDelete}) {
  const sorted=[...cycles].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const s=computeStats(cycles);
  const damLen=(c)=>c.hpst?diff(c.hpst,c.date):null;
  const damLens=cycles.map(damLen).filter(x=>x!==null&&x>0);
  const damAvg=damLens.length?Math.round(damLens.reduce((a,b)=>a+b,0)/damLens.length*10)/10:null;
  if(!cycles.length) return (
    <div style={{textAlign:'center',padding:'60px 20px',color:'var(--muted)',fontSize:14,lineHeight:1.7}}>
      {t('histNoCycles').split('\n').map((l,i)=><div key={i}>{l}</div>)}
    </div>
  );
  return (
    <div>
      <div className="stat-row reveal">
        <div className="stat-card"><div className="stat-label">{t('histCyclesLabel')}</div><div className="stat-val">{cycles.length}</div></div>
        {s&&<div className="stat-card"><div className="stat-label">{t('histAvgLabel')}</div><div className="stat-val">{s.avg}<span style={{fontSize:12,color:'var(--muted)',marginRight:4}}>{t('histDaysUnit')}</span></div></div>}
        <div className="stat-card">
          <div className="stat-label">{t('histDamLabel')}</div>
          <div className="stat-val">
            {damAvg!==null?<>{damAvg}<span style={{fontSize:12,color:'var(--muted)',marginRight:4}}>{t('histDaysUnit')}</span></>:<span style={{fontSize:13,color:'var(--muted)',fontWeight:400}}>—</span>}
          </div>
        </div>
      </div>
      {s&&<div className="stat-row reveal">
        <div className="stat-card"><div className="stat-label">{t('histStddevLabel')}</div><div className="stat-val">±{s.stddev}</div></div>
        <div className="stat-card"><div className="stat-label">{t('histDamSamplesLabel')}</div><div className="stat-val">{damLens.length}<span style={{fontSize:12,color:'var(--muted)',marginRight:4}}>/{cycles.length}</span></div></div>
      </div>}
      <div className="sec-label">{t('histSavedTitle')}</div>
      <div className="card reveal">
        {sorted.map((c,i)=>{
          const d=new Date(c.date);
          const prev=sorted[i+1];
          const gap=prev?diff(c.date,prev.date):null;
          const dl=damLen(c);
          const damStr=dl!==null&&dl>0?t('histDamDays',dl):c.hpst?null:t('histDamOpen');
          return (
            <div key={c.id||i} className="hist-item" style={{animationDelay:`${i*40}ms`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500}}>{dayFull(d.getDay())} · {d.getDate()}/{d.getMonth()+1}/{d.getFullYear()}</div>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:3}}>{fheb(d)} · {c.time==='night'?t('calOnahNight'):t('calOnahDay')}{gap&&t('histCycleLen',gap)}</div>
                  {damStr&&<div style={{fontSize:11,color:dl===null?'var(--phase-veset)':'var(--phase-sefirah)',marginTop:4,fontWeight:500}}>{damStr}</div>}
                </div>
                <button className="mnav-btn" style={{fontSize:16,opacity:0.5}} onClick={()=>onDelete(c.id)}>×</button>
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn-ghost" onClick={onClear}>{t('histClearBtn')}</button>
    </div>
  );
}

function Toggle({value, onChange}) {
  return (
    <button onClick={()=>onChange(!value)} style={{width:44,height:26,borderRadius:13,background:value?'var(--primary)':'var(--border-mid)',border:'none',cursor:'pointer',position:'relative',transition:`background-color var(--t-med) var(--ease-out)`}}>
      <div style={{position:'absolute',top:3,right:value?3:21,width:20,height:20,borderRadius:10,background:'#fff',transition:`right var(--t-med) var(--ease-spring)`,boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
    </button>
  );
}
