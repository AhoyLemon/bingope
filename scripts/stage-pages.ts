import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import routes from "../routes/pug.routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const artifactRoot = path.join(projectRoot, "_site");

function copy(relativePath: string, outputRelativePath: string = relativePath) {
  const sourcePath = path.join(projectRoot, relativePath);
  const outputPath = path.join(artifactRoot, outputRelativePath);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Build output not found: ${relativePath}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.cpSync(sourcePath, outputPath, { recursive: true });
}

fs.rmSync(artifactRoot, { recursive: true, force: true });
fs.mkdirSync(artifactRoot, { recursive: true });

Object.values(routes).forEach((route) => copy(route));
copy("css");
copy("js/min");

if (fs.existsSync(path.join(projectRoot, "src/svg"))) {
  copy("src/svg", "svg");
}

if (fs.existsSync(path.join(projectRoot, "src/img"))) {
  copy("src/img", "img");
}

// Files that must be served exactly at the site root (e.g. search engine
// verification files) live in src/static and are copied in unprocessed.
const staticRoot = path.join(projectRoot, "src/static");
if (fs.existsSync(staticRoot)) {
  fs.readdirSync(staticRoot).forEach((file) => {
    copy(path.join("src/static", file), file);
  });
}

fs.writeFileSync(path.join(artifactRoot, ".nojekyll"), "");

console.log(`GitHub Pages artifact staged at ${artifactRoot}`);
