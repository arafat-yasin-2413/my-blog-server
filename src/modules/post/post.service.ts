import { CommentStatus, Post, PostStatus } from "../../generated/prisma/client";
import { PostWhereInput } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";

const getAllPost = async ({
    search,
    tags,
    isFeatured,
    status,
    authorId,
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
}: {
    search: string | undefined;
    tags: string[] | [];
    isFeatured: boolean | undefined;
    status: PostStatus | undefined;
    authorId: string | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
}) => {
    const andConditions: PostWhereInput[] = [];

    if (search) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    content: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    tags: {
                        has: search,
                    },
                },
            ],
        });
    }

    if (tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: tags as string[],
            },
        });
    }

    if (typeof isFeatured === "boolean") {
        andConditions.push({
            isFeatured,
        });
    }

    if (status) {
        andConditions.push({
            status,
        });
    }

    if (authorId) {
        andConditions.push({
            authorId,
        });
    }

    const allPost = await prisma.post.findMany({
        take: limit,
        skip,
        where: {
            AND: andConditions,
        },
        orderBy: { [sortBy]: sortOrder },
        include: {
            _count: {
                select: { comments: true },
            },
        },
    });

    const total = await prisma.post.count({
        where: {
            AND: andConditions,
        },
    });

    return {
        data: allPost,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getPostById = async (id: string) => {
    return await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: id,
            },
            data: {
                views: {
                    increment: 1,
                },
            },
        });

        const postData = await tx.post.findUnique({
            where: {
                id: id,
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.APPROVED,
                    },
                    orderBy: { createdAt: "desc" },
                    include: {
                        replies: {
                            where: {
                                status: CommentStatus.APPROVED,
                            },
                            orderBy: { createdAt: "desc" },
                            include: {
                                replies: {
                                    where: {
                                        status: CommentStatus.APPROVED,
                                    },
                                    orderBy: { createdAt: "desc" },
                                },
                            },
                        },
                    },
                },
                _count: {
                    select: { comments: true },
                },
            },
        });
        return postData;
    });

    // return result;
};

const getMyPost = async (authorId: string) => {
    await prisma.user.findUniqueOrThrow({
        where: {
            id: authorId,
            status: "ACTIVE",
        },
        select: {
            id: true,
            name: true,
            email: true,
            status: true,
        },
    });

    const result = await prisma.post.findMany({
        where: {
            authorId,
        },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    comments: true,
                },
            },
        },
    });

    // const total = await prisma.post.count({
    //     where: {
    //         authorId,
    //     },
    // });

    // const total = await prisma.post.aggregate({
    //     _count: {
    //         id: true
    //     },
    //     where: {
    //         authorId
    //     }
    // })

    return result;
};

const createPost = async (
    data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
    userId: string,
) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId,
        },
    });
    return result;
};

// user can only update owned post. -- can't update 'isFeatured' field
// admin can update any post

const updatePost = async (
    postId: string,
    authorId: string,
    isAdmin: boolean,
    data: Partial<Post>,
) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId,
        },
        select: {
            id: true,
            authorId: true,
        },
    });

    // console.log({postId, authorId, isAdmin});

    if (!isAdmin && postData.authorId !== authorId) {
        throw new Error(
            "You are not the owner of this post. So, you can't update.",
        );
    }

    if (!isAdmin) {
        delete data.isFeatured;
    }

    const result = await prisma.post.update({
        where: {
            id: postId,
        },
        data,
    });
    return result;
};

// Role: USER ==> nijer post delete korte parbe.
// Role: ADMIN ==> sobar post delete korte parbe.

const deletePost = async (
    postId: string,
    authorId: string,
    isAdmin: boolean,
) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId,
        },
        select: {
            id: true,
            title: true,
            authorId: true,
        },
    });

    console.log({ postId, authorId, isAdmin });

    if (!isAdmin && postData.authorId !== authorId) {
        throw new Error(
            "You are not the owner of this post. So, you can't delete this.",
        );
    }

    return await prisma.post.delete({
        where: {
            id: postData.id,
        },
    });
};

// eikhane multiple table theke data ante hobe.
// so , multiple query korte hobe.
// ar multiple query er jonno TRANSACTION byabohar korte hobe.
const getStats = async () => {
    return await prisma.$transaction(async (tx) => {
        const [
            totalPosts,
            publishedPosts,
            draftedPosts,
            archivedPosts,
            totalComments,
            approvedComments,
            rejectedComments,
            totalUsers,
            adminCount,
            userCount,
            totalViews,
        ] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({
                where: { status: PostStatus.PUBLISHED },
            }),
            await tx.post.count({ where: { status: PostStatus.DRAFT } }),
            await tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
            await tx.comment.count(),
            await tx.comment.count({where: {status: CommentStatus.APPROVED,},}),
            await tx.comment.count({where: { status: CommentStatus.REJECTED },}),
            await tx.user.count(),
            await tx.user.count({ where: { role: UserRole.ADMIN } }),
            await tx.user.count({ where: { role: UserRole.USER } }),
            await tx.post.aggregate({_sum: {views: true}})
        ]);

        return {
            totalPosts,
            publishedPosts,
            draftedPosts,
            archivedPosts,
            totalComments,
            approvedComments,
            rejectedComments,
            totalUsers,
            adminCount,
            userCount,
            totalViews: totalViews._sum.views,
        };
    });

    // postCount
    // published post koyta
    // draft post koyta ache

    // total comment koyta ache
    // total views koyta ache?
};

export const postServices = {
    createPost,
    getAllPost,
    getPostById,
    getMyPost,
    updatePost,
    deletePost,
    getStats,
};
