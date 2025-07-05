import multer from 'multer';
import { Request } from 'express';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "public/uploads");
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 30000 * 1024 * 1024,
    fileSize: 30000 * 1024 * 1024,
    fieldNameSize: 30000 * 1024 * 1024,
  },
});

export default upload;