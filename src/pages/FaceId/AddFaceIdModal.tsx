import React, { useState, useEffect, useRef } from "react";
import { PostSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal";
import InputField from "../../form/input/InputField";
import Button from "../../components/ui/button/Button";

interface AddFaceIdModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
}

const AddFaceIdModal: React.FC<AddFaceIdModalProps> = ({
    isOpen,
    onClose,
    changeStatus,
}) => {
    const [formData, setFormData] = useState({
        user_id: "",
        face_data: "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.user_id.trim() || !formData.face_data.trim()) {
            toast.error("Пожалуйста, заполните все поля");
            return;
        }

        setLoading(true);
        try {
            const response: any = await PostSimple("api/faceid/create", {
                user_id: parseInt(formData.user_id),
                face_data: formData.face_data,
            });

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Face ID успешно создан");
                onClose();
                changeStatus(); // Table list ni yangilash
            } else {
                toast.error("Ошибка при создании Face ID");
                // Error holatida ham modal yopish
                onClose();
            }
        } catch (error) {
            console.error("Error creating face ID:", error);
            toast.error("Что-то пошло не так при создании Face ID");
            // Error holatida ham modal yopish
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Loading bo'lsa ham modal yopish mumkin
        setFormData({ user_id: "", face_data: "" });
        setLoading(false); // Loading state ni ham tozalash
        onClose();
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Добавить Face ID">
            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            User ID
                        </label>
                        <InputField
                            type="number"
                            value={formData.user_id}
                            onChange={(e) =>
                                handleInputChange("user_id", e.target.value)
                            }
                            placeholder="Введите ID пользователя"
                            className="w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Face Data
                        </label>
                        <textarea
                            value={formData.face_data}
                            onChange={(e) =>
                                handleInputChange("face_data", e.target.value)
                            }
                            placeholder="Введите данные лица (base64 или JSON)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors resize-none"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            variant="secondary"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            loading={loading}
                        >
                            {loading ? "Создание..." : "Создать Face ID"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddFaceIdModal;
