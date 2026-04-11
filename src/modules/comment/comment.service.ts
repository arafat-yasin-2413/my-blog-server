import { CommentStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getCommentById = async (commentId: string) => {
    // console.log('comment id got : ', commentId);
    return await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true,
                },
            },
        },
    });
};

const getCommentsByAuthorId = async (authorId: string) => {
    // console.log(authorId);
    return await prisma.comment.findMany({
        where: {
            authorId,
        },
        orderBy: { createdAt: "desc" },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true,
                },
            },
        },
    });
};

const createComment = async (payload: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string;
}) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId,
        },
    });

    if (payload.parentId) {
        await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId,
            },
        });
    }

    const result = await prisma.comment.create({
        data: payload,
    });
    return result;
};

const deleteComment = async (commentId: string, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId,
        },
        select: {
            id: true,
            content: true,
        },
    });

    if (!commentData) {
        throw new Error(
            "Invalid comment Id or Author Id. Try after Logging in Again.",
        );
    }

    return await prisma.comment.delete({
        where: {
            id: commentData.id,
        },
    });
};

const updateComment = async (
    commentId: string,
    data: { content?: string; status?: CommentStatus },
    authorId: string,
) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select:{
            id: true,
            content: true
        }
    })

    if(!commentData) {
        throw new Error("Wrong Comment Id or Author doesn't exist. Try Again.")
    }

    return await prisma.comment.update({
        where: {
            id: commentId,
            authorId
        },
        data
    })
};


const moderateComment = async (id: string, data: {status: CommentStatus})=>{
    await prisma.comment.findUniqueOrThrow({
        where: {
            id
        }
    })

    return await prisma.comment.update({
        where: {
            id 
        },
        data
    })
}

export const commentServices = {
    createComment,
    getCommentById,
    getCommentsByAuthorId,
    deleteComment,
    updateComment,
    moderateComment,
};
