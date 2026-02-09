import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Attendance } from "./types";
import { IoTime } from "react-icons/io5";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoCloseCircle } from "react-icons/io5";

interface TableAttendanceProps {
    attendances: Attendance[];
    changeStatus?: () => void;
}

export default function TableAttendance({
    attendances,
}: // changeStatus,
TableAttendanceProps) {
    const getStatusBadge = (status: string, isDayOff: boolean) => {
        if (isDayOff) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Выходной
                </span>
            );
        }

        switch (status?.toLowerCase()) {
            case "present":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <IoIosCheckmarkCircle size={16} className="mr-1" />{" "}
                        Пришел
                    </span>
                );
            case "late":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        <IoTime size={16} className="mr-1" />
                        Опоздал
                    </span>
                );
            case "absent":
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <IoCloseCircle size={16} className="mr-1" />
                        Не пришел
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {status}
                    </span>
                );
        }
    };

    if (attendances.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Данные посещаемости не найдены
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
            <Table className="min-w-[640px]">
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Сотрудник
                        </TableCell>

                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Приход
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Уход
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Опоздание
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Статус
                        </TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attendances.map((attendance, index) => (
                        <TableRow
                            key={attendance.user_id || index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-theme-sm dark:text-gray-100">
                                <div className="flex items-center gap-3">
                                    {attendance.image_path && (
                                        <img
                                            src={attendance.image_path}
                                            alt={attendance.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    )}
                                    <span className="font-medium">
                                        {attendance.name || "-"}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                {attendance.check_in_time ? (
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        {attendance.check_in_time}
                                    </span>
                                ) : (
                                    "-"
                                )}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                {attendance.check_out_time ? (
                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                        {attendance.check_out_time}
                                    </span>
                                ) : (
                                    "-"
                                )}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                {attendance.late_minutes > 0 ? (
                                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                                        {attendance.late_minutes_text}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                {getStatusBadge(
                                    attendance.status,
                                    attendance.is_day_off
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
