"use client";

import Image from 'next/image';
import Link from 'next/link';
import { LiquidGlass } from '@specy/liquid-glass-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandYoutube, IconChevronDown, IconChevronLeft, IconChevronRight, IconHome, IconPlayerPlay, IconSearch, IconWorld, IconX } from '@tabler/icons-react';
import BlurEffect from 'react-progressive-blur';

import { NdLogo } from './NdLogo';
import type { GameResponse } from '../types';

const glassStyle = {
  depth: 20,
  segments: 128,
  radius: 99,
  reflectivity: 1,
  thickness: 50,
  dispersion: 16,
  roughness: 0.3,
};

const LiquidGlassEnabled = false;

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(parsed);
}

function ageLabel(id: number): string {
  const map: Record<number, string> = { 1: '0+', 2: '7+', 3: '10+', 4: '13+', 5: '16+', 6: '18+' };
  return map[id] ?? `${id}+`;
}

const LOCALE_OPTIONS = [
  {
    region: 'United States',
    langs: [{ label: 'English', code: 'en-US' }],
  },
  {
    region: 'Україна',
    langs: [
      { label: 'Українська', code: 'uk-UA' },
      { label: 'English', code: 'en-UA' },
    ],
  },
  {
    region: 'Қазахстан',
    langs: [
      { label: 'Қазақша', code: 'kk-KZ' },
      { label: 'Русский', code: 'ru-KZ' },
      { label: 'English', code: 'en-KZ' },
    ],
  },
  {
    region: 'Russia',
    langs: [
      { label: 'Русский', code: 'ru-RU' },
      { label: 'English', code: 'en-RU' },
    ],
  },
];

type Props = {
  initialGame: GameResponse | null;
  initialError: string | null;
};

export default function Hero({ initialGame, initialError }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [game, setGame] = useState<GameResponse | null>(initialGame);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const [ulWidth, setUlWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isLightBg, setIsLightBg] = useState(false);
  const navbarCleanupRef = useRef<(() => void) | null>(null);
  const localeRef = useRef<HTMLDivElement>(null);
  const [localeOpen, setLocaleOpen] = useState(false);
  const headerLocaleRef = useRef<HTMLDivElement>(null);
  const [headerLocaleOpen, setHeaderLocaleOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState({ region: 'United States', lang: 'English', code: 'en-US' });

  // suppress unused-variable warnings for vars kept for future use
  void isLoading;
  void setGame;
  void setError;
  void setIsLoading;

  const navbarCallbackRef = useCallback((node: HTMLUListElement | null) => {
    if (!node) return;

    const measure = () => {
      const width = node.getBoundingClientRect().width;
      if (width > 0) {
        setUlWidth(Math.ceil(width));
        setReady(true);
      }
    };

    measure();
    document.fonts.ready.then(measure);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(node);
    navbarCleanupRef.current = () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      navbarCleanupRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [ready]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setCollapsed(scrollY > 20);

        if (heroImgRef.current) {
          heroImgRef.current.style.transform = `translateY(${scrollY * 0.25}px) scale(1.1)`;
        }

        ticking = false;
      });

      ticking = true;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use IntersectionObserver instead of per-scroll canvas sampling — much cheaper in Safari.
  useEffect(() => {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsLightBg(entry.intersectionRatio < 0.1),
      { threshold: [0, 0.1] },
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  const screenshots = useMemo(
    () => (game ? Object.values(game.screenshots).sort((a, b) => a.id - b.id) : []),
    [game],
  );
  const buyLinks = useMemo(() => (game ? Object.entries(game.buy) : []), [game]);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? null : (i + 1) % screenshots.length));
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? null : (i - 1 + screenshots.length) % screenshots.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, screenshots.length]);

  useEffect(() => {
    if (!trailerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setTrailerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [trailerOpen]);

  useEffect(() => {
    const locked = trailerOpen || lightboxIndex !== null;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [trailerOpen, lightboxIndex]);

  useEffect(() => {
    if (!localeOpen) return;
    const handler = (e: MouseEvent) => {
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) setLocaleOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [localeOpen]);

  useEffect(() => {
    if (!headerLocaleOpen) return;
    const handler = (e: MouseEvent) => {
      if (headerLocaleRef.current && !headerLocaleRef.current.contains(e.target as Node)) setHeaderLocaleOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [headerLocaleOpen]);

  // Close header locale as soon as navbar collapses
  useEffect(() => {
    if (collapsed) setHeaderLocaleOpen(false);
  }, [collapsed]);

  // Close both locale dropdowns when scrolled past 10px
  useEffect(() => {
    const handler = () => {
      if (window.scrollY > 10) {
        setLocaleOpen(false);
        setHeaderLocaleOpen(false);
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const onHero = !isLightBg;

  function localeAbbr(code: string): string {
    const lang = code.split('-')[0];
    const map: Record<string, string> = { en: 'ENG', uk: 'УКР', kk: 'ҚАЗ', ru: 'РУС' };
    return map[lang] ?? lang.toUpperCase();
  }

  // Non-LiquidGlass 3-state navbar pill styles
  const navbarFallbackBg = onHero
    ? 'rgba(255,255,255,0.18)'
    : !collapsed
      ? 'rgba(240,240,238,0.99)'   // static light — opaque gray
      : 'rgba(246,246,244,0.75)';  // scrolled light — translucent

  const navbarFallbackBorder = onHero
    ? '1px solid rgba(255,255,255,0.2)'
    : !collapsed
      ? '1px solid transparent'
      : '1px solid rgba(0,0,0,0.07)';

  const navbarFallbackBlur = onHero
    ? 'blur(12px)'
    : !collapsed
      ? 'blur(0px)'
      : 'blur(6px)';

  // Inset top-edge highlight (Watch Trailer style, hero only)
  const navbarFallbackInset = onHero
    ? '0 1px 0 rgba(255,255,255,0.35)'
    : 'none';

  // Outer mask drop shadow
  const navbarMaskShadow = onHero
    ? '0 4px 24px rgba(0,0,0,0.18)'
    : !collapsed
      ? 'none'
      : '0 2px 10px rgba(0,0,0,0.06)';

  // Reserved for dark theme:
  // const navbarDarkBg = 'rgba(10,10,10,0.45)';
  // const navbarDarkBorder = '1px solid rgba(255,255,255,0.12)';

  const navbarBg = LiquidGlassEnabled
    ? (isLightBg && !collapsed ? 'rgb(240,240,242)' : isLightBg ? 'rgba(255,255,255,0.75)' : 'transparent')
    : 'transparent';

  const navbarInner = (
    <div className="gap-2" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
      height: '60px', borderRadius: '99px', width: '100%',
      backgroundColor: navbarBg,
      transition: 'background-color 300ms ease',
    }}>
      <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out hover:bg-black/10">
        <IconHome size={20} color={isLightBg ? '#000' : '#fff'} />
      </div>
      <ul id="navbar" ref={navbarCallbackRef} className="flex h-full list-none items-center gap-2 px-2" style={{ color: isLightBg ? 'black' : 'white' }}>
        <li className="flex h-12 cursor-pointer items-center overflow-hidden rounded-full px-6 text-[16px] font-medium text-ellipsis transition-colors duration-200 ease-in-out hover:bg-black/10">News</li>
        <li className="flex h-12 cursor-pointer items-center overflow-hidden rounded-full px-6 text-[16px] font-medium text-ellipsis transition-colors duration-200 ease-in-out hover:bg-black/10">Games</li>
        <li className="flex h-12 cursor-pointer items-center overflow-hidden rounded-full px-6 text-[16px] font-medium text-ellipsis transition-colors duration-200 ease-in-out hover:bg-black/10">Books</li>
        <li className="flex h-12 cursor-pointer items-center overflow-hidden rounded-full px-6 text-[16px] font-medium text-ellipsis transition-colors duration-200 ease-in-out hover:bg-black/10">Fan Kit</li>
      </ul>
      <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out hover:bg-black/10">
        <IconSearch size={20} stroke={2.5} color={isLightBg ? '#000' : '#fff'} />
      </div>
    </div>
  );

  return (
    <>
      {/* Trailer modal */}
      {trailerOpen && game?.yt_link && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setTrailerOpen(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setTrailerOpen(false); }}
            style={{ position: 'absolute', top: 24, right: 28, background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 8 }}
            aria-label="Close trailer"
          >
            <IconX size={28} />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(1080px, 92vw)', aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden', background: '#000' }}
          >
            <iframe
              style={{ width: '100%', height: '100%', border: 'none' }}
              src={`https://www.youtube.com/embed/${game.yt_link}?autoplay=1&rel=0`}
              title={`${game.title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Lightbox — z-index выше шапки */}
      {lightboxIndex !== null && screenshots[lightboxIndex] && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
            style={{ position: 'absolute', top: 24, right: 28, background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 8 }}
            aria-label="Close"
          >
            <IconX size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i === null ? null : (i - 1 + screenshots.length) % screenshots.length)); }}
            style={{ position: 'absolute', left: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 16 }}
            aria-label="Previous"
          >
            <IconChevronLeft size={36} />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            <div style={{ position: 'relative', width: 'min(1200px, 90vw)', aspectRatio: '16/10', borderRadius: 16, overflow: 'hidden' }}>
              <Image
                src={screenshots[lightboxIndex].link}
                alt={screenshots[lightboxIndex].title}
                fill
                sizes="90vw"
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, letterSpacing: '0.06em' }}>
              {screenshots[lightboxIndex].title} &nbsp;·&nbsp; {lightboxIndex + 1} / {screenshots.length}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i === null ? null : (i + 1) % screenshots.length)); }}
            style={{ position: 'absolute', right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 16 }}
            aria-label="Next"
          >
            <IconChevronRight size={36} />
          </button>
        </div>
      )}

      <div>
        {/* ── HEADER ── */}
        <header
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            padding: '24px 0', width: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 100%)',
              opacity: collapsed ? 1 : 0, transition: 'opacity 400ms ease',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              transform: collapsed ? 'translateY(0)' : 'translateY(-100%)',
              transition: 'transform 200ms linear',
            }}>
              <BlurEffect position="top" intensity={50} className="!pointer-events-none h-full" />
            </div>
          </div>
          <div style={{
            position: 'relative', zIndex: 20, display: 'grid', overflow: 'visible',
            gridTemplateColumns: '200px 1fr 200px',
            gap: '20px',
            width: '100%', maxWidth: '1280px', alignItems: 'center', padding: '0 20px',
          }}>
            <div style={{
              fontSize: '16px', color: isLightBg ? '#000' : '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              transition: 'color 300ms ease, opacity 400ms cubic-bezier(.47,1.64,.41,.8), transform 400ms cubic-bezier(.47,1.64,.41,.8)',
              opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(20px)' : 'translateX(0)',
            }}>
              <NdLogo style={{ height: '28px', width: 'auto' }} />
            </div>
            <div className="mask" style={{
              position: 'relative',
              width: ready ? (collapsed ? `${ulWidth + 124}px` : `${ulWidth - 4}px`) : 'auto',
              height: '60px', borderRadius: '99px', overflow: 'hidden', margin: '0 auto',
              opacity: visible ? 1 : 0,
              transition: ready ? 'width 400ms cubic-bezier(.47,1.64,.41,.8), opacity 300ms ease' : 'none',
              outline: LiquidGlassEnabled ? 'none' : '1px solid rgba(255,255,255,.35)',
              outlineOffset: '0px',
              boxShadow: navbarMaskShadow,
            }}>
              {LiquidGlassEnabled ? (
                <LiquidGlass glassStyle={glassStyle} style={`position: absolute; gap: 12px; width: ${ulWidth + 146}px; height: 60px; left: 50%; top: 0; transform: translateX(-50%); margin: 0; padding: 0`}>
                  {navbarInner}
                </LiquidGlass>
              ) : (
                <div style={{
                  position: 'absolute', width: `${ulWidth + 146}px`, height: '60px',
                  left: '50%', top: 0, transform: 'translateX(-50%)',
                  borderRadius: 99,
                  backdropFilter: navbarFallbackBlur, WebkitBackdropFilter: navbarFallbackBlur,
                  background: navbarFallbackBg,
                  // border: navbarFallbackBorder,
                  // boxShadow: navbarFallbackInset,
                  transition: 'background 300ms ease, border-color 300ms ease, box-shadow 300ms ease',
                  display: 'flex', alignItems: 'center',
                }}>
                  {navbarInner}
                </div>
              )}
            </div>
            <div style={{
              position: 'relative', overflow: 'visible',
              transition: 'opacity 400ms cubic-bezier(.47,1.64,.41,.8), transform 400ms cubic-bezier(.47,1.64,.41,.8)',
              opacity: collapsed ? 0 : 1, transform: collapsed ? 'translateX(-20px)' : 'translateX(0)',
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12,
              pointerEvents: collapsed ? 'none' : 'auto',
            }}>
              {/* Header locale picker */}
              <div ref={headerLocaleRef} style={{ position: 'relative' }} className="flex h-12 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out hover:bg-black/10">
                <button
                  onClick={() => setHeaderLocaleOpen((v) => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    height: 40, borderRadius: 99, padding: '0 14px 0 10px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: isLightBg ? '#000' : '#fff',
                    transition: 'background 150ms ease',
                  }}
                  
                  aria-label="Select language"
                >
                  <IconWorld size={18} stroke={2} />
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', lineHeight: 1 }}>{localeAbbr(selectedLocale.code)}</span>
                  <IconChevronDown
                    size={14} stroke={2.5}
                    style={{ transform: headerLocaleOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease', opacity: 0.5 }}
                  />
                </button>
                <div style={{
                    position: 'fixed',
                    top: 76,
                    right: 20,
                    backdropFilter: 'blur(28px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                    background: 'rgba(255,255,255,0.72)',
                    borderRadius: 18,
                    border: '1px solid rgba(255,255,255,0.55)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
                    padding: '8px', minWidth: 220, zIndex: 300,
                    opacity: headerLocaleOpen ? 1 : 0,
                    transform: headerLocaleOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
                    pointerEvents: headerLocaleOpen ? 'auto' : 'none',
                    transition: 'opacity 160ms ease, transform 160ms ease',
                    transformOrigin: 'top right',
                  }}>
                  {LOCALE_OPTIONS.map((opt) => (
                    <div key={opt.region}>
                      <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#999', padding: '8px 12px 4px', fontWeight: 600 }}>{opt.region}</div>
                      {opt.langs.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setSelectedLocale({ region: opt.region, lang: lang.label, code: lang.code }); setHeaderLocaleOpen(false); }}
                          className="w-full cursor-pointer rounded-[10px] transition-colors duration-100 hover:bg-black/5"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '9px 12px',
                            background: selectedLocale.code === lang.code ? 'rgba(0,0,0,0.08)' : 'transparent',
                            border: 'none', textAlign: 'left',
                          }}
                        >
                          <span style={{ fontSize: 13, color: '#111', fontWeight: selectedLocale.code === lang.code ? 600 : 400 }}>{lang.label}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginLeft: 16 }}>{localeAbbr(lang.code)}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              {/* <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out hover:bg-black/10">
                <IconBell size={20} stroke={2.5} color={isLightBg ? '#000' : '#fff'} />
              </div> */}
              {/* <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out hover:bg-black/10">
                <IconUser size={20} stroke={2.5} color={isLightBg ? '#000' : '#fff'} />
              </div> */}
              <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out hover:bg-black/10">
                <IconSearch size={20} stroke={2.5} color={isLightBg ? '#000' : '#fff'} />
              </div>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section id="hero" style={{ position: 'relative', width: 'calc(100vw - 16px)', aspectRatio: 2 / 1, margin: 8, borderRadius: 40, boxSizing: 'border-box', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10, padding: 20, gap: 20 }}>
            <Image src="/key-logo.png" alt="Key Logo" width={768} height={300} />
            <div className="buttons" style={{ display: 'flex', flexDirection: 'row', gap: 24, zIndex: 2 }}>
              <a
                href="#buy"
                style={{
                  backgroundColor: 'rgb(255,255,255)', padding: '12px 24px', borderRadius: 99,
                  fontWeight: 500, color: '#000', cursor: 'pointer', transition: 'background-color 200ms ease',
                  textDecoration: 'none', display: 'inline-block',
                }}
              >
                Where to Buy?
              </a>
              <button
                onClick={() => setTrailerOpen(true)}
                style={{
                  position: 'relative', inset: 0, zIndex: 1, borderRadius: 99,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                  transition: 'background 200ms ease, border-color 200ms ease',
                  padding: '12px 24px 12px 20px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', gap: 4,
                  color: '#fff', fontWeight: 500,
                }}
              >
                <IconPlayerPlay size={16} stroke={2.5} fill="#fff" style={{ marginRight: 8, display: 'inline-block' }} />
                Watch Trailer
              </button>
            </div>
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/75">
              <span className="text-xs tracking-widest uppercase">Scroll Down</span>
              <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/50 p-1.5">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
              </div>
            </div>
          </div>
          <img
            ref={heroImgRef}
            src={`${basePath}/hero.png`}
            alt="Hero Image"
            crossOrigin="anonymous"
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              objectFit: 'cover', transform: 'translateY(0) scale(1.1)', willChange: 'transform',
            }}
          />
        </section>

        {/* ── CONTENT ── */}
        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 40px 48px' }}>

          {error && (
            <p style={{ color: '#c00', fontSize: 15, padding: '40px 0' }}>{error}</p>
          )}

          {game && (
            <>
              {/* ── 1. SLOGAN + STORY (как на скриншоте) ── */}
              <section style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px 80px',
                paddingBottom: 80, borderBottom: '1px solid rgba(0,0,0,0.08)',
              }}>
                <h2 style={{
                  fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 700,
                  lineHeight: 1.18, letterSpacing: '-0.03em', color: '#111',
                  margin: 0,
                }}>
                  {game.slogan}
                </h2>
                <div
                  className="story-prose"
                  style={{ fontSize: 16, lineHeight: 1.8, color: '#444', margin: 0 }}
                  dangerouslySetInnerHTML={{ __html: game.story }}
                />
              </section>

              {/* ── 2. META ROW ── */}
              <section style={{
                display: 'flex', alignItems: 'stretch', padding: '48px 0',
                borderBottom: '1px solid rgba(0,0,0,0.08)', flexWrap: 'wrap',
              }}>
                {/* Ordinal */}
                {game.ordinal != null && (
                  <>
                    <div style={{ paddingRight: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#bbb', marginBottom: 4 }}>In Series</div>
                      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#111', lineHeight: 1 }}>#{game.ordinal}</div>
                    </div>
                    <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', marginRight: 40, alignSelf: 'stretch', flexShrink: 0 }} />
                  </>
                )}

                {/* Series */}
                <div style={{ paddingRight: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#bbb' }}>Series</div>
                  <div style={{ fontSize: 19, fontWeight: 600, color: '#111' }}>{game.series_title}</div>
                </div>
                <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', marginRight: 40, alignSelf: 'stretch', flexShrink: 0 }} />

                {/* Release */}
                <div style={{ paddingRight: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#bbb' }}>Release</div>
                  <div style={{ fontSize: 19, fontWeight: 600, color: '#111' }}>{formatDate(game.date)}</div>
                </div>
                <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', marginRight: 40, alignSelf: 'stretch', flexShrink: 0 }} />

                {/* Age Rating */}
                <div style={{ paddingRight: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#bbb' }}>Rating</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(0,0,0,0.2)', borderRadius: 6,
                    padding: '4px 10px', fontSize: 13, fontWeight: 800,
                    color: '#111', letterSpacing: '0.06em', lineHeight: 1.2,
                    alignSelf: 'flex-start',
                  }}>
                    {ageLabel(game.age)}
                  </div>
                </div>
                <div style={{ width: 1, background: 'rgba(0,0,0,0.07)', marginRight: 40, alignSelf: 'stretch', flexShrink: 0 }} />

                {/* Availability */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#bbb' }}>Status</div>
                  <div style={{ fontSize: 19, fontWeight: 600, color: '#111' }}>
                    {game.is_selling ? 'Available now' : 'Not Available'}
                  </div>
                </div>
              </section>

              {/* ── 3. TRAILER ── */}
              {game.yt_link && (
                <section style={{ padding: '64px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#999', marginBottom: 24 }}>Trailer</p>
                  <button
                    onClick={() => setTrailerOpen(true)}
                    aria-label="Watch trailer"
                    style={{
                      position: 'relative', display: 'block', width: '100%',
                      aspectRatio: '16/9', borderRadius: 20, overflow: 'hidden',
                      border: 'none', padding: 0, cursor: 'pointer', background: '#111',
                    }}
                  >
                    {/* YouTube thumbnail */}
                    <img
                      src={`https://img.youtube.com/vi/${game.yt_link}/maxresdefault.jpg`}
                      alt={`${game.title} trailer thumbnail`}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    />
                    {/* Dark scrim */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
                    {/* Play button */}
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.92)',
                        boxShadow: '0 4px 32px rgba(0,0,0,0.32)',
                      }}>
                        <IconPlayerPlay size={28} stroke={2} fill="#111" color="#111" style={{ marginLeft: 4 }} />
                      </div>
                    </div>
                  </button>
                </section>
              )}

              {/* ── 4. FEATURES + REQUIREMENTS ── */}
              <section style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px 80px',
                padding: '64px 0', borderBottom: '1px solid rgba(0,0,0,0.08)',
              }}>
                <div>
                  <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#999', marginBottom: 24 }}>Features</p>
                  <div className="api-features" dangerouslySetInnerHTML={{ __html: game.features }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#999', marginBottom: 24 }}>System Requirements</p>
                  <div className="api-reqs" dangerouslySetInnerHTML={{ __html: game.requirements }} />
                </div>
              </section>

              {/* ── 5. SCREENSHOTS ── */}
              <section style={{ padding: '64px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#999', marginBottom: 32 }}>
                  Screenshots &nbsp;·&nbsp; {screenshots.length}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {screenshots.map((shot, idx) => (
                    <button
                      key={shot.id}
                      onClick={() => setLightboxIndex(idx)}
                      style={{
                        position: 'relative', aspectRatio: '16/10', borderRadius: 14,
                        overflow: 'hidden', border: 'none', padding: 0, cursor: 'zoom-in',
                        background: '#e0e0dc',
                      }}
                      aria-label={`Open screenshot: ${shot.title}`}
                    >
                      <Image
                        src={shot.link}
                        alt={shot.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover', transition: 'transform 400ms ease' }}
                        className="hover:scale-[1.04]"
                      />
                      <span style={{
                        position: 'absolute', bottom: 10, left: 12,
                        fontSize: 12, color: '#fff', fontWeight: 500,
                        textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                      }}>{shot.title}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* ── 6. BUY ── */}
              <section id="buy" style={{ padding: '64px 0' }}>
                <div style={{
                  background: '#fff', borderRadius: 24, padding: '48px',
                  border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 20px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ marginBottom: 36 }}>
                    <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 8px' }}>Where to Buy</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.025em' }}>Get {game.title}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                    {/* HeR Interactive */}
                    <a
                      href={game.link_her}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{

                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        background: '#111', borderRadius: 16, padding: '24px',
                        textDecoration: 'none', minHeight: 148,
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', margin: '0 0 10px' }}>Developer</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>HeR Interactive</p>
                      </div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '28px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                        <span>Buy direct</span><span>↗</span>
                      </p>
                    </a>

                    {/* Steam — primary dark card */}
                    <a
                      href={game.link_steam}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        background: 'transparent', border: '1.5px solid rgba(0,0,0,0.1)',
                        borderRadius: 16, padding: '24px', textDecoration: 'none', minHeight: 148,
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 10px' }}>PC · Mac</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Steam</p>
                      </div>
                      <p style={{ fontSize: 13, color: '#aaa', margin: '28px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Buy on Steam</span><span>↗</span>
                      </p>
                    </a>

                  </div>
                </div>
              </section>
            </>
          )}

          {/* ── BREADCRUMBS ── */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '48px 0 0', flexWrap: 'wrap' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#777', textDecoration: 'none', fontSize: 14 }}>
              <IconHome size={14} stroke={2} />
              Home
            </Link>
            <IconChevronRight size={14} color="#ccc" />
            <a href="#" style={{ color: '#777', textDecoration: 'none', fontSize: 14 }}>Games</a>
            <IconChevronRight size={14} color="#ccc" />
            <a href="#" style={{ color: '#777', textDecoration: 'none', fontSize: 14 }}>Mystery Adventures</a>
            <IconChevronRight size={14} color="#ccc" />
            <span style={{ color: '#111', fontSize: 14, fontWeight: 500 }}>Mystery of the Seven Keys</span>
          </nav>
        </main>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 40px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: 60, paddingBottom: 48, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>

              {/* Brand */}
              <div>
                <NdLogo style={{ height: '32px', width: 'auto', color: '#111', display: 'block', margin: '0 0 14px' }} />
                <p style={{ fontSize: 14, lineHeight: 1.75, color: '#666', margin: '0 0 28px', maxWidth: 300 }}>
                  Explore Nancy Drew&apos;s thrilling adventures across games, books, TV shows, and movies on this website.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { icon: <IconBrandFacebook size={20} />, label: 'Facebook' },
                    { icon: <IconBrandYoutube size={20} />, label: 'YouTube' },
                    { icon: <IconBrandInstagram size={20} stroke={2} />, label: 'Instagram' },
                    { icon: <IconBrandTwitter size={20} />, label: 'Twitter' },
                  ].map(({ icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 99, background: '#f2f2f0', color: '#444', textDecoration: 'none' }}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 20px' }}>Navigation</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                  {['Discover', 'Games', 'News', 'Books', 'Fan Kit', 'Help'].map((item) => (
                    <a key={item} href="#" style={{ fontSize: 14, color: '#666', textDecoration: 'none' }}>{item}</a>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 20px' }}>Language &amp; Region</p>
                <div ref={localeRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setLocaleOpen((v) => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '11px 14px', borderRadius: 10,
                      border: '1.5px solid rgba(0,0,0,0.12)',
                      background: '#fff', fontSize: 14, color: '#111',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ flex: 1 }}>{selectedLocale.lang} — {selectedLocale.region}</span>
                    <IconChevronDown
                      size={14}
                      style={{ flexShrink: 0, transform: localeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
                    />
                  </button>
                  <div style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
                    background: '#fff', borderRadius: 14,
                    border: '1.5px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    padding: '8px', zIndex: 20,
                    opacity: localeOpen ? 1 : 0,
                    transform: localeOpen ? 'translateY(0)' : 'translateY(6px)',
                    pointerEvents: localeOpen ? 'auto' : 'none',
                    transition: 'opacity 160ms ease, transform 160ms ease',
                    transformOrigin: 'bottom center',
                  }}>
                    {LOCALE_OPTIONS.map((opt) => (
                      <div key={opt.region}>
                        <div style={{
                          fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                          color: '#999', fontWeight: 600, padding: '8px 12px 4px',
                        }}>{opt.region}</div>
                        {opt.langs.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => { setSelectedLocale({ region: opt.region, lang: lang.label, code: lang.code }); setLocaleOpen(false); }}
                            className="w-full cursor-pointer rounded-[10px] transition-colors duration-100 hover:bg-black/5"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '9px 12px',
                              background: selectedLocale.code === lang.code ? 'rgba(0,0,0,0.06)' : 'transparent',
                              border: 'none', textAlign: 'left',
                            }}
                          >
                            <span style={{ fontSize: 13, color: '#111', fontWeight: selectedLocale.code === lang.code ? 600 : 400 }}>{lang.label}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginLeft: 16 }}>{localeAbbr(lang.code)}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#aaa', lineHeight: 1.8, margin: '32px 0 0' }}>
              Copyright &copy; 2011&ndash;{new Date().getFullYear()} Mike Lucyšyn and Nancy Drew Hub. HER INTERACTIVE, DARE TO PLAY, DOSSIER, CODES &amp; CLUES, and H! KIDS are trademarks of HeR Interactive, Inc. NANCY DREW is a registered trademark of Simon &amp; Schuster, Inc. and is used under license. Copyright in the NANCY DREW books and characters are owned by Simon &amp; Schuster, Inc. All rights reserved. Other brand or product names are trademarks or registered trademarks of their respective holders.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
