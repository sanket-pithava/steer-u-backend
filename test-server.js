const express = require('express');
const app = express();
const PORT = 5001; // Hum ek naya port use kar rahe hain

app.get('/', (req, res) => {
  console.log('Request received on /'); // Terminal par message dikhayega
  res.send('Hello from Test Server!');
});

app.listen(PORT, () => {
  console.log(`Test server is running on http://localhost:${PORT}`);
});