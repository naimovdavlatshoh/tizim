import { useState, useEffect } from "react";
import {
    PostSimple,
    GetDataSimple,
    PostDataTokenJson,
} from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import InputField from "../../components/form/input/InputField.tsx";
import Select from "../../components/form/Select.tsx";
import DatePicker from "../../components/form/date-picker.tsx";

interface AddProtocolModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
}

interface Client {
    client_id: number;
    client_name: string;
    business_name?: string;
}

export default function AddProtocolModal({
    isOpen,
    onClose,
    changeStatus,
}: AddProtocolModalProps) {
    const [formData, setFormData] = useState({
        client_id: 0,
        category_name: "",
        application_date: "",
        ispitani_date: "",
        sender_comments: "",
    });
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [searchingClients, setSearchingClients] = useState(false);

    useEffect(() => {
        if (isOpen) {
            searchClients("");
        }
    }, [isOpen]);

    useEffect(() => {
        setFilteredClients(clients);
    }, [clients]);

    const searchClients = async (keyword: string) => {
        setSearchingClients(true);

        try {
            if (keyword.trim().length === 0) {
                // Empty search - fetch all clients from backend
                const response = await GetDataSimple(
                    "api/clients/list?page=1&limit=100"
                );
                const allClients =
                    response?.result || response?.data?.result || [];
                setClients(allClients);
                setFilteredClients(allClients);
            } else if (keyword.trim().length >= 3) {
                // Search with keyword - 3 or more characters
                const response: any = await PostDataTokenJson(
                    `api/clients/search?keyword=${encodeURIComponent(keyword)}`,
                    {}
                );
                const searchResults =
                    response?.data?.result || response?.result || [];
                setFilteredClients(searchResults);
            } else {
                // Less than 3 characters - show current clients
                setFilteredClients(clients);
            }
        } catch (error: any) {
            console.error("Error searching/fetching clients:", error);
            toast.error("Ошибка при загрузке клиентов");
            // Fallback to showing current clients
            setFilteredClients(clients);
        } finally {
            setSearchingClients(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.client_id ||
            !formData.category_name ||
            !formData.application_date ||
            !formData.ispitani_date
        ) {
            onClose();
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        setLoading(true);
        try {
            const response: any = await PostSimple("api/protocol/create", {
                client_id: formData.client_id,
                category_name: formData.category_name,
                application_date: formData.application_date,
                test_date: formData.ispitani_date,
                sender_comments: formData.sender_comments || "",
            });

            if (response) {
                toast.success("Протокол успешно создан");
                setFormData({
                    client_id: 0,
                    category_name: "",
                    application_date: "",
                    ispitani_date: "",
                    sender_comments: "",
                });
                changeStatus();
                onClose();
            }
        } catch (error: any) {
            onClose();
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при создании протокола"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            client_id: 0,
            category_name: "",
            application_date: "",
            ispitani_date: "",
            sender_comments: "",
        });
        setLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Добавить новый протокол
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Клиент
                            </label>
                            <Select
                                options={filteredClients.map((client) => ({
                                    value: client.client_id,
                                    label: client?.business_name
                                        ? `${client.business_name} ${client.client_name}`
                                        : client.client_name,
                                }))}
                                placeholder="Выберите клиента"
                                onChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        client_id: Number(value),
                                    })
                                }
                                className="dark:bg-dark-900"
                                defaultValue=""
                                searchable={true}
                                onSearch={searchClients}
                                searching={searchingClients}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span>{" "}
                                Категория
                            </label>
                            <InputField
                                type="text"
                                value={formData.category_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        category_name: e.target.value,
                                    })
                                }
                                placeholder="Например: Кубик"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <DatePicker
                                id="application-date"
                                label="Дата заявки *"
                                placeholder="Выберите дату заявки"
                                onChange={(selectedDates) => {
                                    if (selectedDates[0]) {
                                        const date = new Date(selectedDates[0]);
                                        const year = date.getFullYear();
                                        const month = String(
                                            date.getMonth() + 1
                                        ).padStart(2, "0");
                                        const day = String(
                                            date.getDate()
                                        ).padStart(2, "0");
                                        const formattedDate = `${year}-${month}-${day}`;
                                        setFormData({
                                            ...formData,
                                            application_date: formattedDate,
                                        });
                                    }
                                }}
                                defaultDate={
                                    formData.application_date
                                        ? new Date(formData.application_date)
                                        : undefined
                                }
                            />
                        </div>

                        <div>
                            <DatePicker
                                id="ispitani-date"
                                label="Дата испытания *"
                                placeholder="Выберите дату испытания"
                                onChange={(selectedDates) => {
                                    if (selectedDates[0]) {
                                        const date = new Date(selectedDates[0]);
                                        const year = date.getFullYear();
                                        const month = String(
                                            date.getMonth() + 1
                                        ).padStart(2, "0");
                                        const day = String(
                                            date.getDate()
                                        ).padStart(2, "0");
                                        const formattedDate = `${year}-${month}-${day}`;
                                        setFormData({
                                            ...formData,
                                            ispitani_date: formattedDate,
                                        });
                                    }
                                }}
                                defaultDate={
                                    formData.ispitani_date
                                        ? new Date(formData.ispitani_date)
                                        : undefined
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Комментарии отправителя
                            </label>
                            <textarea
                                value={formData.sender_comments}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sender_comments: e.target.value,
                                    })
                                }
                                placeholder="Введите комментарии..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Создание..." : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
