import { CheerioAPI } from "cheerio";
import readlineSync from "readline-sync";
import { successMessage } from "../../utils/message";
import { getPage } from "../../utils/page";
import { Engine } from "../engine";

export default class Keroseed extends Engine {
  constructor(name: string) {
    super(name, "keroseed");
  }

  async init() {
    if (
      !readlineSync.keyInYN(
        "This engine is not finished yet. You want continue?"
      )
    ) {
      return false;
    }
    const search = await getPage(
      `https://www.keroseed.com/?s=${encodeURI(this.name)}`
    );

    const animes = search("article")
      .toArray()
      .map((anime) => {
        return {
          title: search(anime).find(".card-body header .entry-title a").text(),
          url: search(anime)
            .find(".card-body header .entry-title a")
            .first()
            .attr("href"),
        };
      });

    const page = await this.selectAnimes(animes);
    if (typeof page === "boolean") return false;

    const animeTitle = page(".entry-header .entry-title").text();
    successMessage(`Anime founded: ${animeTitle}...`);
    this.name = animeTitle.replace(/[^\w\s]/gi, "");

    return await this.getEpisodes(page);
  }

  async getEpisodes(page: CheerioAPI) {
    const episodes = page(".entry-content p a");

    const episodesList = episodes
      .map((index, episode) => {
        const title = page(episode).first().text();
        if (title.includes("720p")) return;

        const url = page(episode).first().attr("href");

        return { episode: index, title, url };
      })
      .toArray();

    return await this.selectEpisodes(episodesList);
  }
}
