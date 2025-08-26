import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableExpenseCategory from "./TableExpenseCategory.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal";
import AddExpenseCategoryModal from "./AddExpenseCategory";
import Loader from "../../components/ui/loader/Loader";

export default function ExpenseCategoryList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentPage === "expense-categories") {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchCategories();
            }
        }
    }, [searchQuery, currentPage, status, page]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/expensescategories/list?page=${page}&limit=10`
            );
            const categoriesData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredCategories(categoriesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Что-то пошло не так при загрузке категорий");
        }
    };

    const performSearch = async (query: string) => {
        if (!query.trim() || query.trim().length < 3) return;

        setIsSearching(true);
        try {
            const response: any = await PostSimple(
                `api/expensescategories/search?keyword=${encodeURIComponent(
                    query
                )}&page=${page}&limit=10`
            );

            if (response?.status === 200 || response?.data?.success) {
                const searchResults =
                    response?.data?.result || response?.result || [];
                const totalPagesData =
                    response?.data?.pages || response?.pages || 1;

                setFilteredCategories(searchResults);
                setTotalPages(totalPagesData);
            } else {
                fetchCategories();
            }
        } catch (error) {
            fetchCategories();
        } finally {
            setIsSearching(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleStatusChange = () => {
        setStatus(!status);
    };

    return (
        <>
            <PageMeta
                title="BNM Tizim"
                description="Список категорий расходов"
            />

            <PageBreadcrumb pageTitle="Категории расходов" />

            <div className="grid grid-cols-1 gap-6">
                <ComponentCard
                    title="Список категорий расходов"
                    desc={
                        <button
                            onClick={openModal}
                            className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            + Добавить категорию
                        </button>
                    }
                >
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            <TableExpenseCategory
                                categories={filteredCategories}
                                changeStatus={handleStatusChange}
                            />
                            <div className="mt-4">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </>
                    )}
                </ComponentCard>
            </div>

            <AddExpenseCategoryModal
                isOpen={isOpen}
                onClose={closeModal}
                onSuccess={handleStatusChange}
            />

            <Toaster position="bottom-right" reverseOrder={false} />
        </>
    );
}
