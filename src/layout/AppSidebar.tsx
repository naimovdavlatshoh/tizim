import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { GrMoney } from "react-icons/gr";
import { TbCategory } from "react-icons/tb";
import { TbMessageReport } from "react-icons/tb";
import { FaGift } from "react-icons/fa";

// Assume these icons are imported from an icon library
import {
    // BoxCubeIcon,
    CalenderIcon,
    ChevronDownIcon,
    GridIcon,
    GroupIcon,
    // HorizontaLDots,
    // ListIcon,
    // PageIcon,
    // PieChartIcon,
    // PlugInIcon,
    // TableIcon,
    // UserCircleIcon,
    UserIcon,
    DocsIcon,
    EnvelopeIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useSearch } from "../context/SearchContext";
// import SidebarWidget from "./SidebarWidget";

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    roles?: number[]; // role_id lar ro'yxati
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/",
        roles: [1],
    },
    {
        name: "Письма",
        icon: <EnvelopeIcon />,
        path: "/letters",
        roles: [1, 5, 6], // Faqat Admin
    },
    {
        name: "Протоколы",
        icon: <DocsIcon />,
        path: "/protocols",
        roles: [1, 5, 6], // Faqat Admin
    },
    {
        name: "Пользователи",
        icon: <UserIcon />,
        path: "/users",
        roles: [1], // Faqat Admin
    },
    {
        name: "Клиенты",
        icon: <GroupIcon />,
        path: "/clients",
        roles: [1, 2], // Admin va Director
    },
    {
        name: "Должники",
        icon: <GroupIcon />,
        path: "/debtors",
        roles: [1, 2], // Admin va Director
    },
    {
        name: "Договоры",
        icon: <DocsIcon />,
        roles: [1, 2],
        subItems: [
            { name: "Договоры", path: "/contracts" },
            { name: "Новые договоры", path: "/new-contracts" },
            { name: "Договоры в процессе", path: "/pending-contracts" },
            { name: "Завершенные договоры", path: "/completed-contracts" },
        ],
    },
    {
        name: "Мои договоры",
        icon: <DocsIcon />,
        path: "/my-contracts",
        roles: [2, 3, 4, 6],
    },
    {
        name: "Отчеты",
        icon: <TbMessageReport />,
        path: "/reports",
        roles: [1, 2, 3, 4, 5, 6], // Director va Labarant
    },
    {
        name: "Платежи",
        icon: <GrMoney />,
        path: "/payments",
        roles: [1, 2], // Admin va Director
    },
    {
        name: "Категории расходов",
        icon: <TbCategory />,
        path: "/expense-categories",
        roles: [1, 2], // Admin va Director
    },
    {
        name: "Расходы",
        icon: <GrMoney />,
        path: "/expenses",
        roles: [1, 2], // Admin va Director
    },
    // {
    //     name: "Face ID",
    //     icon: <TbFaceId />,
    //     path: "/face-id",
    //     roles: [1, 2], // Admin va Director
    // },
    {
        name: "Контракты брокера",
        icon: <DocsIcon />,
        path: "/broker-contracts",
        roles: [1, 5], // Faqat Admin
    },
    {
        name: "Бонусы",
        icon: <FaGift />,
        roles: [1],
        subItems: [
            { name: "Бонусы", path: "/bonuses" },
            { name: "Штрафы", path: "/fines" },
            { name: "Авансы зарплаты", path: "/salary-advances" },
        ],
    },
    // {
    //     name: "Штрафы",
    //     icon: <MdWarning />,
    //     path: "/fines",
    //     roles: [1], // Faqat Admin
    // },
    // {
    //     name: "Бонусы",
    //     icon: <FaGift />,
    //     path: "/bonuses",
    //     roles: [1], // Faqat Admin
    // },
    // {
    //     name: "Авансы зарплаты",
    //     icon: <FaMoneyBillWave />,
    //     path: "/salary-advances",
    //     roles: [1], // Faqat Admin
    // },
    {
        name: "Посещаемость",
        icon: <CalenderIcon />,
        path: "/attendance",
        roles: [1, 2], // Admin va Director
    },
    {
        name: "Статистика сотрудников",
        icon: <UserIcon />,
        path: "/employees",
        roles: [1, 2], // Admin va Director
    },

    // {
    //     icon: <CalenderIcon />,
    //     name: "Calendar",
    //     path: "/calendar",
    // },
    // {
    //     icon: <UserCircleIcon />,
    //     name: "User Profile",
    //     path: "/profile",
    // },
    // {
    //     name: "Forms",
    //     icon: <ListIcon />,
    //     subItems: [
    //         { name: "Form Elements", path: "/form-elements", pro: false },
    //     ],
    // },
    // {
    //     name: "Tables",
    //     icon: <TableIcon />,
    //     subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
    // },

    // {
    //     name: "Pages",
    //     icon: <PageIcon />,
    //     subItems: [
    //         { name: "Blank Page", path: "/blank", pro: false },
    //         { name: "404 Error", path: "/error-404", pro: false },
    //     ],
    // },
];

const othersItems: NavItem[] = [
    // {
    //     icon: <PieChartIcon />,
    //     name: "Charts",
    //     subItems: [
    //         { name: "Line Chart", path: "/line-chart", pro: false },
    //         { name: "Bar Chart", path: "/bar-chart", pro: false },
    //     ],
    // },
    // {
    //     icon: <BoxCubeIcon />,
    //     name: "UI Elements",
    //     subItems: [
    //         { name: "Alerts", path: "/alerts", pro: false },
    //         { name: "Avatar", path: "/avatars", pro: false },
    //         { name: "Badge", path: "/badge", pro: false },
    //         { name: "Buttons", path: "/buttons", pro: false },
    //         { name: "Images", path: "/images", pro: false },
    //         { name: "Videos", path: "/videos", pro: false },
    //     ],
    // },
    // {
    //     icon: <PlugInIcon />,
    //     name: "Authentication",
    //     subItems: [
    //         { name: "Sign In", path: "/signin", pro: false },
    //         { name: "Sign Up", path: "/signup", pro: false },
    //     ],
    // },
];

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const { setCurrentPage } = useSearch();
    const location = useLocation();

    // Get user role from localStorage
    const userRole = parseInt(localStorage.getItem("role_id") || "");

    // Filter navigation items based on user role
    const filteredNavItems = navItems.filter(
        (item) => !item.roles || item.roles.includes(userRole)
    );

    const [openSubmenu, setOpenSubmenu] = useState<{
        type: "main" | "others";
        index: number;
    } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
        {}
    );
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // const isActive = (path: string) => location.pathname === path;
    const isActive = useCallback(
        (path: string) => location.pathname === path,
        [location.pathname]
    );

    useEffect(() => {
        let submenuMatched = false;
        ["main", "others"].forEach((menuType) => {
            const items = menuType === "main" ? navItems : othersItems;
            items.forEach((nav, index) => {
                if (nav.subItems) {
                    nav.subItems.forEach((subItem) => {
                        if (isActive(subItem.path)) {
                            setOpenSubmenu({
                                type: menuType as "main" | "others",
                                index,
                            });
                            submenuMatched = true;
                        }
                    });
                }
            });
        });

        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [location, isActive]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0,
                }));
            }
        }
    }, [openSubmenu]);

    // Set current page for search context
    useEffect(() => {
        const path = location.pathname;
        if (path === "/expenses") {
            setCurrentPage("expenses");
        } else if (path === "/faceid") {
            setCurrentPage("faceid");
        } else if (path === "/expense-categories") {
            setCurrentPage("expense-categories");
        } else if (path === "/clients") {
            setCurrentPage("clients");
        } else if (path === "/contracts") {
            setCurrentPage("contracts");
        } else if (path === "/payments") {
            setCurrentPage("payments");
        } else if (path === "/users") {
            setCurrentPage("users");
        } else if (path === "/letters") {
            setCurrentPage("letters");
        } else if (path === "/broker-contracts") {
            setCurrentPage("broker-contracts");
        } else if (path === "/fines") {
            setCurrentPage("fines");
        } else if (path === "/bonuses") {
            setCurrentPage("bonuses");
        } else if (path === "/salary-advances") {
            setCurrentPage("salary-advances");
        } else {
            setCurrentPage("");
        }
    }, [location.pathname, setCurrentPage]);

    const handleSubmenuToggle = (
        index: number,
        menuType: "main" | "others"
    ) => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (
                prevOpenSubmenu &&
                prevOpenSubmenu.type === menuType &&
                prevOpenSubmenu.index === index
            ) {
                return null;
            }
            return { type: menuType, index };
        });
    };

    const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
        <ul className="flex flex-col gap-4">
            {items.map((nav, index) => (
                <li key={nav.name}>
                    {nav.subItems ? (
                        <button
                            onClick={() => handleSubmenuToggle(index, menuType)}
                            className={`menu-item group ${
                                openSubmenu?.type === menuType &&
                                openSubmenu?.index === index
                                    ? "menu-item-active"
                                    : "menu-item-inactive"
                            } cursor-pointer ${
                                !isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "lg:justify-start"
                            }`}
                        >
                            <span
                                className={`menu-item-icon-size  ${
                                    openSubmenu?.type === menuType &&
                                    openSubmenu?.index === index
                                        ? "menu-item-icon-active"
                                        : "menu-item-icon-inactive"
                                }`}
                            >
                                {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">
                                    {nav.name}
                                </span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <ChevronDownIcon
                                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? "rotate-180 text-brand-500"
                                            : ""
                                    }`}
                                />
                            )}
                        </button>
                    ) : (
                        nav.path && (
                            <Link
                                to={nav.path}
                                className={`menu-item group ${
                                    isActive(nav.path)
                                        ? "menu-item-active"
                                        : "menu-item-inactive"
                                }`}
                            >
                                <span
                                    className={`menu-item-icon-size ${
                                        isActive(nav.path)
                                            ? "menu-item-icon-active"
                                            : "menu-item-icon-inactive"
                                    }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">
                                        {nav.name}
                                    </span>
                                )}
                            </Link>
                        )
                    )}
                    {nav.subItems &&
                        (isExpanded || isHovered || isMobileOpen) && (
                            <div
                                ref={(el) => {
                                    subMenuRefs.current[
                                        `${menuType}-${index}`
                                    ] = el;
                                }}
                                className="overflow-hidden transition-all duration-300"
                                style={{
                                    height:
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? `${
                                                  subMenuHeight[
                                                      `${menuType}-${index}`
                                                  ]
                                              }px`
                                            : "0px",
                                }}
                            >
                                <ul className="mt-2 space-y-1 ml-9">
                                    {nav.subItems.map((subItem) => (
                                        <li key={subItem.name}>
                                            <Link
                                                to={subItem.path}
                                                className={`menu-dropdown-item ${
                                                    isActive(subItem.path)
                                                        ? "menu-dropdown-item-active"
                                                        : "menu-dropdown-item-inactive"
                                                }`}
                                            >
                                                {subItem.name}
                                                <span className="flex items-center gap-1 ml-auto">
                                                    {subItem.new && (
                                                        <span
                                                            className={`ml-auto ${
                                                                isActive(
                                                                    subItem.path
                                                                )
                                                                    ? "menu-dropdown-badge-active"
                                                                    : "menu-dropdown-badge-inactive"
                                                            } menu-dropdown-badge`}
                                                        >
                                                            new
                                                        </span>
                                                    )}
                                                    {subItem.pro && (
                                                        <span
                                                            className={`ml-auto ${
                                                                isActive(
                                                                    subItem.path
                                                                )
                                                                    ? "menu-dropdown-badge-active"
                                                                    : "menu-dropdown-badge-inactive"
                                                            } menu-dropdown-badge`}
                                                        >
                                                            pro
                                                        </span>
                                                    )}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
            isExpanded || isMobileOpen
                ? "w-[290px]"
                : isHovered
                ? "w-[290px]"
                : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="px-0 pt-5">
                <img src="logo.jpg" alt="logo" className="w-1/3" />
            </div>

            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                }`}
                            ></h2>
                            {renderMenuItems(filteredNavItems, "main")}
                        </div>
                        {localStorage.getItem("role_id") == "1" && (
                            <a
                                href="https://cbu.uz/"
                                target="_blank"
                                rel="noreferrer"
                                title="Центральный банк Республики Узбекистан"
                            >
                                <img
                                    src="https://cbu.uz/ru/informer/?txtclr=212121&brdclr=FFC700&bgclr=FFE27D&r_choose=USD_EUR_RUB"
                                    alt=""
                                />
                            </a>
                        )}
                        {/* <div className="">
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Others"
                                ) : (
                                    <HorizontaLDots />
                                )}
                            </h2>
                            {renderMenuItems(othersItems, "others")}
                        </div> */}
                    </div>
                </nav>
                {/* {isExpanded || isHovered || isMobileOpen ? (
                    <SidebarWidget />
                ) : null} */}
            </div>
        </aside>
    );
};

export default AppSidebar;
