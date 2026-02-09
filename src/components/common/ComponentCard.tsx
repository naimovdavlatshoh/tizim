interface ComponentCardProps {
    title: string;
    children: React.ReactNode;
    className?: string; // Additional custom classes for styling
    desc?: React.ReactNode; // Description text
}

const ComponentCard: React.FC<ComponentCardProps> = ({
    title,
    children,
    className = "",
    desc = "",
}) => {
    return (
        <div
            className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
        >
            {/* Card Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                    {title}
                </h3>
                {desc && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {desc}
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="p-3 sm:p-4 md:p-6 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-6">{children}</div>
            </div>
        </div>
    );
};

export default ComponentCard;
