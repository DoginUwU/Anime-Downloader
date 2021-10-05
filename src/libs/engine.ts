import WebTorrent from "webtorrent";
import fs from "fs";
import os from "os";
import path from "path";
import readlineSync from "readline-sync";
import { errorMessage, successMessage } from "../utils/message";
import { sleep } from "../utils/others";

export abstract class Engine {
  downloadFolder: string = path.join(os.homedir(), "Downloads");
  name: string;
  torrent = new WebTorrent();

  constructor(name: string) {
    this.name = name;
    successMessage(`Searching ${name}...`);
  }

  abstract init(): Promise<boolean>;

  async selectEpisodes(episodes: Episode[], skipQuestion: boolean = false) {
    if (
      !skipQuestion &&
      readlineSync.keyInYN("Do you want download all episodes?")
    ) {
      while (episodes.length) {
        await Promise.all(
          episodes.splice(0, 5).map(async (episode) => {
            await sleep(1000);
            return this.downloadEpisode(episode);
          })
        );
      }
    } else {
      const episodesToDownload = readlineSync.keyInSelect(
        episodes.map((episode) => episode.title),
        "Select episodes to download"
      );
      if (episodesToDownload !== -1) {
        await this.downloadEpisode(episodes[episodesToDownload]);
        await this.selectEpisodes(episodes, true);
      } else {
        return false;
      }
    }
  }

  async downloadEpisode(episode: Episode) {
    return this.downloadTorrent(episode)
      .then(() => {
        successMessage(`${episode.title} downloaded!`);
      })
      .catch(() => {
        errorMessage(`${episode.title} not downloaded!`);
      });
  }

  async downloadTorrent(episode: Episode) {
    return new Promise((resolve, reject) => {
      successMessage(`Downloading ${episode.title}...`);
      const downloadedFiles = [];

      this.torrent.add(episode.url, (torrent) => {
        torrent.files.forEach((file) => {
          const path = `${this.downloadFolder}\\${file.name}`;
          file
            .createReadStream()
            .pipe(fs.createWriteStream(path))
            .on("finish", () => {
              downloadedFiles.push(file);
              if (downloadedFiles.length === torrent.files.length) {
                resolve(torrent);
              }
            })
            .on("error", (err) => {
              reject(err);
            });
        });
      });

      this.torrent.on("error", (err) => {
        console.log(err);
        reject(err);
      });
    });
  }
}
