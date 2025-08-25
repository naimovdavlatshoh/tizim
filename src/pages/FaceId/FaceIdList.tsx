import React, { useState, useEffect, useCallback } from "react";
import { useSearch } from "../../context/SearchContext";
import { GetDataSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";

import Loader from "../../components/ui/loader/Loader";
import TableFaceId from "./TableFaceId";

interface FaceId {
    face_id: number;
    name: string;
    created_at: string;
}

const FaceIdList: React.FC = () => {
    const { searchQuery, currentPage } = useSearch();
    const [filteredFaceIds, setFilteredFaceIds] = useState<FaceId[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    console.log(searchQuery);

    const [status, setStatus] = useState(0);

    const fetchFaceIds = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/faceid/list?page=${page}&limit=10`
            );

            const faceIdsData = response?.result || response?.result || [];
            const totalPagesData = response?.pages || response?.pages || 1;

            setFilteredFaceIds(faceIdsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching face IDs:", error);
            toast.error("Что-то пошло не так при загрузке Face ID");
            setLoading(false);
        }
    }, [page]);

    const changeStatus = () => {
        setStatus((prev) => prev + 1);
    };

    useEffect(() => {
        fetchFaceIds();
    }, [currentPage, status, page, fetchFaceIds]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <>
            <PageMeta
                title="Face ID - Tizim"
                description="Управление Face ID пользователей"
            />
            <PageBreadCrumb pageTitle="Face ID" />

            <div className="mx-auto max-w-screen-2xl  ">
                <ComponentCard
                    title="Face ID"
                    desc="Управление Face ID пользователей"
                >
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader />
                        </div>
                    ) : (
                        <TableFaceId
                            faceIds={filteredFaceIds}
                            changeStatus={changeStatus}
                        />
                    )}
                </ComponentCard>

                {!loading && totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex space-x-2">
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-2 rounded ${
                                        page === pageNum
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FaceIdList;
