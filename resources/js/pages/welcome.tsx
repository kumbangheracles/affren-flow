import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useState } from 'react';
if (!document.getElementById('af-font-link')) {
    const link = document.createElement('link');
    link.id = 'af-font-link';
    link.rel = 'stylesheet';
    link.href =
        'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Outfit:wght@300;400;500;600&display=swap';
    document.head.appendChild(link);
}

const STYLES = `
  :root {
    /* ── Palette: Finance × Earth Teal ── */
    --ash:        #cad2c5;
    --muted-teal: #84a98c;
    --deep-teal:  #52796f;
    --dark-slate: #354f52;
    --charcoal:   #2f3e46;
    --parchment:  #f5f0e8;
    --gold:       #c9a84c;
    --gold-light: #fdf3d8;
    --gold-fg:    #6b4c10;
    --sienna:     #d4501a;
    --crimson:    #b03a3a;
    --forest:     #3a7a52;
    --violet:     #7a5c9e;
    --border-col: #b8cbc5;

    /* ── Semantic aliases ── */
    --ink:        #1c2b2e;
    --ink-2:      #2f3e46;
    --ink-3:      #52796f;
    --paper:      #f5f0e8;
    --paper-2:    #e8ede6;
    --paper-3:    #b8cbc5;
    --primary:    #52796f;
    --primary-fg: #ffffff;
    --accent:     #c9a84c;
    --accent-bg:  #fdf3d8;
    --accent-fg:  #6b4c10;

    --serif: 'Playfair Display', Georgia, serif;
    --sans:  'Outfit', system-ui, sans-serif;
    --ease:  cubic-bezier(0.16,1,0.3,1);
  }

  .cp-root {
    font-family: var(--sans);
    background: var(--paper);
    color: var(--ink);
    overflow-x: hidden;
    scroll-behavior: smooth;
  }

  /* ── NAV ── */
  .cp-nav {
    position: fixed; top:0; left:0; right:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding: 1.1rem 3rem;
    background: rgba(245,240,232,.92);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border-col);
  }
  .cp-logo-wrap { display:flex; flex-direction:column; line-height:1; }
  .cp-logo-main { font-family:var(--serif); font-size:1.3rem; letter-spacing:-.01em; color:var(--ink); }
  .cp-logo-sub  { font-size:.6rem; letter-spacing:.18em; text-transform:uppercase; color:var(--ink-3); margin-top:.1rem; }

  .cp-nav-links { display:flex; align-items:center; gap:2.5rem; list-style:none; }
  .cp-nav-links a { font-size:.85rem; color:var(--ink-2); text-decoration:none; font-weight:400; letter-spacing:.01em; transition:color .2s; }
  .cp-nav-links a:hover { color:var(--deep-teal); }

  .cp-btn-nav {
    background:var(--deep-teal); color:#fff;
    padding:.5rem 1.3rem; border-radius:100px;
    font-size:.8rem; font-weight:500; border:none; cursor:pointer;
    transition:background .2s, transform .2s;
    font-family:var(--sans); letter-spacing:.02em;
  }
  .cp-btn-nav:hover { background:var(--charcoal); transform:translateY(-1px); }

  /* ── HERO ── */
  .cp-hero {
    min-height:100vh;
    display:grid; grid-template-columns:1fr 1fr;
    position:relative; overflow:hidden;
  }
  .cp-hero-left {
    display:flex; flex-direction:column; justify-content:center;
    padding: 9rem 3rem 5rem;
    position:relative; z-index:2;
  }
  .cp-hero-right {
    background: var(--dark-slate);
    position:relative; overflow:hidden;
    display:flex; align-items:center; justify-content:center;
  }
  .cp-hero-right-pattern {
    position:absolute; inset:0;
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(202,210,197,.06) 47px, rgba(202,210,197,.06) 48px),
      repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(202,210,197,.06) 47px, rgba(202,210,197,.06) 48px);
  }
  .cp-hero-right-accent {
    position:absolute; bottom:-80px; right:-80px;
    width:380px; height:380px; border-radius:50%;
    background: radial-gradient(circle, rgba(201,168,76,.2) 0%, transparent 70%);
  }
  .cp-hero-right-accent2 {
    position:absolute; top:-60px; left:-60px;
    width:280px; height:280px; border-radius:50%;
    background: radial-gradient(circle, rgba(82,121,111,.4) 0%, transparent 70%);
  }

  .cp-hero-stat-card {
    position:relative; z-index:2;
    display:flex; flex-direction:column; gap:1.25rem;
    padding:2.5rem;
  }
  .cp-stat-pill {
    background:rgba(202,210,197,.08);
    border:1px solid rgba(202,210,197,.15);
    border-radius:14px; padding:1.25rem 1.5rem;
    animation: fadeUp .7s var(--ease) both;
  }
  .cp-stat-pill-num {
    font-family:var(--serif); font-size:2.8rem; color:var(--ash);
    letter-spacing:-.03em; line-height:1; margin-bottom:.2rem;
  }
  .cp-stat-pill-label { font-size:.75rem; color:var(--muted-teal); text-transform:uppercase; letter-spacing:.12em; }

  .cp-hero-tag {
    display:inline-flex; align-items:center; gap:.5rem;
    font-size:.7rem; font-weight:600; color:var(--accent-fg);
    letter-spacing:.14em; text-transform:uppercase;
    background:var(--accent-bg); padding:.35rem .9rem; border-radius:100px;
    border:1px solid rgba(201,168,76,.3);
    margin-bottom:1.5rem;
    animation: fadeUp .6s var(--ease) .1s both;
    width:fit-content;
  }
  .cp-h1 {
    font-family:var(--serif); font-weight:900;
    font-size:clamp(2.6rem,4.5vw,4rem);
    line-height:1.06; letter-spacing:-.03em;
    color:var(--ink); margin-bottom:.6rem;
    animation: fadeUp .7s var(--ease) .2s both;
  }
  .cp-h1-company {
    font-style:italic; color:var(--deep-teal);
    display:block;
  }
  .cp-hero-sub {
    font-size:1rem; color:var(--ink-3); line-height:1.75;
    max-width:420px; font-weight:300; margin-bottom:2.5rem;
    animation: fadeUp .7s var(--ease) .3s both;
  }
  .cp-hero-cta {
    display:flex; align-items:center; gap:1rem;
    animation: fadeUp .7s var(--ease) .4s both;
  }
  .cp-btn-primary {
    background:var(--deep-teal); color:#fff;
    padding:.85rem 2rem; border-radius:100px;
    font-size:.9rem; font-weight:500; border:none; cursor:pointer;
    font-family:var(--sans);
    transition:background .25s var(--ease), transform .25s var(--ease);
  }
  .cp-btn-primary:hover { background:var(--charcoal); transform:translateY(-2px); }
  .cp-btn-ghost {
    color:var(--ink-2); font-size:.9rem; background:none; border:none; cursor:pointer;
    display:flex; align-items:center; gap:.4rem; font-family:var(--sans);
    transition:color .2s, gap .2s;
  }
  .cp-btn-ghost:hover { color:var(--deep-teal); gap:.7rem; }

  /* ── SECTION COMMONS ── */
  .cp-section { padding:6rem 3rem; }
  .cp-section-tag {
    font-size:.7rem; font-weight:600; color:var(--muted-teal);
    letter-spacing:.14em; text-transform:uppercase; margin-bottom:.75rem;
  }
  .cp-h2 {
    font-family:var(--serif); font-weight:700;
    font-size:clamp(2rem,3.5vw,2.8rem);
    letter-spacing:-.03em; line-height:1.12; color:var(--ink); margin-bottom:1rem;
  }
  .cp-h2 em { font-style:italic; color:var(--deep-teal); }
  .cp-section-sub {
    font-size:.95rem; color:var(--ink-3);
    max-width:520px; line-height:1.75; font-weight:300; margin-bottom:3.5rem;
  }

  /* ── ABOUT ── */
  .cp-about { background:var(--paper-2); border-top:1px solid var(--border-col); border-bottom:1px solid var(--border-col); }
  .cp-about-grid { display:grid; grid-template-columns:1fr 1fr; gap:5rem; align-items:center; }
  .cp-about-visual { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
  .cp-about-tile {
    border-radius:12px; padding:1.75rem 1.5rem;
    display:flex; flex-direction:column; gap:.5rem;
  }
  .cp-about-tile.dark { background:var(--dark-slate); color:var(--ash); }
  .cp-about-tile.light { background:white; border:1px solid var(--border-col); }
  .cp-about-tile.earth { background:var(--deep-teal); color:#fff; }
  .cp-about-tile.outline { background:transparent; border:1.5px dashed var(--border-col); display:flex; align-items:center; justify-content:center; }
  .cp-tile-num { font-family:var(--serif); font-size:2.2rem; line-height:1; }
  .cp-tile-label { font-size:.75rem; opacity:.65; text-transform:uppercase; letter-spacing:.1em; font-weight:500; }
  .cp-tile-icon { font-size:2rem; }
  .cp-tile-outline-text { font-size:.8rem; color:var(--ink-3); text-align:center; font-style:italic; }
  .cp-value-list { display:flex; flex-direction:column; gap:.75rem; }
  .cp-value-item { display:flex; gap:.9rem; align-items:flex-start; }
  .cp-value-dot { width:8px; height:8px; border-radius:50%; background:var(--muted-teal); flex-shrink:0; margin-top:.5rem; }
  .cp-value-title { font-weight:500; font-size:.9rem; color:var(--ink); margin-bottom:.15rem; }
  .cp-value-desc { font-size:.82rem; color:var(--ink-3); font-weight:300; line-height:1.6; }

  /* ── PROYEK CATEGORIES ── */
  .cp-cat-tabs { display:flex; gap:.5rem; margin-bottom:2.5rem; flex-wrap:wrap; }
  .cp-cat-tab {
    padding:.5rem 1.25rem; border-radius:100px; font-size:.82rem; font-weight:500;
    border:1px solid var(--border-col); background:white; cursor:pointer;
    transition:all .2s; font-family:var(--sans); color:var(--ink-2);
  }
  .cp-cat-tab.active { background:var(--deep-teal); color:#fff; border-color:var(--deep-teal); }
  .cp-cat-tab:hover:not(.active) { border-color:var(--muted-teal); color:var(--deep-teal); }

  .cp-sub-grid {
    display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:1px;
    background:var(--border-col); border:1px solid var(--border-col); border-radius:16px; overflow:hidden;
  }
  .cp-sub-card {
    background:var(--paper); padding:1.75rem 1.5rem;
    transition:background .2s;
    display:flex; flex-direction:column; gap:.6rem;
  }
  .cp-sub-card:hover { background:white; }
  .cp-sub-icon { font-size:1.4rem; }
  .cp-sub-name { font-size:.9rem; font-weight:500; color:var(--ink); line-height:1.3; }
  .cp-sub-cat { font-size:.72rem; color:var(--muted-teal); text-transform:uppercase; letter-spacing:.08em; }

  /* ── LAYANAN / PROCESS ── */
  .cp-process-section { background:var(--charcoal); color:var(--ash); }
  .cp-process-section .cp-section-tag { color:var(--muted-teal); opacity:.7; }
  .cp-process-section .cp-h2 { color:var(--ash); }
  .cp-process-section .cp-h2 em { color:var(--gold); }
  .cp-process-section .cp-section-sub { color:var(--muted-teal); opacity:.8; max-width:520px; }

  .cp-process-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0; position:relative; }
  .cp-process-grid::before {
    content:''; position:absolute;
    top:24px; left:calc(12.5% + 1rem); right:calc(12.5% + 1rem);
    height:1px; background:rgba(132,169,140,.2);
  }
  .cp-process-step { text-align:center; padding:0 1.25rem; position:relative; z-index:1; }
  .cp-process-num {
    width:48px; height:48px; border-radius:50%;
    border:1px solid rgba(132,169,140,.25);
    display:flex; align-items:center; justify-content:center;
    font-family:var(--serif); font-size:1.15rem; color:var(--ash);
    margin:0 auto 1.25rem;
    transition:background .2s, border-color .2s;
  }
  .cp-process-step:hover .cp-process-num { background:var(--deep-teal); border-color:var(--deep-teal); }
  .cp-process-title { font-weight:500; font-size:.9rem; color:var(--ash); margin-bottom:.5rem; }
  .cp-process-desc { font-size:.8rem; color:var(--muted-teal); line-height:1.65; font-weight:300; opacity:.8; }

  /* ── KEUNGGULAN ── */
  .cp-advantage-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
  .cp-advantage-card {
    padding:2rem 1.75rem; border-radius:16px;
    border:1px solid var(--border-col); background:white;
    transition:transform .2s var(--ease), box-shadow .2s var(--ease), border-color .2s;
  }
  .cp-advantage-card:hover { transform:translateY(-4px); box-shadow:0 20px 48px rgba(47,62,70,.08); border-color:var(--muted-teal); }
  .cp-adv-icon {
    width:44px; height:44px; border-radius:10px; background:var(--paper-2);
    display:flex; align-items:center; justify-content:center; font-size:1.3rem;
    margin-bottom:1.25rem; border:1px solid var(--border-col);
  }
  .cp-adv-title { font-family:var(--serif); font-size:1.15rem; color:var(--ink); margin-bottom:.6rem; letter-spacing:-.01em; }
  .cp-adv-desc { font-size:.85rem; color:var(--ink-3); line-height:1.7; font-weight:300; }

  /* ── KONTAK / CTA ── */
  .cp-cta-section {
    background:var(--dark-slate); text-align:center;
    padding:7rem 3rem; position:relative; overflow:hidden;
  }
  .cp-cta-section::before {
    content:''; position:absolute;
    bottom:-120px; right:-120px; width:500px; height:500px; border-radius:50%;
    background:radial-gradient(circle, rgba(201,168,76,.15) 0%, transparent 70%);
  }
  .cp-cta-section::after {
    content:''; position:absolute;
    top:-80px; left:-80px; width:350px; height:350px; border-radius:50%;
    background:radial-gradient(circle, rgba(82,121,111,.3) 0%, transparent 70%);
  }
  .cp-cta-section > * { position:relative; z-index:1; }
  .cp-cta-h2 {
    font-family:var(--serif); font-weight:900;
    font-size:clamp(2.2rem,4vw,3.2rem); letter-spacing:-.03em;
    color:var(--ash); max-width:580px; margin:0 auto 1rem;
  }
  .cp-cta-h2 em { font-style:italic; color:var(--gold); }
  .cp-cta-p { color:var(--muted-teal); font-weight:300; max-width:400px; margin:0 auto 2.5rem; font-size:.95rem; opacity:.85; }
  .cp-cta-btns { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
  .cp-btn-cta {
    background:var(--gold); color:var(--gold-fg);
    padding:.9rem 2.2rem; border-radius:100px;
    font-size:.9rem; font-weight:600; border:none; cursor:pointer;
    font-family:var(--sans);
    transition:background .2s, transform .2s;
  }
  .cp-btn-cta:hover { background:var(--ash); color:var(--charcoal); transform:translateY(-2px); }
  .cp-btn-cta-outline {
    background:transparent; color:var(--ash);
    border:1px solid rgba(202,210,197,.3);
    padding:.9rem 2.2rem; border-radius:100px;
    font-size:.9rem; font-weight:400; cursor:pointer;
    font-family:var(--sans);
    transition:border-color .2s, transform .2s;
  }
  .cp-btn-cta-outline:hover { border-color:var(--ash); transform:translateY(-2px); }

  /* ── FOOTER ── */
  .cp-footer {
    background:var(--charcoal); color:var(--muted-teal);
    padding:3rem; display:flex; align-items:center; justify-content:space-between;
    border-top:1px solid rgba(82,121,111,.2);
  }
  .cp-footer-logo { font-family:var(--serif); font-size:1.2rem; color:var(--ash); }
  .cp-footer-sub { font-size:.65rem; color:var(--muted-teal); letter-spacing:.12em; text-transform:uppercase; margin-top:.15rem; opacity:.6; }
  .cp-footer-copy { font-size:.78rem; opacity:.6; }
  .cp-footer-links { display:flex; gap:1.5rem; list-style:none; }
  .cp-footer-links a { font-size:.78rem; color:var(--muted-teal); text-decoration:none; opacity:.7; transition:opacity .2s, color .2s; }
  .cp-footer-links a:hover { color:var(--ash); opacity:1; }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }

  @media (max-width:900px) {
    .cp-nav { padding:1rem 1.5rem; }
    .cp-nav-links { display:none; }
    .cp-hero { grid-template-columns:1fr; min-height:auto; }
    .cp-hero-right { display:none; }
    .cp-hero-left { padding:7rem 1.5rem 3rem; }
    .cp-section { padding:4rem 1.5rem; }
    .cp-about-grid, .cp-process-grid, .cp-advantage-grid { grid-template-columns:1fr; }
    .cp-footer { flex-direction:column; gap:1.5rem; text-align:center; }
    .cp-stat-pill-num { font-size:2rem; }
  }
`;

if (!document.getElementById('affren-profile-styles')) {
    const s = document.createElement('style');
    s.id = 'affren-profile-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
}

const CATEGORIES = [
    { id: 1, nama: 'Gedung' },
    { id: 2, nama: 'Irigasi' },
    { id: 3, nama: 'Jalan' },
];

const SUB_CATEGORIES = [
    { cat: 1, nama: 'SAB', icon: '🏛️' },
    { cat: 1, nama: 'Balai Warga', icon: '🏠' },
    { cat: 1, nama: 'GSG', icon: '🏟️' },
    { cat: 1, nama: 'Taman Baca', icon: '📚' },
    { cat: 1, nama: 'Gedung Pendidikan', icon: '🏫' },
    { cat: 1, nama: 'Gedung Kesehatan', icon: '🏥' },
    { cat: 1, nama: 'Gedung Umum', icon: '🏢' },
    { cat: 1, nama: 'Penataan Fasos Fasum', icon: '🏙️' },
    { cat: 1, nama: 'Gapura', icon: '🚪' },
    { cat: 1, nama: 'Rumah Tidak Layak Huni (Bedah Rumah)', icon: '🏡' },
    { cat: 1, nama: 'Pemagaran', icon: '⬜' },
    { cat: 2, nama: 'U-DITCH', icon: '🌊' },
    { cat: 2, nama: 'TPT (TURAB)', icon: '🪨' },
    { cat: 2, nama: 'SPAL Rumah Tangga (Batu Kali)', icon: '💧' },
    { cat: 3, nama: 'Paving Block', icon: '🟫' },
    { cat: 3, nama: 'Betonisasi', icon: '🔩' },
    { cat: 3, nama: 'Hotmix (Aspal)', icon: '🛣️' },
];

const ADVANTAGES = [
    {
        icon: '🏗️',
        title: 'Pengalaman Terpercaya',
        desc: 'Rekam jejak panjang di bidang konstruksi gedung, irigasi, dan jalan — dipercaya oleh berbagai instansi pemerintah dan swasta.',
    },
    {
        icon: '⚙️',
        title: 'SDM Terampil & Bersertifikat',
        desc: 'Tim pelaksana berpengalaman dengan tenaga ahli bersertifikat yang memastikan setiap proyek dikerjakan sesuai standar teknis.',
    },
    {
        icon: '📐',
        title: 'Kualitas Material Premium',
        desc: 'Hanya menggunakan material berkualitas tinggi dari supplier terpercaya untuk menjamin ketahanan dan keawetan konstruksi.',
    },
    {
        icon: '⏱️',
        title: 'Tepat Waktu & Anggaran',
        desc: 'Komitmen penuh terhadap jadwal pelaksanaan dan pengendalian biaya agar setiap proyek selesai sesuai target.',
    },
    {
        icon: '📋',
        title: 'Legalitas Lengkap',
        desc: 'Perusahaan beroperasi dengan seluruh perizinan dan sertifikasi yang diperlukan sesuai regulasi konstruksi Indonesia.',
    },
    {
        icon: '🤝',
        title: 'Layanan Purna Proyek',
        desc: 'Garansi dan dukungan purna proyek untuk memastikan hasil pekerjaan tetap optimal dalam jangka panjang.',
    },
];

const PROCESS = [
    { n: '01', title: 'Konsultasi Awal', desc: 'Diskusi kebutuhan proyek, survei lokasi, dan penyusunan rencana teknis bersama tim ahli kami.' },
    { n: '02', title: 'Penawaran & RAB', desc: 'Penyusunan Rencana Anggaran Biaya detail dan penawaran harga yang transparan dan kompetitif.' },
    {
        n: '03',
        title: 'Pelaksanaan',
        desc: 'Pengerjaan konstruksi oleh tim terlatih dengan pengawasan ketat sesuai spesifikasi teknis yang disepakati.',
    },
    { n: '04', title: 'Serah Terima', desc: 'Pemeriksaan akhir bersama, dokumentasi, dan serah terima proyek lengkap dengan garansi pekerjaan.' },
];

export default function AffrenProfile() {
    const [activeCat, setActiveCat] = useState(1);
    const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const filtered = SUB_CATEGORIES.filter((s) => s.cat === activeCat);
    const activeCatName = CATEGORIES.find((c) => c.id === activeCat)?.nama;

    return (
        <div className="cp-root">
            <nav className="cp-nav">
                <div className="cp-logo-wrap">
                    <span className="cp-logo-main">Affren Nurzzahrah</span>
                    <span className="cp-logo-sub">Jasa Konstruksi</span>
                </div>
                <ul className="cp-nav-links">
                    {[
                        ['tentang', 'Tentang'],
                        ['proyek', 'Layanan Proyek'],
                        ['keunggulan', 'Keunggulan'],
                        ['kontak', 'Kontak'],
                    ].map(([id, label]) => (
                        <li key={id}>
                            <a
                                href={`#${id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scroll(id);
                                }}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                    <li>
                        <button className="cp-btn-nav" onClick={() => scroll('kontak')}>
                            Hubungi Kami
                        </button>
                    </li>
                </ul>
            </nav>

            <section className="cp-hero">
                <div className="cp-hero-left">
                    <div className="cp-hero-tag">Penyedia Jasa Konstruksi</div>
                    <h1 className="cp-h1">
                        Membangun
                        <em className="cp-h1-company">Affren Nurzzahrah</em>
                        untuk Indonesia
                    </h1>
                    <p className="cp-hero-sub">
                        Kami menghadirkan solusi konstruksi profesional — dari gedung, irigasi, hingga infrastruktur jalan — dengan standar kualitas
                        tinggi dan komitmen terhadap ketepatan waktu.
                    </p>
                    <div className="cp-hero-cta">
                        <button className="cp-btn-primary" onClick={() => scroll('proyek')}>
                            Lihat Layanan Kami
                        </button>
                        <button className="cp-btn-ghost" onClick={() => scroll('kontak')}>
                            Konsultasi Gratis →
                        </button>
                    </div>
                </div>
                <div className="cp-hero-right">
                    <div className="cp-hero-right-pattern" />
                    <div className="cp-hero-right-accent" />
                    <div className="cp-hero-right-accent2" />
                    <div className="cp-hero-stat-card">
                        {[
                            ['3', 'Bidang Konstruksi'],
                            ['17+', 'Jenis Pekerjaan'],
                            ['100%', 'Legalitas Lengkap'],
                        ].map(([num, label], i) => (
                            <div className="cp-stat-pill" key={label} style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
                                <div className="cp-stat-pill-num">{num}</div>
                                <div className="cp-stat-pill-label">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="tentang" className="cp-section cp-about">
                <div className="cp-about-grid">
                    <div className="cp-about-visual">
                        <div className="cp-about-tile dark">
                            <div className="cp-tile-num">17+</div>
                            <div className="cp-tile-label">Jenis Pekerjaan</div>
                        </div>
                        <div className="cp-about-tile light">
                            <div className="cp-tile-icon">🏗️</div>
                            <div className="cp-tile-label">Konstruksi Profesional</div>
                        </div>
                        <div className="cp-about-tile light">
                            <div className="cp-tile-icon">🛡️</div>
                            <div className="cp-tile-label">Bergaransi & Legal</div>
                        </div>
                        <div className="cp-about-tile earth">
                            <div className="cp-tile-num">3</div>
                            <div className="cp-tile-label">Bidang Utama</div>
                        </div>
                    </div>

                    <div>
                        <p className="cp-section-tag">Tentang Kami</p>
                        <h2 className="cp-h2">
                            Mitra konstruksi yang <em>dapat diandalkan</em>
                        </h2>
                        <p className="cp-section-sub">
                            CV. Affren Nurzzahrah adalah perusahaan jasa konstruksi yang berfokus pada pengerjaan proyek gedung, irigasi, dan
                            infrastruktur jalan. Kami berkomitmen menghadirkan kualitas terbaik di setiap lini pekerjaan.
                        </p>
                        <div className="cp-value-list">
                            {[
                                ['Integritas', 'Kami mengutamakan kejujuran dan transparansi dalam setiap tahapan proyek.'],
                                ['Kualitas', 'Standar pengerjaan tinggi dengan material pilihan dan tenaga ahli terlatih.'],
                                ['Responsif', 'Tim kami siap merespons kebutuhan klien dengan cepat dan solusi tepat sasaran.'],
                            ].map(([t, d]) => (
                                <div className="cp-value-item" key={t}>
                                    <div className="cp-value-dot" />
                                    <div>
                                        <div className="cp-value-title">{t}</div>
                                        <div className="cp-value-desc">{d}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="proyek" className="cp-section">
                <p className="cp-section-tag">Layanan Proyek</p>
                <h2 className="cp-h2">
                    Cakupan <em>pekerjaan konstruksi</em> kami
                </h2>
                <p className="cp-section-sub">
                    Kami menangani berbagai jenis proyek konstruksi dari tiga bidang utama — gedung, irigasi, dan jalan — dengan spesifikasi pekerjaan
                    yang lengkap.
                </p>

                <div className="cp-cat-tabs">
                    {CATEGORIES.map((cat) => (
                        <button key={cat.id} className={`cp-cat-tab ${activeCat === cat.id ? 'active' : ''}`} onClick={() => setActiveCat(cat.id)}>
                            {cat.nama}
                        </button>
                    ))}
                </div>

                <div className="cp-sub-grid">
                    {filtered.map((sub) => (
                        <div className="cp-sub-card" key={sub.nama}>
                            <div className="cp-sub-icon">{sub.icon}</div>
                            <div className="cp-sub-name">{sub.nama}</div>
                            <div className="cp-sub-cat">{activeCatName}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="cp-section cp-process-section">
                <p className="cp-section-tag">Alur Kerja</p>
                <h2 className="cp-h2">
                    Proses kami yang <em>terstruktur</em>
                </h2>
                <p className="cp-section-sub">
                    Setiap proyek dijalankan melalui alur kerja yang jelas — dari konsultasi awal hingga serah terima akhir.
                </p>

                <div className="cp-process-grid">
                    {PROCESS.map((p) => (
                        <div className="cp-process-step" key={p.n}>
                            <div className="cp-process-num">{p.n}</div>
                            <div className="cp-process-title">{p.title}</div>
                            <p className="cp-process-desc">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="keunggulan" className="cp-section">
                <p className="cp-section-tag">Mengapa Kami</p>
                <h2 className="cp-h2">
                    Keunggulan yang membuat <em>kami berbeda</em>
                </h2>
                <p className="cp-section-sub">Kepercayaan klien adalah aset utama kami. Berikut komitmen yang kami jaga di setiap proyek.</p>

                <div className="cp-advantage-grid">
                    {ADVANTAGES.map((a) => (
                        <div className="cp-advantage-card" key={a.title}>
                            <div className="cp-adv-icon">{a.icon}</div>
                            <div className="cp-adv-title">{a.title}</div>
                            <p className="cp-adv-desc">{a.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="kontak" className="cp-cta-section">
                <h2 className="cp-cta-h2">
                    Siap memulai <em>proyek Anda</em> bersama kami?
                </h2>
                <p className="cp-cta-p">Konsultasikan kebutuhan konstruksi Anda. Tim kami siap memberikan penawaran terbaik.</p>
                <div className="cp-cta-btns">
                    <button className="cp-btn-cta">📞 Hubungi Sekarang</button>
                    <button className="cp-btn-cta-outline">Kirim Permintaan Penawaran →</button>
                </div>
            </section>

            <footer className="cp-footer">
                <div>
                    <div className="cp-footer-logo">Affren Nurzzahrah</div>
                    <div className="cp-footer-sub">Jasa Konstruksi</div>
                    <Button onClick={() => router.visit('/login')} className="text-foreground mt-2 flex items-center gap-3 font-serif">
                        <p>Masuk Sebagai Admin</p>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            className="lucide lucide-user-round-key-icon lucide-user-round-key"
                        >
                            <path d="M19 11v6" />
                            <path d="M19 13h2" />
                            <path d="M2 21a8 8 0 0 1 12.868-6.349" />
                            <circle cx="10" cy="8" r="5" />
                            <circle cx="19" cy="19" r="2" />
                        </svg>
                    </Button>
                </div>
                <p className="cp-footer-copy">© 2026 CV. Affren Nurzzahrah. Hak cipta dilindungi.</p>
                <ul className="cp-footer-links">
                    {['Profil', 'Layanan', 'Kontak'].map((l) => (
                        <li key={l}>
                            <a href="#">{l}</a>
                        </li>
                    ))}
                </ul>
            </footer>
        </div>
    );
}
