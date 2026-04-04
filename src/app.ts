import express, { Application } from "express";
import { postRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
// import cors from "cors";

const app: Application = express();
app.all('/api/auth/{*any}', toNodeHandler(auth));
// 24-1 er 11:20 er por eikhane /api/auth/*splat likhte bola hoisilo.
// Kintu ami Better auth er docu onujayi likhechi. And So far, it is working.


app.use(express.json());
// app.use(cors());


// using defined routes
app.use("/posts", postRouter);



app.get("/", (req, res) => {
    res.send("Hello World")
})

export default app;
