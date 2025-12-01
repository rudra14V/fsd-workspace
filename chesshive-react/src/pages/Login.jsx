import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { login, verifyLoginOtp } from '../features/auth/authSlice';

const styles = `
:root { --sea-green:#2E8B57; --cream:#FFFDD0; --sky-blue:#87CEEB; --text-dark:#333; --dark:#333; }
* { margin:0; padding:0; box-sizing:border-box; }
body.react-root-host { min-height:100vh; display:flex; flex-direction:column; font-family:'Playfair Display', serif; background-color:var(--cream); }
main { flex:1; display:flex; justify-content:center; align-items:center; padding:2rem; }
.form-container-login { width:100%; max-width:500px; padding:2rem; position:relative; }
.form-container-login::before { content:'♕'; position:absolute; top:0; left:20px; font-size:3rem; color:var(--text-dark); opacity:.2; }
.form-container-login::after { content:'♔'; position:absolute; bottom:0; right:20px; font-size:3rem; color:var(--text-dark); opacity:.2; }

h2 { color:var(--text-dark); font-family:'Cinzel', serif; font-size:2.5rem; text-align:center; margin-bottom:2.5rem; text-shadow:2px 2px 4px rgba(0,0,0,0.1); }
.error { background:rgba(198,40,40,0.1); color:#c62828; padding:1rem; border-radius:5px; margin-bottom:1rem; }
.field-error { color:#c62828; font-size:.9rem; margin-top:.4rem; }
.success { background:rgba(46,125,50,0.1); color:var(--text-dark); padding:1rem; border-radius:5px; margin-bottom:1rem; }
form { display:flex; flex-direction:column; gap:1.8rem; }
.restore-form { display:flex; flex-direction:column; gap:1rem; margin-top:1rem; padding:1rem; border:1px solid rgba(46,139,87,0.2); border-radius:8px; background:rgba(255,255,255,0.9); }
label { color:var(--text-dark); font-weight:bold; font-size:1.2rem; margin-bottom:0.5rem; display:block; }
input { width:100%; padding:1rem; border:2px solid var(--dark); border-radius:8px; font-size:1.1rem; transition:all .3s ease; background:rgba(255,255,255,0.9); }
input:focus { outline:none; border-color:var(--sky-blue); box-shadow:0 0 0 3px rgba(135,206,235,0.2); }
button { background:linear-gradient(135deg, var(--sea-green), var(--sky-blue)); color:var(--text-dark); padding:1.2rem; border:none; border-radius:8px; font-size:1.2rem; cursor:pointer; transition:all .3s ease; font-family:'Cinzel', serif; font-weight:bold; margin-top:1rem; }
button:hover { background-color:#236B43; transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.15); }
button:disabled { background:#888; cursor:not-allowed; transform:none; box-shadow:none; }
.signup-box { text-align:center; margin-top:2.5rem; padding-top:2rem; border-top:2px solid rgba(46,139,87,0.2); color:var(--text-dark); margin-bottom:1rem; font-size:1.2rem; }
.signup-box button { background:linear-gradient(135deg, var(--sea-green), var(--sky-blue)); width:100%; }
.signup-box button:hover { background-color:#6CB4D1; }

header { background-color:var(--sea-green); color:var(--cream); padding:1rem 2rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; }
.logo-section { display:flex; align-items:center; gap:.6rem; }
.logo-section i { font-size:1.8rem; }
.logo-section h1 { font-family:'Cinzel', serif; font-size:1.8rem; font-weight:700; }
.main-nav { display:flex; align-items:center; }
.nav-links { display:flex; list-style:none; gap:1.5rem; }
.nav-links a { text-decoration:none; color:var(--cream); font-size:1.1rem; display:flex; align-items:center; gap:.4rem; transition:color .3s ease; }
.nav-links a:hover { color:var(--sky-blue); }
footer { background-color:var(--sea-green); color:var(--cream); padding:1.5rem 2rem; }
.footer-content { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; }
.footer-content p { margin:0; font-size:1rem; display:flex; align-items:center; gap:.4rem; }
.footer-socials { display:flex; gap:1rem; }
.footer-socials a { text-decoration:none; background:rgba(255,255,255,0.15); color:var(--cream); padding:.5rem 1rem; border-radius:20px; display:inline-flex; align-items:center; gap:.4rem; transition:background .3s ease; }
.footer-socials a:hover { background:rgba(255,255,255,0.25); }

@media(max-width:768px){ header{flex-direction:column; gap:1rem;} .form-container-login{padding:1rem;} h2{font-size:2rem;} input,button{padding:1rem;} }
`;

export default function Login(){
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [touched, setTouched] = React.useState({ email:false, password:false, otp:false });
  const [dynamicError, setDynamicError] = React.useState("");
  const [dynamicSuccess, setDynamicSuccess] = React.useState("");
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const authError = auth.error;
  const restoreInfo = auth.restoreInfo;
  const [restoreVisibility, setRestoreVisibility] = React.useState({ coordinator:false, organizer:false, player:false });
  const [restoreIds, setRestoreIds] = React.useState({ coordinator:"", organizer:"", player:"" });
  const [restoring, setRestoring] = React.useState({ coordinator:false, organizer:false, player:false });

  React.useEffect(() => {
    document.body.classList.add('react-root-host');
    return () => document.body.classList.remove('react-root-host');
  }, []);

  // Sync auth errors into local UI
  React.useEffect(() => {
    if (authError) setDynamicError(authError);
  }, [authError]);

  // If backend signals restoreRequired via Redux, show the form
  React.useEffect(() => {
    if (restoreInfo && restoreInfo.userId && restoreInfo.role) {
      showRestoreForm(restoreInfo.userId, restoreInfo.role);
    }
  }, [restoreInfo]);

  // URL params handling (error/success)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorMessage = urlParams.get('error-message');
    const successMessage = urlParams.get('success-message');
    if (errorMessage) setDynamicError(decodeURIComponent(errorMessage));
    else if (successMessage) setDynamicSuccess(decodeURIComponent(successMessage));
  }, []);

  function validateEmail(val){
    if (!val || !/^\S+@\S+\.\S+$/.test(val)) return false;
    if (/[A-Z]/.test(val)) return false;
    return true;
  }
  function validatePassword(val){
    return !!val && /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(val);
  }

  const emailError = touched.email && !validateEmail(email) ? 'Valid lowercase email is required' : '';
  const passwordError = touched.password && !validatePassword(password) ? 'Password must be at least 8 characters with one uppercase, one lowercase, and one special character' : '';
  const otpError = touched.otp && (!!otp && otp.length !== 6 ? 'OTP must be 6 digits' : (!otp ? 'OTP is required' : ''));

  function showRestoreForm(deletedUserId, deletedUserRole){
    if (!deletedUserId || !deletedUserRole) return;
    if (deletedUserRole === 'coordinator'){
      setRestoreVisibility(s=>({...s, coordinator:true}));
      setRestoreIds(s=>({...s, coordinator:deletedUserId}));
    } else if (deletedUserRole === 'organizer'){
      setRestoreVisibility(s=>({...s, organizer:true}));
      setRestoreIds(s=>({...s, organizer:deletedUserId}));
    } else if (deletedUserRole === 'player'){
      setRestoreVisibility(s=>({...s, player:true}));
      setRestoreIds(s=>({...s, player:deletedUserId}));
    }
  }

  async function onSubmitLogin(e){
    e.preventDefault();
    setDynamicError("");
    if (!validateEmail(email)) { setDynamicError('Valid lowercase email is required'); return; }
    if (!validatePassword(password)) { setDynamicError('Password must be at least 8 characters with one uppercase, one lowercase, and one special character'); return; }
    try {
      const result = await dispatch(login({ email: email.trim(), password }));
      if (result.meta.requestStatus === 'fulfilled') {
        setDynamicSuccess('OTP sent to your email. Please enter it below.');
      } else {
        const err = result.payload || result.error || {};
        setDynamicError(err.message || 'Login failed');
        if (err.restoreRequired && err.deletedUserId && err.deletedUserRole) {
          showRestoreForm(err.deletedUserId, err.deletedUserRole);
        }
      }
    } catch(err){
      console.error('Login error:', err);
      setDynamicError('Failed to connect to server.');
    }
  }

  async function onVerifyOtp(e){
    e.preventDefault();
    setDynamicError("");
    if (!otp || otp.length !== 6) { setDynamicError('Please enter a valid 6-digit OTP'); return; }
    try {
      const result = await dispatch(verifyLoginOtp({ email: email.trim(), otp }));
      if (result.meta.requestStatus === 'fulfilled') {
        const redirectUrl = result.payload?.redirectUrl || '/';
        window.location.href = redirectUrl;
      } else {
        const err = result.payload || result.error || {};
        setDynamicError(err.message || 'OTP verification failed');
      }
    } catch(err){
      console.error('OTP verify error:', err);
      setDynamicError('Failed to connect to server.');
    }
  }



  async function onRestore(roleKey, emailId, passVal){
    const id = restoreIds[roleKey];
    if (!id) return;
    setRestoring(s=>({...s, [roleKey]:true}));
    try {
      const resp = await fetch('http://localhost:3000/api/restore-account', {
        method:'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ id, email: emailId, password: passVal })
      });
      const data = await resp.json().catch(()=>({}));
      if (!resp.ok || !data.success) {
        setDynamicError(data.message || 'Failed to restore account');
      } else {
        setDynamicSuccess(data.message || 'Account restored');
        setRestoreVisibility({ coordinator:false, organizer:false, player:false });
      }
    } catch(e){
      setDynamicError(`Network error or server unavailable: ${e.message}`);
    } finally {
      setRestoring(s=>({...s, [roleKey]:false}));
    }
  }

  const [restoreInputs, setRestoreInputs] = React.useState({ coordinatorEmail:"", coordinatorPass:"", organizerEmail:"", organizerPass:"", playerEmail:"", playerPass:"" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <header>
        <div className="logo-section">
          <i className="fas fa-chess-rook"></i>
          <h1>CHESS HIVE</h1>
        </div>
        <nav className="main-nav">
          <ul className="nav-links">
            <li><a href="/"><i className="fas fa-home"></i> Home</a></li>
            <li><a href="/about"><i className="fas fa-info-circle"></i> About</a></li>
            <li><a href="/login"><i className="fas fa-users"></i> Join Community</a></li>
            <li><a href="/contactus"><i className="fas fa-envelope"></i> Contact Us</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <div className="form-container-login">
          <h2>Welcome Back to ChessHive</h2>
          {dynamicError && <div className="error">{dynamicError}</div>}
          {dynamicSuccess && <div className="success">{dynamicSuccess}</div>}

          <form onSubmit={auth.otpSent ? onVerifyOtp : onSubmitLogin}>
            {!auth.otpSent ? (
              <>
                <div>
                  <label htmlFor="email">Email ID</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={e=>{ if (!touched.email) setTouched(s=>({...s,email:true})); setEmail(e.target.value); }}
                    onBlur={()=> setTouched(s=>({...s,email:true}))}
                  />
                  {emailError && <div className="field-error">{emailError}</div>}
                </div>
                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={e=>{ if (!touched.password) setTouched(s=>({...s,password:true})); setPassword(e.target.value); }}
                    onBlur={()=> setTouched(s=>({...s,password:true}))}
                  />
                  {passwordError && <div className="field-error">{passwordError}</div>}
                </div>
                <button type="submit" disabled={auth.loading}>{auth.loading ? 'Sending OTP...' : 'Send OTP'}</button>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="otp">Enter OTP</label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    required
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={e=>{ if (!touched.otp) setTouched(s=>({...s,otp:true})); setOtp(e.target.value.replace(/\D/g,'')); }}
                    onBlur={()=> setTouched(s=>({...s,otp:true}))}
                    maxLength="6"
                  />
                  {otpError && <div className="field-error">{otpError}</div>}
                </div>
                <button type="submit" disabled={auth.loading}>{auth.loading ? 'Verifying...' : 'Verify OTP'}</button>
                <button type="button" onClick={() => { setDynamicSuccess(""); setDynamicError(""); dispatch({ type: 'auth/clearError' }); }}>Back</button>
              </>
            )}
          </form>

          <div className="signup-box">
            <p>Don't have an account?</p>
            <a href="/signup" style={{ textDecoration:'none' }}>
              <button>Sign Up</button>
            </a>
          </div>

          {restoreVisibility.coordinator && (
            <form className="restore-form" onSubmit={(e)=>{ e.preventDefault(); onRestore('coordinator', restoreInputs.coordinatorEmail, restoreInputs.coordinatorPass); }}>
              <input type="hidden" name="id" value={restoreIds.coordinator} />
              <div>
                <label htmlFor="restore-email">Confirm Email</label>
                <input type="email" id="restore-email" required placeholder="Enter your email" value={restoreInputs.coordinatorEmail} onChange={e=>setRestoreInputs(s=>({...s, coordinatorEmail:e.target.value}))} />
              </div>
              <div>
                <label htmlFor="restore-password">Confirm Password</label>
                <input type="password" id="restore-password" required placeholder="Enter your password" value={restoreInputs.coordinatorPass} onChange={e=>setRestoreInputs(s=>({...s, coordinatorPass:e.target.value}))} />
              </div>
              <button type="submit" disabled={restoring.coordinator}>{restoring.coordinator ? 'Restoring...' : 'Restore Coordinator Account'}</button>
            </form>
          )}

          {restoreVisibility.organizer && (
            <form className="restore-form" onSubmit={(e)=>{ e.preventDefault(); onRestore('organizer', restoreInputs.organizerEmail, restoreInputs.organizerPass); }}>
              <input type="hidden" name="id" value={restoreIds.organizer} />
              <div>
                <label htmlFor="restore-email-organizer">Confirm Email</label>
                <input type="email" id="restore-email-organizer" required placeholder="Enter your email" value={restoreInputs.organizerEmail} onChange={e=>setRestoreInputs(s=>({...s, organizerEmail:e.target.value}))} />
              </div>
              <div>
                <label htmlFor="restore-password-organizer">Confirm Password</label>
                <input type="password" id="restore-password-organizer" required placeholder="Enter your password" value={restoreInputs.organizerPass} onChange={e=>setRestoreInputs(s=>({...s, organizerPass:e.target.value}))} />
              </div>
              <button type="submit" disabled={restoring.organizer}>{restoring.organizer ? 'Restoring...' : 'Restore Organizer Account'}</button>
            </form>
          )}

          {restoreVisibility.player && (
            <form className="restore-form" onSubmit={(e)=>{ e.preventDefault(); onRestore('player', restoreInputs.playerEmail, restoreInputs.playerPass); }}>
              <input type="hidden" name="id" value={restoreIds.player} />
              <div>
                <label htmlFor="restore-email-player">Confirm Email</label>
                <input type="email" id="restore-email-player" required placeholder="Enter your email" value={restoreInputs.playerEmail} onChange={e=>setRestoreInputs(s=>({...s, playerEmail:e.target.value}))} />
              </div>
              <div>
                <label htmlFor="restore-password-player">Confirm Password</label>
                <input type="password" id="restore-password-player" required placeholder="Enter your password" value={restoreInputs.playerPass} onChange={e=>setRestoreInputs(s=>({...s, playerPass:e.target.value}))} />
              </div>
              <button type="submit" disabled={restoring.player}>{restoring.player ? 'Restoring...' : 'Restore Player Account'}</button>
            </form>
          )}
        </div>
      </main>

      <footer>
        <div className="footer-content">
          <p><i className="fas fa-chess-rook"></i> © 2025 Chess Hive – Elevate Your Game</p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fab fa-facebook-f"></i> Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><i className="fab fa-twitter"></i> Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i> Instagram</a>
          </div>
        </div>
      </footer>
    </>
  );
}
