// import React from "react";

import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    userName?: string;
}

export default function DeleteUserModal({
    isOpen,
    onClose,
    onDelete,
    userName,
}: DeleteUserModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[700px] p-6 lg:p-10"
        >
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Удаление пользователя
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Вы уверены, что хотите удалить пользователя{" "}
                    <span className="font-medium">{userName}</span>?
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button variant="danger" onClick={onDelete}>
                        Удалить
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
