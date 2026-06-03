import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    items?: NavItem[];
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    roles?: string[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    roles?: string[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface AuthProps {
    created_at: Date;
    email: string;
    email_verified_at: Date;
    id: number;
    name: string;
    update_at: Date;
}

export interface BaseResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface CashflowItem {
    date: string;
    total_pemasukan: number;
    total_pengeluaran: number;
    cashflow: number;
    detail_pemasukan: DetailPemasukan[];
    detail_pengeluaran: DetailPengeluaran[];
}

export interface DetailPemasukan {
    proyek_id: string;
    nama_proyek: string;
    pagu_total: number;
}

export interface DetailPengeluaran {
    transaksi_id: string | null;
    proyek_id: string;
    nama_proyek: string;
    jumlah: number;
    keterangan: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
}
