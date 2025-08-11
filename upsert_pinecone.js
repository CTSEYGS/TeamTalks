// upsert_pinecone.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pipeline } = require('@xenova/transformers');
const { Pinecone } = require('@pinecone-database/pinecone');

async function main() {
  // Load questions
  const dataDir = path.join(__dirname, 'src', 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  let allQuestions = [];
  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        allQuestions = allQuestions.concat(data);
      } else if (Array.isArray(data.questions)) {
        allQuestions = allQuestions.concat(data.questions);
      }
    } catch (e) {
      // skip invalid JSON
    }
  });

  // Init embedding pipeline
  const embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  // Init Pinecone
  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.index('teamtalks-questions');

  // Prepare vectors
  const vectors = [];
  for (const q of allQuestions) {
    // Ensure id is present and is a string or number
    if (!q.id || !q.title || typeof q.title !== 'string' || q.title.trim() === '') {
      console.warn('Skipping question with missing or invalid id/title:', q);
      continue;
    }
    // Sort answers by upvotes if answer is array of objects with upvotes
    let sortedAnswers = q.answer;
    if (Array.isArray(q.answer) && q.answer.every(item => typeof item === 'object' && 'upvotes' in item)) {
      sortedAnswers = [...q.answer].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }
    // Ensure answer is a string, number, boolean, or list of strings for Pinecone metadata
    let answerText = '';
    let answerMeta;
    if (typeof sortedAnswers === 'string' || typeof sortedAnswers === 'number' || typeof sortedAnswers === 'boolean') {
      answerText = String(sortedAnswers);
      answerMeta = sortedAnswers;
    } else if (Array.isArray(sortedAnswers)) {
      // If array of objects, extract 'text' fields
      if (sortedAnswers.every(item => typeof item === 'object' && item.text)) {
        answerMeta = sortedAnswers.map(item => item.text); // array of strings for metadata
        answerText = sortedAnswers.map(item => item.text).join(' '); // single string for embedding
      } else if (sortedAnswers.every(item => typeof item === 'string')) {
        answerMeta = sortedAnswers;
        answerText = sortedAnswers.join(' ');
      } else {
        answerMeta = JSON.stringify(sortedAnswers);
        answerText = answerMeta;
      }
    } else if (sortedAnswers && typeof sortedAnswers === 'object') {
      // If object, flatten to string summary for metadata
      answerMeta = '[object]';
      answerText = JSON.stringify(sortedAnswers);
    } else {
      answerMeta = '';
    }
    const text = q.title + (answerText ? (' ' + answerText) : '');
    //console.log('Embedding:', { id: q.id, text });
    const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
    // Only include allowed metadata types
    const safeMeta = { ...q, title: q.title, answer: answerMeta };
    // Remove any object/array values from metadata
    Object.keys(safeMeta).forEach(key => {
      const v = safeMeta[key];
      if (
        !(typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || (Array.isArray(v) && v.every(i => typeof i === 'string')))
      ) {
        delete safeMeta[key];
      }
    });
    vectors.push({
      id: String(q.id),
      values: Array.from(output.data),
      metadata: safeMeta
    });
  }

  // Upsert to Pinecone in batches (max 100 per batch)
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    // console.log(JSON.stringify(batch[0], null, 2)); // Show the first record in the batch
    // console.log('Batch size:', batch.length);
    // console.log('Batch:', batch);
    // console.log(Array.isArray(batch), batch.length, typeof batch[0]);
    await pineconeIndex.upsert(batch);
    console.log(`Upserted batch ${i / batchSize + 1}`);
  }
  console.log('All vectors upserted to Pinecone!');
}

main().catch(err => {
  console.error('Error upserting vectors:', err);
});
