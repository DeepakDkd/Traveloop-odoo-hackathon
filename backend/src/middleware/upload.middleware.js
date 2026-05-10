import multer from "multer";
import path from "path";

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === "coverImage" ? "uploads/trips" : "uploads/profiles";
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!imageMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only jpg, png, and webp images are allowed."));
    }

    cb(null, true);
  },
});
