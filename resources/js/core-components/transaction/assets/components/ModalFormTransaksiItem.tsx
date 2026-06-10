import AppDatePicker from '@/components/app-day-picker';
import AppInput from '@/components/app-input';
import AppTextArea from '@/components/app-textare';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalProps, ModalTitle } from '@/components/ui/modal';
import { useIsMobile } from '@/hooks/use-mobile';
import { initialTransaksiItem, KategoriTransaksi, TransaksiItem, TransaksiItemForm } from '@/types/transaction.type';
import { router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { transaksiItemSchema } from '../transaksi-assets';
type ItemForm = Omit<TransaksiItem, 'transaksi_id' | 'created_at' | 'updated_at'>;

interface PropTypes extends Omit<ModalProps, 'children'> {
    transaksi_id?: string;
    item_id?: string;
    item?: ItemForm;
    onChange?: (item: ItemForm) => void;
    kategori?: KategoriTransaksi;
    type: 'update' | 'delete' | 'update_status' | null;
}

const ModalFormTransaksiItem = ({ open, item_id, item, kategori, onChange, transaksi_id, onCloseModal, onOpenChange, type }: PropTypes) => {
    const form = useForm<TransaksiItemForm>({ ...initialTransaksiItem, ...item });
    const [clientErrors, setClientErrors] = useState<Partial<Record<keyof TransaksiItemForm, string>>>({});
    const namaItem =
        kategori === 'biaya_tak_terduga'
            ? 'Barang/kegiatan'
            : kategori === 'material'
              ? 'Barang/Bahan'
              : kategori === 'operasional'
                ? 'Kegiatan/Pekerjaan'
                : '';

    const namaSatuan =
        kategori === 'biaya_tak_terduga'
            ? 'Biaya tiap satuan'
            : kategori === 'material'
              ? 'Harga Satuan'
              : kategori === 'operasional'
                ? 'Biaya tiap satuan'
                : '';
    const [loading, setLoading] = useState<boolean>(false);
    const isMobile = useIsMobile();
    const { data, setData, processing } = form;
    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     console.log('Data terkirim: ', form.data);

    //     put(`/transaction/${transaksi_id}/items/${item_id}`, {
    //         preserveState: false,
    //         onStart: () => setLoading(true),

    //         onSuccess: () => {
    //             toast.success(`Berhasil memperbarui transaksi ${namaItem} ${data?.nama_item}.`, { position: 'top-right' });
    //             onCloseModal?.();
    //         },

    //         onError: (err) => {
    //             toast.error('Gagal memperbarui transaksi.', { position: 'top-right' });
    //             console.log('Error: ', err);
    //         },

    //         onFinish: () => setLoading(false),
    //     });
    // };
    const validate = () => {
        const result = transaksiItemSchema.safeParse(data);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            setClientErrors(
                Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ''])) as Partial<
                    Record<keyof TransaksiItemForm, string>
                >,
            );
            return false;
        }
        setClientErrors({});
        return true;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (type === 'update') {
            if (!validate()) return;
            try {
                await axios.put(`/transaction/${transaksi_id}/items/${item_id}`, data);
                toast.success(`Berhasil memperbarui transaksi ${namaItem} ${data?.nama_item}.`, { position: 'top-right' });
                onCloseModal?.();
                router?.reload();
            } catch (err) {
                toast.error('Gagal memperbarui transaksi.', { position: 'top-right' });
                console.log('Error:', err);
            } finally {
                setLoading(false);
            }
        } else if (type === 'delete') {
            try {
                await axios.delete(`/transaction/${transaksi_id}/items/${item_id}`);
                toast.success(`Berhasil menghapus transaksi ${namaItem} ${data?.nama_item}.`, { position: 'top-right' });
                router?.reload();
                onCloseModal?.();
            } catch (err) {
                toast.error('Gagal menghapus transaksi.', { position: 'top-right' });
                console.log('Error:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        setData(item as TransaksiItem);
    }, [item]);
    return (
        <Modal open={open}>
            <ModalContent className="p-0!" size={!isMobile ? 'xl' : 'sm'} hideClose>
                <ModalHeader>
                    {type === 'update' && (
                        <ModalTitle className="text-sm sm:text-xl">
                            Ubah Transaksi {namaItem} {item?.nama_item}{' '}
                        </ModalTitle>
                    )}
                    {type === 'delete' && <ModalTitle className="text-sm sm:text-xl">Hapus Transaksi {namaItem} </ModalTitle>}
                </ModalHeader>
                <ModalBody className="px-2! sm:px-6!">
                    {type === 'update' && (
                        <>
                            <div className="grid w-full grid-cols-1 items-center gap-2 sm:grid-cols-2 sm:gap-4">
                                <div className="flex w-full flex-col gap-3">
                                    <AppInput
                                        type="text"
                                        placeholder={`Masukkan Nama ${namaItem} . . .`}
                                        label={
                                            kategori === 'biaya_tak_terduga'
                                                ? 'Nama/Judul'
                                                : kategori === 'operasional'
                                                  ? 'Nama kegiatan'
                                                  : kategori === 'material'
                                                    ? 'Nama Barang'
                                                    : ''
                                        }
                                        // value={data?.nama_item || ''}
                                        value={data?.nama_item || ''}
                                        required
                                        onChange={(e) => {
                                            setData('nama_item', e.target.value);
                                        }}
                                        className="h-8 w-full"
                                        error={clientErrors?.nama_item}
                                    />
                                </div>
                                <div className="flex w-full flex-col gap-3">
                                    <AppInput
                                        label="Satuan (hari, meter, m3, cm, dll)"
                                        required
                                        type="text"
                                        value={data?.satuan || ''}
                                        onChange={(e) => setData('satuan', e.target.value)}
                                        className="h-8 w-full"
                                        placeholder="Masukkan satuan . . ."
                                        error={clientErrors?.satuan}
                                    />
                                    {/* {errors[`items.${realIndex}.satuan`] && (
                                            <p className="text-destructive mt-1 text-xs">{errors[`items.${realIndex}.satuan`]}</p>
                                        )} */}
                                </div>
                                <div className="flex w-full flex-col gap-3">
                                    <AppInput
                                        type="number"
                                        value={data?.qty !== undefined && data?.qty !== null ? Number(data?.qty).toString() : ''}
                                        label="Kuantitas"
                                        required
                                        placeholder="Masukkan kuantitas . . ."
                                        onChange={(e) => setData('qty', e.target.value)}
                                        className="h-8 w-full"
                                        error={clientErrors?.qty}
                                    />
                                    {/* {errors[`items.${realIndex}.qty`] && (
                                            <p className="text-destructive mt-1 text-xs">{errors[`items.${realIndex}.qty`]}</p>
                                        )} */}
                                </div>
                                <div className="flex w-full flex-col gap-3">
                                    <AppDatePicker
                                        label="Tanggal Transaksi"
                                        required
                                        placeholder="Masukkan tanggal . . . "
                                        inputClassName="h-8"
                                        value={data?.tanggal ? new Date(data?.tanggal) : undefined}
                                        onChange={(e) => setData('tanggal', e ? format(e, 'yyyy-MM-dd') : '')}
                                        className="w-full"
                                        error={clientErrors?.tanggal}
                                    />
                                    {/* {errors[`items.${realIndex}.tanggal`] && (
                                            <p className="text-destructive mt-1 text-xs">{errors[`items.${realIndex}.tanggal`]}</p>
                                        )} */}
                                </div>
                                <div className="flex w-full flex-col gap-3">
                                    <AppInput
                                        type="number"
                                        label={namaSatuan}
                                        placeholder={`Masukkan ${namaSatuan} . . .`}
                                        value={data?.harga_satuan}
                                        onChange={(e) => setData('harga_satuan', e.target.value)}
                                        required
                                        error={clientErrors?.harga_satuan}
                                        className="h-8 w-full"
                                    />
                                    {/* {errors[`items.${realIndex}.harga_satuan`] && (
                                            <p className="text-destructive mt-1 text-xs">{errors[`items.${realIndex}.harga_satuan`]}</p>
                                        )} */}
                                </div>
                            </div>
                            <div className="mt-2 flex w-full flex-col gap-3">
                                <AppTextArea
                                    value={data?.keterangan}
                                    label="Keterangan"
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    placeholder="Masukkan keterangan . . ."
                                    className="h-8 w-full"
                                    error={clientErrors?.keterangan}
                                />
                                {/* {errors[`items.${realIndex}.keterangan`] && (
                                            <p className="text-destructive mt-1 text-xs">{errors[`items.${realIndex}.keterangan`]}</p>
                                        )} */}
                            </div>
                        </>
                    )}
                    {type === 'delete' && (
                        <p className="text-sm">
                            Anda yakin ingin menghapus transaksi {namaItem} {item?.nama_item}?{' '}
                        </p>
                    )}
                </ModalBody>
                <ModalFooter className="flex items-center gap-3">
                    <ModalClose asChild>
                        <Button variant={'outline'} onClick={onCloseModal} className="...">
                            {processing ? <LoaderCircle className="animate-spin" /> : 'Batal'}
                        </Button>
                    </ModalClose>
                    {type === 'update' && (
                        <Button variant={'default'} onClick={(e) => handleSubmit(e)} className="...">
                            {processing ? <LoaderCircle className="animate-spin" /> : 'Simpan'}
                        </Button>
                    )}
                    {type === 'delete' && (
                        <Button variant={'default'} onClick={(e) => handleSubmit(e)} className="...">
                            {processing ? <LoaderCircle className="animate-spin" /> : 'Iya'}
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ModalFormTransaksiItem;
