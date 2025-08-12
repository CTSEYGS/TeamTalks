const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const outputDir = path.join(dataDir, 'finalqa');
let currentQuestionId = 1001;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('📁 Created output directory: data/finalqa');
}

// Function to standardize question format
const standardizeQuestion = (question, newId) => {
  let answerIdCounter = 100001; // Reset for each question
  
  const standardized = {
    id: newId,
    title: question.title || "Untitled Question",
    createdDate: question.createdDate || new Date().toLocaleDateString('en-US'),
    upvotes: question.upvotes || 0,
    author: question.author || question.user || "Anonymous",
    answers: []
  };

  // Handle different answer formats
  if (Array.isArray(question.answer)) {
    standardized.answers = question.answer.map((ans) => ({
      answerid: ans.answerid || answerIdCounter++,
      text: ans.text || ans,
      user: ans.user || "Anonymous",
      date: ans.date || standardized.createdDate,
      upvotes: ans.upvotes || 0
    }));
  } else if (typeof question.answer === 'string' && 
             question.answer !== "No answer provided yet. Feel free to contribute an answer!") {
    standardized.answers = [{
      answerid: answerIdCounter++,
      text: question.answer,
      user: standardized.author,
      date: standardized.createdDate,
      upvotes: 0
    }];
  } else if (question.answer && typeof question.answer === 'object') {
    standardized.answers = [{
      answerid: question.answer.answerid || answerIdCounter++,
      text: question.answer.text || question.answer,
      user: question.answer.user || "Anonymous",
      date: question.answer.date || standardized.createdDate,
      upvotes: question.answer.upvotes || 0
    }];
  }

  return standardized;
};

// Function to create new question file in finalqa folder
const createQuestionFile = (question, questionId) => {
  const fileName = `question_${questionId}.json`;
  const filePath = path.join(outputDir, fileName);
  
  fs.writeFile(filePath, JSON.stringify([question], null, 2), (err) => {
    if (err) {
      console.error(`❌ Error creating ${fileName}:`, err);
    } else {
      console.log(`✅ Created finalqa/${fileName}`);
      console.log(`   ID: ${question.id} | Title: "${question.title}"`);
      console.log(`   Author: ${question.author} | Answers: ${question.answers.length}`);
      question.answers.forEach((ans, index) => {
        console.log(`   - Answer ${index + 1}: ID ${ans.answerid} by ${ans.user} (${ans.upvotes} upvotes)`);
      });
      console.log('');
    }
  });
};

// Function to process a single file
const processFile = (fileName, callback) => {
  const filePath = path.join(dataDir, fileName);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`❌ Error reading ${fileName}:`, err);
      if (callback) callback();
      return;
    }

    try {
      const originalData = JSON.parse(data);
      const questions = Array.isArray(originalData) ? originalData : [originalData];
      
      console.log(`📁 Processing ${fileName}:`);
      console.log(`   Found ${questions.length} question(s)`);
      
      questions.forEach((question) => {
        const newId = currentQuestionId++;
        const standardizedQuestion = standardizeQuestion(question, newId);
        createQuestionFile(standardizedQuestion, newId);
      });
      
      if (callback) {
        setTimeout(callback, 100); // Small delay to ensure file writes complete
      }
      
    } catch (parseErr) {
      console.error(`❌ Error parsing ${fileName}:`, parseErr);
      if (callback) callback();
    }
  });
};

// Main processing function
const processAllQuestionFiles = () => {
  console.log('🚀 Starting complete question reorganization...');
  console.log('📊 Starting with Question ID: 1001');
  console.log('📊 Each question starts with Answer ID: 100001');
  console.log('📁 Output directory: data/finalqa\n');

  // Read all files in data directory
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error('❌ Error reading data directory:', err);
      return;
    }

    // Filter for question files (question_*.json)
    const questionFiles = files
      .filter(f => f.match(/^question_\d+\.json$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/question_(\d+)\.json/)[1]);
        const numB = parseInt(b.match(/question_(\d+)\.json/)[1]);
        return numA - numB;
      });

    // Also include questions.json if it exists
    if (files.includes('questions.json')) {
      questionFiles.unshift('questions.json');
    }

    console.log(`📋 Found ${questionFiles.length} question files to process:`);
    questionFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');

    if (questionFiles.length === 0) {
      console.log('❌ No question files found to process');
      return;
    }

    // Process files sequentially
    let fileIndex = 0;
    const processNext = () => {
      if (fileIndex < questionFiles.length) {
        const fileName = questionFiles[fileIndex];
        fileIndex++;
        processFile(fileName, processNext);
      } else {
        console.log('🎉 All files processed successfully!');
        console.log(`📊 Total questions created: ${currentQuestionId - 1001}`);
        console.log(`📊 Final Question ID: ${currentQuestionId - 1}`);
        console.log(`📁 All files saved to: data/finalqa/`);
      }
    };

    processNext();
  });
};

// Start processing
processAllQuestionFiles();