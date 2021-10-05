#!/usr/bin/env node
import type { Arguments, CommandBuilder } from "yargs";
import Darkmahou from "../libs/darkmahou";
import { Engine } from "../libs/engine";

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
    .choices("mode", ["darkmahou"]);
export const handler = async (argv: Arguments<Options>) => {
  const { name, mode = "darkmahou" } = argv;

  let engine: Engine = undefined;

  switch (mode) {
    default:
      engine = new Darkmahou(name);
      break;
  }

  await engine.init();

  process.exit(0);
};
