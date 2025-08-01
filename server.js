const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// GET API to return all JSON files from src/data
app.get('/api/knowledgedata', (req, res) => {
    console.log('API request received for knowledge data');
  const dataDir = path.join(__dirname, 'src', 'data');
  fs.readdir(dataDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read data folder' });

    const jsonFiles = files.filter(f => f.endsWith('.json'));
    let allQuestions = [];

    jsonFiles.forEach(file => {
      const filePath = path.join(dataDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        // If the file is an array, concat; if it's an object with a questions array, use that
        if (Array.isArray(data)) {
          allQuestions = allQuestions.concat(data);
        } else if (Array.isArray(data.questions)) {
          allQuestions = allQuestions.concat(data.questions);
        }
      } catch (e) {
        // Optionally log or skip invalid JSON
      }
    });

    res.json(allQuestions); // Only return the combined questions array
  });
});

// Serve static React build files
app.use(express.static(path.join(__dirname, 'build')));

// Serve React app for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
