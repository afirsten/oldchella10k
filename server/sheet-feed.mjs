import { redis } from "./lib.mjs";

const SHEET_ID = "1UkuA5apWL5PZ2XQkZP_r9horqKtial1FCrk5Vn3HK88";
export const SHEET_TABS = {
  recipes: { gid: "0", label: "recipes" },
  inspiration: { gid: "1013060614", label: "inspiration" },
};

const META_PREFIX = "rippedchella:sheet-meta:v3:";
const META_TTL_HIT = 60 * 60 * 24 * 7;
const META_TTL_MISS = 60 * 60 * 12;
const FETCH_TIMEOUT_MS = 4500;

const USELESS_DESCRIPTIONS = [
  /^enjoy the videos and music you love/i,
  /^tiktok - make your day/i,
  /^see posts,? photos and more on facebook/i,
];

export function sheetCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const input = String(text || "").replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((entry) => entry.some((value) => String(value).trim()));
}

function youtubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0] || "";
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
        return parts[1] || "";
      }
    }
  } catch {
    /* ignore */
  }
  return "";
}

function titleFromUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host.includes("instagram")) return "Instagram post";
    if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube video";
    if (host.includes("tiktok")) return "TikTok video";
    const parts = parsed.pathname.split("/").filter(Boolean);
    const slug = parts[parts.length - 1] || "";
    const titled = slug
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
    return titled || host;
  } catch {
    return "Link";
  }
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .trim();
}

function cleanDescription(value) {
  const text = decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
  if (!text || text.length < 8) return "";
  if (USELESS_DESCRIPTIONS.some((pattern) => pattern.test(text))) return "";
  return text.length > 220 ? `${text.slice(0, 217).trim()}…` : text;
}

export function parseSheetLinkRows(text) {
  const rows = parseCsvRows(text);
  if (!rows.length) return [];
  const headers = rows[0].map((header) => String(header).trim().toLowerCase());
  const linkIdx = headers.findIndex(
    (header) =>
      header.includes("link") ||
      header.includes("url") ||
      /^(recipe|inspiration)$/.test(header),
  );
  const contributorIdx = headers.findIndex((header) =>
    /contributor|author|by|name|who/.test(header),
  );
  const imageIdx = headers.findIndex((header) => /image|thumb|photo|pic/.test(header));
  const descriptionIdx = headers.findIndex((header) =>
    /description|note|notes|blurb|caption|about/.test(header),
  );
  const urlColumn = linkIdx >= 0 ? linkIdx : 0;
  const whoColumn = contributorIdx >= 0 ? contributorIdx : 1;

  return rows
    .slice(1)
    .map((row) => {
      const url = String(row[urlColumn] || "").trim();
      if (!/^https?:\/\//i.test(url)) return null;
      const contributor = String(row[whoColumn] || "").trim();
      const sheetImage = imageIdx >= 0 ? String(row[imageIdx] || "").trim() : "";
      const note = descriptionIdx >= 0 ? String(row[descriptionIdx] || "").trim() : "";
      const yt = youtubeId(url);
      const image = /^https?:\/\//i.test(sheetImage)
        ? sheetImage
        : yt
          ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg`
          : "";
      let host = "";
      try {
        host = new URL(url).hostname.replace(/^www\./, "");
      } catch {
        host = "";
      }
      return {
        title: titleFromUrl(url),
        url,
        contributor,
        note,
        description: note,
        linkDescription: "",
        image,
        host,
      };
    })
    .filter(Boolean);
}

async function softRedis(command) {
  try {
    return await redis(command);
  } catch {
    return null;
  }
}

function extractMetaContent(html, keys) {
  for (const key of keys) {
    const patterns = [
      new RegExp(`property=["']${key}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`content=["']([^"']+)["'][^>]*property=["']${key}["']`, "i"),
      new RegExp(`name=["']${key}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`content=["']([^"']+)["'][^>]*name=["']${key}["']`, "i"),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decodeHtmlEntities(match[1]);
    }
  }
  return "";
}

function extractTitleTag(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1]) : "";
}

async function fetchPageHtml(pageUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(pageUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (compatible; RippedChellaBot/1.0; +https://rippedchella.vercel.app)",
      },
    });
    if (!response.ok) return "";
    const contentType = response.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml/i.test(contentType) && contentType) return "";
    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

async function fetchYoutubeOEmbed(pageUrl) {
  try {
    const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(pageUrl)}`;
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchLinkMeta(pageUrl) {
  const html = await fetchPageHtml(pageUrl);
  let title = "";
  let description = "";
  let image = "";

  if (html) {
    const slice = html.slice(0, 220_000);
    title =
      extractMetaContent(slice, ["og:title", "twitter:title"]) || extractTitleTag(slice);
    description = cleanDescription(
      extractMetaContent(slice, ["og:description", "twitter:description", "description"]),
    );
    const imageRaw = extractMetaContent(slice, [
      "og:image:secure_url",
      "og:image",
      "twitter:image",
    ]);
    if (imageRaw) {
      try {
        image = new URL(imageRaw, pageUrl).toString();
      } catch {
        image = "";
      }
    }
  }

  if (youtubeId(pageUrl)) {
    const oembed = await fetchYoutubeOEmbed(pageUrl);
    if (oembed?.title) title = decodeHtmlEntities(oembed.title);
    if (!image && oembed?.thumbnail_url) image = oembed.thumbnail_url;
  }

  return {
    title: title || "",
    description,
    image,
  };
}

export async function enrichLinkItems(items, { enrichCopy = false } = {}) {
  return Promise.all(
    items.map(async (item) => {
      const needsImage = !item.image;
      const needsCopy =
        enrichCopy &&
        (!item.title || item.title === titleFromUrl(item.url) || !item.linkDescription);
      if (!needsImage && !needsCopy) return item;

      const cacheKey = `${META_PREFIX}${item.url}`;
      const cachedRaw = await softRedis(["GET", cacheKey]);
      let meta = null;
      if (typeof cachedRaw === "string" && cachedRaw) {
        try {
          meta = JSON.parse(cachedRaw);
        } catch {
          meta = null;
        }
      }

      const cacheMissesTitle =
        needsCopy &&
        meta &&
        !meta.title &&
        (!item.title || item.title === titleFromUrl(item.url));

      if (!meta || cacheMissesTitle) {
        meta = await fetchLinkMeta(item.url);
        const ttl = meta.title || meta.description || meta.image ? META_TTL_HIT : META_TTL_MISS;
        await softRedis(["SET", cacheKey, JSON.stringify(meta), "EX", ttl]);
      }

      return {
        ...item,
        title: enrichCopy && meta.title ? meta.title : item.title,
        linkDescription: enrichCopy ? meta.description || "" : item.linkDescription || "",
        image: item.image || meta.image || "",
      };
    }),
  );
}

export async function loadSheetFeed(tabKey) {
  const tab = SHEET_TABS[tabKey];
  if (!tab) throw new Error(`Unknown sheet tab: ${tabKey}`);
  const response = await fetch(sheetCsvUrl(tab.gid), {
    headers: { Accept: "text/csv,text/plain,*/*" },
  });
  if (!response.ok) {
    const error = new Error(
      "Sheet could not be loaded. Check that it is shared with Anyone with the link.",
    );
    error.status = 502;
    throw error;
  }
  const csv = await response.text();
  if (/^\s*<!DOCTYPE html/i.test(csv) || /accounts\.google\.com/i.test(csv)) {
    const error = new Error(
      "Sheet is still private. Share it with Anyone with the link (Viewer).",
    );
    error.status = 403;
    throw error;
  }
  const enrichCopy = tabKey === "inspiration" || tabKey === "recipes";
  const items = await enrichLinkItems(parseSheetLinkRows(csv), { enrichCopy });
  return {
    items,
    count: items.length,
    tab: tab.label,
    source: "google-sheet",
    updatedAt: new Date().toISOString(),
  };
}
