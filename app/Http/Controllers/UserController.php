<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search  = $request->query('search', '');
        $perPage = $request->query('per_page', 10);

        $users = User::query()
            ->with('role')
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('user/index', [
            'list_user' => $users,
            'filters'   => [
                'search'   => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'unique:users,email'],
            'password'    => ['required', Password::min(8)],
            'role_id'     => ['required', 'exists:roles,id'],
            // 'photo'       => ['nullable', 'image', 'max:2048'],
        ], [
            'name.required'         => 'Username wajib diisi.',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'email.required'        => 'Email wajib diisi.',
            'email.unique'          => 'Email sudah digunakan.',
            'password.required'     => 'Password wajib diisi.',
            'role_id.required'      => 'Role wajib dipilih.',
            'role_id.exists'        => 'Role tidak valid.',
            // 'photo.image'           => 'File harus berupa gambar.',
            // 'photo.max'             => 'Ukuran foto maksimal 2MB.',
        ]);

        // $photoUrl = null;
        // if ($request->hasFile('photo')) {
        //     $uploaded = Cloudinary::upload(
        //         $request->file('photo')->getRealPath(),
        //         ['folder' => 'users']
        //     );
        //     $photoUrl = $uploaded->getSecurePath();
        // }

        User::create([
            'name'         => $validated['name'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'email'        => $validated['email'],
            'password'     => Hash::make($validated['password']),
            'role_id'      => $validated['role_id'],
            // 'photo_url'    => $photoUrl,
        ]);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'role_id'     => ['required', 'exists:roles,id'],
            'password'    => ['nullable', Password::min(8)],
            'photo'       => ['nullable', 'image', 'max:2048'],
        ], [
            'name.required'         => 'Username wajib diisi.',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'email.required'        => 'Email wajib diisi.',
            'email.unique'          => 'Email sudah digunakan.',
            'role_id.required'      => 'Role wajib dipilih.',
            'role_id.exists'        => 'Role tidak valid.',
        ]);

        // $photoUrl = $user->photo_url;
        // if ($request->hasFile('photo')) {
        //     // Hapus foto lama di Cloudinary jika ada
        //     if ($user->photo_url) {
        //         $publicId = pathinfo(
        //             parse_url($user->photo_url, PHP_URL_PATH),
        //             PATHINFO_FILENAME
        //         );
        //         Cloudinary::destroy("users/{$publicId}");
        //     }

        //     $uploaded = Cloudinary::upload(
        //         $request->file('photo')->getRealPath(),
        //         ['folder' => 'users']
        //     );
        //     $photoUrl = $uploaded->getSecurePath();
        // }

        $updateData = [
            'name'         => $validated['name'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'email'        => $validated['email'],
            'role_id'      => $validated['role_id'],
            // 'photo_url'    => $photoUrl,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        // Hapus foto di Cloudinary jika ada
        // if ($user->photo_url) {
        //     $publicId = pathinfo(
        //         parse_url($user->photo_url, PHP_URL_PATH),
        //         PATHINFO_FILENAME
        //     );
        //     Cloudinary::destroy("users/{$publicId}");
        // }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}
