// auth.js — json-server middleware for mock JWT auth
const crypto = require('crypto');

function generateToken(userId) {
  // Simple deterministic fake JWT for demo purposes
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: userId, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHash('sha256').update(`${header}.${payload}.mock-secret`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

module.exports = (req, res, next) => {
  // POST /auth/login
  if (req.method === 'POST' && req.path === '/auth/login') {
    const { email, password } = req.body;
    const db = req.app.db;
    const users = db.get('users').value();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.status(200).json({
      token: generateToken(user.id),
      studentId: user.studentId,
      name: user.name,
      email: user.email
    });
  }

  // POST /auth/register
  if (req.method === 'POST' && req.path === '/auth/register') {
    const { name, email, password } = req.body;
    const db = req.app.db;
    const users = db.get('users').value();
    const existing = users.find(u => u.email === email);

    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const newUserId = `user-${Date.now()}`;
    const newStudentId = `student-${Date.now()}`;

    // Create user
    db.get('users').push({
      id: newUserId,
      name,
      email,
      password,
      studentId: newStudentId
    }).write();

    // Create blank student record
    db.get('students').push({
      id: newStudentId,
      name,
      email,
      skills: [],
      gpa: 0,
      workAuthStatus: 'us_citizen',
      resumeLink: ''
    }).write();

    return res.status(201).json({
      token: generateToken(newUserId),
      studentId: newStudentId,
      name,
      email
    });
  }

  next();
};
