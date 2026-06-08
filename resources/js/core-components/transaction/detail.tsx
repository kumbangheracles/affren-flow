import DetailItem from '@/components/app-detail-item';
import AppSelect from '@/components/app-select';
import { Badge } from '@/components/ui-shadcn/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { ModalBody, ModalContent, ModalHeader } from '@/components/ui-shadcn/modal';
import { Button } from '@/components/ui/button';
import { Modal, ModalClose, ModalFooter } from '@/components/ui/modal';
import { formatCurrency, formatDate, formatPercent } from '@/helpers/format';
import { useCountUp } from '@/hooks/use-count';
import { useMounted } from '@/hooks/use-mounted';
import useRole from '@/hooks/use-role';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { AnggaranProps } from '@/types/anggaran.type';
import { initialTransaksi, KategoriTransaksi, TransaksiItem, TransaksiProps } from '@/types/transaction.type';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DetailItemTransaksiContent from './assets/components/DetailItemTransaksiContent';
import ModalFormTransaksiItem from './assets/components/ModalFormTransaksiItem';

interface PageProps extends InertiaPageProps {
    transaksi?: TransaksiProps;
    anggaran?: AnggaranProps;
}

const TransactionDetailIndex = () => {
    const { props } = usePage<PageProps>();
    const transaksi = props?.transaksi;
    const anggaran = props?.anggaran;

    const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
    const [modalType, setModalType] = useState<'update' | 'delete' | 'update_status' | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isStatus, setIsStatus] = useState<TransaksiProps['status'] | null>(null);
    const [selectedDataItem, setSelectedDataItem] = useState<TransaksiItem | null>(null);
    const { currentRole } = useRole();
    const form = useForm<TransaksiProps>(initialTransaksi);
    const { setData, processing } = form;
    const handleSubmitTransaksi = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!transaksi?.transaksi_id || !isStatus) {
            toast.error('Data transaksi tidak valid.');
            return;
        }

        try {
            const res = await axios.patch(`/transaction/${transaksi.transaksi_id}/status`, {
                status: isStatus,
            });

            toast.success(res.data.message);
            router.reload();
            setIsStatus(null);
        } catch (error) {
            console.log('error: ', error);
            toast.error('Gagal memperbarui status transaksi.');
        } finally {
            setIsStatus(null);
        }
    };

    useEffect(() => {
        setData('status', isStatus);
    }, [isStatus]);

    // console.log('props: ', props);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Detail Transaksi',
            href: `/transaction/${transaksi?.transaksi_id}/detail`,
        },
    ];

    // console.log('Transaksi Id: ', transaksi?.transaksi_id);
    const mounted = useMounted();
    const animatedJumlah = useCountUp(transaksi?.jumlah as number, 1000, mounted);

    const handleOpenModal = (key: string | null, type: 'update' | 'delete' | 'update_status' | null) => {
        setSelectedId(key);
        setIsOpenEdit(true);
        setModalType(type);
    };
    const handleCloseModal = () => {
        setSelectedId(null);
        setIsOpenEdit(false);
        setSelectedDataItem(null);
        setModalType(null);
        setIsStatus(null);
    };

    const handleChangeStatus = (value: TransaksiProps['status'] | null) => {
        setIsStatus(value);
    };

    useEffect(() => {
        const selectedData = transaksi?.items?.find((item) => item?.item_id === selectedId) ?? null;
        // console.log('Transaksiid: ', transaksid);
        setSelectedDataItem(selectedData as TransaksiItem);
    }, [selectedId]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Transaksi" />

            <div className="mt-4 flex w-full items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="bg-primary hidden h-1 w-6 rounded-full sm:block" />
                    <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase opacity-60">Ringkasan Transaksi</h2>
                </div>
                <Button
                    onClick={() => router.visit('/transaction')}
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:text-foreground gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Button>
            </div>

            <Card className="border-border bg-card m-4 shadow-sm">
                <CardHeader className="border-border border-b pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
                                <Receipt className="text-primary h-4 w-4" />
                            </div>
                            <CardTitle className="text-card-foreground text-sm font-bold sm:text-base">Rincian Transaksi</CardTitle>
                        </div>

                        {currentRole === 'admin' &&
                            transaksi?.kategori !== 'biaya_tak_terduga' &&
                            transaksi?.kategori !== 'operasional' &&
                            transaksi?.kategori !== 'material' && (
                                <>
                                    {transaksi?.status !== 'lunas' && (
                                        <AppSelect
                                            value={transaksi?.status as TransaksiProps['']}
                                            options={[
                                                { label: 'Setujui', value: 'disetujui' },
                                                { label: 'Belum Disetujui', value: 'belum_disetujui' },
                                                { label: 'Tolak', value: 'ditolak' },
                                                { label: 'Lunas', value: 'lunas' },
                                            ]}
                                            onValueChange={(value) => handleChangeStatus(value as unknown as TransaksiProps['status'])}
                                            disabled={processing}
                                        />
                                    )}
                                    {transaksi?.status === 'lunas' && <Badge>{transaksi?.status.toUpperCase()}</Badge>}

                                    <Modal open={isStatus !== null}>
                                        <ModalContent size="xl">
                                            <ModalHeader className="font-semibold">
                                                Update Status {transaksi?.kategori.replace('_', ' ').toUpperCase()} {transaksi?.proyek?.nama_proyek}
                                            </ModalHeader>
                                            <ModalBody>
                                                <p className="w-full text-center text-sm tracking-wide">
                                                    {isStatus === 'lunas' && (
                                                        <>
                                                            Anda yakin ingin mengupdate status transaksi{' '}
                                                            {transaksi?.kategori.replace('_', ' ').toUpperCase()} ini menjadi Lunas?, setelah ini
                                                            status tidak dapat di ubah lagi !!.
                                                        </>
                                                    )}

                                                    {isStatus !== 'lunas' && (
                                                        <>
                                                            {' '}
                                                            Anda yakin ingin mengupdate status transaksi{' '}
                                                            {transaksi?.kategori.replace('_', ' ').toUpperCase()} ini ?
                                                        </>
                                                    )}
                                                </p>
                                            </ModalBody>
                                            <ModalFooter>
                                                <ModalClose>
                                                    <Button variant={'outline'} onClick={() => setIsStatus(null)}>
                                                        Batal
                                                    </Button>
                                                </ModalClose>
                                                <Button variant={'default'} onClick={handleSubmitTransaksi}>
                                                    Konfirmasi
                                                </Button>
                                            </ModalFooter>
                                        </ModalContent>
                                    </Modal>
                                </>
                            )}

                        {currentRole === 'mandor' &&
                            transaksi?.kategori !== 'biaya_tak_terduga' &&
                            transaksi?.kategori !== 'operasional' &&
                            transaksi?.kategori !== 'material' &&
                            (transaksi?.items?.filter((item) => item.status !== 'lunas').length as number) > 0 && <Badge>{transaksi?.status}</Badge>}
                    </div>
                </CardHeader>
                <CardContent className="space-y-0">
                    <DetailItem
                        labelClassName=" text-[10px] sm:text-sm"
                        valueClassName=" text-[10px] sm:text-sm"
                        label="Nama Proyek"
                        value={transaksi?.proyek?.nama_proyek}
                    />
                    <DetailItem
                        labelClassName=" text-[10px] sm:text-sm"
                        valueClassName=" text-[10px] sm:text-sm"
                        label="Dana Setelah Pajak"
                        value={formatCurrency(anggaran?.dana_setelah_pajak)}
                    />
                    <DetailItem
                        labelClassName=" text-[10px] sm:text-sm"
                        valueClassName=" text-[10px] sm:text-sm"
                        label="Kategori"
                        value={
                            transaksi?.kategori === 'biaya_tak_terduga'
                                ? 'Biaya Tak Terduga'
                                : transaksi?.kategori === 'jasa_tukang'
                                  ? 'Jasa Tukang'
                                  : transaksi?.kategori === 'mandor'
                                    ? 'Mandor'
                                    : transaksi?.kategori === 'material'
                                      ? 'Biaya Material'
                                      : transaksi?.kategori === 'operasional'
                                        ? 'Operasional'
                                        : transaksi?.kategori === 'staff_entry_data'
                                          ? 'Staff Entry Data'
                                          : transaksi?.kategori === 'staff_perpajakan'
                                            ? 'Staff Perpajakan'
                                            : '-'
                        }
                    />

                    <DetailItem
                        labelClassName=" text-[10px] sm:text-sm"
                        valueClassName=" text-[10px] sm:text-sm"
                        label="Persen Total (%)"
                        value={formatPercent(transaksi?.persen)}
                    />
                    {/* <DetailItem
                        labelClassName=" text-[10px] sm:text-sm"
                        valueClassName=" text-[10px] sm:text-sm"
                        label="Status"
                        isStatus={true}
                        toneStatus={
                            transaksi?.status === 'ditolak'
                                ? 'error'
                                : transaksi?.status === 'belum_disetujui'
                                  ? 'warning'
                                  : transaksi?.status === 'disetujui'
                                    ? 'info'
                                    : transaksi?.status === 'lunas'
                                      ? 'success'
                                      : 'default'
                        }
                        value={transaksi?.status?.toUpperCase()}
                    /> */}
                    {/* <DetailItem
                        labelClassName=" text-[10px] sm:text-sm"
                        valueClassName=" text-[10px] sm:text-sm"
                        label="Jumlah Total (IDR)"
                        value={formatCurrency(transaksi?.jumlah)}
                    /> */}
                    <DetailItem
                        labelClassName=" text-[10px] sm:text-sm"
                        valueClassName="text-[10px] sm:text-sm rounded-xl! px-2 bg-foreground text-background font-semibold!"
                        label="Dibuat oleh"
                        value={transaksi?.creator_transaksi?.name || '-'}
                    />
                    {/* <DetailItem
                        labelClassName=" text-[10px] sm:text-sm"
                        valueClassName="text-[10px] sm:text-sm rounded-xl! px-2 bg-foreground text-background font-semibold!"
                        label="Disetujui Oleh"
                        value={transaksi?.approver_transaksi?.name || '-'}
                    /> */}
                    <DetailItem
                        labelClassName=" text-[10px] sm:text-sm"
                        valueClassName=" text-[10px] sm:text-sm"
                        label="Tanggal"
                        value={formatDate(transaksi?.tanggal)}
                    />
                    {/* <DetailItem
                        labelClassName=" text-[10px] sm:text-sm"
                        valueClassName=" text-[10px] sm:text-sm"
                        label="Keterangan"
                        value={transaksi?.keterangan}
                    /> */}
                    <div className="py-2.5">
                        <span className={cn(`text-foreground text-[10px] font-semibold sm:text-sm`)}>Keterangan</span>
                        <div className="bg-muted text-muted-foreground mt-2 rounded-md px-3 py-2 text-[10px] font-normal sm:text-sm">
                            <p>{transaksi?.keterangan}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <DetailItemTransaksiContent
                transaksiId={transaksi?.transaksi_id}
                openModal={handleOpenModal}
                transaksiValue={transaksi}
                title={
                    transaksi?.kategori === 'biaya_tak_terduga'
                        ? 'List Biaya Digunakan'
                        : transaksi?.kategori === 'operasional'
                          ? 'List Transaksi Operasional'
                          : transaksi?.kategori === 'material'
                            ? 'List Transaksi Material'
                            : ''
                }
                itemValueList={transaksi?.items}
                kategoriTransaksi={transaksi?.kategori as KategoriTransaksi}
            />
            <Card className="border-primary/20 bg-card mx-4 mt-0 mb-4 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center gap-1 py-6">
                    <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">Total Transaksi</p>
                    <h4 className="text-primary text-3xl font-bold tracking-tight">{formatCurrency(animatedJumlah ?? 0)}</h4>
                    <p className="text-muted-foreground mt-1 text-xs">
                        {formatDate(transaksi?.tanggal)} ·{' '}
                        {transaksi?.kategori === 'biaya_tak_terduga'
                            ? 'Biaya Tak Terduga'
                            : transaksi?.kategori === 'jasa_tukang'
                              ? 'Jasa Tukang'
                              : transaksi?.kategori === 'mandor'
                                ? 'Mandor'
                                : transaksi?.kategori === 'material'
                                  ? 'Biaya Material'
                                  : transaksi?.kategori === 'operasional'
                                    ? 'Operasional'
                                    : transaksi?.kategori === 'staff_entry_data'
                                      ? 'Staff Entry Data'
                                      : transaksi?.kategori === 'staff_perpajakan'
                                        ? 'Staff Perpajakan'
                                        : '-'}
                    </p>
                </CardContent>
            </Card>

            <ModalFormTransaksiItem
                onCloseModal={handleCloseModal}
                item={selectedDataItem as TransaksiItem}
                item_id={selectedId as string}
                open={isOpenEdit}
                kategori={transaksi?.kategori}
                transaksi_id={transaksi?.transaksi_id}
                type={modalType}
            />
        </AppLayout>
    );
};

export default TransactionDetailIndex;
