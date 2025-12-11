import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableFine from "./TableFine.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import { useModal } from "../../hooks/useModal.ts";
import AddFineModal from "./AddFineModal.tsx";

interface Fine {
    fine_id: number;
    to_user_id: number;
    user_name: string;
    fine_comments: string;
    amount_of_fine: number;
    created_at: string;
}

export default function FineList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredFines, setFilteredFines] = useState<Fine[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();

    const fetchFines = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/user-fines/list?page=${page}&limit=10`
            );
            const finesData = response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredFines(finesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching fines:", error);
            toast.error(
                error?.response?.data?.message ||
                    "Что-то пошло не так при загрузке штрафов"
            );
            setLoading(false);
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim() || query.trim().length < 3) return;

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/user-fines/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=10`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredFines(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchFines();
                }
            } catch (error) {
                fetchFines();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchFines, setIsSearching]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        // Table list ni yangilash
        fetchFines();
    }, [status, fetchFines]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchFines();
    }, [fetchFines]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "fines") {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchFines();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchFines]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список штрафов" />
            <PageBreadcrumb pageTitle="Штрафы" />
            <ComponentCard
                title="Список штрафов"
                desc={
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={openModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Добавить штраф
                        </button>
                    </div>
                }
            >
                <TableFine fines={filteredFines} changeStatus={changeStatus} />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddFineModal
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    changeStatus();
                }}
                changeStatus={changeStatus}
            />

            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#10B981",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#EF4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />
        </>
    );
}
