import React, { useState } from "react";
import { GetDataSimpleBlob } from "../../service/data";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal";
import { TbFaceId } from "react-icons/tb";
import { formatDate } from "../../utils/numberFormat";

const formatTime = (timeString: string): string => {
    if (!timeString) return "-";

    try {
        // If timeString is in HH:MM:SS format, extract HH:MM
        if (timeString.includes(":")) {
            const timeParts = timeString.split(":");
            if (timeParts.length >= 2) {
                return `${timeParts[0]}:${timeParts[1]}`;
            }
        }
        return timeString;
    } catch (error) {
        console.error("Error formatting time:", error);
        return timeString;
    }
};

interface FaceId {
    face_id: number;
    name: string;
    work_date: string;
    arrival_time: string;
    leave_time: string;
}

interface TableFaceIdProps {
    faceIds: FaceId[];
    changeStatus: () => void;
}

const TableFaceId: React.FC<TableFaceIdProps> = ({ faceIds }) => {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedFaceId, setSelectedFaceId] = useState<FaceId | null>(null);
    const [faceImage, setFaceImage] = useState<string>("");
    const [loadingImage, setLoadingImage] = useState(false);

    const openImageModal = async (faceId: FaceId) => {
        setSelectedFaceId(faceId);
        setIsImageModalOpen(true);
        setLoadingImage(true);
        setFaceImage(""); // reset

        try {
            const response: Blob = await GetDataSimpleBlob(
                `api/faceid/faceimage/${faceId.face_id}`,
                { responseType: "blob" }
            );

            console.log("API Response (blob):", response);

            if (response && response instanceof Blob) {
                const objectUrl = URL.createObjectURL(response);
                setFaceImage(objectUrl);
            } else {
                console.error("API blob qaytarmadi!");
                toast.error("Rasmni o'qib bo'lmadi");
            }
        } catch (error: any) {
            setIsImageModalOpen(false);
            setSelectedFaceId(null);
            setFaceImage("");
            console.error("Error fetching face image:", error);
            toast.error(
                error?.response?.data?.error || "Ошибка: Файл не существует.!"
            );
        } finally {
            setLoadingImage(false);
        }
    };

    const closeImageModal = () => {
        if (faceImage) {
            URL.revokeObjectURL(faceImage); // 🔥 memory leak bo‘lmasligi uchun
        }
        setIsImageModalOpen(false);
        setSelectedFaceId(null);
        setFaceImage("");
    };

    return (
        <>
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
                <table className="w-full table-auto min-w-[640px]">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <th className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                #
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                Имя
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                Дата работы
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                Время входа
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                Время выхода
                            </th>
                            <th className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {faceIds.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    Face ID не найдены
                                </td>
                            </tr>
                        ) : (
                            faceIds.map((faceId, index) => (
                                <tr
                                    key={faceId.face_id}
                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-white">
                                        {index + 1}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-white">
                                        {faceId?.name}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {faceId?.work_date
                                            ? formatDate(faceId.work_date)
                                            : "-"}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {faceId?.arrival_time
                                            ? formatTime(faceId.arrival_time)
                                            : "-"}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {faceId?.leave_time
                                            ? formatTime(faceId.leave_time)
                                            : "Нет данных"}
                                    </td>
                                    <td className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3">
                                        <button
                                            onClick={() =>
                                                openImageModal(faceId)
                                            }
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 bg-blue-100 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            title="Ko'rish"
                                        >
                                            <TbFaceId className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Face Image Modal */}
            <Modal isOpen={isImageModalOpen} onClose={closeImageModal}>
                <div className="p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {selectedFaceId?.name}
                        </h3>
                    </div>

                    {loadingImage ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : faceImage ? (
                        <div className="flex flex-col items-center py-3">
                            <img
                                src={faceImage}
                                alt={`Face ID ${selectedFaceId?.face_id}`}
                                className="max-w-full max-h-96 rounded-lg shadow-lg"
                                onError={() => {
                                    console.error("Image load error");
                                    toast.error("Rasm yuklanmadi");
                                    setFaceImage("");
                                }}
                                onLoad={() => {
                                    console.log("Image loaded successfully");
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400"></div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default TableFaceId;
