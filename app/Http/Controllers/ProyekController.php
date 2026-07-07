<?php

namespace App\Http\Controllers;

use App\Models\JenisProyek;
use App\Models\KategoriProyek;
use App\Models\Proyek;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use App\Services\FinanceService;
use Illuminate\Support\Facades\Auth;
use App\Models\Role;
use Illuminate\Validation\Rule;
use Cloudinary\Cloudinary;

class ProyekController extends Controller

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
        $search = $request->query('search');
        $status = $request->query('status');

        $query = Proyek::with(['kategori', 'jenis'])->select([
            'proyek_id',
            'nama_proyek',
            'kategori_proyek_id',
            'jenis_proyek_id',
            'pagu_total',
            'status',
            'tanggal_mulai',
            'pajak_persen',
            'nama_klien',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_proyek', 'like', "%$search%");
            });
        }

        $query->when(
            $status && $status !== "semua_status",
            function ($q) use ($status) {
                $q->where('status', $status);
            }
        );
        $proyeks = $query
            ->latest()->with('creator.role')
            ->paginate($request->input('per_page', 10))
            ->withQueryString();



        return Inertia::render('project/index', [
            'proyeks' => $proyeks,
            'filters' => [
                'search' => $search,
                'status' => $status
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //

        $kategori_proyeks = KategoriProyek::all();
        $jenis_proyeks = JenisProyek::all();
        $mandorRole = Role::where('role_name', 'mandor')->first();

        $list_mandors = User::where('role_id', $mandorRole->id)->get();
        return Inertia::render('project/create/index', [
            'kategori_proyeks' => $kategori_proyeks,
            'jenis_proyeks' => $jenis_proyeks,
            'list_mandors' => $list_mandors
            // 'filters' => [
            //     'search' => $search
            // ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {

        $mandorRole = Role::where('role_name', 'mandor')->first();

        $validMandorIds = $mandorRole
            ? User::where('role_id', $mandorRole->id)->pluck('id')->toArray()
            : [];
        $data = $request->validate([
            'nama_proyek' => 'required|string|max:255',
            'pagu_total' => 'required|numeric|min:0',
            'kategori_proyek_id' => 'required|numeric|min:1',
            'jenis_proyek_id' => 'required|numeric|min:1',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'pajak_persen' => 'required|numeric|min:0|max:100',
            'nama_klien' => 'required|string|max:255',
            'status' => 'required|in:sedang_berjalan,selesai,dibatalkan',
            'deskripsi_proyek' => 'nullable|string',

            'uploaded_images' => 'nullable|array',

            'uploaded_images.*' => 'image|max:5120',

            'mandor_ids' => ['required', 'array', 'min:1'],
            'mandor_ids.*' => [
                'exists:users,id',
                Rule::in($validMandorIds),
            ],

        ]);

        $data['created_by'] = Auth::id();
        $mandorIds = $data['mandor_ids'];
        unset($data['mandor_ids']);

        $proyek = Proyek::create($data);

        $proyek->proyek_mandor()->sync($mandorIds);

        if ($request->hasFile('uploaded_images')) {

            foreach ($request->file('uploaded_images') as $image) {

                $cloudinary = app(\Cloudinary\Cloudinary::class);

                $result = $cloudinary
                    ->uploadApi()
                    ->upload(
                        $image->getRealPath(),
                        [
                            'folder' => 'afreenflow/proyek'
                        ]
                    );

                $proyek->proyek_images()->create([
                    'image_url' => $result['secure_url'],
                ]);
            }
        }

        return redirect()
            ->route('project.index')
            ->with('success', 'Proyek baru berhasil disimpan!');
    }
    /**
     * Display the specified resource.
     */
    public function show($proyek_id)
    {
        //
        $proyek = Proyek::with(['kategori', 'jenis'])->with('creator.role')->with('proyek_images')->with('proyek_mandor')->findOrFail($proyek_id);
        $anggaran = $this->financeService->hitungAnggaranProyek($proyek);
        $realisasi = $this->financeService->hitungRealisasiPerKategori($proyek);
        $laba_rugi = $this->financeService->hitungLabaRugi($proyek);
        $cashflow = $this->financeService->hitungCashflowAktual($proyek);
        return Inertia::render('project/detail/index', [
            'proyek' => $proyek,
            'anggaran' => $anggaran,
            'realisasi' => $realisasi,
            'laba_rugi' => $laba_rugi,
            'cashflow' => $cashflow,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($proyek_id)
    {
        $proyek = Proyek::with('proyek_images')->with('proyek_mandor')->findOrFail($proyek_id);
        $kategori_proyeks = KategoriProyek::all();
        $jenis_proyeks = JenisProyek::all();
        $mandorRole = Role::where('role_name', 'mandor')->first();

        $list_mandors = User::where('role_id', $mandorRole->id)->get();

        return Inertia::render('project/create/index', [
            'proyek' => $proyek,
            'kategori_proyeks' => $kategori_proyeks,
            'jenis_proyeks' => $jenis_proyeks,
            'list_mandors' => $list_mandors
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $proyek_id)
    {
        $proyek = Proyek::with('proyek_images')->findOrFail($proyek_id);
        $mandorRole = Role::where('role_name', 'mandor')->first();

        $validMandorIds = $mandorRole
            ? User::where('role_id', $mandorRole->id)->pluck('id')->toArray()
            : [];
        $data = $request->validate([
            'nama_proyek' => 'required|string|max:255',
            'pagu_total' => 'required|numeric|min:0',
            'kategori_proyek_id' => 'required|numeric|min:1',
            'jenis_proyek_id' => 'required|numeric|min:1',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'pajak_persen' => 'required|numeric|min:0|max:100',
            'nama_klien' => 'required|string|max:255',
            'status' => 'required|in:sedang_berjalan,selesai,dibatalkan',
            'deskripsi_proyek' => 'nullable|string',

            'uploaded_images' => 'nullable|array',
            'uploaded_images.*' => 'image|max:5120',

            'existing_images' => 'nullable|array',
            'existing_images.*' => 'integer',

            'mandor_ids' => ['required', 'array', 'min:1'],
            'mandor_ids.*' => [
                'exists:users,id',
                Rule::in($validMandorIds),
            ],
        ]);

        $cloudinary = app(\Cloudinary\Cloudinary::class);

        $keepImageIds = $request->input('existing_images', []);
        // dd([
        //     'existing_images' => $request->input('existing_images'),
        //     'keepImageIds' => $keepImageIds,
        //     'all' => $request->all(),
        // ]);

        $deletedImages = $proyek->proyek_images()
            ->whereNotIn('id', $keepImageIds)
            ->get();

        foreach ($deletedImages as $image) {

            if (!empty($image->public_id)) {
                $cloudinary
                    ->uploadApi()
                    ->destroy($image->public_id);
            }

            $image->delete();
        }


        if ($request->hasFile('uploaded_images')) {

            foreach ($request->file('uploaded_images') as $file) {

                $result = $cloudinary
                    ->uploadApi()
                    ->upload(
                        $file->getRealPath(),
                        [
                            'folder' => 'afreenflow/proyek'
                        ]
                    );

                $proyek->proyek_images()->create([
                    'image_url' => $result['secure_url'],
                    'public_id' => $result['public_id'],
                ]);
            }
        }

        // $data['created_by'] = Auth::id();

        unset(
            $data['uploaded_images'],
            $data['existing_images']
        );
        $mandorIds = $data['mandor_ids'];
        unset($data['mandor_ids']);

        $proyek->proyek_mandor()->sync($mandorIds);

        $proyek->update($data);

        return redirect()
            ->route('project.index')
            ->with('success', 'Proyek berhasil diperbarui!');
    }

    // Patch status
    public function updateStatus(Request $request, $proyek_id)
    {
        //
        $proyek = Proyek::findOrFail($proyek_id);


        $validated = $request->validate([
            'status' => 'required|in:sedang_berjalan,selesai,dibatalkan',
        ]);

        $proyek->update($validated);

        return redirect()
            ->route('project.index', [
                'page'     => $request->query('page', 1),
                'per_page' => $request->query('per_page', 10),
            ])
            ->with(['success' => 'Proyek berhasil diperbarui!']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($proyek_id): RedirectResponse
    {
        $proyek = Proyek::with('proyek_images')->findOrFail($proyek_id);

        $cloudinary = app(\Cloudinary\Cloudinary::class);

        foreach ($proyek->proyek_images as $image) {

            if (!empty($image->public_id)) {
                $cloudinary
                    ->uploadApi()
                    ->destroy($image->public_id);
            }

            $image->delete();
        }
        $mandorIds = $proyek['mandor_ids'];
        unset($proyek['mandor_ids']);

        $proyek->proyek_mandor()->sync($mandorIds);

        $proyek->delete();

        return redirect()
            ->route('project.index')
            ->with('success', 'Proyek berhasil dihapus!');
    }
}
