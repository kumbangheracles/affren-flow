import AppDropdownMenu from '@/components/app-dopdown-menu';
import AppInput from '@/components/app-input';
import AppSearchInput from '@/components/app-input-search';
import { Column, DataTable } from '@/components/app-table';
import { DropdownMenuItem } from '@/components/ui-shadcn/dropdown-menu';
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui-shadcn/modal';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { initialKategoriProyekForm, KategoriProyek, KategoriProyekForm } from '@/types/kategori_proyek.type';
import { PaginatedResponse } from '@/types/laravel.type';
import { PageProps as InertiaPageProps, router } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Edit, EllipsisVertical, LoaderCircle, Plus, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
interface PageProps extends InertiaPageProps {
    list_kategori?: PaginatedResponse<KategoriProyek>;
    filters: {
        search: string;
        per_page: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kategori Proyek',
        href: '/config/project-config/category',
    },
];

type ModalType = 'put' | 'post' | 'delete';
const ProjectConfigCategoryIndex = () => {
    const { props } = usePage<PageProps>();
    const { filters, list_kategori } = props;
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedModalType, setSelectedModalType] = useState<ModalType | null>(null);
    const [selectedDataKategori, setSelectedDataKategori] = useState<KategoriProyek | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [search, setSearch] = useState(filters?.search ?? '');
    const isMobile = useIsMobile();
    const currentPerPage = new URLSearchParams(window.location.search).get('per_page') ?? '10';
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const form = useForm<KategoriProyekForm>(initialKategoriProyekForm);
    const { data, setData, post, processing, errors, put, delete: deleteJenis } = form;

    // useEffect(() => {
    //     setData('created_by', currentUser?.id);
    // }, []);
    const handleSearch = (val: string) => {
        setSearch(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(
                route('config.project-config.category.index'),
                { ...route().params, search: val, per_page: filters?.per_page },
                { preserveState: true, replace: true },
            );
        }, 400);
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('config.project-config.category.index'),
            { ...route().params, page: page, per_page: currentPerPage },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePageSizeChange = (perPage: number) => {
        router.get(
            route('config.project-config.category.index'),
            { ...route().params, page: 1, per_page: perPage },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleOpenModal = (id?: number, modalType?: ModalType | null) => {
        setSelectedId(id as number);
        setSelectedModalType(modalType as ModalType);
    };

    const handleSubmit = () => {
        if (selectedModalType === 'post') {
            post('/config/project-config/category', {
                onStart: () => setLoading(true),

                onSuccess: (success) => {
                    toast.success('Berhasil membuat kategori proyek baru.', { position: 'top-right' });
                    console.log('Success: ', success);
                    handleCloseModal();
                },

                onError: (err: any) => {
                    toast.error('Gagal membuat kategori proyek baru.', {
                        position: 'top-right',
                        description: errors?.nama || errors?.kategori_proyek_id,
                    });
                    console.log('Error: ', err);
                },

                onFinish: () => {
                    setLoading(false);
                },
            });
        } else if (selectedModalType === 'put') {
            put(`/config/project-config/category/${selectedId}`, {
                onStart: () => setLoading(true),

                onSuccess: (success) => {
                    toast.success('Berhasil update kategori proyek.', { position: 'top-right' });
                    console.log('Success: ', success);
                    handleCloseModal();
                },

                onError: (err: any) => {
                    toast.error('Gagal update kategori proyek.', {
                        position: 'top-right',
                        description: errors?.nama || errors?.kategori_proyek_id,
                    });
                    console.log('Error: ', err);
                },

                onFinish: () => {
                    setLoading(false);
                },
            });
        } else if (selectedModalType === 'delete') {
            deleteJenis(`/config/project-config/category/${selectedId}`, {
                onStart: () => setLoading(true),

                onSuccess: (success) => {
                    toast.success('Berhasil hapus kategori proyek.', { position: 'top-right' });
                    console.log('Success: ', success);
                    handleCloseModal();
                },

                onError: (err: any) => {
                    toast.error('Gagal hapus kategori proyek.', {
                        position: 'top-right',
                        description: errors?.kategori,
                    });
                    console.log('Error: ', err);
                },

                onFinish: () => {
                    setLoading(false);
                },
            });
        }
    };

    const handleCloseModal = () => {
        setSelectedId(null);
        setSelectedModalType(null);
        setData(initialKategoriProyekForm);
        setSelectedDataKategori(null);
    };

    useEffect(() => {
        const selectedData = list_kategori?.data?.find((item: KategoriProyek) => item.id === selectedId);
        if (selectedModalType === 'put' || selectedModalType === 'delete') {
            setData(selectedData as KategoriProyek);
            setSelectedDataKategori(selectedData as KategoriProyek);
        }
    }, [selectedModalType, selectedId]);

    const LIST_TYPE_COLUMNS: Column<KategoriProyek>[] = [
        {
            key: 'no',
            label: 'No',
            className: 'text-center',
            render: (_: any, __: any, index: number) => <span className="text-muted-foreground text-sm text-wrap">{index + 1}</span>,
        },
        {
            key: 'nama',
            label: 'Judul Kategori',
            className: 'text-left max-w-[200px]',
            render: (_: any, row: KategoriProyek) => <span className="block max-w-[200px] truncate text-sm font-medium">{row.nama}</span>,
        },
        {
            key: 'created_by',
            label: 'Dibuat oleh',
            className: 'text-left',
            render: (_: any, row: KategoriProyek) => (
                <span className="text-background bg-foreground rounded-xl px-1 py-1 text-sm font-semibold">{row?.creator?.name || '-'}</span>
            ),
        },
        {
            key: 'created_at',
            label: 'Tanggal dibuat',
            className: 'text-start pl-5',
            render: (_: any, row: KategoriProyek) => (
                <span className="text-muted-foreground text-sm">{row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}</span>
            ),
        },
        {
            key: 'updated_at',
            label: 'Diupdate',
            className: 'text-left',
            render: (_: any, row: KategoriProyek) => (
                <span className="text-muted-foreground text-sm">{row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID') : '-'}</span>
            ),
        },

        {
            key: 'action',
            label: 'Action',
            className: 'text-center',
            render: (_: any, record: KategoriProyek) => {
                return (
                    <AppDropdownMenu
                        openDisplay={<EllipsisVertical />}
                        menuItem={
                            <>
                                <div className="flex flex-col gap-2 p-2">
                                    {/* <DropdownMenuItem
                                        onClick={() => router?.visit(`/transaction/${record?.transaksi_id}/detail`)}
                                        className={cn('group hover:bg-muted! flex cursor-pointer items-center justify-between p-2')}
                                    >
                                        <p className={cn('text-foreground! group-hover:text-chart-1!')}>Detail</p>
                                        <Eye className={cn('text-muted-foreground! group-hover:text-chart-1!')} />
                                    </DropdownMenuItem> */}

                                    <DropdownMenuItem
                                        onClick={() => handleOpenModal(record?.id, 'put')}
                                        className={cn('group hover:bg-muted! flex cursor-pointer items-center justify-between p-2')}
                                    >
                                        <p className={cn('text-foreground! group-hover:text-chart-2!')}>Ubah</p>
                                        <Edit className={cn('text-muted-foreground! group-hover:text-chart-2!')} />
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
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
            <Head title="Jenis Proyek" />
            <div className="p-4">
                <div className="flex w-full justify-between">
                    <AppSearchInput
                        placeholder="Cari dengan judul . . ."
                        value={search}
                        className="w-[90%]! sm:w-84!"
                        onClear={() => setSearch('')}
                        clearable={true}
                        onChange={(e) => handleSearch(e.target.value as string)}
                    />

                    <Button className="cursor-pointer" size={isMobile ? 'sm' : 'default'} onClick={() => handleOpenModal(0, 'post')}>
                        <Plus />
                        <p>Kategori Proyek</p>
                    </Button>
                </div>
                <DataTable
                    className="mt-4"
                    emptyMessage="Tidak ada kategori proyek saat ini"
                    data={list_kategori?.data as KategoriProyek[]}
                    columns={LIST_TYPE_COLUMNS}
                    key={list_kategori?.data?.length}
                    mobileColumns={['nama', 'created_at', 'action']}
                    pagination={{
                        current_page: list_kategori?.current_page as number,
                        last_page: list_kategori?.last_page as number,
                        per_page: list_kategori?.per_page as number,
                        total: list_kategori?.total as number,
                        from: list_kategori?.from as number,
                        to: list_kategori?.to as number,
                    }}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>

            <Modal open={selectedModalType !== null} key={selectedId}>
                <ModalContent size="xl" hideClose>
                    <ModalHeader>
                        <ModalTitle className="max-w-[500px]">
                            <h4 className="block max-w-[500px] truncate text-[17px] font-medium">
                                {selectedModalType === 'post'
                                    ? 'Buat kategori proyek baru'
                                    : selectedModalType === 'put'
                                      ? `Ubah kategori proyek ${selectedDataKategori?.nama}`
                                      : selectedModalType === 'delete'
                                        ? `Hapus kategori proyek`
                                        : ''}
                            </h4>
                        </ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        {selectedModalType === 'delete' ? (
                            <div className="flex w-full max-w-[500px] items-center justify-center text-center">
                                <h4 className="text-sm">
                                    Anda yakin ingin menghapus kategori proyek dengan judul <b className="text-accent-foreground">{data?.nama}</b> ?
                                </h4>
                            </div>
                        ) : (
                            <div className="w-full px-3">
                                <AppInput
                                    placeholder="Masukkan judul kategori. . ."
                                    label="Judul kategori Proyek"
                                    value={data?.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                />
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

export default ProjectConfigCategoryIndex;
