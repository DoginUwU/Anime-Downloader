import WebTorrent from "webtorrent";
import fs from "fs";
import os from "os";
import path from "path";
import readlineSync from "readline-sync";
import cliProgress from "cli-progress";
import { errorMessage, successMessage } from "../utils/message";
import { sleep } from "../utils/others";
import { getPage } from "../utils/page";

interface Anime {
  title: string;
  url: string;
}
export abstract class Engine {
  downloadFolder: string = path.join(os.homedir(), "Downloads");
  name: string;
  torrent = new WebTorrent();
  progressBar: cliProgress.MultiBar | undefined;

  constructor(name: string, engineName: string) {
    this.name = name;
    console.log(`🌎 ${engineName} init`);
    successMessage(`Searching ${name}...`);
  }

  abstract init(): Promise<boolean>;

  async selectAnimes(animes: Anime[]) {
    if (!animes.length) return errorMessage("Sorry, animes not found!");

    let animeIndex = await readlineSync.keyInSelect(
      animes.map((a) => a.title),
      "choose the anime"
    );
    if (!animes[animeIndex]) return errorMessage("Sorry, anime not found!");
    const url = animes[animeIndex].url;
    return await getPage(url);
  }

  async selectEpisodes(episodes: Episode[], skipQuestion: boolean = false) {
    successMessage(`${episodes.length} episodes founded...`);

    const episodesDownloadDir = path.join(this.downloadFolder, this.name);

    if (!fs.existsSync(episodesDownloadDir)) {
      fs.mkdir(episodesDownloadDir, (err) => {
        if (err) throw err;
      });
    }
    this.downloadFolder = episodesDownloadDir;

    this.progressBar = new cliProgress.MultiBar(
      {
        clearOnComplete: true,
        hideCursor: true,
      },
      cliProgress.Presets.shades_grey
    );
    if (
      !skipQuestion &&
      readlineSync.keyInYN("Do you want download all episodes?")
    ) {
      episodes = episodes
        .map((episode) => {
          if (!episode.title.includes("Torrent")) return episode;
          return undefined;
        })
        .filter(Boolean);
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
    return this.downloadTorrent(episode).catch(() => {
      errorMessage(`${episode.title} not downloaded!`);
    });
  }

  async downloadTorrent(episode: Episode) {
    return new Promise((resolve, reject) => {
      const downloadedFiles = [];
      const bar = this.progressBar.create(1, 0);

      this.torrent.add(episode.url, (torrent) => {
        torrent.files.forEach((file) => {
          const path = `${this.downloadFolder}\\${file.name}`;
          bar.update(0);
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

        torrent.on("download", () => {
          bar.update(torrent.progress);
        });
        torrent.on("done", () => {
          bar.stop();
        });
      });
    });
  }
}
