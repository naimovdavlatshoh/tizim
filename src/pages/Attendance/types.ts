export interface Attendance {
    user_id: number;
    faceid_user_id: number;
    name: string;
    image_path?: string;
    role_id: number;
    shift_start: string;
    shift_end: string;
    check_in_datetime?: string;
    check_in_time?: string;
    check_out_datetime?: string | null;
    check_out_time?: string | null;
    late_minutes: number;
    late_minutes_text: string;
    overtime_minutes: number;
    overtime_minutes_text: string;
    status: string;
    is_day_off: boolean;
    late_tolerance_minutes: number;
}

export interface AttendanceStats {
    total_employees: number;
    integrated_employees: number;
    not_integrated_employees: number;
    on_time: number;
    late: number;
    absent: number;
    day_off: number;
    present: number;
}
