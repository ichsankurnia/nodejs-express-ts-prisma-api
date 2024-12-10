import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import path from "path";
import fs from 'fs'

const profileClient = new PrismaClient().profile


export const getAllProfile = async (req: Request, res: Response) => {
    try {
        const data = await profileClient.findMany()

        res.status(200).json({ message: "Success get all data", data })
    } catch (error: any) {
        res.status(500).json({ message: error.message || error, data: null })
    }
}

export const getProfileByUserId = async (req: Request, res: Response) => {
    try {
        const data = await profileClient.findUnique({
            where: {
                userId: Number(req.params.id)
            },
            include: {
                user: true
            }
        })

        res.status(200).json({ message: "Success get data", data })
    } catch (error: any) {
        res.status(400).json({ message: error.message || error, data: null })
    }
}


export const updateProfileBase64 = async (req: Request, res: Response) => {
    let filePath = ''
    try {
        const { avatar } = req.body
        const userId = Number(req.params.id)

        if (avatar) {
            const targetDir = path.join(__dirname, '../../', process.env.PROFILE_PATH!);

            // Ensure directory exists
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            let fileType = 'image/png'
            let fileContent = null

            // Extract file type from Base64 metadata (if present)
            const matches = avatar.match(/^data:(.+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                fileType = 'image/png'
                fileContent = Buffer.from(avatar, 'base64'); // Decode Base64 to binary
            } else {
                fileType = matches[1]; // Example: 'image/png'
                fileContent = Buffer.from(matches[2], 'base64'); // Decode Base64 to binary
            }

            // Construct full file path
            const ext = fileType.split('/')[1]; // Use file extension from type if not provided
            const uniqueFilename = `${userId}-${Date.now()}.${ext}`;
            filePath = path.join(targetDir, uniqueFilename);

            console.log(filePath)
            // Write binary data to file
            fs.writeFileSync(filePath, fileContent);

            req.body.avatar = uniqueFilename
        }


        const findData = await profileClient.findUnique({ where: { userId: userId } })

        let data = null
        if (findData) {
            // IF the avatar changes, delete the old avatar
            if (avatar && findData.avatar) {
                const pathFileBody = path.resolve(process.cwd(), process.env.PROFILE_PATH + findData.avatar)

                fs.unlink(pathFileBody!, (err) => {
                    console.error('Removing uploaded file due to rollback:', err);
                });
            }

            data = await profileClient.update({
                where: { userId: userId },
                data: req.body
            })
        } else {
            data = await profileClient.create({
                data: {
                    ...req.body,
                    user: {
                        connect: { id: userId }
                    }
                }
            })
        }

        res.status(200).json({ message: 'Success update data', data: data });
    } catch (error: any) {
        console.error('Error uploading Base64 file:', error);

        fs.unlink(filePath, (err) => {
            console.error('Removing uploaded file due to rollback:', err);
        });

        res.status(400).json({ message: error.message || error, data: null })
    }
};


export const updateProfileByFile = async (req: Request, res: Response) => {
    const pathFileBody = req.file ? path.resolve(process.cwd(), process.env.PROFILE_PATH + req.file.filename) : null;

    try {
        const userId = Number(req.params.id)

        const findData = await profileClient.findUnique({ where: { userId: userId } })

        const payload = {
            bio: req.body.bio,
            ...(req.file && { avatar: req.file?.filename })
        }

        let data = null
        if (findData) {
            // IF the avatar changes, delete the old avatar
            if (req.file && findData.avatar) {
                const pathFileBody = path.resolve(process.cwd(), process.env.PROFILE_PATH + findData.avatar)

                fs.unlink(pathFileBody!, (err) => {
                    console.error('Removing uploaded file due to rollback:', err);
                });
            }

            data = await profileClient.update({
                where: { userId: userId },
                data: payload
            })
        } else {
            data = await profileClient.create({
                data: {
                    ...payload,
                    user: {
                        connect: { id: userId }
                    }
                }
            })
        }

        res.status(200).json({ message: 'Success update data', data: data });
    } catch (error: any) {
        if (req.file) {
            fs.unlink(pathFileBody!, (err) => {
                console.error('Error while cleaning up file:', err);
            });
        }

        console.error('Error uploading Base64 file:', error);
        res.status(400).json({ message: error.message || error, data: null })
    }
};


export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const data = await profileClient.delete({
            where: {
                userId: Number(req.params.id),
            },
        });

        if (data.avatar) {
            const pathFileBody = path.resolve(process.cwd(), process.env.PROFILE_PATH + data.avatar)

            fs.unlink(pathFileBody!, (err) => {
                console.error('Removing uploaded file due to rollback:', err);
            });
        }

        res.status(200).json({ message: 'Success delete data', data });
    } catch (error: any) {
        res.status(400).json({ message: error.message || error, data: null })
    }
};