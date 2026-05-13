import { createContext } from "react"

export type TimerStatus = "idle" | "running" | "paused" | "overtime"
export type TransitionMode = "manual" | "automatic"
export type PlaylistItemType =
  | "louvor"
  | "palavra"
  | "oferta"
  | "aviso"
  | "encerramento"

export interface TimerState {
  timeFormatted: string
  status: TimerStatus
  title: string
  secondsRemaining: number
}

export interface PlaylistItem {
  id: string
  title: string
  duration: number
  type: PlaylistItemType
}

export interface TimerContextType extends TimerState {
  loginAdmin: (password: string) => Promise<{
    ok: boolean
    reason?: "disconnected" | "timeout" | "invalid"
  }>
  startTimer: (minutes: number, title: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  isConnected: boolean
  playlist: PlaylistItem[]
  activeIndex: number
  transitionMode: TransitionMode
  isPlaylistRunning: boolean
  selectItem: (index: number) => void
  addPlaylistItem: (item: PlaylistItem) => void
  updatePlaylistItem: (
    id: string,
    updates: Partial<Omit<PlaylistItem, "id">>
  ) => void
  removePlaylistItem: (id: string) => void
  movePlaylistItem: (fromIndex: number, toIndex: number) => void
  setTransitionMode: (mode: TransitionMode) => void
  playPlaylist: () => void
  nextItem: () => void
  previousItem: () => void
  playCurrentItem: () => void
}

export const TimerContext = createContext<TimerContextType>(
  {} as TimerContextType
)
