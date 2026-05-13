import { cn } from "@/lib/utils"

export type TimerStatus = 'idle' | 'running' | 'paused' | 'overtime'

interface TimerDisplayProps {
  className?: string
  isPreview?: boolean
  time?: string
  status?: TimerStatus
  title?: string 
  nextTitle?: string
  playlist?: Array<{ id: string; title: string }>
  activeIndex?: number
}

export const TimerDisplay = ({ 
  className, 
  isPreview = false, 
  time = "00:00", 
  status = 'idle',
  title,
  nextTitle,
  playlist = [],
  activeIndex = -1,
}: TimerDisplayProps) => {
  
  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'text-white'
      case 'paused': return 'text-slate-300'
      case 'overtime': return 'text-red-400 animate-pulse'
      default: return 'text-slate-300'
    }
  }

  return (
    <div className={cn("relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-slate-950 transition-colors", className)}>
      {title && (
        <div className={cn(
          "absolute left-1/2 max-w-[86%] -translate-x-1/2 truncate text-center font-medium uppercase text-slate-300",
          isPreview ? "top-4 text-xs tracking-[0.16em]" : "top-12 text-[1.8vw] tracking-[0.22em]"
        )}>
          {title}
        </div>
      )}

      {nextTitle && (
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 px-6 py-4 text-center",
          isPreview ? "bottom-3 px-3 py-2" : "bottom-14"
        )}>
          <p className={cn(
            "uppercase tracking-[0.2em] text-slate-500",
            isPreview ? "text-[10px]" : "text-[1.1vw]"
          )}>
            Próximo
          </p>
          <p className={cn(
            "mt-2 font-semibold text-white",
            isPreview ? "text-sm" : "text-[2vw]"
          )}>
            {nextTitle}
          </p>
        </div>
      )}

      {playlist.length > 0 ? (
        <div
          className={cn(
            "absolute left-1/2 flex max-w-[92%] -translate-x-1/2 items-center justify-center gap-2 overflow-hidden",
            isPreview ? "bottom-16" : "bottom-44"
          )}
        >
          {playlist.map((item, index) => {
            const isCurrent = index === activeIndex
            const isCompleted = activeIndex > -1 && index < activeIndex

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-full border px-3 py-2 text-center uppercase transition-all",
                  isPreview ? "min-w-0 max-w-20 px-2 py-1" : "min-w-24 max-w-40",
                  isCurrent
                    ? "border-white bg-white text-slate-950"
                    : isCompleted
                      ? "border-slate-500 bg-transparent text-slate-300"
                      : "border-white/10 bg-transparent text-slate-500"
                )}
              >
                <p
                  className={cn(
                    "truncate font-semibold tracking-[0.18em]",
                    isPreview ? "text-[9px]" : "text-[0.9vw]"
                  )}
                >
                  {item.title}
                </p>
              </div>
            )
          })}
        </div>
      ) : null}

      <h1 className={cn(
        "relative font-mono font-semibold tabular-nums leading-none tracking-tight transition-colors duration-300", 
        getStatusColor(),
        isPreview ? "text-6xl" : "text-[24vw]"
      )}>
        {time}
      </h1>
    </div>
  )
}
