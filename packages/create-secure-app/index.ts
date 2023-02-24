#!/usr/bin / env node
//
// Inspired by create-next-app
// https://github.com/vercel/next.js/blob/e91de8e0ddfd5b4a996c0e5df6549fe3981e1f6d/packages/create-next-app/index.ts
//

import { Command } from "@commander-js/extra-typings";
import packageJson from "./package.json";
import { getPkgManager } from "./helpers/get-pkg-manager";
import chalk from "chalk";
import prompts from "prompts";
import path from "path";
import fs from "fs";

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
  .allowUnknownOption()
  .parse(process.argv);

const packageManager = !!program.opts().useNpm
  ? "npm"
  : !!program.opts().usePnpm
  ? "pnpm"
  : getPkgManager();

async function run(): Promise<void> {
  console.log("packageManager:", packageManager);

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

  const resolvedProjectPath = path.resolve(projectPath);

  console.log("Installing to:", resolvedProjectPath);
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
