import { getState, send, sendError } from "../server/lib.mjs";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return send(response, 405, { error: "Method not allowed." });
  }

  try {
    return send(response, 200, await getState());
  } catch (error) {
    return sendError(response, error);
  }
}
