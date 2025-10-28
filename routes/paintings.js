const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('./auth.js');

const router = express.Router();
const prisma = new PrismaClient();

// Get all paintings
router.get('/', async (req, res) => {
  try {
    const paintings = await prisma.painting.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(paintings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch paintings' });
  }
});

// Get single painting
router.get('/:id', async (req, res) => {
  try {
    const painting = await prisma.painting.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!painting) {
      return res.status(404).json({ error: 'Painting not found' });
    }
    
    res.json(painting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch painting' });
  }
});

// Create painting
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, desc, category, year, medium, size, images, thumbnails } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const painting = await prisma.painting.create({
      data: {
        title,
        desc: desc || '',
        category: category || 'art',
        year: year || '',
        medium: medium || '',
        size: size || '',
        images: images || [],
        thumbnails: thumbnails || [],
      },
    });

    res.json(painting);
  } catch (error) {
    console.error('Create painting error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Failed to create painting', 
      details: error.message,
      code: error.code 
    });
  }
});

// Update paintings order (must be before /:id route)
router.put('/update-order', verifyToken, async (req, res) => {
  try {
    const { orders } = req.body; // [{id: 1, order: 0}, {id: 2, order: 1}, ...]
    
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Update all paintings in a transaction
    await prisma.$transaction(
      orders.map(item => 
        prisma.painting.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Update painting
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, desc, category, year, medium, size, images, thumbnails } = req.body;

    const painting = await prisma.painting.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        desc,
        category,
        year,
        medium,
        size,
        images,
        thumbnails,
      },
    });

    res.json(painting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update painting' });
  }
});

// Delete painting
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await prisma.painting.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete painting' });
  }
});

module.exports = router;

