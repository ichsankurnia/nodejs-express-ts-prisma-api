import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import path from "path";
import fs from 'fs'

const postClient = new PrismaClient().post

export const getAllPost = async (req: Request, res: Response) => {
    try {
        const data = await postClient.findMany()

        res.status(200).json({ message: "Success get all data", data })
    } catch (error: any) {
        res.status(500).json({ message: error.message || error, data: null })
    }
}

export const getPostById = async (req: Request, res: Response) => {
    try {
        const data = await postClient.findUnique({
            where: {
                id: Number(req.params.id)
            },
            include: {
                author: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        res.status(200).json({ message: "Success get data", data })
    } catch (error: any) {
        res.status(400).json({ message: error.message || error, data: null })
    }
}

export const getPostByUserId = async (req: Request, res: Response) => {
    try {
        const data = await postClient.findMany({
            where: {
                authorId: Number(req.params.id)
            },
            include: {
                author: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        res.status(200).json({ message: "Success get data", data })
    } catch (error: any) {
        res.status(400).json({ message: error.message || error, data: null })
    }
}

export const createPostWithFile = async (req: Request, res: Response) => {
    const pathFileBody = req.file ? path.resolve(process.cwd(), process.env.POST_PATH + req.file.filename) : null;

    try {
        // Prepare new payload if a file is uploaded
        const payload = {
            ...(req.file && {
                thumbnail: req.file.filename,
            }),
            ...(req.body.content && {
                content: req.body.content,
            }),
            ...(req.body.published && {
                published: req.body.published,
            }),
            title: req.body.title,
        };

        const data = await postClient.create({
            data: {
                ...payload,
                author: {
                    connect: { id: Number(req.body.user_id) }
                }
            },
        });

        res.status(201).json({ message: 'Success create new data', data: data });
    } catch (error: any) {
        if (req.file) {
            fs.unlink(pathFileBody!, (err) => {
                console.error('Error while cleaning up file:', err);
            });
        }

        res.status(400).json({ message: error.message || error, data: null })
    }
};

export const updatePostWithFile = async (req: Request, res: Response) => {
    const pathFileBody = req.file ? path.resolve(process.cwd(), process.env.POST_PATH + req.file.filename) : null;

    const findData = await postClient.findUnique({
        where: { id: Number(req.params.id) }
    })

    try {
        if (req.file) {
            req.body.thumbnail = req.file.filename
        }

        if (req.body.user_id) {
            req.body.authorId = Number(req.body.user_id)
            delete req.body.user_id
        }

        if (findData) {
            const data = await postClient.update({
                where: {
                    id: Number(req.params.id),
                },
                data: req.body,
            });

            if (data && req.file && findData.thumbnail! && findData.thumbnail !== req.body.thumbnail) {
                const pathFileBody = path.resolve(process.cwd(), process.env.POST_PATH + findData.thumbnail!)

                fs.unlink(pathFileBody!, (err) => {
                    console.error('Removing uploaded file due to rollback:', err);
                });
            }

            res.status(200).json({ message: 'Success update data', data: data });
        } else {
            res.status(400).json({ message: 'Record does not exist', data: null });
        }
    } catch (error: any) {
        if (req.file && findData!.thumbnail && findData!.thumbnail !== req.body.thumbnail) {
            fs.unlink(pathFileBody!, (err) => {
                console.error('Error while cleaning up file:', err);
            });
        }

        res.status(400).json({ message: error.message || error, data: null })
    }
};

export const createPostWithBase64 = async (req: Request, res: Response) => {
    let filePath = ''

    try {
        const { thumbnail } = req.body

        if (thumbnail) {
            const targetDir = path.join(__dirname, '../../', process.env.POST_PATH!);

            // Ensure directory exists
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            let fileType = 'image/png'
            let fileContent = null

            // Extract file type from Base64 metadata (if present)
            const matches = thumbnail.match(/^data:(.+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                fileType = 'image/png'
                fileContent = Buffer.from(thumbnail, 'base64'); // Decode Base64 to binary
            } else {
                fileType = matches[1]; // Example: 'image/png'
                fileContent = Buffer.from(matches[2], 'base64'); // Decode Base64 to binary
            }

            // Construct full file path
            const ext = fileType.split('/')[1]; // Use file extension from type if not provided
            const uniqueFilename = `${req.body.title.split(' ').join('-').toLowerCase()}.${ext}`;
            filePath = path.join(targetDir, uniqueFilename);

            // Write binary data to file
            fs.writeFileSync(filePath, fileContent);

            req.body.thumbnail = uniqueFilename
        }

        // Prepare new payload if a file is uploaded
        const payload = {
            ...(req.body.thumbnail && {
                thumbnail: req.body.thumbnail,
            }),
            ...(req.body.content && {
                content: req.body.content,
            }),
            ...(req.body.published && {
                published: req.body.published,
            }),
            title: req.body.title,
        };

        const data = await postClient.create({
            data: {
                ...payload,
                author: {
                    connect: { id: Number(req.body.user_id) }
                }
            },
        });

        res.status(201).json({ message: 'Success create new data', data: data });
    } catch (error: any) {
        fs.unlink(filePath, (err) => {
            console.error('Removing uploaded file due to rollback:', err);
        });

        res.status(400).json({ message: error.message || error, data: null })
    }
};

export const updatePostWithBase64 = async (req: Request, res: Response) => {
    let filePath = ''

    const findData = await postClient.findUnique({
        where: { id: Number(req.params.id) }
    })

    try {
        const { thumbnail } = req.body

        if (req.body.user_id) {
            req.body.authorId = Number(req.body.user_id)
            delete req.body.user_id
        }

        if (findData) {
            if (thumbnail) {
                const targetDir = path.join(__dirname, '../../', process.env.POST_PATH!);

                // Ensure directory exists
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                let fileType = 'image/png'
                let fileContent = null

                // Extract file type from Base64 metadata (if present)
                const matches = thumbnail.match(/^data:(.+);base64,(.+)$/);
                if (!matches || matches.length !== 3) {
                    fileType = 'image/png'
                    fileContent = Buffer.from(thumbnail, 'base64'); // Decode Base64 to binary
                } else {
                    fileType = matches[1]; // Example: 'image/png'
                    fileContent = Buffer.from(matches[2], 'base64'); // Decode Base64 to binary
                }

                // Construct full file path
                const ext = fileType.split('/')[1]; // Use file extension from type if not provided
                const uniqueFilename = `${req.body.title.split(' ').join('-').toLowerCase()}.${ext}`;
                filePath = path.join(targetDir, uniqueFilename);

                // Write binary data to file
                fs.writeFileSync(filePath, fileContent);

                req.body.thumbnail = uniqueFilename
            }

            const data = await postClient.update({
                where: {
                    id: Number(req.params.id),
                },
                data: req.body,
            });

            // Delete old image
            if (data && thumbnail && findData.thumbnail && findData.thumbnail !== req.body.thumbnail) {
                const pathFileBody = path.resolve(process.cwd(), process.env.POST_PATH + findData.thumbnail!)

                fs.unlink(pathFileBody!, (err) => {
                    console.error('Removing uploaded file due to rollback:', err);
                });
            }

            res.status(200).json({ message: 'Success update data', data: data });
        } else {
            res.status(400).json({ message: 'Record does not exist', data: null });

        }
    } catch (error: any) {
        if (req.body.thumbnail && findData!.thumbnail && findData!.thumbnail !== req.body.thumbnail) {
            fs.unlink(filePath, (err) => {
                console.error('Removing uploaded file due to rollback:', err);
            });
        }

        res.status(400).json({ message: error.message || error, data: null })
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const data = await postClient.delete({
            where: {
                id: Number(req.params.id),
            },
        });

        if (data && data.thumbnail) {
            const pathFileBody = path.resolve(process.cwd(), process.env.POST_PATH + data.thumbnail)

            fs.unlink(pathFileBody!, (err) => {
                console.error('Removing uploaded file due to rollback:', err);
            });
        }

        res.status(200).json({ message: 'Success delete data', data });
    } catch (error: any) {
        res.status(400).json({ message: error.message || error, data: null })
    }
};