import React from "react";
// import GridShape from "../../components/common/GridShape";
// import { Link } from "react-router";
// import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
                {children}
                <div className="items-center hidden w-full h-full lg:w-1/2  lg:grid">
                    <img className="w-full h-full object-contain" src={"/logo.jpg"} alt="" />
                </div>

            </div>
        </div>
    );
}
