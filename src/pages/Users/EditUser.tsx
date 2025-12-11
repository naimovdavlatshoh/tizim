import React, { useEffect, useState, useRef, useCallback } from "react";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import {
    PostDataTokenJson,
    PostSimpleFormData,
    GetDataSimple,
} from "../../service/data";
import { toast } from "react-hot-toast";

interface EditUserModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    setResponse: (value: string) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    changeStatus,
    setResponse,
    user,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [fathername, setFathername] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState<number | null>(null);
    const [employeeNoString, setEmployeeNoString] = useState<string>("");
    const [fineBeingLate, setFineBeingLate] = useState<string>("");
    const [displayFineBeingLate, setDisplayFineBeingLate] = useState("");
    const [salary, setSalary] = useState<string>("");
    const [displaySalary, setDisplaySalary] = useState("");
    const [hourlyRate, setHourlyRate] = useState<number | null>(null);
    const [isSalaryChecked, setIsSalaryChecked] = useState(false);
    const [isCheckingSalary, setIsCheckingSalary] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [faceIdEmployees, setFaceIdEmployees] = useState<any[]>([]);
    const [loadingFaceId, setLoadingFaceId] = useState(false);
    const salaryCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const options = [
        { value: 1, label: "Директор" },
        { value: 2, label: "Бухгалтер" },
        { value: 3, label: "Эксперт" },
        { value: 4, label: "Лаборант" },
        { value: 5, label: "Брокер" },
        { value: 6, label: "Начальник лаборатория" },
    ];

    const handleSelectChange = (value: string) => {
        setRoleId(Number(value));
    };

    useEffect(() => {
        if (isOpen) {
            fetchFaceIdEmployees();
        } else {
            // Clear timeout when modal closes
            if (salaryCheckTimeoutRef.current) {
                clearTimeout(salaryCheckTimeoutRef.current);
            }
        }
    }, [isOpen]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (salaryCheckTimeoutRef.current) {
                clearTimeout(salaryCheckTimeoutRef.current);
            }
        };
    }, []);

    const fetchFaceIdEmployees = async () => {
        setLoadingFaceId(true);
        try {
            const response: any = await GetDataSimple("api/user/faceid");
            const employeesData =
                response?.result || response?.data || response || [];
            setFaceIdEmployees(
                Array.isArray(employeesData) ? employeesData : []
            );
        } catch (error: any) {
            console.error("Error fetching faceid employees:", error);
            toast.error("Ошибка при загрузке списка Face ID");
            setFaceIdEmployees([]);
        } finally {
            setLoadingFaceId(false);
        }
    };

    const formatNumberWithSpaces = (value: string) => {
        const cleanValue = value.replace(/\s/g, "");
        const parts = cleanValue.split(".");
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    };

    const handleFineBeingLateChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        // Remove all non-numeric characters except decimal point and spaces
        const cleanValue = value.replace(/[^0-9.\s]/g, "");

        // Remove spaces for processing
        const numericValue = cleanValue.replace(/\s/g, "");

        // Ensure only one decimal point
        const parts = numericValue.split(".");
        if (parts.length > 2) {
            return;
        }

        // Limit decimal places to 2
        if (parts[1] && parts[1].length > 2) {
            return;
        }

        // Format with spaces for display
        const formattedValue = formatNumberWithSpaces(numericValue);

        // Update both display and form data
        setDisplayFineBeingLate(formattedValue);
        setFineBeingLate(numericValue);
    };

    const handleCheckSalary = useCallback(async (salaryValue: string) => {
        if (!salaryValue || salaryValue.trim() === "") {
            setIsSalaryChecked(false);
            setHourlyRate(null);
            return;
        }

        setIsCheckingSalary(true);
        try {
            const response: any = await GetDataSimple(
                `api/user/salary/rate?salary=${salaryValue}`
            );
            // Assuming response contains hourly rate, adjust based on actual API response structure
            const rate =
                response?.rate ||
                response?.data?.rate ||
                response?.hourly_rate ||
                response;
            if (rate) {
                setHourlyRate(typeof rate === "number" ? rate : Number(rate));
                setIsSalaryChecked(true);
            } else {
                setIsSalaryChecked(false);
                setHourlyRate(null);
            }
        } catch (error: any) {
            console.error("Error checking salary:", error);
            setIsSalaryChecked(false);
            setHourlyRate(null);
        } finally {
            setIsCheckingSalary(false);
        }
    }, []);

    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Remove all non-numeric characters except decimal point and spaces
        const cleanValue = value.replace(/[^0-9.\s]/g, "");

        // Remove spaces for processing
        const numericValue = cleanValue.replace(/\s/g, "");

        // Ensure only one decimal point
        const parts = numericValue.split(".");
        if (parts.length > 2) {
            return;
        }

        // Limit decimal places to 2
        if (parts[1] && parts[1].length > 2) {
            return;
        }

        // Format with spaces for display
        const formattedValue = formatNumberWithSpaces(numericValue);

        // Update both display and form data
        setDisplaySalary(formattedValue);
        setSalary(numericValue);
        // Reset check status when salary changes
        setIsSalaryChecked(false);
        setHourlyRate(null);

        // Clear previous timeout
        if (salaryCheckTimeoutRef.current) {
            clearTimeout(salaryCheckTimeoutRef.current);
        }

        // If value is empty, don't send request
        if (!numericValue || numericValue.trim() === "") {
            return;
        }

        // Send request immediately
        handleCheckSalary(numericValue);
    };

    // User ma'lumotlarini yuklash
    useEffect(() => {
        if (user) {
            setFirstname(user?.firstname || "");
            setLastname(user?.lastname || "");
            setFathername(user?.fathername || "");
            setLogin(user?.login || "");
            setRoleId(user?.role_id || null);
            setEmployeeNoString(user?.employeeNoString?.toString() || "");
            const fineValue = user?.fine_being_late?.toString() || "";
            setFineBeingLate(fineValue);
            setDisplayFineBeingLate(
                fineValue ? formatNumberWithSpaces(fineValue) : ""
            );
            const salaryValue = user?.salary?.toString() || "";
            setSalary(salaryValue);
            setDisplaySalary(
                salaryValue ? formatNumberWithSpaces(salaryValue) : ""
            );
            // Auto-check salary if it exists
            if (salaryValue) {
                handleCheckSalary(salaryValue);
            } else {
                setIsSalaryChecked(false);
                setHourlyRate(null);
            }
            // Password ni bo'sh qoldiramiz, chunki edit qilganda yangi password kiritish kerak
            setPassword("");
        }
    }, [user, handleCheckSalary]);

    const handleSubmit = () => {
        // Edit holatida password majburiy emas
        if (
            !firstname ||
            !lastname ||
            !fathername ||
            !login ||
            !roleId ||
            !employeeNoString ||
            !fineBeingLate ||
            !salary ||
            !isSalaryChecked
        ) {
            alert(
                "Пожалуйста, заполните все обязательные поля и проверьте зарплату."
            );
            return;
        }

        setIsLoading(true);

        const payload: any = {
            firstname,
            lastname,
            fathername,
            login,
            role_id: roleId,
            employeeNoString: Number(employeeNoString),
            fine_being_late: Number(fineBeingLate),
            salary: Number(salary),
        };

        if (password.trim()) {
            payload.password = password;
        }

        PostDataTokenJson(`api/user/update/${user?.user_id}`, payload)
            .then((res: any) => {
                if (res) {
                    toast.success("Пользователь успешно обновлен");
                    changeStatus();
                    onClose();
                    console.log("Обновлено успешно");
                }
            })
            .catch((error: any) => {
                const errorMessage = error?.response?.data?.error;
                setResponse(errorMessage);
                toast.error(errorMessage);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleAvatarChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file || !user?.user_id) return;
        const formData = new FormData();
        formData.append("photo", file);
        try {
            setIsUploadingAvatar(true);
            await PostSimpleFormData(
                `api/user/uploadphoto/${user.user_id}`,
                formData
            );
            toast.success("Аватар успешно загружен");
            changeStatus();
        } catch (error: any) {
            onClose();
            const errorMessage =
                error?.response?.data?.error || "Не удалось загрузить аватар";
            setResponse(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsUploadingAvatar(false);
            // reset input value to allow re-uploading the same file if needed
            e.currentTarget.value = "";
        }
    };

    // Joriy rolni topish
    const getCurrentRole = () => {
        return options.find((option) => option.value === roleId);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[700px] p-6 lg:p-10"
        >
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                Редактировать пользователя
            </h2>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="firstname">Введите имя</Label>
                        <Input
                            type="text"
                            id="firstname"
                            placeholder="Имя"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="lastname">Введите фамилию</Label>
                        <Input
                            type="text"
                            id="lastname"
                            placeholder="Фамилия"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="fathername">Введите отчество</Label>
                        <Input
                            type="text"
                            id="fathername"
                            placeholder="Отчество"
                            value={fathername}
                            onChange={(e) => setFathername(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="login">Введите логин</Label>
                        <Input
                            type="text"
                            id="login"
                            placeholder="Логин"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-3 ">
                        <Label>
                            Выберите роль Текущая: {getCurrentRole()?.label}
                        </Label>
                    </div>
                    <Select
                        options={options}
                        placeholder="Выберите роль"
                        onChange={handleSelectChange}
                        className="dark:bg-dark-900"
                    />
                </div>
                <div>
                    <Label>Зарплата *</Label>
                    <Input
                        type="text"
                        placeholder="Введите зарплату"
                        value={displaySalary}
                        onChange={handleSalaryChange}
                    />
                    {isCheckingSalary && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                Проверка зарплаты...
                            </p>
                        </div>
                    )}
                    {hourlyRate !== null &&
                        isSalaryChecked &&
                        !isCheckingSalary && (
                            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    <span className="font-semibold">
                                        Ставка за час:
                                    </span>{" "}
                                    {formatNumberWithSpaces(
                                        hourlyRate
                                            ? hourlyRate?.toString()
                                            : "0"
                                    )}{" "}
                                    сум
                                </p>
                            </div>
                        )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="avatar">Загрузить аватар</Label>
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-200"
                            disabled={isUploadingAvatar}
                        />
                        {isUploadingAvatar && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                Загрузка аватара...
                            </div>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="password">
                            Новый пароль (Не обязательно)
                        </Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Введите новый пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                            >
                                {showPassword ? (
                                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                ) : (
                                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>ID в Face ID *</Label>
                        {loadingFaceId ? (
                            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700">
                                Загрузка...
                            </div>
                        ) : (
                            <Select
                                options={faceIdEmployees.map((emp) => ({
                                    value:
                                        emp.employeeNoString?.toString() ||
                                        emp.face_id?.toString() ||
                                        "",
                                    label:
                                        emp.name ||
                                        emp.employeeNoString ||
                                        `ID: ${
                                            emp.face_id || emp.employeeNoString
                                        }`,
                                    disabled: emp.is_integrated === 1,
                                }))}
                                placeholder="Выберите Face ID"
                                onChange={(value) => setEmployeeNoString(value)}
                                className="dark:bg-dark-900"
                                defaultValue={employeeNoString || ""}
                            />
                        )}
                    </div>
                    <div>
                        <Label>Штраф за опоздание *</Label>
                        <Input
                            type="text"
                            placeholder="Введите сумму штрафа"
                            value={displayFineBeingLate}
                            onChange={handleFineBeingLateChange}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={
                            isLoading || isCheckingSalary || !isSalaryChecked
                        }
                        className={`px-4 py-2 rounded-md text-white transition-colors ${
                            isLoading || isCheckingSalary || !isSalaryChecked
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Сохранение...
                            </div>
                        ) : (
                            "Сохранить изменения"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditUserModal;
