import { useWeek } from './lib/week-context'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { WeekGrid } from './components/week/WeekGrid'
import { ExpandedDay } from './components/week/ExpandedDay'

function App() {
  const { currentWeekStart, nextWeek, prevWeek, jumpToToday } = useWeek()

  // Example formatting: "Février 2026"
  const monthLabel = format(currentWeekStart, 'MMMM yyyy', { locale: fr })

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2 text-primary">
          <CalendarIcon className="w-5 h-5" />
          <h1 className="text-xl font-heading font-bold tracking-tight">Le Semainier</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium capitalize text-muted-foreground mr-4">
            {monthLabel}
          </span>
          <div className="flex items-center rounded-md border border-border/50 overflow-hidden bg-card shadow-sm">
            <button
              onClick={prevWeek}
              className="p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground active:bg-muted/80"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border/50" />
            <button
              onClick={jumpToToday}
              className="px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground active:bg-muted/80"
            >
              Aujourd'hui
            </button>
            <div className="w-px h-4 bg-border/50" />
            <button
              onClick={nextWeek}
              className="p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground active:bg-muted/80"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10 flex-1 flex flex-col">
        <WeekGrid />
      </main>

      <ExpandedDay />
    </div>
  )
}

export default App
