import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { buildQueries } from "@/lib/queries";

export async function POST(req: Request) {
  const { name } = await req.json();

  if (!name?.trim()) {
    return new Response("Name required", { status: 400 });
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const queries = buildQueries(name.trim());

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send the query list so client can show overlay
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "queries", queries: queries.map((q) => q.label) })}\n\n`
          )
        );

        const response = await client.beta.messages.stream(
          {
            model: "claude-sonnet-4-6",
            max_tokens: 16000,
            system: buildSystemPrompt(name.trim()),
            messages: [
              {
                role: "user",
                content: `Compile a complete intelligence report on: ${name.trim()}\n\nRun all required searches first, then write the full 10-section report. Be exhaustive and specific.`,
              },
            ],
            tools: [
              {
                type: "web_search_20250305" as "web_search_20250305",
                name: "web_search",
                max_uses: 20,
              },
            ],
          },
          {
            headers: {
              "anthropic-beta": "web-search-2025-03-05",
            },
          }
        );

        for await (const event of response) {
          if (event.type === "content_block_start") {
            if (event.content_block.type === "tool_use" && event.content_block.name === "web_search") {
              // Signal a search is starting
              const inputBlock = event.content_block as { input?: { query?: string } };
              const queryText = inputBlock.input?.query || "";
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "search_start", query: queryText })}\n\n`
                )
              );
            }
          }

          if (event.type === "content_block_delta") {
            if (event.delta.type === "text_delta") {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`
                )
              );
            }
            if (event.delta.type === "input_json_delta") {
              // Accumulate tool input — we handle search_done at content_block_stop
            }
          }

          if (event.type === "message_stop") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
            );
          }
        }

        // Final done signal
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
