// ═══════════════════════════════════════════════════════
// ONBOARDING — splash screens shown on first visit
// ═══════════════════════════════════════════════════════
function MoonArt() {
  return (
    <div className="onb-mandala">
      <div className="onb-ring"/><div className="onb-ring"/><div className="onb-ring"/><div className="onb-ring"/>
      <div className="onb-moon"/>
    </div>
  );
}

function PhaseArt() {
  const phases=[
    {color:'var(--phase-veset)',label:'ווסת',fill:'var(--phase-veset)',strong:null},
    {color:'var(--phase-hpst)',label:'הפסק',fill:'#FFFFFF',strong:'var(--phase-hpst)'},
    {color:'var(--phase-sefirah)',label:'7 נקיים',fill:'var(--phase-sefirah)',strong:null},
    {color:'var(--phase-tvila)',label:'טבילה',fill:'var(--phase-tvila)',strong:null},
    {color:'var(--phase-tahora)',label:'טהורה',fill:'var(--phase-tahora)',strong:null},
  ];
  const [fill,setFill]=React.useState(0);
  React.useEffect(()=>{const id=setInterval(()=>setFill(f=>(f+1)%(phases.length+2)),700);return()=>clearInterval(id);},[]);
  return (
    <div style={{display:'flex',gap:10,alignItems:'center',justifyContent:'center',marginBottom:30,marginTop:30}}>
      {phases.map((p,i)=>{
        const isFilled=i<fill;
        return (
          <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <div style={{width:28,height:28,borderRadius:14,background:isFilled?p.fill:'transparent',border:`2px solid ${p.strong||p.color}`,boxShadow:isFilled&&p.fill==='#FFFFFF'?'0 1px 3px rgba(0,0,0,0.08)':'none',transition:'background-color 400ms cubic-bezier(0.34,1.56,0.64,1),transform 400ms cubic-bezier(0.34,1.56,0.64,1)',transform:isFilled?'scale(1)':'scale(0.85)'}}/>
            <div style={{fontSize:9,color:'var(--muted)'}}>{p.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function DayNightArt() {
  const [isNight,setIsNight]=React.useState(false);
  React.useEffect(()=>{const id=setInterval(()=>setIsNight(n=>!n),2000);return()=>clearInterval(id);},[]);
  return (
    <div style={{width:180,height:100,borderRadius:50,background:isNight?'#2A2240':'#F4D994',position:'relative',transition:'background-color 1.2s ease',overflow:'hidden',marginBottom:20,marginTop:20,boxShadow:'inset 0 0 24px rgba(0,0,0,0.08)'}}>
      <div style={{position:'absolute',top:'50%',left:isNight?'25%':'75%',transform:'translate(-50%,-50%)',width:50,height:50,borderRadius:25,background:isNight?'#F5EFD6':'#F39B4F',boxShadow:isNight?'0 0 40px rgba(245,239,214,0.5)':'0 0 50px rgba(243,155,79,0.6)',transition:'left 1.2s cubic-bezier(0.65,0,0.35,1),background-color 1.2s ease'}}>
        {isNight&&<><div style={{position:'absolute',top:8,right:14,width:8,height:8,borderRadius:4,background:'#2A2240'}}/><div style={{position:'absolute',top:20,right:8,width:5,height:5,borderRadius:2.5,background:'#2A2240'}}/></>}
      </div>
      {isNight&&<><div style={{position:'absolute',top:15,right:40,width:2,height:2,borderRadius:1,background:'#fff',opacity:0.8}}/><div style={{position:'absolute',top:30,right:70,width:1.5,height:1.5,borderRadius:1,background:'#fff',opacity:0.6}}/><div style={{position:'absolute',top:70,right:50,width:2,height:2,borderRadius:1,background:'#fff',opacity:0.7}}/></>}
    </div>
  );
}

function Onboarding({onDone}) {
  const [step,setStep]=React.useState(0);
  const steps=[
    {title:'ברוכה הבאה',sub:'לוח הטהרה האישי שלך — פרטי, שקט, מדויק.',art:<MoonArt/>},
    {title:'הלוח מבין הכל',sub:'הפסק טהרה, שבעה נקיים, ליל הטבילה ושלוש עונות הפרישה — מחושבים אוטומטית.',art:<PhaseArt/>},
    {title:'יום ולילה — לפי ההלכה',sub:'הלוח זוכר אם הווסת נראתה ביום או בלילה, ומתאים את עונות הפרישה בלי להסתבך.',art:<DayNightArt/>},
  ];
  const next=()=>{if(step<steps.length-1)setStep(step+1);else onDone();};
  return (
    <div className="onb-overlay">
      <div className="onb-stage">
        <div className="onb-content" key={step} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
          {steps[step].art}
          <div className="onb-title display">{steps[step].title}</div>
          <div className="onb-sub">{steps[step].sub}</div>
        </div>
      </div>
      <div className="onb-dots">
        {steps.map((_,i)=><div key={i} className={`onb-dot${i===step?' active':''}`}/>)}
      </div>
      <button className="btn-primary" style={{marginBottom:0}} onClick={next}>
        {step<steps.length-1?'המשיכי':'בואי נתחיל'}
      </button>
      <button className="btn-ghost" style={{marginTop:8,border:'none'}} onClick={onDone}>דלגי</button>
    </div>
  );
}
