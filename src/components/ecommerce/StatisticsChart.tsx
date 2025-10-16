import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { GetDataSimple } from "../../service/data";
import Select from "../form/Select";

interface MonthlyData {
    year: number;
    month_number: number;
    month_name: string;
    total_income: number;
    total_expense: number;
}

interface StatisticsChartProps {
    data?: MonthlyData[];
}

export default function StatisticsChart({ data }: StatisticsChartProps) {
    const [chartData, setChartData] = useState<MonthlyData[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [loading, setLoading] = useState(false);
    const [availableYears] = useState<number[]>([
        2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030,
    ]);

    // Fetch data from API
    const fetchData = async (year: number) => {
        setLoading(true);
        try {
            const response: MonthlyData[] = await GetDataSimple(
                `api/dashboard/total-payments-expenses?year=${year}`
            );
            if (response && Array.isArray(response)) {
                setChartData(response);
            } else {
                // Fallback to default data if API fails
                setChartData(data || []);
            }
        } catch (error) {
            console.error("Error fetching chart data:", error);
            // Fallback to default data on error
            setChartData(data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (data) {
            setChartData(data);
        } else {
            fetchData(selectedYear);
        }
    }, [selectedYear, data]);

    const handleYearChange = (value: string) => {
        const year = parseInt(value);
        setSelectedYear(year);
        if (!data) {
            fetchData(year);
        }
    };

    const options: ApexOptions = {
        legend: {
            show: true, // Show legend
            position: "top",
            horizontalAlign: "right",
            fontSize: "14px",
            fontFamily: "Outfit, sans-serif",
        },
        colors: ["#10B981", "#EF4444"], // Green for income, Red for expense
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
            width: [3, 3], // Thicker lines for better visibility
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
            y: {
                formatter: function (val) {
                    return new Intl.NumberFormat("ru-RU").format(val) + " сум";
                },
            },
        },
        xaxis: {
            type: "category",
            categories: chartData.map((item) => item.month_name),
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
                    return new Intl.NumberFormat("ru-RU", {
                        notation: "compact",
                        compactDisplay: "short",
                    }).format(val);
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
            name: "Доходы",
            data: chartData.map((item) => item.total_income),
        },
        {
            name: "Расходы",
            data: chartData.map((item) => item.total_expense),
        },
    ];
    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
                <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Статистика доходов и расходов
                    </h3>
                    <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                        Месячная статистика по доходам и расходам
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-48">
                        <Select
                            defaultValue={selectedYear.toString()}
                            onChange={handleYearChange}
                            options={availableYears.map((year) => ({
                                value: year,
                                label: year.toString(),
                            }))}
                            placeholder="Выберите год"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-[1000px] xl:min-w-full">
                    {loading ? (
                        <div className="flex items-center justify-center h-[450px]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-gray-600 dark:text-gray-400">
                                    Загрузка данных...
                                </span>
                            </div>
                        </div>
                    ) : (
                        <Chart
                            options={options}
                            series={series}
                            type="area"
                            height={450}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
