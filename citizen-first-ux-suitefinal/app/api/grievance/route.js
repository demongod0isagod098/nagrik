import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const defaultResult = { detected_language: "Hindi / Hinglish", translated_summary: "Citizen reports a local civic-service issue and requests a prompt resolution.", assigned_ministry: "Ministry of Housing and Urban Affairs", urgency: "MEDIUM" };

function reply(payload, status = 200) {
  return NextResponse.json(payload, { status, headers: { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
}

function fallbackFor(text) {
  const normalized = text.toLowerCase();
  const urgent = /fire|accident|flood|blood|hospital|danger|emergency|aag|haadsa|baadh|khatra/.test(normalized);
  const municipal = /water|pipe|drain|sewer|garbage|street|road|light|pani|naali|sadak|bijli/.test(normalized);
  return {
    detected_language: /[\u0900-\u097F]/.test(text) ? "Hindi" : "English / Hinglish",
    translated_summary: municipal ? "Citizen reports a municipal infrastructure issue and requests local action." : defaultResult.translated_summary,
    assigned_ministry: municipal ? "Ministry of Housing and Urban Affairs" : "Department of Administrative Reforms and Public Grievances",
    urgency: urgent ? "HIGH" : "MEDIUM",
  };
}

function validate(value, fallback) {
  return {
    detected_language: typeof value?.detected_language === "string" && value.detected_language.trim() ? value.detected_language.trim().slice(0, 80) : fallback.detected_language,
    translated_summary: typeof value?.translated_summary === "string" && value.translated_summary.trim() ? value.translated_summary.trim().slice(0, 500) : fallback.translated_summary,
    assigned_ministry: typeof value?.assigned_ministry === "string" && value.assigned_ministry.trim() ? value.assigned_ministry.trim().slice(0, 160) : fallback.assigned_ministry,
    urgency: ["HIGH", "MEDIUM", "LOW"].includes(value?.urgency) ? value.urgency : fallback.urgency,
  };
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return reply({ ...defaultResult, source: "fallback" }, 400); }
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 2000) : "";
  const fallback = fallbackFor(text);
  if (!text) return reply({ ...fallback, source: "fallback" }, 400);
  if (!client) return reply({ ...fallback, source: "fallback" });
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: 'You are an official Indian public grievance router. Analyze the user text. Return a strict JSON object with exactly these keys: {"detected_language":"string","translated_summary":"string","assigned_ministry":"string","urgency":"HIGH"|"MEDIUM"|"LOW"}. Do not include names, phone numbers, Aadhaar numbers, PAN numbers, addresses, or other personal data in the summary.' },
        { role: "user", content: text },
      ],
    });
    const content = completion.choices[0]?.message?.content;
    return reply({ ...validate(typeof content === "string" ? JSON.parse(content) : null, fallback), source: "ai" });
  } catch { return reply({ ...fallback, source: "fallback" }); }
}
