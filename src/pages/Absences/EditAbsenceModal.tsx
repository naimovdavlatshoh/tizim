import React, { useState, useEffect } from "react";
import { PostSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker.tsx";

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    absence: any;
}

export default function EditAbsenceModal({
    isOpen,
    onClose,
    changeStatus,
    absence
}: EditModalProps) {
    const [formData, setFormData] = useState({
        absence_type: "",
        date_from: "",
        date_to: "",
    });
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (absence && isOpen) {
            setFormData({
                absence_type: absence.absence_type || "",
                date_from: absence.date_from || "",
                date_to: absence.date_to || "",
            });
        }
    }, [absence, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.absence_type || !formData.date_from || !formData.date_to) {
            toast.error("Пожалуйста, заполните все поля");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                absence_type: formData.absence_type,
                date_from: formData.date_from,
                date_to: formData.date_to,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await PostSimple(`api/user/employee-absences/update/${absence.id}`, payload);

            if (response) {
                toast.success("Запись успешно обновлена");
                onClose();
                changeStatus();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.response?.data?.error || "Ошибка при обновлении"
            );
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const absenceTypeOptions = [
        { value: 'sick_leave', label: 'Больничный' },
        { value: 'day_off', label: 'Отпросился' },
        { value: 'business_trip', label: 'Командировка' },
        { value: 'vacation', label: 'Отпуск' }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Обновить запись (Отсутствие)
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
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
                                    id="edit_date_from"
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
                                    id="edit_date_to"
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
                            onClick={onClose}
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
                            {loading ? "Сохранение..." : "Обновить"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
