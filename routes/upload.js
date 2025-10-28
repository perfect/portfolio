const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { verifyToken } = require('./auth.js');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 300 * 1024 * 1024, // 300MB limit
    fieldSize: 300 * 1024 * 1024, // 300MB limit for fields
    fieldNameSize: 100, // Field name size limit
    fields: 10 // Number of non-file fields
  }
});

// Generate thumbnail
async function generateThumbnail(inputPath, outputPath, width = 300, height = 300) {
  try {
    // Get file size first to decide processing approach
    const stats = await require('fs').promises.stat(inputPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);
    
    // Get image metadata (with pixel limit disabled for large files)
    const metadata = await sharp(inputPath, { limitInputPixels: false }).metadata();
    console.log(`Image dimensions: ${metadata.width}x${metadata.height}`);
    
    // For very large files, use simpler approach
    if (fileSizeMB > 100) {
      console.log('Large file detected, using sequential processing');
      // First resize to intermediate size
      await sharp(inputPath, {
        limitInputPixels: false  // Allow processing very large images
      })
        .resize(2000, 2000, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(outputPath + '.tmp');
      
      // Then create thumbnail
      await sharp(outputPath + '.tmp')
        .resize(width, height, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      
      // Clean up temp file
      await require('fs').promises.unlink(outputPath + '.tmp');
    } else {
      // Normal processing for smaller files
      await sharp(inputPath)
        .resize(width, height, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
    }
    
    console.log(`Thumbnail generated: ${outputPath}`);
    return true;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return false;
  }
}

// Upload endpoint - uploads single file
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }

    // Get folder from the file path (destination was set by multer)
    const filePath = req.file.path;
    const relativePath = path.relative(uploadsDir, filePath);
    const folder = path.dirname(relativePath);
    const filename = req.file.filename;
    const url = `/uploads/${folder}/${filename}`;

    // Generate thumbnail for paintings and general folders
    let thumbnailUrl = null;
    if (folder === 'paintings' || folder === 'general') {
      const thumbnailDir = path.join(uploadsDir, 'thumbnails');
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }
      
      const thumbnailPath = path.join(thumbnailDir, filename);
      const thumbnailGenerated = await generateThumbnail(filePath, thumbnailPath);
      
      if (thumbnailGenerated) {
        thumbnailUrl = `/uploads/thumbnails/${filename}`;
      }
    }

    res.json({ 
      url, 
      thumbnailUrl 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

module.exports = router;

