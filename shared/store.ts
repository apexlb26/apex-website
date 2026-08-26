import { promises as fs } from "fs";
import path from "path";
import type { AdminMediaUploadResult, AdminSaveResult, Locale, SiteContent } from "@/shared/types";

function localePath(locale: Locale) {
  return path.join(process.cwd(), "shared", `${locale}.json`);
}

function githubReady() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

function githubContentPath(locale: Locale) {
  if (locale === "ar") return process.env.GITHUB_CONTENT_PATH_AR || "shared/ar.json";
  return process.env.GITHUB_CONTENT_PATH_EN || "shared/en.json";
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

async function readFromGithub(locale: Locale): Promise<SiteContent> {
  const repo = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH || "main";
  const contentPath = githubContentPath(locale);
  const url = `https://api.github.com/repos/${repo}/contents/${contentPath}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, { headers: githubHeaders(), cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub read failed (${response.status})`);
  const json = (await response.json()) as { content?: string; encoding?: string };
  if (!json.content) throw new Error("GitHub response did not include file content");
  const text = Buffer.from(json.content.replace(/\n/g, ""), "base64").toString("utf8");
  return JSON.parse(text) as SiteContent;
}

async function saveToGithub(locale: Locale, content: SiteContent): Promise<AdminSaveResult> {
  const repo = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH || "main";
  const contentPath = githubContentPath(locale);
  const fileUrl = `https://api.github.com/repos/${repo}/contents/${contentPath}?ref=${encodeURIComponent(branch)}`;

  const current = await fetch(fileUrl, { headers: githubHeaders(), cache: "no-store" });
  if (!current.ok) throw new Error(`Could not read current GitHub file (${current.status})`);
  const currentJson = (await current.json()) as { sha?: string };
  if (!currentJson.sha) throw new Error("GitHub response did not include file SHA");

  const body = {
    message: `CMS: update ${locale.toUpperCase()} website content`,
    content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`, "utf8").toString("base64"),
    sha: currentJson.sha,
    branch,
  };

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${contentPath}`, {
    method: "PUT",
    headers: githubHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub publish failed (${response.status}): ${detail.slice(0, 240)}`);
  }

  const result = (await response.json()) as { commit?: { sha?: string } };
  return {
    mode: "github",
    updatedAt: new Date().toISOString(),
    commitSha: result.commit?.sha,
  };
}

export async function getContent(locale: Locale): Promise<SiteContent> {
  if (githubReady()) {
    try {
      return await readFromGithub(locale);
    } catch (error) {
      console.error("GitHub content read failed; using local fallback:", error);
    }
  }

  const raw = await fs.readFile(localePath(locale), "utf8");
  return JSON.parse(raw) as SiteContent;
}

export async function saveContent(locale: Locale, content: SiteContent): Promise<AdminSaveResult> {
  if (githubReady()) return saveToGithub(locale, content);

  const normalized = {
    ...content,
    locale,
    direction: locale === "ar" ? "rtl" : "ltr",
  } satisfies SiteContent;

  if (process.env.NODE_ENV === "production") {
    throw new Error("Publishing is not configured. Add GITHUB_TOKEN and GITHUB_REPO in Vercel before publishing.");
  }

  await fs.writeFile(localePath(locale), `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return { mode: "local-json", updatedAt: new Date().toISOString() };
}

export function getStorageMode() {
  return githubReady() ? "github" : "local-json";
}

export async function uploadMedia(file: File): Promise<AdminMediaUploadResult> {
  const allowed = new Set(["image/png", "image/jpeg", "image/webp"]);
  if (!allowed.has(file.type)) throw new Error("Only PNG, JPEG, and WebP files are allowed");
  if (file.size > 5 * 1024 * 1024) throw new Error("Maximum upload size is 5 MB");

  const safeBase = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filename = `${Date.now()}-${safeBase || "asset"}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (githubReady()) {
    const repo = process.env.GITHUB_REPO!;
    const branch = process.env.GITHUB_BRANCH || "main";
    const root = (process.env.GITHUB_MEDIA_PATH || "public/uploads").replace(/^\/+|\/+$/g, "");
    const target = `${root}/${filename}`;
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${target}`, {
      method: "PUT",
      headers: githubHeaders(),
      body: JSON.stringify({
        message: `CMS: upload ${filename}`,
        content: bytes.toString("base64"),
        branch,
      }),
    });
    if (!response.ok) throw new Error(`GitHub media upload failed (${response.status})`);
    const publicPath = `/${target.replace(/^public\//, "")}`;
    return { path: publicPath, mode: "github" as const };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Media publishing is not configured. Add GITHUB_TOKEN and GITHUB_REPO in Vercel.");
  }

  const localDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(localDir, { recursive: true });
  await fs.writeFile(path.join(localDir, filename), bytes);
  return { path: `/uploads/${filename}`, mode: "local-json" as const };
}
