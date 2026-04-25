// ═══════════════════════════════════════════════════════
// AUTH SCREEN — login / register / guest
// ═══════════════════════════════════════════════════════

const LEGAL = {
  terms: {
    title: 'תנאי שימוש',
    sections: [
      {h:'כללי', p:'אפליקציית "לוח הטהרה" (להלן: "האפליקציה") פותחה ומופעלת על ידי שיר וגילה כהן (להלן: "המפתחות"). השימוש באפליקציה מהווה הסכמה מלאה לתנאים המפורטים להלן. אם אינך מסכימה לתנאים — אנא הפסיקי את השימוש.'},
      {h:'מטרת האפליקציה', p:'האפליקציה מיועדת אך ורק כעזר אישי לתיעוד ומעקב. אין לראות בה כלי הלכתי מוסמך, תחליף לשאלת רב, ייעוץ רפואי או כל שירות מקצועי אחר. הוראות הרב גוברות בכל מקרה של סתירה.'},
      {h:'הגבלת אחריות', p:'המפתחות אינן אחראיות לכל נזק ישיר, עקיף, מקרי או תוצאתי הנובע מהסתמכות על מידע המוצג באפליקציה, לרבות שגיאות חישוב, שגיאות תצוגה או תקלות טכניות. השימוש באפליקציה הוא על אחריות המשתמשת בלבד.'},
      {h:'קניין רוחני', p:'כל הזכויות — לרבות זכויות יוצרים, עיצוב ותוכן — שמורות לשיר וגילה כהן © 2026. אין להעתיק, לשכפל, לשנות או להפיץ כל חלק מהאפליקציה ללא אישור מפורש בכתב.'},
      {h:'שינויים בתנאים', p:'המפתחות רשאיות לעדכן תנאים אלה בכל עת. המשך השימוש לאחר עדכון מהווה הסכמה לנוסח המעודכן.'},
      {h:'יצירת קשר', p:'לשאלות ובירורים: 054-464-1746 (שיר / גילה כהן).'},
    ],
  },
  privacy: {
    title: 'מדיניות פרטיות',
    sections: [
      {h:'מידע שאנו אוספים', p:'האפליקציה עשויה לאסוף: (א) כתובת אימייל ושם — רק אם בחרת להירשם לחשבון. (ב) נתוני מחזורים שהזנת ידנית (תאריכים, הפסקי טהרה, הגדרות). אין איסוף אוטומטי של נתונים ביומטריים, מיקום, או כל מידע מזהה נוסף.'},
      {h:'אחסון המידע', p:'נתוני מחזורים מאוחסנים מקומית במכשירך (localStorage). אם נרשמת לחשבון, הנתונים מסונכרנים ל־Firebase Firestore של Google — שרתים הממוקמים באירופה — בהתאם למדיניות הפרטיות של Google Cloud.'},
      {h:'גישה למידע', p:'רק את, המשתמשת, יכולה לגשת לנתונייך. המפתחות אינן גורמות גישה לנתוני פרט של משתמשות, ואינן משתפות מידע אישי עם צדדים שלישיים למטרות פרסום או כל מטרה אחרת.'},
      {h:'מחיקת נתונים', p:'ניתן למחוק את כל הנתונים בכל עת מתוך מסך "היסטוריה". מחיקת החשבון מסירה את כל הנתונים מהשרת. נתונים מקומיים יימחקו עם ניקוי נתוני הדפדפן.'},
      {h:'עוגיות ומעקב', p:'האפליקציה אינה משתמשת בעוגיות מעקב או ניתוח שימוש של צד שלישי (כגון Google Analytics). אחסון מקומי (localStorage) משמש אך ורק לשמירת הגדרות ונתוני אפליקציה.'},
      {h:'זכויותייך', p:'בהתאם לחוק הגנת הפרטיות, תשמ"א–1981, את זכאית לעיין במידע שנשמר אודותייך ולדרוש תיקון או מחיקה. לפניות: 054-464-1746.'},
    ],
  },
};

function LegalModal({doc, onClose}) {
  React.useEffect(()=>{
    const esc=(e)=>{ if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown',esc);
    return ()=>window.removeEventListener('keydown',esc);
  },[onClose]);
  return (
    <div
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center',animation:'fadeIn 200ms ease'}}
    >
      <div style={{background:'var(--card)',borderRadius:'24px 24px 0 0',width:'100%',maxWidth:430,maxHeight:'85vh',overflowY:'auto',padding:'0 0 env(safe-area-inset-bottom,16px)',animation:'slideUp 280ms cubic-bezier(0.22,1,0.36,1)'}}>
        <div style={{position:'sticky',top:0,background:'var(--card)',padding:'16px 20px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'0.5px solid var(--border)'}}>
          <span style={{fontSize:17,fontWeight:600}}>{doc.title}</span>
          <button onClick={onClose} style={{border:'none',background:'var(--bg-soft)',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:18,color:'var(--muted)',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
        <div style={{padding:'20px 20px 32px'}}>
          {doc.sections.map((s,i)=>(
            <div key={i} style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:6,color:'var(--text)'}}>{s.h}</div>
              <div style={{fontSize:13,lineHeight:1.8,color:'var(--muted)'}}>{s.p}</div>
            </div>
          ))}
          <div style={{marginTop:28,fontSize:11,color:'var(--muted)',textAlign:'center',lineHeight:1.6}}>
            © 2026 שיר וגילה כהן — כל הזכויות שמורות<br/>
            <span dir="ltr" style={{unicodeBidi:'plaintext'}}>054-464-1746</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({onLogin, onGuest, setMinhag, lang, changeLang}) {
  const [mode,setMode]=React.useState('login');
  const [email,setEmail]=React.useState('');
  const [pass,setPass]=React.useState('');
  const [name,setName]=React.useState('');
  const [selectedMinhag,setSelectedMinhag]=React.useState('ashkenaz');
  const [err,setErr]=React.useState('');
  const [busy,setBusy]=React.useState(false);
  const [legalDoc,setLegalDoc]=React.useState(null);
  const [forgotMode,setForgotMode]=React.useState(false);
  const [forgotSent,setForgotSent]=React.useState(false);

  const handleForgot=async()=>{
    setErr('');
    if(!email.includes('@')){setErr(t('authErrEmail'));return;}
    setBusy(true);
    try {
      const fb=window.__fb;
      if(!fb) throw new Error('no-firebase');
      await fb.resetPassword(email);
      setForgotSent(true);
    } catch(e) {
      const fb=window.__fb;
      if(e.message==='no-firebase'||!fb) setForgotSent(true); // offline fallback
      else setErr(fb.authErrMsg(e.code||''));
    } finally { setBusy(false); }
  };

  const submit=async()=>{
    setErr('');
    if(mode==='register'&&!name.trim()){setErr(t('authErrName'));return;}
    if(!email.includes('@')){setErr(t('authErrEmail'));return;}
    if(pass.length<6){setErr(t('authErrPass'));return;}
    setBusy(true);
    if(mode==='register'){
      localStorage.setItem(MKEY, selectedMinhag);
      if(typeof setMinhag==='function') setMinhag(selectedMinhag);
    }
    try {
      const fb=window.__fb;
      if(!fb) throw new Error('no-firebase');
      if(mode==='login') await fb.signIn(email,pass);
      else await fb.register(name,email,pass);
    } catch(e) {
      setBusy(false);
      const fb=window.__fb;
      if(e.message==='no-firebase'||!fb) onLogin({displayName:mode==='register'?name:email.split('@')[0],email});
      else setErr(fb.authErrMsg(e.code||''));
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-hairline">
        <span style={{background:'var(--phase-veset)'}}/>
        <span style={{background:'var(--phase-hpst)'}}/>
        <span style={{background:'var(--phase-sefirah)'}}/>
        <span style={{background:'var(--phase-tvila)'}}/>
        <span style={{background:'var(--phase-tahora)'}}/>
      </div>
      <div className="auth-lang-bar">
        {['he','en'].map(l=>(
          <button key={l} className={`auth-lang-btn${lang===l?' active':''}`} onClick={()=>changeLang(l)}>
            {l==='he'?'עב':'EN'}
          </button>
        ))}
      </div>
      <div className="auth-wrap">
        <div className="auth-head">
          <AppLogo size={64} className="auth-glyph"/>
          <div className="auth-eyebrow">{t('appTitle')}</div>
          {!forgotMode && (
            <>
              <h1 className="auth-greet display">{mode==='login'?t('authWelcomeBack'):t('authWelcome')}</h1>
              <div className="auth-lede">{mode==='login'?t('authLoginLede'):t('authRegisterLede')}</div>
            </>
          )}
          {forgotMode && (
            <>
              <h1 className="auth-greet display">{t('authForgotTitle')}</h1>
              <div className="auth-lede">{t('authForgotLede')}</div>
            </>
          )}
        </div>

        {/* ── FORGOT PASSWORD PANEL ── */}
        {forgotMode ? (
          <div key="forgot" className="auth-fields reveal">
            <div className="field auth-f">
              <label>{t('authEmailLabel')}</label>
              <input type="email" dir="ltr" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@domain.com" autoComplete="email" onKeyDown={e=>e.key==='Enter'&&handleForgot()}/>
            </div>
            {forgotSent && (
              <div style={{textAlign:'center',fontSize:13,color:'var(--phase-sefirah)',padding:'8px 0',fontWeight:500}}>
                {t('authForgotSuccess')}
              </div>
            )}
            <div className={`auth-err${err?' visible':''}`}>{err||' '}</div>
            <button className={`btn-primary auth-submit${busy?' busy':''}`} onClick={handleForgot} disabled={busy||forgotSent}>
              {busy?<span className="auth-spinner"/>:t('authForgotSendBtn')}
            </button>
            <button className="btn-ghost" style={{marginTop:8,border:'none'}} onClick={()=>{setForgotMode(false);setForgotSent(false);setErr('');}}>
              {t('authForgotBack')}
            </button>
          </div>
        ) : (
          /* ── NORMAL LOGIN / REGISTER ── */
          <>
            <div key={mode} className="auth-fields reveal">
              {mode==='register'&&(<>
                <div className="field auth-f">
                  <label>{t('authNameLabel')}</label>
                  <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={t('authNamePlaceholder')}/>
                </div>
                <div className="field auth-f">
                  <label>{t('authMinhagLabel')}</label>
                  <select value={selectedMinhag} onChange={e=>setSelectedMinhag(e.target.value)} style={{fontSize:15,fontWeight:400,color:'var(--text)',background:'transparent',border:'none',outline:'none',fontFamily:'inherit',cursor:'pointer',width:'100%',padding:'2px 0'}}>
                    {MINHAGIM.map(m=><option key={m.id} value={m.id}>{t(m.labelKey)}</option>)}
                  </select>
                </div>
              </>)}
              <div className="field auth-f">
                <label>{t('authEmailLabel')}</label>
                <input type="email" dir="ltr" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@domain.com" autoComplete="email"/>
              </div>
              <div className="field auth-f">
                <label>
                  {t('authPassLabel')}
                  {mode==='login'&&(
                    <button className="auth-forgot" tabIndex={-1} onClick={e=>{e.preventDefault();setForgotMode(true);}}>
                      {t('authForgot')}
                    </button>
                  )}
                </label>
                <input type="password" dir="ltr" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" autoComplete={mode==='register'?'new-password':'current-password'} onKeyDown={e=>e.key==='Enter'&&submit()}/>
              </div>
            </div>

            <div className={`auth-err${err?' visible':''}`}>{err||' '}</div>

            <button className={`btn-primary auth-submit${busy?' busy':''}`} onClick={submit} disabled={busy}>
              {busy?<span className="auth-spinner"/>:(mode==='login'?t('authLoginBtn'):t('authRegisterBtn'))}
            </button>

            <div className="auth-switch">
              {mode==='login'?t('authSwitchToRegister'):t('authSwitchToLogin')}
              <button onClick={()=>{setMode(mode==='login'?'register':'login');setErr('');}}>
                {mode==='login'?t('authOpenAccount'):t('authLoginLink')}
              </button>
            </div>

            <div className="auth-rule"><span>{t('authOr')}</span></div>
            <button className="auth-guest" onClick={onGuest}>
              {t('authGuest')}
              <span className="auth-guest-sub">{t('authGuestSub')}</span>
            </button>
            <div className="auth-legal">
              <a onClick={()=>setLegalDoc(LEGAL.terms)} style={{cursor:'pointer'}}>{t('authTerms')}</a>
              <span className="auth-legal-dot">·</span>
              <a onClick={()=>setLegalDoc(LEGAL.privacy)} style={{cursor:'pointer'}}>{t('authPrivacy')}</a>
            </div>
          </>
        )}
      </div>
      {legalDoc && <LegalModal doc={legalDoc} onClose={()=>setLegalDoc(null)}/>}
    </div>
  );
}
