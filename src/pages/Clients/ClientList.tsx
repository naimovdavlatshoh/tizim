import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableClient from "./TableClient.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";
import AddClientModal from "./AddClient.tsx";
import IndividualClientTable from "./IndividualClientTable.tsx";
import LegalEntityClientTable from "./LegalEntityClientTable.tsx";
import Loader from "../../components/ui/loader/Loader.tsx";

interface Statistic {
    total: number;
    fiz_litso: number;
    yur_litso: number;
}

export default function ClientList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    // const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [response, setResponse] = useState("");
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [statistic, setStatistic] = useState<Statistic>();
    console.log(response);

    // Tab state
    const [activeTab, setActiveTab] = useState("all"); // "all", "individual", "legal"

    useEffect(() => {
        if (currentPage === "clients") {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchClients();
            }
        }
    }, [searchQuery, currentPage, status, page, activeTab]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            // Build URL with client_type parameter based on activeTab
            let url = `api/clients/list?page=${page}&limit=30`;
            if (activeTab === "legal") {
                url += `&client_type=1`; // Yuridik shaxslar
            } else if (activeTab === "individual") {
                url += `&client_type=2`; // Jismoniy shaxslar
            }
            // activeTab === "all" bo'lsa client_type parametri qo'shilmaydi

            const response: any = await GetDataSimple(url);
            const clientsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            // setClients(clientsData);
            setFilteredClients(clientsData);
            setStatistic(response?.statistics || response?.data?.statistics);
            console.log(response?.data?.statistics);

            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching clients:", error);
            toast.error("Что-то пошло не так при загрузке клиентов");
            setLoading(false);
        }
    };

    const performSearch = async (query: string) => {
        if (!query.trim() || query.trim().length < 3) return;

        setIsSearching(true);
        try {
            // Build URL with client_type parameter based on activeTab
            let url = `api/clients/search?keyword=${encodeURIComponent(
                query
            )}&page=${page}&limit=30`;
            if (activeTab === "legal") {
                url += `&client_type=1`; // Yuridik shaxslar
            } else if (activeTab === "individual") {
                url += `&client_type=2`; // Jismoniy shaxslar
            }
            // activeTab === "all" bo'lsa client_type parametri qo'shilmaydi

            // Search API ni chaqirish (POST request with URL params)
            const response: any = await PostSimple(url);

            if (response?.status === 200 || response?.data?.success) {
                const searchResults =
                    response?.data?.result || response?.result || [];
                const totalPagesData =
                    response?.data?.pages || response?.pages || 1;

                setFilteredClients(searchResults);
                setTotalPages(totalPagesData);
            } else {
                // Search xatoligida oddiy list ni yuklash
                fetchClients();
            }
        } catch (error) {
            // Search xatoligida oddiy list ni yuklash
            fetchClients();
        } finally {
            setIsSearching(false);
        }
    };

    // Filter clients based on active tab (now handled by API, but kept for compatibility)
    const getFilteredClientsByTab = () => {
        // API already filters by client_type, so we just return filteredClients
        return filteredClients;
    };

    const changeStatus = () => {
        setStatus(!status);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setPage(1); // Reset to first page when changing tabs
    };

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список клиентов" />
            <PageBreadcrumb pageTitle="Клиенты" />
            <ComponentCard
                title="Список клиентов"
                desc={
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
                        Добавить клиента
                    </button>
                }
            >
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => handleTabChange("all")}
                            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                                activeTab === "all"
                                    ? "border-purple-500 text-purple-600 dark:text-purple-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
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
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            Все клиенты
                            <span
                                className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                                    activeTab === "all"
                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                {
                                   statistic?.total
                                }
                            </span>
                        </button>
                        <button
                            onClick={() => handleTabChange("individual")}
                            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                                activeTab === "individual"
                                    ? "border-green-500 text-green-600 dark:text-green-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            Физические лица
                            <span
                                className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                                    activeTab === "individual"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                {
                                    statistic?.fiz_litso
                                }
                            </span>
                        </button>
                        <button
                            onClick={() => handleTabChange("legal")}
                            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                                activeTab === "legal"
                                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
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
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                            Юридические лица
                            <span
                                className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                                    activeTab === "legal"
                                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                                {
                                   statistic?.yur_litso
                                }
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Render different tables based on active tab */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader />
                    </div>
                ) : (
                    <>
                        {activeTab === "all" ? (
                            <TableClient
                                users={getFilteredClientsByTab()}
                                changeStatus={changeStatus}
                            />
                        ) : activeTab === "individual" ? (
                            <IndividualClientTable
                                users={getFilteredClientsByTab()}
                                changeStatus={changeStatus}
                            />
                        ) : (
                            <LegalEntityClientTable
                                users={getFilteredClientsByTab()}
                                changeStatus={changeStatus}
                            />
                        )}
                    </>
                )}

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddClientModal
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    changeStatus();
                }}
                changeStatus={changeStatus}
                setResponse={setResponse}
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
