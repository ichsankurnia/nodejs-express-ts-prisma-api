import { Router } from "express";
import { createUser, deleteUser, getAllUser, getUserById, updateUser } from "../controllers/user.controller";

const userRouter = Router()

userRouter.get('/', getAllUser)
userRouter.get('/:id', getUserById)
userRouter.post('/', createUser)
userRouter.patch('/:id', updateUser)
userRouter.delete('/:id', deleteUser)


export default userRouter