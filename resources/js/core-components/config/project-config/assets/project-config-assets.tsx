import { Column } from '@/components/app-table';
import { KategoriProyek } from '@/types/kategori_proyek.type';

export const LIST_CATEGORY_COLUMNS: Column<KategoriProyek>[] = [
    {
        key: 'no',
        label: 'No',
        className: 'text-center',
        render: (_: any, __: any, index: number) => <span className="text-muted-foreground text-sm">{index + 1}</span>,
    },
    {
        key: 'nama',
        label: 'Nama Kategori',
        className: 'text-left',
        render: (_: any, row: KategoriProyek) => <span className="text-sm font-medium">{row.nama}</span>,
    },

    {
        key: 'created_at',
        label: 'Tanggal dibuat',
        className: 'text-center',
        render: (_: any, row: KategoriProyek) => (
            <span className="text-muted-foreground text-sm">{row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}</span>
        ),
    },
    {
        key: 'updated_at',
        label: 'Diupdate',
        className: 'text-center',
        render: (_: any, row: KategoriProyek) => (
            <span className="text-muted-foreground text-sm">{row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID') : '-'}</span>
        ),
    },
];
