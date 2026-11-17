import { config } from "dotenv";
import { fileURLToPath } from "node:url";

// Load the repo-root .env regardless of the working directory.
config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  quiet: true,
});
