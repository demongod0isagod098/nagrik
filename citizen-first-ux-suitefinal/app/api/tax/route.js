import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const amount = (value, maximum = 100000000) => { const parsed = Number(value); return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), maximum) : 0; };
const reply = (payload, status = 200) => NextResponse.json(payload, { status, headers: { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });

function fallbackTax(answers) {
  const grossIncome = Math.round(amount(answers?.annualIncome));
  const deductions = grossIncome > 0 ? Math.min(grossIncome, 75000) : 0;
  const taxable = Math.max(0, grossIncome - deductions);
  const slabs = [[400000, 0], [800000, 0.05], [1200000, 0.1], [1600000, 0.15], [2000000, 0.2], [2400000, 0.25], [Infinity, 0.3]];
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) { tax += Math.max(0, Math.min(taxable, upper) - lower) * rate; lower = upper; if (taxable <= upper) break; }
  const taxOwed = Math.round((taxable <= 1200000 ? 0 : tax) * 1.04);
  return {
    gross_income: grossIncome,
    deductions,
    tax_owed: taxOwed,
    simple_explanation: taxOwed === 0 ? "Under these simplified new-regime assumptions, your estimated tax is zero after the standard deduction and rebate. This is a demo estimate, not a tax filing." : "This is a simplified new-regime estimate after the standard deduction and 4% health and education cess. Confirm your final return with official tax guidance before filing.",
  };
}

function validate(value, fallback) {
  return {
    gross_income: amount(value?.gross_income) || fallback.gross_income,
    deductions: amount(value?.deductions),
    tax_owed: amount(value?.tax_owed),
    simple_explanation: typeof value?.simple_explanation === "string" && value.simple_explanation.trim() ? value.simple_explanation.trim().slice(0, 420) : fallback.simple_explanation,
  };
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return reply({ ...fallbackTax({}), source: "fallback" }, 400); }
  const answers = { workType: typeof body?.workType === "string" ? body.workType.slice(0, 80) : "", annualIncome: amount(body?.annualIncome), monthlyRent: amount(body?.monthlyRent), savings: amount(body?.savings) };
  const fallback = fallbackTax(answers);
  if (!answers.annualIncome) return reply({ ...fallback, source: "fallback" }, 400);
  if (!client) return reply({ ...fallback, source: "fallback" });
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: 'You are an empathetic Indian Income Tax Calculator assistant. Analyze the user answers. Calculate tax liability using standard simplified assumptions under the new tax regime, including a 75,000 INR standard deduction and 4% cess where applicable. Do not treat rent or savings as deductions under this simplified new-regime calculation. Return a strict JSON object with exactly these keys: {"gross_income":number,"deductions":number,"tax_owed":number,"simple_explanation":"A friendly human explanation under 2 sentences."}. This is an educational estimate, not tax advice.' },
        { role: "user", content: JSON.stringify(answers) },
      ],
    });
    const content = completion.choices[0]?.message?.content;
    return reply({ ...validate(typeof content === "string" ? JSON.parse(content) : null, fallback), source: "ai" });
  } catch { return reply({ ...fallback, source: "fallback" }); }
}
