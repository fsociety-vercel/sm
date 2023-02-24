#! /usr/bin/env node
//
// Inspired by create-next-app
// https://github.com/vercel/next.js/blob/e91de8e0ddfd5b4a996c0e5df6549fe3981e1f6d/packages/create-next-app/index.ts
//

import { Command } from "@commander-js/extra-typings";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import prompts from "prompts";
import { getPkgManager } from "./helpers/get-pkg-manager";
import { install } from "./helpers/install";
import packageJson from "./package.json";

let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

const program = new Command(packageJson.name)
  .description("Installs middleware to secure your app.")
  .version(packageJson.version)
  .usage("[options]")
  .option("--project-path <path>", "the path to the project directory.")
  .option("--use-npm", "explicitly tell the CLI to bootstrap the app using npm")
  .option(
    "--use-pnpm",
    "explicitly tell the CLI to bootstrap the app using pnpm"
  )
  .option("--skip-middleware", "skip installing middleware")
  .allowUnknownOption()
  .parse(process.argv);

const packageManager = !!program.opts().useNpm
  ? "npm"
  : !!program.opts().usePnpm
  ? "pnpm"
  : getPkgManager();

async function run(): Promise<void> {
  if (
    !program.opts().projectPath ||
    program.opts().projectPath === "." ||
    program.opts().projectPath === undefined
  ) {
    // Get current working directory
    projectPath = process.cwd();
  } else {
    const inputProjectPath = program.opts().projectPath!.trim();
    if (!fs.existsSync(inputProjectPath)) {
      console.error(
        chalk.red(`Project path does not exist: ${inputProjectPath}`)
      );
      process.exit(1);
    }
    projectPath = inputProjectPath;
  }

  const res = await prompts({
    onState: onPromptState,
    type: "text",
    name: "path",
    message: "What is your project path?",
    initial: projectPath,
    validate: (name) => {
      if (!fs.existsSync(name.trim())) {
        return "Project path does not exist.";
      }
      return true;
    },
  });

  if (typeof res.path === "string") {
    projectPath = res.path.trim();
  }

  const root = path.resolve(projectPath);
  console.log(`Securing: ${chalk.green(root)}`);

  const packageJsonPath = path.join(root, "package.json");
  const hasPackageJson = fs.existsSync(packageJsonPath);

  if (!hasPackageJson) {
    console.log(
      chalk.red(`There is no package.json in the project path: ${root}`)
    );
    // TODO: Provide extra guidance here
    process.exit(1);
  }

  console.log("Using", chalk.cyan(packageManager));

  console.log("Installing packages. This may take a moment.");

  await install(root, ["secure-middleware"], {
    packageManager,
    isOnline: true,
  });
  console.log();
  console.log("Packages installed.");

  if (!program.opts().skipMiddleware) {
    console.log("Now installing middleware to secure your app...");

    // Is this NextJS?
    const nextConfigPath = path.join(root, "next.config.js");
    const hasNextConfig = fs.existsSync(nextConfigPath);

    if (hasNextConfig) {
      console.log("NextJS detected.");

      // Check if middleware doesn't already exist
      const nextMiddlewarePath = path.join(root, "middleware.ts");
      const hasNextMiddleware = fs.existsSync(nextMiddlewarePath);

      if (hasNextMiddleware) {
        // TODO: Update existing middleware
        console.log(chalk.red("NextJS Middleware already exists."));
        console.log(chalk.red("Aborting installation."));
        process.exit(1);
      }

      // Copy clean middleware file into project
      const nextMiddlewareTemplatePath = path.join(
        __dirname,
        "templates",
        "nextjs-middleware.ts"
      );
      const nextMiddlewareTemplate = fs.readFileSync(
        nextMiddlewareTemplatePath,
        "utf8"
      );
      fs.writeFileSync(nextMiddlewarePath, nextMiddlewareTemplate);

      console.log("NextJS middleware installed.");
    } else {
      console.log("NextJS not detected.");
    }
  } else {
    console.log(`${chalk.yellow("Skipped middleware installation.")}`);
  }

  console.log(`${chalk.green("Success!")} Your app is now secure.`);
}

run().catch(async (reason) => {
  console.log();
  console.log("Aborting installation.");
  if (reason.command) {
    console.log(`  ${chalk.cyan(reason.command)} has failed.`);
  } else {
    console.log(
      chalk.red("Unexpected error. Please report it as a bug:") + "\n",
      reason
    );
  }
  console.log();

  process.exit(1);
});
