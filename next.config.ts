import type { NextConfig } from "next";
import { execSync } from "node:child_process";

function getCommitSha(): string {
  // On Vercel the commit SHA is provided as a build-time system env var.
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA;
  }
  // Local / non-Vercel builds: read it straight from git.
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  // `env` values are inlined into the bundle at build time, making the SHA
  // available in the browser via process.env.NEXT_PUBLIC_COMMIT_SHA.
  env: {
    NEXT_PUBLIC_COMMIT_SHA: getCommitSha(),
  },
};

export default nextConfig;
