import { CheerioAPI } from "cheerio";
import fs from "fs";
import path from "path";
import readlineSync from "readline-sync";
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

    const animes = search("article")
      .toArray()
      .map((anime) => {
        return {
          title: search(anime).find(".ntitle").text(),
          url: search(anime).find("a").first().attr("href"),
        };
      });

    if (!animes.length) return errorMessage("Sorry, animes not found!");

    let animeIndex = await readlineSync.keyInSelect(
      animes.map((a) => a.title),
      "choose the anime"
    );
    if (!animes[animeIndex]) return errorMessage("Sorry, anime not found!");
    const url = animes[animeIndex].url;
    const page = await getPage(url);
    const animeTitle = page(".entry-title").text();
    successMessage(`Anime founded: ${animeTitle}...`);
    this.name = animeTitle.replace(/[^\w\s]/gi, "");

    await this.getEpisodes(page);
  }

  async getEpisodes(page: CheerioAPI) {
    const episodes = page(".soraddl.dlone");
    const episodesList: Array<Episode> = [];
    let count = 0;

    episodes.each((_, episode) => {
      const title = page(episode).find("h3").first().text();
      count++;

      const url = page(episode)
        .find(".content .soraurl .slink a")
        .first()
        .attr("href");

      episodesList.push({ episode: count, title, url });
    });
    successMessage(`${episodesList.length} episodes founded...`);

    const episodesDownloadDir = path.join(this.downloadFolder, this.name);

    if (!fs.existsSync(episodesDownloadDir)) {
      fs.mkdir(episodesDownloadDir, (err) => {
        if (err) throw err;
      });
    }
    this.downloadFolder = episodesDownloadDir;

    return await this.selectEpisodes(episodesList);
  }
}
