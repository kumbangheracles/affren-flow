<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProyekController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\ItemTransaksiController;
use App\Http\Controllers\KategoriProyekController;
use App\Http\Controllers\JenisProyekController;
use App\Http\Controllers\ForecastController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;

Route::middleware(['auth'])->group(function () {

    // Dashboard =====================
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // Project =====================
    Route::get('/project', [ProyekController::class, 'index'])->name('project.index');
    Route::get('/project/{id}/detail', [ProyekController::class, 'show'])->name('project.detail');
    Route::get('/project/create', [ProyekController::class, 'create'])->name('project.create')->middleware('role:super_admin,Admin');;
    Route::post('/project', [ProyekController::class, 'store'])->name('project.store')->middleware('role:super_admin,Admin');;
    Route::get('/project/{id}/edit', [ProyekController::class, 'edit'])->name(('project.edit'))->middleware('role:super_admin,Admin');;

    Route::post('/project/{id}', [ProyekController::class, 'update'])->name('project.update');
    Route::patch('/project/{id}', [ProyekController::class, 'updateStatus'])->name('project.updateStatus');
    Route::delete('/project/{id}', [ProyekController::class, 'destroy'])->name('project.destroy');


    // Transaction =====================
    Route::get('/transaction', [TransaksiController::class, 'index'])->name('transaction.index');
    Route::get('/transaction/create', [TransaksiController::class, 'create'])->name('transaction.create');
    Route::get('/transaction/search-nama-proyek', [TransaksiController::class, 'search'])->name('transaction.search-nama-proyek');
    Route::get('/transaction/used-kategori', [TransaksiController::class, 'usedKategori'])
        ->name('transaction.used-kategori');
    Route::post('/transaction', [TransaksiController::class, 'store'])->name('transaction.store');

    Route::get('/transaction/{id}/edit', [TransaksiController::class, 'edit'])->name('transaction.edit');
    Route::put('/transaction/{transaksi}', [TransaksiController::class, 'update'])
        ->name('transaction.update');
    Route::patch('/transaction/{transaksi}/status', [TransaksiController::class, 'updateStatus'])
        ->name('transaction.updateStatus')->middleware('role:super_admin,Admin');;
    Route::get('/transaction/{id}/detail', [TransaksiController::class, 'show'])->name('transaction.show');
    Route::delete('/transaction/{id}', [TransaksiController::class, 'destroy'])->name('transaction.destroy')->middleware('role:super_admin,Admin');;


    Route::prefix('transaction/{id}/items')->name('transaction.items.')->group(function () {
        Route::get('/',             [ItemTransaksiController::class, 'index'])->name('index');
        Route::post('/',            [ItemTransaksiController::class, 'store'])->name('store');
        Route::put('/{item_id}',    [ItemTransaksiController::class, 'update'])->name('update');
        Route::patch('/{item_id}/status',    [ItemTransaksiController::class, 'updateStatus'])->name('updateStatus')->middleware('role:super_admin,Admin');;
        Route::delete('/{item_id}', [ItemTransaksiController::class, 'destroy'])->name('destroy')->middleware('role:super_admin,Admin');;
    });


    // User
    Route::get('/user', [UserController::class, 'index'])->name('user.index');
    Route::post('/user', [UserController::class, 'store'])->name('user.store')->middleware('role:super_admin,Admin');
    Route::post('/user/{id}', [UserController::class, 'update'])->name('user.update')->middleware('role:super_admin,Admin');;
    Route::delete('/user/{id}', [UserController::class, 'destroy'])->name('user.destroy')->middleware('role:super_admin,Admin');;



    // Config
    Route::middleware(['auth', 'role:super_admin,Admin'])->prefix('config')->name('config.')->group(function () {
        Route::prefix('project-config')->name('project-config.')->group(function () {
            // Jenis Proyek
            Route::prefix('type')->name('type.')->group(function () {
                Route::get('/',      [JenisProyekController::class, 'index'])->name('index');
                Route::post('/',     [JenisProyekController::class, 'store'])->name('store');
                Route::put('/{jenisProyek}',    [JenisProyekController::class, 'update'])->name('update');
                Route::delete('/{jenisProyek}', [JenisProyekController::class, 'destroy'])->name('destroy');
            });
            // Kategori Proyek
            Route::prefix('category')->name('category.')->group(function () {
                Route::get('/',        [KategoriProyekController::class, 'index'])->name('index');
                Route::post('/',       [KategoriProyekController::class, 'store'])->name('store');
                Route::put('/{kategoriProyek}',    [KategoriProyekController::class, 'update'])->name('update');
                Route::delete('/{kategoriProyek}', [KategoriProyekController::class, 'destroy'])->name('destroy');
            });
        });
    });

    // Forecasting
    Route::middleware(['auth', 'role:super_admin,Admin'])->group(function () {
        Route::get('/forecasting', [ForecastController::class, 'index'])->name('forecasting.index');
        Route::post('/forecasting', [ForecastController::class, 'generate'])->name('forecasting.generate');
        Route::get('/cashflow', [ForecastController::class, 'list_cashflow'])->name('forecasting.list_cashflow');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
