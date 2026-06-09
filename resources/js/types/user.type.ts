export interface RoleProps {
    id: number;
    role_name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserProps {
    id: number;
    name: string;
    isActive: boolean;
    nama_lengkap: string;
    email: string;
    email_verified_at: string | null;
    password?: string;
    noHp?: string;
    role_id: number;
    created_by?: string;
    creator?: UserProps;
    role?: RoleProps;
    created_at: string;
    updated_at: string;
}

export type UserPropsForm = UserProps & {
    [key: string]: any;
};

export const initialUserProps: UserProps = {
    id: 0,
    nama_lengkap: '',
    name: '',
    isActive: false,
    password: '',
    noHp: '',
    email: '',
    email_verified_at: null,
    role_id: 0,
    role: undefined,
    created_at: '',
    updated_at: '',
};
