#!/usr/bin/env node
import { EventEmitter } from "stream";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

EventEmitter.defaultMaxListeners = 100;

yargs(hideBin(process.argv))
  .commandDir("commands")
  .strict()
  .alias({ h: "help" }).argv;
