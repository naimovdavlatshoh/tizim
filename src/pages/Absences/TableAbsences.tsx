import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { TrashBinIcon } from "../../icons/index.ts";
import { FaEdit } from "react-icons/fa";
import EditAbsenceModal from "./EditAbsenceModal.tsx";
import DeleteAbsenceModal from "./DeleteAbsenceModal.tsx";

interface Absence {
    id: number;
    user_id: number;
    user?: {
        firstname: string;
        lastname: string;
        fathername: string;
    };
    full_name?: string;
    to_user_name?: string;
    absence_type: string;
    date_from: string;
    date_to: string;
}

interface TableProps {
    absences: Absence[];
    changeStatus: () => void;
}

export default function TableAbsences({ absences, changeStatus }: TableProps) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);

    const formatType = (type: string) => {
        switch (type) {
            case "sick_leave": return "Больничный";
            case "day_off": return "Отпросился";
            case "business_trip": return "Командировка";
            case "vacation": return "Отпуск";
            default: return type;
        }
    };

    if (absences.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Записи не найдены
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
                <table className="w-full table-auto min-w-[640px]">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                #
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Сотрудник
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Тип
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                С даты
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                По дату
                            </th>
                            <th className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {absences.map((absence, index) => {
                            const employeeName = absence.user 
                                ? `${absence.user.firstname || ""} ${absence.user.lastname || ""} ${absence.user.fathername || ""}`.trim() 
                                : absence.full_name || absence.to_user_name || "Неизвестный сотрудник";

                            return (
                                <tr key={absence.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                        {index + 1}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {employeeName}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                        {formatType(absence.absence_type)}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                        {absence.date_from}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                        {absence.date_to}
                                    </td>
                                    <td className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                        <div className="flex flex-row items-center gap-2 flex-nowrap">
                                            <Button
                                                onClick={() => {
                                                    setSelectedAbsence(absence);
                                                    setEditModalOpen(true);
                                                }}
                                                size="xs"
                                                variant="outline"
                                                className="text-blue-500 border-blue-500 hover:bg-blue-50"
                                            >
                                                <FaEdit size={16} />
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelectedAbsence(absence);
                                                    setDeleteModalOpen(true);
                                                }}
                                                size="xs"
                                                variant="danger"
                                            >
                                                <TrashBinIcon />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedAbsence && (
                <>
                    <EditAbsenceModal
                        isOpen={editModalOpen}
                        onClose={() => {
                            setEditModalOpen(false);
                            setSelectedAbsence(null);
                        }}
                        changeStatus={changeStatus}
                        absence={selectedAbsence}
                    />

                    <DeleteAbsenceModal
                        isOpen={deleteModalOpen}
                        onClose={() => {
                            setDeleteModalOpen(false);
                            setSelectedAbsence(null);
                        }}
                        changeStatus={changeStatus}
                        id={selectedAbsence.id}
                    />
                </>
            )}
        </>
    );
}
