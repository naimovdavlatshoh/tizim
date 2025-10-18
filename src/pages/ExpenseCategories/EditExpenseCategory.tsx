import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import { PostSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import InputField from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface ExpenseCategory {
    expenses_category_id: string;
    category_name: string;
}

interface EditExpenseCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    category: ExpenseCategory | null;
}

export default function EditExpenseCategoryModal({
    isOpen,
    onClose,
    onSuccess,
    category,
}: EditExpenseCategoryModalProps) {
    const [formData, setFormData] = useState({
        category_name: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setFormData({
                category_name: category.category_name || "",
            });
        }
    }, [category]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category_name.trim()) {
            toast.error("Название категории обязательно");
            return;
        }

        if (!category) return;

        setLoading(true);
        try {
            const response = await PostSimple(
                `api/expensescategories/update/${category.expenses_category_id}`,
                formData
            );

            if (response) {
                toast.success("Категория успешно обновлена!");
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!category) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Редактировать категорию
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Название категории *
                        </label>
                        <InputField
                            type="text"
                            name="category_name"
                            value={formData.category_name}
                            onChange={handleInputChange}
                            placeholder="Введите название категории"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="px-6 py-2.5"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5"
                        >
                            {loading ? "Обновление..." : "Обновить"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
