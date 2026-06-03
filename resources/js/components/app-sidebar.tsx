import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { BaseResponse, NavGroup } from '@/types';
import { UserProps } from '@/types/user.type';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { Blocks, ChartBar, ChevronsUpDown, Cog, LayoutGrid, Pickaxe, Plus, Wallet, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import { NavFooter } from './nav-footer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui-shadcn/dropdown-menu';
interface NavHeaderProps {
    name: string;
    value: string;
    plan: string;
    key: string;
}

interface PageProps extends InertiaPageProps {
    props: BaseResponse<UserProps>;
    auth: {
        user: UserProps;
    };
}

const navHeaderItems = [
    { key: 'affren_flow', name: 'AffrenFlow', value: 'personal', plan: 'Test' },
    { key: 'test_1', name: 'Test 1', value: 'acme', plan: 'Test' },
    { key: 'test_2', name: 'Test 2', value: 'monsters', plan: 'Test' },
];

export function AppSidebar() {
    const page = usePage<PageProps>().props;
    const footerNavItems: NavGroup[] = [
        // {
        //     title: 'Konfigurasi',
        //     url: '/config',
        //     icon: Cog,
        //     items: [
        //         {
        //             title: 'Proyek',
        //             url: '/config/project',
        //             icon: Hammer,
        //         },
        //     ],
        // },
        // {
        //     title: 'Repository',
        //     url: 'https://github.com/laravel/react-starter-kit',
        //     icon: Folder,
        // },
        // {
        //     title: 'Documentation',
        //     url: 'https://laravel.com/docs/starter-kits',
        //     icon: BookOpen,
        // },
    ];

    const mainNavItemsAffren: NavGroup[] = [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: LayoutGrid,
            roles: ['admin', 'mandor'],
        },
        {
            title: 'Proyek',
            url: '/project',
            icon: Pickaxe,
            roles: ['admin', 'mandor'],
        },
        {
            title: 'Transaksi',
            url: '/transaction',
            icon: Wallet,
            roles: ['admin', 'mandor'],
        },
        {
            title: 'Forecasting',
            url: '/forecasting',
            icon: ChartBar,
            roles: ['admin'], // 🔒 admin only
        },
        {
            title: 'Konfigurasi',
            url: '/config',
            icon: Cog,
            roles: ['admin'], // 🔒 admin only
            items: [
                {
                    title: 'Kategori Proyek',
                    url: '/config/project-config/category',
                    icon: Blocks,
                    roles: ['admin'],
                },
                {
                    title: 'Jenis Proyek',
                    url: '/config/project-config/type',
                    icon: Wrench,
                    roles: ['admin'],
                },
            ],
        },
    ];

    const mainNavItems2: NavGroup[] = [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Test 2',
            url: '/project',
            icon: Pickaxe,
        },
        {
            title: 'Test 1',
            url: '/transaction',
            icon: Wallet,
        },
    ];
    const [activeWorkspace, setActiveWorkspace] = useState<NavHeaderProps>(() => {
        if (typeof window !== 'undefined') {
            const savedWorkspace = localStorage.getItem('activeWorkspace');
            if (savedWorkspace) {
                try {
                    return JSON.parse(savedWorkspace);
                } catch (error) {
                    console.error('Gagal membaca workspace dari localStorage', error);
                }
            }
        }
        return navHeaderItems[0];
    });

    const userRole = page?.auth?.user?.role?.role_name.toLowerCase();
    const filteredNav = mainNavItemsAffren.filter((item) => {
        return item.roles?.includes(userRole as string);
    });
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('activeWorkspace', JSON.stringify(activeWorkspace));
        }
    }, [activeWorkspace]);
    // let mainNav = activeWorkspace.key === 'affren_flow' ? mainNavItemsAffren : mainNavItems2;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {/* <SidebarMenuButton size="lg" asChild>
                            <div>
                                <AppLogo />
                            </div>
                        </SidebarMenuButton> */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                        <AppLogo />
                                    </div>

                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{activeWorkspace.name}</span>
                                        <span className="truncate text-xs">{activeWorkspace.plan}</span>
                                    </div>

                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                align="start"
                                side="bottom"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="text-muted-foreground text-xs">Workspaces</DropdownMenuLabel>

                                {navHeaderItems.map((item) => (
                                    <DropdownMenuItem key={item.value} onClick={() => setActiveWorkspace(item)} className="cursor-pointer gap-2 p-2">
                                        <div className="flex size-6 items-center justify-center rounded-sm border">{item.name.charAt(0)}</div>
                                        {item.name}
                                    </DropdownMenuItem>
                                ))}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem className="cursor-pointer gap-2 p-2">
                                    <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                                        <Plus className="size-4" />
                                    </div>
                                    <div className="text-muted-foreground font-medium">Add Workspace</div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNav} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
