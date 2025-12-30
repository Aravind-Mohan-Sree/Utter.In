import multer from 'multer';
import os from 'os';

export interface UploadedFiles {
  introVideo?: Express.Multer.File[];
  certificate?: Express.Multer.File[];
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^\w.-]/g, '_');
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
});

export const uploadMiddleware = upload.fields([
  { name: 'introVideo', maxCount: 1 },
  { name: 'certificate', maxCount: 1 },
]);
