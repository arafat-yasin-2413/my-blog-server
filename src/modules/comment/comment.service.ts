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

export const commentServices = {
    createComment,
    getCommentById,
    getCommentsByAuthorId,
};
