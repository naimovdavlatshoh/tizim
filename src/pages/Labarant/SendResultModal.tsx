import React, { useState, useEffect } from "react";
import { GetDataSimple, PostDataToken } from "../../service/data";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

interface SendResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractId: string;
    onSuccess?: () => void;
}

interface Director {
    user_id: number;
    fullname: string;
}

const SendResultModal: React.FC<SendResultModalProps> = ({
    isOpen,
    onClose,
    contractId,
    onSuccess,
}) => {
    const [directors, setDirectors] = useState<Director[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        to_user_id: "",
        comments: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchDirectors();
        }
    }, [isOpen]);

    const fetchDirectors = async () => {
        GetDataSimple(`api/appointment/director/list`).then((res) =>
            setDirectors(res.result)
        );
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.to_user_id || !formData.comments || !selectedFile) {
            toast.error(
                "Пожалуйста, заполните все обязательные поля и выберите файл"
            );
            return;
        }

        setLoading(true);
        try {
            // Create FormData
            const formDataToSend = new FormData();

            // Create data object
            const data = {
                contract_id: contractId,
                to_user_id: formData.to_user_id,
                comments: formData.comments,
            };

            // Append data as JSON string
            formDataToSend.append("data", JSON.stringify(data));
            formDataToSend.append("file", selectedFile);

            const response = await PostDataToken(
                "api/appointment/addresult",
                formDataToSend
            );

            if (response) {
                toast.success("Результаты успешно отправлены директору");
                onSuccess?.();
                onClose();
                // Reset form
                setFormData({
                    to_user_id: "",
                    comments: "",
                });
                setSelectedFile(null);
            }
        } catch (error: any) {
            onClose();
            toast.error(error.response?.data?.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md mx-4">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Отправить результаты
                </h3>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Contract Info */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Договор ID:{" "}
                        <span className="font-medium">{contractId}</span>
                    </p>
                </div>

                {/* Director Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Выберите директора *
                    </label>
                    <select
                        value={formData.to_user_id}
                        onChange={(e) =>
                            handleInputChange("to_user_id", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Выберите директора</option>
                        {directors.map((director) => (
                            <option
                                key={director.user_id}
                                value={director.user_id}
                            >
                                {director.fullname}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Comments */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Комментарии *
                    </label>
                    <textarea
                        value={formData.comments}
                        onChange={(e) =>
                            handleInputChange("comments", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Введите комментарии к результатам..."
                        required
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Файл с результатами *
                    </label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400"
                        required
                    />
                    {selectedFile && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Выбран файл: {selectedFile.name}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Отмена
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Отправка..." : "Отправить"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default SendResultModal;
