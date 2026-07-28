import { send, sendError } from "../server/lib.mjs";
import { loadSheetFeed } from "../server/sheet-feed.mjs";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return send(response, 405, { error: "Method not allowed." });
  }

  try {
    const feed = await loadSheetFeed("recipes");
    return send(
      response,
      200,
      {
        recipes: feed.items,
        count: feed.count,
        source: feed.source,
        updatedAt: feed.updatedAt,
      },
      { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" },
    );
  } catch (error) {
    return sendError(response, error);
  }
}
