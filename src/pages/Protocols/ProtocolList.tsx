import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import {
    GetDataSimple,
    // PostSimple,  
    PostDataTokenJson,
} from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableProtocol from "./TableProtocol.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import { useModal } from "../../hooks/useModal.ts";
import AddProtocolModal from "./AddProtocolModal.tsx";

interface Protocol {
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
}

export default function ProtocolList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredProtocols, setFilteredProtocols] = useState<Protocol[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const getStoredYear = () => {
        const stored = localStorage.getItem("selectedYear");
        return stored || "2026";
    };

    const fetchProtocols = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/protocol/list?page=${page}&limit=10&year=${getStoredYear()}`
            );
            const protocolsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredProtocols(protocolsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching protocols:", error);
            toast.error(
                error?.response?.data?.message ||
                    "Что-то пошло не так при загрузке протоколов"
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
                    `api/protocol/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=10`,
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

                    setFilteredProtocols(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchProtocols();
                }
            } catch (error) {
                fetchProtocols();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchProtocols, setIsSearching]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        // Table list ni yangilash
        fetchProtocols();
    }, [status, fetchProtocols]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchProtocols();
    }, [fetchProtocols]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "protocols") {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchProtocols();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchProtocols]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список Протоколов" />
            <PageBreadcrumb pageTitle="Протоколы" />
            <ComponentCard
                title="Список Протоколов"
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
                            Добавить протокол
                        </button>
                    </div>
                }
            >
                <TableProtocol
                    protocols={filteredProtocols}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddProtocolModal
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
