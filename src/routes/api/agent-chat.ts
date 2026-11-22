import { createFileRoute } from "@tanstack/react-router";

const UPSTREAM = "https://demo-agent-analytics-server.vercel.app/api/chat";

export const Route = createFileRoute("/api/agent-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = new Headers({ "content-type": "application/json" });
        request.headers.forEach((value, name) => {
          if (name.toLowerCase().startsWith("x-amplitude-")) headers.set(name, value);
        });

        const upstream = await fetch(UPSTREAM, {
          method: "POST",
          headers,
          body: await request.text(),
        });

        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "content-type": upstream.headers.get("content-type") ?? "text/event-stream",
            "cache-control": "no-cache, no-transform",
            "x-accel-buffering": "no",
          },
        });
      },
    },
  },
});