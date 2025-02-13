import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null,file.originalname)
});

const upload = multer({ storage });

// Upload Route
router.post('/uploads', upload.single('file'), async (req, res) => {
    try {
        console.log(req.file.originalname)
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const imagePath = `/uploads/${req.file}`;
        res.status(200).json({ message: 'File uploaded successfully', path: imagePath });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete Route
router.delete('/deleteUploads/:file_name', async (req, res) => {
    try { 
        const { file_name } = req.params;
        
        if (!file_name) {
            return res.status(400).json({ error: 'File name is required' });
        }
        
        const imagePath = path.join(process.cwd(), 'uploads',file_name);
        console.log(imagePath)

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Delete the file
            return res.status(200).json({ message: 'File deleted successfully' });
        } else {
            return res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
