import React from "react";

const styles = `
  :root {
    --sea-green: #2E8B57;
    --cream: #FFFDD0;
    --sky-blue: #87CEEB;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body.react-root-host { font-family: 'Playfair Display', serif; background-color: var(--cream); color: var(--sea-green); min-height: 100vh; display: flex; flex-direction: column; }
  header { background-color: var(--sea-green); color: var(--cream); padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  .logo-section { display: flex; align-items: center; gap: 0.6rem; }
  .logo-section i { font-size: 1.8rem; }
  .logo-section h1 { font-family: 'Cinzel', serif; font-size: 1.8rem; font-weight: 700; }
  .main-nav { display: flex; align-items: center; }
  .nav-links { display: flex; list-style: none; gap: 1.5rem; }
  .nav-links a { text-decoration: none; color: var(--cream); font-size: 1.1rem; display: flex; align-items: center; gap: 0.4rem; transition: color 0.3s ease; }
  .nav-links a:hover { color: var(--sky-blue); }
  .secondary-header { text-align: center; font-family: 'Cinzel', serif; font-size: 2.5rem; color: var(--sea-green); padding: 2rem 0; margin: 2rem 0; position: relative; }
  .secondary-header::after { content: '♔'; position: absolute; font-size: 3rem; opacity: 0.1; right: 20%; top: 50%; transform: translateY(-50%); }
  .secondary-header::before { content: '♕'; position: absolute; font-size: 3rem; opacity: 0.1; left: 20%; top: 50%; transform: translateY(-50%); }
  main { flex: 1; max-width: 1200px; margin: 0 auto; padding: 2rem; }
  .content-box { margin-bottom: 3rem; padding: 2rem; border-radius: 15px; transition: transform 0.3s ease; background-color: rgba(255,255,255,0.4); }
  .content-box:hover { transform: translateY(-5px); }
  .content-box h2 { font-family: 'Cinzel', serif; font-size: 2rem; margin-bottom: 1.5rem; color: var(--sea-green); }
  .content-box p { font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--sea-green); }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 3rem; }
  .feature-card { padding: 2rem; border-radius: 15px; border: 2px solid rgba(46, 139, 87, 0.2); transition: all 0.3s ease; background-color: rgba(255, 255, 255, 0.2); }
  .feature-card:hover { transform: translateY(-5px); border-color: var(--sea-green); }
  .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
  footer { background-color: var(--sea-green); color: var(--cream); padding: 1.5rem 2rem; }
  .footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
  .footer-content p { margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.4rem; }
  .footer-socials { display: flex; gap: 1rem; }
  .footer-socials a { text-decoration: none; background-color: rgba(255, 255, 255, 0.15); color: var(--cream); padding: 0.5rem 1rem; border-radius: 20px; display: inline-flex; align-items: center; gap: 0.4rem; transition: background 0.3s ease; }
  .footer-socials a:hover { background-color: rgba(255, 255, 255, 0.25); }
  @media(max-width:768px) { header { flex-direction: column; gap: 1rem; } .secondary-header::before, .secondary-header::after { display: none; } }
`;

export default function About() {
  React.useEffect(() => {
    document.body.classList.add('react-root-host');
    return () => document.body.classList.remove('react-root-host');
  }, []);

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

      <div className="secondary-header">About Chess Hive</div>

      <main>
        <div className="content-box">
          <h2>Our Mission</h2>
          <p>At Chess Hive, we aim to create a thriving community of passionate chess players from various campuses. Whether you are a beginner or an expert, we provide a platform to refine your skills, compete in tournaments, and connect with fellow enthusiasts.</p>
        </div>

        <div className="content-box">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Tournaments</h3>
              <p>Participate in campus-wide and inter-college tournaments</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">♟️</div>
              <h3>Expert Mentorship</h3>
              <p>Connect with experienced players and mentors</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Regular Events</h3>
              <p>Stay updated with upcoming events</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Community</h3>
              <p>Engage with an active and supportive chess community</p>
            </div>
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
