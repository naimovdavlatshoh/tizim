import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { GetDataSimple } from "../../service/data";
import Select from "../form/Select";
import { formatAmount } from "../../utils/numberFormat";

interface WorkerMonth {
    month_number: number;
    month_name: string;
    total_earned: number;
}

interface Worker {
    user_id: number;
    worker_name: string;
    months: WorkerMonth[];
}

interface WorkersEarningsData {
    year: number;
    workers: Worker[];
}

export default function WorkersEarningsChart() {
    const [chartData, setChartData] = useState<WorkersEarningsData | null>(
        null
    );
    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [loading, setLoading] = useState<boolean>(true);
    const [availableYears] = useState<number[]>([2024, 2025, 2026]);

    const fetchData = async (year: number) => {
        try {
            setLoading(true);
            console.log("Fetching data for year:", year);
            const response = await GetDataSimple(
                `api/dashboard/worker-percent?year=${year}`
            );
            console.log("API Response:", response);
            console.log("Response result:", response?.result);
            console.log("Response data:", response?.data);
            setChartData(response || response?.data?.result || null);
        } catch (error) {
            console.error("Error fetching workers earnings data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(selectedYear);
    }, [selectedYear]);

    const handleYearChange = (value: string) => {
        setSelectedYear(parseInt(value));
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (!chartData || !chartData.workers || chartData.workers.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <p>
                        Нет данных о заработке работников за {selectedYear} год
                    </p>
                    <p className="text-sm mt-2">
                        API: api/dashboard/worker-percent?year={selectedYear}
                    </p>
                    <p className="text-sm">
                        Данные: {JSON.stringify(chartData)}
                    </p>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const months =
        chartData.workers[0]?.months.map((month) => month.month_name) || [];
    const series = chartData.workers.map((worker) => ({
        name: worker.worker_name,
        data: worker.months.map((month) => month.total_earned),
    }));

    const options: ApexOptions = {
        chart: {
            type: "line",
            height: 350,
            toolbar: {
                show: true,
            },
        },
        title: {
            text: `Заработок работников за ${selectedYear} год`,
            align: "left",
            style: {
                fontSize: "16px",
                fontWeight: "600",
            },
        },
        xaxis: {
            categories: months,
            title: {
                text: "Месяцы",
            },
        },
        yaxis: {
            title: {
                text: "Сумма (сум)",
            },
            labels: {
                formatter: function (value) {
                    return formatAmount(value);
                },
            },
        },
        colors: [
            "#3B82F6", // Blue
            "#10B981", // Green
            "#F59E0B", // Yellow
            "#EF4444", // Red
            "#8B5CF6", // Purple
            "#06B6D4", // Cyan
            "#84CC16", // Lime
            "#F97316", // Orange
        ],
        stroke: {
            curve: "smooth",
            width: 3,
        },
        markers: {
            size: 5,
            hover: {
                size: 7,
            },
        },
        legend: {
            position: "top",
            horizontalAlign: "right",
        },
        tooltip: {
            y: {
                formatter: function (value) {
                    return formatAmount(value) + " сум";
                },
            },
        },
        grid: {
            borderColor: "#f1f5f9",
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Заработок работников
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Месячная статистика по заработку работников
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Год:
                        </label>
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
            <div className="p-6">
                <Chart
                    options={options}
                    series={series}
                    type="line"
                    height={350}
                />
            </div>
        </div>
    );
}
