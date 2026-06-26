import { getRequestListener } from "@hono/node-server";
import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../src/api/index";

// Vercel Serverless Function — wrap Hono app with Node.js request listener
const handler = getRequestListener(app.fetch);

export default function (req: IncomingMessage, res: ServerResponse) {
  return handler(req, res);
}
