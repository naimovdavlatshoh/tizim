import React, { useState } from "react";
import { PostDataToken } from "../../service/data";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

interface SendResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractId: string;
    onSuccess?: () => void;
}

const SendResultModal: React.FC<SendResultModalProps> = ({
    isOpen,
    onClose,
    contractId,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== "application/pdf") {
                toast.error("Выберите файл в формате PDF");
                e.target.value = "";
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error("Выберите PDF файл");
            return;
        }

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("data", JSON.stringify({ contract_id: contractId }));
            formDataToSend.append("file", selectedFile);

            const response = await PostDataToken(
                "api/appointment/addresult",
                formDataToSend
            );

            if (response) {
                toast.success("Результаты успешно отправлены");
                onSuccess?.();
                onClose();
                setSelectedFile(null);
            }
        } catch (error: any) {
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
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Договор ID:{" "}
                        <span className="font-medium">{contractId}</span>
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        PDF файл *
                    </label>
                    <input
                        type="file"
                        accept=".pdf,application/pdf"
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


// salom tizim
