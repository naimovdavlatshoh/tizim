import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple } from "../../service/data.ts";
import { Toaster } from "react-hot-toast";
import TableAttendance from "./TableAttendance.tsx";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import DatePicker from "../../components/form/date-picker.tsx";
import { GroupIcon } from "../../icons";
// import { FaDownload } from "react-icons/fa";
import { Attendance, AttendanceStats } from "./types";
import { IoCheckmarkDone, IoClose } from "react-icons/io5";
import { IoIosTimer } from "react-icons/io";

export default function AttendanceList() {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [stats, setStats] = useState<AttendanceStats>({
        total_employees: 0,
        integrated_employees: 0,
        not_integrated_employees: 0,
        on_time: 0,
        late: 0,
        absent: 0,
        day_off: 0,
        present: 0,
    });
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [status, setStatus] = useState(false);

    // Set default date to today
    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const day = today.getDate().toString().padStart(2, "0");
        setSelectedDate(`${year}-${month}-${day}`);
    }, []);

    const fetchAttendances = useCallback(async () => {
        setLoading(true);
        try {
            let url = `api/faceid/attendance`;
            if (selectedDate) {
                url += `?date=${selectedDate}`;
            }

            const response: any = await GetDataSimple(url);
            const attendanceData =
                response?.attendance || response?.data?.attendance || [];
            const statsData = response?.statistics ||
                response?.data?.statistics || {
                    total_employees: 0,
                    integrated_employees: 0,
                    not_integrated_employees: 0,
                    on_time: 0,
                    late: 0,
                    absent: 0,
                    day_off: 0,
                    present: 0,
                };

            setAttendances(attendanceData);
            setStats(statsData);
        } catch (error: any) {
            console.error("Error fetching attendances:", error);
            toast.error(
                error?.response?.data?.message ||
                    "Что-то пошло не так при загрузке посещаемости"
            );
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchAttendances();
    }, [fetchAttendances, status]);

    const changeStatus = useCallback(() => {
        setStatus(!status);
    }, [status]);

    const handleDateChange = (dates: Date[], currentDateString: string) => {
        if (currentDateString) {
            setSelectedDate(currentDateString);
        } else if (dates && dates[0]) {
            const date = new Date(dates[0]);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            setSelectedDate(`${year}-${month}-${day}`);
        }
    };

    // const handleDownloadReport = async () => {
    //     try {
    //         let url = `api/faceid/attendance/export?`;
    //         if (selectedDate) {
    //             url += `date=${selectedDate}`;
    //         }

    //         const blob = await GetDataSimpleBlobExel(url);
    //         const url_blob = window.URL.createObjectURL(new Blob([blob]));
    //         const link = document.createElement("a");
    //         link.href = url_blob;
    //         link.download = `attendance-report-${selectedDate || "all"}.xlsx`;
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //         window.URL.revokeObjectURL(url_blob);
    //         toast.success("Отчет успешно скачан");
    //     } catch (error: any) {
    //         console.error("Error downloading report:", error);
    //         toast.error(
    //             error?.response?.data?.error ||
    //                 "Что-то пошло не так при скачивании отчета"
    //         );
    //     }
    // };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    if (loading && attendances.length === 0) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Посещаемость" />
            <PageBreadcrumb pageTitle="Посещаемость" />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                {/* Total Employees Card */}
                <div className="rounded-2xl bg-blue-100 p-5 md:py-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl text-gray-800 dark:text-gray-400">
                            Все сотрудники
                        </h3>
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full ">
                            <GroupIcon className="text-blue-600 size-6" />
                        </div>
                    </div>
                    <div className="">
                        <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                            {stats.total_employees}
                        </h4>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Общее количество
                        </p>
                    </div>
                </div>

                {/* Employees at Work Card */}
                <div className="rounded-2xl bg-green-100 p-5 md:py-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl text-gray-800 dark:text-gray-400">
                            Сотрудники на работе
                        </h3>
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full ">
                            <IoCheckmarkDone className="text-green-600 size-6" />
                        </div>
                    </div>
                    <div className="">
                        <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                            {stats.present}
                        </h4>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Пришли сегодня
                        </p>
                    </div>
                </div>

                {/* Late Employees Card */}
                <div className="rounded-2xl bg-orange-100 p-5 md:py-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl text-gray-800 dark:text-gray-400">
                            Опоздавшие
                        </h3>
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full ">
                            <IoIosTimer className="text-orange-600 size-6" />
                        </div>
                    </div>
                    <div className="">
                        <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                            {stats.late}
                        </h4>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Опоздали
                        </p>
                    </div>
                </div>

                {/* Absent Employees Card */}
                <div className="rounded-2xl bg-red-200 p-5 md:py-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl text-gray-800 dark:text-gray-400">
                            Отсутствующие
                        </h3>
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full ">
                            <IoClose className="text-red-600 size-6" />
                        </div>
                    </div>
                    <div className="">
                        <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                            {stats.absent}
                        </h4>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Не пришли
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <ComponentCard
                title="Список посещаемости"
                desc={
                    <div className="flex gap-3 items-center flex-wrap">
                        <div className="w-full sm:w-auto">
                            <DatePicker
                                id="attendance-date"
                                label=""
                                placeholder={
                                    formatDate(selectedDate) || "Выберите дату"
                                }
                                onChange={handleDateChange}
                                defaultDate={
                                    selectedDate
                                        ? new Date(selectedDate)
                                        : new Date()
                                }
                            />
                        </div>
                        {/* <button
                            onClick={handleDownloadReport}
                            className="bg-green-500 border border-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 w-full sm:w-auto"
                        >
                            <FaDownload />
                            Скачать отчет
                        </button> */}
                    </div>
                }
            >
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader />
                    </div>
                ) : (
                    <>
                        <TableAttendance
                            attendances={attendances}
                            changeStatus={changeStatus}
                        />
                    </>
                )}
            </ComponentCard>

            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#10B981",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#EF4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />
        </>
    );
}
