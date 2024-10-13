import React from "react";
import usePagination, { DOTS } from "./usePagination";
import {cx} from "react-twc";

interface Props {
    onPageChange: (num: number) => void;
    totalCount: number;
    siblingCount?: number;
    currentPage: number;
    pageSize: number;
    size?: "sm" | "md";
}

const Pagination = (props: Props) => {
    const {
        onPageChange,
        totalCount,
        siblingCount = 1,
        currentPage,
        pageSize,
        size = "md",
    } = props;

    const paginationRange = usePagination({
        currentPage,
        totalCount,
        siblingCount,
        pageSize,
    });

    // If there are less than 2 times in pagination range we shall not render the component
    // if (currentPage === 0 || paginationRange!.length < 2) {
    //     return null;
    // }

    const onNext = () => {
        onPageChange(currentPage + 1);
    };

    // const onPrevious = () => {
    //   onPageChange(currentPage - 1);
    // };

    const lastPage = paginationRange![paginationRange!.length - 1];
    return (
        <div
            className={cx(
                "join flex justify-center",
                size === "sm" && "gap-4 ",
                size === "md" && "gap-8 ",
            )}
        >
            {/* Left navigation arrow */}
            {/* <button
                onClick={onPrevious}
                disabled={currentPage === 1}
                className={` text-lg font-semibold py-3 px-3.5 
                ${currentPage === 1 ? 'text-[#bcbcbc]' : 'text-[#111] dark:text-white'}`}>Prev</button> */}
            <div
                className={cx(
                    "flex",
                    size === "sm" && "gap-2",
                    size === "md" && "gap-3.5",
                )}
            >
                {paginationRange!.map((pageNumber: number, index: number) => {
                    // If the pageItem is a DOT, render the DOTS unicode character
                    if (pageNumber === DOTS) {
                        return (
                            <button
                                key={index}
                                className={cx(
                                    "btn btn-ghost bg-transparent",
                                    size === "sm" && "btn-sm",
                                )}
                            >
                                ...
                            </button>
                        );
                    }
                    // Render our Page Pills
                    return (
                        <button
                            key={index}
                            onClick={() => onPageChange(pageNumber)}
                            className={cx(
                                "btn ",
                                size === "sm" && "btn-sm",
                                currentPage === pageNumber && "btn-primary text-white",
                                currentPage !== pageNumber && "btn-outline ",
                            )}
                        >
                            {pageNumber < 10 ? "0" + pageNumber : pageNumber}
                        </button>
                    );
                })}
            </div>

            {/*  Right Navigation arrow */}
            <button
                disabled={currentPage === lastPage}
                onClick={onNext}
                className={cx(
                    `btn btn-outline ${currentPage === lastPage ? "btn-disabled" : ""}`,
                    size === "sm" && "btn-sm",
                )}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination