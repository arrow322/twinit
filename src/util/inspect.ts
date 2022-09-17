// Inspect package.json for the framework
// If inspecting package.json fails, ask the user to provide the framework
import chalk from "chalk";
import inquirer from "inquirer";
import { createRequire } from "module";
import path from "path";
import { FRAMEWORKS } from "./constants.js";
import { globExists } from "./index.js";

const require = createRequire(import.meta.url);

// If the framework is not supported, show an error message
export async function detectFramework() {
  let framework = null;
  const dir = process.cwd();
  const file = path.join(dir, "package.json");

  // Wrap in try/catch in case the file does not exist
  try {
    // Trying to detect framework from package.json
    const pkg = require(file);

    Object.keys(FRAMEWORKS).some((fw) => {
      const keys: string[] = FRAMEWORKS[fw];
      const found = keys.some((key) => pkg.dependencies[key] !== undefined);
      if (found) {
        console.log(chalk.cyan(`Detected framework is: ${chalk.yellow(fw)}`));
        framework = resolveFramework(fw);

        return true;
      }
    });
  } catch (error) {
    // Ignore
  }

  if (framework) {
    return framework;
  }

  // TODO: Try to detect the framework from the files in the directory

  // If no framework is found, prompt the user to choose one
  const fw = await inquirer.prompt([
    {
      type: "list",
      name: "framework",
      required: true,
      message: "Failed to detect a framework. Please choose one:",
      choices: Object.keys(FRAMEWORKS),
    },
  ]);

  return resolveFramework(fw.framework);
}

function resolveFramework(fw: string) {
  if (fw === "react" && globExists("vite.config.{js,ts}")) {
    return "vite-react";
  }
  if (fw === "vue" && globExists("vite.config.{js,ts}")) {
    return "vite-vue";
  }
  if (fw === "react") {
    return "cra";
  }

  return fw;
}
