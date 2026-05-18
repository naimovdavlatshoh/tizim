import React, { useState, useEffect } from "react";
import { PostSimple, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import InputField from "../../components/form/input/InputField.tsx";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker.tsx";

interface AddAttendanceModalProps {
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

export default function AddAttendanceModal({
    isOpen,
    onClose,
    changeStatus,
}: AddAttendanceModalProps) {
    const [formData, setFormData] = useState({
        employee_id: "",
        date: "",
        time: "",
        attendance_type: 1, // 1- Вход, 2-Выход
    });
    
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            searchUsers("");
            // Set default date to today
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const day = today.getDate().toString().padStart(2, "0");
            setFormData(prev => ({ ...prev, date: `${year}-${month}-${day}` }));
        }
    }, [isOpen]);

    const searchUsers = async (keyword: string) => {
        setSearchingUsers(true);
        try {
            if (keyword.trim().length === 0) {
                const response: any = await GetDataSimple("api/user/list?page=1&limit=100");
                const allUsers = response?.result || response?.data?.result || [];
                setUsers(allUsers);
                setFilteredUsers(allUsers);
            } else if (keyword.trim().length >= 3) {
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

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let cleaned = value.replace(/[^\d]/g, '');
        
        if (cleaned.length === 1 && parseInt(cleaned) > 2) {
            cleaned = '0' + cleaned;
        } else if (cleaned.length >= 2) {
            const hours = parseInt(cleaned.substring(0, 2));
            if (hours > 23) {
                cleaned = '23' + cleaned.substring(2);
            }
        }
        
        if (cleaned.length === 3 && parseInt(cleaned[2]) > 5) {
            cleaned = cleaned.substring(0, 2) + '0' + cleaned[2];
        } else if (cleaned.length >= 4) {
            const minutes = parseInt(cleaned.substring(2, 4));
            if (minutes > 59) {
                cleaned = cleaned.substring(0, 2) + '59';
            }
        }

        if (cleaned.length > 4) {
            cleaned = cleaned.substring(0, 4);
        }
        
        let formatted = cleaned;
        if (cleaned.length >= 3) {
            formatted = cleaned.substring(0, 2) + ':' + cleaned.substring(2);
        }
        
        setFormData({ ...formData, time: formatted });
    };

    const handleDateChange = (dates: Date[], currentDateString: string) => {
        if (currentDateString) {
            setFormData({ ...formData, date: currentDateString });
        } else if (dates && dates[0]) {
            const date = new Date(dates[0]);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            setFormData({ ...formData, date: `${year}-${month}-${day}` });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.employee_id || !formData.date || !formData.time || !formData.attendance_type) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(formData.time)) {
            toast.error("Неверный формат времени (HH:MM)");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                employee_id: Number(formData.employee_id),
                date: formData.date,
                time: formData.time,
                attendance_type: Number(formData.attendance_type),
            };

            const response: any = await PostSimple("api/faceid/attendance/manual", payload);

            if (response) {
                toast.success("Успешно добавлено");
                setFormData({
                    employee_id: "",
                    date: "",
                    time: "",
                    attendance_type: 1,
                });
                changeStatus();
                onClose();
            }
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.response?.data?.error || "Что-то пошло не так"
            );
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            employee_id: "",
            date: "",
            time: "",
            attendance_type: 1,
        });
        setLoading(false);
        onClose();
    };

    const userOptions = filteredUsers.map((user) => ({
        value: user.user_id,
        label: `${user.firstname || ""} ${user.lastname || ""} ${user.fathername || ""}`.trim() || `Пользователь #${user.user_id}`,
    }));

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Ручное добавление посещаемости
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
                                onChange={(value) => setFormData({ ...formData, employee_id: value })}
                                className="w-full"
                                defaultValue={formData.employee_id || ""}
                                searchable={true}
                                onSearch={searchUsers}
                                searching={searchingUsers}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Дата
                            </label>
                            <DatePicker
                                id="manual-attendance-date"
                                label=""
                                placeholder="Выберите дату"
                                onChange={handleDateChange}
                                defaultDate={formData.date ? new Date(formData.date) : new Date()}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Время
                            </label>
                            <InputField
                                type="text"
                                value={formData.time}
                                onChange={handleTimeChange}
                                placeholder="00:00"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Тип
                            </label>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="attendance_type"
                                        value={1}
                                        checked={formData.attendance_type === 1}
                                        onChange={() => setFormData({ ...formData, attendance_type: 1 })}
                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-0 focus:ring-offset-0 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">Вход</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="attendance_type"
                                        value={2}
                                        checked={formData.attendance_type === 2}
                                        onChange={() => setFormData({ ...formData, attendance_type: 2 })}
                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-0 focus:ring-offset-0 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className="ml-2 text-gray-700 dark:text-gray-300">Выход</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Сохранение...
                                </>
                            ) : (
                                "Сохранить"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
