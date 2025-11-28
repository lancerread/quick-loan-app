import express from 'express';
import devProxy from './dev-proxy';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount the dev proxy for local Netlify Functions
app.use(devProxy);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
