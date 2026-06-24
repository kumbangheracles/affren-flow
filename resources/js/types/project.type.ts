import { JenisProyek } from './jenis_proyek.type';
import { KategoriProyek } from './kategori_proyek.type';
import { UserProps } from './user.type';

export interface ProyekImages {
    id: string;
    proyek_id: string;
    image_url: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProyekProps {
    [key: string]: any;
    proyek_id: string;

    nama_proyek: string;
    tipe_proyek: TipeProyek | null;
    kategori_proyek_id?: number;
    jenis_proyek_id?: number;

    kategori?: KategoriProyek;
    jenis?: JenisProyek;
    proyek_images?: ProyekImages[];
    uploaded_images: File[];
    existing_image_ids?: string[];
    pagu_total: number;

    tanggal_mulai: string;
    tanggal_selesai?: string | null;

    pajak_persen: number;
    uang_bahan_persen: number;
    jasa_tukang_persen: number;

    biaya_staff_perpajakan: number;
    biaya_staff_entry_data: number;
    biaya_tak_terduga_persen: number;

    created_by?: string | number;

    creator?: UserProps;

    nama_klien: string;

    status: StatusProyek;

    deskripsi_proyek?: string | null;

    created_at?: string;
    updated_at?: string;
}
export const initialProyek: ProyekProps = {
    proyek_id: '',

    nama_proyek: '',
    tipe_proyek: 'papping', // default
    jenis_proyek_id: 0,
    kategori_proyek_id: 0,
    pagu_total: 0,

    tanggal_mulai: '',
    tanggal_selesai: null,

    pajak_persen: 0,
    uang_bahan_persen: 0,
    jasa_tukang_persen: 0,

    biaya_staff_perpajakan: 0,
    biaya_staff_entry_data: 0,
    biaya_tak_terduga_persen: 0,

    nama_klien: '',

    status: 'sedang_berjalan', // default
    existing_image_ids: [],
    deskripsi_proyek: null,
    uploaded_images: [],

    proyek_img: '',

    created_at: '',
    updated_at: '',
};
export type TipeProyek = 'papping' | 'u_ditch' | 'spall' | 'beton' | 'sab';

export type StatusProyek = 'sedang_berjalan' | 'selesai' | 'dibatalkan';
