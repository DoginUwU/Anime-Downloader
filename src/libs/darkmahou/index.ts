import { CheerioAPI } from "cheerio";
import { successMessage } from "../../utils/message";
import { getPage } from "../../utils/page";
import { Engine } from "../engine";

export default class Darkmahou extends Engine {
  constructor(name: string) {
    super(name, "darkmahou");
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

    const page = await this.selectAnimes(animes);
    if (typeof page === "boolean") return false;

    const animeTitle = page(".entry-title").text();
    successMessage(`Anime founded: ${animeTitle}...`);
    this.name = animeTitle.replace(/[^\w\s]/gi, "");

    return await this.getEpisodes(page);
  }

  async getEpisodes(page: CheerioAPI) {
    const episodes = page(".soraddl.dlone");

    const episodesList = episodes
      .map((index, episode) => {
        const title = page(episode).find("h3").first().text();

        const url = page(episode)
          .find(".content .soraurl .slink a")
          .first()
          .attr("href");

        return { episode: index, title, url };
      })
      .toArray();

    return await this.selectEpisodes(episodesList);
  }
}
