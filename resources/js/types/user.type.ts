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
    email: string;
    email_verified_at: string | null;
    // password?: string;
    role_id: number;
    role?: RoleProps;
    created_at: string;
    updated_at: string;
}
