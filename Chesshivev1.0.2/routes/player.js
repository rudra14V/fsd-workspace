const express = require('express');
const router = express.Router();
// Simple in-memory matchmaking and matches store (v1)
const queue = [];
const tickets = new Map(); // ticketId -> { username }
const matches = new Map(); // matchId -> { players: [u1,u2], state: { fen }, moves: [], colors: { white, black } }
const pendingRequests = new Map(); // requestId -> { from, to, colorPref, createdAt }

function makeId(len = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let s = '';
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

// Enqueue for match; pair if possible
router.post('/api/request-match', (req, res) => {
    const username = req.user?.username || req.session?.username || 'guest-' + makeId(5);
    // check if someone is waiting
    const opponent = queue.shift();
    if (opponent) {
        const matchId = makeId(16);
        matches.set(matchId, { players: [opponent.username, username], state: { fen: 'start' }, moves: [] });
        // notify ticket holder (poll-based)
        const t = opponent.ticketId && tickets.get(opponent.ticketId);
        if (t) tickets.set(opponent.ticketId, { ...t, matchId, opponent: username });
        return res.json({ matchId, opponent: opponent.username });
    }
    // create ticket and enqueue
    const ticketId = makeId(16);
    tickets.set(ticketId, { username });
    queue.push({ username, ticketId });
    return res.json({ ticketId });
});

// Targeted match request: search by username and request
router.post('/api/match/request', express.json(), (req, res) => {
    const from = req.user?.username || req.session?.username || 'guest-' + makeId(5);
    const to = (req.body?.opponent || '').trim();
    const colorPref = (req.body?.colorPreference || 'random').toLowerCase();
    if (!to) return res.status(400).json({ error: 'Opponent username required' });
    const requestId = makeId(16);
    pendingRequests.set(requestId, { from, to, colorPref, createdAt: Date.now() });
    res.json({ requestId });
});

// List pending requests for current user
router.get('/api/match/pending', (req, res) => {
    const me = req.user?.username || req.session?.username || 'guest';
    const list = [];
    for (const [id, r] of pendingRequests.entries()) {
        if (r.to === me) list.push({ requestId: id, from: r.from, colorPref: r.colorPref, createdAt: r.createdAt });
    }
    res.json({ requests: list });
});

// Accept a request and create a match
router.post('/api/match/accept', express.json(), (req, res) => {
    const me = req.user?.username || req.session?.username || 'guest';
    const { requestId } = req.body || {};
    const reqData = pendingRequests.get(requestId);
    if (!reqData || reqData.to !== me) return res.status(404).json({ error: 'Request not found' });
    pendingRequests.delete(requestId);
    const matchId = makeId(16);
    // Assign colors
    let white = reqData.from, black = me;
    if (reqData.colorPref === 'black') { white = me; black = reqData.from; }
    else if (reqData.colorPref === 'random') { if (Math.random() < 0.5) { white = me; black = reqData.from; } }
    matches.set(matchId, { players: [white, black], state: { fen: 'start' }, moves: [], colors: { white, black } });
    res.json({ matchId, colors: { white, black } });
});

// Poll ticket for match
router.get('/api/match/ticket/:ticketId', (req, res) => {
    const data = tickets.get(req.params.ticketId) || {};
    res.json({ matchId: data.matchId || null, opponent: data.opponent || null });
});

// Get match info
router.get('/api/match/:matchId', (req, res) => {
    const m = matches.get(req.params.matchId);
    if (!m) return res.status(404).json({ error: 'Not found' });
    const username = req.user?.username || req.session?.username || 'guest';
    const role = m.players[0] === username ? 'white' : 'black';
    res.json({ players: m.players, state: m.state, role });
});

// Submit a move
router.post('/api/match/:matchId/move', express.json(), (req, res) => {
    const m = matches.get(req.params.matchId);
    if (!m) return res.status(404).json({ error: 'Not found' });
    const { from, to, fen } = req.body || {};
    m.moves.push({ from, to, at: Date.now() });
    if (fen) m.state.fen = fen;
    res.json({ ok: true });
});

// Current state
router.get('/api/match/:matchId/state', (req, res) => {
    const m = matches.get(req.params.matchId);
    if (!m) return res.status(404).json({ error: 'Not found' });
    res.json(m.state);
});
const Player = require('../models/player');

// Get all players
router.get('/', async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one player
router.get('/:id', getPlayer, (req, res) => {
    res.json(res.player);
});

// Create one player
router.post('/', async (req, res) => {
    const player = new Player({
        name: req.body.name,
        rating: req.body.rating
    });

    try {
        const newPlayer = await player.save();
        res.status(201).json(newPlayer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update one player
router.patch('/:id', getPlayer, async (req, res) => {
    if (req.body.name != null) {
        res.player.name = req.body.name;
    }
    if (req.body.rating != null) {
        res.player.rating = req.body.rating;
    }

    try {
        const updatedPlayer = await res.player.save();
        res.json(updatedPlayer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete one player
router.delete('/:id', getPlayer, async (req, res) => {
    try {
        await res.player.remove();
        res.json({ message: 'Deleted Player' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/player_tournament', async (req, res) => {
    try {
        const tournaments = await Tournament.findAll(); // Fetch all tournaments
        const enrolledTournaments = await getEnrolledTournaments(req.user.id); // Fetch enrolled tournaments
        res.render('player/player_tournament', {
            tournaments,
            enrolledTournaments,
            walletBalance: req.user.walletBalance,
            currentSubscription: req.user.subscription,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading tournaments');
    }
});

async function getPlayer(req, res, next) {
    let player;
    try {
        player = await Player.findById(req.params.id);
        if (player == null) {
            return res.status(404).json({ message: 'Cannot find player' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.player = player;
    next();
}

module.exports = router;
