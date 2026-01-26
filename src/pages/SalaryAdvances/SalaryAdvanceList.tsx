import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import {
    GetDataSimple,
    getStoredYear,
    PostSimple,
} from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableSalaryAdvance from "./TableSalaryAdvance.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import { useModal } from "../../hooks/useModal.ts";
import AddSalaryAdvanceModal from "./AddSalaryAdvanceModal.tsx";

interface SalaryAdvance {
    advance_id: number;
    to_user_id: number;
    to_user_name: string;
    user_name: string;
    advance_comments: string;
    amount_of_advance: number;
    created_at: string;
}

export default function SalaryAdvanceList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredAdvances, setFilteredAdvances] = useState<SalaryAdvance[]>(
        []
    );
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();

    const fetchAdvances = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/user-salary-advance/list?page=${page}&limit=30&year=${getStoredYear()}`
            );
            const advancesData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredAdvances(advancesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching salary advances:", error);
            toast.error(
                error?.response?.data?.message ||
                    "Что-то пошло не так при загрузке авансов"
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
                    `api/user-salary-advance/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30&year=${getStoredYear()}`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredAdvances(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchAdvances();
                }
            } catch (error) {
                fetchAdvances();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchAdvances, setIsSearching]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        // Table list ni yangilash
        fetchAdvances();
    }, [status, fetchAdvances]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchAdvances();
    }, [fetchAdvances]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "salary-advances") {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchAdvances();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchAdvances]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список авансов зарплаты" />
            <PageBreadcrumb pageTitle="Авансы зарплаты" />
            <ComponentCard
                title="Список авансов зарплаты"
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
                            Добавить аванс
                        </button>
                    </div>
                }
            >
                <TableSalaryAdvance
                    advances={filteredAdvances}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddSalaryAdvanceModal
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
