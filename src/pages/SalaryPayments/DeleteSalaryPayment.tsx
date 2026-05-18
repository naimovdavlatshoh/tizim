import  { useState } from "react";
import { PostSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    id: number;
}

export default function DeleteSalaryPayment({
    isOpen,
    onClose,
    changeStatus,
    id
}: DeleteModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await PostSimple(`api/user/salary-payments/delete/${id}`, {});

            if (response) {
                toast.success("Зарплата успешно удалена");
                onClose();
                changeStatus();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.response?.data?.error || "Ошибка при удалении"
            );
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
            <div className="p-8">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Подтверждение удаления
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить эту реальную зарплату? Это действие нельзя отменить.
                    </p>
                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 flex items-center gap-2"
                    >
                        {loading ? "Удаление..." : "Да, удалить"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
