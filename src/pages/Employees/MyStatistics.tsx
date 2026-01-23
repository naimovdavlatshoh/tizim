import { useEffect, useState } from "react";
import { GetDataSimple } from "../../service/data";
import { toast } from "react-hot-toast";
// import Loader from "../../components/ui/loader/Loader";
import ComponentCard from "../../components/common/ComponentCard";
import Select from "../../components/form/Select";

interface UserStatsResponse {
    user_info: {
        user_id: number;
        fullname: string;
        employeeNo: number;
    };
    period: {
        month: number;
        month_name: string;
        year: number;
        display: string;
    };
    salary_info: {
        base_salary: number;
        hourly_rate: number;
        fine_per_late: number;
        currency: string;
    };
    work_summary: {
        worked_minutes: number;
        worked_minutes_text: string;
        worked_hours: number;
        early_minutes: number;
        early_minutes_text: string;
        overtime_minutes: number;
        overtime_minutes_text: string;
        valid_days: number;
        incomplete_days: number;
        late_days: number;
    };
    financial_summary: {
        salary_for_worked_hours: number;
        bonuses_total: number;
        late_fines_total: number;
        fines_total: number;
        advances_total: number;
        total_salary: number;
        breakdown: Array<{
            type: string;
            amount: number;
            description: string;
            operation: "+" | "-";
        }>;
    };
    fines: {
        items: Array<{
            id: number;
            comment: string;
            amount: number;
            date: string;
        }>;
        total: number;
        count: number;
    };
    bonuses: {
        items: Array<{
            id: number;
            comment: string;
            amount: number;
            date: string;
        }>;
        total: number;
        count: number;
    };
    advances: {
        items: Array<{
            id: number;
            comment: string;
            amount: number;
            date: string;
        }>;
        total: number;
        count: number;
    };
    daily_details: {
        [date: string]: {
            status: string;
            day_type: "past" | "future" | "weekend";
            in: string | null;
            lateMinutes: any;
            out: string | null;
            workedMinutes: number;
            workedMinutes_text: string;
            shiftMinutes: number;
            shiftMinutes_text: string;
            earlyMinutes: number;
            earlyMinutes_text: string;
            overtimeMinutes: number;
            overtimeMinutes_text: string;
        };
    };
}

export default function MyStatistics() {
    const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        // Get current user ID from localStorage
        const storedUserId = localStorage.getItem("user_id");
        if (storedUserId) {
            setUserId(Number(storedUserId));
        } else {
            // If user_id is not in localStorage, we need to get it
            // But we won't fetch all users list - user_id should be set during login
            toast.error("Не удалось определить ID пользователя");
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchUserStats();
        }
    }, [userId, currentMonth, currentYear]);

    const fetchUserStats = async () => {
        setLoadingStats(true);
        try {
            const response: any = await GetDataSimple(
                `api/user/stats?user_id=${localStorage.getItem("user_id")}&month=${currentMonth}&year=${currentYear}`
            );
            setUserStats(
                response?.result || response?.data || response || null
            );
        } catch (error: any) {
            console.error("Error fetching user stats:", error);
            toast.error(
                error?.response?.data?.error || error?.response?.data?.message
            );
            setUserStats(null);
        } finally {
            setLoadingStats(false);
        }
    };

    const formatNumberWithSpaces = (value: number | string | undefined) => {
        if (!value && value !== 0) return "0";
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        if (isNaN(numValue)) return "0";
        return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const getMonthName = (month: number) => {
        const months = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь",
        ];
        return months[month - 1] || "";
    };

    // Month options for Select
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map(
        (month) => ({
            value: month,
            label: getMonthName(month),
        })
    );

    // Year options for Select
    const yearOptions = Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - 2 + i
    ).map((year) => ({
        value: year,
        label: year.toString(),
    }));

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getMonthCalendarDays = () => {
        if (!userStats?.period) return [];
        const { month, year } = userStats.period;
        const daysInMonth = new Date(year, month, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };

    const getCalendarDayStatus = (day: number) => {
        if (!userStats?.period || !userStats.daily_details) {
            return { color: "bg-gray-100 text-gray-500", details: null };
        }
        const { month, year } = userStats.period;

        // Check if the day is Sunday (getDay() returns 0 for Sunday)
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0) {
            // Sunday - return gray color
            const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(
                day
            ).padStart(2, "0")}`;
            const details = userStats.daily_details[dateKey];
            return {
                color: "bg-gray-300 text-gray-600",
                details: details || null,
            };
        }

        const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;
        const details = userStats.daily_details[dateKey];
        if (!details) {
            return { color: "bg-gray-100 text-gray-500", details: null };
        }

        // Check if there's no "in" but there's "out" - show in pink
        if (!details.in && details.out || details.in && !details.out  ) {
            return { color: "bg-pink-400 text-white", details };
        }

        if (details.day_type === "weekend") {
            return { color: "bg-red-400 text-white", details };
        }
        if (details.status.includes("Отсутствовал")) {
            return { color: "bg-red-400 text-white", details };
        }
        if (details.status.includes("Опоздал")) {
            return { color: "bg-yellow-400 text-white", details };
        }
        return { color: "bg-emerald-500 text-white", details };
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatLateMinutes = (minutes: any) => {
        if (!minutes && minutes !== 0) return "-";

        // Convert to number if it's a string
        const numMinutes = typeof minutes === "string"
            ? parseInt(minutes.replace(/\D/g, ""))
            : Number(minutes);

        if (isNaN(numMinutes) || numMinutes === 0) return "0 мин";

        // If less than 60, return just minutes
        if (numMinutes < 60) {
            return `${numMinutes} мин`;
        }

        // If 60 or more, convert to hours and minutes
        const hours = Math.floor(numMinutes / 60);
        const remainingMinutes = numMinutes % 60;

        if (remainingMinutes === 0) {
            return `${hours} ч`;
        }

        return `${hours} ч ${remainingMinutes} мин`;
    };

    // Calculate total late minutes from daily_details
    const calculateTotalLateMinutes = () => {
        if (!userStats?.daily_details) return 0;

        let totalLateMinutes = 0;

        Object.values(userStats.daily_details).forEach((dayDetail) => {
            if (dayDetail?.lateMinutes) {
                const lateMinutes = typeof dayDetail.lateMinutes === "string"
                    ? parseInt(dayDetail.lateMinutes.replace(/\D/g, ""))
                    : Number(dayDetail.lateMinutes);

                if (!isNaN(lateMinutes) && lateMinutes > 0) {
                    totalLateMinutes += lateMinutes;
                }
            }
        });

        return totalLateMinutes;
    };

    return (
        <>
            <ComponentCard title="Моя статистика" desc="">
                <div className="h-[calc(100vh-250px)] overflow-y-auto pr-2">
                    {loadingStats ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : userStats ? (
                        <div className="space-y-6">
                            {/* Calendar + legend & selectors */}
                            <div className="rounded-2xl bg-white dark:bg-gray-900 border px-6 py-5 relative z-10">
                                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.4fr)] gap-6">
                                    {/* Calendar */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-gray-400">
                                                    Календарь
                                                    посещаемости
                                                </p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                    {userStats
                                                        .period
                                                        ?.display ||
                                                        "-"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-40">
                                                    <Select
                                                        options={
                                                            monthOptions
                                                        }
                                                        placeholder="Месяц"
                                                        onChange={(
                                                            value
                                                        ) =>
                                                            setCurrentMonth(
                                                                Number(
                                                                    value
                                                                )
                                                            )
                                                        }
                                                        className="dark:bg-dark-900"
                                                        defaultValue={currentMonth.toString()}
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <Select
                                                        options={
                                                            yearOptions
                                                        }
                                                        placeholder="Год"
                                                        onChange={(
                                                            value
                                                        ) =>
                                                            setCurrentYear(
                                                                Number(
                                                                    value
                                                                )
                                                            )
                                                        }
                                                        className="dark:bg-dark-900"
                                                        defaultValue={currentYear.toString()}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 px-4 pt-4 pb-3">
                                            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-medium text-slate-400 mb-3">
                                                {[
                                                    "Du",
                                                    "Se",
                                                    "Ch",
                                                    "Pa",
                                                    "Ju",
                                                    "Sh",
                                                    "Ya",
                                                ].map((w) => (
                                                    <span key={w}>
                                                        {w}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-7 gap-2">
                                                {getMonthCalendarDays().map(
                                                    (
                                                        day,
                                                        index
                                                    ) => {
                                                        const {
                                                            color,
                                                            details,
                                                        } =
                                                            getCalendarDayStatus(
                                                                day
                                                            );
                                                        // Calculate row number (1-based)
                                                        const rowNumber =
                                                            Math.floor(
                                                                index /
                                                                    7
                                                            ) + 1;
                                                        // Show tooltip below for first 2 rows, above for others
                                                        const showBelow =
                                                            rowNumber <=
                                                            2;

                                                        return (
                                                            <div
                                                                key={
                                                                    day
                                                                }
                                                                className="flex items-center justify-center relative group"
                                                            >
                                                                <div
                                                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold cursor-pointer transition-all ${color}`}
                                                                >
                                                                    {
                                                                        day
                                                                    }
                                                                </div>
                                                                {details && (
                                                                    <div
                                                                        className={`absolute z-50 left-3/4 -translate-x-1/2 hidden group-hover:block w-44 ${
                                                                            showBelow
                                                                                ? "top-full mt-2"
                                                                                : "bottom-full mb-2"
                                                                        }`}
                                                                    >
                                                                        <div className="bg-black text-white text-xs rounded-lg shadow-lg px-2 py-1">
                                                                            <div className="font-semibold mb-2 pb-2 border-b border-gray-700">
                                                                                {details.status ||
                                                                                    "-"}
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-400">
                                                                                        Вход:
                                                                                    </span>
                                                                                    <span>
                                                                                        {details.in
                                                                                            ? formatTime(
                                                                                                  details.in
                                                                                              )
                                                                                            : "-"}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-400">
                                                                                        Выход:
                                                                                    </span>
                                                                                    <span>
                                                                                        {details.out
                                                                                            ? formatTime(
                                                                                                  details.out
                                                                                              )
                                                                                            : "-"}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between pt-1 border-t border-gray-700 mt-1">
                                                                                    <span className="text-gray-400">
                                                                                        Отработано:
                                                                                    </span>
                                                                                    <span className="font-semibold">
                                                                                        {details.workedMinutes_text ||
                                                                                            "-"}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-400">
                                                                                        Смена:
                                                                                    </span>
                                                                                    <span>
                                                                                        {details.shiftMinutes_text ||
                                                                                            "-"}
                                                                                    </span>
                                                                                </div>
                                                                                {(details.status?.includes("Опоздал") || color.includes("yellow") || color.includes("amber")) && (details.lateMinutes || details.earlyMinutes_text) && (
                                                                                    <div className="flex justify-between">
                                                                                        <span className="text-gray-400">
                                                                                            Опоздание:
                                                                                        </span>
                                                                                        <span className="text-yellow-400 font-semibold">
                                                                                            {formatLateMinutes(details.lateMinutes || details.earlyMinutes)}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                {details.overtimeMinutes >
                                                                                    0 && (
                                                                                    <div className="flex justify-between">
                                                                                        <span className="text-gray-400">
                                                                                            Сверхурочные:
                                                                                        </span>
                                                                                        <span>
                                                                                            {details.overtimeMinutes_text ||
                                                                                                "-"}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legend + summary */}
                                    <div className="flex flex-col justify-between gap-2">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
                                                Ежедневные
                                                результаты
                                            </p>
                                            <div className="space-y-1 text-[11px]">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                        <span className="text-gray-700 dark:text-gray-200">
                                                            Пришёл
                                                        </span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 dark:text-white text-xs">
                                                        {
                                                            userStats
                                                                .work_summary
                                                                ?.valid_days
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                                                        <span className="text-gray-700 dark:text-gray-200">
                                                            Опоздал
                                                        </span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 dark:text-white text-xs">
                                                        {
                                                            userStats
                                                                .work_summary
                                                                ?.late_days
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="h-2 w-2 rounded-full bg-red-400" />
                                                        <span className="text-gray-700 dark:text-gray-200">
                                                            Отсутствовал
                                                        </span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 dark:text-white text-xs">
                                                        {
                                                            userStats
                                                                .work_summary
                                                                ?.incomplete_days
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-1">
                                            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
                                                Общие показатели
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                <div className="rounded-lg bg-sky-50 px-2 py-1.5">
                                                    <p className="text-gray-500 text-[10px] leading-tight">
                                                        Базовая
                                                        зарплата
                                                    </p>
                                                    <p className="mt-0.5 text-lg font-semibold text-gray-900">
                                                        {formatNumberWithSpaces(
                                                            userStats
                                                                .salary_info
                                                                ?.base_salary
                                                        )}{" "}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-emerald-50 px-2 py-1.5">
                                                    <p className="text-gray-500 text-[10px] leading-tight">
                                                        Зарплата за
                                                        часы
                                                    </p>
                                                    <p className="mt-0.5 text-lg font-semibold text-gray-900">
                                                        {formatNumberWithSpaces(
                                                            userStats
                                                                .financial_summary
                                                                ?.salary_for_worked_hours
                                                        )}{" "}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-amber-50 px-2 py-1.5 ">
                                                    <p className="text-gray-500 text-[10px] leading-tight">
                                                        Все бонусы
                                                    </p>
                                                    <p className="mt-0.5 text-lg font-semibold text-gray-900">
                                                        {formatNumberWithSpaces(
                                                            userStats
                                                                .financial_summary
                                                                ?.bonuses_total
                                                        )}{" "}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-amber-50 px-2 py-1.5 ">
                                                    <p className="text-gray-500 text-[10px] leading-tight">
                                                        Общая
                                                        зарплата
                                                    </p>
                                                    <p className="mt-0.5 text-lg font-semibold text-gray-900">
                                                        {formatNumberWithSpaces(
                                                            userStats
                                                                .financial_summary
                                                                ?.total_salary ||
                                                                0
                                                        )}{" "}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom row of summary cards */}
                            <div className="space-y-4">
                                {/* First row - 3 cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                                    <div className="rounded-2xl flex flex-col justify-between bg-sky-50 px-2 py-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <svg
                                                className="w-5 h-5 text-sky-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>

                                            <p className="text-xs font-medium text-gray-500">
                                                Отработано
                                            </p>
                                        </div>
                                        <p className="text-md font-semibold text-gray-900">
                                            {userStats.work_summary
                                                ?.worked_minutes_text ||
                                                "0 мин"}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl flex flex-col justify-between bg-amber-50 px-2 py-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <svg
                                                className="w-5 h-5 text-amber-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>

                                            <p className="text-xs font-medium text-gray-500">
                                                Опоздал
                                            </p>
                                        </div>
                                        <p className="text-md font-semibold text-gray-900">
                                            {formatLateMinutes(calculateTotalLateMinutes())}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl flex flex-col justify-between bg-violet-50 px-2 py-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <svg
                                                className="w-5 h-5 text-violet-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                                />
                                            </svg>

                                            <p className="text-xs font-medium text-gray-500">
                                                KPI
                                            </p>
                                        </div>
                                        <p className="text-md font-semibold text-emerald-600">
                                            +{" "}
                                            {formatNumberWithSpaces(
                                                userStats
                                                    .financial_summary
                                                    ?.bonuses_total ||
                                                    0
                                            )}{" "}
                                            {userStats.salary_info
                                                ?.currency || "UZS"}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl flex flex-col justify-between bg-orange-50 px-2 py-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <svg
                                                className="w-5 h-5 text-orange-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>

                                            <p className="text-xs font-medium text-gray-500">
                                                Аванс
                                            </p>
                                        </div>
                                        <p className="text-md font-semibold text-red-400">
                                            -{" "}
                                            {formatNumberWithSpaces(
                                                userStats
                                                    .financial_summary
                                                    ?.advances_total ||
                                                    0
                                            )}{" "}
                                            {userStats.salary_info
                                                ?.currency || "UZS"}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl flex flex-col justify-between bg-red-50 px-2 py-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <svg
                                                className="w-5 h-5 text-red-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                />
                                            </svg>
                                            <p className="text-xs font-medium text-gray-500">
                                                Штраф за опоздание
                                            </p>
                                        </div>
                                        <p className="text-md font-semibold text-red-400">
                                            -{" "}
                                            {formatNumberWithSpaces(
                                                userStats
                                                    .financial_summary
                                                    ?.late_fines_total ||
                                                    0
                                            )}{" "}
                                            {userStats.salary_info
                                                ?.currency || "UZS"}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl flex flex-col justify-between bg-emerald-50 px-2 py-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <svg
                                                className="w-5 h-5 text-emerald-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <p className="text-xs font-medium text-gray-500">
                                                Начисленная зарплата
                                            </p>
                                        </div>
                                        <p className="text-md font-semibold text-gray-900">
                                            {formatNumberWithSpaces(
                                                userStats
                                                    .financial_summary
                                                    ?.salary_for_worked_hours ||
                                                    0
                                            )}{" "}
                                            {userStats.salary_info
                                                ?.currency || "UZS"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Fines, Bonuses, Advances */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Fines */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <h5 className="text-lg font-semibold mb-3 text-red-400 dark:text-red-400">
                                        Штрафы (
                                        {userStats.fines?.count ||
                                            0}
                                        )
                                    </h5>
                                    <p className="text-2xl font-bold text-red-400 dark:text-red-400 mb-4">
                                        {formatNumberWithSpaces(
                                            userStats.fines?.total
                                        )}{" "}
                                        {userStats.salary_info
                                            ?.currency || "UZS"}
                                    </p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {userStats.fines?.items?.map(
                                            (fine) => (
                                                <div
                                                    key={fine.id}
                                                    className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm"
                                                >
                                                    <p className="font-medium dark:text-gray-100">
                                                        {formatNumberWithSpaces(
                                                            fine.amount
                                                        )}{" "}
                                                        {userStats
                                                            .salary_info
                                                            ?.currency ||
                                                            "UZS"}
                                                    </p>
                                                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                                                        {
                                                            fine.comment
                                                        }
                                                    </p>
                                                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                                                        {formatDate(
                                                            fine.date
                                                        )}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                        {(!userStats.fines?.items ||
                                            userStats.fines.items
                                                .length === 0) && (
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                Нет штрафов
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Bonuses */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <h5 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
                                        Бонусы (
                                        {userStats.bonuses?.count ||
                                            0}
                                        )
                                    </h5>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                                        {formatNumberWithSpaces(
                                            userStats.bonuses?.total
                                        )}{" "}
                                        {userStats.salary_info
                                            ?.currency || "UZS"}
                                    </p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {userStats.bonuses?.items?.map(
                                            (bonus) => (
                                                <div
                                                    key={bonus.id}
                                                    className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm"
                                                >
                                                    <p className="font-medium dark:text-gray-100">
                                                        {formatNumberWithSpaces(
                                                            bonus.amount
                                                        )}{" "}
                                                        {userStats
                                                            .salary_info
                                                            ?.currency ||
                                                            "UZS"}
                                                    </p>
                                                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                                                        {
                                                            bonus.comment
                                                        }
                                                    </p>
                                                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                                                        {formatDate(
                                                            bonus.date
                                                        )}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                        {(!userStats.bonuses
                                            ?.items ||
                                            userStats.bonuses.items
                                                .length === 0) && (
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                Нет бонусов
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Advances */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <h5 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
                                        Авансы (
                                        {userStats.advances
                                            ?.count || 0}
                                        )
                                    </h5>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                                        {formatNumberWithSpaces(
                                            userStats.advances
                                                ?.total
                                        )}{" "}
                                        {userStats.salary_info
                                            ?.currency || "UZS"}
                                    </p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {userStats.advances?.items?.map(
                                            (advance) => (
                                                <div
                                                    key={advance.id}
                                                    className="p-2 bg-blue-50 dark:bg-orange-900/20 rounded text-sm"
                                                >
                                                    <p className="font-medium dark:text-gray-100">
                                                        {formatNumberWithSpaces(
                                                            advance.amount
                                                        )}{" "}
                                                        {userStats
                                                            .salary_info
                                                            ?.currency ||
                                                            "UZS"}
                                                    </p>
                                                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                                                        {
                                                            advance.comment
                                                        }
                                                    </p>
                                                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                                                        {formatDate(
                                                            advance.date
                                                        )}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                        {(!userStats.advances
                                            ?.items ||
                                            userStats.advances.items
                                                .length === 0) && (
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                Нет авансов
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                                Нет данных для отображения
                            </p>
                        </div>
                    )}
                </div>
            </ComponentCard>
        </>
    );
}
