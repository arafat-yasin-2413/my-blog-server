import { Request, Response } from "express";
import { postServices } from "./post.service";

const getAllPost = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const searchString = typeof search === "string" ? search : undefined;

        const tags = req.query.tags ? (req.query.tags as string).split(","): [];

        const result = await postServices.getAllPost({ search: searchString, tags });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            error: "Getting all post operation failed",
            details: error,
        });
    }
};

const createPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        console.log("user in create-post-controller : ", { user });
        if (!req.user) {
            return res.status(401).json({
                error: "Unauthorized access",
            });
        }
        const result = await postServices.createPost(
            req.body,
            user?.id as string,
        );
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            error: "Post Creation Failed",
            details: error,
        });
    }
};

export const postController = {
    createPost,
    getAllPost,
};
