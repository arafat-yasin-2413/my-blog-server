import { NextFunction, Request, Response } from "express";
import { postServices } from "./post.service";
import { PostStatus } from "../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { error } from "node:console";
import { UserRole } from "../../middlewares/auth";

const getAllPost = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const searchString = typeof search === "string" ? search : undefined;

        const tags = req.query.tags
            ? (req.query.tags as string).split(",")
            : [];

        // accepts only 'true' or 'false' values. spelling  incorrect hoile false hoite deua jabe na.
        // banan vul dile isFeatured diye filtering kaj korbe na.
        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === "true"
                ? true
                : req.query.isFeatured === "false"
                  ? false
                  : undefined
            : undefined;
        // console.log('ISFEATURED : ',isFeatured, typeof(isFeatured));

        const status = req.query.status as PostStatus | undefined;

        const authorId = req.query.authorId as string | undefined;

        // const page = Number(req.query.page ?? 1);
        // const limit = Number(req.query.limit ?? 10);
        // const skip = (page - 1) * limit;

        // const sortBy = req.query.sortBy as string | undefined;
        // const sortOrder = req.query.sortOrder as string | undefined;

        const { page, limit, skip, sortBy, sortOrder } =
            paginationSortingHelper(req.query);
        // console.log(options);

        const result = await postServices.getAllPost({
            search: searchString,
            tags,
            isFeatured,
            status,
            authorId,
            page,
            limit,
            skip,
            sortBy,
            sortOrder,
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            error: "Getting all post operation failed",
            details: error,
        });
    }
};

const getPostById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new Error("PostId is required.");
        }
        const result = await postServices.getPostById(id as string);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            error: "Get Post by id failed",
            details: error,
        });
    }
};

const getMyPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        console.log({ user });

        if (!user) {
            throw new Error("You are unauthorized");
        }

        const result = await postServices.getMyPost(user?.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            error: "Getting My Post failed",
            details: error,
        });
    }
};

const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        // console.log("user in create-post-controller : ", { user });
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
        next(error);
    }
};

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("You are unauthorized");
        }

        const { postId } = req.params;
        const isAdmin = user.role === UserRole.ADMIN;

        console.log({ user });

        const result = await postServices.updatePost(
            postId as string,
            user?.id,
            isAdmin,
            req.body,
        );
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const deletePost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("You are unauthorized");
        }

        const { postId } = req.params;
        const isAdmin = user.role === UserRole.ADMIN;

        console.log({ user });

        const result = await postServices.deletePost(
            postId as string,
            user?.id,
            isAdmin,
        );
        return res.status(200).json(result);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Post delete failed";
        return res.status(400).json({
            error: errorMessage,
            details: error,
        });
    }
};


const getStats = async (req: Request, res: Response) => {
    try {
        const result = await postServices.getStats();
        return res.status(200).json(result);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Getting statistics failed";
        return res.status(400).json({
            error: errorMessage,
            details: error,
        });
    }
};

export const postController = {
    createPost,
    getAllPost,
    getPostById,
    getMyPost,
    updatePost,
    deletePost,
    getStats
};
