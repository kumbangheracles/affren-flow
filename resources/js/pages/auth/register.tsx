import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail, ShieldCheck, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { FinanceBanner } from './login';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    [key: string]: any;
}

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            {/* <form className="flex flex-col gap-6 p-7" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form> */}

            <div className="bg-background min-h-screen w-full">
                <div
                    className="absolute top-0 right-0 left-0 flex items-center justify-center gap-2 py-4 md:hidden"
                    style={{ background: '#2f3e46' }}
                >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[5px]" style={{ background: '#c9a84c' }}>
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                            <rect x="1" y="10" width="16" height="6" rx="1" fill="#2f3e46" />
                            <rect x="4" y="6" width="10" height="5" fill="#2f3e46" />
                            <rect x="7" y="1" width="4" height="6" fill="#2f3e46" />
                            <rect x="3" y="12" width="2" height="4" fill="#354f52" />
                            <rect x="8" y="12" width="2" height="4" fill="#354f52" />
                            <rect x="13" y="12" width="2" height="4" fill="#354f52" />
                        </svg>
                    </div>
                    <span
                        style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#cad2c5',
                            letterSpacing: '0.06em',
                        }}
                    >
                        AFFREN<span style={{ color: '#c9a84c' }}>FLOW</span>
                    </span>
                </div>

                <div className="mt-14 flex min-h-screen w-full max-w-sm overflow-hidden md:mt-0 md:max-w-7xl">
                    <FinanceBanner />

                    <div className="bg-muted relative flex flex-1 items-center justify-center px-4 py-8 sm:px-8 md:py-10">
                        <div
                            className="pointer-events-none absolute top-0 right-0 hidden md:block"
                            style={{
                                width: 0,
                                height: 0,
                                borderStyle: 'solid',
                                borderWidth: '0 24px 24px 0',
                                borderColor: 'transparent #c9a84c transparent transparent',
                            }}
                        />

                        <div className="w-full max-w-[320px] sm:max-w-[400px]">
                            <div className="mb-6">
                                <div
                                    className="mb-[6px] flex items-center gap-2"
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        color: 'var(--muted-foreground)',
                                    }}
                                >
                                    <span
                                        className="flex-shrink-0"
                                        style={{ display: 'inline-block', width: 16, height: 1.5, background: 'var(--muted-foreground)' }}
                                    />
                                    Manajemen Keuangan Konstruksi
                                </div>
                                <h1
                                    style={{
                                        fontFamily: "'Barlow Condensed', sans-serif",
                                        fontSize: 'clamp(20px, 5vw, 24px)',
                                        fontWeight: 700,
                                        color: 'var(--foreground)',
                                        lineHeight: 1.1,
                                        letterSpacing: '0.01em',
                                        margin: '0 0 6px',
                                    }}
                                >
                                    Daftar Akun
                                </h1>
                                <p
                                    style={{
                                        fontSize: 12.5,
                                        color: 'var(--muted-foreground)',
                                        lineHeight: 1.55,
                                        margin: 0,
                                    }}
                                >
                                    Gunakan kredensial yang diberikan admin proyek Anda.
                                </p>
                            </div>

                            <div
                                style={{
                                    background: 'var(--card)',
                                    border: '0.5px solid var(--border)',
                                    borderRadius: 'calc(var(--radius) * 1.4)',
                                    padding: '22px',
                                }}
                            >
                                <form onSubmit={submit} className="flex flex-col gap-0">
                                    <div className="mb-[13px]">
                                        <Label
                                            htmlFor="name"
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                color: 'var(--foreground)',
                                                opacity: 0.6,
                                                marginBottom: 4,
                                                display: 'block',
                                            }}
                                        >
                                            Nama
                                        </Label>
                                        <div className="relative">
                                            <User
                                                size={14}
                                                className="pointer-events-none absolute top-1/2 left-[10px] -translate-y-1/2"
                                                style={{ color: 'var(--muted-foreground)' }}
                                            />
                                            <input
                                                id="name"
                                                type="name"
                                                autoComplete="name"
                                                autoFocus
                                                tabIndex={1}
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="nama"
                                                style={{
                                                    width: '100%',
                                                    height: 38,
                                                    border: errors.email ? '0.5px solid #b03a3a' : '0.5px solid var(--border)',
                                                    borderRadius: 'var(--radius)',
                                                    color: 'var(--foreground)',
                                                    fontFamily: "'Barlow', sans-serif",
                                                    fontSize: 13,
                                                    padding: '0 12px 0 33px',
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = 'var(--ring)';
                                                    e.target.style.background = 'var(--card)';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(82,121,111,0.14)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = errors.email ? '#b03a3a' : 'var(--border)';
                                                    e.target.style.background = 'var(--muted)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                        {errors.name && <p style={{ fontSize: 11, color: '#b03a3a', marginTop: 3 }}>{errors.email}</p>}
                                    </div>
                                    <div className="mb-[13px]">
                                        <Label
                                            htmlFor="email"
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                color: 'var(--foreground)',
                                                opacity: 0.6,
                                                marginBottom: 4,
                                                display: 'block',
                                            }}
                                        >
                                            Alamat Email
                                        </Label>
                                        <div className="relative">
                                            <Mail
                                                size={14}
                                                className="pointer-events-none absolute top-1/2 left-[10px] -translate-y-1/2"
                                                style={{ color: 'var(--muted-foreground)' }}
                                            />
                                            <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                autoFocus
                                                tabIndex={1}
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="email@perusahaan.com"
                                                style={{
                                                    width: '100%',
                                                    height: 38,
                                                    border: errors.email ? '0.5px solid #b03a3a' : '0.5px solid var(--border)',
                                                    borderRadius: 'var(--radius)',
                                                    color: 'var(--foreground)',
                                                    fontFamily: "'Barlow', sans-serif",
                                                    fontSize: 13,
                                                    padding: '0 12px 0 33px',
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = 'var(--ring)';
                                                    e.target.style.background = 'var(--card)';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(82,121,111,0.14)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = errors.email ? '#b03a3a' : 'var(--border)';
                                                    e.target.style.background = 'var(--muted)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                        {errors.email && <p style={{ fontSize: 11, color: '#b03a3a', marginTop: 3 }}>{errors.email}</p>}
                                    </div>

                                    <div className="mb-[13px]">
                                        <div className="mb-1 flex items-baseline justify-between">
                                            <Label
                                                htmlFor="password"
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 500,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                    color: 'var(--foreground)',
                                                    opacity: 0.6,
                                                }}
                                            >
                                                Password
                                            </Label>
                                        </div>
                                        <div className="relative">
                                            <Lock
                                                size={14}
                                                className="pointer-events-none absolute top-1/2 left-[10px] -translate-y-1/2"
                                                style={{ color: 'var(--muted-foreground)' }}
                                            />
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                tabIndex={2}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Masukkan password"
                                                style={{
                                                    width: '100%',
                                                    height: 38,
                                                    border: errors.password ? '0.5px solid #b03a3a' : '0.5px solid var(--border)',
                                                    borderRadius: 'var(--radius)',
                                                    color: 'var(--foreground)',
                                                    fontFamily: "'Barlow', sans-serif",
                                                    fontSize: 13,
                                                    padding: '0 36px 0 33px',
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = 'var(--ring)';
                                                    e.target.style.background = 'var(--card)';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(82,121,111,0.14)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = errors.password ? '#b03a3a' : 'var(--border)';
                                                    e.target.style.background = 'var(--muted)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute top-1/2 right-[10px] -translate-y-1/2 border-none bg-transparent p-0 hover:opacity-50"
                                                style={{ color: 'var(--muted-foreground)', cursor: 'pointer', lineHeight: 1 }}
                                                aria-label="Tampilkan atau sembunyikan password"
                                            >
                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                        {errors.password && <p style={{ fontSize: 11, color: '#b03a3a', marginTop: 3 }}>{errors.password}</p>}
                                    </div>
                                    <div className="mb-[13px]">
                                        <div className="mb-1 flex items-baseline justify-between">
                                            <Label
                                                htmlFor="password_confirmation"
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 500,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                    color: 'var(--foreground)',
                                                    opacity: 0.6,
                                                }}
                                            >
                                                Konfirmasi Password
                                            </Label>
                                        </div>
                                        <div className="relative">
                                            <Lock
                                                size={14}
                                                className="pointer-events-none absolute top-1/2 left-[10px] -translate-y-1/2"
                                                style={{ color: 'var(--muted-foreground)' }}
                                            />
                                            <input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password_confirmation'}
                                                autoComplete="current-password_confirmation"
                                                tabIndex={2}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="Konfirmasi password"
                                                style={{
                                                    width: '100%',
                                                    height: 38,
                                                    border: errors.password_confirmation ? '0.5px solid #b03a3a' : '0.5px solid var(--border)',
                                                    borderRadius: 'var(--radius)',
                                                    color: 'var(--foreground)',
                                                    fontFamily: "'Barlow', sans-serif",
                                                    fontSize: 13,
                                                    padding: '0 36px 0 33px',
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = 'var(--ring)';
                                                    e.target.style.background = 'var(--card)';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(82,121,111,0.14)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = errors.password_confirmation ? '#b03a3a' : 'var(--border)';
                                                    e.target.style.background = 'var(--muted)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute top-1/2 right-[10px] -translate-y-1/2 border-none bg-transparent p-0 hover:opacity-50"
                                                style={{ color: 'var(--muted-foreground)', cursor: 'pointer', lineHeight: 1 }}
                                                aria-label="Tampilkan atau sembunyikan password"
                                            >
                                                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                        {errors.password && <p style={{ fontSize: 11, color: '#b03a3a', marginTop: 3 }}>{errors.password}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        tabIndex={4}
                                        disabled={processing}
                                        className="relative w-full overflow-hidden transition-opacity hover:opacity-50"
                                        style={{
                                            height: 40,
                                            background: 'var(--primary)',
                                            color: 'var(--primary-foreground)',
                                            fontFamily: "'Barlow Condensed', sans-serif",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            border: 'none',
                                            borderRadius: 'var(--radius)',
                                        }}
                                    >
                                        <span
                                            className="pointer-events-none absolute top-0 left-0 h-full"
                                            style={{ width: 3, background: '#c9a84c' }}
                                        />
                                        {processing ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                                        {processing ? 'Loading . . .' : 'Daftar'}
                                    </Button>

                                    {/* <div className="my-[14px] flex items-center gap-3">
                                        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                                        <span
                                            style={{
                                                fontSize: 10,
                                                color: '#cad2c5',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            atau masuk dengan
                                        </span>
                                        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                                    </div> */}

                                    {/* <button
                                        type="button"
                                        className="flex w-full items-center justify-center gap-2"
                                        style={{
                                            height: 37,
                                            background: 'var(--secondary)',
                                            border: '0.5px solid var(--border)',
                                            borderRadius: 'var(--radius)',
                                            fontFamily: "'Barlow', sans-serif",
                                            fontSize: 12.5,
                                            color: 'var(--secondary-foreground)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                            <path
                                                fill="#e25b45"
                                                d="M7.2 1.1c.73-.08 1.15-.08 1.93 0a6.57 6.57 0 0 1 3.65 1.82 100 100 0 0 0-1.99 1.93q-1.88-1.59-4.19-.73-1.7.78-2.36 2.53a78 78 0 0 1-2.15-1.66.26.26 0 0 0-.16-.03q1.68-3.24 5.26-3.86"
                                            />
                                            <path
                                                fill="#ffc107"
                                                d="M1.95 4.92q.08-.01.16.03a78 78 0 0 0 2.15 1.66 7.6 7.6 0 0 0-.21 1.39q.04.68.21 1.33L2 11.12Q.53 8.04 1.95 4.92"
                                            />
                                            <path
                                                fill="#4285f4"
                                                d="M12.69 13.29a26 26 0 0 0-2.2-1.74q1.15-.81 1.4-2.23H8.12V6.71q3.25-.03 6.5.06.62 3.34-1.42 6.03a7 7 0 0 1-.51.49"
                                            />
                                            <path
                                                fill="#34a853"
                                                d="M4.26 9.32q1.23 3.06 4.51 2.85a3.94 3.94 0 0 0 1.72-.63q1.15.81 2.2 1.74a6.62 6.62 0 0 1-4.03 1.68 6.4 6.4 0 0 1-1.02 0Q3.82 14.52 2 11.12z"
                                            />
                                        </svg>
                                        Masuk dengan Google
                                    </button> */}
                                    <div className="text-foreground mt-3 flex w-full items-center justify-center gap-1 text-[10px]">
                                        <p>Sudah punya akun?</p>
                                        <a className="hover:text-foreground/45 font-semibold" href="/login">
                                            Masuk
                                        </a>
                                    </div>
                                </form>
                            </div>

                            {status && (
                                <div
                                    className="mt-3"
                                    style={{
                                        padding: '8px 11px',
                                        background: 'color-mix(in srgb, #3a7a52 10%, #ffffff)',
                                        borderLeft: '3px solid #3a7a52',
                                        borderRadius: '0 var(--radius) var(--radius) 0',
                                        fontSize: 12,
                                        color: '#3a7a52',
                                    }}
                                >
                                    {status}
                                </div>
                            )}

                            <div
                                className="mt-3 flex items-center justify-center gap-[5px]"
                                style={{ fontSize: 10.5, color: 'var(--muted-foreground)', opacity: 0.65 }}
                            >
                                <ShieldCheck size={12} style={{ color: '#84a98c' }} />
                                Koneksi terenkripsi SSL · Data proyek terlindungi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
