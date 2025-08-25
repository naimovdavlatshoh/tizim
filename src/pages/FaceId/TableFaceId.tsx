import React, { useState } from "react";
import { GetDataSimpleBlob } from "../../service/data";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal";
import { TbFaceId } from "react-icons/tb";

interface FaceId {
    face_id: number;
    name: string;
    created_at: string;
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
            // 👉 backenddan blob sifatida olish
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
        } catch (error) {
            console.error("Error fetching face image:", error);
            toast.error("Rasm yuklanmadi");
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
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                ID
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                Имя
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                Создан
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {faceIds.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    Face ID не найдены
                                </td>
                            </tr>
                        ) : (
                            faceIds.map((faceId) => (
                                <tr
                                    key={faceId.face_id}
                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {faceId.face_id}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {faceId.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {faceId.created_at}
                                    </td>
                                    <td className="px-4 py-3">
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
                            Face ID: {selectedFaceId?.face_id}
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
