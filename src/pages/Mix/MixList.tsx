import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import {
    GetDataSimple,
    PostDataTokenJson,
} from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableMix from "./TableMix.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import { useModal } from "../../hooks/useModal.ts";
import AddMixModal from "./AddMixModal.tsx";

interface Mix {
    protocol_id: number;
    protocol_number: number;
    category_name: string;
    application_date: string;
    test_date: string;
    is_accepted: number;
    accepted_date: string;
    sender_comments: string;
    created_by: string;
    created_at: string;
    acceptance_status: string;
    is_word_added?: number;
    is_pdf_added?: number;
    client_full_name?: string | null;
}

export default function MixList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredMixes, setFilteredMixes] = useState<Mix[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const getStoredYear = () => {
        const stored = localStorage.getItem("selectedYear");
        return stored || "2026";
    };

    const fetchMixes = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/mix/list?page=${page}&limit=30&year=${getStoredYear()}`
            );
            const mixesData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredMixes(mixesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching mixes:", error);
            toast.error(
                error?.response?.data?.message ||
                    "Что-то пошло не так при загрузке смесей"
            );
            setLoading(false);
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim() || query.trim().length < 3) return;

            setIsSearching(true);
            try {
                const response: any = await PostDataTokenJson(
                    `api/mix/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`,
                    {}
                );

                if (
                    response?.status === 200 ||
                    response?.data?.success ||
                    response?.data
                ) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredMixes(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchMixes();
                }
            } catch (error) {
                fetchMixes();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchMixes, setIsSearching]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        // Table list ni yangilash
        fetchMixes();
    }, [status, fetchMixes]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchMixes();
    }, [fetchMixes]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "mix") {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchMixes();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchMixes]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список Смесей" />
            <PageBreadcrumb pageTitle="Подбор смеси" />
            <ComponentCard
                title="Список Смесей"
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
                            Добавить смесь
                        </button>
                    </div>
                }
            >
                <TableMix
                    mixes={filteredMixes}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddMixModal
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
