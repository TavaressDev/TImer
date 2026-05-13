export type TimerStatus = "idle" | "running" | "paused" | "overtime";
export type TransitionMode = "manual" | "automatic";
export type PlaylistItemType =
    | "louvor"
    | "palavra"
    | "oferta"
    | "aviso"
    | "encerramento";

export interface PlaylistItem {
    id: string;
    title: string;
    duration: number;
    type: PlaylistItemType;
}

export interface ServiceState {
    timeFormatted: string;
    secondsRemaining: number;
    status: TimerStatus;
    title: string;
    playlist: PlaylistItem[];
    activeIndex: number;
    transitionMode: TransitionMode;
    isPlaylistRunning: boolean;
    currentItemId?: string;
}

export interface ServerToClientEvents {
    "timer:update": (state: ServiceState) => void;
}

export interface ClientToServerEvents {
    "admin:start": (data: { minutes: number; title: string }) => void;
    "admin:pause": () => void;
    "admin:resume": () => void;
    "admin:stop": () => void;
    "admin:select_item": (index: number) => void;
}
