import express, { Request, Response } from "express";
import userRouter from "./routes/user.router";
import profileRouter from "./routes/profile.routes";
import postRouter from "./routes/post.router";
import bodyParser from "body-parser";
import cors from 'cors'
import path from "path";

const app = express();
const port = process.env.PORT || 8080;

// app.use(express.json());
app.use(cors())
app.use(bodyParser.json({ limit: "100mb" }))
app.use(bodyParser.urlencoded({ limit: "100mb", extended: false }))
app.use('/public', express.static(path.resolve(process.cwd(), 'public')))


app.get("/ping", (req, res) => {
    res.send("Pong!!").status(200);
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/post", postRouter);


/** Not found handler */
app.get('*', (req: Request, res: Response) => {
    res.status(404).json({ code: 404, message: 'URL Not Found', data: null });
});


app.listen(port, () => {
    console.log(`Server up and running on port: ${port}`);
});