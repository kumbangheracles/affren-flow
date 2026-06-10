import { UserProps } from '@/types/user.type';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';

interface PageProps extends InertiaPageProps {
    auth: {
        user: UserProps;
    };
}

type RoleName = 'admin' | 'mandor' | 'super_admin';
const useRole = () => {
    const page = usePage<PageProps>();
    const currentRole = page?.props?.auth?.user?.role?.role_name?.toLowerCase() as RoleName;
    const currentUser = page?.props?.auth?.user as UserProps;
    return {
        currentRole,
        currentUser,
    };
};

export default useRole;
