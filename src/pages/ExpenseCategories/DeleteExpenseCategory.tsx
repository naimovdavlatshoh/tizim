import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";

interface DeleteExpenseCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    categoryName: string;
}

export default function DeleteExpenseCategoryModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    categoryName,
}: DeleteExpenseCategoryModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900">
                    <svg
                        className="w-6 h-6 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Удалить категорию
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Вы уверены, что хотите удалить категорию "{categoryName}"?
                    <br />
                    Это действие нельзя отменить.
                </p>

                <div className="flex justify-center space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-6 py-2.5"
                    >
                        Отмена
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-6 py-2.5"
                    >
                        {isDeleting ? "Удаление..." : "Удалить"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
