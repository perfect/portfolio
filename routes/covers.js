const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('./auth.js');

const router = express.Router();
const prisma = new PrismaClient();

// Get covers
router.get('/', async (req, res) => {
  try {
    const covers = await prisma.cover.findMany({
      orderBy: { position: 'asc' }
    });
    res.json(covers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch covers' });
  }
});

// Update/create cover
router.post('/', verifyToken, async (req, res) => {
  try {
    const { imageUrl, position } = req.body;

    if (!imageUrl || !position) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cover = await prisma.cover.upsert({
      where: { position },
      update: { imageUrl },
      create: { imageUrl, position },
    });

    res.json(cover);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cover' });
  }
});

module.exports = router;

