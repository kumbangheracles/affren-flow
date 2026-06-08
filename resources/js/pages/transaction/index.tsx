import TransactionIndex from '@/core-components/transaction';
import { PaginatedResponse } from '@/types/laravel.type';
import { KategoriTransaksi, TransaksiProps } from '@/types/transaction.type';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
interface PageProps extends InertiaPageProps {
    list_transaksi?: PaginatedResponse<TransaksiProps>;
    filters: {
        search: string;
        per_page: number;
        kategori: KategoriTransaksi;
    };
}
const TransactionPage = ({ filters, list_transaksi }: PageProps) => {
    return <TransactionIndex filters={filters} list_transaksi={list_transaksi} />;
};
export default TransactionPage;
