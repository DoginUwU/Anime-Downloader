import axios from "axios";
import cheerio from "cheerio";

const getPage = async (url: string) => {
  return axios.get(url).then((response) => {
    return cheerio.load(response.data);
  });
};

export { getPage };
