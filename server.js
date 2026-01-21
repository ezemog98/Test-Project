const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Database file path
const DB_PATH = path.join(__dirname, 'database.json');

// Helper function to read database
const readDatabase = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return null;
  }
};

// Helper function to write to database
const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint that responds with data from database
app.get('/api/data', (req, res) => {
  const db = readDatabase();
  if (!db || !db.messages || db.messages.length === 0) {
    return res.status(500).json({ error: 'Database error' });
  }
  
  // Get the first message and update timestamp
  const message = db.messages[0];
  message.timestamp = new Date().toISOString();
  res.json(message);
});

// Endpoint that responds with user data from database
app.get('/api/name', (req, res) => {
  const db = readDatabase();
  if (!db || !db.users || db.users.length === 0) {
    return res.status(500).json({ error: 'Database error' });
  }
  
  // Get the first user
  const user = db.users[0];
  res.json({
    name: user.name,
    age: user.age,
    city: user.city
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  const db = readDatabase();
  if (!db) {
    return res.status(500).json({ error: 'Database error' });
  }
  res.json(db.users || []);
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const db = readDatabase();
  if (!db || !db.users) {
    return res.status(500).json({ error: 'Database error' });
  }
  
  const user = db.users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.post('/api/users', (req, res) => {
  const db = readDatabase();
  if (!db || !db.users) {
    return res.status(500).json({ error: 'Database error' });
  }
  const newUser = req.body;
  newUser.id = db.users.length + 1;
  db.users.push(newUser);
  writeDatabase(db);
  res.status(201).json(newUser);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/data`);
});

