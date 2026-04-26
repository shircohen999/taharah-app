// ═══════════════════════════════════════════════════════
// APP SHELL — state, routing, data persistence, render
// ═══════════════════════════════════════════════════════
const SKEY = 'niddah_v4';

function initialStage() {
  try { if(JSON.parse(localStorage.getItem('tahara_user_v1')||'null')) return 'app'; } catch {}
  return 'intro';
}

function App() {
  const [palette,setPaletteState]=React.useState(()=>localStorage.getItem('tahara_palette')||'rose');
  const [minhag,setMinhagState]=React.useState(()=>getMinhag());
  const [lang,setLangState]=React.useState(()=>window.__getLang?window.__getLang():'he');
  const [tab,setTab]=React.useState('calendar');
  const [stage,setStage]=React.useState(initialStage);
  const [user,setUser]=React.useState(null);
  const [cycles,setCycles]=React.useState(()=>{try{const s=localStorage.getItem(SKEY);return s?JSON.parse(s):[];}catch{return [];}});
  const [authLoading,setAuthLoading]=React.useState(true);
  const [syncStatus,setSyncStatus]=React.useState('synced');

  const setPalette=(p)=>{setPaletteState(p);localStorage.setItem('tahara_palette',p);};
  const setMinhag=(m)=>{setMinhagState(m);localStorage.setItem(MKEY,m);};
  const changeLang=(l)=>{ window.__setLang(l); setLangState(l); };

  React.useEffect(()=>{
    document.documentElement.setAttribute('data-palette',palette);
  },[palette]);

  React.useEffect(()=>{
    const safety=setTimeout(()=>setAuthLoading(false), 5000);
    const tryBind=()=>{
      if(!window.__fb){setTimeout(tryBind,50);return;}
      const unsub=window.__fb.onAuthStateChanged(async(u)=>{
        clearTimeout(safety);
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
          // Only redirect if currently in-app (logout); don't interrupt onboarding/auth
          setStage(prev=>prev==='app'?'intro':prev);
        }
      });
      return unsub;
    };
    const cleanup=tryBind();
    return ()=>{ clearTimeout(safety); if(typeof cleanup==='function') cleanup(); };
  },[]);

  const notifTimers=React.useRef([]);
  const scheduleNotifications=React.useCallback(()=>{
    notifTimers.current.forEach(tid=>clearTimeout(tid));
    notifTimers.current=[];
    if(!('Notification' in window)||Notification.permission!=='granted') return;
    const prefs=JSON.parse(localStorage.getItem(PKEY)||'{}');
    if(!prefs.enabled) return;
    const ND={hpstDays:0,sefirahDays:0,tvilaDays:0,prishaDays:1,nextDays:2,bedikaDays:0};
    const off=type=>prefs[`${type}Days`]!==undefined?prefs[`${type}Days`]:ND[`${type}Days`];
    const upcoming=[];
    const vesetCyclesNotif=cycles.filter(c=>!c.type||c.type==='veset');
    vesetCyclesNotif.forEach(c=>{
      const start=new Date(c.date);
      const hpstDate=c.hpst?new Date(c.hpst):ad(start,4);
      const sef=ad(hpstDate,1);
      const tvila=ad(hpstDate,7);
      const hO=off('hpst'),sO=off('sefirah'),tO=off('tvila'),pO=off('prisha'),bO=off('bedika');
      if(prefs.hpst!==false)    upcoming.push({date:ad(hpstDate,-hO),title:hO===0?t('notifHpstToday'):t('notifHpstDays',hO),body:t('notifHpstBody')});
      if(prefs.sefirah!==false) upcoming.push({date:ad(sef,-sO),title:sO===0?t('notifSefirahToday'):t('notifSefirahDays',sO),body:t('notifSefirahBody')});
      if(prefs.bedika!==false){
        for(let i=0;i<7;i++){
          upcoming.push({date:ad(ad(sef,i),-bO),title:t('notifBedikaDay',i+1),body:t('notifBedikaBody',i+1)});
        }
        upcoming.push({date:ad(tvila,-bO),title:t('notifBedikaTvila'),body:t('notifBedikaTvilaBody')});
      }
      if(prefs.tvila!==false)   upcoming.push({date:ad(tvila,-tO),title:tO===0?t('notifTvilaToday'):t('notifTvilaDays',tO),body:t('notifTvilaBody')});
      if(prefs.prisha!==false){
        upcoming.push({date:ad(ad(start,30),-pO),title:t('notifPrishaTitle'),body:t('notifPrishaBody')});
        upcoming.push({date:ad(nextHebSameDay(start),-pO),title:t('notifMonthTitle'),body:t('notifMonthBody')});
      }
    });
    const s=computeStats(cycles);
    if(prefs.next!==false&&s){
      const nO=off('next');
      upcoming.push({date:ad(s.nextV,-nO),title:nO===0?t('notifNextToday'):nO===1?t('notifNextTomorrow'):t('notifNextDays',nO),body:t('notifNextBody',fheb(s.nextV))});
    }
    const now=new Date(), HORIZON=14*24*60*60*1000;
    const h=prefs.notifHour??8, m=prefs.notifMin??0;
    upcoming.forEach(({date,title,body})=>{
      const fireAt=new Date(date); fireAt.setHours(h,m,0,0);
      const ms=fireAt-now;
      if(ms>0&&ms<HORIZON) notifTimers.current.push(setTimeout(()=>new Notification(title,{body,lang:lang,dir:lang==='en'?'ltr':'rtl'}),ms));
    });
  },[cycles,lang]);

  React.useEffect(()=>{scheduleNotifications();},[scheduleNotifications]);

  const saveCycle=async(c)=>{
    setCycles(prev=>{
      const entry={id:Date.now(),...c};
      let next;
      if(!c.type||c.type==='veset'){
        // veset: one per date — update if exists
        const ei=prev.findIndex(x=>x.date===c.date&&(!x.type||x.type==='veset'));
        if(ei>=0){entry.id=prev[ei].id;const copy=[...prev];copy[ei]=entry;next=copy;}
        else next=[entry,...prev];
      } else {
        // non-veset events: always add new (no dedup)
        next=[entry,...prev];
      }
      next=next.slice(0,120);
      localStorage.setItem(SKEY,JSON.stringify(next));
      if(user&&window.__fb) window.__fb.saveCycles(user.uid,next).then(ok=>{setSyncStatus(ok?'synced':'sync_error');});
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
    if(!confirm(t('confirmClearHistory'))) return;
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
    if(!confirm(t('confirmLogout'))) return;
    if(user&&window.__fb) { await window.__fb.logout(); }
    localStorage.removeItem('tahara_user_v1');
    setUser(null);
    setStage('intro');
  };

  if(authLoading) return (
    <div className="loading-screen">
      <AppLogo size={64} className="loading-logo"/>
    </div>
  );

  const completeOnboarding=()=>setStage('auth');
  if(stage==='intro') return <Onboarding onDone={completeOnboarding} lang={lang}/>;
  if(stage==='auth')  return <AuthScreen onLogin={handleLogin} onGuest={handleGuest} setMinhag={setMinhag} lang={lang} changeLang={changeLang}/>;

  const TABS=[
    {id:'calc',     labelKey:'tabCalc'},
    {id:'calendar', labelKey:'tabCalendar'},
    {id:'predict',  labelKey:'tabPredict'},
    {id:'history',  labelKey:'tabHistory'},
    {id:'glossary', labelKey:'tabGlossary'},
  ];

  return (
    <div>
      <div className="topbar">
        <div className="topbar-brand">
          <AppLogo size={30} className="topbar-logo"/>
          <div>
            <div className="topbar-title display">{t('appTitle')}</div>
            <div className="topbar-sub">{minhagLabel(minhag)}</div>
          </div>
        </div>
        <button className="topbar-settings" aria-label={t('tabSettings')} onClick={()=>setTab('settings')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      <div className="tabs">
        {TABS.map(tb=>(
          <button key={tb.id} className={`tab${tab===tb.id?' active':''}`} onClick={()=>setTab(tb.id)}>
            <span className="tab-pill"/>
            {t(tb.labelKey)}
          </button>
        ))}
      </div>

      <div key={tab} className="page active" style={tab==='calendar'?{padding:0}:{}}>
        {tab==='calc'     && <CalcScreen cycles={cycles.filter(c=>!c.type||c.type==='veset')} onSave={saveCycle}/>}
        {tab==='calendar' && <Calendar cycles={cycles} onAddCycle={saveCycle} lang={lang}/>}
        {tab==='predict'  && <PredictScreen cycles={cycles.filter(c=>!c.type||c.type==='veset')}/>}
        {tab==='history'  && <HistoryScreen cycles={cycles.filter(c=>!c.type||c.type==='veset')} onClear={clearAll} onDelete={deleteCycle}/>}
        {tab==='glossary' && <GlossaryScreen lang={lang}/>}
        {tab==='settings' && <SettingsScreen user={user} onLogout={handleLogout} palette={palette} setPalette={setPalette} syncStatus={syncStatus} minhag={minhag} setMinhag={setMinhag} lang={lang} changeLang={changeLang}/>}
        {tab!=='settings' && (
          <div style={{padding:'24px 20px 40px',textAlign:'center',fontSize:10.5,color:'var(--muted)',lineHeight:1.8,borderTop:'0.5px solid var(--border)',marginTop:8}}>
            <div>⚠️ {t('disclaimer')}</div>
            <div style={{marginTop:4}}>{t('copyright')} · <span dir="ltr" style={{unicodeBidi:'plaintext'}}>{t('phone')}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
