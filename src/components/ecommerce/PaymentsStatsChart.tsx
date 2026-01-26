import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { GetDataSimple } from "../../service/data";
import { formatAmount } from "../../utils/numberFormat";

interface MonthlyData {
    month: number;
    month_name: string;
    expected: number;
    actual: number;
    expenses: number;
    balance: number;
    fulfillment_rate: number;
}

interface Labels {
    expected: string;
    actual: string;
    expenses: string;
    balance: string;
    fulfillment_rate: string;
}

interface Summary {
    total_expected: number;
    total_actual: number;
    total_expenses: number;
    total_balance: number;
    overall_fulfillment_rate: number;
}

interface PaymentsStatsData {
    year: number;
    month: number | null;
    labels: Labels;
    summary: Summary;
    monthly_data: MonthlyData[];
}

export default function PaymentsStatsChart() {
    const [chartData, setChartData] = useState<PaymentsStatsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async (year: number) => {
        try {
            setLoading(true);
            const response = await GetDataSimple(
                `api/dashboard/payments/stats?year=${year}`
            );
            // Handle different possible response structures
            const data = response?.result || response?.data || response;
            setChartData(data || null);
        } catch (error) {
            console.error("Error fetching payments stats data:", error);
            setChartData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const selectedYear = parseInt(localStorage.getItem("selectedYear") || "2026");
        fetchData(selectedYear);

        // Listen for storage changes to update when year changes
        const handleStorageChange = () => {
            const newYear = parseInt(localStorage.getItem("selectedYear") || "2026");
            fetchData(newYear);
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
                <div className="flex items-center justify-center h-[450px]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600 dark:text-gray-400">
                            Загрузка данных...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const selectedYear = chartData?.year || parseInt(localStorage.getItem("selectedYear") || "2026");

    if (!chartData || !chartData.monthly_data || chartData.monthly_data.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <p>Нет данных о платежах за {selectedYear} год</p>
                </div>
            </div>
        );
    }

    // Extract months data
    const monthlyData = chartData.monthly_data || [];
    const monthNames = monthlyData.map((month) => month.month_name);
    const expectedData = monthlyData.map((month) => month.expected);
    const actualData = monthlyData.map((month) => month.actual);
    const expensesData = monthlyData.map((month) => month.expenses);
    const balanceData = monthlyData.map((month) => month.balance);

    const labels = chartData.labels || {
        expected: "Ожидаемые оплаты",
        actual: "Фактические оплаты",
        expenses: "Расходы",
        balance: "Баланс",
        fulfillment_rate: "Процент выполнения",
    };

    const summary = chartData.summary || {
        total_expected: 0,
        total_actual: 0,
        total_expenses: 0,
        total_balance: 0,
        overall_fulfillment_rate: 0,
    };

    const options: ApexOptions = {
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "right",
            fontSize: "14px",
            fontFamily: "Outfit, sans-serif",
        },
        colors: ["#10B981", "#3B82F6", "#EF4444", "#F59E0B"], // Green, Blue, Red, Yellow
        chart: {
            fontFamily: "Outfit, sans-serif",
            height: 310,
            type: "line",
            toolbar: {
                show: false,
            },
        },
        stroke: {
            curve: "smooth",
            width: [3, 3, 3, 3],
        },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.2,
                opacityTo: 0.05,
            },
        },
        markers: {
            size: 4,
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 8,
            },
        },
        grid: {
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            enabled: true,
            shared: true,
            intersect: false,
            y: {
                formatter: function (val) {
                    return formatAmount(val) + " сум";
                },
            },
        },
        xaxis: {
            type: "category",
            categories: monthNames,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            tooltip: {
                enabled: false,
            },
            labels: {
                style: {
                    fontSize: "12px",
                    colors: "#6B7280",
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: "12px",
                    colors: ["#6B7280"],
                },
                formatter: function (val) {
                    return formatAmount(val);
                },
            },
            title: {
                style: {
                    fontSize: "12px",
                    color: "#6B7280",
                },
            },
        },
    };

    const series = [
        {
            name: labels.expected,
            data: expectedData,
        },
        {
            name: labels.actual,
            data: actualData,
        },
        {
            name: labels.expenses,
            data: expensesData,
        },
        {
            name: labels.balance,
            data: balanceData,
        },
    ];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
                <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Статистика платежей
                    </h3>
                    <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                        Месячная статистика по платежам за {selectedYear} год
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {labels.expected}
                    </span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        {formatAmount(summary.total_expected)} сум
                    </h4>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {labels.actual}
                    </span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        {formatAmount(summary.total_actual)} сум
                    </h4>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {labels.expenses}
                    </span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        {formatAmount(summary.total_expenses)} сум
                    </h4>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {labels.balance}
                    </span>
                    <h4
                        className={`mt-2 font-bold text-title-sm ${
                            summary.total_balance >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                        }`}
                    >
                        {formatAmount(summary.total_balance)} сум
                    </h4>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {labels.fulfillment_rate}
                    </span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        {summary.overall_fulfillment_rate.toFixed(2)}%
                    </h4>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-[1000px] xl:min-w-full">
                    <Chart
                        options={options}
                        series={series}
                        type="area"
                        height={450}
                    />
                </div>
            </div>
        </div>
    );
}
