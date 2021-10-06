#!/usr/bin/env node
import type { Arguments, CommandBuilder } from "yargs";
import Darkmahou from "../libs/darkmahou";
import { Engine } from "../libs/engine";
import Keroseed from "../libs/keroseed";
import Ondebaixa from "../libs/ondebaixa";

type Options = {
  name: string;
  mode: string | undefined;
};

export const command: string = "download <name>";
export const desc: string = "Download your animes";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      mode: {
        type: "string",
        default: "darkmahou",
        describe: "site used to download the anime",
      },
    })
    .positional("name", {
      type: "string",
      demandOption: true,
    })
    .choices("mode", ["darkmahou", "ondebaixa", "keroseed"]);
export const handler = async (argv: Arguments<Options>) => {
  const { name, mode = "darkmahou" } = argv;

  let engine: Engine = undefined;

  switch (mode) {
    case "darkmahou":
      engine = new Darkmahou(name);
      break;
    case "ondebaixa":
      engine = new Ondebaixa(name);
      break;
    case "keroseed":
      engine = new Keroseed(name);
      break;
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }

  await engine.init();

  process.exit(0);
};
