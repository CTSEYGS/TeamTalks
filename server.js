require('dotenv').config();
// Run upsert_pinecone.js before starting the server
const { spawn } = require('child_process');
const upsert = spawn('node', ['upsert_pinecone.js'], { stdio: 'inherit' });

upsert.on('close', (code) => {
  if (code !== 0) {
    console.error(`upsert_pinecone.js exited with code ${code}`);
    process.exit(code);
  } else {
    // Start the server after upsert completes successfully
    startServer();
  }
});

function startServer() {
// --- Semantic Search Dependencies ---
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;


// --- Semantic Search API Endpoint ---
app.get('/api/semantic-search', async (req, res) => {
  const query = req.query.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }
  try {
    const results = await semanticSearch(query, 5);
    res.json(results);
  } catch (err) {
    console.error('Semantic search error:', err);
    res.status(500).json({ error: 'Semantic search failed' });
  }
});

// --- Knowledge Data API Endpoints ---
const { pipeline } = require('@xenova/transformers');
const { Pinecone } = require('@pinecone-database/pinecone');

async function initEmbeddingAndPinecone() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  if (!pineconeIndex) {
    pineconeIndex = pinecone.index('teamtalks-questions');
  }
}

async function embedText(text) {
  await initEmbeddingAndPinecone();
  // embeddingPipeline returns [1, N] shape, flatten to 1D array
  const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

async function semanticSearch(query, topK = 5) {
  await initEmbeddingAndPinecone();
  const queryEmbedding = await embedText(query);
  const result = await pineconeIndex.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });
  return result.matches.map(match => ({
    id: match.id,
    score: match.score,
    ...match.metadata,
  }));
}

// --- Semantic Search API Endpoint ---
app.get('/api/semantic-search', async (req, res) => {
  const query = req.query.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }
  try {
    const results = await semanticSearch(query, 5);
    res.json(results);
  } catch (err) {
    console.error('Semantic search error:', err);
    res.status(500).json({ error: 'Semantic search failed' });
  }
});

// --- pipeline Data API Endpoints ---
// Initialize Pinecone
const pinecone = new Pinecone();
let pineconeIndex = null;
let embeddingPipeline = null;
async function initEmbeddingAndPinecone() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  if (!pineconeIndex) {
    pineconeIndex = pinecone.index('teamtalks-questions');
  }
}

async function embedText(text) {
  await initEmbeddingAndPinecone();
  // embeddingPipeline returns [1, N] shape, flatten to 1D array
  const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

async function semanticSearch(query, topK = 5) {
  await initEmbeddingAndPinecone();
  const queryEmbedding = await embedText(query);
  const result = await pineconeIndex.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });
  return result.matches.map(match => ({
    id: match.id,
    score: match.score,
    ...match.metadata,
  }));
}

// --- Semantic Search API Endpoint ---
app.get('/api/semantic-search', async (req, res) => {
  const query = req.query.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Query is required' });
  }
  try {
    const results = await semanticSearch(query, 5);
    res.json(results);
  } catch (err) {
    console.error('Semantic search error:', err);
    res.status(500).json({ error: 'Semantic search failed' });
  }
});

// --- Knowledge Data API Endpoints ---
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

// POST API to add a new question to a new unique JSON file
app.post('/api/questions', (req, res) => {
  console.log('API request received to add new question');
  const { title, answer, author } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const dataDir = path.join(__dirname, 'src', 'data');
  
  // Find the next available question file number
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error('Error reading data directory:', err);
      return res.status(500).json({ error: 'Failed to access data directory' });
    }

    // Find all existing question_X.json files and get the highest number
    const questionFiles = files
      .filter(f => f.match(/^question_\d+\.json$/))
      .map(f => parseInt(f.match(/question_(\d+)\.json/)[1]))
      .sort((a, b) => b - a); // Sort descending to get highest first

    const nextFileNumber = questionFiles.length > 0 ? questionFiles[0] + 1 : 1;
    const newFileName = `question_${nextFileNumber}.json`;
    const newFilePath = path.join(dataDir, newFileName);

    // Get the highest existing ID from all question files to ensure unique IDs
    let maxId = 0;
    const allFiles = files.filter(f => f.endsWith('.json'));
    let processedFiles = 0;

    if (allFiles.length === 0) {
      maxId = 0;
      createNewQuestionFile();
    } else {
      allFiles.forEach(file => {
        const filePath = path.join(dataDir, file);
        fs.readFile(filePath, 'utf8', (readErr, data) => {
          processedFiles++;
          
          if (!readErr && data) {
            try {
              const fileData = JSON.parse(data);
              const questions = Array.isArray(fileData) ? fileData : (fileData.questions || []);
              questions.forEach(q => {
                if (q.id && q.id > maxId) {
                  maxId = q.id;
                }
              });
            } catch (parseErr) {
              console.error(`Error parsing ${file}:`, parseErr);
            }
          }

          // When all files are processed, create the new question
          if (processedFiles === allFiles.length) {
            createNewQuestionFile();
          }
        });
      });
    }

    function createNewQuestionFile() {
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const newQuestion = {
        id: maxId + 1,
        title: title.trim(),
        createdDate: currentDate,
        answer: answer && answer.trim() ? 
          [{
            text: answer.trim(),
            user: author && author.trim() ? author.trim() : 'Anonymous',
            date: currentDate,
            upvotes: 0
          }] : 
          "No answer provided yet. Feel free to contribute an answer!"
      };

      const newFileContent = [newQuestion];

      fs.writeFile(newFilePath, JSON.stringify(newFileContent, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error creating new question file:', writeErr);
          return res.status(500).json({ error: 'Failed to save question' });
        }
        
        console.log(`New question saved to ${newFileName} with ID ${newQuestion.id}`);
        res.status(201).json({
          ...newQuestion,
          file: newFileName
        });
      });
    }
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
}


