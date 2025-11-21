import React from "react";

const styles = `
:root { --sea-green:#2E8B57; --cream:#FFFDD0; --sky-blue:#87CEEB; }
*{margin:0;padding:0;box-sizing:border-box;}
body.react-root-host{ min-height:100vh; font-family:'Playfair Display',serif; background-color:var(--cream); color:var(--sea-green); display:flex; flex-direction:column; }
header{ background-color:var(--sea-green); color:var(--cream); padding:1rem 2rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; }
.logo-section{ display:flex; align-items:center; gap:.6rem; }
.logo-section i{ font-size:1.8rem; }
.logo-section h1{ font-family:'Cinzel',serif; font-size:1.8rem; font-weight:700; }
.main-nav{ display:flex; align-items:center; }
.nav-links{ display:flex; list-style:none; gap:1.5rem; }
.nav-links a{ text-decoration:none; color:var(--cream); font-size:1.1rem; display:flex; align-items:center; gap:.4rem; transition:color .3s ease; }
.nav-links a:hover{ color:var(--sky-blue); }
.secondary-header{ text-align:center; font-family:'Cinzel',serif; font-size:2.5rem; color:var(--sea-green); padding:2rem 0; }
main{ flex:1; display:flex; justify-content:center; align-items:center; padding:2rem; }
.form-container{ width:100%; max-width:800px; margin:0 auto; }
.form-box{ padding:2rem; }
h2{ color:var(--sea-green); font-family:'Cinzel',serif; font-size:2rem; margin-bottom:1rem; text-align:center; }
p{ text-align:center; margin-bottom:2rem; color:var(--sea-green); font-size:1.1rem; }
form{ display:flex; flex-direction:column; gap:1.5rem; }
label{ color:var(--sea-green); font-weight:bold; font-size:1.1rem; }
input,textarea{ width:100%; padding:1rem; border:2px solid var(--sea-green); border-radius:8px; font-size:1rem; background:rgba(255,255,255,0.9); transition:all .3s ease; font-family:'Playfair Display',serif; }
input:focus,textarea:focus{ outline:none; border-color:var(--sky-blue); box-shadow:0 0 0 3px rgba(135,206,235,0.2); }
textarea{ resize:vertical; min-height:150px; }
button{ background-color:var(--sea-green); color:var(--cream); padding:1rem 2rem; border:none; border-radius:8px; font-size:1.2rem; cursor:pointer; transition:all .3s ease; font-family:'Cinzel',serif; font-weight:bold; }
button:hover{ background-color:#236b43; transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.15); }
.error{ color:#dc3545; font-size:.9rem; margin-top:.3rem; }
.success-message{ background:rgba(46,139,87,0.1); color:var(--sea-green); padding:1rem; border-radius:8px; text-align:center; margin-top:1rem; }
footer{ background-color:var(--sea-green); color:var(--cream); padding:1.5rem 2rem; }
.footer-content{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; }
.footer-content p{ color:var(--cream) !important; margin:0; font-size:1rem; display:flex; align-items:center; gap:.4rem; }
.footer-socials{ display:flex; gap:1rem; }
.footer-socials a{ text-decoration:none; background:rgba(255,255,255,0.15); color:var(--cream); padding:.5rem 1rem; border-radius:20px; display:inline-flex; align-items:center; gap:.4rem; transition:background .3s ease; }
.footer-socials a:hover{ background:rgba(255,255,255,0.25); }
@media(max-width:768px){ header{flex-direction:column; gap:1rem;} }
`;

export default function ContactUs(){
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState({ name:"", email:"", message:"" });
  const [success, setSuccess] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    document.body.classList.add('react-root-host');
    return () => document.body.classList.remove('react-root-host');
  }, []);

  // Handle URL messages like the original
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const successMsg = params.get('success-message');
    const errorMsg = params.get('error-message');
    if (successMsg){ setSuccess(successMsg); }
    else if (errorMsg){ setSuccess(errorMsg); }
  }, []);

  function validate(){
    const e = { name:"", email:"", message:"" };
    const nameTrim = name.trim();
    const emailTrim = email.trim();
    const messageTrim = message.trim();
    const namePattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!nameTrim) e.name = 'Name is required.';
    else if (!namePattern.test(nameTrim)) e.name = 'Name should only contain letters, spaces, or hyphens.';
    if (!emailTrim) e.email = 'Email is required.';
    else if (!emailPattern.test(emailTrim)) e.email = 'Please enter a valid email address.';
    const words = (messageTrim.match(/\b\w+\b/g) || []);
    if (!messageTrim) e.message = 'Message cannot be empty.';
    else if (words.length > 200) e.message = 'Message cannot exceed 200 words.';
    setErrors(e);
    return !e.name && !e.email && !e.message;
  }

  async function onSubmit(e){
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSuccess("");
    setErrors({ name:"", email:"", message:"" });

    if (!validate()){ setSubmitting(false); return; }

    try {
      const res = await fetch('/api/contactus', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success){
        setSuccess(data.message || 'Message sent successfully!');
        setName(""); setEmail(""); setMessage("");
        setTimeout(()=> setSuccess(""), 5000);
      } else {
        setSuccess(data.message || 'Failed to send message.');
      }
    } catch(err){
      console.error('Contact error:', err);
      setSuccess('Failed to connect to server.');
    } finally {
      setSubmitting(false);
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

      <div className="secondary-header">Contact Us</div>

      <main>
        <div className="form-container">
          <div className="form-box">
            <h2>Get in Touch</h2>
            <p>If you have any questions, suggestions, or want to collaborate, feel free to reach out to us.</p>

            <form id="contactForm" onSubmit={onSubmit}>
              <div>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" required value={name} onChange={e=> setName(e.target.value)} />
                {errors.name && <div className="error" id="errorName">{errors.name}</div>}
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required value={email} onChange={e=> setEmail(e.target.value)} />
                {errors.email && <div className="error" id="errorEmail">{errors.email}</div>}
              </div>

              <div>
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" required value={message} onChange={e=> setMessage(e.target.value)} />
                {errors.message && <div className="error" id="errorMessage">{errors.message}</div>}
              </div>

              <button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</button>
            </form>

            {success && (
              <div className="success-message" id="successMessage" style={{ display:'block', backgroundColor: success.includes('Failed') || success.includes('failed') ? '#f8d7da' : undefined, color: success.includes('Failed') || success.includes('failed') ? '#721c24' : undefined }}>
                {success}
              </div>
            )}
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
