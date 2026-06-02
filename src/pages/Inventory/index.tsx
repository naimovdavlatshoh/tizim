import { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { Toaster, toast } from "react-hot-toast";
import TableInventory, { InventoryItem } from "./TableInventory.tsx";
import CategoryModal from "./CategoryModal.tsx";
import AddInventoryModal from "./AddInventoryModal.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import Loader from "../../components/ui/loader/Loader.tsx";
import Select from "../../components/form/Select";

interface User {
    user_id: number;
    firstname: string;
    lastname: string;
    fathername: string;
}

interface Category {
    id: number;
    name: string;
}

export default function InventoryList() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);

    // Filters
    const [categoryId, setCategoryId] = useState("");
    const [userId, setUserId] = useState("");

    const [categories, setCategories] = useState<Category[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    const fetchCategories = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await GetDataSimple("api/inventory/categories");
            const data = response?.result || response?.data?.result || response?.data || response || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const searchUsers = async (keyword: string) => {
        setSearchingUsers(true);
        try {
            if (keyword.trim().length === 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response: any = await GetDataSimple("api/user/list?page=1&limit=100");
                const allUsers = response?.result || response?.data?.result || [];
                setUsers(allUsers);
                setFilteredUsers(allUsers);
            } else if (keyword.trim().length >= 3) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response: any = await PostSimple(`api/user/search?keyword=${encodeURIComponent(keyword)}`);
                const searchResults = response?.data?.result || response?.data || [];
                setFilteredUsers(Array.isArray(searchResults) ? searchResults : []);
            } else {
                setFilteredUsers(users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setFilteredUsers(users);
        } finally {
            setSearchingUsers(false);
        }
    };

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            let url = `api/inventory/items?page=${page}&limit=30`;
            if (categoryId) url += `&category_id=${categoryId}`;
            if (userId) url += `&user_id=${userId}`;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await GetDataSimple(url);
            const data = response?.result || response?.data?.result || response?.data || response || [];
            const pages = response?.pages || response?.data?.pages || 1;

            setItems(Array.isArray(data) ? data : []);
            setTotalPages(pages);
        } catch (error: any) {
            console.error("Error fetching items:", error);
            toast.error(error?.response?.data?.message || "Ошибка загрузки инвентаря");
        } finally {
            setLoading(false);
        }
    }, [page, categoryId, userId]);

    useEffect(() => {
        fetchCategories();
        searchUsers("");
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
    }));

    const userOptions = filteredUsers.map((user) => ({
        value: user.user_id,
        label: `${user.firstname || ""} ${user.lastname || ""} ${user.fathername || ""}`.trim() || `Сотрудник #${user.user_id}`,
    }));

    return (
        <>
            <PageMeta title="BNM Tizim" description="Инвентаризация" />
            <PageBreadcrumb pageTitle="Инвентаризация" />

            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <div className="w-full md:w-64">
                    <Select
                        options={categoryOptions}
                        placeholder="Все категории"
                        onChange={(value) => {
                            setCategoryId(value);
                            setPage(1);
                        }}
                        className="w-full"
                        defaultValue={categoryId}
                    />
                </div>
                <div className="w-full md:w-64">
                    <Select
                        options={userOptions}
                        placeholder="Все сотрудники"
                        onChange={(value) => {
                            setUserId(value);
                            setPage(1);
                        }}
                        className="w-full"
                        defaultValue={userId}
                        searchable={true}
                        onSearch={searchUsers}
                        searching={searchingUsers}
                    />
                </div>
            </div>

            <ComponentCard
                title="Список инвентаря"
                desc={
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Добавить категорию
                        </button>
                        <button
                            onClick={() => setIsAddInventoryModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Добавить инвентарь
                        </button>
                    </div>
                }
            >
                {loading && items.length === 0 ? (
                    <div className="flex justify-center py-8"><Loader /></div>
                ) : (
                    <TableInventory items={items} onRefresh={fetchItems} />
                )}

                {totalPages > 1 && (
                    <div className="mt-4">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </ComponentCard>

            <CategoryModal 
                isOpen={isCategoryModalOpen} 
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    fetchCategories(); // refresh categories in filters if changed
                }} 
            />

            <AddInventoryModal
                isOpen={isAddInventoryModalOpen}
                onClose={() => setIsAddInventoryModalOpen(false)}
                onSuccess={() => {
                    fetchItems();
                }}
            />

            <Toaster position="bottom-right" />
        </>
    );
}
