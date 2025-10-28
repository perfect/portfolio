const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { router: authRoutes, verifyToken } = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const paintingRoutes = require('./routes/paintings');
const coverRoutes = require('./routes/covers');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ extended: true, limit: '300mb' }));

// Serve static files
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/paintings', paintingRoutes);
app.use('/api/covers', coverRoutes);
app.use('/api/profile', profileRoutes);

// API endpoint for frontend to fetch data
app.get('/api/data', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const covers = await prisma.cover.findMany({
      orderBy: { position: 'asc' }
    });
    const paintings = await prisma.painting.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    const profile = await prisma.profile.findFirst();

    const coversObj = {};
    covers.forEach(cover => {
      coversObj[cover.position] = cover.imageUrl;
    });

    res.json({
      covers: coversObj,
      paintings,
      profile
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

