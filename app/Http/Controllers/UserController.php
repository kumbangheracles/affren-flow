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
            ->with('role')->with('user_image')
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")->orWhere('nama_lengkap', 'like', "%{$search}%"))
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
            'noHp'     => ['required', 'string', 'min:13'],
            // 'photo'       => ['nullable', 'image', 'max:2048'],
        ], [
            'name.required'         => 'Username wajib diisi.',
            'name.unique'         => 'Username sudah digunakan.',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'email.required'        => 'Email wajib diisi.',
            'email.unique'          => 'Email sudah digunakan.',
            'noHp.required'        => 'Nomor Hp wajib diisi.',
            'noHp.unique'          => 'Nomor Hp sudah digunakan.',
            'password' => [
                'required',
                'string',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],

            // messages
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 8 karakter.',
            'password.string'   => 'Password harus berupa teks.',
            'password.password' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial.',
            'role_id.required'      => 'Role wajib dipilih.',
            'role_id.exists'        => 'Role tidak valid.',
            // 'photo.image'           => 'File harus berupa gambar.',
            // 'photo.max'             => 'Ukuran foto maksimal 2MB.',
            'uploaded_image' => 'nullable|image|max:5120',

        ]);

        // $photoUrl = null;
        // if ($request->hasFile('photo')) {
        //     $uploaded = Cloudinary::upload(
        //         $request->file('photo')->getRealPath(),
        //         ['folder' => 'users']
        //     );
        //     $photoUrl = $uploaded->getSecurePath();
        // }

        $user = User::create([
            'name'         => $validated['name'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'email'        => $validated['email'],
            'password'     => Hash::make($validated['password']),
            'role_id'      => $validated['role_id'],
            // 'photo_url'    => $photoUrl,
        ]);

        if ($request->hasFile('uploaded_images')) {

            $image = $request->file('uploaded_images');

            $cloudinary = app(\Cloudinary\Cloudinary::class);

            $result = $cloudinary
                ->uploadApi()
                ->upload(
                    $image->getRealPath(),
                    [
                        'folder' => 'afreenflow/user'
                    ]
                );

            $user->user_image()->create([
                'image_url' => $result['secure_url'],
            ]);
        }

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $user = User::with('user_image')->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
            ],
            'password' => ['nullable', Password::min(8)],
            'role_id' => ['required', 'exists:roles,id'],
            'noHp' => ['required', 'string', 'min:13'],

            'uploaded_image' => ['nullable', 'image', 'max:5120'],
        ]);

        $cloudinary = app(\Cloudinary\Cloudinary::class);

        // upload foto baru
        if ($request->hasFile('uploaded_image')) {

            // hapus foto lama
            if ($user->user_image && $user->user_image->public_id) {
                $cloudinary
                    ->uploadApi()
                    ->destroy($user->user_image->public_id);

                $user->user_image->delete();
            }

            $image = $request->file('uploaded_image');

            $result = $cloudinary
                ->uploadApi()
                ->upload(
                    $image->getRealPath(),
                    [
                        'folder' => 'afreenflow/user',
                    ]
                );

            $user->user_image()->create([
                'image_url' => $result['secure_url'],
                'public_id' => $result['public_id'],
            ]);
        }

        $updateData = [
            'name' => $validated['name'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'email' => $validated['email'],
            'noHp' => $validated['noHp'],
            'role_id' => $validated['role_id'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function destroy($id): RedirectResponse
    {
        $user = User::with('user_image')->findOrFail($id);

        $cloudinary = app(\Cloudinary\Cloudinary::class);

        if ($user->user_image) {

            if (!empty($user->user_image->public_id)) {
                $cloudinary
                    ->uploadApi()
                    ->destroy($user->user_image->public_id);
            }

            $user->user_image->delete();
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}
