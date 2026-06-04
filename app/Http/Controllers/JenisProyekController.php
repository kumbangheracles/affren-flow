<?php

namespace App\Http\Controllers;

use App\Models\JenisProyek;
use App\Models\KategoriProyek;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class JenisProyekController extends Controller
{
    public function index(Request $request)
    {
        $search  = $request->query('search', '');
        $perPage = $request->query('per_page', 10);

        $jenis = JenisProyek::query()
            ->with('kategoriProyek')->with('creator.role')
            ->when($search, function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('config/project-config/type/index', [
            'list_jenis'     => $jenis,
            'list_kategori'  => KategoriProyek::select('id', 'nama')->orderBy('nama')->get(),
            'filters'        => [
                'search'   => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kategori_proyek_id' => ['required', 'exists:kategori_proyek,id'],
            'nama'               => [
                'required',
                'string',
                'max:255',
                'unique:jenis_proyek,nama,NULL,id,kategori_proyek_id,' . $request->kategori_proyek_id,
            ],
        ], [
            'kategori_proyek_id.required' => 'Kategori wajib dipilih.',
            'kategori_proyek_id.exists'   => 'Kategori tidak ditemukan.',
            'nama.required'               => 'Nama jenis proyek wajib diisi.',
            'nama.unique'                 => 'Nama jenis proyek sudah ada di kategori ini.',
        ]);

        JenisProyek::create([
            'nama' => $validated['nama'],
            'kategori_proyek_id' => $validated['kategori_proyek_id'],
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Jenis proyek berhasil ditambahkan.');
    }

    public function update(Request $request, JenisProyek $jenisProyek): RedirectResponse
    {
        $validated = $request->validate([
            'kategori_proyek_id' => ['required', 'exists:kategori_proyek,id'],
            'nama'               => [
                'required',
                'string',
                'max:255',
                'unique:jenis_proyek,nama,' . $jenisProyek->id . ',id,kategori_proyek_id,' . $request->kategori_proyek_id,
            ],
        ], [
            'kategori_proyek_id.required' => 'Kategori wajib dipilih.',
            'nama.required'               => 'Nama jenis proyek wajib diisi.',
            'nama.unique'                 => 'Nama jenis proyek sudah ada di kategori ini.',
        ]);

        $jenisProyek->update([
            'nama' => $validated['nama'],
            'kategori_proyek_id' => $validated['kategori_proyek_id'],
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Jenis proyek berhasil diperbarui.');
    }

    public function destroy(JenisProyek $jenisProyek): RedirectResponse
    {
        $jenisProyek->delete();

        return back()->with('success', 'Jenis proyek berhasil dihapus.');
    }
}
