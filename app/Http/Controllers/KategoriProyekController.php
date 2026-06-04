<?php

namespace App\Http\Controllers;

use App\Models\KategoriProyek;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class KategoriProyekController extends Controller
{
    public function index(Request $request)
    {
        $search  = $request->query('search', '');
        $perPage = $request->query('per_page', 10);

        $kategori = KategoriProyek::query()
            ->with('jenisProyek')->with('creator.role')
            ->when($search, fn($q) => $q->where('nama', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('config/project-config/category/index', [
            'list_kategori' => $kategori,
            'filters'       => [
                'search'   => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255', 'unique:kategori_proyek,nama'],
        ], [
            'nama.required' => 'Nama kategori wajib diisi.',
            'nama.unique'   => 'Nama kategori sudah ada.',
        ]);

        KategoriProyek::create([
            'nama' => $validated['nama'],
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, KategoriProyek $kategoriProyek): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => [
                'required',
                'string',
                'max:255',
                'unique:kategori_proyek,nama,' . $kategoriProyek->id,
            ],
        ], [
            'nama.required' => 'Nama kategori wajib diisi.',
            'nama.unique'   => 'Nama kategori sudah ada.',
        ]);

        $kategoriProyek->update([
            'nama' => $validated['nama'],
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(KategoriProyek $kategoriProyek): RedirectResponse
    {
        if ($kategoriProyek->jenisProyek()->exists()) {
            return back()->withErrors([
                'kategori' => 'Kategori tidak bisa dihapus karena masih memiliki jenis proyek.',
            ]);
        }

        $kategoriProyek->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
