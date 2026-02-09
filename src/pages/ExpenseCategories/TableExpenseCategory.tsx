import { PencilIcon } from "../../icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { useModal } from "../../hooks/useModal";
import EditExpenseCategoryModal from "./EditExpenseCategory";
import { useState } from "react";
import Button from "../../components/ui/button/Button";

interface ExpenseCategory {
    expenses_category_id: string;
    category_name: string;
}

interface TableExpenseCategoryProps {
    categories: ExpenseCategory[];
    changeStatus: () => void;
}

export default function TableExpenseCategory({
    categories,
    changeStatus,
}: TableExpenseCategoryProps) {
    const { isOpen, openModal, closeModal } = useModal();

    const [selectedCategory, setSelectedCategory] =
        useState<ExpenseCategory | null>(null);

    const handleEdit = (category: ExpenseCategory) => {
        setSelectedCategory(category);
        openModal();
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
                <Table className="min-w-[400px]">
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 font-medium whitespace-nowrap text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                #
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Название
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Действия
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    Категории не найдены
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category, index) => (
                                <TableRow
                                    key={category.expenses_category_id}
                                    className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                >
                                    <TableCell className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-sm text-black dark:text-white">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-black dark:text-white">
                                        {category.category_name || "Не указано"}
                                    </TableCell>
                                    <TableCell className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-sm">
                                        <div className="flex flex-row items-center gap-2 flex-nowrap">
                                            <Button
                                                className="mr-2"
                                                onClick={() =>
                                                    handleEdit(category)
                                                }
                                                size="xs"
                                                variant="outline"
                                                startIcon={
                                                    <PencilIcon className="size-4" />
                                                }
                                            >
                                                {""}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

            <EditExpenseCategoryModal
                isOpen={isOpen}
                onClose={closeModal}
                onSuccess={changeStatus}
                category={selectedCategory}
            />
        </div>
    );
}
