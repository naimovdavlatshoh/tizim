import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import WorkersEarningsChart from "../../components/ecommerce/WorkersEarningsChart";

import PageMeta from "../../components/common/PageMeta";

export default function Home() {
    return (
        <>
            <PageMeta title="BNM Tizim" description="" />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-12">
                    <EcommerceMetrics />

                    {/* <MonthlySalesChart /> */}
                </div>

                {/* <div className="col-span-12 xl:col-span-5">
                    <MonthlyTarget />
                </div> */}

                <div className="col-span-12">
                    <StatisticsChart />
                </div>

                <div className="col-span-12">
                    <WorkersEarningsChart />
                </div>
                {/*
                <div className="col-span-12 xl:col-span-5">
                    <DemographicCard />
                </div>

                <div className="col-span-12 xl:col-span-7">
                    <RecentOrders />
                </div> */}
            </div>
        </>
    );
}
