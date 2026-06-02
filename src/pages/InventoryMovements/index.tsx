import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Select from "../../components/form/Select.tsx";
import Pagination from "../../components/common/Pagination.tsx";
import Loader from "../../components/ui/loader/Loader.tsx";
import { toast } from "react-hot-toast";

interface Movement {
    id: number;
    movement_type: "add" | "write_off" | "transfer" | string;
    quantity: string;
    item_name: string;
    unit: string;
    inventory_number: string;
    from_user_name: string | null;
    to_user_name: string | null;
    reason: string | null;
    admin_name: string;
    created_at: string;
}

export default function InventoryMovements() {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterType, setFilterType] = useState("");
    const [filterItemId, setFilterItemId] = useState("");
    const [filterUserId, setFilterUserId] = useState("");
    const [usersList, setUsersList] = useState<any[]>([]);
    const [itemsList, setItemsList] = useState<any[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    const searchUsers = async (keyword: string) => {
        setSearchingUsers(true);
        try {
            if (keyword.trim().length === 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response: any = await GetDataSimple("api/user/list?page=1&limit=100");
                const allUsers = response?.result || response?.data?.result || response?.data || response || [];
                setUsersList(Array.isArray(allUsers) ? allUsers : []);
            } else if (keyword.trim().length >= 3) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response: any = await PostSimple(`api/user/search?keyword=${encodeURIComponent(keyword)}`);
                const searchResults = response?.data?.result || response?.data || [];
                setUsersList(Array.isArray(searchResults) ? searchResults : []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setSearchingUsers(false);
        }
    };

    useEffect(() => {
        // Fetch Users initially
        searchUsers("");

        // Fetch Items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GetDataSimple("api/inventory/items?page=1&limit=500").then((res: any) => {
            const data = res?.result || res?.data?.result || res?.data || res || [];
            if (Array.isArray(data)) setItemsList(data);
        }).catch(console.error);
    }, []);

    const fetchMovements = useCallback(async () => {
        setLoading(true);
        try {
            let url = `api/inventory/movements?page=${page}&limit=20`;
            if (filterType) url += `&movement_type=${filterType}`;
            if (filterItemId) url += `&item_id=${filterItemId}`;
            if (filterUserId) url += `&user_id=${filterUserId}`;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await GetDataSimple(url);
            const data = response?.result || response?.data?.result || response?.data || response || [];
            const pages = response?.pages || response?.data?.pages || 1;

            setMovements(Array.isArray(data) ? data : []);
            setTotalPages(pages);
        } catch (error: any) {
            console.error("Error fetching movements:", error);
            toast.error(error?.response?.data?.message || "Ошибка загрузки истории");
        } finally {
            setLoading(false);
        }
    }, [page, filterType, filterItemId, filterUserId]);

    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);

    const formatType = (type: string) => {
        switch (type) {
            case "add": return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Добавление</span>;
            case "write_off": return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Списание</span>;
            case "transfer": return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Перемещение</span>;
            default: return type;
        }
    };

    const typeOptions = [
        { value: "", label: "Все типы движений" },
        { value: "add", label: "Добавление" },
        { value: "write_off", label: "Списание" },
        { value: "transfer", label: "Перемещение" }
    ];

    const itemOptions = [
        { value: "", label: "Все инвентари" },
        ...itemsList.map((item: any) => ({
            value: String(item.id),
            label: `${item.name} ${item.inventory_number ? `(${item.inventory_number})` : ''}`
        }))
    ];

    const userOptions = [
        { value: "", label: "Все пользователи" },
        ...usersList.map((user: any) => {
            const firstName = user.firstname || user.first_name || '';
            const lastName = user.lastname || user.last_name || '';
            return {
                value: String(user.user_id || user.id),
                label: `${firstName} ${lastName} ${user.full_name ? `(${user.full_name})` : ''}`.trim()
            };
        })
    ];

    return (
        <>
            <PageMeta title="BNM Tizim" description="Списание" />
            <PageBreadcrumb pageTitle="Списание" />

            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <div className="w-[200px] z-[100]">
                    <Select
                        options={typeOptions}
                        defaultValue={filterType}
                        onChange={(val) => {
                            setFilterType(val);
                            setPage(1);
                        }}
                        placeholder="Все типы движений"
                    />
                </div>

                <div className="w-[250px] z-[100]">
                    <Select
                        searchable
                        options={itemOptions}
                        defaultValue={filterItemId}
                        onChange={(val) => {
                            setFilterItemId(val);
                            setPage(1);
                        }}
                        placeholder="Выберите инвентарь"
                    />
                </div>

                <div className="w-[250px] z-[100]">
                    <Select
                        searchable
                        onSearch={searchUsers}
                        searching={searchingUsers}
                        options={userOptions}
                        defaultValue={filterUserId}
                        onChange={(val) => {
                            setFilterUserId(val);
                            setPage(1);
                        }}
                        placeholder="Выберите пользователя"
                    />
                </div>
            </div>

            <ComponentCard title="Списание инвентаря">
                {loading && movements.length === 0 ? (
                    <div className="flex justify-center py-8"><Loader /></div>
                ) : movements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Записи не найдены
                    </div>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
                        <table className="w-full table-auto min-w-[640px]">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">#</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Инвентарь</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Тип</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Кол-во</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">От кого</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Кому</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Ответственный</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Причина</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Дата</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {movements.map((move, index) => {
                                    return (
                                        <tr key={move.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{index + 1 + (page - 1) * 20}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                                {move.item_name} <span className="text-gray-500 text-xs">({move.inventory_number})</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatType(move.movement_type)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                {move.quantity ? Number(move.quantity) : 0} {move.unit}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{move.from_user_name || "-"}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{move.to_user_name || "-"}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{move.admin_name || "-"}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{move.reason || "-"}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                {move.created_at ? new Date(move.created_at).toLocaleString() : "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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
        </>
    );
}
