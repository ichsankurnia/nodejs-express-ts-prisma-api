import { Router } from "express";
import { createPostWithBase64, createPostWithFile, deletePost, getAllPost, getPostById, getPostByUserId, updatePostWithBase64, updatePostWithFile } from "../controllers/post.controller";
import multer from 'multer'
import fs from 'fs'
import path from "path";

const postRouter = Router()

// DISK STORAGE FOR GENERAL UPLOAD FILE
const diskStorageFile = multer.diskStorage({
    destination: function (req, file, cb) {
        // Turun 3 directory
        const targetPath = path.join(__dirname, '../../' + process.env.POST_PATH);

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
            req.body.title.split(' ').join('-').toLowerCase() + path.extname(file.originalname)
        );
    },
});

postRouter.get('/', getAllPost)
postRouter.get('/:id', getPostById)
postRouter.get('/by-user/:id', getPostByUserId)
postRouter.post('/', createPostWithBase64)
postRouter.patch('/:id', updatePostWithBase64)
postRouter.post('/file', multer({ storage: diskStorageFile }).single('thumbnail'), createPostWithFile)
postRouter.patch('/file/:id', multer({ storage: diskStorageFile }).single('thumbnail'), updatePostWithFile)
postRouter.delete('/:id', deletePost)


export default postRouter