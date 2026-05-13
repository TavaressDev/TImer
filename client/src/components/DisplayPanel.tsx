import { useTimer } from '@/context/useTimer'
import { TimerDisplay } from './TimerDisplay'

export const DisplayPanel = () => {
    const { timeFormatted, status, title, playlist, activeIndex } = useTimer()
    const nextItem = activeIndex >= 0 ? playlist[activeIndex + 1] : undefined
  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-slate-950">
        <TimerDisplay
            isPreview={false}
            time={timeFormatted}
            status={status}
            title={title}
            nextTitle={nextItem?.title}
            playlist={playlist}
            activeIndex={activeIndex}
        />
    </div>
  )
}
