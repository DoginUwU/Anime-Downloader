import { CheerioAPI } from "cheerio";
import fs from "fs";
import path from "path";
import { errorMessage, successMessage } from "../../utils/message";
import { sleep } from "../../utils/others";
import { getPage } from "../../utils/page";
import { Engine } from "../engine";

export default class Darkmahou extends Engine {
  constructor(name: string) {
    console.log(`🌎 Darkmahou init`);
    super(name);
  }

  async init() {
    const search = await getPage(
      `https://darkmahou.com/?s=${encodeURI(this.name)}`
    );
    const url = search("article a").first().attr("href");
    if (!url) return errorMessage("Sorry, anime not found!");
    const page = await getPage(url);
    const animeTitle = page(".entry-title").text();
    successMessage(`Anime founded: ${animeTitle}...`);
    this.name = animeTitle.replace(":", "");

    await this.getEpisodes(page);
  }

  async getEpisodes(page: CheerioAPI) {
    const episodes = page(".soraddl.dlone");
    const episodesList: Array<Episode> = [];
    let count = 0;

    episodes.each((_, episode) => {
      const title = page(episode).find("h3").first().text();
      if (!title.includes("Episódio")) return;
      count++;

      const url = page(episode)
        .find(".content .soraurl .slink a")
        .first()
        .attr("href");
      if (episode)
        episodesList.push({
          episode: count,
          title,
          url,
        });
    });
    successMessage(`${episodesList.length} episodes founded...`);
    successMessage(`Downloading in 5 seconds...`);

    const episodesDownloadDir = path.join(this.downloadFolder, this.name);

    if (!fs.existsSync(episodesDownloadDir)) {
      fs.mkdir(episodesDownloadDir, (err) => {
        if (err) throw err;
      });
    }
    this.downloadFolder = episodesDownloadDir;
    successMessage(`Downloading in ${episodesDownloadDir}`);

    await sleep(5000);

    await Promise.all(
      episodesList.map(async (episode) => {
        await sleep(1000);
        return this.downloadTorrent(episode)
          .then(() => {
            successMessage(`${episode.title} downloaded!`);
          })
          .catch(() => {
            errorMessage(`${episode.title} not downloaded!`);
          });
      })
    );

    return true;
  }
}
