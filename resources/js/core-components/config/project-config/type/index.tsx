import AppDropdownMenu from '@/components/app-dopdown-menu';
import AppInput from '@/components/app-input';
import AppSearchInput from '@/components/app-input-search';
import AppSelect from '@/components/app-select';
import { Column, DataTable } from '@/components/app-table';
import { DropdownMenuItem } from '@/components/ui-shadcn/dropdown-menu';
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui-shadcn/modal';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { initialJenisProyekForm, JenisProyek, JenisProyekForm } from '@/types/jenis_proyek.type';
import { KategoriProyek } from '@/types/kategori_proyek.type';
import { PaginatedResponse } from '@/types/laravel.type';
import { PageProps as InertiaPageProps, router } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Edit, EllipsisVertical, LoaderCircle, Plus, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
interface PageProps extends InertiaPageProps {
    list_jenis?: PaginatedResponse<JenisProyek>;
    filters: {
        search: string;
        per_page: number;
    };
    list_kategori?: KategoriProyek[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Jenis Proyek',
        href: '/config/project-config/type',
    },
];

type ModalType = 'put' | 'post' | 'delete';
const ProjectConfigTypeIndex = () => {
    const { props } = usePage<PageProps>();
    const { filters, list_jenis } = props;
    // console.log('Props jenis: ', props);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedModalType, setSelectedModalType] = useState<ModalType | null>(null);
    const [selectedDataJenis, setSelectedDataJenis] = useState<JenisProyek | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [search, setSearch] = useState(filters?.search ?? '');
    // const currentPage = new URLSearchParams(window.location.search).get('page') ?? '1';
    const isMobile = useIsMobile();
    const currentPerPage = new URLSearchParams(window.location.search).get('per_page') ?? '10';
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const form = useForm<JenisProyekForm>(initialJenisProyekForm);
    const { data, setData, post, processing, errors, put, delete: deleteJenis } = form;

    const handleSearch = (val: string) => {
        setSearch(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(
                route('config.project-config.type.index'),
                { ...route().params, search: val, per_page: filters?.per_page },
                { preserveState: true, replace: true },
            );
        }, 400);
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('config.project-config.type.index'),
            { ...route().params, page: page, per_page: currentPerPage },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePageSizeChange = (perPage: number) => {
        router.get(
            route('config.project-config.type.index'),
            { ...route().params, page: 1, per_page: perPage },
            { preserveState: true, preserveScroll: true },
        );
    };

    const kategoriOptions = props?.list_kategori?.map((item) => ({
        label: item?.nama,
        value: item?.id.toString(),
    }));

    const handleOpenModal = (id?: number, modalType?: ModalType | null) => {
        setSelectedId(id as number);
        setSelectedModalType(modalType as ModalType);
    };

    const handleSubmit = () => {
        if (selectedModalType === 'post') {
            post('/config/project-config/type', {
                onStart: () => setLoading(true),

                onSuccess: (success) => {
                    toast.success('Berhasil membuat jenis proyek baru.', { position: 'top-right' });
                    console.log('Success: ', success);
                    handleCloseModal();
                },

                onError: (err: any) => {
                    toast.error('Gagal membuat jenis proyek baru.', {
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
            put(`/config/project-config/type/${selectedId}`, {
                onStart: () => setLoading(true),

                onSuccess: (success) => {
                    toast.success('Berhasil update jenis proyek.', { position: 'top-right' });
                    console.log('Success: ', success);
                    handleCloseModal();
                },

                onError: (err: any) => {
                    toast.error('Gagal update jenis proyek.', {
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
            deleteJenis(`/config/project-config/type/${selectedId}`, {
                onStart: () => setLoading(true),

                onSuccess: (success) => {
                    toast.success('Berhasil hapus jenis proyek.', { position: 'top-right' });
                    console.log('Success: ', success);
                    handleCloseModal();
                },

                onError: (err: any) => {
                    toast.error('Gagal hapus jenis proyek.', {
                        position: 'top-right',
                        description: errors?.nama || errors?.kategori_proyek_id,
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
        setData(initialJenisProyekForm);
        setSelectedDataJenis(null);
    };

    useEffect(() => {
        const selectedData = list_jenis?.data?.find((item: JenisProyek) => item.id === selectedId);
        if (selectedModalType === 'put' || selectedModalType === 'delete') {
            setData(selectedData as JenisProyek);
            setSelectedDataJenis(selectedData as JenisProyek);
        }
    }, [selectedModalType, selectedId]);

    const LIST_TYPE_COLUMNS: Column<JenisProyek>[] = [
        {
            key: 'no',
            label: 'No',
            className: 'text-center',
            render: (_: any, __: any, index: number) => <span className="text-muted-foreground text-sm text-wrap">{index + 1}</span>,
        },
        {
            key: 'nama',
            label: 'Nama Jenis',
            className: 'text-left max-w-[200px]',
            render: (_: any, row: JenisProyek) => <span className="block max-w-[200px] truncate text-sm font-medium">{row.nama}</span>,
        },
        {
            key: 'nama',
            label: 'Kategori',
            className: 'text-left',
            render: (_: any, row: JenisProyek) => <span className="text-sm font-medium">{row?.kategori_proyek?.nama}</span>,
        },
        {
            key: 'created_by',
            label: 'Dibuat oleh',
            className: 'text-left',
            render: (_: any, row: JenisProyek) => (
                <span className="text-background bg-foreground rounded-xl px-1 py-1 text-sm font-semibold">{row?.creator?.name || '-'}</span>
            ),
        },
        {
            key: 'created_at',
            label: 'Tanggal dibuat',
            className: 'text-left',
            render: (_: any, row: JenisProyek) => (
                <span className="text-muted-foreground text-sm">{row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}</span>
            ),
        },
        {
            key: 'updated_at',
            label: 'Diupdate',
            className: 'text-left',
            render: (_: any, row: JenisProyek) => (
                <span className="text-muted-foreground text-sm">{row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID') : '-'}</span>
            ),
        },

        {
            key: 'action',
            label: 'Action',
            className: 'text-center',
            render: (_: any, record: JenisProyek) => {
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
            <Head title="Jenis Proyek" />
            <div className="p-4">
                <div className="flex w-full items-center justify-between">
                    <AppSearchInput
                        placeholder="Cari transaksi dengan nama . . ."
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
                        <p>Jenis Proyek</p>
                    </Button>
                </div>
                <DataTable
                    className="mt-4"
                    emptyMessage="Tidak ada proyek saat ini"
                    data={list_jenis?.data as JenisProyek[]}
                    columns={LIST_TYPE_COLUMNS}
                    key={list_jenis?.data?.length}
                    pagination={{
                        current_page: list_jenis?.current_page as number,
                        last_page: list_jenis?.last_page as number,
                        per_page: list_jenis?.per_page as number,
                        total: list_jenis?.total as number,
                        from: list_jenis?.from as number,
                        to: list_jenis?.to as number,
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
                                    ? 'Buat jenis proyek baru'
                                    : selectedModalType === 'put'
                                      ? `Ubah jenis proyek ${selectedDataJenis?.nama}`
                                      : selectedModalType === 'delete'
                                        ? `Hapus jenis proyek`
                                        : ''}
                            </h4>
                        </ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        {selectedModalType === 'delete' ? (
                            <div className="flex w-full max-w-[500px] items-center justify-center text-center">
                                <h4 className="text-sm">
                                    Anda yakin ingin menghapus jenis proyek dengan nama <b className="text-accent-foreground">{data?.nama}</b> ?
                                </h4>
                            </div>
                        ) : (
                            <div className="grid w-full grid-cols-1 items-center gap-2 p-4 sm:grid-cols-2 sm:gap-4">
                                <AppSelect
                                    options={kategoriOptions ?? []}
                                    value={data?.kategori_proyek_id !== 0 ? data?.kategori_proyek_id?.toString() : ''}
                                    onValueChange={(e) => setData('kategori_proyek_id', Number(e))}
                                    label="Kategori"
                                    placeholder="Pilih kategori proyek . . ."
                                    // error={errors?.kategori_proyek_id}
                                />
                                <AppInput
                                    disabled={data?.kategori_proyek_id === 0 || data?.kategori_proyek_id === null}
                                    placeholder="Masukkan nama jenis . . ."
                                    label="Nama Jenis Proyek"
                                    value={data?.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    // error={errors?.nama}
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

export default ProjectConfigTypeIndex;
