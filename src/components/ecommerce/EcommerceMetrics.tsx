import { ArrowUpIcon, BoxIconLine, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import { useState, useEffect } from "react";
import { GetDataSimple } from "../../service/data";

interface MetricsData {
    total_clients: number;
    new_clients_this_month: number;
    total_contracts: number;
    new_contracts_this_month: number;
}

export default function EcommerceMetrics() {
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const response: MetricsData = await GetDataSimple(
                "api/dashboard/total-clients-orders"
            );
            if (response) {
                setMetrics(response);
            }
        } catch (error) {
            console.error("Error fetching metrics:", error);
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
                    >
                        <div className="animate-pulse">
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
                            <div className="mt-5">
                                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
                                <div className="mt-2 h-8 bg-gray-200 rounded dark:bg-gray-700 w-16"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {/* <!-- Clients Metric --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
                    <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Клиенты
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {metrics?.total_clients}
                        </h4>
                    </div>
                    {metrics && metrics.new_clients_this_month > 0 && (
                        <Badge color="success">
                            <ArrowUpIcon />+{metrics.new_clients_this_month}
                        </Badge>
                    )}
                </div>
            </div>

            {/* <!-- Contracts Metric --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
                    <BoxIconLine className="text-green-600 size-6 dark:text-green-400" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Договоры
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {metrics?.total_contracts || 0}
                        </h4>
                    </div>
                    {metrics && metrics.new_contracts_this_month > 0 && (
                        <Badge color="success">
                            <ArrowUpIcon />+{metrics.new_contracts_this_month}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}
