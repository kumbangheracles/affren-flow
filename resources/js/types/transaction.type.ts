import { ProyekProps } from './project.type';
import { UserProps } from './user.type';

export type TipeTransaksi = 'pemasukan' | 'pengeluaran';

export type KategoriTransaksi =
    | 'material'
    | 'operasional'
    | 'jasa_tukang'
    | 'mandor'
    | 'staff_perpajakan'
    | 'staff_entry_data'
    | 'biaya_tak_terduga'
    | '';

export interface TransaksiProps {
    [key: string]: any;
    transaksi_id: string;
    proyek_id: string;

    tipe: TipeTransaksi;
    kategori: KategoriTransaksi;

    persen?: number;

    jumlah: number | string;
    tanggal: string;

    keterangan?: string | null;

    proyek?: ProyekProps;

    created_by?: string | number;

    creator_transaksi?: UserProps;

    approver_transaksi?: UserProps;

    status?: 'disetujui' | 'belum_disetujui' | 'lunas' | 'ditolak' | null;

    items?: TransaksiItem[];

    created_at?: string | null;
    updated_at?: string | null;
}

export const initialTransaksi: TransaksiProps = {
    transaksi_id: '',
    proyek_id: '',

    tipe: 'pemasukan',
    kategori: 'material',

    jumlah: 0,
    tanggal: '',

    keterangan: '',

    created_at: null,
    updated_at: null,
};

export interface TransaksiItem {
    // [key: string]: string | number;
    item_id: string;
    transaksi_id: string;
    tanggal: string;
    nama_item: string;
    satuan: string;
    qty: string;

    creator_item_transaksi?: UserProps;
    approver_item_transaksi?: UserProps;
    created_by?: string | number;
    approved_by?: string | number;

    status?: 'disetujui' | 'belum_disetujui' | 'lunas' | 'ditolak';

    harga_satuan: string;
    subtotal: string;
    keterangan: string;
    created_at: string;
    updated_at: string;
}
export type TransaksiItemForm = TransaksiItem & {
    [key: string]: any;
};
export const initialTransaksiItem: TransaksiItemForm = {
    item_id: '',
    transaksi_id: '',
    tanggal: '',
    nama_item: '',
    satuan: '',
    qty: '0',
    harga_satuan: '0',
    subtotal: '0',
    keterangan: '',
    created_at: '',
    updated_at: '',
};
