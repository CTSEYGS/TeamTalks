import fetch from 'node-fetch';

fetch('http://localhost:5000/api/knowledgedata')
  .then(res => res.json())
  .then(data => {
    console.log('API Response:', data);
  })
  .catch(err => {
    console.error('Error:', err);
  });