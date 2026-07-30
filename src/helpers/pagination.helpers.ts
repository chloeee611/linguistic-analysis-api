export type PaginationLinks = {
    first: string;
    self: string;
    prev?: string;
    next?: string;
    last: string;
};

export type PaginationMeta = {
    page: number;
    size: number;
    total: number;
    lastPage: number;
};

export const generatePaginationLinksAndMeta = (
    url: string,
    currentPage: number,
    currentPageSize: number,
    totalSize: number,
) => {
    const lastPage = Math.ceil(totalSize / currentPageSize);

    const links: PaginationLinks = {
        first: `${url}?page=${1}&pageSize=${currentPageSize}`,
        self: `${url}?page=${currentPage}&pageSize=${currentPageSize}`,
        last: `${url}?page=${lastPage}&pageSize=${currentPageSize}`,
    };

    if (currentPage > 1) {
        links.prev = `${url}?page=${currentPage - 1}&pageSize=${currentPageSize}`;
    }

    if (currentPage * currentPageSize <= totalSize) {
        links.next = `${url}?page=${currentPage + 1}&pageSize=${currentPageSize}`;
    }

    const meta: PaginationMeta = {
        page: currentPage,
        size: currentPageSize,
        lastPage,
        total: totalSize,
    };

    return { links, meta };
};
