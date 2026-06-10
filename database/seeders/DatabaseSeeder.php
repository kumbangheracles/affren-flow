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
        $roles = Role::pluck('id', 'role_name');
        // User::factory(10)->create();
        $this->call([
            RoleSeeder::class,

        ]);
        User::factory()->create([
            'name' => 'herkalsuperadmin',
            'nama_lengkap' => 'Ahmad Herkal Taqyudin',
            'email' => 'herkal@superadmin.com',
            'password' => bcrypt('herkal123'),
            'noHp' => '08129523123123',
            'role_id' => Role::where('role_name', 'super_admin')->value('id'),
        ]);
        User::factory()->create([
            'name' => 'herkaladmin',
            'nama_lengkap' => 'Ahmad Herkal Taqyudin',
            'email' => 'herkal@admin.com',
            'password' => bcrypt('herkal123'),
            'noHp' => '0812959123123123',
            'role_id' => Role::where('role_name', 'admin')->value('id'),
        ]);

        User::factory()->create([
            'name' => 'herkalmandor',
            'nama_lengkap' => 'Ahmad Herkal Taqyudin',
            'email' => 'herkal@mandor.com',
            'password' => bcrypt('herkal123'),
            'isActive' => true,
            'noHp' => '081295231231999',
            'role_id' => Role::where('role_name', 'Mandor')->value('id'),
        ]);
        User::factory()->create([
            'name' => 'jamaladmin',
            'nama_lengkap' => 'Jamal bin Jamal',
            'email' => 'jamal@admin.com',
            'password' => bcrypt('jamal123'),
            'isActive' => true,
            'noHp' => '08129523123777',
            'role_id' => Role::where('role_name', 'admin')->value('id'),
        ]);
        User::factory()->create([
            'name' => 'wahyumandor',
            'nama_lengkap' => 'Wahyu wahyudi',
            'email' => 'wahyu@mandor.com',
            'password' => bcrypt('wahyu123'),
            'isActive' => true,
            'noHp' => '08129523123767',
            'role_id' => Role::where('role_name', 'Mandor')->value('id'),
        ]);
        User::factory()->create([
            'name' => 'donimandor',
            'nama_lengkap' => 'Doni Mandor',
            'email' => 'doni@mandor.com',
            'password' => bcrypt('doni123'),
            'isActive' => true,
            'noHp' => '08129523128767',
            'role_id' => Role::where('role_name', 'Mandor')->value('id'),
        ]);

        $this->call([
            KategoriProyekSeeder::class,
            JenisProyekSeeder::class,
            ProyekTransaksiSeeder::class,
        ]);

        // $this->call(ProyekSeeder::class);
        // $this->call(TransaksiSeeder::class);
    }
}
