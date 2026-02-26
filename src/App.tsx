import { useWeek } from '@/lib/useWeek';
import { WeekGrid } from './components/week/WeekGrid'
import { ExpandedDay } from './components/week/ExpandedDay'
import { format, isSameMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState, useRef, useEffect } from 'react'
import { db } from '@/lib/db'
import { exportJSON, importJSON, exportMarkdown, exportICS } from '@/lib/exportImport'

export default function App() {
  const { currentWeekStart, nextWeek, prevWeek, jumpToToday } = useWeek()

  const endOfWeek = new Date(currentWeekStart)
  endOfWeek.setDate(endOfWeek.getDate() + 6)

  let weekLabel = ''
  if (isSameMonth(currentWeekStart, endOfWeek)) {
    weekLabel = `${format(currentWeekStart, 'd')}–${format(endOfWeek, 'd MMMM yyyy', { locale: fr })}`
  } else {
    weekLabel = `${format(currentWeekStart, 'd MMM', { locale: fr })} – ${format(endOfWeek, 'd MMM yyyy', { locale: fr })}`
  }

  const [isPickerVisible, setIsPickerVisible] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLDivElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current && !pickerRef.current.contains(event.target as Node) &&
        fabRef.current && !fabRef.current.contains(event.target as Node)
      ) {
        setIsPickerVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => { document.removeEventListener('mousedown', handleClickOutside); }
  }, [])

  // Load persisted accent color on mount
  useEffect(() => {
    void db.settings.get('accent-color').then((setting) => {
      if (setting?.value && typeof setting.value === 'string') {
        document.documentElement.style.setProperty('--terracotta', setting.value);
      }
    });
  }, []);

  const changeAccent = (color: string) => {
    document.documentElement.style.setProperty('--terracotta', color);
    void db.settings.put({ key: 'accent-color', value: color });
    setIsPickerVisible(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void importJSON(file).then(({ imported }) => {
      alert(`Import reussi : ${String(imported)} element(s) importe(s).`);
    }).catch((err: unknown) => {
      alert(err instanceof Error ? err.message : "Erreur lors de l'import.");
    });
    // Reset so the same file can be re-imported if needed
    e.target.value = '';
  };

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
          <button className="today-btn" onClick={jumpToToday}>Aujourd'hui</button>
        </div>
      </header>

      <div className="week-strip">
        <WeekGrid />
      </div>

      <footer>
        <span className="footer-quote">&#171; La semaine est un cadeau. Planifiez-la avec soin. &#187;</span>
        <div className="footer-actions">
          <button className="footer-btn" onClick={() => { void exportJSON(); }}>Exporter JSON</button>
          <button className="footer-btn" onClick={() => { void exportMarkdown(currentWeekStart); }}>Exporter Markdown</button>
          <button className="footer-btn" onClick={() => { void exportICS(currentWeekStart); }}>Exporter ICS</button>
          <button className="footer-btn" onClick={() => { importInputRef.current?.click(); }}>Importer</button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
      </footer>

      <ExpandedDay />

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

      <div ref={pickerRef} className={`accent-picker ${isPickerVisible ? 'visible' : ''}`}>
        <div className="accent-label">Couleur d'accent</div>
        <div className="accent-swatches">
          <div className="swatch" onClick={() => { changeAccent('#B85C38'); }} style={{ background: '#B85C38' }} title="Terracotta"></div>
          <div className="swatch" onClick={() => { changeAccent('#6B7F6A'); }} style={{ background: '#6B7F6A' }} title="Sauge"></div>
          <div className="swatch" onClick={() => { changeAccent('#7B6FA0'); }} style={{ background: '#7B6FA0' }} title="Lavande"></div>
          <div className="swatch" onClick={() => { changeAccent('#4A7A8A'); }} style={{ background: '#4A7A8A' }} title="Marine"></div>
          <div className="swatch" onClick={() => { changeAccent('#8A6A3A'); }} style={{ background: '#8A6A3A' }} title="Ocre"></div>
        </div>
      </div>
    </div>
  )
}
