import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { signup, verifySignupOtp } from '../features/auth/authSlice';

const styles = `
:root { --sea-green:#2E8B57; --cream:#FFFDD0; --sky-blue:#87CEEB; --dark-green:#236B43; }
*{margin:0;padding:0;box-sizing:border-box;}
body.react-root-host{min-height:100vh;font-family:'Playfair Display',serif;background-color:var(--cream);color:var(--sea-green);} 
header, footer { background-color:var(--sea-green); color:var(--cream); text-align:center; padding:1.5rem 2rem; }
.logo-section{display:flex;align-items:center;gap:.6rem;} .logo-section i{font-size:1.8rem;} .logo-section h1{font-family:'Cinzel',serif;font-size:1.8rem;font-weight:700;}
.main-nav{display:flex;align-items:center;} .nav-links{display:flex;list-style:none;gap:1.5rem;} .nav-links a{text-decoration:none;color:var(--cream);font-size:1.1rem;display:flex;align-items:center;gap:.4rem;transition:color .3s ease;} .nav-links a:hover{color:var(--sky-blue);} 
main{padding:2rem; max-width:800px; margin:0 auto;}
 h2{color:var(--sea-green); font-family:'Cinzel',serif; font-size:2.5rem; text-align:center; margin-bottom:2rem; text-shadow:2px 2px 4px rgba(0,0,0,0.1);} 
.form-container{width:100%; padding:2rem 0;} 
form{ display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
@media(max-width:768px){ form{ grid-template-columns:1fr; } header{flex-direction:column; gap:1rem;} }
.full-width{ grid-column:1/-1; }
label{display:block;margin-bottom:.5rem;font-weight:bold;font-size:1.1rem;}
input,select{ width:100%; padding:.8rem; border:2px solid var(--sea-green); border-radius:8px; font-size:1rem; background:rgba(255,255,255,0.9); transition:all .3s ease; }
input:focus,select:focus{ outline:none; border-color:var(--sky-blue); box-shadow:0 0 0 3px rgba(135,206,235,0.2);} 
select{cursor:pointer;}
.error{ color:#dc3545; font-size:.9rem; margin-top:.3rem; display:block;}
.error-input{ border-color:#dc3545; }
.server-error{ background:rgba(220,53,69,0.1); color:#dc3545; padding:1rem; border-radius:8px; margin-bottom:1.5rem; text-align:center; display:none; }
.server-error.success{ background:rgba(46,139,87,0.1); color:var(--sea-green); }
button{ background-color:var(--sea-green); color:var(--cream); padding:1rem 2rem; border:none; border-radius:8px; font-size:1.1rem; cursor:pointer; transition:all .3s ease; font-family:'Cinzel',serif; font-weight:bold; width:100%; }
button:hover{ background-color:#236B43; transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.15); }
.login-box{ text-align:center; margin-top:2rem; padding-top:2rem; border-top:2px solid rgba(46,139,87,0.2); }
.login-box p{ margin-bottom:1rem; font-size:1.1rem; }
.login-box button{ background-color:var(--sky-blue); max-width:200px; margin:0 auto; }
.login-box button:hover{ background-color:#6CB4D1; }
.footer-content{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; }
.footer-content p{ margin:0; font-size:1rem; display:flex; align-items:center; gap:.4rem; }
.footer-socials{ display:flex; gap:1rem; }
.footer-socials a{ text-decoration:none; background:rgba(255,255,255,0.15); color:var(--cream); padding:.5rem 1rem; border-radius:20px; display:inline-flex; align-items:center; gap:.4rem; transition:background .3s ease; }
.footer-socials a:hover{ background:rgba(255,255,255,0.25); }
`;

export default function Signup(){
  const [form, setForm] = React.useState({ name:"", email:"", dob:"", gender:"", college:"", phone:"", password:"", role:"", aicf_id:"", fide_id:"" });
  const [otp, setOtp] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({ name:false, email:false, dob:false, gender:false, college:false, phone:false, password:false, role:false, aicf_id:false, fide_id:false, otp:false });
  const [serverMsg, setServerMsg] = React.useState({ type:"", text:"" });
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  React.useEffect(()=>{ document.body.classList.add('react-root-host'); return ()=>document.body.classList.remove('react-root-host'); },[]);

  const setField = (k,v)=> setForm(s=>({ ...s, [k]:v }));

  function validateName(name){ return !!name && /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name); }
  function validateEmail(email){ if (!email || !/^\S+@\S+\.\S+$/.test(email)) return false; if (/[A-Z]/.test(email)) return false; return true; }
  function validateDob(dob){ if (!dob) return false; const d=new Date(dob); if (isNaN(d)) return false; const age=Math.floor((Date.now()-d)/(365.25*24*60*60*1000)); return age>=16; }
  function validateGender(g){ return ['male','female','other'].includes(g); }
  function validateCollege(c){ return !!c && /^[A-Za-z\s']+$/.test(c); }
  function validatePhone(p){ return /^[0-9]{10}$/.test(p); }
  function validatePassword(p){ return !!p && /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(p); }
  function validateRole(r){ return ['admin','organizer','coordinator','player'].includes(r); }

  function setError(id, msg){ setErrors(s=>({ ...s, [id]: msg })); }

  function validateField(id, value){
    switch(id){
      case 'name': return validateName(value) ? '' : 'Valid full name is required (letters and single spaces only)';
      case 'email': return validateEmail(value) ? '' : 'Valid email is required (lowercase only)';
      case 'dob': return validateDob(value) ? '' : 'You must be at least 16 years old';
      case 'gender': return validateGender(value) ? '' : 'Gender is required';
      case 'college': return validateCollege(value) ? '' : 'College name must contain only letters, spaces, or apostrophes';
      case 'phone': return validatePhone(value) ? '' : 'Valid 10-digit phone number is required';
      case 'password': return validatePassword(value) ? '' : 'Password must be at least 8 characters with one uppercase, one lowercase, and one special character';
      case 'role': return validateRole(value) ? '' : 'Valid role is required';
      case 'aicf_id': return '';
      case 'fide_id': return '';
      case 'otp': return (!value || value.length !== 6) ? 'Please enter a valid 6-digit OTP' : '';
      default: return '';
    }
  }

  function validateAll(){
    const e = {};
    if (!validateName(form.name)) e.name = 'Valid full name is required (letters and single spaces only)';
    if (!validateEmail(form.email)) e.email = 'Valid email is required (lowercase only)';
    if (!validateDob(form.dob)) e.dob = 'You must be at least 16 years old';
    if (!validateGender(form.gender)) e.gender = 'Gender is required';
    if (!validateCollege(form.college)) e.college = 'College name must contain only letters, spaces, or apostrophes';
    if (!validatePhone(form.phone)) e.phone = 'Valid 10-digit phone number is required';
    if (!validatePassword(form.password)) e.password = 'Password must be at least 8 characters with one uppercase, one lowercase, and one special character';
    if (!validateRole(form.role)) e.role = 'Valid role is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e){
    e.preventDefault();
    setServerMsg({type:"", text:""});
    if (!validateAll()) { setServerMsg({type:"error", text:"Please correct the errors in the form"}); return; }
    try{
      const result = await dispatch(signup(form));
      if (result.meta.requestStatus === 'fulfilled') {
        setServerMsg({type:"success", text:"OTP sent to your email. Please enter it below."});
      } else {
        const err = result.payload || result.error || {};
        setServerMsg({type:"error", text:err.message || 'Signup failed'});
      }
    } catch(err){
      console.error('Signup error:', err);
      setServerMsg({type:"error", text:'Failed to connect to server'});
    }
  }

  async function onVerifyOtp(e){
    e.preventDefault();
    setServerMsg({type:"", text:""});
    if (!otp || otp.length !== 6) { setServerMsg({type:"error", text:"Please enter a valid 6-digit OTP"}); return; }
    try{
      const result = await dispatch(verifySignupOtp({ email: form.email.trim(), otp }));
      if (result.meta.requestStatus === 'fulfilled') {
        const redirectUrl = result.payload?.redirectUrl || '/';
        window.location.href = redirectUrl;
      } else {
        const err = result.payload || result.error || {};
        setServerMsg({type:"error", text:err.message || 'OTP verification failed'});
      }
    } catch(err){
      console.error('OTP verify error:', err);
      setServerMsg({type:"error", text:'Failed to connect to server'});
    }
  }

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
        <div className="form-container">
          <h2>Join ChessHive</h2>
          <div id="serverError" className={`server-error${serverMsg.type==='success' ? ' success' : ''}`} style={{ display: serverMsg.text ? 'block' : 'none' }}>{serverMsg.text}</div>

          <form id="signupForm" onSubmit={auth.otpSent ? onVerifyOtp : onSubmit}>
            {!auth.otpSent ? (
              <>
                <div>
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" placeholder="Enter full name" required value={form.name}
                    onChange={e=>{ if(!touched.name) setTouched(s=>({...s,name:true})); const v=e.target.value; setField('name', v); setError('name', validateField('name', v)); }}
                    onBlur={()=> setTouched(s=>({...s,name:true}))}
                  />
                  {errors.name && <span id="nameError" className="error">{errors.name}</span>}
                </div>

                <div>
                  <label htmlFor="email">Email ID</label>
                  <input type="email" id="email" name="email" placeholder="Enter your email" required value={form.email}
                    onChange={e=>{ if(!touched.email) setTouched(s=>({...s,email:true})); const v=e.target.value; setField('email', v); setError('email', validateField('email', v)); }}
                    onBlur={()=> setTouched(s=>({...s,email:true}))}
                  />
                  {errors.email && <span id="emailError" className="error">{errors.email}</span>}
                </div>

                <div>
                  <label htmlFor="dob">Date of Birth</label>
                  <input type="date" id="dob" name="dob" required value={form.dob}
                    onChange={e=>{ if(!touched.dob) setTouched(s=>({...s,dob:true})); const v=e.target.value; setField('dob', v); setError('dob', validateField('dob', v)); }}
                    onBlur={()=> setTouched(s=>({...s,dob:true}))}
                  />
                  {errors.dob && <span id="dobError" className="error">{errors.dob}</span>}
                </div>

                <div>
                  <label htmlFor="gender">Gender</label>
                  <select id="gender" name="gender" required value={form.gender}
                    onChange={e=>{ if(!touched.gender) setTouched(s=>({...s,gender:true})); const v=e.target.value; setField('gender', v); setError('gender', validateField('gender', v)); }}
                    onBlur={()=> setTouched(s=>({...s,gender:true}))}
                  >
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                  {errors.gender && <span id="genderError" className="error">{errors.gender}</span>}
                </div>

                <div>
                  <label htmlFor="college">College Name</label>
                  <input type="text" id="college" name="college" placeholder="Enter college name" required value={form.college}
                    onChange={e=>{ if(!touched.college) setTouched(s=>({...s,college:true})); const v=e.target.value; setField('college', v); setError('college', validateField('college', v)); }}
                    onBlur={()=> setTouched(s=>({...s,college:true}))}
                  />
                  {errors.college && <span id="collegeError" className="error">{errors.college}</span>}
                </div>

                <div>
                  <label htmlFor="phone">Phone Number</label>
                  <input type="text" id="phone" name="phone" placeholder="Enter phone number" required value={form.phone}
                    onChange={e=>{ if(!touched.phone) setTouched(s=>({...s,phone:true})); const v=e.target.value.replace(/\D/g,'').slice(0,10); setField('phone', v); setError('phone', validateField('phone', v)); }}
                    onBlur={()=> setTouched(s=>({...s,phone:true}))}
                  />
                  {errors.phone && <span id="phoneError" className="error">{errors.phone}</span>}
                </div>

                <div>
                  <label htmlFor="password">Password</label>
                  <input type="password" id="password" name="password" placeholder="Enter password" required value={form.password}
                    onChange={e=>{ if(!touched.password) setTouched(s=>({...s,password:true})); const v=e.target.value; setField('password', v); setError('password', validateField('password', v)); }}
                    onBlur={()=> setTouched(s=>({...s,password:true}))}
                  />
                  {errors.password && <span id="passwordError" className="error">{errors.password}</span>}
                </div>

                <div>
                  <label htmlFor="role">Select Role</label>
                  <select id="role" name="role" required value={form.role}
                    onChange={e=>{ if(!touched.role) setTouched(s=>({...s,role:true})); const v=e.target.value; setField('role', v); setError('role', validateField('role', v)); }}
                    onBlur={()=> setTouched(s=>({...s,role:true}))}
                  >
                  <option value="" disabled>Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="organizer">Organizer</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="player">Player</option>
                </select>
                  {errors.role && <span id="roleError" className="error">{errors.role}</span>}
                </div>

                <div>
                  <label htmlFor="aicf_id">AICF ID (Optional)</label>
                  <input type="text" id="aicf_id" name="aicf_id" placeholder="Enter AICF ID" value={form.aicf_id}
                    onChange={e=>{ if(!touched.aicf_id) setTouched(s=>({...s,aicf_id:true})); const v=e.target.value; setField('aicf_id', v); setError('aicf_id', validateField('aicf_id', v)); }}
                    onBlur={()=> setTouched(s=>({...s,aicf_id:true}))}
                  />
                  {errors.aicf_id && <span id="aicf_idError" className="error">{errors.aicf_id}</span>}
                </div>

                <div>
                  <label htmlFor="fide_id">FIDE ID (Optional)</label>
                  <input type="text" id="fide_id" name="fide_id" placeholder="Enter FIDE ID" value={form.fide_id}
                    onChange={e=>{ if(!touched.fide_id) setTouched(s=>({...s,fide_id:true})); const v=e.target.value; setField('fide_id', v); setError('fide_id', validateField('fide_id', v)); }}
                    onBlur={()=> setTouched(s=>({...s,fide_id:true}))}
                  />
                  {errors.fide_id && <span id="fide_idError" className="error">{errors.fide_id}</span>}
                </div>

                <div className="full-width">
                  <button type="submit" disabled={auth.loading}>{auth.loading ? 'Sending OTP...' : 'Send OTP'}</button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="otp">Enter OTP</label>
                  <input type="text" id="otp" name="otp" placeholder="Enter 6-digit OTP" required value={otp}
                    onChange={e=>{ if(!touched.otp) setTouched(s=>({...s,otp:true})); const v=e.target.value.replace(/\D/g,''); setOtp(v.slice(0,6)); setError('otp', validateField('otp', v)); }}
                    onBlur={()=> setTouched(s=>({...s,otp:true}))}
                    maxLength="6"
                  />
                  {errors.otp && <span id="otpError" className="error">{errors.otp}</span>}
                </div>
                <div className="full-width">
                  <button type="submit" disabled={auth.loading}>{auth.loading ? 'Verifying...' : 'Verify OTP'}</button>
                  <button type="button" onClick={() => { setServerMsg({type:"", text:""}); dispatch({ type: 'auth/clearError' }); }}>Back</button>
                </div>
              </>
            )}
          </form>

          <div className="login-box">
            <p>Already have an account?</p>
            <button onClick={()=> window.location.href='/login'}>Login</button>
          </div>
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
