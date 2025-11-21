import React, { useEffect, useMemo, useState } from 'react';
import usePlayerTheme from '../../hooks/usePlayerTheme';
import { useNavigate } from 'react-router-dom';

const ROWS_PER_PAGE = 5;

function PlayerTournament() {
  const [isDark, toggleTheme] = usePlayerTheme();
  const navigate = useNavigate();

  // UI/messages
  const [message, setMessage] = useState(null); // { text, isError }
  const [loading, setLoading] = useState(false);

  // Wallet/subscription
  const [walletBalance, setWalletBalance] = useState(0);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  // Tournaments raw data
  const [raw, setRaw] = useState({ tournaments: [], enrolledIndividualTournaments: [], enrolledTeamTournaments: [], currentSubscription: null, username: '' });

  // Filters
  const [searchIndividual, setSearchIndividual] = useState('');
  const [searchIndividualType, setSearchIndividualType] = useState('name');
  const [searchTeam, setSearchTeam] = useState('');
  const [searchTeamType, setSearchTeamType] = useState('name');

  // Pagination visible counts
  const [individualVisibleCount, setIndividualVisibleCount] = useState(ROWS_PER_PAGE);
  const [teamVisibleCount, setTeamVisibleCount] = useState(ROWS_PER_PAGE);

  // Helpers
  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401) {
      navigate('/login');
      return null;
    }
    const data = await res.json().catch(() => ({}));
    return { res, data };
  };

  const loadWalletAndSubscription = async () => {
    const out = await fetchJson('/player/api/profile');
    if (!out) return;
    const { res, data } = out;
    if (!res.ok) {
      setMessage({ text: 'Failed to load wallet balance and subscription status.', isError: true });
      setWalletBalance(0);
      return;
    }
    setWalletBalance(data.player?.walletBalance ?? 0);
    const subscribed = !!(data.player?.subscription && new Date(data.player.subscription.end_date) > new Date());
    setSubscriptionActive(subscribed);
  };

  const loadTournaments = async () => {
    setLoading(true);
    try {
      const out = await fetchJson('/player/api/tournaments', { headers: { 'Cache-Control': 'no-cache' } });
      if (!out) return;
      const { res, data } = out;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRaw({
        tournaments: data.tournaments || [],
        enrolledIndividualTournaments: data.enrolledIndividualTournaments || [],
        enrolledTeamTournaments: data.enrolledTeamTournaments || [],
        currentSubscription: data.currentSubscription || null,
        username: data.username || ''
      });
      // If API also returns subscription, prefer it
      const subscribed = !!(data.currentSubscription && new Date(data.currentSubscription.end_date) > new Date());
      if (subscribed !== subscriptionActive) setSubscriptionActive(subscribed);
    } catch (err) {
      setMessage({ text: `Failed to load tournaments: ${err.message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletAndSubscription();
    loadTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived tournaments with enrollment flags
  const individualTournaments = useMemo(() => {
    const todayStr = new Date().toDateString();
    return (raw.tournaments || [])
      .filter(t => {
        const type = (t.type || 'individual').toLowerCase();
        return type === 'individual' || type === 'solo';
      })
      .map(t => {
        const alreadyEnrolled = (raw.enrolledIndividualTournaments || []).some(e => e.tournament?._id?.toString() === t._id?.toString());
        const date = new Date(t.date);
        const status = date.toDateString() === todayStr ? 'Ongoing' : 'Yet to Start';
        const statusClass = date.toDateString() === todayStr ? 'status-ongoing' : 'status-yet-to-start';
        return { ...t, alreadyEnrolled, status, statusClass, date };
      });
  }, [raw]);

  const teamTournaments = useMemo(() => {
    const todayStr = new Date().toDateString();
    const currentUser = raw.username;
    return (raw.tournaments || [])
      .filter(t => ['team', 'group'].includes((t.type || '').toLowerCase()))
      .map(t => {
        const enrollment = (raw.enrolledTeamTournaments || []).find(e => e.tournament?._id?.toString() === t._id?.toString());
        const alreadyJoined = !!enrollment;
        const approved = enrollment ? !!enrollment.approved : false;
        const needsApproval = !!(enrollment && (
          (enrollment.player1_name === currentUser && !enrollment.player1_approved) ||
          (enrollment.player2_name === currentUser && !enrollment.player2_approved) ||
          (enrollment.player3_name === currentUser && !enrollment.player3_approved)
        ));
        const date = new Date(t.date);
        const status = date.toDateString() === todayStr ? 'Ongoing' : 'Yet to Start';
        const statusClass = date.toDateString() === todayStr ? 'status-ongoing' : 'status-yet-to-start';
        return {
          ...t,
          alreadyJoined,
          approved,
          needsApproval,
          enrollmentId: enrollment?._id || null,
          player1_name: enrollment?.player1_name || null,
          player2_name: enrollment?.player2_name || null,
          player3_name: enrollment?.player3_name || null,
          player1_approved: !!enrollment?.player1_approved,
          player2_approved: !!enrollment?.player2_approved,
          player3_approved: !!enrollment?.player3_approved,
          date,
          status,
          statusClass,
        };
      });
  }, [raw]);

  // Filtering helpers
  const applyFilter = (list, search, type) => {
    const ft = (search || '').toLowerCase().trim();
    if (!ft) return list;
    return list.filter(row => {
      if (type === 'name') return (row.name || '').toLowerCase().includes(ft);
      if (type === 'location') return (row.location || '').toLowerCase().includes(ft);
      if (type === 'status') return (row.status || '').toLowerCase().includes(ft);
      return true;
    });
  };

  const filteredIndividuals = applyFilter(individualTournaments, searchIndividual, searchIndividualType);
  const filteredTeams = applyFilter(teamTournaments, searchTeam, searchTeamType);

  // Join handlers
  const joinIndividual = async (tournamentId) => {
    if (loading) return;
    setLoading(true);
    try {
      const out = await fetchJson('/player/api/join-individual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId })
      });
      if (!out) return;
      const { res, data } = out;
      if (res.ok) {
        setMessage({ text: data.message || 'Joined successfully', isError: false });
        if (typeof data.walletBalance !== 'undefined') setWalletBalance(data.walletBalance);
        await loadTournaments();
      } else {
        setMessage({ text: data.error || 'Failed to join tournament', isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Error joining tournament.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (tournamentId, players) => {
    if (loading) return;
    setLoading(true);
    try {
      const out = await fetchJson('/player/api/join-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, ...players })
      });
      if (!out) return;
      const { res, data } = out;
      if (res.ok) {
        setMessage({ text: data.message || 'Team submitted successfully', isError: false });
        if (typeof data.walletBalance !== 'undefined') setWalletBalance(data.walletBalance);
        await loadTournaments();
      } else {
        setMessage({ text: data.error || 'Failed to join team tournament', isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Error joining team tournament.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const approveTeamRequest = async (requestId) => {
    if (loading) return;
    setLoading(true);
    try {
      const out = await fetchJson('/player/api/approve-team-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ requestId })
      });
      if (!out) return;
      const { res, data } = out;
      if (res.ok) {
        setMessage({ text: 'Team request approved successfully!', isError: false });
        // slight delay to allow backend to update
        setTimeout(loadTournaments, 800);
      } else {
        setMessage({ text: data.error || 'Failed to approve team request', isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Error approving team request.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const addFunds = async (amount) => {
    if (loading) return;
    setLoading(true);
    try {
      const out = await fetchJson('/player/api/add-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(amount, 10) })
      });
      if (!out) return;
      const { res, data } = out;
      if (res.ok) {
        setWalletBalance(data.walletBalance);
        setMessage({ text: 'Funds added successfully!', isError: false });
      } else {
        setMessage({ text: data.error || 'Failed to add funds', isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Error adding funds.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  // Local UI state: which team join form is open
  const [openJoinFormId, setOpenJoinFormId] = useState(null);

  return (
    <div>
      <style>{`
        :root { --sea-green:#2E8B57; --cream:#FFFDD0; --sky-blue:#87CEEB; --dark-green:#236B43; --red:#ff4d4d; --yellow:#ffcc00; }
        *{ margin:0; padding:0; box-sizing:border-box; }
        body,#root{ min-height:100vh; }
        .content{ font-family:'Playfair Display', serif; background-color:var(--page-bg); min-height:100vh; padding:2rem; max-width:1200px; margin:0 auto; }
        h1,h2{ font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:1rem; }
        .black-h2{ color:var(--sea-green); font-family:'Cinzel', serif; margin-top:2rem; margin-bottom:0.5rem; }
        .form-container{ background:var(--content-bg); padding:20px; border-radius:10px; box-shadow:0 0 15px rgba(0,0,0,0.1); margin-bottom:20px; overflow-x:auto; }
        table{ width:100%; border-collapse:collapse; background:var(--content-bg); min-width:600px; }
        th{ background:var(--sea-green); color:var(--on-accent); padding:12px; text-align:left; border-bottom:1px solid var(--border-color); }
        td{ padding:12px; border:1px solid var(--border-color); color:var(--text-color); }
        tbody tr:nth-child(even){ background: rgba(0,0,0,0.02); }
        .player-dark tbody tr:nth-child(even){ background: rgba(255,255,255,0.03); }
        tr:hover{ background:var(--row-hover-bg); }
        .status-ongoing{ color:var(--yellow); font-weight:bold; }
        .status-yet-to-start{ color:var(--sea-green); font-weight:bold; }
        .wallet-section{ background:var(--sea-green); color:var(--on-accent); padding:20px; border-radius:10px; text-align:center; margin-bottom:1.5rem; overflow:hidden; }
        .wallet-section h3{ color:var(--on-accent); margin:0 0 1rem 0; }
        .wallet-section form{ display:flex; flex-direction:column; gap:10px; max-width:300px; margin:0 auto; }
        .wallet-section input[type='number']{ width:100%; padding:12px; border:2px solid var(--sea-green); border-radius:5px; font-size:16px; box-sizing:border-box; background:var(--content-bg); color:var(--text-color); outline:none; }
        .wallet-section button{ background:var(--sky-blue); color:var(--sea-green); border:none; padding:12px 24px; border-radius:5px; cursor:pointer; font-weight:bold; transition:all 0.3s ease; font-family:'Cinzel', serif; text-align:center; width:100%; box-sizing:border-box; }
        .wallet-section button:hover{ background:var(--sky-blue-hover); transform: translateY(-2px); }
        .tournament-name{ cursor:pointer; color:var(--sea-green); font-weight:bold; }
        .back-to-dashboard{ position:fixed; bottom:30px; right:30px; background:var(--sea-green); color:var(--on-accent); padding:10px 20px; border-radius:5px; text-decoration:none; box-shadow:0 2px 10px rgba(0,0,0,0.1); font-weight:bold; z-index:1000; }
        button,.btn{ background:var(--sea-green); color:var(--on-accent); border:none; padding:10px 20px; border-radius:5px; cursor:pointer; transition:all 0.2s ease; font-family:'Playfair Display', serif; margin:5px 2px; text-decoration:none; display:inline-flex; align-items:center; gap:8px; }
        .btn{ background:var(--sky-blue); color:var(--sea-green); font-family:'Cinzel', serif; font-weight:bold; }
        button:hover{ filter: brightness(0.95); transform: translateY(-2px); }
        .btn:hover{ background: var(--sky-blue-hover); transform: translateY(-2px); }
        .back-to-dashboard:hover{ filter: brightness(0.95); transform: translateY(-2px); }
        button[disabled]{ background:gray; cursor:not-allowed; opacity:0.7; }
        .subscription-message{ background:var(--sky-blue); color:var(--sea-green); padding:15px; border-radius:5px; margin-bottom:20px; font-weight:bold; }
        .subscription-message a{ color:var(--sea-green); text-decoration:underline; }
        .search-box{ margin-bottom:1rem; display:flex; gap:1rem; align-items:center; flex-wrap:wrap; }
        .search-box input{ padding:0.6rem 1rem; width:100%; max-width:300px; border:2px solid var(--sea-green); border-radius:8px; font-size:1rem; transition:all 0.3s ease; font-family:'Playfair Display', serif; background:var(--content-bg); color:var(--text-color); outline:none; }
        .search-box select{ padding:0.6rem 1rem; border:2px solid var(--sea-green); border-radius:8px; font-size:1rem; background:var(--content-bg); color:var(--text-color); font-family:'Cinzel', serif; cursor:pointer; transition:all 0.3s ease; }
        .more-container{ text-align:center; margin:1rem 0; display:flex; justify-content:center; gap:1rem; }
        .more,.hide{ display:inline-flex; align-items:center; gap:0.5rem; background:var(--sky-blue); color:var(--sea-green); text-decoration:none; padding:0.8rem 1.5rem; border-radius:8px; transition:all 0.3s ease; font-family:'Cinzel', serif; font-weight:bold; cursor:pointer; }
        .more:hover,.hide:hover{ background:var(--sky-blue-hover); transform: translateY(-2px); }
        .empty-message{ text-align:center; padding:2rem; color:var(--sea-green); font-style:italic; }
        .loading{ opacity:0.5; pointer-events:none; }
        .enrolled-text{ color: var(--sky-blue); font-weight:bold; }
        .join-form{ margin-top:8px; background: var(--page-bg); border:1px solid var(--border-color); padding:12px; border-radius:8px; }
        .join-form label{ color: var(--text-color); font-weight:600; }
        .join-form input{ background: var(--content-bg); color: var(--text-color); border:2px solid var(--sea-green); padding:8px; border-radius:6px; }
        @media (max-width:768px){ .content{ padding:1rem; } .back-to-dashboard{ bottom:20px; right:20px; } .btn{ width:100%; justify-content:center; } table{ font-size:0.9rem; } .wallet-section form{ max-width:100%; } .wallet-section input[type='number'],.wallet-section button{ width:100%; } .more-container{ flex-direction:column; gap:0.5rem; } .search-box{ flex-direction:column; align-items:stretch; } .search-box input,.search-box select{ max-width:100%; } }
      `}</style>

      <div className="content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1><i className="fas fa-trophy" /> Tournaments</h1>
          <div>
            <button onClick={toggleTheme} style={{ background: 'transparent', border: '2px solid var(--sea-green)', color: 'var(--sea-green)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}>{isDark ? 'Switch to Light' : 'Switch to Dark'}</button>
          </div>
        </div>

        {/* Message banner */}
        {message && (
          <div style={{ padding: 15, borderRadius: 5, marginBottom: 20, backgroundColor: message.isError ? 'var(--red)' : 'var(--sky-blue)', color: message.isError ? 'var(--on-accent)' : 'var(--sea-green)', fontWeight: 'bold' }}>
            {message.text}
          </div>
        )}

        {/* Subscription message */}
        {!subscriptionActive && (
          <div className="subscription-message">
            YOU MUST BE SUBSCRIBED TO JOIN TOURNAMENTS. <a href="/player/subscription">Subscribe Now</a>
          </div>
        )}

        {/* Wallet section */}
        <div className="wallet-section">
          <span className="wallet-icon" role="img" aria-label="wallet">💰</span>
          <h3>Wallet Balance: ₹<span>{walletBalance}</span></h3>
          <form onSubmit={(e) => { e.preventDefault(); const amount = e.currentTarget.amount.value; if (!amount) return; addFunds(amount); e.currentTarget.reset(); }}>
            <input type="number" name="amount" placeholder="Enter amount" min="1" required />
            <input type="hidden" name="redirectTo" value="/player/player_tournament" />
            <button type="submit" disabled={loading}>Add Funds</button>
          </form>
        </div>

        {/* Individual Tournaments */}
        <h2 className="black-h2">Available Individual Tournaments</h2>
        <div className="search-box">
          <input type="text" placeholder="Search individual tournaments..." value={searchIndividual} onChange={(e) => setSearchIndividual(e.target.value)} />
          <select value={searchIndividualType} onChange={(e) => setSearchIndividualType(e.target.value)}>
            <option value="name">Name</option>
            <option value="location">Location</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div className={`form-container ${loading ? 'loading' : ''}`}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Entry Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndividuals.length === 0 ? (
                <tr><td colSpan="6" className="empty-message">No individual tournaments available</td></tr>
              ) : (
                filteredIndividuals.slice(0, individualVisibleCount).map(t => (
                  <tr key={t._id}>
                    <td>{t.name}</td>
                    <td>{t.date ? new Date(t.date).toLocaleDateString() : ''}</td>
                    <td>{t.location}</td>
                    <td>₹{t.entry_fee}</td>
                    <td className={t.statusClass}>{t.status}</td>
                    <td>
                      {!t.alreadyEnrolled ? (
                        <form onSubmit={(e) => { e.preventDefault(); joinIndividual(t._id); }}>
                          <button type="submit" disabled={!subscriptionActive || loading}>
                            Join {!subscriptionActive ? '(SUBSCRIPTION REQUIRED)' : ''}
                          </button>
                        </form>
                      ) : (
                        <>
                          <span className="enrolled-text">ENROLLED</span><br />
                          <a href={`/player/pairings?tournament_id=${t._id}&rounds=5`} className="btn"><i className="fas fa-chess-board" /> View Pairings</a>
                          <a href={`/player/rankings?tournament_id=${t._id}`} className="btn"><i className="fas fa-medal" /> Final Rankings</a>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="more-container">
          {individualVisibleCount < filteredIndividuals.length && (
            <button type="button" className="more" onClick={() => setIndividualVisibleCount(Math.min(individualVisibleCount + ROWS_PER_PAGE, filteredIndividuals.length))}>
              <i className="fas fa-chevron-down" /> More
            </button>
          )}
          {individualVisibleCount > ROWS_PER_PAGE && (
            <button type="button" className="hide" onClick={() => setIndividualVisibleCount(ROWS_PER_PAGE)}>
              <i className="fas fa-chevron-up" /> Hide
            </button>
          )}
        </div>

        {/* Team Tournaments */}
        <h2 className="black-h2">Available Team Tournaments</h2>
        <div className="search-box">
          <input type="text" placeholder="Search team tournaments..." value={searchTeam} onChange={(e) => setSearchTeam(e.target.value)} />
          <select value={searchTeamType} onChange={(e) => setSearchTeamType(e.target.value)}>
            <option value="name">Name</option>
            <option value="location">Location</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div className={`form-container ${loading ? 'loading' : ''}`}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Entry Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.length === 0 ? (
                <tr><td colSpan="6" className="empty-message">No team tournaments available</td></tr>
              ) : (
                filteredTeams.slice(0, teamVisibleCount).map(t => (
                  <tr key={t._id}>
                    <td>{t.name}</td>
                    <td>{t.date ? new Date(t.date).toLocaleDateString() : ''}</td>
                    <td>{t.location}</td>
                    <td>₹{t.entry_fee}</td>
                    <td className={t.statusClass}>{t.status}</td>
                    <td>
                      {!t.alreadyJoined ? (
                        <>
                          <button type="button" className="join-team-btn" disabled={!subscriptionActive || loading} onClick={() => setOpenJoinFormId(openJoinFormId === t._id ? null : t._id)}>
                            Join {!subscriptionActive ? '(SUBSCRIPTION REQUIRED)' : ''}
                          </button>
                          {openJoinFormId === t._id && (
                            <div className="join-form active">
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const player1 = e.currentTarget.player1.value;
                                const player2 = e.currentTarget.player2.value;
                                const player3 = e.currentTarget.player3.value;
                                joinTeam(t._id, { player1, player2, player3 });
                              }}>
                                <label>Player 1:</label><input type="text" name="player1" required />
                                <label>Player 2:</label><input type="text" name="player2" required />
                                <label>Player 3:</label><input type="text" name="player3" required />
                                <button type="submit" disabled={loading}>Submit Team</button>
                              </form>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {t.approved ? (
                            <span className="enrolled-text">ENROLLED</span>
                          ) : (
                            <span className="enrolled-text" style={{ color: 'var(--yellow)', fontWeight: 'bold' }}>PENDING APPROVAL</span>
                          )}
                          {t.needsApproval && (
                            <div>
                              <button className="approve-team-btn" onClick={() => approveTeamRequest(t.enrollmentId)} disabled={loading}>Approve</button>
                            </div>
                          )}
                          {t.approved && (
                            <>
                              <br />
                              <a href={`/player/pairings?tournament_id=${t._id}&rounds=5`} className="btn"><i className="fas fa-chess-board" /> View Pairings</a>
                              <a href={`/player/rankings?tournament_id=${t._id}`} className="btn"><i className="fas fa-medal" /> Final Rankings</a>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="more-container">
          {teamVisibleCount < filteredTeams.length && (
            <button type="button" className="more" onClick={() => setTeamVisibleCount(Math.min(teamVisibleCount + ROWS_PER_PAGE, filteredTeams.length))}>
              <i className="fas fa-chevron-down" /> More
            </button>
          )}
          {teamVisibleCount > ROWS_PER_PAGE && (
            <button type="button" className="hide" onClick={() => setTeamVisibleCount(ROWS_PER_PAGE)}>
              <i className="fas fa-chevron-up" /> Hide
            </button>
          )}
        </div>
      </div>

      <a href="/player/player_dashboard" className="back-to-dashboard">
        <i className="fas fa-arrow-left" /> Back to Dashboard
      </a>
    </div>
  );
}

export default PlayerTournament;
