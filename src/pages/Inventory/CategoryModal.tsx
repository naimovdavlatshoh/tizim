import { useState, useEffect } from "react";
import { PostSimple, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import Loader from "../../components/ui/loader/Loader.tsx";
import { TrashBinIcon } from "../../icons/index.ts";

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Category {
    id: number;
    name: string;
}

export default function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategories = async () => {
        setFetching(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await GetDataSimple("api/inventory/categories");
            const data = response?.result || response?.data?.result || response?.data || response || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const handleAdd = async () => {
        if (!newCategory.trim()) {
            toast.error("Введите название категории");
            return;
        }

        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await PostSimple("api/inventory/categories/create", {
                name: newCategory.trim()
            });

            if (response) {
                toast.success("Категория добавлена");
                setNewCategory("");
                fetchCategories();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.response?.data?.error || "Ошибка при добавлении"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        setIsDeleting(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await PostSimple(`api/inventory/categories/delete/${deletingId}`);

            if (response) {
                toast.success("Категория удалена");
                setIsConfirmOpen(false);
                setDeletingId(null);
                fetchCategories();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.response?.data?.error || "Ошибка при удалении"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
            <div className="p-6 md:p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Категории инвентаря
                    </h3>
                </div>

                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Название категории"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleAdd();
                        }}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center min-w-[48px]"
                    >
                        {loading ? "..." : "+"}
                    </button>
                </div>

                <div className="max-h-60 overflow-y-auto pr-2">
                    {fetching ? (
                        <div className="flex justify-center py-4"><Loader /></div>
                    ) : categories.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {categories.map((cat, index) => (
                                <li key={cat.id || index} className="py-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center group">
                                    <span>{cat.name}</span>
                                    <button 
                                        onClick={() => {
                                            setDeletingId(cat.id);
                                            setIsConfirmOpen(true);
                                        }}
                                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded dark:hover:bg-red-900/30"
                                        title="Удалить"
                                    >
                                        <TrashBinIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                            Категории не найдены
                        </div>
                    )}
                </div>
            </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isConfirmOpen} onClose={() => !isDeleting && setIsConfirmOpen(false)}>
                <div className="p-6 md:p-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Удаление категории
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить эту категорию? Это действие нельзя отменить.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
