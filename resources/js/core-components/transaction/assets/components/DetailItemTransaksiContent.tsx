import DetailItem from '@/components/app-detail-item';
import AppSelect from '@/components/app-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-shadcn/card';
import { Empty, EmptyContent, EmptyHeader } from '@/components/ui-shadcn/empty';
import { ModalContent } from '@/components/ui-shadcn/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalClose, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { formatCurrency, formatDate } from '@/helpers/format';
import { useIsMobile } from '@/hooks/use-mobile';
import useRole from '@/hooks/use-role';
import { initialTransaksiItem, KategoriTransaksi, TransaksiItem, TransaksiItemForm, TransaksiProps } from '@/types/transaction.type';
import { router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { BadgeInfo, Loader2, Plus, ShieldQuestion, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PropTypes {
    kategoriTransaksi: KategoriTransaksi;
    // icon?: ReactNode;
    title?: string;
    itemValueList?: TransaksiItem[];
    itemValue?: TransaksiItem;
    transaksiId?: string;
    transaksiValue?: TransaksiProps;
    openModal?: (id: string, type: 'update' | 'delete' | null) => void;
    closeModal?: () => void;
}

const DetailItemTransaksiContent = ({ kategoriTransaksi, title, itemValueList, transaksiValue, openModal, transaksiId }: PropTypes) => {
    const isMobile = useIsMobile();
    const [isStatus, setIsStatus] = useState<TransaksiItem['status'] | null>(null);
    const [selectedIdItem, setSelectedIdItem] = useState<string | null>(null);
    const [selectedNama, setSelectedNama] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { currentRole } = useRole();
    const namaItem =
        kategoriTransaksi === 'biaya_tak_terduga'
            ? 'Barang/kegiatan'
            : kategoriTransaksi === 'material'
              ? 'Barang/Bahan'
              : kategoriTransaksi === 'operasional'
                ? 'Kegiatan/Pekerjaan'
                : '';
    const handleChangeStatus = (value: TransaksiItem['status'] | null, itemId: string | null, nama: string) => {
        setIsStatus(value);
        setSelectedIdItem(itemId);
        setSelectedNama(nama);
    };

    const handleCloseModalStatus = () => {
        setIsStatus(null);
        setSelectedIdItem(null);
        setSelectedNama(null);
    };

    // console.log('Transaksi value: ', transaksiValue);
    const form = useForm<TransaksiItemForm>(initialTransaksiItem);
    const { setData, processing } = form;
    const handleSubmitTransaksi = async () => {
        if (!selectedIdItem || !isStatus) {
            toast.error('Data transaksi tidak valid.');
            return;
        }
        try {
            setLoading(true);
            await axios.patch(`/transaction/${transaksiId}/items/${selectedIdItem}/status`, {
                status: isStatus,
            });

            toast.success(`Status item transaksi ${selectedNama} berhasil diperbarui.`);
            router.reload();
        } catch (error) {
            console.log('error: ', error);
            toast.error('Gagal memperbarui status item transaksi.');
        } finally {
            setIsStatus(null);
            setSelectedIdItem(null);
            setSelectedNama(null);
            setLoading(false);
        }
    };

    const labelStatus = (status: TransaksiProps['status']) => {
        let label: string = '';

        if (status === 'belum_disetujui') {
            label = 'Belum disetujui';
        } else if (status === 'disetujui') {
            label = 'Disetujui oleh';
        } else if (status === 'ditolak') {
            label = 'Di ubah oleh';
        } else if (status === 'lunas') {
            label = 'Di setujui oleh';
        }

        return label;
    };

    useEffect(() => {
        setData('status', isStatus as TransaksiItem['status']);
    }, [isStatus]);

    return (
        <>
            {kategoriTransaksi === 'jasa_tukang' ||
            kategoriTransaksi === 'mandor' ||
            kategoriTransaksi === 'staff_entry_data' ||
            kategoriTransaksi === 'staff_perpajakan' ? (
                <></>
            ) : (
                <Card className="bg-background mx-4 mt-0 mb-4 border-none!">
                    <CardHeader className="border-border flex flex-col items-start justify-between gap-3 border-b pb-3 sm:flex-row sm:items-center sm:gap-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
                                <div className="text-primary">
                                    <div className="text-primary">
                                        {kategoriTransaksi === 'biaya_tak_terduga' ? (
                                            <ShieldQuestion />
                                        ) : kategoriTransaksi === 'material' ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                className="lucide lucide-brick-wall-fire-icon lucide-brick-wall-fire"
                                            >
                                                <path d="M16 3v2.107" />
                                                <path d="M17 9c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 22 17a5 5 0 0 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C13 11.5 16 9 17 9" />
                                                <path d="M21 8.274V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.938" />
                                                <path d="M3 15h5.253" />
                                                <path d="M3 9h8.228" />
                                                <path d="M8 15v6" />
                                                <path d="M8 3v6" />
                                            </svg>
                                        ) : kategoriTransaksi === 'operasional' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 12 12">
                                                <path
                                                    fill="currentColor"
                                                    d="M8 8H7v1H6v1h5V9h-1V8H9v1H8Zm0 0h1V4h2V3H4V1H3v2H0v2h2V4h1v2h1V4h4Zm-6 4h3V6H4v1H3V6H2Zm1-1v-1h1v1Zm0-2V8h1v1Zm0 0"
                                                />
                                            </svg>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <CardTitle className="text-card-foreground text-sm font-bold sm:text-base">{title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-muted flex items-center gap-2 rounded-xl border px-4 py-2 text-[12px] font-semibold sm:text-sm">
                                <span>Total:</span>
                                <span className="font-semibold">{formatCurrency(transaksiValue?.jumlah)}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex w-full flex-col items-center justify-center">
                        {itemValueList?.length === 0 ? (
                            <div>
                                <h4 className="text-foreground text-sm font-bold tracking-wide sm:text-base">Belum ada {namaItem} yang di beli</h4>

                                <Empty>
                                    <EmptyHeader>
                                        <BadgeInfo size={40} />
                                        {/* <EmptyTitle>No data</EmptyTitle> */}
                                    </EmptyHeader>
                                    <EmptyContent className="mt-2">
                                        <Button onClick={() => router.visit(`/transaction/${transaksiValue?.transaksi_id}/edit`)}>
                                            <Plus /> Tambah
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            </div>
                        ) : (
                            <div className="flex w-full flex-col items-center gap-3">
                                {itemValueList?.map((item, index) => (
                                    <div className="bg-muted-foreground w-full rounded-xl p-4" key={item?.item_id}>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-muted text-[12px] font-bold tracking-wide sm:text-base">
                                                {index + 1}. {item?.nama_item}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <div className="my-2 hidden max-w-30 sm:block">
                                                    {(currentRole === 'admin' || currentRole === 'super_admin') && (
                                                        <>
                                                            {item?.status !== 'lunas' && (
                                                                <AppSelect
                                                                    size="responsive"
                                                                    value={item?.status as TransaksiItem['status']}
                                                                    options={[
                                                                        { label: 'Setujui', value: 'disetujui' },
                                                                        { label: 'Belum Disetujui', value: 'belum_disetujui' },
                                                                        { label: 'Tolak', value: 'ditolak' },
                                                                        { label: 'Lunas', value: 'lunas' },
                                                                    ]}
                                                                    onValueChange={(value) =>
                                                                        handleChangeStatus(
                                                                            value as unknown as TransaksiItem['status'],
                                                                            item?.item_id,
                                                                            item?.nama_item,
                                                                        )
                                                                    }
                                                                    disabled={processing}
                                                                />
                                                            )}
                                                            {item?.status === 'lunas' && (
                                                                <Badge variant={'secondary'}>{item?.status.toUpperCase().replace('_', ' ')}</Badge>
                                                            )}

                                                            <Modal open={isStatus !== null} key={selectedIdItem}>
                                                                <ModalContent size="xl">
                                                                    <ModalHeader className="text-sm font-semibold sm:text-xl">
                                                                        Update Status {selectedNama}{' '}
                                                                    </ModalHeader>
                                                                    <ModalBody>
                                                                        <p className="w-full text-center text-[10px] tracking-wide sm:text-sm">
                                                                            {isStatus === 'lunas' && (
                                                                                <>
                                                                                    Anda yakin ingin mengupdate status transaksi {selectedNama} ini
                                                                                    menjadi Lunas?, setelah ini status tidak dapat di ubah lagi !!.
                                                                                </>
                                                                            )}

                                                                            {isStatus !== 'lunas' && (
                                                                                <>
                                                                                    {' '}
                                                                                    Anda yakin ingin mengupdate status transaksi {selectedNama} ini ?
                                                                                </>
                                                                            )}
                                                                        </p>
                                                                    </ModalBody>
                                                                    <ModalFooter>
                                                                        <ModalClose>
                                                                            <Button
                                                                                disabled={loading || processing}
                                                                                variant={'outline'}
                                                                                onClick={handleCloseModalStatus}
                                                                            >
                                                                                Batal
                                                                            </Button>
                                                                        </ModalClose>
                                                                        <Button
                                                                            disabled={loading || processing}
                                                                            variant={'default'}
                                                                            onClick={() => handleSubmitTransaksi()}
                                                                        >
                                                                            {loading || processing ? (
                                                                                <Loader2 className="animate-spin" />
                                                                            ) : (
                                                                                'Konfirmasi'
                                                                            )}
                                                                        </Button>
                                                                    </ModalFooter>
                                                                </ModalContent>
                                                            </Modal>
                                                        </>
                                                    )}

                                                    {currentRole === 'mandor' && (
                                                        <Badge variant={item?.status === 'ditolak' ? 'destructive' : 'secondary'}>
                                                            {item?.status?.toUpperCase().replace('_', ' ')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div
                                                    onClick={() => openModal?.(item?.item_id, 'update')}
                                                    className="bg-muted text-foreground cursor-pointer rounded-full p-1 transition-all hover:opacity-50 sm:p-2"
                                                >
                                                    <SquarePen size={isMobile ? 14 : 17} />
                                                </div>
                                                <div
                                                    onClick={() => openModal?.(item?.item_id, 'delete')}
                                                    className="bg-destructive text-foreground cursor-pointer rounded-full p-1 transition-all hover:opacity-50 sm:p-2"
                                                >
                                                    <Trash2 size={isMobile ? 14 : 17} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 block max-w-30 sm:hidden">
                                            {currentRole === 'admin' && (
                                                <>
                                                    {item?.status !== 'lunas' && (
                                                        <AppSelect
                                                            size="responsive"
                                                            value={item?.status as TransaksiProps['']}
                                                            options={[
                                                                { label: 'Setujui', value: 'disetujui' },
                                                                { label: 'Belum Disetujui', value: 'belum_disetujui' },
                                                                { label: 'Tolak', value: 'ditolak' },
                                                                { label: 'Lunas', value: 'lunas' },
                                                            ]}
                                                            onValueChange={(value) =>
                                                                handleChangeStatus(
                                                                    value as unknown as TransaksiProps['status'],
                                                                    item?.item_id,
                                                                    item?.nama_item,
                                                                )
                                                            }
                                                            // disabled={processing}
                                                        />
                                                    )}
                                                    {item?.status === 'lunas' && (
                                                        <Badge variant={'secondary'}>{item?.status.toUpperCase().replace('_', ' ')}</Badge>
                                                    )}

                                                    <Modal open={isStatus !== null} key={selectedIdItem}>
                                                        <ModalContent size="xl">
                                                            <ModalHeader className="text-sm font-semibold sm:text-xl">
                                                                Update Status {selectedNama}{' '}
                                                            </ModalHeader>
                                                            <ModalBody>
                                                                <p className="w-full text-center text-[10px] tracking-wide sm:text-sm">
                                                                    {isStatus === 'lunas' && (
                                                                        <>
                                                                            Anda yakin ingin mengupdate status transaksi {selectedNama} ini menjadi
                                                                            Lunas?, setelah ini status tidak dapat di ubah lagi !!.
                                                                        </>
                                                                    )}

                                                                    {isStatus !== 'lunas' && (
                                                                        <> Anda yakin ingin mengupdate status transaksi {selectedNama} ini ?</>
                                                                    )}
                                                                </p>
                                                            </ModalBody>
                                                            <ModalFooter>
                                                                <ModalClose>
                                                                    <Button variant={'outline'} onClick={handleCloseModalStatus}>
                                                                        Batal
                                                                    </Button>
                                                                </ModalClose>
                                                                <Button variant={'default'} onClick={() => handleSubmitTransaksi()}>
                                                                    Konfirmasi
                                                                </Button>
                                                            </ModalFooter>
                                                        </ModalContent>
                                                    </Modal>
                                                </>
                                            )}

                                            {currentRole === 'mandor' && (
                                                <Badge variant={'secondary'}>{item?.status?.toUpperCase().replace('_', ' ')}</Badge>
                                            )}
                                        </div>
                                        <div className="mx-auto mt-2 w-full p-0">
                                            <DetailItem
                                                className="!border-white"
                                                labelClassName="text-muted! text-[10px] sm:text-sm"
                                                valueClassName="text-muted! text-[10px] sm:text-sm"
                                                label="Harga Satuan"
                                                value={formatCurrency(item?.harga_satuan)}
                                            />
                                            <DetailItem
                                                className="!border-white"
                                                labelClassName="text-muted! text-[10px] sm:text-sm"
                                                valueClassName="text-[10px] sm:text-sm rounded-xl! px-2 bg-foreground text-background font-semibold!"
                                                label="Diajukan oleh"
                                                value={item?.creator_item_transaksi?.name}
                                            />
                                            <DetailItem
                                                className="!border-white"
                                                labelClassName="text-muted! text-[10px] sm:text-sm"
                                                valueClassName="text-[10px] sm:text-sm rounded-xl! px-2 bg-foreground text-background font-semibold!"
                                                label={labelStatus(item?.status)}
                                                value={item?.approver_item_transaksi?.name}
                                            />
                                            <DetailItem
                                                className="!border-white"
                                                labelClassName="text-muted! text-[10px] sm:text-sm"
                                                valueClassName="text-muted! text-[10px] sm:text-sm"
                                                label="Kuantitas"
                                                value={item?.qty !== undefined && item?.qty !== null ? Number(item.qty).toString() : ''}
                                            />
                                            <DetailItem
                                                className="!border-white"
                                                labelClassName="text-muted! text-[10px] sm:text-sm"
                                                valueClassName="text-muted! text-[10px] sm:text-sm"
                                                label="Satuan"
                                                isStatus
                                                value={item?.satuan}
                                            />

                                            {/* {currentRole === 'mandor' && (
                                                <DetailItem
                                                    className="!border-white"
                                                    labelClassName="text-muted! text-[10px] sm:text-sm"
                                                    valueClassName="text-muted! text-[10px] sm:text-sm"
                                                    label="Status"
                                                    isStatus
                                                    value={item?.status?.toUpperCase().replace('_', ' ')}
                                                />
                                            )} */}

                                            <DetailItem
                                                className="!border-white"
                                                labelClassName="text-muted! text-[10px] sm:text-sm"
                                                valueClassName="text-muted! text-[10px] sm:text-sm"
                                                label="Tanggal Transaksi"
                                                value={formatDate(item?.tanggal)}
                                            />
                                            <DetailItem
                                                className="!border-white"
                                                labelClassName="text-muted! text-[10px] sm:text-sm"
                                                valueClassName="text-muted! text-[10px] sm:text-sm"
                                                label="Terakhir di edit"
                                                value={formatDate(item?.updated_at)}
                                            />
                                            <DetailItem
                                                className="!border-white"
                                                labelClassName="text-muted! text-[10px] sm:text-sm"
                                                valueClassName="text-muted! text-[10px] sm:text-sm"
                                                label="Sub Total"
                                                value={formatCurrency(item?.subtotal)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    );
};

export default DetailItemTransaksiContent;
