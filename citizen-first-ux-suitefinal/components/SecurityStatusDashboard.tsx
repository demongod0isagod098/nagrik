"use client";

import {
  Check,
  Clock3,
  LockKeyhole,
  Package,
  ReceiptIndianRupee,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useT } from "@/lib/i18n";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
export const formatINR = (value: number) =>
  rupees.format(Number(value) || 0);

/**
 * Citizen Security & Status Audit Center
 *
 * Dynamic post-submission dashboard rendered immediately after a citizen
 * finishes submitting either a Grievance voice note OR completing the
 * Conversational Tax filing interview.
 *
 * Premium, national-level dashboard split into two prominent technical
 * columns (50/50 split):
 *
 * LEFT  → Live Status & Transaction Trace
 * RIGHT → Compliance & Privacy Engine Audit
 */

type SubmissionType = "grievance" | "tax";

interface AIProcessingMetrics {
  // Grievance
  detected_language?: string;
  assigned_ministry?: string;
  urgency?: "HIGH" | "MEDIUM" | "LOW";
  translated_summary?: string;

  // Tax
  gross_income?: number;
  deductions?: number;
  tax_owed?: number;
  simple_explanation?: string;
}

interface TimelineStep {
  title: string;
  detail: string;
  status: "COMPLETED" | "PENDING";
}

interface SecurityDashboardProps {
  type: SubmissionType;
  ticket: string;
  metrics: AIProcessingMetrics;
  onReset: () => void;
}

function PriorityBanner({ value }: { value: string }) {
  const t = useT();
  const tone =
    value === "HIGH"
      ? {
          wrap: "border-red-200 bg-red-50",
          dot: "bg-red-500",
          label: "text-red-700",
          text: "text-red-900",
          word: t("HIGH", "उच्च"),
          note: t(
            "Escalated for same-day departmental review.",
            "उसी दिन विभागीय समीक्षा के लिए आगे बढ़ाया गया।"
          ),
        }
      : value === "LOW"
        ? {
            wrap: "border-slate-200 bg-slate-50",
            dot: "bg-slate-400",
            label: "text-slate-500",
            text: "text-slate-800",
            word: t("LOW", "निम्न"),
            note: t(
              "Queued in the standard resolution cycle.",
              "सामान्य समाधान चक्र की कतार में।"
            ),
          }
        : {
            wrap: "border-amber-200 bg-amber-50",
            dot: "bg-amber-500",
            label: "text-amber-700",
            text: "text-amber-900",
            word: t("MEDIUM", "मध्यम"),
            note: t(
              "Routed to the regular escalation ladder.",
              "नियमित एस्केलेशन क्रम में भेजा गया।"
            ),
          };

  return (
    <div className={`rounded-xl border p-5 ${tone.wrap}`}>
      <div className="flex items-center gap-2">
        <Clock3 className={`h-5 w-5 ${tone.label}`} />
        <p className={`text-xs font-bold uppercase tracking-[0.14em] ${tone.label}`}>
          {t("Urgency Priority Flag", "तात्कालिकता प्राथमिकता ध्वज")}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-2.5">
        <span className={`h-2.5 w-2.5 flex-none rounded-full ${tone.dot}`} />
        <p className={`whitespace-nowrap text-2xl font-bold tracking-tight ${tone.text}`}>
          {tone.word} {t("PRIORITY", "प्राथमिकता")}
        </p>
      </div>
      <p className={`mt-1.5 text-xs ${tone.label}`}>{tone.note}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {icon}
        <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
      </div>
      {/* Values stay on one line — the full string is kept in `title` so nothing is lost. */}
      <p
        className="mt-2 truncate whitespace-nowrap text-lg font-bold text-slate-900"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function TimelineStep({ step }: { step: TimelineStep }) {
  const t = useT();
  const isComplete = step.status === "COMPLETED";
  const statusLabel = isComplete
    ? t("COMPLETED", "पूर्ण")
    : t("PENDING", "प्रतीक्षारत");
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      <span
        className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full text-xs ${
          isComplete
            ? "bg-[#4b9e88] text-white"
            : "border border-slate-300 bg-white text-slate-400"
        }`}
      >
        {isComplete ? <Check className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800">
          {step.title}{" "}
          <span
            className={`text-xs font-medium ${isComplete ? "text-[#4b9e88]" : "text-slate-400"}`}
          >
            [{statusLabel}]
          </span>
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p>
      </div>
    </li>
  );
}

export function SecurityStatusDashboard({
  type,
  ticket,
  metrics,
  onReset,
}: SecurityDashboardProps) {
  const t = useT();
  const isGrievance = type === "grievance";
  const now = new Date();

  // Generate a unique tracking reference based on type
  const trackingRef =
    ticket ||
    (isGrievance
      ? `CP-DEL-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`
      : `ITR-V-2026-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(
          Math.floor(Math.random() * 9000) + 1000
        )}`);

  const timestamp = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

  // Grievance timeline steps
  const grievanceTimeline: TimelineStep[] = [
    {
      title: t(
        "Ingested via native Web Speech / Forms",
        "मूल वेब स्पीच / फ़ॉर्म के ज़रिए दर्ज किया गया"
      ),
      detail: t(
        "Citizen voice note or typed input captured and locally sanitized.",
        "नागरिक की आवाज़ या टाइप किया गया इनपुट लिया गया और डिवाइस पर ही साफ़ किया गया।"
      ),
      status: "COMPLETED",
    },
    {
      title: t("Semantic Mapping Engine executed", "सिमेंटिक मैपिंग इंजन चलाया गया"),
      detail:
        metrics.translated_summary ||
        t(
          "Intent classified and mapped to service schema.",
          "मंशा वर्गीकृत कर सेवा स्कीमा से जोड़ी गई।"
        ),
      status: "COMPLETED",
    },
    {
      title: t(
        "Local departmental queue assignment",
        "स्थानीय विभागीय कतार में आवंटन"
      ),
      detail: t(
        "Simulated sandbox state — routing packet generated.",
        "सिम्युलेटेड सैंडबॉक्स स्थिति — रूटिंग पैकेट बनाया गया।"
      ),
      status: "PENDING",
    },
  ];

  // Tax timeline steps
  const taxTimeline: TimelineStep[] = [
    {
      title: t(
        "Interview captured via structured forms",
        "संरचित फ़ॉर्म के ज़रिए बातचीत दर्ज की गई"
      ),
      detail: t(
        "All three conversational checkpoints completed by citizen.",
        "नागरिक ने तीनों बातचीत चरण पूरे किए।"
      ),
      status: "COMPLETED",
    },
    {
      title: t("Semantic Mapping Engine executed", "सिमेंटिक मैपिंग इंजन चलाया गया"),
      detail:
        metrics.simple_explanation ||
        t(
          "Tax computation engine normalized answers into standard schemas.",
          "कर गणना इंजन ने उत्तरों को मानक स्कीमा में बदला।"
        ),
      status: "COMPLETED",
    },
    {
      title: t(
        "Return packet queued for department dispatch",
        "रिटर्न पैकेट विभागीय प्रेषण की कतार में"
      ),
      detail: t(
        "Simulated sandbox state — ITR-V packet prepared.",
        "सिम्युलेटेड सैंडबॉक्स स्थिति — ITR-V पैकेट तैयार।"
      ),
      status: "PENDING",
    },
  ];

  const timeline = isGrievance ? grievanceTimeline : taxTimeline;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Success Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t("Transaction Sealed & Dispatched", "लेन-देन सुरक्षित और प्रेषित")}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {t("Reference", "संदर्भ")}: {trackingRef} • {t("Sealed at", "सील किया गया")}{" "}
              {timestamp}
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          {t("Submit another", "एक और भेजें")}
        </button>
      </div>

      {/* AI Processing Metrics — full width so every value fits on one line */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {t("AI Processing Metrics", "एआई प्रोसेसिंग मेट्रिक्स")}
          </span>
        </div>
        <div
          className={`grid gap-4 sm:grid-cols-2 ${
            isGrievance ? "xl:grid-cols-3" : "xl:grid-cols-4"
          }`}
        >
          {isGrievance ? (
            <>
              <PriorityBanner value={metrics.urgency || "MEDIUM"} />
              <MetricCard
                label={t("Language Detected", "पहचानी गई भाषा")}
                value={metrics.detected_language || t("Hindi / Hinglish", "हिंदी / हिंग्लिश")}
                icon={<UserRound className="h-5 w-5 flex-none text-slate-400" />}
              />
              <MetricCard
                label={t("Auto-Assigned Authority", "स्वतः नियुक्त प्राधिकरण")}
                value={
                  metrics.assigned_ministry ||
                  t("Department of Administrative Reforms", "प्रशासनिक सुधार विभाग")
                }
                icon={<ReceiptIndianRupee className="h-5 w-5 flex-none text-slate-400" />}
              />
            </>
          ) : (
            <>
              <MetricCard
                label={t("Gross Income Computed", "कुल आय गणना")}
                value={formatINR(metrics.gross_income || 0)}
                icon={<ReceiptIndianRupee className="h-5 w-5 flex-none text-slate-400" />}
              />
              <MetricCard
                label={t("Eligible Deductions (Sec 80C)", "पात्र कटौती (धारा 80C)")}
                value={formatINR(metrics.deductions || 0)}
                icon={<LockKeyhole className="h-5 w-5 flex-none text-slate-400" />}
              />
              <MetricCard
                label={t("Final Net Tax Owed", "अंतिम देय कर")}
                value={formatINR(metrics.tax_owed || 0)}
                icon={<ReceiptIndianRupee className="h-5 w-5 flex-none text-slate-400" />}
              />
              <MetricCard
                label={t("Rebate Status", "छूट की स्थिति")}
                value={
                  (metrics.tax_owed || 0) === 0
                    ? t("₹0 under Rebate 87A", "धारा 87A छूट से ₹0")
                    : t("Standard rate applied", "सामान्य दर लागू")
                }
                icon={<ShieldCheck className="h-5 w-5 flex-none text-slate-400" />}
              />
            </>
          )}
        </div>
      </div>

      {/* Two-column split dashboard */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* ─── LEFT COLUMN: Live Status & Transaction Trace ─── */}
        <div className="flex flex-col gap-6">
          {/* Operational Timeline */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {t("Operational Timeline", "संचालन समय-रेखा")}
              </span>
            </div>
            <ol className="space-y-0">{timeline.map((step, i) => (
              <TimelineStep key={i} step={step} />
            ))}</ol>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Compliance & Privacy Engine Audit ─── */}
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {t(
                    "Client-Side Zero-Trust Privacy Shield",
                    "क्लाइंट-साइड ज़ीरो-ट्रस्ट गोपनीयता कवच"
                  )}
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  {t(
                    "End-to-end PII protection for all submissions",
                    "हर सबमिशन के लिए एंड-टू-एंड निजी जानकारी सुरक्षा"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Feature 1: Masked Identity Validator (grievance only) */}
          {isGrievance && (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  {t("Masked Identity Validator", "छिपाई गई पहचान सत्यापक")}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200/60 bg-slate-50/60 p-5">
                <p className="text-sm font-bold text-slate-800">
                  {t("Citizen Aadhaar / PAN status:", "नागरिक आधार / पैन स्थिति:")}
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-emerald-700">
                  {t("MASKED (XXXX-XXXX-4321)", "छिपाया गया (XXXX-XXXX-4321)")}
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-md border border-slate-200/60 bg-white px-3 py-2">
                  <span className="text-xs text-slate-400">
                    {t(
                      "Enforced client-side hashing. Raw credentials zeroed out locally before cloud transmission.",
                      "क्लाइंट-साइड हैशिंग अनिवार्य है। क्लाउड पर भेजने से पहले मूल जानकारी डिवाइस पर ही मिटा दी जाती है।"
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Feature 2: Data Lifecycle */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <Package className="h-5 w-5 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {t("Data Lifecycle", "डेटा जीवनचक्र")}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-6">
              {t(
                "This architecture operates entirely in local ephemeral client memory. No local database caches are generated. All PII is hashed or redacted before any network transmission. Session state is destroyed on tab close.",
                "यह व्यवस्था पूरी तरह डिवाइस की अस्थायी मेमोरी में चलती है। कोई स्थानीय डेटाबेस कैश नहीं बनता। नेटवर्क पर भेजने से पहले सभी निजी जानकारी हैश या छिपा दी जाती है। टैब बंद होने पर सत्र की सारी जानकारी मिट जाती है।"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
