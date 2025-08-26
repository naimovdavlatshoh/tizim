import React, { useState, useEffect, useCallback } from "react";
import { useSearch } from "../../context/SearchContext";
import { GetDataSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/ui/loader/Loader";
import TableFaceId from "./TableFaceId";

interface FaceId {
    face_id: number;
    name: string;
    work_date: string;
    arrival_time: string;
    leave_time: string;
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
                title="BNM Tizim"
                description="Управление Face ID пользователей"
            />
            <PageBreadCrumb pageTitle="Face ID" />

            <div className="mx-auto max-w-screen-2xl">
                <ComponentCard
                    title="Face ID"
                    desc={""}
                >
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            <TableFaceId
                                faceIds={filteredFaceIds}
                                changeStatus={changeStatus}
                            />

                            {totalPages > 1 && (
                                <div className="mt-4">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </ComponentCard>
            </div>
        </>
    );
};

export default FaceIdList;
