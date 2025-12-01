import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableLetter from "./TableLetter.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import { useModal } from "../../hooks/useModal.ts";
import AddLetterModal from "./AddLetterModal.tsx";

interface Letter {
    letter_id: number;
    letter_number: string;
    send_to: string;
    letter_status: number;
    letter_status_text: string;
    user_name: string;
    created_at: string;
}

export default function LetterList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredLetters, setFilteredLetters] = useState<Letter[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();

    const fetchLetters = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/letter/list?page=${page}&limit=30`
            );
            const lettersData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredLetters(lettersData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching letters:", error);
            toast.error(error?.response?.data?.message || "Что-то пошло не так при загрузке писем");
            setLoading(false);
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim() || query.trim().length < 3) return;

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/letter/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredLetters(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchLetters();
                }
            } catch (error) {
                fetchLetters();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchLetters, setIsSearching]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        // Table list ni yangilash
        fetchLetters();
    }, [status, fetchLetters]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchLetters();
    }, [fetchLetters]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "letters") {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchLetters();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchLetters]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description=" Список Письма" />
            <PageBreadcrumb pageTitle="Письма" />
            <ComponentCard
                title="Список Письма"
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
                            Добавить письмо
                        </button>
                    </div>
                }
            >
                <TableLetter
                    letters={filteredLetters}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddLetterModal
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
