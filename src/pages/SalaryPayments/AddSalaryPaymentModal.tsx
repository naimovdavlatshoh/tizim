import React, { useState, useEffect } from "react";
import { PostSimple, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import InputField from "../../components/form/input/InputField.tsx";
import Select from "../../components/form/Select";

interface AddModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
}

interface User {
    user_id: number;
    firstname: string;
    lastname: string;
    fathername: string;
}

export default function AddSalaryPaymentModal({
    isOpen,
    onClose,
    changeStatus,
}: AddModalProps) {
    const [formData, setFormData] = useState({
        user_id: "",
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString(),
        amount: "",
        payment_type: "cash",
    });

    const [displayAmount, setDisplayAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            searchUsers("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

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

    const formatNumberWithSpaces = (value: string) => {
        const cleanValue = value.replace(/\s/g, "");
        const parts = cleanValue.split(".");
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const cleanValue = value.replace(/[^0-9.\s]/g, "");
        const numericValue = cleanValue.replace(/\s/g, "");

        const parts = numericValue.split(".");
        if (parts.length > 2 || (parts[1] && parts[1].length > 2)) {
            return;
        }

        setDisplayAmount(formatNumberWithSpaces(numericValue));
        setFormData({ ...formData, amount: numericValue });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.user_id || !formData.year || !formData.month || !formData.amount || !formData.payment_type) {
            toast.error("Пожалуйста, заполните все поля");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                user_id: Number(formData.user_id),
                year: formData.year,
                month: Number(formData.month),
                amount: Number(formData.amount),
                payment_type: formData.payment_type,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await PostSimple("api/user/salary-payments/create", payload);

            if (response) {
                toast.success("Зарплата успешно добавлена");
                handleClose();
                changeStatus();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.response?.data?.error || "Ошибка при сохранении"
            );
            handleClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            user_id: "",
            year: new Date().getFullYear().toString(),
            month: (new Date().getMonth() + 1).toString(),
            amount: "",
            payment_type: "cash",
        });
        setDisplayAmount("");
        setLoading(false);
        onClose();
    };

    const userOptions = filteredUsers.map((user) => ({
        value: user.user_id,
        label: `${user.firstname || ""} ${user.lastname || ""} ${user.fathername || ""}`.trim() || `Сотрудник #${user.user_id}`,
    }));

    const monthOptions = [
        { value: "1", label: "Январь" }, { value: "2", label: "Февраль" },
        { value: "3", label: "Март" }, { value: "4", label: "Апрель" },
        { value: "5", label: "Май" }, { value: "6", label: "Июнь" },
        { value: "7", label: "Июль" }, { value: "8", label: "Август" },
        { value: "9", label: "Сентябрь" }, { value: "10", label: "Октябрь" },
        { value: "11", label: "Ноябрь" }, { value: "12", label: "Декабрь" },
    ];

    const paymentTypeOptions = [
        { value: "cash", label: "Наличка" },
        { value: "card", label: "На карту" },
    ];

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => ({
        value: (currentYear - i).toString(),
        label: (currentYear - i).toString()
    }));

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Добавить зарплату
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="text-red-500">*</span> Год
                                </label>
                                <Select
                                    options={yearOptions}
                                    placeholder="Год"
                                    onChange={(value) => setFormData({ ...formData, year: value })}
                                    className="w-full"
                                    defaultValue={formData.year}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="text-red-500">*</span> Месяц
                                </label>
                                <Select
                                    options={monthOptions}
                                    placeholder="Месяц"
                                    onChange={(value) => setFormData({ ...formData, month: value })}
                                    className="w-full"
                                    defaultValue={formData.month}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Тип оплаты
                            </label>
                            <Select
                                options={paymentTypeOptions}
                                placeholder="Выберите тип оплаты"
                                onChange={(value) => setFormData({ ...formData, payment_type: value })}
                                className="w-full"
                                defaultValue={formData.payment_type}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Сумма
                            </label>
                            <InputField
                                type="text"
                                value={displayAmount}
                                onChange={handleAmountChange}
                                placeholder="Введите сумму"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                required
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