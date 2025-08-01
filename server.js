const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON requests
app.use(express.json());

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

// POST API to add a new question to question_2.json
app.post('/api/questions', (req, res) => {
  console.log('API request received to add new question');
  const { title, answer } = req.body;
  
  if (!title || !answer) {
    return res.status(400).json({ error: 'Title and answer are required' });
  }

  const filePath = path.join(__dirname, 'src', 'data', 'question_2.json');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    let questions = [];
    
    if (!err && data) {
      try {
        questions = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing existing questions:', parseErr);
      }
    }
    
    // Find the highest ID and increment it
    const maxId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) : 10;
    const newQuestion = {
      id: maxId + 1,
      title: title,
      answer: answer
    };
    
    questions.push(newQuestion);
    
    fs.writeFile(filePath, JSON.stringify(questions, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing to file:', writeErr);
        return res.status(500).json({ error: 'Failed to save question' });
      }
      
      res.status(201).json(newQuestion);
    });
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
