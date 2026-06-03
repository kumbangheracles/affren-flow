import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: any;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export function FinanceBanner() {
    return (
        <div className="relative hidden w-[46%] flex-shrink-0 overflow-hidden md:flex" style={{ background: '#2f3e46' }}>
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(132,169,140,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(132,169,140,0.06) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                }}
            />

            <div className="absolute top-7 left-7 z-10 flex items-center gap-2">
                <AppLogo />
                {/* <span
                    style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#cad2c5',
                        letterSpacing: '0.06em',
                    }}
                >
                    AFFREN<span className="text-muted-foreground">FLOW</span>
                </span> */}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                <svg width="260" height="320" viewBox="0 0 260 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                    <style>{`
                        @keyframes bar-rise { 0% { transform: scaleY(0); } 100% { transform: scaleY(1); } }
                        @keyframes line-draw { 0% { stroke-dashoffset: 400; } 100% { stroke-dashoffset: 0; } }
                        @keyframes fade-up { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
                        @keyframes pulse-ring { 0% { r: 6; opacity: 0.8; } 70% { r: 14; opacity: 0; } 100% { r: 14; opacity: 0; } }
                        @keyframes float-coin { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                        @keyframes flow-dash { to { stroke-dashoffset: -24; } }
                        .bar-anim { transform-origin: bottom; animation: bar-rise 0.7s cubic-bezier(0.34,1.36,0.64,1) both; }
                        .b1 { animation-delay: 0.1s; } .b2 { animation-delay: 0.25s; }
                        .b3 { animation-delay: 0.4s; } .b4 { animation-delay: 0.55s; }
                        .b5 { animation-delay: 0.7s; } .b6 { animation-delay: 0.85s; }
                        .line-anim { stroke-dasharray: 400; stroke-dashoffset: 400; animation: line-draw 1.4s ease-out 0.6s both; }
                        .node-pulse { animation: fade-up 0.4s ease both; }
                        .n1 { animation-delay: 1.4s; } .n2 { animation-delay: 1.6s; } .n3 { animation-delay: 1.8s; }
                        .ring-anim { animation: pulse-ring 2s ease-out infinite; }
                        .coin-float { animation: float-coin 3s ease-in-out infinite; }
                        .cf1 { animation-delay: 0s; } .cf2 { animation-delay: 0.8s; } .cf3 { animation-delay: 1.6s; }
                        .flow-anim { stroke-dasharray: 6 6; animation: flow-dash 1s linear infinite; }
                        .donut-seg { animation: fade-up 0.6s ease both; }
                        .ds1 { animation-delay: 0.3s; } .ds2 { animation-delay: 0.5s; }
                        .ds3 { animation-delay: 0.7s; } .ds4 { animation-delay: 0.9s; }
                        .center-rp { animation: fade-up 0.5s ease 1.1s both; opacity: 0; }
                    `}</style>

                    <line x1="20" y1="240" x2="240" y2="240" stroke="rgba(132,169,140,0.15)" strokeWidth="0.5" />
                    <line x1="20" y1="200" x2="240" y2="200" stroke="rgba(132,169,140,0.08)" strokeWidth="0.5" />
                    <line x1="20" y1="160" x2="240" y2="160" stroke="rgba(132,169,140,0.08)" strokeWidth="0.5" />
                    <line x1="20" y1="120" x2="240" y2="120" stroke="rgba(132,169,140,0.06)" strokeWidth="0.5" />

                    <rect className="bar-anim b1" x="28" y="180" width="18" height="60" rx="2" fill="rgba(82,121,111,0.35)" />
                    <rect className="bar-anim b1" x="48" y="160" width="18" height="80" rx="2" fill="#52796f" opacity="0.85" />
                    <rect className="bar-anim b2" x="78" y="190" width="18" height="50" rx="2" fill="rgba(82,121,111,0.35)" />
                    <rect className="bar-anim b3" x="98" y="145" width="18" height="95" rx="2" fill="#52796f" opacity="0.85" />
                    <rect className="bar-anim b3" x="128" y="175" width="18" height="65" rx="2" fill="rgba(82,121,111,0.35)" />
                    <rect className="bar-anim b4" x="148" y="130" width="18" height="110" rx="2" fill="#52796f" opacity="0.85" />
                    <rect className="bar-anim b4" x="178" y="168" width="18" height="72" rx="2" fill="rgba(201,168,76,0.25)" />
                    <rect className="bar-anim b5" x="198" y="108" width="18" height="132" rx="2" fill="#c9a84c" opacity="0.9" />

                    <polyline
                        className="line-anim"
                        points="57,228 107,210 157,190 207,155"
                        stroke="#c9a84c"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity="0.7"
                    />

                    <g className="node-pulse n1">
                        <circle cx="57" cy="228" r="3" fill="#c9a84c" opacity="0.9" />
                    </g>
                    <g className="node-pulse n2">
                        <circle cx="107" cy="210" r="3" fill="#c9a84c" opacity="0.9" />
                    </g>
                    <g className="node-pulse n2">
                        <circle cx="157" cy="190" r="3" fill="#c9a84c" opacity="0.9" />
                    </g>
                    <g className="node-pulse n3">
                        <circle cx="207" cy="155" r="3" fill="#c9a84c" />
                        <circle cx="207" cy="155" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0" className="ring-anim" />
                    </g>

                    <circle cx="130" cy="72" r="42" fill="none" stroke="rgba(132,169,140,0.1)" strokeWidth="10" />
                    <circle
                        className="donut-seg ds1"
                        cx="130"
                        cy="72"
                        r="42"
                        fill="none"
                        stroke="#52796f"
                        strokeWidth="10"
                        strokeDasharray="105 159"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        opacity="0.85"
                    />
                    <circle
                        className="donut-seg ds2"
                        cx="130"
                        cy="72"
                        r="42"
                        fill="none"
                        stroke="#c9a84c"
                        strokeWidth="10"
                        strokeDasharray="79 185"
                        strokeDashoffset="-105"
                        strokeLinecap="round"
                        opacity="0.85"
                    />
                    <circle
                        className="donut-seg ds3"
                        cx="130"
                        cy="72"
                        r="42"
                        fill="none"
                        stroke="#3a7a52"
                        strokeWidth="10"
                        strokeDasharray="48 216"
                        strokeDashoffset="-184"
                        strokeLinecap="round"
                        opacity="0.8"
                    />
                    <circle
                        className="donut-seg ds4"
                        cx="130"
                        cy="72"
                        r="42"
                        fill="none"
                        stroke="#b03a3a"
                        strokeWidth="10"
                        strokeDasharray="30 234"
                        strokeDashoffset="-232"
                        strokeLinecap="round"
                        opacity="0.7"
                    />
                    <circle cx="130" cy="72" r="30" fill="#2f3e46" />
                    <g className="center-rp">
                        <circle cx="130" cy="72" r="14" fill="rgba(201,168,76,0.15)" stroke="rgba(201,168,76,0.4)" strokeWidth="0.5" />
                        <text
                            x="130"
                            y="77"
                            textAnchor="middle"
                            fill="#c9a84c"
                            fontFamily="'Barlow Condensed', sans-serif"
                            fontSize="14"
                            fontWeight="700"
                        >
                            Rp
                        </text>
                    </g>

                    <g className="coin-float cf1">
                        <rect
                            x="8"
                            y="96"
                            width="58"
                            height="28"
                            rx="5"
                            fill="rgba(47,62,70,0.9)"
                            stroke="rgba(132,169,140,0.25)"
                            strokeWidth="0.5"
                        />
                        <circle cx="20" cy="110" r="5" fill="rgba(58,122,82,0.3)" stroke="#3a7a52" strokeWidth="0.5" />
                        <line x1="18" y1="110" x2="22" y2="108" stroke="#3a7a52" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="22" y1="108" x2="22" y2="113" stroke="#3a7a52" strokeWidth="1.2" strokeLinecap="round" />
                        <rect x="28" y="106" width="32" height="3" rx="1.5" fill="rgba(202,210,197,0.35)" />
                        <rect x="28" y="112" width="20" height="2" rx="1" fill="rgba(202,210,197,0.2)" />
                    </g>
                    <g className="coin-float cf2">
                        <rect
                            x="192"
                            y="60"
                            width="58"
                            height="28"
                            rx="5"
                            fill="rgba(47,62,70,0.9)"
                            stroke="rgba(201,168,76,0.25)"
                            strokeWidth="0.5"
                        />
                        <circle cx="204" cy="74" r="5" fill="rgba(201,168,76,0.2)" stroke="#c9a84c" strokeWidth="0.5" />
                        <text x="204" y="77" textAnchor="middle" fill="#c9a84c" fontFamily="sans-serif" fontSize="7" fontWeight="700">
                            !
                        </text>
                        <rect x="214" y="70" width="30" height="3" rx="1.5" fill="rgba(202,210,197,0.35)" />
                        <rect x="214" y="76" width="22" height="2" rx="1" fill="rgba(202,210,197,0.2)" />
                    </g>
                    <g className="coin-float cf3">
                        <rect
                            x="185"
                            y="245"
                            width="62"
                            height="28"
                            rx="5"
                            fill="rgba(47,62,70,0.9)"
                            stroke="rgba(82,121,111,0.25)"
                            strokeWidth="0.5"
                        />
                        <circle cx="197" cy="259" r="5" fill="rgba(82,121,111,0.2)" stroke="#52796f" strokeWidth="0.5" />
                        <line x1="197" y1="262" x2="197" y2="256" stroke="#52796f" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="195" y1="258" x2="197" y2="256" stroke="#52796f" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="199" y1="258" x2="197" y2="256" stroke="#52796f" strokeWidth="1.2" strokeLinecap="round" />
                        <rect x="207" y="255" width="34" height="3" rx="1.5" fill="rgba(202,210,197,0.35)" />
                        <rect x="207" y="261" width="24" height="2" rx="1" fill="rgba(202,210,197,0.2)" />
                    </g>

                    <line className="flow-anim" x1="130" y1="114" x2="130" y2="118" stroke="rgba(132,169,140,0.3)" strokeWidth="1" />
                    <line x1="20" y1="241" x2="240" y2="241" stroke="rgba(132,169,140,0.2)" strokeWidth="0.5" />
                </svg>
            </div>

            <div className="absolute right-0 bottom-6 left-0 z-10 flex justify-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-[5px] w-[5px] rounded-full" style={{ background: '#c9a84c' }} />
                    <div className="h-px w-5" style={{ background: 'rgba(202,210,197,0.2)' }} />
                    <div className="h-[5px] w-[5px] rounded-full" style={{ background: '#84a98c' }} />
                    <div className="h-px w-5" style={{ background: 'rgba(202,210,197,0.2)' }} />
                    <div className="h-[5px] w-[5px] rounded-full" style={{ background: '#3a7a52' }} />
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   MAIN LOGIN PAGE
───────────────────────────────────────── */
export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset, setError } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const validate = (): boolean => {
        const errs: Partial<LoginForm> = {};
        if (!data.email) {
            errs.email = 'Email wajib diisi.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errs.email = 'Format email tidak valid.';
        }
        // if (!data.password) {
        //     errs.password = 'Password wajib diisi.';
        // } else if (data.password.length < 6) {
        //     errs.password = 'Password minimal 6 karakter.';
        // } else if (!/[A-Z]/.test(data.password)) {
        //     errs.password = 'Password harus mengandung huruf kapital.';
        // } else if (!/[^A-Za-z0-9]/.test(data.password)) {
        //     errs.password = 'Password harus mengandung karakter unik (!@#$...).';
        // }
        if (Object.keys(errs).length > 0) {
            Object.entries(errs).forEach(([k, v]) => setError(k as keyof LoginForm, v!));
            return false;
        }
        return true;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!validate()) return;
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <AuthLayout title="Auth" description="">
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
                                <Head title="Login" />
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
                                        Masuk ke Akun
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
                                                        background: 'var(--muted)',
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
                                                {canResetPassword && (
                                                    <a
                                                        href={route('password.request')}
                                                        tabIndex={5}
                                                        style={{
                                                            fontSize: 11,
                                                            color: 'var(--primary)',
                                                            textDecoration: 'none',
                                                        }}
                                                        onMouseOver={(e) => ((e.target as HTMLElement).style.color = '#c9a84c')}
                                                        onMouseOut={(e) => ((e.target as HTMLElement).style.color = 'var(--primary)')}
                                                    >
                                                        Lupa password?
                                                    </a>
                                                )}
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
                                                        background: 'var(--muted)',
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

                                        <div className="mb-4 flex items-center gap-2">
                                            <Checkbox
                                                id="remember"
                                                tabIndex={3}
                                                checked={data.remember}
                                                onCheckedChange={(checked) => setData('remember', !!checked)}
                                                style={{ width: 14, height: 14, accentColor: 'var(--primary)' }}
                                            />
                                            <label
                                                htmlFor="remember"
                                                style={{
                                                    fontSize: 12,
                                                    color: 'var(--muted-foreground)',
                                                    cursor: 'pointer',
                                                    userSelect: 'none',
                                                }}
                                            >
                                                Ingat saya di perangkat ini
                                            </label>
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
                                            {processing ? 'Memverifikasi...' : 'Masuk'}
                                        </Button>

                                        <div className="my-[14px] flex items-center gap-3">
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
                                        </div>

                                        <button
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
                                        </button>
                                        <div className="text-foreground mt-3 flex w-full items-center justify-center gap-1 text-[10px]">
                                            <p>Belum punya akun?</p>
                                            <a className="hover:text-foreground/45 font-semibold" href="/register">
                                                daftar
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
        </>
    );
}
