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
    if(!date){alert('אנא בחרי תאריך');return;}
    if(!time){alert('אנא בחרי עונה');return;}
    const vDate=new Date(date);
    const isNight=time==='night';
    const hpstDate=hpst?new Date(hpst):ad(vDate,4);
    const sef=ad(hpstDate,1);
    const tvila=ad(hpstDate,7);
    const onot=[];
    if(prev&&diff(date,prev)>0) onot.push({name:'עונת ההפלגה',sub:`${diff(date,prev)} ימים מהווסת הקודם`,d:ad(vDate,diff(date,prev))});
    else onot.push({name:'עונת ההפלגה',sub:'הכניסי ווסת קודם',d:null});
    onot.push({name:'עונה בינונית',sub:'30 יום מהווסת הנוכחי',d:ad(vDate,30)});
    onot.push({name:'עונת החודש',sub:'תאריך עברי זהה בחודש הבא',d:nextHebSameDay(vDate)});
    setResults({vDate,isNight,hpstDate,sef,tvila,onot,customHpst:!!hpst});
    onSave({date,time,hpst:hpst||null,tvila:iso(tvila)});
  };

  return (
    <div>
      <div className="sec-label">פרטי הווסת הנוכחי</div>
      <div className="card">
        <div className="field"><label>תאריך תחילת הווסת</label><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
        <div className="field">
          <label>עונת הראייה</label>
          <select value={time} onChange={e=>setTime(e.target.value)}>
            <option value="">— בחרי עונה —</option>
            <option value="day">🌞 יום (לפני שקיעה)</option>
            <option value="night">🌙 לילה (אחרי שקיעה)</option>
          </select>
        </div>
        <div className="field"><label>הפסק טהרה בפועל (אופציונלי)</label><input type="date" value={hpst} onChange={e=>setHpst(e.target.value)}/></div>
      </div>
      <div className="sec-label">ווסת קודם</div>
      <div className="card">
        <div className="field"><label>תאריך ווסת קודם (לחישוב הפלגה)</label><input type="date" value={prev} onChange={e=>setPrev(e.target.value)}/></div>
      </div>
      <button className="btn-primary" onClick={calc}>חשבי תאריכים ושמרי</button>

      {results && (
        <div key={date+time+hpst}>
          <div className="sec-label">תאריכי מפתח</div>
          <div className="card reveal">
            <div className="result-row">
              <div>
                <div className="rl">ליל הטבילה המוקדם</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>הפסק טהרה + 7 נקיים · עונת {results.isNight?'לילה':'יום'}</div>
              </div>
              <div className="rv accent">{fheb(results.tvila)}</div>
            </div>
            <div className="result-row">
              <div className="rl">הפסק טהרה</div>
              <div className="rv">{fheb(results.hpstDate)}{results.customHpst&&<div style={{fontSize:10,color:'var(--phase-hpst)',marginTop:2}}>✎ תאריך מותאם</div>}</div>
            </div>
            <div className="result-row">
              <div className="rl">תחילת ספירת 7 נקיים</div>
              <div className="rv">{fheb(results.sef)}</div>
            </div>
            <div className="result-row">
              <div className="rl">בדיקות</div>
              <div className="rv" style={{fontSize:11}}>
                <div>יום א׳: {fheb(results.sef)}</div>
                <div>יום ז׳: {fheb(ad(results.sef,6))}</div>
              </div>
            </div>
          </div>
          <div className="sec-label">שלוש עונות הפרישה</div>
          <div className="card reveal">
            {results.onot.map((o,i)=>(
              <div key={i} className="result-row">
                <div>
                  <div className="rl" style={{fontWeight:500,color:'var(--text)'}}>{o.name}</div>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{o.sub}</div>
                </div>
                <div className="rv">
                  {o.d ? (
                    <><div>{fheb(o.d)}</div><div style={{fontSize:10,color:'var(--muted)'}}>{DAY_FULL[o.d.getDay()]} · {results.isNight?'לילה':'יום'}</div></>
                  ) : <span style={{color:'var(--muted)',fontSize:12}}>לא ידוע</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="tip">פ״ו ה״ה: פרישה בשלוש עונות — הפלגה, עונה בינונית (30 יום), ועונת החודש — כולן באותה עונת יום/לילה כווסת.</div>
        </div>
      )}
    </div>
  );
}

function PredictScreen({cycles}) {
  if(cycles.length<2) return <div style={{textAlign:'center',padding:'60px 20px',color:'var(--muted)',fontSize:14,lineHeight:1.7}}>הכניסי לפחות 2 מחזורים כדי לקבל תחזית אישית.</div>;
  const s=computeStats(cycles);
  if(!s) return null;
  const dt=s.daysUntil>0?`בעוד ${s.daysUntil} ימים`:s.daysUntil===0?'היום':`לפני ${Math.abs(s.daysUntil)} ימים`;
  return (
    <div className="reveal">
      <div className="sec-label">תחזית אישית</div>
      <div className="card">
        <div className="result-row"><div><div className="rl">ווסת הבא המשוער</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{dt}</div></div><div className="rv accent">{fheb(s.nextV)}</div></div>
        <div className="result-row"><div><div className="rl">ביוץ משוער</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>14 ימים לפני הווסת</div></div><div className="rv" style={{color:'var(--phase-fertile)'}}>{fheb(s.ov)}</div></div>
        <div className="result-row"><div className="rl">חלון פוריות</div><div className="rv" style={{fontSize:11}}><div>{fheb(s.fertStart)}</div><div style={{color:'var(--muted)'}}>עד {fheb(s.fertEnd)}</div></div></div>
      </div>
      <div className="sec-label">סטטיסטיקת מחזור</div>
      <div className="card">
        <div className="result-row"><div className="rl">ממוצע אורך מחזור</div><div className="rv">{s.avg} ימים</div></div>
        <div className="result-row"><div className="rl">ממוצע משוקלל</div><div className="rv">{s.wavg} ימים</div></div>
        <div className="result-row"><div className="rl">סטיית תקן</div><div className="rv">± {s.stddev} ימים</div></div>
        <div className="result-row"><div className="rl">טווח</div><div className="rv">{s.min}–{s.max} ימים</div></div>
        <div className="result-row"><div className="rl">רגולריות</div><div className="rv"><span style={{fontSize:11,padding:'3px 10px',borderRadius:999,color:'var(--phase-tahora)',background:'var(--tahora-soft)'}}>{s.regLabel}</span></div></div>
      </div>
      <div className="tip"><strong>חישוב ביוץ:</strong> שיטת Ogino-Knaus — שלב לוטיאלי קבוע של כ-14 יום. התחזית מתייחסת ל-{s.count} מחזורים שמורים.</div>
    </div>
  );
}

function HistoryScreen({cycles, onClear, onDelete}) {
  const sorted=[...cycles].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const s=computeStats(cycles);
  if(!cycles.length) return <div style={{textAlign:'center',padding:'60px 20px',color:'var(--muted)',fontSize:14,lineHeight:1.7}}>עדיין אין היסטוריה.<br/>הוסיפי את הווסת הראשון מהמסך <strong>חישוב</strong>.</div>;
  return (
    <div>
      <div className="stat-row reveal">
        <div className="stat-card"><div className="stat-label">מחזורים</div><div className="stat-val">{cycles.length}</div></div>
        {s&&<div className="stat-card"><div className="stat-label">ממוצע</div><div className="stat-val">{s.avg}<span style={{fontSize:12,color:'var(--muted)',marginRight:4}}>י'</span></div></div>}
        {s&&<div className="stat-card"><div className="stat-label">סטיה</div><div className="stat-val">±{s.stddev}</div></div>}
      </div>
      <div className="sec-label">מחזורים שמורים</div>
      <div className="card reveal">
        {sorted.map((c,i)=>{
          const d=new Date(c.date);
          const prev=sorted[i+1];
          const gap=prev?diff(c.date,prev.date):null;
          return (
            <div key={c.id||i} className="hist-item" style={{animationDelay:`${i*40}ms`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500}}>{DAY_FULL[d.getDay()]} · {d.getDate()}/{d.getMonth()+1}/{d.getFullYear()}</div>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:3}}>{fheb(d)} · {c.time==='night'?'🌙 לילה':'🌞 יום'}{gap&&` · מחזור ${gap} ימים`}</div>
                </div>
                <button className="mnav-btn" style={{fontSize:16,opacity:0.5}} onClick={()=>onDelete(c.id)}>×</button>
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn-ghost" onClick={onClear}>מחקי את כל ההיסטוריה</button>
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
