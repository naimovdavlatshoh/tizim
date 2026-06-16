import { useState } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { FaBan } from "react-icons/fa";

interface TerminateContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractNumber?: string;
    contractId?: number;
    onSuccess: () => void;
}

export default function TerminateContractModal({
    isOpen,
    onClose,
    contractNumber,
    contractId,
    onSuccess,
}: TerminateContractModalProps) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleClose = () => {
        setReason("");
        setError("");
        onClose();
    };

    const handleTerminate = async () => {
        if (!contractId) return;

        if (reason.trim().length < 3) {
            setError("Укажите причину расторжения (минимум 3 символа)");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("jwt");
            const apiKey = import.meta.env.VITE_API_KEY;

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/contracts/terminate/${contractId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        "X-API-KEY": apiKey,
                    },
                    body: JSON.stringify({ reason: reason.trim() }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data?.message || data?.error || "Ошибка при расторжении");
                return;
            }

            onSuccess();
            handleClose();
        } catch {
            setError("Ошибка сети. Попробуйте снова.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md w-full">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
                        <FaBan className="text-red-600 dark:text-red-400 size-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                            Расторжение договора
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            № {contractNumber}
                        </p>
                    </div>
                </div>

                {/* Warning */}
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                        Это действие нельзя отменить. Все неоплаченные платежи
                        будут аннулированы.
                    </p>
                </div>

                {/* Reason input */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Причина расторжения{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            if (error) setError("");
                        }}
                        rows={3}
                        placeholder="Укажите причину расторжения договора..."
                        className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors resize-none
                            bg-white dark:bg-gray-900
                            text-gray-800 dark:text-gray-100
                            placeholder-gray-400 dark:placeholder-gray-600
                            focus:outline-none focus:ring-2 focus:ring-red-500/30
                            ${
                                error
                                    ? "border-red-400 dark:border-red-600"
                                    : "border-gray-300 dark:border-gray-700 focus:border-red-400"
                            }`}
                    />
                    {error && (
                        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                        {reason.trim().length}/512 символов
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={handleTerminate}
                        disabled={loading || reason.trim().length < 3}
                    >
                        {loading ? "Расторгаем..." : "Расторгнуть"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}