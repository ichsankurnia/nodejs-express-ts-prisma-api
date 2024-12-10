import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const userClient = new PrismaClient().user

export const getAllUser = async (req: Request, res: Response) => {
    try {
        const data = await userClient.findMany()

        res.status(200).json({ message: "Success get all data", data })
    } catch (error: any) {
        res.status(500).json({ message: error.message || error, data: null })
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const data = await userClient.findUnique({
            where: {
                id: Number(req.params.id)
            },
            include: {
                profile: true
            }
        })

        if (data) {
            res.status(200).json({ message: "Success get data", data })
        } else {
            res.status(400).json({ message: "Record does not exist", data })
        }

    } catch (error: any) {
        res.status(400).json({ message: error.message || error, data: null })
    }
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const data = await userClient.create({
            data: req.body,
        });

        res.status(201).json({ message: 'Success create new data', data: data });
    } catch (error: any) {
        res.status(400).json({ message: error.message || error, data: null })
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const data = await userClient.update({
            where: {
                id: Number(req.params.id),
            },
            data: req.body,
        });

        res.status(200).json({ message: 'Success update data', data: data });
    } catch (error: any) {
        res.status(400).json({ message: error.message || error, data: null })
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const data = await userClient.delete({
            where: {
                id: Number(req.params.id),
            },
        });

        res.status(200).json({ message: 'Success delete data', data });
    } catch (error: any) {
        res.status(400).json({ message: error.message || error, data: null })
    }
};