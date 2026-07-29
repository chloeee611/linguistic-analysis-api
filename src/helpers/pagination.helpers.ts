export type PaginationLinks = {
    first: string;
    self: string;
    prev?: string;
    next?: string;
    last: string;
};

export const generatePaginationLinks = (
    url: string,
    currentPage: number,
    currentPageSize: number,
    totalSize: number,
) => {
    const links: PaginationLinks = {
        first: `${url}?page=${1}&pageSize=${currentPageSize}`,
        self: `${url}?page=${currentPage}&pageSize=${currentPageSize}`,
        last: `${url}?page=${Math.ceil(totalSize / currentPageSize)}&pageSize=${currentPageSize}`,
    };

    if (currentPage > 1) {
        links.prev = `${url}?page=${currentPage - 1}&pageSize=${currentPageSize}`;
    }

    if (currentPage * currentPageSize <= totalSize) {
        links.next = `${url}?page=${currentPage + 1}&pageSize=${currentPageSize}`;
    }

    return links;
};
