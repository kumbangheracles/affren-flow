<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaksi;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\RedirectResponse;
use App\Models\ItemTransaksi;
use App\Services\FinanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ItemTransaksiController extends Controller
{
    //

    protected FinanceService $financeService;

    public function __construct(FinanceService $financeService)
    {
        $this->financeService = $financeService;
    }
    public function index($transaksi_id)
    {
        $transaksi = Transaksi::with(['proyek', 'items'])
            ->findOrFail($transaksi_id);

        return Inertia::render('transaction/item/index', [
            'transaksi' => $transaksi,
        ]);
    }


    public function store(Request $request, $transaksi_id): RedirectResponse
    {
        $transaksi = Transaksi::findOrFail($transaksi_id);

        $this->pastikanKategoriPunyaItem($transaksi);

        $validated = $request->validate([
            'items'                => ['required', 'array', 'min:1'],
            'items.*.tanggal'      => ['required', 'date'],
            'items.*.nama_item'    => ['required', 'string', 'max:255'],
            'items.*.satuan'       => ['nullable', 'string', 'max:50'],
            'items.*.qty'          => ['required', 'numeric', 'min:0'],
            'items.*.harga_satuan' => ['required', 'numeric', 'min:0'],
            'items.*.keterangan'   => ['nullable', 'string', 'max:500'],
        ], [
            'items.required'                => 'Minimal satu item wajib diisi.',
            'items.*.tanggal.required'      => 'Tanggal item wajib diisi.',
            'items.*.nama_item.required'    => 'Nama item wajib diisi.',
            'items.*.qty.required'          => 'Qty wajib diisi.',
            'items.*.qty.min'               => 'Qty tidak boleh kurang dari 0.',
            'items.*.harga_satuan.required' => 'Harga satuan wajib diisi.',
            'items.*.harga_satuan.min'      => 'Harga satuan tidak boleh kurang dari 0.',
        ]);

        foreach ($validated['items'] as $item) {
            $subtotal = $item['qty'] * $item['harga_satuan'];
            ItemTransaksi::create([
                'transaksi_id' => $transaksi->transaksi_id,
                'tanggal'      => $item['tanggal'],
                'nama_item'    => $item['nama_item'],
                'satuan'       => $item['satuan'] ?? null,
                'qty'          => $item['qty'],
                'harga_satuan' => $item['harga_satuan'],
                'subtotal'     => $subtotal,
                'keterangan'   => $item['keterangan'] ?? null,
            ]);
        }

        $this->recalculateJumlah($transaksi);
        $transaksi->load('proyek'); // pastikan relasi proyek ter-load
        $this->recalculatePersen($transaksi);

        return redirect()
            ->route('transaction.detail', $transaksi_id)
            ->with('success', 'Item berhasil ditambahkan.');
    }
    public function update(Request $request, $transaksi_id, $item_id): JsonResponse|RedirectResponse
    {
        $transaksi = Transaksi::findOrFail($transaksi_id);
        $this->pastikanKategoriPunyaItem($transaksi);
        $item      = ItemTransaksi::findOrFail($item_id);

        $validated = $request->validate([
            'tanggal'      => ['required', 'date'],
            'nama_item'    => ['required', 'string', 'max:255'],
            'satuan'       => ['nullable', 'string', 'max:50'],
            'qty'          => ['required', 'numeric', 'min:0'],
            'harga_satuan' => ['required', 'numeric', 'min:0'],
            'keterangan'   => ['nullable', 'string', 'max:500'],
        ]);

        $item->update([
            'tanggal'      => $validated['tanggal'],
            'nama_item'    => $validated['nama_item'],
            'satuan'       => $validated['satuan'] ?? null,
            'qty'          => $validated['qty'],
            'harga_satuan' => $validated['harga_satuan'],
            'subtotal'     => $validated['qty'] * $validated['harga_satuan'],
            'keterangan'   => $validated['keterangan'] ?? null,
        ]);

        $this->recalculateJumlah($transaksi);
        $transaksi->load('proyek');
        $this->recalculatePersen($transaksi);
        return response()->json(['message' => 'Berhasil diperbarui'], 200);
    }

    public function updateStatus(Request $request, $transaksi_id, $item_id,)
    {

        $transaksi = Transaksi::findOrFail($transaksi_id);
        $item      = ItemTransaksi::findOrFail($item_id);
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in(ItemTransaksi::STATUS),
            ],
        ], [
            'status.required' => 'Status wajib diisi.',
            'status.in'       => 'Status tidak valid.',
        ]);

        if ($item->status === 'lunas') {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi yang sudah lunas tidak dapat diubah.',
            ], 422);
        }

        $item->update([
            'status'      => $validated['status'],
            'approved_by' => $request->user()->id,
        ]);
        $transaksi->load('proyek');
        return response()->json([
            'success' => true,
            'message' => 'Status item transaksi berhasil diperbarui.',
        ]);
    }

    /**
     * Hapus satu item.
     */
    public function destroy($transaksi_id, $item_id): JsonResponse|RedirectResponse
    {
        $transaksi = Transaksi::findOrFail($transaksi_id);
        $item      = ItemTransaksi::findOrFail($item_id);

        $item->delete();

        $this->recalculateJumlah($transaksi);
        $transaksi->load('proyek'); // pastikan relasi proyek ter-load
        $this->recalculatePersen($transaksi);

        return response()->json(['message' => 'Berhasil dihapus'], 200);
    }

    /**
     * Recalculate transaksi.jumlah dari total semua item.
     */
    private function recalculateJumlah(Transaksi $transaksi): void
    {
        $total = $transaksi->items()->sum('subtotal');
        $transaksi->update(['jumlah' => $total]);
    }

    private function recalculatePersen(Transaksi $transaksi): void
    {
        $anggaran = (new \App\Services\FinanceService())->hitungAnggaranProyek($transaksi->proyek);
        $dana     = $anggaran['dana_setelah_pajak'];

        $persen = $dana > 0
            ? ($transaksi->jumlah / $dana) * 100
            : 0;

        $transaksi->update(['persen' => round($persen, 2)]);
    }

    /**
     * Pastikan kategori transaksi memang boleh punya item.
     */
    private function pastikanKategoriPunyaItem(Transaksi $transaksi): void
    {
        if (!in_array($transaksi->kategori, Transaksi::KATEGORI_DENGAN_ITEM)) {
            abort(422, "Kategori {$transaksi->kategori} tidak mendukung item.");
        }
    }
}
