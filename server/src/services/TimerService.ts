import type {
    PlaylistItem,
    ServiceState,
    TimerStatus,
    TransitionMode,
} from "../interfaces/types.js";
import type { PlaylistStorageData } from "./PlaylistStorageService.js";


class TimerService {

    private _remainingSeconds: number = 0;
    private _status: TimerStatus = 'idle';
    private _interval: NodeJS.Timeout | null = null;
    private _title: string = '';
    private _activeIndex: number = -1;
    private _transitionMode: TransitionMode = "manual";
    private _isPlaylistRunning: boolean = false;
    private _playlist: PlaylistItem[] = [];

    public onTick: (state: ServiceState) => void = () => {};

    private formatTime(seconds: number) {
        const absSeconds = Math.abs(seconds);
        const mins = Math.floor(absSeconds / 60);
        const secs = absSeconds % 60;
        const timeString = `${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;

        return seconds < 0 ? `-${timeString}` : timeString;
    }

    private buildState(): ServiceState {
        return {
            timeFormatted: this.formatTime(this._remainingSeconds),
            secondsRemaining: this._remainingSeconds,
            status: this._status,
            title: this._title,
            playlist: this._playlist,
            activeIndex: this._activeIndex,
            transitionMode: this._transitionMode,
            isPlaylistRunning: this._isPlaylistRunning,
            currentItemId: this._playlist[this._activeIndex]?.id,
        };
    }

    start(minutes: number,title: string) {
        this.clearLoop();
        this._status = 'idle';
        this._remainingSeconds = 0;
        this._isPlaylistRunning = false;
        this._remainingSeconds = minutes * 60;
        this._status = 'running';
        this._title = title;
        this.startLoop();
    }

    resume() {
        if (this._status === 'paused') {
            this._status = 'running';
            this.startLoop();
        }
    }

    pause() {
        if (this._status === 'running') {
            this._status = 'paused';
            this.clearLoop();
            this.notify();
        }
    }

    stop() {
        this._status = 'idle';
        this._remainingSeconds = 0;
        this._isPlaylistRunning = false;
        this.clearLoop();
        this.notify();
    }

    selectItem(index: number) {
        this.playItemAtIndex(index);
    }

    private playItemAtIndex(index: number) {
        if (index < 0 || index >= this._playlist.length) {
            return;
        }

        const item = this._playlist[index];

        if (!item) {
            return;
        }

        this.start(item.duration, item.title);
        this._activeIndex = index;
        this._isPlaylistRunning = true;
        this.notify();
    }

    private startLoop() {
        if (this._interval) clearInterval(this._interval);

        this._interval = setInterval(() => {
            this._remainingSeconds--;

            if (this._remainingSeconds === 0) {
                this.handleItemFinished();
                return;
            }

            if (this._remainingSeconds < 0) {
                this._status = "overtime";
            }

            this.notify();

        }, 1000);
        
        this.notify(); 
    }

    private clearLoop() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    }

    private notify() {
        this.onTick(this.buildState());
    }

    private handleItemFinished(){
        if(this._transitionMode === "automatic"){
            const hasNextItem = this._activeIndex >= 0 && this._activeIndex < this._playlist.length - 1;
            if(hasNextItem){
               this.nextItem();
               return;
            }else{
                this.clearLoop();
                this._status = "idle";
                this._isPlaylistRunning = false;
                this._remainingSeconds = 0;
                this.notify();
            }
        }else{
            this.clearLoop();
            this._status = "paused";
            this._isPlaylistRunning = false;
            this._remainingSeconds = 0;
            this.notify();
        }
      
    }

    public getState(): ServiceState {
        return this.buildState();
    }

    public hydrate(data: PlaylistStorageData) {
        this._playlist = data.playlist;
        this._transitionMode = data.transitionMode;
        this._activeIndex = -1;
        this._isPlaylistRunning = false;
        this._title = "";
        this._remainingSeconds = 0;
        this._status = "idle";
    }

    public setPlaylist(playlist: PlaylistItem[]) {
        this._playlist = playlist;

        if(this._activeIndex >= this._playlist.length){
            this._activeIndex = -1;
            this._title = "";
            this._remainingSeconds = 0;
            this._status = "idle";
            this._isPlaylistRunning = false;
            this.clearLoop();
        }

        this.notify();
    }

    public addItem(item: PlaylistItem) {
        this._playlist.push(item);
        this.notify();
    }

    public updateItem(id: string, updates: Partial<Omit<PlaylistItem, "id">>){
        const index = this._playlist.findIndex(item => item.id === id);
        if(index === -1){
            return;
        }

        this._playlist[index] = {...this._playlist[index], ...updates};
        this.notify();
    }

    public removeItem(id: string) {
        const index = this._playlist.findIndex(item => item.id === id);
        if(index === -1){
            return;
        }

        this._playlist.splice(index, 1);
        
        if(index === this._activeIndex){
            this._activeIndex = -1;
            this._isPlaylistRunning = false;
            this._title = "";
            this._remainingSeconds = 0;
            this._status = "idle";
            this.clearLoop()
        }else if(index < this._activeIndex){
            this._activeIndex--;
        }

        this.notify();
    }

    public moveItem(fromIndex: number, toIndex: number){
        if(fromIndex < 0 || toIndex < 0 || fromIndex >= this._playlist.length || toIndex >= this._playlist.length || fromIndex === toIndex){
            return
        }

        const [movedItem] = this._playlist.splice(fromIndex, 1);
        if(!movedItem){
            return
        }
        this._playlist.splice(toIndex, 0, movedItem);

        if(this._activeIndex === fromIndex){
            this._activeIndex = toIndex;
        }else if(fromIndex < this._activeIndex && toIndex >= this._activeIndex){
            this._activeIndex--;
        }else if(fromIndex > this._activeIndex && toIndex <= this._activeIndex){
            this._activeIndex++;
        }

        this.notify();
    }

    public setTransitionMode(mode: TransitionMode){
        this._transitionMode = mode;
        this.notify();
    }

    public playCurrentItem(){
        if(this._activeIndex === -1){
            return
        }

        this.playItemAtIndex(this._activeIndex);
    }

    public playPlaylist() {
        if (this._playlist.length === 0) {
            return;
        }

        const indexToPlay = this._activeIndex >= 0 ? this._activeIndex : 0;
        this.playItemAtIndex(indexToPlay);
    }

    public nextItem(){
        const nextIndex = this._activeIndex + 1;
        if(nextIndex >= this._playlist.length){
            return
        }

        this.playItemAtIndex(nextIndex);
    }

    public previousItem(){
        const prevIndex = this._activeIndex - 1;
        if(prevIndex < 0){
            return
        }

        this.playItemAtIndex(prevIndex);
    }
}

export const timerService = new TimerService();
