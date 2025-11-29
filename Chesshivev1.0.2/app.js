const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const http = require('http');
const { Server } = require('socket.io');
// nodemailer is optional. If not installed or SMTP not configured, magic link will be logged to console.
let nodemailer;
try { nodemailer = require('nodemailer'); } catch (e) { nodemailer = null; }
require('dotenv').config();
const { connectDB } = require('./routes/databasecongi');

const adminRouter = require('./admin_app');
const organizerRouter = require('./organizer_app');
const coordinatorRouter = require('./coordinator_app');
const playerRouter = require('./player_app');

const utils = require('./utils');
const { ObjectId } = require('mongodb');

const app = express();
const cors = require('cors');
// Allow CORS from frontend
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
// Increase maxHeaderSize to accept larger request headers (fixes 431 errors)
// Default Node limit can be too small when many/large cookies or headers are present.
// Raise to 1MB to tolerate larger Cookie headers from development environments.
const server = http.createServer({ maxHeaderSize: 1048576 }, app);
const io = new Server(server, { cors: { origin: 'http://localhost:3001', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 3000;

app.use(session({
  name: process.env.SESSION_COOKIE_NAME || 'sid',
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: { secure: false, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// mount optional auth router
try { const authrouter = require('./routes/auth'); app.use(authrouter); } catch (e) { /* optional */ }

// Role middleware
const isAdmin = (req, res, next) => { if (req.session.userRole === 'admin') next(); else res.status(403).send('Unauthorized'); };
const isOrganizer = (req, res, next) => { if (req.session.userRole === 'organizer') next(); else res.status(403).send('Unauthorized'); };
const isCoordinator = (req, res, next) => { if (req.session.userRole === 'coordinator') next(); else res.status(403).send('Unauthorized'); };
const isPlayer = (req, res, next) => { if (req.session.userRole === 'player') next(); else res.status(403).send('Unauthorized'); };
const isAdminOrOrganizer = (req, res, next) => { if (req.session.userRole === 'admin' || req.session.userRole === 'organizer') next(); else res.status(403).json({ success: false, message: 'Unauthorized' }); };

// Mount routers
app.use('/admin', isAdmin, adminRouter);
app.use('/organizer', isOrganizer, organizerRouter);
app.use('/coordinator', isCoordinator, coordinatorRouter);
app.use('/player', isPlayer, playerRouter.router);

// Serve index
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Login with OTP
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email, password });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    if (user.isDeleted) return res.status(403).json({ success: false, message: 'Account has been deleted', deletedUserId: user._id.toString(), deletedUserRole: user.role, deleted_by: user.deleted_by || null, sessionEmail: email });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    await db.collection('otps').insertOne({
      email,
      otp,
      type: 'login',
      expires_at: expiresAt,
      used: false
    });

    // Send OTP via email
    async function sendOtpEmail(to, otp) {
      if (!nodemailer) {
        console.log(`nodemailer not installed. OTP for ${to}: ${otp}`);
        return { previewUrl: null, messageId: null, info: null };
      }

      // If no SMTP configured, use Ethereal test account for local testing
      if (!process.env.SMTP_HOST) {
        try {
          const testAccount = await nodemailer.createTestAccount();
          const transporter = nodemailer.createTransport({ host: testAccount.smtp.host, port: testAccount.smtp.port, secure: testAccount.smtp.secure, auth: { user: testAccount.user, pass: testAccount.pass } });
          const info = await transporter.sendMail({ from: process.env.SMTP_FROM || '', to, subject: 'Your ChessHive OTP', text: `Your OTP is: ${otp}. It expires in 5 minutes.` });
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log(`Ethereal OTP preview for ${to}: ${previewUrl}`);
          return { previewUrl, messageId: info && info.messageId, info };
        } catch (err) {
          console.error('Failed to send via Ethereal, falling back to console:', err);
          console.log(`OTP for ${to}: ${otp}`);
          return { previewUrl: null, messageId: null, info: null };
        }
      }

      // SMTP configured path
      try {
        const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587', 10), secure: (process.env.SMTP_SECURE === 'true'), auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
        // attempt to verify transporter (helps surfacing auth/connectivity issues early)
        try {
          await transporter.verify();
          console.log('SMTP transporter verified');
        } catch (verErr) {
          console.warn('SMTP transporter verification failed:', verErr);
        }
        const info = await transporter.sendMail({ from: process.env.SMTP_FROM || '', to, subject: 'Your ChessHive OTP', text: `Your OTP is: ${otp}. It expires in 5 minutes.` });
        console.log('OTP email sent:', info && info.messageId, 'envelope:', info && info.envelope);
        return { previewUrl: null, messageId: info && info.messageId, info };
      } catch (err) {
        console.error('Failed to send OTP email, falling back to console:', err);
        console.log(`OTP for ${to}: ${otp}`);
        return { previewUrl: null, messageId: null, info: null };
      }
    }

    // Send OTP
    let preview = null;
    let messageId = null;
    try {
      const result = await sendOtpEmail(user.email, otp);
      if (result) {
        if (result.previewUrl) preview = result.previewUrl;
        if (result.messageId) messageId = result.messageId;
      }
    } catch (e) {
      console.error('sendOtpEmail error:', e);
    }

    // Tell frontend that OTP was sent
    const responsePayload = { success: true, message: 'OTP sent to registered email' };
    if (preview) responsePayload.previewUrl = preview;
    if (messageId) responsePayload.messageId = messageId;
    return res.json(responsePayload);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
});

// Verify login OTP
app.post('/api/verify-login-otp', async (req, res) => {
  const { email, otp } = req.body || {};
  try {
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const db = await connectDB();
    const otpRecord = await db.collection('otps').findOne({ email, otp, type: 'login', used: false });
    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (new Date() > otpRecord.expires_at) return res.status(400).json({ success: false, message: 'OTP expired' });

    // Mark OTP as used
    await db.collection('otps').updateOne({ _id: otpRecord._id }, { $set: { used: true } });

    // Fetch user and establish session
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    req.session.userID = user._id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.username = user.name;
    req.session.playerName = user.name;
    req.session.userCollege = user.college;
    req.session.collegeName = user.college;

    let redirectUrl = '';
    switch (user.role) {
      case 'admin': redirectUrl = '/admin/admin_dashboard'; break;
      case 'organizer': redirectUrl = '/organizer/organizer_dashboard'; break;
      case 'coordinator': redirectUrl = '/coordinator/coordinator_dashboard'; break;
      case 'player': redirectUrl = '/player/player_dashboard?success-message=Player Login Successful'; break;
      default: return res.status(400).json({ success: false, message: 'Invalid Role' });
    }
    res.json({ success: true, redirectUrl });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});



// Session info
app.get('/api/session', (req, res) => {
  res.json({ userEmail: req.session.userEmail || null, userRole: req.session.userRole || null, username: req.session.username || null });
});

// Theme preference (persist per user)
app.get('/api/theme', async (req, res) => {
  try {
    if (!req.session.userEmail) return res.json({ success: true, theme: null });
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: req.session.userEmail }, { projection: { theme: 1 } });
    const theme = (user && user.theme === 'dark') ? 'dark' : 'light';
    return res.json({ success: true, theme });
  } catch (e) {
    console.error('GET /api/theme error:', e);
    return res.status(500).json({ success: false, message: 'Failed to load theme' });
  }
});

app.post('/api/theme', async (req, res) => {
  try {
    const { theme } = req.body || {};
    if (!req.session.userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });
    if (!['dark', 'light'].includes(theme)) return res.status(400).json({ success: false, message: 'Invalid theme value' });
    const db = await connectDB();
    await db.collection('users').updateOne({ email: req.session.userEmail }, { $set: { theme } });
    return res.json({ success: true });
  } catch (e) {
    console.error('POST /api/theme error:', e);
    return res.status(500).json({ success: false, message: 'Failed to save theme' });
  }
});



// Chat history
app.get('/api/chat/history', async (req, res) => {
  try {
    const room = (req.query.room || 'global').toString();
    const db = await connectDB();
    const history = await db.collection('chat_messages').find({ room }).sort({ timestamp: -1 }).limit(50).toArray();
    res.json({ success: true, history });
  } catch (err) {
    console.error('Chat history error:', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});

// Search users by role (registered users) - returns basic public info (no password/mfaSecret)
app.get('/api/users', async (req, res) => {
  console.log('API /api/users called with query:', req.query);
  try {
    const role = (req.query.role || '').toString().toLowerCase();
    const q = {};
    if (role) q.role = role;
    const db = await connectDB();
    const users = await db.collection('users').find(q, { projection: { password: 0, mfaSecret: 0 } }).limit(200).toArray();
    // normalize name field to username for frontend compatibility
    const list = users.map(u => ({ id: u._id, username: u.name || u.username || u.email, email: u.email || null, role: u.role }));
    res.json({ success: true, users: list });
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});

// Contacts summary for a given username: returns last message per contact (global + PMs)
app.get('/api/chat/contacts', async (req, res) => {
  try {
    const username = (req.query.username || '').toString();
    if (!username) return res.status(400).json({ success: false, message: 'username required' });
    const db = await connectDB();
    // fetch recent messages involving this user (global + pm rooms containing username)
    const recent = await db.collection('chat_messages').find({
      $or: [
        { room: 'global' },
        { room: { $regex: `^pm:` } }
      ],
      $or: [ { sender: username }, { receiver: username }, { room: { $regex: username } } ]
    }).sort({ timestamp: -1 }).limit(500).toArray();

    const contactsMap = new Map();
    for (const m of recent) {
      if (m.room === 'global') {
        if (!contactsMap.has('All')) contactsMap.set('All', { contact: 'All', lastMessage: m.message, timestamp: m.timestamp, room: 'global' });
        continue;
      }
      // room is pm:UserA:UserB
      const parts = (m.room || '').replace(/^pm:/, '').split(':');
      const other = parts.find(p => p !== username) || parts[0] || 'Unknown';
      if (!contactsMap.has(other)) contactsMap.set(other, { contact: other, lastMessage: m.message, timestamp: m.timestamp, room: m.room });
    }

    const contacts = Array.from(contactsMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, contacts });
  } catch (err) {
    console.error('chat contacts error:', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});

// ------------- Socket.IO chat & chess -------------
const onlineUsers = new Map(); // socket.id -> { username, role }
const usernameToSockets = new Map(); // username -> Set(socket.id)

function broadcastUsers() {
  const unique = Array.from(new Map(Array.from(onlineUsers.values()).map(u => [u.username, u])).values());
  io.emit('updateUsers', unique);
}

function privateRoomName(u1, u2) {
  return `pm:${[u1, u2].sort().join(':')}`;
}

io.on('connection', (socket) => {
  socket.on('join', ({ username, role }) => {
    if (!username) return;
    onlineUsers.set(socket.id, { username, role });
    const set = usernameToSockets.get(username) || new Set();
    set.add(socket.id);
    usernameToSockets.set(username, set);
    broadcastUsers();
  });

  socket.on('disconnect', () => {
    const info = onlineUsers.get(socket.id);
    if (info && info.username) {
      const set = usernameToSockets.get(info.username);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) usernameToSockets.delete(info.username);
        else usernameToSockets.set(info.username, set);
      }
    }
    onlineUsers.delete(socket.id);
    broadcastUsers();
  });

  // Chat messaging
  socket.on('chatMessage', async ({ sender, receiver, message }) => {
    const socketInfo = onlineUsers.get(socket.id) || {};
    const actualSender = socketInfo.username || sender;
    if (!actualSender || !message) return;
    const payload = { sender: actualSender, message, receiver: receiver || 'All' };
    const db = await connectDB();
    try {
      if (!receiver || receiver === 'All') {
        io.emit('message', payload);
        await db.collection('chat_messages').insertOne({ room: 'global', sender: actualSender, message, timestamp: new Date() });
      } else {
        const room = privateRoomName(actualSender, receiver);
        const senderSet = usernameToSockets.get(actualSender) || new Set();
        const receiverSet = usernameToSockets.get(receiver) || new Set();
        const allIds = new Set([...senderSet, ...receiverSet]);
        for (const id of allIds) {
          const s = io.sockets.sockets.get ? io.sockets.sockets.get(id) : io.sockets.sockets[id];
          if (s && s.emit) s.emit('message', payload);
        }
        await db.collection('chat_messages').insertOne({ room, sender: actualSender, receiver, message, timestamp: new Date() });
      }
    } catch (e) {
      console.error('chatMessage error:', e);
    }
  });

  // Chess events
  socket.on('chessJoin', ({ room }) => {
    if (!room) return;
    socket.join(room);
  });

  socket.on('chessMove', async ({ room, move }) => {
    if (!room || !move) return;
    socket.to(room).emit('chessMove', move);
    try {
      const db = await connectDB();
      await db.collection('games').updateOne({ room }, { $push: { moves: { ...move, timestamp: new Date() } }, $set: { fen: move.fen, updatedAt: new Date() } }, { upsert: true });
    } catch (e) {
      // ignore persistence errors for now
      console.error('chessMove persist error:', e);
    }
  });
});

// 404 handler
app.use((req, res) => res.status(404).redirect('/?error-message=Page not found'));

connectDB().catch(err => console.error('Database connection failed:', err));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));