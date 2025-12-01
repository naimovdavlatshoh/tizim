import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableBrokerContract from "./TableBrokerContract.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import { useModal } from "../../hooks/useModal.ts";
import AddBrokerContractModal from "./AddBrokerContractModal.tsx";

interface BrokerContract {
    contract_id: number;
    contract_number: string;
    object_address: string;
    contract_type: number;
    contract_price: number;
    contract_date: string;
    contract_status: number;
    contract_status_text: string;
    created_at: string;
}

export default function BrokerContractList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredContracts, setFilteredContracts] = useState<
        BrokerContract[]
    >([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();

    const fetchContracts = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/contracts/broker/list?page=${page}&limit=30`
            );
            const contractsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredContracts(contractsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching broker contracts:", error);
            toast.error("Что-то пошло не так при загрузке контрактов брокера");
            setLoading(false);
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim() || query.trim().length < 3) return;

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/contracts/broker/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=30`
                );

                // PostSimple возвращает response, нужно получить data
                const responseData = response?.data || response;

                if (
                    response?.status === 200 ||
                    responseData?.success ||
                    responseData?.result
                ) {
                    const searchResults =
                        responseData?.result ||
                        responseData?.data?.result ||
                        [];
                    const totalPagesData =
                        responseData?.pages ||
                        responseData?.data?.pages ||
                        response?.data?.pages ||
                        1;

                    setFilteredContracts(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchContracts();
                }
            } catch (error) {
                console.error("Error searching broker contracts:", error);
                fetchContracts();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchContracts, setIsSearching]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        // Table list ni yangilash
        fetchContracts();
    }, [status, fetchContracts]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "broker-contracts") {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchContracts();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchContracts]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta
                title="BNM Tizim"
                description="Список контрактов брокера"
            />
            <PageBreadcrumb pageTitle="Контракты брокера" />
            <ComponentCard
                title="Список контрактов брокера"
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
                            Добавить контракт
                        </button>
                    </div>
                }
            >
                <TableBrokerContract
                    contracts={filteredContracts}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddBrokerContractModal
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
