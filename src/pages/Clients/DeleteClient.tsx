// import React from "react";

import { useState } from "react";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { toast } from "react-hot-toast";

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    userName?: string;
    isDeleting?: boolean;
}

export default function DeleteUserModal({
    isOpen,
    onClose,
    onDelete,
    userName,
    isDeleting = false,
}: DeleteUserModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await onDelete();
            toast.success("Клиент успешно удален!");
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Удаление клиента
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Это действие нельзя отменить
                        </p>
                    </div>
                </div>

                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                    Вы уверены, что хотите удалить клиента{" "}
                    <span className="font-medium text-gray-800 dark:text-white">
                        {userName}
                    </span>
                    ?
                    <br />
                    <span className="text-red-600 dark:text-red-400 font-medium">
                        Все связанные данные будут также удалены.
                    </span>
                </p>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-4 py-2"
                        disabled={isLoading}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        className="px-4 py-2"
                        disabled={isLoading || isDeleting}
                    >
                        {isLoading || isDeleting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Удаление...
                            </div>
                        ) : (
                            "Удалить"
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
