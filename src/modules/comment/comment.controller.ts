import { Request, Response } from "express";
import { commentServices } from "./comment.service";

const getCommentById = async(req: Request, res: Response)=>{
    try{
        const {commentId} = req.params;
        const result = await commentServices.getCommentById(commentId as string);
        return res.status(200).json(result);
    }
    catch(error){
        return res.status(400).json({
            error: "Get Comment By Id Failed",
            details: error
        })
    }
}

const createComment = async(req: Request, res: Response)=>{
    try{
        const user = req.user;
        req.body.authorId = user?.id;
        const result = await commentServices.createComment(req.body);
        return res.status(201).json(result);
    }
    catch(error){
        return res.status(400).json({
            error: "Comment Creation Failed",
            details: error
        })
    }
}

export const commmentControllers = {
    createComment,
    getCommentById,
}