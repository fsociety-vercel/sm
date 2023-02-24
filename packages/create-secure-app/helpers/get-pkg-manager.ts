//
// From https://github.com/vercel/next.js/blob/e91de8e0ddfd5b4a996c0e5df6549fe3981e1f6d/packages/create-next-app/helpers/get-pkg-manager.ts
//

export type PackageManager = "npm" | "pnpm" | "yarn";

export function getPkgManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.startsWith("yarn")) {
      return "yarn";
    } else if (userAgent.startsWith("pnpm")) {
      return "pnpm";
    } else {
      return "npm";
    }
  } else {
    return "npm";
  }
}
