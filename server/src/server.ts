import express from 'express';
import fs from 'fs';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { timerService } from './services/TimerService.js';
import { registerTimerHandlers } from './handlers/timerHandler.js';
import { playlistStorageService } from './services/PlaylistStorageService.js';
import { createAdminToken, isAdminPassword, isAdminToken } from './config/admin.js';

const app = express();
const server = http.createServer(app);
const persistedPlaylist = playlistStorageService.loadPlaylist();

timerService.hydrate(persistedPlaylist);


const resolvePublicPath = () => {
    const candidates = [
        path.join(__dirname, '../public'),
        path.join(path.dirname(process.execPath), 'public'),
        path.join(process.cwd(), 'public'),
    ];

    const resolvedPath = candidates.find((candidate) => fs.existsSync(candidate));

    if (!resolvedPath) {
        throw new Error(`Pasta public não encontrada. Caminhos tentados: ${candidates.join(', ')}`);
    }

    return resolvedPath;
};

const io = new Server(server, {
    cors: {
        origin: true,
        methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"],
});

app.use(express.json());

const emitTimerState = () => {
    io.emit('timer:update', timerService.getState());
};

const persistPlaylistState = () => {
    const state = timerService.getState();

    playlistStorageService.savePlaylist({
        playlist: state.playlist,
        transitionMode: state.transitionMode,
    });
};

app.post('/api/admin/login', (req, res) => {
    const password = typeof req.body?.password === 'string' ? req.body.password : undefined;
    const isAuthenticated = isAdminPassword(password);

    res.json({ ok: isAuthenticated, token: isAuthenticated ? createAdminToken() : undefined });
});

app.get('/api/timer/state', (req, res) => {
    res.json(timerService.getState());
});

app.post('/api/admin/action', (req, res) => {
    if (!isAdminToken(req.header('x-admin-token'))) {
        res.status(401).json({ ok: false });
        return;
    }

    const { action, payload } = req.body ?? {};

    switch (action) {
        case 'start':
            timerService.start(payload?.minutes, payload?.title);
            break;
        case 'pause':
            timerService.pause();
            break;
        case 'resume':
            timerService.resume();
            break;
        case 'stop':
        case 'reset':
            timerService.stop();
            break;
        case 'set_time':
            timerService.start(payload?.minutes, payload?.title);
            break;
        case 'playlist_add':
            timerService.addItem(payload);
            persistPlaylistState();
            break;
        case 'playlist_update':
            timerService.updateItem(payload?.id, payload?.updates);
            persistPlaylistState();
            break;
        case 'playlist_remove':
            timerService.removeItem(payload);
            persistPlaylistState();
            break;
        case 'playlist_move':
            timerService.moveItem(payload?.fromIndex, payload?.toIndex);
            persistPlaylistState();
            break;
        case 'set_transition_mode':
            timerService.setTransitionMode(payload);
            persistPlaylistState();
            break;
        case 'play_playlist':
            timerService.playPlaylist();
            break;
        case 'play_current_item':
            timerService.playCurrentItem();
            break;
        case 'next_item':
            timerService.nextItem();
            break;
        case 'previous_item':
            timerService.previousItem();
            break;
        case 'select_item':
            timerService.selectItem(payload);
            break;
        default:
            res.status(400).json({ ok: false });
            return;
    }

    emitTimerState();
    res.json({ ok: true, state: timerService.getState() });
});

timerService.onTick = (state) => {
    io.emit('timer:update', state);
};

io.on('connection', (socket) => {
    socket.data.isAdmin = isAdminToken(socket.handshake.auth?.adminToken);

    socket.emit('timer:update', timerService.getState());

    registerTimerHandlers(io, socket);
});

const publicPath = resolvePublicPath();
app.use(express.static(publicPath));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em http://${HOST}:${PORT}`);
    console.log(`Arquivos estáticos servidos de: ${publicPath}`);
});
