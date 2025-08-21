import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableContract from "./TableContract.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";

export default function ContractList() {
    const navigate = useNavigate();
    const { searchQuery, currentPage, isSearching, setIsSearching } =
        useSearch();
    const [contracts, setContracts] = useState([]);
    const [filteredContracts, setFilteredContracts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    // const [response, setResponse] = useState("");
    console.log(contracts);
    

    useEffect(() => {
        if (currentPage === "contracts") {
            if (searchQuery.trim()) {
                // Search query bo'lsa search API ni chaqirish
                performSearch(searchQuery);
            } else {
                // Search query bo'lmasa oddiy list ni yuklash
                fetchContracts();
            }
        }
    }, [searchQuery, currentPage, status, page]);

    const fetchContracts = async () => {
        try {
            const response: any = await GetDataSimple(
                `api/contracts/list?page=${page}&limit=10`
            );
            const contractsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setContracts(contractsData);
            setFilteredContracts(contractsData);
            setTotalPages(totalPagesData);
        } catch (error) {
            console.error("Error fetching contracts:", error);
            toast.error("Ошибка при загрузке контрактов");
        }
    };

    const performSearch = async (query: string) => {
        if (!query.trim() || query.trim().length < 3) return;

        setIsSearching(true);
        try {
            // Search API ni chaqirish (POST request with URL params)
            const response: any = await PostSimple(
                `api/contracts/search?keyword=${encodeURIComponent(
                    query
                )}&page=${page}&limit=10`
            );

            if (response?.status === 200 || response?.data?.success) {
                const searchResults =
                    response?.data?.result || response?.result || [];
                const totalPagesData =
                    response?.data?.pages || response?.pages || 1;

                setFilteredContracts(searchResults);
                setTotalPages(totalPagesData);

                // if (searchResults.length === 0) {
                //     toast.success(`Поиск не дал результатов для: "${query}"`);
                // }
            } else {
                toast.error("Ошибка при поиске контрактов");
                // Search xatoligida oddiy list ni yuklash
                fetchContracts();
            }
        } catch (error) {
            console.error("Error searching contracts:", error);
            toast.error("Ошибка при поиске контрактов");
            // Search xatoligida oddiy list ni yuklash
            fetchContracts();
        } finally {
            setIsSearching(false);
        }
    };

    const changeStatus = () => {
        setStatus(!status);
    };

    const handleAddContract = () => {
        navigate("/contracts/add");
    };

    return (
        <>
            <PageMeta
                title="Контракты"
                description="Список контрактов с поиском"
            />
            <PageBreadcrumb pageTitle="Контракты" />
            <div className="space-y-6">
                <ComponentCard
                    title="Контракты"
                    desc={
                        <button
                            onClick={handleAddContract}
                            className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            + Добавить контракт
                        </button>
                    }
                >
                    {/* Search Results Info */}
                    {searchQuery && currentPage === "contracts" && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                                        Результаты поиска
                                    </h3>
                                    <p className="text-blue-700 dark:text-blue-300">
                                        Поиск по запросу:{" "}
                                        <span className="font-semibold">
                                            "{searchQuery}"
                                        </span>
                                    </p>
                                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                                        Найдено: {filteredContracts.length}{" "}
                                        контрактов
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        // Search ni tozalash
                                        window.location.reload();
                                    }}
                                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 rounded-md transition-colors"
                                >
                                    Очистить поиск
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading indicator */}
                    {isSearching && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                <span className="text-yellow-800 dark:text-yellow-200">
                                    Поиск...
                                </span>
                            </div>
                        </div>
                    )}

                    <TableContract
                        contracts={filteredContracts}
                        changeStatus={changeStatus}
                    />

                    {!isSearching && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </ComponentCard>
            </div>

            <Toaster position="top-right" reverseOrder={false} />
        </>
    );
}
