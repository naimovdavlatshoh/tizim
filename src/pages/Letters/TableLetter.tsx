import { useState, useRef } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import {
    PostSimple,
    GetDataSimple,
    PostSimpleFormData,
    GetDataSimplePDF,
} from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import { TrashBinIcon } from "../../icons/index.ts";

interface Letter {
    letter_id: number;
    letter_number: string;
    send_to: string;
    letter_status: number;
    letter_status_text: string;
    user_name: string;
    created_at: string;
}

interface TableLetterProps {
    letters: Letter[];
    changeStatus: () => void;
}

export default function TableLetter({
    letters,
    changeStatus,
}: TableLetterProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

    // Get user role from localStorage
    const userRole = parseInt(localStorage.getItem("role_id") || "0");
    const canDelete = userRole === 1;
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [loadingQr, setLoadingQr] = useState(false);
    const [selectedLetterForQr, setSelectedLetterForQr] =
        useState<Letter | null>(null);
    const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
    const [selectedLetterForPdf, setSelectedLetterForPdf] =
        useState<Letter | null>(null);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openDeleteModal = (letter: Letter) => {
        setSelectedLetter(letter);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedLetter) return;

        setDeletingId(selectedLetter.letter_id);
        try {
            const response: any = await PostSimple(
                `api/letter/delete/${selectedLetter.letter_id}`
            );

            if (
                response?.status === 200 ||
                response?.data?.success ||
                response?.data
            ) {
                toast.success("Письмо успешно удалено");
                setIsDeleteModalOpen(false);
                setSelectedLetter(null);
                changeStatus(); // Table list ni yangilash
            } else {
                toast.error("Ошибка при удалении письма");
                setIsDeleteModalOpen(false);
                setSelectedLetter(null);
            }
        } catch (error: any) {
            console.error("Error deleting letter:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при удалении письма"
            );
            setIsDeleteModalOpen(false);
            setSelectedLetter(null);
        } finally {
            setDeletingId(null);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedLetter(null);
        setDeletingId(null);
    };

    const handleGetQrCode = async (letter: Letter) => {
        setSelectedLetterForQr(letter);
        setIsQrModalOpen(true);
        setLoadingQr(true);
        setQrCodeUrl("");

        try {
            const response: any = await GetDataSimple(
                `api/letter/qrcode/${letter.letter_id}`
            );

            const qrUrl =
                response?.success ||
                response?.data?.success ||
                response?.data?.url ||
                "";

            if (qrUrl) {
                setQrCodeUrl(qrUrl);
            } else {
                toast.error("QR-код не найден");
            }
        } catch (error: any) {
            console.error("Error fetching QR code:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при получении QR-кода"
            );
        } finally {
            setLoadingQr(false);
        }
    };

    const closeQrModal = () => {
        setIsQrModalOpen(false);
        setQrCodeUrl("");
        setSelectedLetterForQr(null);
    };

    const handleDownloadQr = async () => {
        if (!selectedLetterForQr) {
            toast.error("Письмо не выбрано");
            return;
        }

        try {
            // Используем GetDataSimplePDF для получения blob (работает и для изображений)
            const response = await GetDataSimplePDF(
                `api/letter/download/qrcode/${selectedLetterForQr.letter_id}`
            );

            // Create blob and download
            const blob = new Blob([response.data], {
                type: "image/png",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `qrcode-${
                selectedLetterForQr?.letter_number || "letter"
            }.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("QR-код успешно скачан");
            closeQrModal();
        } catch (error: any) {
            closeQrModal();
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при скачивании QR-кода"
            );
        }
    };

    const openPdfUploadModal = (letter: Letter) => {
        setSelectedLetterForPdf(letter);
        setIsPdfUploadModalOpen(true);
    };

    const closePdfUploadModal = () => {
        setIsPdfUploadModalOpen(false);
        setSelectedLetterForPdf(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePdfUpload = async () => {
        if (!selectedLetterForPdf || !fileInputRef.current?.files?.[0]) {
            toast.error("Пожалуйста, выберите PDF файл");
            return;
        }

        const file = fileInputRef.current.files[0];
        if (file.type !== "application/pdf") {
            toast.error("Пожалуйста, выберите PDF файл");
            return;
        }

        setUploadingPdf(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response: any = await PostSimpleFormData(
                `api/letter/upload-pdf/${selectedLetterForPdf.letter_id}`,
                formData
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("PDF файл успешно загружен");
                closePdfUploadModal();
                changeStatus(); // Обновить список
            } else {
                toast.error("Ошибка при загрузке PDF файла");
            }
        } catch (error: any) {
            console.error("Error uploading PDF:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при загрузке PDF файла"
            );
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleDownloadPdf = async (letter: Letter) => {
        setDownloadingPdf(true);
        try {
            const response = await GetDataSimplePDF(
                `api/letter/pdf/${letter.letter_id}`
            );

            // Create blob and download
            const blob = new Blob([response.data], {
                type: "application/pdf",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `letter-${
                letter.letter_number || letter.letter_id
            }.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("PDF файл загружен");
        } catch (error: any) {
            console.error("Error downloading PDF:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при загрузке PDF файла"
            );
        } finally {
            setDownloadingPdf(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";

            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();

            return `${day}-${month}-${year}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return "";
        }
    };

    if (letters.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Письма не найдены
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                #
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Номер письма
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Отправлено
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Статус
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Пользователь
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Дата
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {letters.map((letter, index) => (
                            <tr
                                key={letter.letter_id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {letter.letter_number || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {letter.send_to || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {letter.letter_status_text || "-"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {letter.user_name || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {formatDate(letter.created_at)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() =>
                                                handleGetQrCode(letter)
                                            }
                                            size="xs"
                                            variant="outline"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                                />
                                            </svg>
                                        </Button>
                                        {letter.letter_status === 1 && (
                                            <Button
                                                onClick={() =>
                                                    openPdfUploadModal(letter)
                                                }
                                                size="xs"
                                                variant="primary"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
                                            </Button>
                                        )}
                                        {letter.letter_status === 2 && (
                                            <Button
                                                className="bg-green-600 hover:bg-green-500"
                                                onClick={() =>
                                                    handleDownloadPdf(letter)
                                                }
                                                size="xs"
                                                disabled={downloadingPdf}
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                onClick={() =>
                                                    openDeleteModal(letter)
                                                }
                                                size="xs"
                                                variant="danger"
                                                startIcon={
                                                    <TrashBinIcon className="size-4" />
                                                }
                                            >
                                                {""}
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* QR Code Modal */}
            <Modal
                isOpen={isQrModalOpen}
                onClose={closeQrModal}
                showCloseButton={true}
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        QR-код письма
                        {selectedLetterForQr?.letter_number && (
                            <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                                Номер: {selectedLetterForQr.letter_number}
                            </span>
                        )}
                    </h3>

                    {loadingQr ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : qrCodeUrl ? (
                        <div className="flex flex-col items-center py-4">
                            <img
                                src={qrCodeUrl}
                                alt={`QR Code for letter ${selectedLetterForQr?.letter_number}`}
                                className="max-w-full max-h-96 rounded-lg shadow-lg mb-4"
                                onError={() => {
                                    console.error("QR code image load error");
                                    toast.error("Не удалось загрузить QR-код");
                                }}
                            />
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={handleDownloadQr}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Скачать QR-код
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            QR-код не найден
                        </div>
                    )}
                </div>
            </Modal>

            {/* PDF Upload Modal */}
            <Modal
                isOpen={isPdfUploadModalOpen}
                onClose={closePdfUploadModal}
                showCloseButton={true}
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Загрузить PDF файл
                        {selectedLetterForPdf?.letter_number && (
                            <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                                Номер письма:{" "}
                                {selectedLetterForPdf.letter_number}
                            </span>
                        )}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Выберите PDF файл
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={closePdfUploadModal}
                            disabled={uploadingPdf}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handlePdfUpload}
                            disabled={uploadingPdf}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploadingPdf ? "Загрузка..." : "Загрузить"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                showCloseButton={true}
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Подтверждение удаления
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить это письмо?
                        {selectedLetter?.letter_number && (
                            <span className="block mt-2 font-medium">
                                Номер: {selectedLetter.letter_number}
                            </span>
                        )}
                    </p>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={closeDeleteModal}
                            disabled={deletingId !== null}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deletingId !== null}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deletingId !== null ? "Удаление..." : "Удалить"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
