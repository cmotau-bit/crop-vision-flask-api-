const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(bodyParser.json());

// In-memory user store (replace with DB later)
const users = [];
const resetTokens = {};

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Email already registered.' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, name, email, password: hashed };
  users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Request password reset
app.post('/api/auth/request-reset', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'No account found with that email.' });
  }
  // Generate a simple reset token (for demo only)
  const token = Math.random().toString(36).substring(2, 10);
  resetTokens[email] = token;
  // Simulate sending email
  console.log(`Password reset link for ${email}: http://localhost:4000/reset?email=${encodeURIComponent(email)}&token=${token}`);
  res.json({ message: 'Password reset link sent (check server console for demo).' });
});

// Reset password
app.post('/api/auth/reset', (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!resetTokens[email] || resetTokens[email] !== token) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'No account found with that email.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }
  user.password = bcrypt.hashSync(newPassword, 10);
  delete resetTokens[email];
  res.json({ message: 'Password reset successful.' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
}); 