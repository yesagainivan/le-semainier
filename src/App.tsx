import { useWeek } from '@/lib/useWeek';
import { WeekGrid } from './components/week/WeekGrid';
import { ExpandedDay } from './components/week/ExpandedDay';
import { WeeklySection } from './components/week/WeeklySection';
import { format, isSameMonth, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useRef, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { exportJSON, importJSON, exportMarkdown, exportICS, importICS } from '@/lib/exportImport';
import { Database, Download, Upload, Calendar } from 'lucide-react';

// ── Font options ─────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  { id: 'spectral', family: "'Spectral', Georgia, serif", label: 'Spectral' },
  { id: 'dm-sans', family: "'DM Sans', system-ui, sans-serif", label: 'DM Sans' },
  { id: 'lora', family: "'Lora', Georgia, serif", label: 'Lora' },
] as const;

type FontId = typeof FONT_OPTIONS[number]['id'];

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { currentWeekStart, nextWeek, prevWeek, jumpToToday } = useWeek();

  const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
  const endOfWeek = addDays(currentWeekStart, 6);

  let weekLabel = '';
  if (isSameMonth(currentWeekStart, endOfWeek)) {
    weekLabel = `${format(currentWeekStart, 'd')}–${format(endOfWeek, 'd MMMM yyyy', { locale: fr })}`;
  } else {
    weekLabel = `${format(currentWeekStart, 'd MMM', { locale: fr })} – ${format(endOfWeek, 'd MMM yyyy', { locale: fr })}`;
  }

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeFont, setActiveFont] = useState<FontId>('spectral');

  const pickerRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const dataMenuRef = useRef<HTMLDivElement>(null);
  const dataBtnRef = useRef<HTMLButtonElement>(null);

  // ── Load persisted settings on mount ─────────────────────────────────────
  useEffect(() => {
    void (async () => {
      const [accentSetting, fontSetting, darkSetting] = await Promise.all([
        db.settings.get('accent-color'),
        db.settings.get('font-body'),
        db.settings.get('dark-mode'),
      ]);

      if (accentSetting?.value && typeof accentSetting.value === 'string') {
        document.documentElement.style.setProperty('--terracotta', accentSetting.value);
      }

      const savedFont = fontSetting?.value as FontId | undefined;
      if (savedFont) {
        const opt = FONT_OPTIONS.find(f => f.id === savedFont);
        if (opt) {
          document.documentElement.style.setProperty('--font-body', opt.family);
          setActiveFont(savedFont);
        }
      }

      if (darkSetting?.value === true) {
        document.documentElement.setAttribute('data-theme', 'dark');
        setIsDark(true);
      }
    })();
  }, []);

  // ── Click-outside to close panels ─────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current && !pickerRef.current.contains(event.target as Node) &&
        fabRef.current && !fabRef.current.contains(event.target as Node)
      ) {
        setIsPickerVisible(false);
      }
      if (
        dataMenuRef.current && !dataMenuRef.current.contains(event.target as Node) &&
        dataBtnRef.current && !dataBtnRef.current.contains(event.target as Node)
      ) {
        setIsDataMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const changeAccent = useCallback((color: string) => {
    document.documentElement.style.setProperty('--terracotta', color);
    void db.settings.put({ key: 'accent-color', value: color });
    setIsPickerVisible(false);
  }, []);

  const changeFont = useCallback((font: typeof FONT_OPTIONS[number]) => {
    document.documentElement.style.setProperty('--font-body', font.family);
    void db.settings.put({ key: 'font-body', value: font.id });
    setActiveFont(font.id);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      void db.settings.put({ key: 'dark-mode', value: next });
      return next;
    });
  }, []);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const promise = file.name.endsWith('.ics') ? importICS(file) : importJSON(file);

    void promise.then(({ imported }) => {
      alert(`Import reussi : ${String(imported)} element(s) importe(s).`);
      setIsDataMenuOpen(false);
    }).catch((err: unknown) => {
      alert(err instanceof Error ? err.message : "Erreur lors de l'import.");
    });

    e.target.value = '';
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      <header>
        <div className="wordmark">
          <span className="wordmark-title">Le Semainier</span>
          <span className="wordmark-rule"></span>
          <span className="wordmark-sub">Agenda hebdomadaire</span>
        </div>
        <div className="header-right">
          <div className="week-nav">
            <button className="nav-btn" onClick={prevWeek} aria-label="Semaine précédente">&#8592;</button>
            <span className="week-label">{weekLabel}</span>
            <button className="nav-btn" onClick={nextWeek} aria-label="Semaine suivante">&#8594;</button>
          </div>
          <div className="header-actions">
            <button className="today-btn" onClick={jumpToToday} aria-label="Aujourd'hui" title="Aujourd'hui">
              <span className="today-text">Aujourd'hui</span>
              <Calendar className="today-icon" size={16} strokeWidth={2} />
            </button>
            <div className="data-menu-container">
              <button
                ref={dataBtnRef}
                className={`data-menu-btn ${isDataMenuOpen ? 'active' : ''}`}
                onClick={() => { setIsDataMenuOpen(!isDataMenuOpen); }}
                aria-label="Données"
                title="Options de données"
              >
                <Database size={20} strokeWidth={1.5} />
              </button>
              <div ref={dataMenuRef} className={`data-menu ${isDataMenuOpen ? 'visible' : ''}`}>
                <div className="data-menu-section">
                  <div className="data-menu-label">Exporter</div>
                  <button className="data-menu-item" onClick={() => { void exportJSON(); setIsDataMenuOpen(false); }}>
                    <Download size={16} /> Complet (JSON)
                  </button>
                  <button className="data-menu-item" onClick={() => { void exportMarkdown(currentWeekStart); setIsDataMenuOpen(false); }}>
                    <Download size={16} /> Semaine (Markdown)
                  </button>
                  <button className="data-menu-item" onClick={() => { void exportICS(currentWeekStart); setIsDataMenuOpen(false); }}>
                    <Download size={16} /> Semaine (ICS)
                  </button>
                </div>
                <div className="data-menu-divider"></div>
                <div className="data-menu-section">
                  <div className="data-menu-label">Importer</div>
                  <button className="data-menu-item" onClick={() => { importInputRef.current?.click(); }}>
                    <Upload size={16} /> Fichier JSON ou ICS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="week-strip">
        <WeekGrid />
      </div>

      <WeeklySection weekStartStr={weekStartStr} />

      <footer>
        <span className="footer-quote">&#171; La semaine est un cadeau. Planifiez-la avec soin. &#187;</span>
        <div className="footer-actions">
          <input
            ref={importInputRef}
            type="file"
            accept=".json,.ics"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
      </footer>

      <ExpandedDay />

      {/* ── Settings FAB ────────────────────────────────────────────── */}
      <div
        ref={fabRef}
        className="settings-hint"
        onClick={() => { setIsPickerVisible(!isPickerVisible); }}
        aria-label="Personnaliser"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </div>

      {/* ── Settings panel ──────────────────────────────────────────── */}
      <div ref={pickerRef} className={`accent-picker ${isPickerVisible ? 'visible' : ''}`}>
        {/* Accent colour */}
        <div className="accent-label">Couleur d'accent</div>
        <div className="accent-swatches">
          <div className="swatch" onClick={() => { changeAccent('#B85C38'); }} style={{ background: '#B85C38' }} title="Terracotta"></div>
          <div className="swatch" onClick={() => { changeAccent('#6B7F6A'); }} style={{ background: '#6B7F6A' }} title="Sauge"></div>
          <div className="swatch" onClick={() => { changeAccent('#7B6FA0'); }} style={{ background: '#7B6FA0' }} title="Lavande"></div>
          <div className="swatch" onClick={() => { changeAccent('#4A7A8A'); }} style={{ background: '#4A7A8A' }} title="Marine"></div>
          <div className="swatch" onClick={() => { changeAccent('#8A6A3A'); }} style={{ background: '#8A6A3A' }} title="Ocre"></div>
        </div>

        {/* Font picker */}
        <div className="font-picker">
          <div className="accent-label">Police de lecture</div>
          <div className="font-swatches">
            {FONT_OPTIONS.map(font => (
              <div
                key={font.id}
                className={`font-swatch ${activeFont === font.id ? 'active' : ''}`}
                style={{ fontFamily: font.family }}
                onClick={() => { changeFont(font); }}
                title={font.label}
                aria-label={font.label}
              >
                LS
              </div>
            ))}
          </div>
        </div>

        {/* Dark mode toggle */}
        <div className="dark-mode-toggle">
          <span className="dark-mode-label">Mode sombre</span>
          <button
            className={`toggle-pill ${isDark ? 'on' : ''}`}
            onClick={toggleDarkMode}
            aria-label="Activer le mode sombre"
            aria-pressed={isDark}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>
    </div>
  );
}
