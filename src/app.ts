import express, { Application } from "express";
import { postRouter } from "./modules/post/post.router";
// import cors from "cors";

const app: Application = express();
app.use(express.json());
// app.use(cors());


// using defined routes
app.use("/posts", postRouter);



app.get("/", (req, res) => {
    res.send("Hello World")
})

export default app;
