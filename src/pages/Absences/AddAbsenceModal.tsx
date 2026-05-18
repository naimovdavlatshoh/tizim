import React, { useState, useEffect } from "react";
import { PostSimple, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker.tsx";

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

export default function AddAbsenceModal({
    isOpen,
    onClose,
    changeStatus,
}: AddModalProps) {
    const [formData, setFormData] = useState({
        user_id: "",
        absence_type: "",
        date_from: "",
        date_to: "",
    });
    
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.user_id || !formData.absence_type || !formData.date_from || !formData.date_to) {
            toast.error("Пожалуйста, заполните все поля");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                user_id: Number(formData.user_id),
                absence_type: formData.absence_type,
                date_from: formData.date_from,
                date_to: formData.date_to,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await PostSimple("api/user/employee-absences/create", payload);

            if (response) {
                toast.success("Запись успешно добавлена");
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
            absence_type: "",
            date_from: "",
            date_to: "",
        });
        setLoading(false);
        onClose();
    };

    const userOptions = filteredUsers.map((user) => ({
        value: user.user_id,
        label: `${user.firstname || ""} ${user.lastname || ""} ${user.fathername || ""}`.trim() || `Сотрудник #${user.user_id}`,
    }));

    const absenceTypeOptions = [
        { value: 'sick_leave', label: 'Больничный' },
        { value: 'day_off', label: 'Отпросился' },
        { value: 'business_trip', label: 'Командировка' },
        { value: 'vacation', label: 'Отпуск' }
    ];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Добавить запись (Отсутствие)
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Тип
                            </label>
                            <Select
                                options={absenceTypeOptions}
                                placeholder="Выберите тип"
                                onChange={(value) => setFormData({ ...formData, absence_type: value })}
                                className="w-full"
                                defaultValue={formData.absence_type}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="text-red-500">*</span> С даты
                                </label>
                                <DatePicker
                                    id="date_from"
                                    defaultDate={formData.date_from || undefined}
                                    onChange={(_dates, dateStr) => setFormData((prev) => ({ ...prev, date_from: dateStr }))}
                                    placeholder="Выберите дату"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    <span className="text-red-500">*</span> По дату
                                </label>
                                <DatePicker
                                    id="date_to"
                                    defaultDate={formData.date_to || undefined}
                                    onChange={(_dates, dateStr) => setFormData((prev) => ({ ...prev, date_to: dateStr }))}
                                    placeholder="Выберите дату"
                                />
                            </div>
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
