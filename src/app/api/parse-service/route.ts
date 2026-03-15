import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

const SegmentSchema = z.object({
  segments: z
    .array(
      z.object({
        title: z.string().describe("The name/description of the segment"),
        duration: z
          .number()
          .describe("Duration in minutes as an integer (minimum 1)"),
        person: z
          .string()
          .optional()
          .describe("Name of the person responsible for this segment"),
      })
    )
    .describe("Array of program segments in chronological order"),
});

const SYSTEM_PROMPT = `You are a church service order parser. Extract structured program segments from unstructured service order text.

Guidelines:
1. Extract all program segments in chronological order
2. Calculate duration from time ranges if provided (e.g., "10:10am - 10:20am" = 10 minutes), otherwise use the explicit duration
3. Handle common inconsistencies gracefully:
   - "pm" that should be "am" (e.g., "10:25pm" in a morning service should be treated as 10:25am)
   - Misnumbered items (order them chronologically by time)
   - Missing information (omit optional fields if not present)
4. Clean up segment titles:
   - Remove leading numbers, bullets, asterisks, and formatting markers
   - Keep the essential description
5. Duration must be at least 1 minute. If a segment has no duration info, estimate a reasonable default (e.g., 5 minutes for announcements, 30 minutes for sermon/word)
6. Extract person/speaker names when present (often after dashes, parentheses, or at the end of a line)`;

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const anthropic = createAnthropic({ apiKey });
    const modelId = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

    const result = await generateObject({
      model: anthropic(modelId),
      schema: SegmentSchema,
      system: SYSTEM_PROMPT,
      prompt: `Parse the following service order text and extract all program segments:\n\n${text}`,
    });

    const segments = result.object.segments.map((segment, index) => ({
      ...segment,
      id: `gen-${Date.now()}-${index}`,
    }));

    return NextResponse.json({ segments });
  } catch (error) {
    console.error("Error parsing service order:", error);

    let errorMessage = "Failed to parse service order";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("Overloaded") || error.message.includes("529")) {
        errorMessage = "AI service is temporarily overloaded. Please try again.";
        statusCode = 503;
      } else if (error.message.includes("401") || error.message.includes("authentication")) {
        errorMessage = "Invalid API key. Check your ANTHROPIC_API_KEY.";
        statusCode = 401;
      } else if (error.message.includes("rate") || error.message.includes("429")) {
        errorMessage = "Rate limit exceeded. Please wait before trying again.";
        statusCode = 429;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
