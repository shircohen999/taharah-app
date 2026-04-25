// ═══════════════════════════════════════════════════════
// APP SHELL — state, routing, data persistence, render
// ═══════════════════════════════════════════════════════
const SKEY = 'niddah_v4';

function initialStage() {
  try { if(JSON.parse(localStorage.getItem('tahara_user_v1')||'null')) return 'app'; } catch {}
  return localStorage.getItem('tahara_stage_v1')==='app'?'app':
         localStorage.getItem('tahara_stage_v1')==='auth'?'auth':'intro';
}

const TABS=[
  {id:'calc',label:'חישוב'},
  {id:'calendar',label:'לוח'},
  {id:'predict',label:'תחזית'},
  {id:'history',label:'היסטוריה'},
  {id:'settings',label:'הגדרות'},
];

function App() {
  const [palette,setPaletteState]=React.useState(()=>localStorage.getItem('tahara_palette')||'rose');
  const [minhag,setMinhagState]=React.useState(()=>getMinhag());
  const [tab,setTab]=React.useState('calendar');
  const [stage,setStage]=React.useState(initialStage);
  const [user,setUser]=React.useState(null);
  const [cycles,setCycles]=React.useState(()=>{try{const s=localStorage.getItem(SKEY);return s?JSON.parse(s):[];}catch{return [];}});
  const [authLoading,setAuthLoading]=React.useState(true);
  const [syncStatus,setSyncStatus]=React.useState('מסונכרן');

  const setPalette=(p)=>{setPaletteState(p);localStorage.setItem('tahara_palette',p);};
  const setMinhag=(m)=>{setMinhagState(m);localStorage.setItem(MKEY,m);};

  React.useEffect(()=>{
    document.documentElement.setAttribute('data-palette',palette);
  },[palette]);

  React.useEffect(()=>{
    const tryBind=()=>{
      if(!window.__fb){setTimeout(tryBind,50);return;}
      const unsub=window.__fb.onAuthStateChanged(async(u)=>{
        setAuthLoading(false);
        if(u){
          setUser(u);
          localStorage.setItem('tahara_user_v1',JSON.stringify({email:u.email,name:u.displayName}));
          setStage('app');
          const c=await window.__fb.loadCycles(u.uid);
          setCycles(c);
        } else {
          localStorage.removeItem('tahara_user_v1');
          setUser(null);
          const saved=localStorage.getItem('tahara_stage_v1');
          if(saved==='app') setStage('app');
          else if(saved==='auth') setStage('auth');
        }
      });
      return unsub;
    };
    const cleanup=tryBind();
    return ()=>{ if(typeof cleanup==='function') cleanup(); };
  },[]);

  React.useEffect(()=>{localStorage.setItem('tahara_stage_v1',stage);},[stage]);

  const notifTimers=React.useRef([]);
  const scheduleNotifications=React.useCallback(()=>{
    notifTimers.current.forEach(t=>clearTimeout(t));
    notifTimers.current=[];
    if(!('Notification' in window)||Notification.permission!=='granted') return;
    const prefs=JSON.parse(localStorage.getItem(PKEY)||'{}');
    if(!prefs.enabled) return;
    const ND={hpstDays:0,sefirahDays:0,tvilaDays:0,prishaDays:1,nextDays:2,bedikaDays:0};
    const off=t=>prefs[`${t}Days`]!==undefined?prefs[`${t}Days`]:ND[`${t}Days`];
    const upcoming=[];
    cycles.forEach(c=>{
      const start=new Date(c.date);
      const hpstDate=c.hpst?new Date(c.hpst):ad(start,4);
      const sef=ad(hpstDate,1);
      const tvila=ad(sef,7);
      const hO=off('hpst'),sO=off('sefirah'),tO=off('tvila'),pO=off('prisha'),bO=off('bedika');
      if(prefs.hpst!==false) upcoming.push({date:ad(hpstDate,-hO),title:hO===0?'הפסק טהרה היום':`הפסק טהרה בעוד ${hO} ימים`,body:'זמן להפסק טהרה'});
      if(prefs.sefirah!==false) upcoming.push({date:ad(sef,-sO),title:sO===0?'תחילת ספירת 7 נקיים':`ספירת 7 נקיים בעוד ${sO} ימים`,body:'היום מתחילה ספירת 7 ימים נקיים'});
      if(prefs.bedika!==false){
        for(let i=0;i<7;i++){
          upcoming.push({
            date:ad(ad(sef,i),-bO),
            title:`בדיקה — יום ${i+1} מתוך 7`,
            body:`היום בדיקה של יום ${i+1} בספירת 7 הנקיים`
          });
        }
        upcoming.push({date:ad(tvila,-bO),title:'בדיקה — ליל הטבילה',body:'הלילה ליל הטבילה — לזכור בדיקה אחרונה'});
      }
      if(prefs.tvila!==false) upcoming.push({date:ad(tvila,-tO),title:tO===0?'ליל הטבילה':`ליל הטבילה בעוד ${tO} ימים`,body:'הלילה הוא ליל הטבילה. ברכה והצלחה!'});
      if(prefs.prisha!==false){
        upcoming.push({date:ad(ad(start,30),-pO),title:'עונת פרישה',body:'עונה בינונית (30 יום)'});
        upcoming.push({date:ad(nextHebSameDay(start),-pO),title:'עונת החודש',body:'עונת החודש מתקרבת'});
      }
    });
    const s=computeStats(cycles);
    if(prefs.next!==false&&s){
      const nO=off('next');
      upcoming.push({date:ad(s.nextV,-nO),title:nO===0?'ווסת צפוי היום':nO===1?'ווסת צפוי מחר':`ווסת צפוי בעוד ${nO} ימים`,body:`ווסת משוער: ${fheb(s.nextV)}`});
    }
    const now=new Date(), HORIZON=14*24*60*60*1000;
    const h=prefs.notifHour??8, m=prefs.notifMin??0;
    upcoming.forEach(({date,title,body})=>{
      const fireAt=new Date(date); fireAt.setHours(h,m,0,0);
      const ms=fireAt-now;
      if(ms>0&&ms<HORIZON) notifTimers.current.push(setTimeout(()=>new Notification(title,{body,lang:'he',dir:'rtl'}),ms));
    });
  },[cycles]);

  React.useEffect(()=>{scheduleNotifications();},[scheduleNotifications]);

  const saveCycle=async(c)=>{
    setCycles(prev=>{
      const entry={id:Date.now(),...c};
      const ei=prev.findIndex(x=>x.date===c.date);
      let next;
      if(ei>=0){entry.id=prev[ei].id;const copy=[...prev];copy[ei]=entry;next=copy;}
      else next=[entry,...prev].slice(0,24);
      localStorage.setItem(SKEY,JSON.stringify(next));
      if(user&&window.__fb) window.__fb.saveCycles(user.uid,next).then(ok=>{setSyncStatus(ok?'מסונכרן':'שגיאת סנכרון');});
      return next;
    });
  };

  const deleteCycle=(id)=>{
    setCycles(prev=>{
      const next=prev.filter(c=>c.id!==id);
      localStorage.setItem(SKEY,JSON.stringify(next));
      if(user&&window.__fb) window.__fb.saveCycles(user.uid,next);
      return next;
    });
  };

  const clearAll=()=>{
    if(!confirm('למחוק את כל ההיסטוריה?')) return;
    setCycles([]);
    localStorage.setItem(SKEY,JSON.stringify([]));
    if(user&&window.__fb) window.__fb.saveCycles(user.uid,[]);
  };

  const handleLogin=(u)=>{
    setUser(u);
    localStorage.setItem('tahara_user_v1',JSON.stringify({email:u.email,name:u.displayName}));
    setStage('app');
  };
  const handleGuest=()=>setStage('app');
  const handleLogout=async()=>{
    if(!confirm('להתנתק?')) return;
    if(user&&window.__fb) { await window.__fb.logout(); }
    localStorage.removeItem('tahara_user_v1');
    setUser(null);
    setStage('auth');
  };

  if(authLoading) return (
    <div className="loading-screen">
      <div className="loading-moon"/>
    </div>
  );

  if(stage==='intro') return <Onboarding onDone={()=>setStage('auth')}/>;
  if(stage==='auth')  return <AuthScreen onLogin={handleLogin} onGuest={handleGuest}/>;

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title display">לוח הטהרה</div>
          <div className="topbar-sub">{minhagLabel(minhag)}</div>
        </div>
        <button className="topbar-avatar" onClick={()=>setTab('settings')}>
          {(user?.displayName||user?.email||'א').charAt(0).toUpperCase()}
        </button>
      </div>

      <div className="tabs">
        {TABS.map(t=>(
          <button key={t.id} className={`tab${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
            <span className="tab-pill"/>
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="page active" style={tab==='calendar'?{padding:0}:{}}>
        {tab==='calc'     && <CalcScreen cycles={cycles} onSave={saveCycle}/>}
        {tab==='calendar' && <Calendar cycles={cycles} onAddCycle={saveCycle}/>}
        {tab==='predict'  && <PredictScreen cycles={cycles}/>}
        {tab==='history'  && <HistoryScreen cycles={cycles} onClear={clearAll} onDelete={deleteCycle}/>}
        {tab==='settings' && <SettingsScreen user={user} onLogout={handleLogout} palette={palette} setPalette={setPalette} syncStatus={syncStatus} minhag={minhag} setMinhag={setMinhag}/>}
        {tab!=='settings' && (
          <div style={{padding:'24px 20px 40px',textAlign:'center',fontSize:10.5,color:'var(--muted)',lineHeight:1.8,borderTop:'0.5px solid var(--border)',marginTop:8}}>
            <div>⚠️ כלי עזר אישי בלבד — אינו תחליף לייעוץ הלכתי או רפואי</div>
            <div style={{marginTop:4}}>© 2026 שיר וגילה כהן · <span dir="ltr" style={{unicodeBidi:'plaintext'}}>054-464-1746</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
