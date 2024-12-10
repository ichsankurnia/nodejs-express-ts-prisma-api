import { Router } from "express";
import { updateProfileByFile, deleteProfile, getAllProfile, getProfileByUserId, updateProfileBase64 } from "../controllers/profile.controller";
import multer from 'multer'
import fs from 'fs'
import path from "path";

const profileRouter = Router()

// DISK STORAGE FOR GENERAL UPLOAD FILE
const diskStorageFile = multer.diskStorage({
    destination: function (req, file, cb) {
        // Turun 3 directory
        const targetPath = path.join(__dirname, '../../' + process.env.PROFILE_PATH);

        // Check if the directory exists; if not, create it
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        cb(null, targetPath);
    },
    // konfigurasi penamaan file yang unik
    filename: function (req, file, cb) {
        cb(
            null,
            // file.fieldname + "-" + Date.now() + path.extname(file.originalname)
            req.params.id + '-' + file.originalname
        );
    },
});


profileRouter.get('/', getAllProfile)
profileRouter.get('/:id', getProfileByUserId)
profileRouter.patch('/:id', updateProfileBase64)
profileRouter.patch('/file/:id', multer({ storage: diskStorageFile }).single('avatar'), updateProfileByFile)
profileRouter.delete('/:id', deleteProfile)


export default profileRouter