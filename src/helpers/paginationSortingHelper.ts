type IOptions = {
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
    sortOrder?: string;
};

type IoptionsResult = {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
};

const paginationSortingHelper = (options: IOptions): IoptionsResult => {
    // console.log({options});
    const page: number = Number(options.page) || 1;
    const limit: number = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy: string = options.sortBy || "createdAt";
    const sortOrder: string = options.sortOrder || "desc";

    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    };
};

export default paginationSortingHelper;
