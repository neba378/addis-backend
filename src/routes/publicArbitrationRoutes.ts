import express from 'express';
import { ArbitratorController } from '../modules/arbitration/controllers/arbitrator.controller';
import { ArbitrationRequestController } from '../modules/arbitration/controllers/arbitration-request.controller';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const arbitratorController = new ArbitratorController();
const requestController = new ArbitrationRequestController();

// Public arbitrator routes
router.get('/arbitrators', arbitratorController.getActiveArbitrators.bind(arbitratorController));

// Public arbitration request routes
router.post('/arbitration-requests', requestController.createRequest.bind(requestController));

// Image serving endpoint to avoid CORS issues
router.get('/images/:filename', (req, res): void => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../../uploads/profile-pictures', filename);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.jpg':
      case '.jpeg':
      default:
        contentType = 'image/jpeg';
        break;
    }
    
    // Set proper headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow cross-origin requests
    
    // Stream the file
    const stream = fs.createReadStream(imagePath);
    stream.pipe(res);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

export default router; 