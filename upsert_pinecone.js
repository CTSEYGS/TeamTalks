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
    // Ensure answer is a string
    let answerText = '';
    if (typeof q.answer === 'string') {
      answerText = q.answer;
    } else if (q.answer && typeof q.answer === 'object') {
      answerText = JSON.stringify(q.answer);
    }
    const text = q.title + (answerText ? (' ' + answerText) : '');
    console.log('Embedding:', { id: q.id, text });
    const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
    vectors.push({
      id: String(q.id),
      values: Array.from(output.data),
      metadata: { title: q.title, answer: answerText, ...q }
    });
  }

  // Upsert to Pinecone in batches (max 100 per batch)
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    console.log(JSON.stringify(batch[0], null, 2)); // Show the first record in the batch
    console.log('Batch size:', batch.length);
    console.log('Batch:', batch);
    await pineconeIndex.upsert({ records: batch });
    console.log(`Upserted batch ${i / batchSize + 1}`);
  }
  console.log('All vectors upserted to Pinecone!');
}

main().catch(err => {
  console.error('Error upserting vectors:', err);
});
