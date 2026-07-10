<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\ProyekSeeder;
use Database\Seeders\TransaksiSeeder;
use Database\Seeders\ProyekTransaksiSeeder;
use Database\Seeders\RoleSeeder;
use App\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $users = [
            ['name' => 'superadmin',      'email' => 'superadmin@superadmin.com', 'password' => 'superadmin123', 'nama_lengkap' => 'Super Admin',           'noHp' => '08129523123123',  'role' => 'super_admin', 'isActive' => true],
            ['name' => 'admintest',       'email' => 'admintest@admintest.com',   'password' => 'admintest123',  'nama_lengkap' => 'Admin Test',             'noHp' => '08129523123124',  'role' => 'Admin',       'isActive' => true],
            ['name' => 'mandortest',      'email' => 'mandortest@mandortest.com', 'password' => 'mandortest123', 'nama_lengkap' => 'Mandor Test',            'noHp' => '08129523123125',  'role' => 'Mandor',      'isActive' => true],
            ['name' => 'herkalsuperadmin', 'email' => 'herkal@superadmin.com',     'password' => 'herkal123',     'nama_lengkap' => 'Ahmad Herkal Taqyudin', 'noHp' => '08129523123126',  'role' => 'super_admin', 'isActive' => true],
            ['name' => 'herkaladmin',     'email' => 'herkal@admin.com',          'password' => 'herkal123',     'nama_lengkap' => 'Ahmad Herkal Taqyudin', 'noHp' => '08129523123127',  'role' => 'Admin',       'isActive' => true],
            ['name' => 'herkalmandor',    'email' => 'herkal@mandor.com',         'password' => 'herkal123',     'nama_lengkap' => 'Ahmad Herkal Taqyudin', 'noHp' => '08129523123128',  'role' => 'Mandor',      'isActive' => true],
            ['name' => 'jamaladmin',      'email' => 'jamal@admin.com',           'password' => 'jamal123',      'nama_lengkap' => 'Jamal bin Jamal',       'noHp' => '08129523123129',  'role' => 'Admin',       'isActive' => true],
            ['name' => 'wahyumandor',     'email' => 'wahyu@mandor.com',          'password' => 'wahyu123',      'nama_lengkap' => 'Wahyu Wahyudi',         'noHp' => '08129523123130',  'role' => 'Mandor',      'isActive' => true],
            ['name' => 'donimandor',      'email' => 'doni@mandor.com',           'password' => 'doni123',       'nama_lengkap' => 'Doni Mandor',           'noHp' => '08129523123131',  'role' => 'Mandor',      'isActive' => true],
        ];

        foreach ($users as $u) {
            User::create([
                'name'         => $u['name'],
                'email'        => $u['email'],
                'password'     => bcrypt($u['password']),
                'nama_lengkap' => $u['nama_lengkap'],
                'noHp'         => $u['noHp'],
                'isActive'     => $u['isActive'],
                'role_id'      => Role::where('role_name', $u['role'])->value('id'),
            ]);
        }

        $this->call([
            KategoriProyekSeeder::class,
            JenisProyekSeeder::class,
            ProyekTransaksiSeeder::class,
        ]);
    }
}
