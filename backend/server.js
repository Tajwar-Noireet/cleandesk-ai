const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { isSupabaseConfigured } = require('./lib/supabaseClient');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse JSON payloads
app.use(express.json());

// Serve static assets (for public embeddable widget script)
app.use(express.static('public'));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Import routers
const businessRoutes = require('./routes/businessRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const faqRoutes = require('./routes/faqRoutes');
const chatRoutes = require('./routes/chatRoutes');
const leadRoutes = require('./routes/leadRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const customerRoutes = require('./routes/customerRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Root Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CleanDesk AI Backend is running smoothly',
    mode: isSupabaseConfigured() ? 'Supabase Database Active' : 'In-Memory Mock Store Active'
  });
});

// Register API routers
app.use('/api/business', businessRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/public', publicRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access health status at http://localhost:${PORT}/health`);
});
