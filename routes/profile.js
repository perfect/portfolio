const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('./auth.js');

const router = express.Router();
const prisma = new PrismaClient();

// Get profile
router.get('/', async (req, res) => {
  try {
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      // Create default profile if none exists
      profile = await prisma.profile.create({
        data: {
          description: 'I explore painting, user interface design, and industrial/product design. I enjoy sketching, prototyping in Figma and 3D tools, and testing with real people. I\'m applying to colleges for Fall 2026 and I\'m excited to learn from peers and mentors.',
          tags: ['Painting', 'Sketching', 'Figma', 'Adobe Illustrator', 'Photoshop', 'Blender / Rhino', 'Prototyping', 'User Research']
        }
      });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const { avatarUrl, description, tags } = req.body;

    let profile = await prisma.profile.findFirst();
    
    if (profile) {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          avatarUrl,
          description,
          tags: tags || [],
        },
      });
    } else {
      profile = await prisma.profile.create({
        data: {
          avatarUrl,
          description,
          tags: tags || [],
        },
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;

