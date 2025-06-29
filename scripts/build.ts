import { build } from "esbuild";
import config from "../esbuild.config.js";

build(config).catch((e) => {
  console.error(e);
  process.exit(1);
});
