<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([
            [
                'id' => 1,
                'role_name' => 'Admin',
                'description' => 'Administrator with full access',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'role_name' => 'Mandor',
                'description' => 'Field supervisor with project monitoring access',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'role_name' => 'super_admin',
                'description' => 'Full access dan control ke semuanya',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
