import { UserProps } from './user.type';

export interface KategoriProyek {
    id: number;
    nama: string;
    created_by: string | number;
    creator?: UserProps;
    created_at?: string;
    updated_at?: string;
}

export const initialKategoriProyek: KategoriProyek = {
    id: 0,
    nama: '',
    created_by: '',
    created_at: undefined,
    updated_at: undefined,
};

export interface KategoriProyekForm extends KategoriProyek {
    [key: string]: any;
}

export const initialKategoriProyekForm: KategoriProyekForm = {
    id: 0,
    nama: '',
    created_by: '',
    created_at: undefined,
    updated_at: undefined,
};
