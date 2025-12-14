import { useEffect, useState } from "react";
import { GetDataSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import { useSearchParams } from "react-router";

interface User {
    user_id: number;
    firstname: string;
    lastname: string;
    fathername: string;
    login: string;
    photo_url?: string | null;
    role_id?: number;
    employeeNoString?: number | string | null;
}

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

export default function EmployeeList() {
    const [searchParams] = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchUsers();
    }, []);

    // Check for user_id in URL params
    useEffect(() => {
        const userIdParam = searchParams.get("user_id");
        if (userIdParam) {
            const userId = Number(userIdParam);
            if (!isNaN(userId)) {
                setSelectedUserId(userId);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (selectedUserId) {
            fetchUserStats(selectedUserId);
        }
    }, [selectedUserId, currentMonth, currentYear]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                "api/user/list?page=1&limit=100"
            );
            const usersData = response?.result || response?.data?.result || [];
            setUsers(Array.isArray(usersData) ? usersData : []);

            // Check if user_id is in URL params first
            const userIdParam = searchParams.get("user_id");
            if (userIdParam) {
                const userId = Number(userIdParam);
                if (!isNaN(userId) && !selectedUserId) {
                    setSelectedUserId(userId);
                    return;
                }
            }

            // Auto-select first user with Face ID if available and no user selected
            if (usersData.length > 0 && !selectedUserId) {
                const userWithFaceId = usersData.find(
                    (user: User) => user.employeeNoString
                );
                if (userWithFaceId) {
                    setSelectedUserId(userWithFaceId.user_id);
                } else if (usersData.length > 0) {
                    setSelectedUserId(usersData[0].user_id);
                }
            }
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast.error(error?.response?.data?.error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async (userId: number) => {
        setLoadingStats(true);
        try {
            const response: any = await GetDataSimple(
                `api/user/stats?user_id=${userId}&month=${currentMonth}&year=${currentYear}`
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

    const handleUserClick = (userId: number) => {
        setSelectedUserId(userId);
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

    const getStatusColor = (status: string, dayType: string) => {
        if (dayType === "weekend")
            return "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
        if (dayType === "future")
            return "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500";
        if (status.includes("Пришёл вовремя"))
            return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
        if (status.includes("Опоздал"))
            return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
        if (status.includes("Отсутствовал"))
            return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="Статистика сотрудников" description="Статистика сотрудников" />
            <PageBreadcrumb pageTitle="Статистика сотрудников" />
            <ComponentCard title="Статистика сотрудников" desc="">
                <div className="flex gap-6 h-[calc(100vh-250px)]">
                    {/* Left Sidebar - Users List */}
                    <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 pr-6 overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">
                            Список сотрудников
                        </h3>
                        <div className="space-y-2">
                            {users.map((user) => {
                                const hasFaceId = !!user.employeeNoString;
                                return (
                                    <div
                                        key={user.user_id}
                                        onClick={() => {
                                            handleUserClick(user.user_id);
                                        }}
                                        className={`p-4 rounded-lg transition-colors ${
                                            selectedUserId === user.user_id
                                                ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-600 cursor-pointer"
                                                : "bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {user.photo_url ? (
                                                <img
                                                    src={user.photo_url}
                                                    alt={`${user.firstname} ${user.lastname}`}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                    <span className="text-gray-600 dark:text-gray-300 font-semibold">
                                                        {user.firstname?.[0]?.toUpperCase() ||
                                                            "U"}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {user.firstname}{" "}
                                                    {user.lastname}
                                                </p>
                                                {user.fathername && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {user.fathername}
                                                    </p>
                                                )}
                                                {!hasFaceId && (
                                                    <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                                                        Не подключен к Face ID
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side - User Stats */}
                    <div className="flex-1 overflow-y-auto pr-2">
                        {selectedUserId ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold dark:text-gray-100">
                                        Статистика сотрудника
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-40">
                                            <Select
                                                options={monthOptions}
                                                placeholder="Выберите месяц"
                                                onChange={(value) =>
                                                    setCurrentMonth(
                                                        Number(value)
                                                    )
                                                }
                                                className="dark:bg-dark-900"
                                                defaultValue={currentMonth.toString()}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Select
                                                options={yearOptions}
                                                placeholder="Выберите год"
                                                onChange={(value) =>
                                                    setCurrentYear(
                                                        Number(value)
                                                    )
                                                }
                                                className="dark:bg-dark-900"
                                                defaultValue={currentYear.toString()}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {loadingStats ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : userStats ? (
                                    <div className="space-y-6">
                                        {/* User Info & Period */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-xl font-bold dark:text-gray-100">
                                                        {userStats.user_info
                                                            ?.fullname || "-"}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        ID сотрудника:{" "}
                                                        {userStats.user_info
                                                            ?.employeeNo || "-"}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold dark:text-gray-100">
                                                        {userStats.period
                                                            ?.display || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Базовая зарплата
                                                    </p>
                                                    <p className="text-base font-medium dark:text-gray-100">
                                                        {formatNumberWithSpaces(
                                                            userStats
                                                                .salary_info
                                                                ?.base_salary
                                                        )}{" "}
                                                        {userStats.salary_info
                                                            ?.currency || "UZS"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Ставка за час
                                                    </p>
                                                    <p className="text-base font-medium dark:text-gray-100">
                                                        {formatNumberWithSpaces(
                                                            userStats
                                                                .salary_info
                                                                ?.hourly_rate
                                                        )}{" "}
                                                        {userStats.salary_info
                                                            ?.currency || "UZS"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Штраф за опоздание
                                                    </p>
                                                    <p className="text-base font-medium dark:text-gray-100">
                                                        {formatNumberWithSpaces(
                                                            userStats
                                                                .salary_info
                                                                ?.fine_per_late
                                                        )}{" "}
                                                        {userStats.salary_info
                                                            ?.currency || "UZS"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Work Summary */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                            <h4 className="text-lg font-semibold mb-4 dark:text-gray-100">
                                                Сводка по работе
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                        Отработано
                                                    </p>
                                                    <p className="text-lg font-semibold dark:text-gray-100">
                                                        {userStats.work_summary
                                                            ?.worked_minutes_text ||
                                                            "0 мин"}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                        {userStats.work_summary
                                                            ?.worked_hours ||
                                                            0}{" "}
                                                        часов
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                        Сверхурочные
                                                    </p>
                                                    <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                        {userStats.work_summary
                                                            ?.overtime_minutes_text ||
                                                            "0 мин"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                        Полных дней
                                                    </p>
                                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                        {userStats.work_summary
                                                            ?.valid_days || 0}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                        Опозданий
                                                    </p>
                                                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                                        {userStats.work_summary
                                                            ?.late_days || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financial Summary */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                            <h4 className="text-lg font-semibold mb-4 dark:text-gray-100">
                                                Финансовая сводка
                                            </h4>
                                            <div className="space-y-3 mb-4">
                                                {userStats.financial_summary?.breakdown?.map(
                                                    (item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="font-medium dark:text-gray-100">
                                                                    {item.type}
                                                                </p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {
                                                                        item.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`text-lg font-bold ${
                                                                        item.operation ===
                                                                        "+"
                                                                            ? "text-green-600 dark:text-green-400"
                                                                            : "text-red-600 dark:text-red-400"
                                                                    }`}
                                                                >
                                                                    {
                                                                        item.operation
                                                                    }{" "}
                                                                    {formatNumberWithSpaces(
                                                                        item.amount
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-lg font-semibold dark:text-gray-100">
                                                        Итого к выплате
                                                    </p>
                                                    <p
                                                        className={`text-2xl font-bold ${
                                                            (userStats
                                                                .financial_summary
                                                                ?.total_salary ||
                                                                0) >= 0
                                                                ? "text-green-600 dark:text-green-400"
                                                                : "text-red-600 dark:text-red-400"
                                                        }`}
                                                    >
                                                        {formatNumberWithSpaces(
                                                            userStats
                                                                .financial_summary
                                                                ?.total_salary
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
                                                <h5 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
                                                    Штрафы (
                                                    {userStats.fines?.count ||
                                                        0}
                                                    )
                                                </h5>
                                                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
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
                                                <h5 className="text-lg font-semibold mb-3 text-orange-600 dark:text-orange-400">
                                                    Авансы (
                                                    {userStats.advances
                                                        ?.count || 0}
                                                    )
                                                </h5>
                                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-4">
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
                                                                className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-sm"
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

                                        {/* Daily Details Calendar */}
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                            <h4 className="text-lg font-semibold mb-4 dark:text-gray-100">
                                                Детали по дням
                                            </h4>
                                            <div className="grid grid-cols-7 gap-2">
                                                {Object.entries(
                                                    userStats.daily_details ||
                                                        {}
                                                )
                                                    .sort(([dateA], [dateB]) =>
                                                        dateA.localeCompare(
                                                            dateB
                                                        )
                                                    )
                                                    .map(([date, details]) => {
                                                        const dayNumber =
                                                            new Date(
                                                                date
                                                            ).getDate();
                                                        return (
                                                            <div
                                                                key={date}
                                                                className={`p-3 rounded-lg border text-center ${getStatusColor(
                                                                    details.status,
                                                                    details.day_type
                                                                )}`}
                                                            >
                                                                <p className="text-xs font-medium mb-1">
                                                                    {dayNumber}
                                                                </p>
                                                                <p className="text-xs mb-1">
                                                                    {
                                                                        details.status
                                                                    }
                                                                </p>
                                                                {details.in && (
                                                                    <p className="text-xs opacity-75">
                                                                        В:{" "}
                                                                        {new Date(
                                                                            details.in
                                                                        ).toLocaleTimeString(
                                                                            "ru-RU",
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            }
                                                                        )}
                                                                    </p>
                                                                )}
                                                                {details.out && (
                                                                    <p className="text-xs opacity-75">
                                                                        И:{" "}
                                                                        {new Date(
                                                                            details.out
                                                                        ).toLocaleTimeString(
                                                                            "ru-RU",
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            }
                                                                        )}
                                                                    </p>
                                                                )}
                                                                {details.workedMinutes >
                                                                    0 && (
                                                                    <p className="text-xs font-semibold mt-1">
                                                                        {
                                                                            details.workedMinutes_text
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
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
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Выберите сотрудника для просмотра статистики
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </ComponentCard>
        </>
    );
}
