import { CheerioAPI } from "cheerio";
import { successMessage } from "../../utils/message";
import { getPage } from "../../utils/page";
import { Engine } from "../engine";

export default class Ondebaixa extends Engine {
  constructor(name: string) {
    super(name, "ondebaixa");
  }

  async init() {
    const search = await getPage(
      `https://ondebaixa.com/index.php?s=${encodeURI(this.name)}`
    );

    const animes = search(".capa_larga")
      .toArray()
      .map((anime) => {
        return {
          title: search(anime).find(".info_capa h3 a").text(),
          url: search(anime).find(".capa_larga a").first().attr("href"),
        };
      });

    const page = await this.selectAnimes(animes);
    if (typeof page === "boolean") return false;

    const animeTitle = page(".container .conteudo h1").text();
    successMessage(`Founded: ${animeTitle}...`);
    this.name = animeTitle.replace(/[^\w\s]/gi, "");

    return await this.getEpisodes(page);
  }

  async getEpisodes(page: CheerioAPI) {
    const episodes = page("#lista_download .btn");

    const episodesList = episodes
      .map((index, episode) => {
        const title = page(episode).first().attr("title");

        const url = page(episode).first().attr("href");

        return { episode: index, title, url };
      })
      .toArray();

    return await this.selectEpisodes(episodesList);
  }
}
