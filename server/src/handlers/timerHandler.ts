import { Server, Socket } from "socket.io";
import type { PlaylistItem, TransitionMode } from "../interfaces/types.js";
import { timerService } from "../services/TimerService.js";
import { playlistStorageService } from "../services/PlaylistStorageService.js";
import { isAdminPassword } from "../config/admin.js";

const persistPlaylistState = () => {
    const state = timerService.getState();

    playlistStorageService.savePlaylist({
        playlist: state.playlist,
        transitionMode: state.transitionMode,
    });
};

export const registerTimerHandlers = (io: Server, socket: Socket) => {
    const registerAdminHandler = <T>(
        event: string,
        handler: (data: T) => void
    ) => {
        socket.on(event, (data: T) => {
            if (!socket.data.isAdmin) {
                return;
            }

            handler(data);
        });
    };

    socket.on(
        "admin:login",
        (
            data: { password?: string },
            callback?: (response: { ok: boolean }) => void
        ) => {
            const isAuthenticated = isAdminPassword(data?.password);
            socket.data.isAdmin = isAuthenticated;
            callback?.({ ok: isAuthenticated });
        }
    );

    registerAdminHandler("admin:start", (data: { minutes: number; title: string }) => {
        timerService.start(data.minutes, data.title);
    });

    registerAdminHandler("admin:pause", () => {
        timerService.pause();
    });

    registerAdminHandler("admin:resume", () => {
        timerService.resume();
    });

    registerAdminHandler("admin:stop", () => {
        timerService.stop();
    });

    registerAdminHandler("admin:set_time", (data: { minutes: number; title: string }) => {
        timerService.start(data.minutes, data.title);
    });

    registerAdminHandler("admin:reset", () => {
        timerService.stop();
    });

    registerAdminHandler("admin:playlist_add", (item: PlaylistItem) => {
        timerService.addItem(item);
        persistPlaylistState();
    });

    registerAdminHandler(
        "admin:playlist_update",
        (data: { id: string; updates: Partial<Omit<PlaylistItem, "id">> }) => {
            timerService.updateItem(data.id, data.updates);
            persistPlaylistState();
        }
    );

    registerAdminHandler("admin:playlist_remove", (id: string) => {
        timerService.removeItem(id);
        persistPlaylistState();
    });

    registerAdminHandler("admin:playlist_set", (playlist: PlaylistItem[]) => {
        timerService.setPlaylist(playlist);
        persistPlaylistState();
    });

    registerAdminHandler(
        "admin:playlist_move",
        (data: { fromIndex: number; toIndex: number }) => {
            timerService.moveItem(data.fromIndex, data.toIndex);
            persistPlaylistState();
        }
    );

    registerAdminHandler("admin:set_transition_mode", (mode: TransitionMode) => {
        timerService.setTransitionMode(mode);
        persistPlaylistState();
    });

    registerAdminHandler("admin:play_playlist", () => {
        timerService.playPlaylist();
    });

    registerAdminHandler("admin:play_current_item", () => {
        timerService.playCurrentItem();
    });

    registerAdminHandler("admin:next_item", () => {
        timerService.nextItem();
    });

    registerAdminHandler("admin:previous_item", () => {
        timerService.previousItem();
    });

    registerAdminHandler("admin:select_item", (index: number) => {
        timerService.selectItem(index);
    });

    socket.emit("timer:update", timerService.getState());
};
