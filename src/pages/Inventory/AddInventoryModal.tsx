import React, { useState, useEffect } from "react";
import { PostSimple, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import Select from "../../components/form/Select";

interface AddInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

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

export default function AddInventoryModal({
    isOpen,
    onClose,
    onSuccess,
}: AddInventoryModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        inventory_number: "",
        category_id: "",
        unit: "",
        quantity: "",
        user_id: "",
    });

    const [loading, setLoading] = useState(false);
    
    // User search state
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    // Categories state
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (isOpen) {
            searchUsers("");
            fetchCategories();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.inventory_number ||
            !formData.category_id ||
            !formData.unit ||
            !formData.quantity ||
            !formData.user_id
        ) {
            toast.error("Пожалуйста, заполните все поля");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                inventory_number: formData.inventory_number,
                category_id: Number(formData.category_id),
                unit: formData.unit,
                quantity: Number(formData.quantity),
                user_id: Number(formData.user_id),
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await PostSimple("api/inventory/items/create", payload);

            if (response) {
                toast.success("Инвентарь успешно добавлен");
                handleClose();
                if (onSuccess) onSuccess();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.response?.data?.error || "Ошибка при сохранении"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: "",
            inventory_number: "",
            category_id: "",
            unit: "",
            quantity: "",
            user_id: "",
        });
        setLoading(false);
        onClose();
    };

    const userOptions = filteredUsers.map((user) => ({
        value: user.user_id,
        label: `${user.firstname || ""} ${user.lastname || ""} ${user.fathername || ""}`.trim() || `Сотрудник #${user.user_id}`,
    }));

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
    }));

    const unitOptions = [
        { value: 'шт', label: 'Штука (шт)' },
        { value: 'кг', label: 'Килограмм (кг)' },
        { value: 'м', label: 'Метр (м)' },
        { value: 'л', label: 'Литр (л)' },
        { value: 'упак', label: 'Упаковка (упак)' }
    ];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Добавить инвентарь
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Название */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Название
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Введите название"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Инвентарный номер */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Инвентарный номер
                            </label>
                            <input
                                type="text"
                                value={formData.inventory_number}
                                onChange={(e) => setFormData({ ...formData, inventory_number: e.target.value })}
                                placeholder="Например: T1233"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Категория */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Категория
                            </label>
                            <Select
                                options={categoryOptions}
                                placeholder="Выберите категорию"
                                onChange={(value) => setFormData({ ...formData, category_id: value })}
                                className="w-full"
                                defaultValue={formData.category_id || ""}
                            />
                        </div>

                        {/* Сотрудник (user_id) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Сотрудник
                            </label>
                            <Select
                                options={userOptions}
                                placeholder="Выберите сотрудника"
                                onChange={(value) => setFormData({ ...formData, user_id: value })}
                                className="w-full"
                                defaultValue={formData.user_id || ""}
                                searchable={true}
                                onSearch={searchUsers}
                                searching={searchingUsers}
                            />
                        </div>

                        {/* Единица измерения */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Ед. изм.
                            </label>
                            <Select
                                options={unitOptions}
                                placeholder="Выберите ед. изм."
                                onChange={(value) => setFormData({ ...formData, unit: value })}
                                className="w-full"
                                defaultValue={formData.unit || ""}
                            />
                        </div>

                        {/* Количество */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Количество
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="Введите количество"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center gap-2"
                        >
                            {loading ? "Сохранение..." : "Сохранить"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
