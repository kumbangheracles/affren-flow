import AppDatePicker from '@/components/app-day-picker';
import AppInput from '@/components/app-input';
import AppSelect, { SelectOption } from '@/components/app-select';
import AppSelectMultiple from '@/components/app-select-multiple';
import AppTextArea from '@/components/app-textare';
import { FileUpload, FileUploadTrigger } from '@/components/ui-shadcn/file-upload';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { JenisProyek } from '@/types/jenis_proyek.type';
import { KategoriProyek } from '@/types/kategori_proyek.type';
import { initialProyek, ProyekImages, ProyekProps, StatusProyek } from '@/types/project.type';
import { UserProps } from '@/types/user.type';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PageProps extends InertiaPageProps {
    proyek?: ProyekProps;
    kategori_proyeks?: KategoriProyek[];
    jenis_proyeks?: JenisProyek[];
    list_mandors?: UserProps[];
}

const ProjectCreateIndex = () => {
    const { props } = usePage<PageProps>();
    const { proyek: dataProyek, jenis_proyeks, kategori_proyeks, list_mandors } = props;
    const projectId = dataProyek?.proyek_id ?? null;
    // const { flash } = usePage().props;
    // console.log(list_mandors);
    const proyekMandor = dataProyek?.proyek_mandor?.map((item) => item.id.toString());
    const [existingImages, setExistingImages] = useState<ProyekImages[]>(dataProyek?.proyek_images ?? []);
    const [mandorIds, setMandorIds] = useState<string[]>(proyekMandor ?? []);
    const [files, setFiles] = useState<File[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    // console.log('data proyek: ', dataProyek);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: projectId !== null ? 'Ubah proyek' : 'Buat Proyek Baru',
            href: projectId !== null ? `project/${projectId}/edit` : 'project/create',
        },
    ];

    const form = useForm<ProyekProps>(initialProyek);

    const { data, setData, post, processing, errors, put } = form;

    useEffect(() => {
        if (projectId && dataProyek) {
            setData(props.proyek as ProyekProps);
        }
    }, [projectId, dataProyek]);
    const KategoriProyekOptions: SelectOption[] = (kategori_proyeks ?? [])?.map((item) => ({
        value: String(item.id),
        label: item.nama,
    }));

    const ProyekMandorOptions: SelectOption[] = (list_mandors ?? [])?.map((item) => ({
        value: String(item?.id),
        label: item?.name,
    }));

    useEffect(() => {
        setData('mandor_ids', mandorIds);
    }, [mandorIds]);

    const jenisProyekOptions = (data: JenisProyek[], kategori_proyek_id: number): SelectOption[] => {
        const kategoriId = Number(kategori_proyek_id);

        return (data ?? [])
            .filter((item) => Number(item.kategori_proyek_id) === kategoriId)
            .map((item) => ({
                value: String(item.id),
                label: item.nama,
            }));
    };
    // File Input
    useEffect(() => {
        setData('uploaded_images', files);

        setData(
            'existing_images',
            existingImages.map((img) => img.id),
        );
    }, [files, existingImages]);
    const validateProyek = (data: ProyekProps) => {
        const errors: string[] = [];

        if (!data.nama_proyek?.trim()) errors.push('Nama proyek tidak boleh kosong');

        if (!data.nama_klien?.trim()) errors.push('Nama klien tidak boleh kosong');

        if (!data.kategori_proyek_id) errors.push('Kategori proyek harus dipilih');

        if (!data.jenis_proyek_id) errors.push('Jenis proyek harus dipilih');

        if (!data.status) errors.push('Status proyek harus dipilih');

        if (!data.pagu_total || data.pagu_total <= 0) errors.push('Pagu total harus lebih dari 0');

        // if (data.pajak_persen == null || data.pajak_persen < 0 || data.pajak_persen > 100) errors.push('Pajak harus di antara 0 - 100');

        // if (data.uang_bahan_persen == null || data.uang_bahan_persen < 0 || data.uang_bahan_persen > 100)
        //     errors.push('Uang bahan harus di antara 0 - 100');

        // if (data.jasa_tukang_persen == null || data.jasa_tukang_persen < 0 || data.jasa_tukang_persen > 100)
        //     errors.push('Jasa tukang harus di antara 0 - 100');

        // if (data.biaya_staff_perpajakan == null || data.biaya_staff_perpajakan < 0) errors.push('Biaya staff perpajakan tidak valid');

        // if (data.biaya_staff_entry_data == null || data.biaya_staff_entry_data < 0) errors.push('Biaya staff entry data tidak valid');

        // if (data.biaya_tak_terduga_persen == null || data.biaya_tak_terduga_persen < 0) errors.push('Biaya tak terduga tidak valid');

        if (!data.tanggal_mulai) errors.push('Tanggal mulai tidak boleh kosong');

        if (mandorIds.length === 0) errors.push('Proyek minimal harus punya 1 mandor.');
        if (mandorIds.length > 3) errors.push('Proyek maksimal punya 3 mandor.');

        if (data.tanggal_selesai && data.tanggal_selesai < data.tanggal_mulai) errors.push('Tanggal selesai tidak boleh sebelum tanggal mulai');

        if (errors.length > 0) {
            errors.forEach((err) => {
                toast.error(err);
            });
            return false;
        }

        return true;
    };
    const handleSubmitProyek = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateProyek(data)) return;

        if (projectId !== null) {
            setData('_method', 'PUT');
            post(`/project/${projectId}`, {
                forceFormData: true,
                onStart: () => setLoading(true),

                onSuccess: () => {
                    toast.success('Berhasil memperbarui proyek.', { position: 'top-right' });
                },

                onError: (err) => {
                    toast.error('Gagal memperbarui proyek.', { position: 'top-right' });
                    console.log('Error: ', err);
                },

                onFinish: () => setLoading(false),
            });
        } else {
            post('/project', {
                onStart: () => setLoading(true),

                onSuccess: () => {
                    toast.success('Berhasil membuat proyek baru.', { position: 'top-right' });
                },

                onError: (err) => {
                    toast.error('Gagal membuat proyek baru.', { position: 'top-right' });
                    console.log('Error: ', err);
                },

                onFinish: () => setLoading(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={projectId !== null ? 'Ubah proyek' : 'Buat Proyek Baru'} />
            <div className="mt-2 flex w-full items-center justify-end gap-4 px-4">
                <Button
                    disabled={loading || processing}
                    onClick={() => router.visit('/project')}
                    className={`"transition-all duration-150"`}
                    variant={'secondary'}
                >
                    <p className={`${cn(loading || processing ? 'animate-spin' : 'animate-none')}`}>
                        {loading || processing ? <Loader2 /> : 'Kembali'}
                    </p>
                </Button>
                <Button disabled={loading || processing} className={`"transition-all duration-150"`} onClick={(e) => handleSubmitProyek(e)}>
                    <p className={`${cn(loading || processing ? 'animate-spin' : 'animate-none')}`}>
                        {loading || processing ? <Loader2 /> : 'Simpan'}
                    </p>
                </Button>
            </div>
            <div className="grid grid-cols-1 items-center gap-4 px-4 py-2 sm:grid-cols-2">
                <AppInput
                    defaultValue={dataProyek?.nama_proyek || ''}
                    placeholder="Masukkan nama proyek . . ."
                    required
                    label="Nama Proyek"
                    onChange={(e) => setData('nama_proyek', e.target.value)}
                />
                <AppSelect
                    defaultValue={dataProyek?.kategori_proyek_id?.toString() || ''}
                    label="Kategori Proyek"
                    placeholder="Pilih opsi . . ."
                    required={true}
                    onValueChange={(value) => setData('kategori_proyek_id', Number(value))}
                    options={KategoriProyekOptions}
                />
                <AppSelect
                    defaultValue={dataProyek?.jenis_proyek_id?.toString() || ''}
                    label="Jenis Proyek"
                    placeholder="Pilih opsi . . ."
                    required={true}
                    disabled={data?.kategori_proyek_id === 0}
                    onValueChange={(value) => setData('jenis_proyek_id', Number(value))}
                    options={jenisProyekOptions(jenis_proyeks as JenisProyek[], data?.kategori_proyek_id as number)}
                />
                <AppSelect
                    defaultValue={(dataProyek?.status ?? 'sedang_berjalan') as StatusProyek}
                    label="Status Proyek"
                    placeholder="Pilih opsi . . ."
                    required={true}
                    onValueChange={(value) => setData('status', value as StatusProyek)}
                    options={[
                        { value: 'selesai', label: 'Selesai' },
                        { value: 'sedang_berjalan', label: 'Berjalan' },
                        { value: 'dibatalkan', label: 'Dibatalkan' },
                    ]}
                />
                <AppSelectMultiple
                    label="Mandor"
                    // tooltip="Pilih satu atau lebih mandor untuk proyek ini"
                    required
                    placeholder="Pilih mandor..."
                    options={ProyekMandorOptions}
                    value={mandorIds}
                    onValueChange={setMandorIds}
                    hint="Minimal pilih 1 mandor"
                />
                <AppDatePicker
                    defaultValue={dataProyek?.tanggal_mulai ? new Date(dataProyek.tanggal_mulai) : undefined}
                    required
                    label="Dimulai pada"
                    onChange={(e) => setData('tanggal_mulai', e ? format(e, 'yyyy-MM-dd') : '')}
                />
                <AppDatePicker
                    defaultValue={dataProyek?.tanggal_selesai ? new Date(dataProyek.tanggal_selesai) : undefined}
                    required
                    label="Selesai pada"
                    onChange={(e) => setData('tanggal_selesai', e ? format(e, 'yyyy-MM-dd') : '')}
                />
                <AppInput
                    type="number"
                    defaultValue={dataProyek?.pagu_total || 0}
                    required
                    onChange={(e) => setData('pagu_total', parseInt(e.target.value))}
                    placeholder="Masukkan total pagu . . ."
                    label="Total Pagu (IDR)"
                />

                <AppInput
                    required
                    type="number"
                    defaultValue={dataProyek?.pajak_persen || 0}
                    min={0}
                    max={100}
                    onChange={(e) => setData('pajak_persen', parseFloat(e.target.value))}
                    placeholder="Masukkan pajak . . ."
                    label="Pajak (%)"
                />
                {/* <AppInput
                    required
                    type="number"
                    defaultValue={dataProyek?.jasa_tukang_persen || 0}
                    min={0}
                    max={100}
                    onChange={(e) => setData('jasa_tukang_persen', parseFloat(e.target.value))}
                    placeholder="Masukkan jasa tukang . . ."
                    label="Jasa tukang (%)"
                />
                <AppInput
                    required
                    type="number"
                    defaultValue={dataProyek?.biaya_staff_perpajakan || 0}
                    onChange={(e) => setData('biaya_staff_perpajakan', parseInt(e.target.value))}
                    placeholder="Masukkan biaya staff perpajakan . . ."
                    label="Biaya staff perpajakan (IDR)"
                />
                <AppInput
                    required
                    type="number"
                    defaultValue={dataProyek?.biaya_staff_entry_data || 0}
                    onChange={(e) => setData('biaya_staff_entry_data', parseInt(e.target.value))}
                    placeholder="Masukkan biaya staff entry data . . ."
                    label="Biaya staff entry data (IDR)"
                />
                <AppInput
                    required
                    type="number"
                    defaultValue={dataProyek?.uang_bahan_persen || 0}
                    onChange={(e) => setData('uang_bahan_persen', parseFloat(e.target.value))}
                    placeholder="Masukkan uang bahan . . ."
                    label="Uang Bahan (%)"
                /> */}
                <AppInput
                    required
                    defaultValue={dataProyek?.nama_klien || ''}
                    onChange={(e) => setData('nama_klien', e.target.value)}
                    placeholder="Masukkan nama client . . ."
                    label="Nama Client"
                />
                {/* <AppInput
                    min={0}
                    max={100}
                    required
                    defaultValue={dataProyek?.biaya_tak_terduga_persen || 0}
                    // error={errors?.biaya_tak_terduga_persen && 'Biaya tak terduga wajib diisi.'}
                    onChange={(e) => setData('biaya_tak_terduga_persen', parseFloat(e.target.value))}
                    placeholder="Masukkan nama biaya tak terduga . . ."
                    label="Biaya tak terduga (%)"
                /> */}
            </div>
            <div className="bg-background/10 sm:border-muted m-0 w-full max-w-3xl rounded-xl border-0 p-4 sm:m-4 sm:border">
                <div className="flex w-full items-center justify-between pb-4">
                    <Label className="text-2xl font-semibold">Foto Proyek</Label>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            setExistingImages([]);
                            setFiles([]);
                        }}
                    >
                        Hapus Semua
                    </Button>
                </div>

                <FileUpload value={files} onValueChange={setFiles} accept="image/*" maxFiles={6} maxSize={5 * 1024 * 1024} multiple>
                    <div className="grid grid-cols-3 gap-2">
                        {existingImages.map((image) => (
                            <div key={`old-${image.id}`} className="group relative aspect-square">
                                <img src={image.image_url} alt="" className="h-full w-full rounded-lg object-cover" />

                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-1 right-1"
                                    onClick={() => setExistingImages((prev) => prev.filter((img) => img.id !== image.id))}
                                >
                                    <X className="size-3" />
                                </Button>
                            </div>
                        ))}

                        {files.map((file, index) => (
                            <div key={`new-${index}`} className="group relative aspect-square">
                                <img src={URL.createObjectURL(file)} alt="" className="h-full w-full rounded-lg object-cover" />

                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-1 right-1"
                                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                                >
                                    <X className="size-3" />
                                </Button>
                            </div>
                        ))}

                        {/* BUTTON TAMBAH */}
                        {existingImages.length + files.length < 6 && (
                            <FileUploadTrigger asChild>
                                <button
                                    type="button"
                                    className="hover:border-primary hover:bg-primary/5 flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors"
                                >
                                    <ImagePlus className="text-muted-foreground size-6" />
                                    <span className="text-muted-foreground text-xs">Masukkan</span>
                                </button>
                            </FileUploadTrigger>
                        )}
                    </div>
                </FileUpload>

                <p className="text-muted-foreground mt-2 text-center text-xs">{existingImages.length + files.length}/6 Foto</p>
            </div>
            <div className="px-4 pb-7">
                <AppTextArea
                    className="min-h-50 px-3 py-4"
                    defaultValue={dataProyek?.deskripsi_proyek || ''}
                    onChange={(e) => setData('deskripsi_proyek', e.target.value)}
                    placeholder="Masukkan deskripsi proyek . . ."
                    label="Deskripsi"
                />
            </div>
        </AppLayout>
    );
};

export default ProjectCreateIndex;
