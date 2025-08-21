import { ReactNode } from "react";
import { Link } from "react-router";

interface LinkProps {
    children: ReactNode; // Button text or content
    to: string;
    size?: "sm" | "md" | "xs"; // Button size
    variant?: "primary" | "outline" | "danger"; // Button variant
    startIcon?: ReactNode; // Icon before the text
    endIcon?: ReactNode; // Icon after the text
    onClick?: () => void; // Click handler
    disabled?: boolean; // Disabled state
    className?: string; // Disabled state
}

const Linkto: React.FC<LinkProps> = ({
    children,
    to,
    size = "md",
    variant = "primary",
    startIcon,
    endIcon,
    onClick,
    className = "",
    disabled = false,
}) => {
    // Size Classes
    const sizeClasses = {
        xs: "px-2 py-2 text-xs",
        sm: "px-4 py-3 text-sm",
        md: "px-5 py-3.5 text-sm",
    };

    // Variant Classes
    const variantClasses = {
        primary:
            "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
        danger: "bg-red-500 text-white shadow-theme-xs hover:bg-red-600 disabled:bg-red-300",
        outline:
            "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
    };

    return (
        <Link
            to={to}
            className={`inline-flex items-center justify-center gap-2 rounded-lg transition ${className} ${
                sizeClasses[size]
            } ${variantClasses[variant]} ${
                disabled ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={onClick}
            // disabled={disabled}
        >
            {startIcon && (
                <span className="flex items-center">{startIcon}</span>
            )}
            {children}
            {endIcon && <span className="flex items-center">{endIcon}</span>}
        </Link>
    );
};

export default Linkto;
