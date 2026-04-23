// ═══════════════════════════════════════════════════════
// AUTH SCREEN — login / register / guest
// ═══════════════════════════════════════════════════════
function AuthScreen({onLogin, onGuest}) {
  const [mode,setMode]=React.useState('login');
  const [email,setEmail]=React.useState('');
  const [pass,setPass]=React.useState('');
  const [name,setName]=React.useState('');
  const [err,setErr]=React.useState('');
  const [busy,setBusy]=React.useState(false);

  const submit=async()=>{
    setErr('');
    if(mode==='register'&&!name.trim()){setErr('אנא הכניסי שם');return;}
    if(!email.includes('@')){setErr('אימייל לא תקין');return;}
    if(pass.length<6){setErr('סיסמה צריכה לפחות 6 תווים');return;}
    setBusy(true);
    try {
      const fb=window.__fb;
      if(!fb) throw new Error('no-firebase');
      if(mode==='login') {
        await fb.signIn(email,pass);
      } else {
        await fb.register(name,email,pass);
      }
    } catch(e) {
      setBusy(false);
      const fb=window.__fb;
      if(e.message==='no-firebase'||!fb) { onLogin({displayName:mode==='register'?name:email.split('@')[0],email}); }
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
      <div className="auth-wrap">
        <div className="auth-head">
          <svg className="auth-glyph" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="16" fill="none" stroke="var(--border-mid)" strokeWidth="0.5"/>
            <circle cx="22" cy="22" r="10" fill="var(--primary-soft)"/>
            <path d="M 22 12 a 10 10 0 0 1 0 20 a 7 10 0 0 0 0 -20 z" fill="var(--primary)"/>
          </svg>
          <div className="auth-eyebrow">לוח הטהרה</div>
          <h1 className="auth-greet display">{mode==='login'?'ברוכה השבה':'ברוכה הבאה'}</h1>
          <div className="auth-lede">{mode==='login'?'המשיכי מאיפה שעצרת':'בואי נפתח לך מקום שקט לעקוב'}</div>
        </div>

        <div key={mode} className="auth-fields reveal">
          {mode==='register'&&(
            <div className="field auth-f">
              <label>שם</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="איך לקרוא לך?"/>
            </div>
          )}
          <div className="field auth-f">
            <label>אימייל</label>
            <input type="email" dir="ltr" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@domain.com" autoComplete="email"/>
          </div>
          <div className="field auth-f">
            <label>סיסמה{mode==='login'&&<button className="auth-forgot" tabIndex={-1}>שכחתי</button>}</label>
            <input type="password" dir="ltr" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" autoComplete={mode==='register'?'new-password':'current-password'} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>
        </div>

        <div className={`auth-err${err?' visible':''}`}>{err||'\u00a0'}</div>

        <button className={`btn-primary auth-submit${busy?' busy':''}`} onClick={submit} disabled={busy}>
          {busy?<span className="auth-spinner"/>:(mode==='login'?'כניסה':'פתיחת חשבון')}
        </button>

        <div className="auth-switch">
          {mode==='login'?'אין לך עדיין חשבון?':'כבר יש לך חשבון?'}
          <button onClick={()=>{setMode(mode==='login'?'register':'login');setErr('');}}>
            {mode==='login'?'פתחי חשבון':'התחברי'}
          </button>
        </div>

        <div className="auth-rule"><span>או</span></div>
        <button className="auth-guest" onClick={onGuest}>
          המשיכי בלי חשבון
          <span className="auth-guest-sub">הנתונים יישמרו במכשיר בלבד</span>
        </button>
        <div className="auth-legal"><a>תנאי שימוש</a><span className="auth-legal-dot">·</span><a>פרטיות</a></div>
      </div>
    </div>
  );
}
