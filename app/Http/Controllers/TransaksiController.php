<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use App\Models\Proyek;
use App\Services\FinanceService;
use Illuminate\Validation\Rule;
use App\Models\ItemTransaksi;

class TransaksiController extends Controller
{

    protected FinanceService $financeService;

    public function __construct(FinanceService $financeService)
    {
        $this->financeService = $financeService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search  = $request->query('search', '');
        $kategori  = $request->query('kategori');
        $perPage = $request->query('per_page', 10);

        $transaksis = Transaksi::query()->latest()
            ->with('proyek:proyek_id,nama_proyek,pagu_total,tanggal_mulai')->with('creatorTransaksi.role', 'approverTransaksi.role')
            ->when($search, function ($q) use ($search) {
                // search berdasarkan nama proyek
                $q->whereHas('proyek', function ($q) use ($search) {
                    $q->where('nama_proyek', 'like', "%{$search}%");
                });
            })->when(
                $kategori && $kategori !== "semua_kategori",
                function ($q) use ($kategori) {
                    $q->where('kategori', $kategori);
                }
            )
            ->latest('tanggal')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('transaction/index', [
            'list_transaksi' => $transaksis,
            'filters'        => [
                'search'   => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    // search
    public function search(Request $request)
    {
        $query = $request->get('search', '');

        $proyeks = Proyek::query()
            ->when($query, fn($q) => $q->where('nama_proyek', 'like', "%{$query}%"))
            ->limit(20)
            ->get(['proyek_id', 'nama_proyek']);

        return response()->json($proyeks);
    }

    // usedKategori
    public function usedKategori(Request $request)
    {
        $proyek = Proyek::findOrFail($request->query('proyek_id'));

        $used = $proyek->transaksi()
            ->pluck('kategori')
            ->toArray();

        return response()->json($used);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Proyek $proyek)
    {
        $usedKategori = $proyek->transaksi()
            ->pluck('kategori')
            ->toArray();

        return Inertia::render('transaction/create/index', [
            'proyek'       => $proyek,
            'usedKategori' => $usedKategori,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'proyek_id' => [
                'required',
                'string',
                Rule::exists('proyek', 'proyek_id'),
            ],
            'kategori' => [
                'required',
                'string',
                Rule::in(Transaksi::KATEGORI),
                // pastikan kategori belum dipakai di proyek ini
                Rule::unique('transaksi')
                    ->where('proyek_id', $request->proyek_id),
            ],
            // Validasi items untuk kategori dengan item
            'items'                  => [
                Rule::requiredIf(in_array($request->kategori, Transaksi::KATEGORI_DENGAN_ITEM)),
                'nullable',
                'array',
                'min:1',
            ],

            'tanggal'    => ['required', 'date'],
            'persen'     => ['nullable', 'numeric', 'min:0', 'max:100'],
            'jumlah'     => ['nullable', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ], [
            'proyek_id.required'  => 'Proyek wajib dipilih.',
            'proyek_id.exists'    => 'Proyek tidak ditemukan.',
            'kategori.required'   => 'Kategori wajib dipilih.',
            'kategori.in'         => 'Kategori tidak valid.',
            'kategori.unique'     => 'Kategori ini sudah digunakan pada proyek tersebut.',
            'tanggal.required'    => 'Tanggal wajib diisi.',
            'tanggal.date'        => 'Format tanggal tidak valid.',
            'persen.numeric'      => 'Persen harus berupa angka.',
            'persen.min'          => 'Persen tidak boleh kurang dari 0.',
            'persen.max'          => 'Persen tidak boleh lebih dari 100.',
            'jumlah.numeric'      => 'Jumlah harus berupa angka.',
            'jumlah.min'          => 'Jumlah tidak boleh kurang dari 0.',
            'keterangan.max'      => 'Keterangan maksimal 500 karakter.',
        ]);
        $proyek   = Proyek::find($validated['proyek_id']);
        $anggaran = $this->financeService->hitungAnggaranProyek($proyek);
        $dana     = $anggaran['dana_setelah_pajak'];

        if (in_array($validated['kategori'], Transaksi::KATEGORI_DENGAN_ITEM)) {
            // Jumlah dari sum subtotal items



            $jumlah = collect($validated['items'])->sum(
                fn($item) => $item['qty'] * $item['harga_satuan']
            );
            $persen = $dana > 0 ? ($jumlah / $dana) * 100 : 0;
        } else {
            // Kategori langsung — persen atau jumlah wajib salah satu
            if (empty($validated['persen']) && empty($validated['jumlah'])) {
                return back()->withErrors([
                    'jumlah' => 'Persen atau jumlah wajib diisi salah satu.',
                ])->withInput();
            }

            if (!empty($validated['persen'])) {
                $jumlah = $dana * ($validated['persen'] / 100);
                $persen = $validated['persen'];
            } else {
                $jumlah = $validated['jumlah'];
                $persen = $dana > 0 ? ($jumlah / $dana) * 100 : 0;
            }
        }

        $transaksi = Transaksi::create([
            'proyek_id'    => $validated['proyek_id'],
            'kategori'     => $validated['kategori'],
            'tanggal'      => $validated['tanggal'],
            'persen'     => round($persen, 2),
            'jumlah'     => $jumlah,
            'keterangan'   => $validated['keterangan'] ?? null,
            'created_by' => $request->user()->id,
            // 'approved_by' => $request->approved_by
        ]);
        if (in_array($validated['kategori'], Transaksi::KATEGORI_DENGAN_ITEM)) {
            foreach ($validated['items'] as $item) {
                ItemTransaksi::create([
                    'transaksi_id' => $transaksi->transaksi_id,
                    'tanggal'      => $item['tanggal'],
                    'nama_item'    => $item['nama_item'],
                    'satuan'       => $item['satuan'] ?? null,
                    'qty'          => $item['qty'],
                    'harga_satuan' => $item['harga_satuan'],
                    'subtotal'     => $item['qty'] * $item['harga_satuan'],
                    'keterangan'   => $item['keterangan'] ?? null,
                    'created_by' => $request->user()->id,
                    // 'approved_by' => $request->approved_by
                ]);
            }
        }
        return redirect()
            ->route('transaction.index')
            ->with('success', 'Transaksi berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show($transaksi_id)
    {
        $transaksi = Transaksi::with(['proyek', 'items'])->with('creatorTransaksi.role', 'approverTransaksi.role')->with('items.creatorItemTransaksi.role', 'items.approverItemTransaksi.role')
            ->findOrFail($transaksi_id);
        $anggaran  = $this->financeService->hitungAnggaranProyek($transaksi->proyek);

        return Inertia::render('transaction/detail/index', [
            'transaksi' => $transaksi,
            'anggaran'  => $anggaran,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($transaksi_id)
    {
        $transaksi = Transaksi::with(['proyek', 'items'])
            ->findOrFail($transaksi_id);

        $proyek = Proyek::findOrFail($transaksi->proyek_id);

        $usedKategori = $proyek->transaksi()
            ->where('transaksi_id', '!=', $transaksi_id)
            ->pluck('kategori')
            ->toArray();

        return Inertia::render('transaction/create/index', [
            'transaksi'    => $transaksi,
            'proyek'       => $proyek,
            'usedKategori'   => $proyek->transaksi()
                ->where('transaksi_id', '!=', $transaksi_id)
                ->pluck('kategori')
                ->toArray(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaksi $transaksi)
    {
        logger($request->all());
        $validated = $request->validate([
            'proyek_id' => [
                'required',
                'string',
                Rule::exists('proyek', 'proyek_id'),
            ],
            'kategori' => [
                'required',
                'string',
                Rule::in(Transaksi::KATEGORI),
                // unique tapi exclude transaksi yang sedang diedit
                Rule::unique('transaksi')
                    ->where('proyek_id', $request->proyek_id)
                    ->ignore($transaksi->transaksi_id, 'transaksi_id'),
            ],

            'status' => [
                'required',
                'string',
                Rule::in(Transaksi::STATUS),
            ],

            // Validasi items untuk kategori dengan item
            'items'                  => [
                Rule::requiredIf(in_array($request->kategori, Transaksi::KATEGORI_DENGAN_ITEM)),
                'nullable',
                'array',
                'min:1',
            ],
            'tanggal'    => ['required', 'date'],
            'persen'     => ['nullable', 'numeric', 'min:0', 'max:100'],
            'jumlah'     => ['nullable', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ], [
            'proyek_id.required'  => 'Proyek wajib dipilih.',
            'proyek_id.exists'    => 'Proyek tidak ditemukan.',
            'kategori.required'   => 'Kategori wajib dipilih.',
            'kategori.in'         => 'Kategori tidak valid.',
            'kategori.unique'     => 'Kategori ini sudah digunakan pada proyek tersebut.',
            'tanggal.required'    => 'Tanggal wajib diisi.',
            'tanggal.date'        => 'Format tanggal tidak valid.',
            'persen.numeric'      => 'Persen harus berupa angka.',
            'persen.min'          => 'Persen tidak boleh kurang dari 0.',
            'persen.max'          => 'Persen tidak boleh lebih dari 100.',
            'jumlah.numeric'      => 'Jumlah harus berupa angka.',
            'jumlah.min'          => 'Jumlah tidak boleh kurang dari 0.',
            'keterangan.max'      => 'Keterangan maksimal 500 karakter.',
        ]);

        $proyek   = Proyek::find($validated['proyek_id']);
        $anggaran = $this->financeService->hitungAnggaranProyek($proyek);
        $dana     = $anggaran['dana_setelah_pajak'];

        if (in_array($validated['kategori'], Transaksi::KATEGORI_DENGAN_ITEM)) {
            // Jumlah dari sum subtotal items
            $jumlah = collect($validated['items'])->sum(
                fn($item) => $item['qty'] * $item['harga_satuan']
            );
            $persen = $dana > 0 ? ($jumlah / $dana) * 100 : 0;
        } else {
            // Kategori langsung — persen atau jumlah wajib salah satu
            if (empty($validated['persen']) && empty($validated['jumlah'])) {
                return back()->withErrors([
                    'jumlah' => 'Persen atau jumlah wajib diisi salah satu.',
                ])->withInput();
            }

            if (!empty($validated['persen'])) {
                $jumlah = $dana * ($validated['persen'] / 100);
                $persen = $validated['persen'];
            } else {
                $jumlah = $validated['jumlah'];
                $persen = $dana > 0 ? ($jumlah / $dana) * 100 : 0;
            }
        }

        $transaksi->update([
            'proyek_id'  => $validated['proyek_id'],
            'kategori'   => $validated['kategori'],
            'tanggal'    => $validated['tanggal'],
            'persen'     => round($persen, 2),
            'jumlah'     => $jumlah,
            'keterangan' => $validated['keterangan'] ?? null,
            // 'status' => $validated['status'] ??= 'belum_disetujui',
            // 'created_by' => $request->user()->id,
            // 'approved_by' => null
        ]);

        if (in_array($validated['kategori'], Transaksi::KATEGORI_DENGAN_ITEM)) {
            // Hapus items lama
            $transaksi->items()->delete();

            // Insert items baru
            foreach ($validated['items'] as $item) {
                ItemTransaksi::create([
                    'transaksi_id' => $transaksi->transaksi_id,
                    'tanggal'      => $item['tanggal'],
                    'nama_item'    => $item['nama_item'],
                    'satuan'       => $item['satuan'] ?? null,
                    'qty'          => $item['qty'],
                    'harga_satuan' => $item['harga_satuan'],
                    'subtotal'     => $item['qty'] * $item['harga_satuan'],
                    'keterangan'   => $item['keterangan'] ?? null,
                    // 'status'   => $item['status'] ?? null,
                    'created_by' => $request->created_by,
                    // 'approved_by' => null
                ]);
            }
        }

        return redirect()
            ->route('transaction.index')
            ->with('success', 'Transaksi berhasil diperbarui.');
    }
    public function updateStatus(Request $request, Transaksi $transaksi)
    {


        if ($request->user()->role_id !== 1) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang bisa akses ini.',
            ], 403);
        }
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in(Transaksi::STATUS),
            ],
        ], [
            'status.required' => 'Status wajib diisi.',
            'status.in'       => 'Status tidak valid.',
        ]);

        if ($transaksi->status === 'lunas') {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi yang sudah lunas tidak dapat diubah.',
            ], 422);
        }

        $transaksi->update([
            'status'      => $validated['status'],
            'approved_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status transaksi berhasil diperbarui.',
        ]);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy($transaksi_id): RedirectResponse
    {
        $transaksi = Transaksi::findOrFail($transaksi_id);

        $transaksi->delete();

        return redirect()
            ->route('transaction.index')
            ->with(['success' => 'Transaksi berhasil dihapus!']);
    }
}
