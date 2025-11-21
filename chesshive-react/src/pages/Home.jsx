import React from "react";

const styles = `
    :root {
        --sea-green: #2E8B57;
        --cream: #FFFDD0;
        --sky-blue: #87CEEB;
        --text-dark: #333333;
    }

    body.react-root-host {
        margin: 0;
        padding: 0;
        font-family: 'Playfair Display', serif;
        background-color: var(--cream);
    }

    .sidebar {
        height: 100%;
        width: 250px;
        position: fixed;
        top: 0;
        left: 0;
        background-color: var(--sea-green);
        padding-top: 60px;
        transition: 0.3s;
        z-index: 1000;
    }

    .sidebar-link {
        padding: 15px 25px;
        text-decoration: none;
        font-size: 18px;
        color: var(--cream);
        display: flex;
        align-items: center;
        transition: 0.3s;
    }

    .sidebar-link i {
        margin-right: 10px;
        width: 25px;
    }

    .sidebar-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
        transform: translateX(10px);
    }

    .sidebar-header {
        text-align: center;
        padding: 20px;
        margin-bottom: 20px;
        border-bottom: 1px solid rgba(255, 253, 208, 0.2);
    }

    .sidebar-header img {
        width: 50px;
        height: 50px;
        margin-bottom: 10px;
    }

    .sidebar-header h1 {
        color: var(--cream);
        font-family: 'Cinzel', serif;
        font-size: 24px;
        margin: 0;
    }

    .welcome-title {
        font-family: 'Cinzel', serif;
        font-size: 4.5rem;
        color: var(--text-dark);
        text-align: center;
        margin: 30px 0;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        animation: fadeInUp 1.2s ease;
    }

    .main-content {
        margin-left: 250px;
        padding: 20px;
    }

    .hero-section {
        background: linear-gradient(135deg, var(--sea-green), var(--sky-blue));
        padding: 4rem 2rem;
        text-align: center;
        border-radius: 15px;
        margin-bottom: 2rem;
    }

    .chess-pieces {
        display: flex;
        justify-content: center;
        gap: 8rem;
        margin: 3rem 0;
    }

    .piece {
        font-size: 5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        color: var(--cream);
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        margin-bottom: 10px;
    }

    .piece-container {
        text-align: center;
        position: relative;
    }

    .piece-text {
        font-family: 'Cinzel', serif;
        color: var(--cream);
        font-size: 1.2rem;
        margin-top: 10px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    }

    .piece::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 14px;
        background-color: var(--cream);
        color: var(--sea-green);
        padding: 5px 10px;
        border-radius: 5px;
        opacity: 0;
        transition: 0.3s;
    }

    .piece:hover::after { opacity: 1; bottom: -40px; }

    .queen:hover { transform: scale(1.2) rotate(-10deg); color: var(--sky-blue); }
    .king:hover { transform: scale(1.2) rotate(10deg); color: var(--sky-blue); }

    .piece-container:hover .piece { transform: translateY(-10px); }
    .piece-container:hover .piece-text { opacity: 1; transform: translateY(0); }

    .content-box {
        background: linear-gradient(135deg, var(--sea-green), var(--sky-blue));
        border-radius: 15px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        color: var(--cream);
    }

    .testimonials .sub-box { background: var(--cream); border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; transition: transform 0.3s; }
    .testimonials .sub-box:hover { transform: translateY(-5px); }

    .sub-feature-upper { display: flex; align-items: center; gap: 1rem; }
    .sub-feature-upper img { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid var(--sea-green); }

    .stars { color: var(--sea-green); }
    .secondary-header { color: var(--cream); font-size: 1.8rem; margin-top: 2rem; }

    .feedback-profile { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid var(--text-dark); }
    .feedback-info h3 { margin: 0; color: var(--text-dark); font-size: 1.2rem; }
    .rating { color: var(--text-dark); font-size: 1.1rem; }
    .feedback-text { color: var(--text-dark); line-height: 1.6; font-style: italic; }

    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }

    .feedback-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; padding: 20px 0; }
    .feedback-card { background: var(--cream); border-radius: 15px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
    .feedback-card:hover { transform: translateY(-5px); }
    .feedback-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
`;

export default function Home() {
  React.useEffect(() => {
    // Match original behavior
    document.body.classList.add('react-root-host');
    return () => document.body.classList.remove('react-root-host');
  }, []);

  const openLoginForm = () => { window.location.href = "/login"; };
  const openSignupForm = () => { window.location.href = "/signup"; };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={process.env.PUBLIC_URL + "/images/chesshive.jpg"} alt="ChessHive Logo" />
          <h1>ChessHive</h1>
        </div>
        <a href="/" className="sidebar-link"><i className="fas fa-home"></i>Home</a>
        <a href="/about" className="sidebar-link"><i className="fas fa-info-circle"></i>About</a>
        <a href="/login" className="sidebar-link"><i className="fas fa-users"></i>Join Community</a>
        <a href="/contactus" className="sidebar-link"><i className="fas fa-envelope"></i>Contact Us</a>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="welcome-title">Welcome to ChessHive</h1>
        <div className="hero-section">
          <div className="chess-pieces">
            <div className="piece queen" data-tooltip="Click to Login" onClick={openLoginForm}>♕</div>
            <div className="piece-text">LOGIN</div>
            <div className="piece king" data-tooltip="Click to Sign Up" onClick={openSignupForm}>♔</div>
            <div className="piece-text">SIGN UP</div>
          </div>
          <div className="secondary-header">Bringing Chess Passionates from Campuses to the Board</div>
        </div>

        <div className="content-box">
          <div className="left-inner-box">
            <p>Whether you're a grandmaster or just starting, our platform brings chess lovers together from around the world. Play, learn, compete, and shop – all in one place!</p>
            <div>
              <p>♟️ Ready to Make Your Move?</p>
              <ul>
                <li>Play anytime, anywhere 🌍</li>
                <li>Improve your skills with coaching & lessons</li>
                <li>Compete with top players worldwide</li>
              </ul>
              <p>🖱️ Sign Up & Start Playing!</p>
            </div>
          </div>
        </div>

        <div className="content-box testimonials">
          <h2 style={{ color: 'var(--text-dark)', textAlign: 'center', marginBottom: 30 }}>What Our Community Says</h2>
          <div className="feedback-grid">
            <div className="feedback-card">
              <div className="feedback-header">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e" alt="Profile" className="feedback-profile" />
                <div className="feedback-info">
                  <h3>Alex Thompson</h3>
                  <div className="rating">★★★★★</div>
                </div>
              </div>
              <p className="feedback-text">"The community here is incredible! I've improved my game significantly through the daily challenges and tournaments."</p>
            </div>

            <div className="feedback-card">
              <div className="feedback-header">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" alt="Profile" className="feedback-profile" />
                <div className="feedback-info">
                  <h3>Emma Chen</h3>
                  <div className="rating">★★★★★</div>
                </div>
              </div>
              <p className="feedback-text">"ChessHive has transformed how I approach the game. The mentorship program is exceptional!"</p>
            </div>

            <div className="feedback-card">
              <div className="feedback-header">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" alt="Profile" className="feedback-profile" />
                <div className="feedback-info">
                  <h3>David Kumar</h3>
                  <div className="rating">★★★★★</div>
                </div>
              </div>
              <p className="feedback-text">"From beginner to tournament player, ChessHive has been there every step of the way. Amazing platform!"</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
