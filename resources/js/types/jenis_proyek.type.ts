import { KategoriProyek } from './kategori_proyek.type';
import { UserProps } from './user.type';

export interface JenisProyek {
    id: number;
    kategori_proyek_id: number;
    nama: string;
    kategori_proyek: KategoriProyek;
    creator?: UserProps;
    created_at?: string;
    updated_at?: string;
}

export interface JenisProyekForm extends JenisProyek {
    [key: string]: any;
}
export const initialJenisProyekForm: JenisProyekForm = {
    id: 0,
    kategori_proyek_id: 0,
    nama: '',
    kategori_proyek: {
        id: 0,
        nama: '',
        created_by: '',
        created_at: undefined,
        updated_at: undefined,
    },
    created_at: undefined,
    updated_at: undefined,
};
