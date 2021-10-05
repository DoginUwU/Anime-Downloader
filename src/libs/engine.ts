import WebTorrent from "webtorrent";
import fs from "fs";
import os from "os";
import path from "path";
import { successMessage } from "../utils/message";

export abstract class Engine {
  downloadFolder: string = path.join(os.homedir(), "Downloads");
  name: string;
  torrent = new WebTorrent();

  constructor(name: string) {
    this.name = name;
    successMessage(`Searching ${name}...`);
  }

  abstract init(): Promise<boolean>;

  async downloadTorrent(episode: Episode) {
    return new Promise((resolve, reject) => {
      successMessage(`Downloading ${episode.title}...`);
      this.torrent.add(episode.url, (torrent) => {
        torrent.files.forEach((file) => {
          const path = `${this.downloadFolder}\\${file.name}`;
          file.createReadStream().pipe(fs.createWriteStream(path));
        });

        torrent.on("done", () => {
          resolve(torrent);
        });
      });

      this.torrent.on("error", (err) => {
        console.log(err);
        reject(err);
      });
    });
  }
}
