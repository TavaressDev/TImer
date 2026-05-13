import path from "path";
import fs from "fs";
import type { PlaylistItem, TransitionMode } from "../interfaces/types.js";

export interface PlaylistStorageData {
    playlist: PlaylistItem[];
    transitionMode: TransitionMode;
}

const DEFAULT_PLAYLIST: PlaylistStorageData = {
    playlist: [],
    transitionMode: "manual",
};

function resolveStoragePath() {
  const isPackaged = !process.execPath.includes("node");
  const baseDir = isPackaged ? path.dirname(process.execPath) : process.cwd();
  const dataDir = path.join(baseDir, "data");

  fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "playlists.json");
}

function loadPlaylist() {
  const filePath = resolveStoragePath();

  if(!fs.existsSync(filePath)) {
    return DEFAULT_PLAYLIST;
  }

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(fileContent);

    const hasValidPlaylist = Array.isArray(parsedData.playlist)
    const hasValidMode = 
      parsedData.transitionMode === "manual" || parsedData.transitionMode === "automatic";

    if(hasValidPlaylist && hasValidMode) {
      return parsedData;
    }
    
    return DEFAULT_PLAYLIST;
  } catch (error) {
    console.error("Error loading playlist:", error);
    return DEFAULT_PLAYLIST;
  }
}


function savePlaylist(data: PlaylistStorageData) : void {
  const filePath = resolveStoragePath()
  const tempFIlePath = `${filePath}.tmp`
  const serializedData = JSON.stringify(data, null, 2)

  fs.writeFileSync(tempFIlePath, serializedData, "utf-8")
  fs.renameSync(tempFIlePath, filePath)
    
}

export const playlistStorageService = {
    loadPlaylist,
    savePlaylist
}