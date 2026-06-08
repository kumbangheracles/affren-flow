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
            'name' => 'herkaladmin',
            'nama_lengkap' => 'Ahmad Herkal Taqyudin',
            'email' => 'herkal@admin.com',
            'password' => bcrypt('herkal123'),
            'isActive' => true,
            'role_id' => Role::where('role_name', 'Admin')->value('id'),
        ]);

        User::factory()->create([
            'name' => 'herkalmandor',
            'nama_lengkap' => 'Ahmad Herkal Taqyudin',
            'email' => 'herkal@mandor.com',
            'password' => bcrypt('herkal123'),
            'isActive' => true,
            'role_id' => Role::where('role_name', 'Mandor')->value('id'),
        ]);

        $this->call([
            KategoriProyekSeeder::class,
            JenisProyekSeeder::class,
            // ProyekTransaksiSeeder::class,
        ]);

        // $this->call(ProyekSeeder::class);
        // $this->call(TransaksiSeeder::class);
    }
}
