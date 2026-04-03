import { Request, Response } from "express";
import { postServices } from "./post.service";


const createPost = async(req:Request, res:Response) =>{

    try{
        const result = await postServices.createPost(req.body);
        console.log("Body in controller : ---------", req.body)
        res.status(201).json(result);
    
    }
    catch(error) {
        res.status(400).json({
            error: "Post Creation Failed",
            details: error
        })
    }
}


export const postController = {
    createPost
}