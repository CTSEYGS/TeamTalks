const express = require('express');
const path = require('path');
//const cors = require('cors');

// Import route handlers
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const questionRoutes = require('./routes/questionRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
//app.use(cors());

// API Routes
app.use('/api', knowledgeRoutes);
app.use('/api', questionRoutes);

// Serve static React build files
app.use(express.static(path.join(__dirname, '../../build')));

// Serve React app for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});