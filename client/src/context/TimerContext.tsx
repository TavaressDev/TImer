import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import {
  TimerContext,
  type PlaylistItem,
  type TimerState,
  type TransitionMode,
} from "./timer-context";

interface ServerTimerState extends TimerState {
  playlist: PlaylistItem[];
  activeIndex: number;
  transitionMode: TransitionMode;
  isPlaylistRunning: boolean;
  currentItemId?: string;
}

interface PlaylistState {
  playlist: PlaylistItem[];
  activeIndex: number;
  transitionMode: TransitionMode;
  isPlaylistRunning: boolean;
}

const getSocketUrl = () => {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL?.trim();

  if (configuredUrl) {
    try {
      const parsedUrl = new URL(configuredUrl);
      const pageIsLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
      const configuredIsLocalhost = ["localhost", "127.0.0.1", "::1"].includes(parsedUrl.hostname);

      if (configuredIsLocalhost && !pageIsLocalhost) {
        return window.location.origin;
      }
    } catch {
      return window.location.origin;
    }

    return configuredUrl.replace(/\/$/, "");
  }

  return window.location.origin;
};

const getApiUrl = (path: string) => {
  const baseUrl = getSocketUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (baseUrl === window.location.origin) {
    return normalizedPath;
  }

  return `${baseUrl}${normalizedPath}`;
};

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const adminTokenRef = useRef<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>({
    timeFormatted: "00:00",
    status: "idle",
    title: "",
    secondsRemaining: 0,
  });
  const [playlistState, setPlaylistState] = useState<PlaylistState>({
    playlist: [],
    activeIndex: -1,
    transitionMode: 'manual',
    isPlaylistRunning: false,
  });

  const applyServerState = useCallback((data: ServerTimerState) => {
    setTimerState({
      timeFormatted: data.timeFormatted,
      status: data.status,
      title: data.title,
      secondsRemaining: data.secondsRemaining
    });
    setPlaylistState({
      playlist: data.playlist || [],
      activeIndex: data.activeIndex ?? -1,
      transitionMode: data.transitionMode ?? 'manual',
      isPlaylistRunning: data.isPlaylistRunning ?? false,
    });
  }, []);

  const refreshState = useCallback(() => {
    fetch(getApiUrl("/api/timer/state"))
      .then((response) => response.json())
      .then((data: ServerTimerState) => applyServerState(data))
      .catch(() => undefined);
  }, [applyServerState]);

  useEffect(() => {
    const newSocket = io(getSocketUrl(), {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: () => ({
        adminToken: adminTokenRef.current,
      }),
    });
    socketRef.current = newSocket;

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("connect_error", () => setIsConnected(false));

    newSocket.on("timer:update", applyServerState);
    refreshState();

    const refreshInterval = window.setInterval(refreshState, 1000);

    return () => {
      window.clearInterval(refreshInterval);
      socketRef.current = null;
      newSocket.close();
    };
  }, [applyServerState, refreshState]);

  const emitAdminEvent = (event: string, payload?: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, payload);
      return;
    }

    const action = event.replace("admin:", "");

    fetch(getApiUrl("/api/admin/action"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(adminTokenRef.current ? { "x-admin-token": adminTokenRef.current } : {}),
      },
      body: JSON.stringify({ action, payload }),
    })
      .then((response) => response.json())
      .then((data: { state?: ServerTimerState }) => {
        if (data.state) {
          applyServerState(data.state);
        }
      })
      .catch(() => undefined);
  };

  const loginAdmin = (password: string) => {
    const loginWithHttpFallback = () =>
      fetch(getApiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
        .then((fallbackResponse) => fallbackResponse.json())
        .then((fallbackData: { ok?: boolean; token?: string }) => {
          if (fallbackData.ok) {
            adminTokenRef.current = fallbackData.token ?? null;

            const currentSocket = socketRef.current;
            if (currentSocket) {
              currentSocket.auth = { adminToken: adminTokenRef.current };
              currentSocket.disconnect().connect();
            }

            return { ok: true };
          }

          return { ok: false, reason: "invalid" as const };
        })
        .catch(() => ({ ok: false, reason: "timeout" as const }));

    return new Promise<{ ok: boolean; reason?: "disconnected" | "timeout" | "invalid" }>((resolve) => {
      const activeSocket = socketRef.current;

      if (!activeSocket?.connected) {
        loginWithHttpFallback().then(resolve);
        return;
      }

      activeSocket
        .timeout(3000)
        .emit(
          "admin:login",
          { password },
          (error: Error | null, response?: { ok: boolean }) => {
            if (error) {
              loginWithHttpFallback().then(resolve);
              return;
            }

            resolve(response?.ok ? { ok: true } : { ok: false, reason: "invalid" });
          }
        );
    });
  };

  const startTimer = (minutes: number, title: string) => {
    emitAdminEvent("admin:start", { minutes, title }); 
  };

  const pauseTimer = () => emitAdminEvent("admin:pause");
  const resumeTimer = () => emitAdminEvent("admin:resume");
  const stopTimer = () => emitAdminEvent("admin:stop");
  const selectItem = (index: number) => {
    emitAdminEvent("admin:select_item", index);
  };
  const addPlaylistItem = (item: PlaylistItem) => {
    emitAdminEvent("admin:playlist_add", item);
  };
  const updatePlaylistItem = (id: string, updates: Partial<Omit<PlaylistItem, "id">>) => {
    emitAdminEvent("admin:playlist_update", { id, updates });
  };
  const removePlaylistItem = (id: string) => {
    emitAdminEvent("admin:playlist_remove", id);
  };
  const movePlaylistItem = (fromIndex: number, toIndex: number) => {
    emitAdminEvent("admin:playlist_move", { fromIndex, toIndex });
  };
  const setTransitionMode = (mode: TransitionMode) => {
    emitAdminEvent("admin:set_transition_mode", mode);
  };
  const playPlaylist = () => {
    emitAdminEvent("admin:play_playlist");
  };
  const nextItem = () => {
    emitAdminEvent("admin:next_item");
  };

  const playCurrentItem = () => {
    emitAdminEvent("admin:play_current_item");
  };

  const previousItem = () => {
    emitAdminEvent("admin:previous_item");
  };

  return (
    <TimerContext.Provider
      value={{
        ...timerState,
        ...playlistState,
        loginAdmin,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        selectItem,
        isConnected,
        addPlaylistItem,
        updatePlaylistItem,
        removePlaylistItem,
        movePlaylistItem,
        setTransitionMode,
        playPlaylist,
        nextItem,
        previousItem,
        playCurrentItem,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
