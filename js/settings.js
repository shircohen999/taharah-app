// ═══════════════════════════════════════════════════════
// SETTINGS — SettingsScreen + notification defaults
// ═══════════════════════════════════════════════════════
const NOTIF_DEFAULTS = {hpstDays:0, sefirahDays:0, tvilaDays:0, prishaDays:1, nextDays:2, bedikaDays:0};

function SettingsScreen({user, onLogout, palette, setPalette, syncStatus, minhag, setMinhag, lang, changeLang}) {
  const [prefs,setPrefs]=React.useState(()=>{try{return JSON.parse(localStorage.getItem(PKEY)||'{}')}catch{return {};}});

  const save=(p)=>{setPrefs(p);localStorage.setItem(PKEY,JSON.stringify(p));};
  const toggleEnabled=async(v)=>{
    if(v){
      if(!('Notification' in window)){alert(t('alertNotifsUnsupported'));return;}
      const perm=await Notification.requestPermission();
      if(perm!=='granted'){alert(t('alertNotifsBlocked'));return;}
    }
    save({...prefs,enabled:v});
  };

  const PALETTES=[
    {id:'rose',  labelKey:'paletteRose',  colors:['#F7F2EE','#B14068','#6B8E4E','#4A86A8']},
    {id:'sage',  labelKey:'paletteSage',  colors:['#F2EFE8','#9A6B7F','#7C9065','#5C8099']},
    {id:'wine',  labelKey:'paletteWine',  colors:['#1A1014','#C69B5D','#B8456A','#7AB4D4']},
    {id:'plum',  labelKey:'palettePlum',  colors:['#ECEBEE','#6B3B6F','#5E8480','#4A6D8C']},
  ];

  const initials=(user?.displayName||user?.email||'א').charAt(0).toUpperCase();

  const notifDaysSub=(days)=>days===0?t('settingsOnEvent'):days===1?t('settingsOneDayBefore'):t('settingsDaysBefore',days);

  const syncLabel = syncStatus==='synced'?t('accSynced'):syncStatus==='sync_error'?t('accSyncErr'):syncStatus;

  return (
    <div className="reveal">
      <div className="account-hero">
        <div className="account-avatar">
          <div className="account-avatar-ring"/>
          <span>{initials}</span>
        </div>
        <div className="account-name display">{user?.displayName||t('accGuest')}</div>
        <div className="account-email">{user?.email||t('accLocalData')}</div>
        <div className="account-badges">
          {user?(
            <span className="acc-badge acc-badge-ok"><span className="acc-dot"/> {syncLabel}</span>
          ):(
            <span className="acc-badge acc-badge-warn"><span className="acc-dot"/> {t('accLocal')}</span>
          )}
        </div>
      </div>

      <div className="sec-label">{t('settingsLang')}</div>
      <div className="card">
        <div style={{display:'flex',justifyContent:'center',gap:12,padding:'14px 18px'}}>
          {['he','en'].map(l=>(
            <button
              key={l}
              onClick={()=>changeLang(l)}
              style={{
                padding:'8px 24px',borderRadius:999,border:'none',cursor:'pointer',
                fontSize:14,fontWeight:lang===l?600:400,
                background:lang===l?'var(--primary)':'var(--bg-soft)',
                color:lang===l?'#fff':'var(--text)',
                transition:'background var(--t-fast) var(--ease-out)',
              }}
            >
              {l==='he'?t('settingsLangHe'):t('settingsLangEn')}
            </button>
          ))}
        </div>
      </div>

      <div className="sec-label">{t('settingsAppearance')}</div>
      <div className="card">
        <div style={{padding:'14px 18px 8px'}}>
          <div style={{fontSize:12,color:'var(--muted)',marginBottom:10}}>{t('settingsPaletteLabel')}</div>
          <div className="palette-row" style={{padding:0}}>
            {PALETTES.map(p=>(
              <div key={p.id} className={`palette-swatch${palette===p.id?' active':''}`} onClick={()=>setPalette(p.id)} title={t(p.labelKey)}>
                <div style={{position:'absolute',inset:0,display:'flex'}}>
                  {p.colors.map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:20,marginTop:8,fontSize:10,color:'var(--muted)'}}>
            {PALETTES.map(p=><span key={p.id} style={{color:palette===p.id?'var(--primary)':'inherit',fontWeight:palette===p.id?600:400}}>{t(p.labelKey)}</span>)}
          </div>
        </div>
      </div>

      <div className="sec-label">{t('settingsNotifs')}</div>
      <div className="card">
        <div className="notif-row">
          <div>
            <div style={{fontSize:14}}>{t('settingsNotifsEnabled')}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>
              {'Notification' in window
                ? Notification.permission==='granted' ? t('settingsNotifsGranted')
                  : Notification.permission==='denied'  ? t('settingsNotifsDenied')
                  : t('settingsNotifsRequest')
                : t('settingsNotifsUnsupported')}
            </div>
          </div>
          <Toggle value={!!prefs.enabled} onChange={toggleEnabled}/>
        </div>
        {prefs.enabled&&(<>
          <div className="notif-row" style={{alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14}}>{t('settingsNotifsType')}</div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:2,lineHeight:1.5}}>
                {t('settingsNotifsTypeDesc')}<br/>
                <span style={{color:'var(--phase-hpst)'}}>{t('settingsNotifsComingSoon')}</span>
              </div>
            </div>
          </div>
          <div className="notif-row">
            <div><div style={{fontSize:14}}>{t('settingsNotifsTime')}</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{t('settingsNotifsTimeSub')}</div></div>
            <input
              type="time"
              value={`${String(prefs.notifHour??8).padStart(2,'0')}:${String(prefs.notifMin??0).padStart(2,'0')}`}
              onChange={e=>{const[h,m]=(e.target.value||'08:00').split(':').map(Number);save({...prefs,notifHour:h,notifMin:m});}}
              style={{fontSize:14,fontWeight:500,color:'var(--text)',background:'transparent',border:'none',outline:'none',fontFamily:'inherit',cursor:'pointer',direction:'ltr'}}
            />
          </div>
          {[
            {key:'hpst',    labelKey:'settingsHpstLabel',    dkey:'hpstDays',    def:NOTIF_DEFAULTS.hpstDays},
            {key:'sefirah', labelKey:'settingsSefirahLabel',  dkey:'sefirahDays', def:NOTIF_DEFAULTS.sefirahDays},
            {key:'bedika',  labelKey:'settingsBedikaLabel',   dkey:'bedikaDays',  def:NOTIF_DEFAULTS.bedikaDays},
            {key:'tvila',   labelKey:'settingsTvilaLabel',    dkey:'tvilaDays',   def:NOTIF_DEFAULTS.tvilaDays},
            {key:'prisha',  labelKey:'settingsPrishaLabel',   dkey:'prishaDays',  def:NOTIF_DEFAULTS.prishaDays},
            {key:'next',    labelKey:'settingsNextLabel',     dkey:'nextDays',    def:NOTIF_DEFAULTS.nextDays},
          ].map(({key:k,labelKey,dkey,def})=>{
            const on=prefs[k]!==false;
            const days=prefs[dkey]??def;
            const setDays=v=>save({...prefs,[dkey]:Math.max(0,Math.min(14,v))});
            return (
              <div key={k} className="notif-row" style={{alignItems:'flex-start',paddingTop:14,paddingBottom:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14}}>{t(labelKey)}</div>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{on?notifDaysSub(days):t('settingsOff')}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {on&&(
                    <div style={{display:'flex',alignItems:'center',gap:0,background:'var(--bg-soft)',borderRadius:10,overflow:'hidden'}}>
                      <button onClick={()=>setDays(days-1)} style={{width:32,height:32,border:'none',background:'transparent',color:'var(--text)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:days===0?0.3:1}}>−</button>
                      <span style={{fontSize:13,fontWeight:600,minWidth:20,textAlign:'center'}}>{days}</span>
                      <button onClick={()=>setDays(days+1)} style={{width:32,height:32,border:'none',background:'transparent',color:'var(--text)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:days===14?0.3:1}}>+</button>
                    </div>
                  )}
                  <Toggle value={on} onChange={v=>save({...prefs,[k]:v})}/>
                </div>
              </div>
            );
          })}
        </>)}
      </div>

      <div className="sec-label">{t('settingsMinhag')}</div>
      <div className="card">
        <div style={{padding:'10px 18px'}}>
          {MINHAGIM.map((m,i)=>(
            <div
              key={m.id}
              onClick={()=>setMinhag(m.id)}
              style={{
                display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'12px 0',cursor:'pointer',
                borderBottom:i<MINHAGIM.length-1?'0.5px solid var(--border)':'none',
              }}
            >
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:minhag===m.id?600:400}}>{t(m.labelKey)}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{t(m.subKey)}</div>
              </div>
              <div style={{
                width:20,height:20,borderRadius:'50%',
                border:`1.5px solid ${minhag===m.id?'var(--primary)':'var(--border-mid)'}`,
                display:'flex',alignItems:'center',justifyContent:'center',
                transition:'border-color var(--t-fast) var(--ease-out)',
              }}>
                {minhag===m.id&&<div style={{width:10,height:10,borderRadius:'50%',background:'var(--primary)'}}/>}
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:'10px 18px',borderTop:'0.5px solid var(--border)',fontSize:11,color:'var(--muted)',lineHeight:1.5}}>
          {t('settingsMinhagNote')}
        </div>
      </div>

      <div className="sec-label">{t('settingsAccount')}</div>
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px'}}>
          <div><div style={{fontSize:14}}>{t('settingsSync')}</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{user?syncLabel:t('settingsSyncOff')}</div></div>
          <span style={{fontSize:18}}>{user?'✓':'—'}</span>
        </div>
      </div>

      <button className="btn-ghost" onClick={onLogout} style={{marginTop:12}}>
        {user?t('settingsLogout'):t('settingsGuestLogout')}
      </button>

      <div style={{margin:'24px 16px 8px',padding:'14px 16px',background:'var(--bg-soft)',borderRadius:'var(--r-cell)',fontSize:11,lineHeight:1.7,color:'var(--muted)',textAlign:'center'}}
        dangerouslySetInnerHTML={{__html:t('settingsDisclaimer')}}/>
      <div style={{margin:'0 16px 32px',padding:'14px 16px',borderRadius:'var(--r-cell)',fontSize:11,lineHeight:1.9,color:'var(--muted)',textAlign:'center'}}>
        {t('copyright')}<br/>
        <span dir="ltr" style={{unicodeBidi:'plaintext',fontWeight:600,color:'var(--primary)'}}>{t('phone')}</span>
      </div>
    </div>
  );
}
