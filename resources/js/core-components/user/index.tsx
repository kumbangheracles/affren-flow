import DetailItem from '@/components/app-detail-item';
import AppDropdownMenu from '@/components/app-dopdown-menu';
import AppInput from '@/components/app-input';
import AppSearchInput from '@/components/app-input-search';
import { Column, DataTable } from '@/components/app-table';
import { Badge } from '@/components/ui-shadcn/badge';
import { DropdownMenuItem } from '@/components/ui-shadcn/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { formatDate } from '@/helpers/format';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { PaginatedResponse } from '@/types/laravel.type';
import { initialUserProps, UserProps, UserPropsForm } from '@/types/user.type';
import { PageProps as InertiaPageProps, router } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Edit, EllipsisVertical, Eye, LoaderCircle, Plus, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
interface PageProps extends InertiaPageProps {
    list_user?: PaginatedResponse<UserProps>;
    filters: {
        search: string;
        per_page: number;
    };
}
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User',
        href: '/user',
    },
];
type ModalType = 'put' | 'post' | 'delete' | 'show';
const UserIndex = () => {
    const { props } = usePage<PageProps>();
    const { filters, list_user } = props;
    console.log('Props user: ', props);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedModalType, setSelectedModalType] = useState<ModalType | null>(null);
    const [selectedDataUser, setSelectedDataUser] = useState<UserProps | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [search, setSearch] = useState(filters?.search ?? '');
    // const currentPage = new URLSearchParams(window.location.search).get('page') ?? '1';
    const isMobile = useIsMobile();
    const currentPerPage = new URLSearchParams(window.location.search).get('per_page') ?? '10';
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const form = useForm<UserPropsForm>(initialUserProps);
    const { data, setData, post, processing, errors, put, delete: deleteUser } = form;

    const handleSearch = (val: string) => {
        setSearch(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(route('user.index'), { ...route().params, search: val, per_page: filters?.per_page }, { preserveState: true, replace: true });
        }, 400);
    };

    const handlePageChange = (page: number) => {
        router.get(route('user.index'), { ...route().params, page: page, per_page: currentPerPage }, { preserveState: true, preserveScroll: true });
    };

    const handlePageSizeChange = (perPage: number) => {
        router.get(route('user.index'), { ...route().params, page: 1, per_page: perPage }, { preserveState: true, preserveScroll: true });
    };

    const handleOpenModal = (id?: number, modalType?: ModalType | null) => {
        setSelectedId(id as number);
        setSelectedModalType(modalType as ModalType);
    };

    const handleSubmit = () => {
        if (selectedModalType === 'post') {
            post(route('user.store'), {
                // ← fix: pakai route()
                forceFormData: true,
                onStart: () => setLoading(true),
                onSuccess: () => {
                    toast.success('Berhasil membuat User baru.', { position: 'top-right' });
                    handleCloseModal();
                },
                onError: () => {
                    toast.error('Gagal membuat User baru.', {
                        position: 'top-right',
                        description: Object.values(errors)[0], // ← fix: ambil error pertama
                    });
                },
                onFinish: () => setLoading(false),
            });
        } else if (selectedModalType === 'put') {
            post(route('user.update', selectedId as number), {
                // ← fix: post + _method PUT
                forceFormData: true,
                onStart: () => setLoading(true),
                onSuccess: () => {
                    toast.success('Berhasil update User.', { position: 'top-right' });
                    handleCloseModal();
                },
                onError: () => {
                    toast.error('Gagal update User.', {
                        position: 'top-right',
                        description: Object.values(errors)[0],
                    });
                },
                onFinish: () => setLoading(false),
            });
        } else if (selectedModalType === 'delete') {
            deleteUser(route('user.destroy', selectedId as number), {
                // ← fix: pakai route()
                onStart: () => setLoading(true),
                onSuccess: () => {
                    toast.success('Berhasil hapus User.', { position: 'top-right' });
                    handleCloseModal();
                },
                onError: () => {
                    toast.error('Gagal hapus User.', {
                        position: 'top-right',
                        description: Object.values(errors)[0],
                    });
                },
                onFinish: () => setLoading(false),
            });
        }
    };

    const handleCloseModal = () => {
        setSelectedId(null);
        setSelectedModalType(null);
        setData(initialUserProps);
        setSelectedDataUser(null);
    };

    useEffect(() => {
        const selectedData = list_user?.data?.find((item: UserProps) => item.id === selectedId);
        if (selectedModalType === 'put' || selectedModalType === 'delete' || selectedModalType === 'show') {
            setData(selectedData as UserProps);
            setSelectedDataUser(selectedData as UserProps);
        }

        console.log('modal type: ', selectedModalType);
        console.log('Selected id: ', selectedId);
    }, [selectedModalType, selectedId]);

    const LIST_TYPE_COLUMNS: Column<UserProps>[] = [
        {
            key: 'no',
            label: 'No',
            className: 'text-center',
            render: (_: any, __: any, index: number) => <span className="text-muted-foreground text-[10px] text-wrap sm:text-sm">{index + 1}</span>,
        },
        {
            key: 'nama_lengkap',
            label: 'Nama Lengkap',
            className: 'text-left',
            render: (_: any, row: UserProps) => <span className="text-[10px] font-medium sm:text-sm">{row?.nama_lengkap}</span>,
        },
        {
            key: 'name',
            label: 'Username',
            className: 'text-left max-w-[200px]',
            render: (_: any, row: UserProps) => (
                <span className="text-background bg-foreground rounded-xl px-1 py-1 text-[10px] font-semibold sm:text-sm">{row.name}</span>
            ),
        },
        // {
        //     key: 'isActive',
        //     label: 'Status',
        //     className: 'text-center max-w-[200px]',
        //     render: (_: any, row: UserProps) => <Switch disabled={row?.name === 'herkaladmin '} onChange={() => {}} checked={row?.isActive} />,
        // },
        {
            key: 'email',
            label: 'Email',
            className: 'text-left',
            render: (_: any, row: UserProps) => <span className="text-[10px] font-medium sm:text-sm">{row?.email || '-'}</span>,
        },
        {
            key: 'role',
            label: 'Role',
            className: 'text-left',
            render: (_: any, row: UserProps) => <Badge className="text-[10px] font-medium sm:text-sm">{row?.role?.role_name || '-'}</Badge>,
        },
        {
            key: 'created_at',
            label: 'Tanggal dibuat',
            className: 'text-center',
            render: (_: any, row: UserProps) => (
                <span className="text-muted-foreground text-[10px] sm:text-sm">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}
                </span>
            ),
        },

        {
            key: 'action',
            label: 'Action',
            className: 'text-center',
            render: (_: any, record: UserProps) => {
                return (
                    <AppDropdownMenu
                        openDisplay={<EllipsisVertical />}
                        menuItem={
                            <>
                                <div className="flex flex-col gap-2 p-2">
                                    <DropdownMenuItem
                                        onClick={() => handleOpenModal(record?.id, 'show')}
                                        disabled={record?.name === 'herkaladmin'}
                                        className={cn('group hover:bg-muted! flex cursor-pointer items-center justify-between p-2')}
                                    >
                                        <p className={cn('text-foreground! group-hover:text-chart-1!')}>Detail</p>
                                        <Eye className={cn('text-muted-foreground! group-hover:text-chart-1!')} />
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        disabled={record?.name === 'herkaladmin'}
                                        onClick={() => handleOpenModal(record?.id, 'put')}
                                        className={cn('group hover:bg-muted! flex cursor-pointer items-center justify-between p-2')}
                                    >
                                        <p className={cn('text-foreground! group-hover:text-chart-2!')}>Ubah</p>
                                        <Edit className={cn('text-muted-foreground! group-hover:text-chart-2!')} />
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        disabled={record?.name === 'herkaladmin'}
                                        // onClick={() => OpenModal(record?.transaksi_id)}
                                        className={cn('group hover:bg-error/10! flex cursor-pointer items-center justify-between p-2 transition-all')}
                                        onClick={() => handleOpenModal(record?.id, 'delete')}
                                    >
                                        <p className={cn('text-foreground! group-hover:text-error!')}>Hapus</p>
                                        <Trash className={cn('text-muted-foreground! group-hover:text-error!')} />
                                    </DropdownMenuItem>
                                </div>
                            </>
                        }
                    />
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User" />

            <div className="p-4">
                <div className="flex w-full items-center justify-between">
                    <AppSearchInput
                        placeholder="Cari User dengan nama lengkap . . ."
                        value={search}
                        className="w-[90%] sm:w-84!"
                        onChange={(e) => handleSearch(e.target.value as string)}
                        clearable={true}
                    />

                    <Button
                        className="cursor-pointer"
                        // disabled={processing}
                        size={isMobile ? 'sm' : 'default'}
                        onClick={() => handleOpenModal(0, 'post')}
                    >
                        <Plus />
                        <p>User Baru</p>
                    </Button>
                </div>
                <DataTable
                    className="mt-4"
                    emptyMessage="Tidak ada user saat ini"
                    data={list_user?.data as UserProps[]}
                    columns={LIST_TYPE_COLUMNS}
                    mobileColumns={['name', 'role', 'action']}
                    key={list_user?.data?.length}
                    pagination={{
                        current_page: list_user?.current_page as number,
                        last_page: list_user?.last_page as number,
                        per_page: list_user?.per_page as number,
                        total: list_user?.total as number,
                        from: list_user?.from as number,
                        to: list_user?.to as number,
                    }}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>

            <Modal open={selectedModalType !== null} key={selectedId}>
                <ModalContent size="xl" hideClose>
                    <ModalHeader>
                        <ModalTitle className="max-w-[500px]">
                            <h4 className="block max-w-[500px] truncate text-[17px] font-medium font-semibold">
                                {selectedModalType === 'post'
                                    ? 'Buat User baru'
                                    : selectedModalType === 'put'
                                      ? `Ubah User ${selectedDataUser?.name}`
                                      : selectedModalType === 'delete'
                                        ? `Hapus User`
                                        : selectedModalType === 'show'
                                          ? 'Detail User'
                                          : ''}
                            </h4>
                        </ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        {selectedModalType === 'delete' && (
                            <div className="flex w-full max-w-[500px] items-center justify-center text-center">
                                <h4 className="text-sm">
                                    Anda yakin ingin menghapus User dengan nama <b className="text-accent-foreground">{data?.name}</b> ?
                                </h4>
                            </div>
                        )}

                        {(selectedModalType === 'post' || selectedModalType === 'put') && (
                            <div className="grid w-full grid-cols-1 items-center gap-2 p-4 sm:grid-cols-2 sm:gap-4">
                                {/* <AppSelect
                                    options={kategoriOptions ?? []}
                                    value={data?.kategori_proyek_id !== 0 ? data?.kategori_proyek_id?.toString() : ''}
                                    onValueChange={(e) => setData('kategori_proyek_id', Number(e))}
                                    label="Kategori"
                                    placeholder="Pilih kategori proyek . . ."
                                    // error={errors?.kategori_proyek_id}
                                /> */}
                                <div aria-hidden="true" className="hidden">
                                    <input type="text" tabIndex={-1} autoComplete="username" />
                                    <input type="password" tabIndex={-1} autoComplete="current-password" />
                                </div>

                                <AppInput
                                    // disabled={}
                                    placeholder="Masukkan nama lengkap . . ."
                                    label="Nama Lengkap"
                                    value={data?.nama_lengkap}
                                    onChange={(e) => setData('nama_lengkap', e.target.value)}
                                    // error={errors?.nama}
                                />
                                <AppInput
                                    // disabled={}
                                    placeholder="Masukkan username . . ."
                                    label="Username"
                                    value={data?.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    // error={errors?.nama}
                                />
                                <AppInput
                                    // disabled={}
                                    placeholder="Masukkan email . . ."
                                    label="Email"
                                    value={data?.email}
                                    autoComplete="off"
                                    onChange={(e) => setData('email', e.target.value)}
                                    // error={errors?.nama}
                                />
                                <AppInput
                                    // disabled={}
                                    placeholder="Masukkan No Hp . . ."
                                    label="No Hp"
                                    value={data?.noHp}
                                    onChange={(e) => setData('noHp', e.target.value)}
                                    // error={errors?.nama}
                                    autoComplete="off"
                                />
                                <AppInput
                                    // disabled={}
                                    placeholder="Masukkan password . . ."
                                    label="Password"
                                    autoComplete="off"
                                    value={data?.password}
                                    isType="password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    // error={errors?.nama}
                                />
                            </div>
                        )}

                        {selectedModalType === 'show' && (
                            <div>
                                <DetailItem label="Nama Lengkap" value={selectedDataUser?.nama_lengkap || '-'} />
                                <DetailItem
                                    label="Username"
                                    valueClassName="text-background bg-foreground rounded-xl px-1 py-1 text-[10px] font-semibold sm:text-sm"
                                    value={selectedDataUser?.name || '-'}
                                />
                                <DetailItem label="Email" value={selectedDataUser?.email || '-'} />
                                <DetailItem label="Password" value={selectedDataUser?.password || '-'} />
                                <DetailItem label="No Hp" value={selectedDataUser?.noHp || '-'} />
                                <DetailItem
                                    label="Status saat ini"
                                    valueClassName="text-background bg-foreground rounded-xl px-1 py-1 text-[10px] font-semibold sm:text-sm"
                                    value={selectedDataUser?.isActive ? 'Aktif' : 'Tidak Aktif'}
                                />
                                <DetailItem label="Dibuat pada" value={formatDate(selectedDataUser?.created_at) || '-'} />
                                <DetailItem label="Terakhir di update pada" value={formatDate(selectedDataUser?.updated_at) || '-'} />
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <ModalClose asChild>
                            <Button variant={'outline'} onClick={handleCloseModal} className="...">
                                {processing || loading ? <LoaderCircle className="animate-spin" /> : 'Batal'}
                            </Button>
                        </ModalClose>
                        <Button variant={selectedModalType === 'delete' ? 'destructive' : 'outline'} className="..." onClick={() => handleSubmit()}>
                            {processing || loading ? (
                                <LoaderCircle className="animate-spin" />
                            ) : (
                                <>{selectedModalType === 'delete' ? 'Hapus' : 'Simpan'}</>
                            )}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AppLayout>
    );
};

export default UserIndex;
