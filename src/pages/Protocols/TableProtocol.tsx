import { useState, useRef } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import {
    DeleteData,
    GetDataSimple,
    PostSimpleFormData,
    GetDataSimplePDF,
} from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import { TrashBinIcon } from "../../icons/index.ts";

interface Protocol {
    protocol_id: number;
    protocol_number: number;
    category_name: string;
    application_date: string;
    test_date: string;
    is_accepted: number;
    accepted_date: string;
    sender_comments: string;
    created_by: string;
    created_at: string;
    acceptance_status: string;
    word_file?: string | null;
    pdf_file?: string | null;
    is_word_added?: number;
    is_pdf_added?: number;
    client_full_name?: string | null;
}

interface TableProtocolProps {
    protocols: Protocol[];
    changeStatus: () => void;
}

export default function TableProtocol({
    protocols,
    changeStatus,
}: TableProtocolProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(
        null
    );
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [loadingQr, setLoadingQr] = useState(false);
    const [selectedProtocolForQr, setSelectedProtocolForQr] =
        useState<Protocol | null>(null);
    const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
    const [selectedProtocolForPdf, setSelectedProtocolForPdf] =
        useState<Protocol | null>(null);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [isWordUploadModalOpen, setIsWordUploadModalOpen] = useState(false);
    const [selectedProtocolForWord, setSelectedProtocolForWord] =
        useState<Protocol | null>(null);
    const [uploadingWord, setUploadingWord] = useState(false);
    const [downloadingWord, setDownloadingWord] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wordFileInputRef = useRef<HTMLInputElement>(null);

    // Get user role from localStorage
    const userRole = parseInt(localStorage.getItem("role_id") || "0");
    const canDelete = userRole === 1;

    const openDeleteModal = (protocol: Protocol) => {
        setSelectedProtocol(protocol);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedProtocol) return;

        setDeletingId(selectedProtocol.protocol_id);
        try {
            const response: any = await DeleteData(
                `api/protocol/delete/${selectedProtocol.protocol_id}`
            );

            if (
                response?.status === 200 ||
                response?.data?.success ||
                response?.data
            ) {
                toast.success("Протокол успешно удален");
                setIsDeleteModalOpen(false);
                setSelectedProtocol(null);
                changeStatus(); // Table list ni yangilash
            } else {
                toast.error("Ошибка при удалении протокола");
                setIsDeleteModalOpen(false);
                setSelectedProtocol(null);
            }
        } catch (error: any) {
            console.error("Error deleting protocol:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при удалении протокола"
            );
            setIsDeleteModalOpen(false);
            setSelectedProtocol(null);
        } finally {
            setDeletingId(null);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedProtocol(null);
        setDeletingId(null);
    };

    const handleGetQrCode = async (protocol: Protocol) => {
        setSelectedProtocolForQr(protocol);
        setIsQrModalOpen(true);
        setLoadingQr(true);
        setQrCodeUrl("");

        try {
            const response: any = await GetDataSimple(
                `api/protocol/qrcode/${protocol.protocol_id}`
            );

            // Pismo pagedek response strukturani qayta ishlash
            const qrUrl =
                response?.url ||
                response?.success ||
                response?.data?.url ||
                response?.data?.success ||
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
        setSelectedProtocolForQr(null);
    };

    const handleDownloadQr = async () => {
        if (!selectedProtocolForQr) {
            toast.error("Протокол не выбран");
            return;
        }

        try {
            // Используем GetDataSimplePDF для получения blob (работает и для изображений)
            const response = await GetDataSimplePDF(
                `api/protocol/download/qrcode/${selectedProtocolForQr.protocol_id}`
            );

            // Create blob and download
            const blob = new Blob([response.data], {
                type: "image/png",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `qrcode-${
                selectedProtocolForQr?.protocol_number?.toString() || "protocol"
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

    const openPdfUploadModal = (protocol: Protocol) => {
        setSelectedProtocolForPdf(protocol);
        setIsPdfUploadModalOpen(true);
    };

    const closePdfUploadModal = () => {
        setIsPdfUploadModalOpen(false);
        setSelectedProtocolForPdf(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePdfUpload = async () => {
        if (!selectedProtocolForPdf || !fileInputRef.current?.files?.[0]) {
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
                `api/protocol/upload-pdf/${selectedProtocolForPdf.protocol_id}`,
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
            closePdfUploadModal()
            console.log(error?.response?.data?.error);

            console.error("Error uploading PDF:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при загрузке PDF файла"
            );
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleDownloadPdf = async (protocol: Protocol) => {
        setDownloadingPdf(true);
        try {
            const response = await GetDataSimplePDF(
                `api/protocol/download-pdf/${protocol.protocol_id}`
            );

            // Create blob and download
            const blob = new Blob([response.data], {
                type: "application/pdf",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `protocol-${
                protocol.protocol_number?.toString() || protocol.protocol_id
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

    const openWordUploadModal = (protocol: Protocol) => {
        setSelectedProtocolForWord(protocol);
        setIsWordUploadModalOpen(true);
    };

    const closeWordUploadModal = () => {
        setIsWordUploadModalOpen(false);
        setSelectedProtocolForWord(null);
        if (wordFileInputRef.current) {
            wordFileInputRef.current.value = "";
        }
    };

    const handleWordUpload = async () => {
        if (!selectedProtocolForWord || !wordFileInputRef.current?.files?.[0]) {
            toast.error("Пожалуйста, выберите Word файл");
            return;
        }

        const file = wordFileInputRef.current.files[0];
        if (
            file.type !==
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
            file.type !== "application/msword"
        ) {
            toast.error("Пожалуйста, выберите Word файл (.doc или .docx)");
            return;
        }

        setUploadingWord(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response: any = await PostSimpleFormData(
                `api/protocol/upload-word/${selectedProtocolForWord.protocol_id}`,
                formData
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Word файл успешно загружен");
                closeWordUploadModal();
                changeStatus(); // Обновить список
            } else {
                toast.error("Ошибка при загрузке Word файла");
            }
        } catch (error: any) {
            closeWordUploadModal()
            console.error("Error uploading Word:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при загрузке Word файла"
            );
        } finally {
            setUploadingWord(false);
        }
    };

    const handleDownloadWord = async (protocol: Protocol) => {
        setDownloadingWord(true);
        try {
            const response = await GetDataSimplePDF(
                `api/protocol/download-word/${protocol.protocol_id}`
            );

            // Create blob and download
            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `protocol-${
                protocol.protocol_number?.toString() || protocol.protocol_id
            }.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Word файл загружен");
        } catch (error: any) {
            console.error("Error downloading Word:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при загрузке Word файла"
            );
        } finally {
            setDownloadingWord(false);
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

    if (protocols.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Протоколы не найдены
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                #
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Номер
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Клиент
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Категория
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Дата заявки / испытания
                            </th>
                          
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Статус
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Комментарии
                            </th>

                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Создано
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {protocols.map((protocol, index) => (
                            <tr
                                key={protocol.protocol_id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 relative"
                            >
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {protocol.protocol_number || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {protocol.client_full_name || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {protocol.category_name || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {formatDate(protocol.application_date)} / {formatDate(protocol.test_date)}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {protocol.acceptance_status || "-"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 overflow-visible">
                                    <div className="relative group max-w-xs">
                                        <span className="cursor-help inline-block">
                                            {protocol.sender_comments &&
                                            protocol.sender_comments.length > 20
                                                ? `${protocol.sender_comments.substring(
                                                      0,
                                                      20
                                                  )}...`
                                                : protocol.sender_comments || "-"}
                                        </span>
                                        {protocol.sender_comments &&
                                            protocol.sender_comments.length >
                                                20 && (
                                                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999] w-80 max-w-sm break-words shadow-lg pointer-events-none whitespace-normal">
                                                    {protocol.sender_comments}
                                                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            )}
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    <div>
                                        <div>{protocol.created_by || "-"}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(protocol.created_at)}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div title="QR-код">
                                            <Button
                                                onClick={() =>
                                                    handleGetQrCode(protocol)
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
                                        </div>
                                        {/* Word Upload/Download */}
                                        {protocol.is_word_added === 1 ? (
                                            // Если is_word_added === 1, только download
                                            <div title="Скачать Word файл">
                                                <Button
                                                    className="bg-emerald-600 hover:bg-emerald-500"
                                                    onClick={() =>
                                                        handleDownloadWord(protocol)
                                                    }
                                                    size="xs"
                                                    disabled={downloadingWord}
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
                                            </div>
                                        ) : (
                                            // Если is_word_added !== 1, upload и download
                                            <>
                                                <div title="Загрузить Word файл">
                                                    <Button
                                                        onClick={() =>
                                                            openWordUploadModal(
                                                                protocol
                                                            )
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
                                                </div>
                                                {protocol.is_word_added == 1?
                                                <div title="Скачать Word файл">
                                                    <Button
                                                        className="bg-emerald-600 hover:bg-emerald-500"
                                                        onClick={() =>
                                                            handleDownloadWord(protocol)
                                                        }
                                                        size="xs"
                                                        disabled={downloadingWord}
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
                                                </div>:""}
                                            </>
                                        )}

                                        {/* PDF Upload/Download */}
                                        {protocol.is_pdf_added === 1 ? (
                                            // Если is_pdf_added === 1, только download
                                            <div title="Скачать PDF файл">
                                                <Button
                                                    className="bg-teal-600 hover:bg-teal-500"
                                                    onClick={() =>
                                                        handleDownloadPdf(
                                                            protocol
                                                        )
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
                                            </div>
                                        ) : (
                                            // Если is_pdf_added !== 1, upload и download
                                            <>
                                                <div title="Загрузить PDF файл">
                                                    <Button
                                                        onClick={() =>
                                                            openPdfUploadModal(
                                                                protocol
                                                            )
                                                        }
                                                        size="xs"
                                                        className="bg-purple-600 hover:bg-purple-500 text-white"
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
                                                </div>
                                                {protocol.is_pdf_added == 1?

                                                <div title="Скачать PDF файл">
                                                <Button
                                                    className="bg-teal-600 hover:bg-teal-500"
                                                    onClick={() =>
                                                        handleDownloadPdf(
                                                            protocol
                                                        )
                                                    }
                                                    size="xs"
                                                    disabled={
                                                        downloadingPdf
                                                    }
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
                                            </div>:""}

                                            </>
                                        )}
                                        {canDelete && (
                                            <div title="Удалить протокол">
                                                <Button
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            protocol
                                                        )
                                                    }
                                                    size="xs"
                                                    variant="danger"
                                                    startIcon={
                                                        <TrashBinIcon className="size-4" />
                                                    }
                                                >
                                                    {""}
                                                </Button>
                                            </div>
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
                        QR-код протокола
                        {selectedProtocolForQr?.protocol_number !==
                            undefined && (
                            <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                                Номер: {selectedProtocolForQr.protocol_number}
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
                                alt={`QR Code for protocol ${
                                    selectedProtocolForQr?.protocol_number || ""
                                }`}
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

            {/* Word Upload Modal */}
            <Modal
                isOpen={isWordUploadModalOpen}
                onClose={closeWordUploadModal}
                showCloseButton={true}
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Загрузить Word файл
                        {selectedProtocolForWord?.protocol_number !==
                            undefined && (
                            <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                                Номер протокола:{" "}
                                {selectedProtocolForWord.protocol_number}
                            </span>
                        )}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Выберите Word файл (.doc или .docx)
                            </label>
                            <input
                                ref={wordFileInputRef}
                                type="file"
                                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={closeWordUploadModal}
                            disabled={uploadingWord}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleWordUpload}
                            disabled={uploadingWord}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploadingWord ? "Загрузка..." : "Загрузить"}
                        </button>
                    </div>
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
                        {selectedProtocolForPdf?.protocol_number !==
                            undefined && (
                            <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                                Номер протокола:{" "}
                                {selectedProtocolForPdf.protocol_number}
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
                        Вы уверены, что хотите удалить этот протокол?
                        {selectedProtocol?.protocol_number !== undefined && (
                            <span className="block mt-2 font-medium">
                                Номер: {selectedProtocol.protocol_number}
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
