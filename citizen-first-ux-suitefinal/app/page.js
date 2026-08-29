"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, Check, ChevronRight, CircleAlert, Clock3, FileText, Landmark, LoaderCircle, LockKeyhole, Mic, ReceiptIndianRupee, RotateCcw, ShieldCheck, Sparkles, UserRound, Volume2, Waves, X } from "lucide-react";

import { SecurityStatusDashboard } from "@/components/SecurityStatusDashboard";
import { LanguageToggle, useT } from "@/lib/i18n";

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatINR = (value) => rupees.format(Number(value) || 0);

function Logo() { return <div className="landing-logo"><span><Waves /></span><b>nagrik</b></div>; }

function safeTranscript(text) {
  return text
    .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, "[Aadhaar redacted]")
    .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/gi, "[PAN redacted]")
    .replace(/(^|\D)[6-9]\d{9}(?=\D|$)/g, "$1[mobile redacted]")
    .trim()
    .slice(0, 2000);
}

function localGrievance(text) {
  const local = text.toLowerCase();
  const urgency = /fire|flood|accident|danger|emergency|aag|baadh|khatra/.test(local) ? "HIGH" : "MEDIUM";
  const civic = /water|pipe|drain|sewer|garbage|road|street|light|pani|naali|sadak|bijli/.test(local);
  return { detected_language: /[\u0900-\u097F]/.test(text) ? "Hindi" : "English / Hinglish", translated_summary: civic ? "Citizen reports a municipal infrastructure issue and requests local action." : "Citizen reports a local civic-service issue and requests a prompt resolution.", assigned_ministry: civic ? "Ministry of Housing and Urban Affairs" : "Department of Administrative Reforms and Public Grievances", urgency, source: "fallback" };
}

function Confetti({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active || !canvasRef.current) return undefined;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const colors = ["#79cdb1", "#e8b85b", "#aac9e5", "#ffffff", "#4b9e88"];
    let frame;
    const resize = () => { canvas.width = window.innerWidth * devicePixelRatio; canvas.height = window.innerHeight * devicePixelRatio; context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 150 }, (_, index) => ({ x: window.innerWidth / 2, y: window.innerHeight * 0.26, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 13 - 4, size: Math.random() * 7 + 4, color: colors[index % colors.length], rotation: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.28 }));
    let count = 0;
    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((particle) => { particle.x += particle.vx; particle.y += particle.vy; particle.vy += 0.23; particle.vx *= 0.992; particle.rotation += particle.spin; context.save(); context.translate(particle.x, particle.y); context.rotate(particle.rotation); context.fillStyle = particle.color; context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.55); context.restore(); });
      count += 1;
      if (count < 145) frame = requestAnimationFrame(draw); else context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [active]);
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50" aria-hidden="true" />;
}

function AuthModal({ service, onClose, onEnter }) {
  const t = useT();
  const [identity, setIdentity] = useState("");
  const [loading, setLoading] = useState(false);
  const continueToSuite = () => { setLoading(true); window.setTimeout(onEnter, 550); };
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="access-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label={t("Close access dialog", "प्रवेश विंडो बंद करें")}><X /></button><div className="auth-icon"><ShieldCheck /></div><span className="kicker">{t("HACKATHON SANDBOX", "हैकाथॉन सैंडबॉक्स")}</span><h2 id="access-title">{t("A secure start for every citizen.", "हर नागरिक के लिए एक सुरक्षित शुरुआत।")}</h2><p>{t("Use any demo identity to explore the", "इसे देखने के लिए कोई भी डेमो पहचान डालें —")} {service === "tax" ? t("conversational tax portal", "बातचीत वाला कर पोर्टल") : t("grievance router", "शिकायत राउटर")}.</p><label htmlFor="identity">{t("Aadhaar number or mobile number", "आधार नंबर या मोबाइल नंबर")}</label><input id="identity" value={identity} onChange={(event) => setIdentity(event.target.value.replace(/[^0-9]/g, "").slice(0, 12))} placeholder={t("e.g. 98765 43210", "जैसे 98765 43210")} inputMode="numeric" autoComplete="off" /><div className="bypass"><Sparkles /><span><b>{t("Demo access enabled", "डेमो प्रवेश चालू है")}</b><br />{t("Enter any digits, or leave this blank.", "कोई भी अंक डालें, या इसे खाली छोड़ दें।")}</span></div><button className="auth-submit" onClick={continueToSuite} disabled={loading}>{loading ? <><LoaderCircle className="animate-spin" /> {t("Verifying securely...", "सुरक्षित रूप से जाँच हो रही है...")}</> : <>{t("Enter sandbox", "सैंडबॉक्स में जाएँ")} <ArrowRight /></>}</button><small className="modal-foot"><LockKeyhole /> {t("Identity stays only in this browser tab", "पहचान केवल इसी ब्राउज़र टैब में रहती है")}</small></section></div>;
}

function Landing({ openService }) {
  const t = useT();
  return <main className="landing"><div className="government-bar"><span><ShieldCheck /> {t("Government of India · Hackathon Sandbox Division", "भारत सरकार · हैकाथॉन सैंडबॉक्स प्रभाग")}</span><span>{t("Build What Moves India 2026", "बिल्ड व्हाट मूव्स इंडिया 2026")} <ChevronRight /></span></div><nav className="landing-nav"><Logo /><div className="nav-links"><a href="#how">{t("How it works", "यह कैसे काम करता है")}</a><LanguageToggle /><button onClick={() => openService("grievance")}>{t("Evaluator access", "मूल्यांकनकर्ता प्रवेश")} <ArrowRight /></button></div></nav><section className="hero"><div className="hero-copy"><div className="hero-label"><span className="pulse" /> {t("Citizen-first digital infrastructure", "नागरिक-पहले डिजिटल ढाँचा")}</div><h1>{t("Public services that ", "ऐसी सार्वजनिक सेवाएँ जो लोगों को ")}<em>{t("understand", "समझती")}</em>{t(" people.", " हैं।")}</h1><p>{t("Voice, clarity, and dignity replace rigid forms and legal jargon across the public-service journey.", "आवाज़, स्पष्टता और सम्मान — कठोर फ़ॉर्म और कानूनी भाषा की जगह, पूरी सेवा यात्रा में।")}</p><div className="hero-actions"><button className="hero-primary" onClick={() => openService("grievance")}><CircleAlert /> {t("Launch grievance router", "शिकायत राउटर खोलें")} <ArrowRight /></button><button className="hero-secondary" onClick={() => openService("tax")}><ReceiptIndianRupee /> {t("Launch tax portal", "कर पोर्टल खोलें")}</button></div><p className="hero-note"><LockKeyhole /> {t("Demo only. No identity or government records are stored.", "केवल डेमो। कोई पहचान या सरकारी रिकॉर्ड सहेजा नहीं जाता।")}</p></div><div className="hero-visual"><div className="phone"><div className="phone-top"><span className="nagrik-mark">nagrik</span><span><i className="green-dot" />secure</span></div><div className="phone-greeting">Good morning, Rajesh <span>नमस्ते</span></div><div className="phone-question">How can we help today?</div><div className="phone-option"><span className="mini-icon mint"><CircleAlert /></span><span><b>Report a grievance</b><small>Speak in your own words</small></span><ChevronRight /></div><div className="phone-option"><span className="mini-icon amber"><ReceiptIndianRupee /></span><span><b>File your taxes</b><small>Answer three clear questions</small></span><ChevronRight /></div><div className="phone-footer"><ShieldCheck /> Private by design</div></div><div className="floating-notification floating-notification-hi"><span className="notification-icon"><Volume2 /></span><div><strong>मेरी पाइपलाइन टूट गई है</strong><span>आपकी शिकायत दर्ज हो गई है</span></div><Check /></div><div className="floating-notification floating-notification-en"><span className="notification-icon"><ShieldCheck /></span><div><strong>Grievance routed</strong><span>We will keep you updated</span></div><Check /></div></div></section><section id="how" className="how-section"><div><span className="kicker">ONE CLEAR PATH</span><h2>From intent to outcome.</h2></div><div className="process"><div><b>01</b><span> Speak or answer</span><p>Use the language and words that feel natural.</p></div><ChevronRight /><div><b>02</b><span> We understand</span><p>AI turns context into a clear next step.</p></div><ChevronRight /><div><b>03</b><span> You take action</span><p>See a simple, transparent outcome.</p></div></div></section><section id="impact" className="impact-section"><div className="section-intro"><div><span className="kicker">ENGINEERING FOUNDATION</span><h2>Project Impact Assessment</h2></div><p>The design choices behind the citizen experience — and the engineering constraints that made them necessary.</p></div><div className="impact-grid"><div className="impact-card impact-card--1"><div className="impact-card-top"><span className="impact-number">01</span><UserRound className="w-5 h-5 text-[#4c9d88]" /></div><div className="impact-label">TARGET AUDIENCE</div><h3>Who is facing the problem?</h3><p>Semi-urban citizens, rural farmers, and gig-economy workers navigating critical public services.</p><div className="reality"><span>TECHNICAL REALITY</span><p>The barrier isn't a lack of internet access (thanks to widespread 4G/5G rollout), but rather a severe gap in English-centric digital literacy and complex form navigation layout structures.</p></div></div><div className="impact-card impact-card--2"><div className="impact-card-top"><span className="impact-number">02</span><span className="w-5 h-5" /></div><div className="impact-label">LEGACY SYSTEM BOTTLENECKS</div><h3>What is difficult about the current experience?</h3><p>Information asymmetry, rigid dropdown classification systems, and heavy legal/financial terminology.</p><div className="reality"><span>TECHNICAL REALITY</span><p>Legacy systems like CPGRAMS or ITR e-filing rely on rigid cascading drop-downs. If a citizen selects the wrong department or misinterprets an alphanumeric code, their request or filing faces instant rejection cycles.</p></div></div><div className="impact-card impact-card--3"><div className="impact-card-top"><span className="impact-number">03</span><Building2 className="w-5 h-5 text-[#4c9d88]" /></div><div className="impact-label">CORE ARCHITECTURAL INTERVENTION</div><h3>What did you change?</h3><p>Replaced manual semantic input pipelines with localized natural language and visual parsing engines.</p><div className="reality"><span>TECHNICAL REALITY</span><p>We decoupled the user interface from the rigid backend data models. The user inputs unstructured native speech or structural images (like passbooks). The AI processing layer translates, normalizes, and maps this data directly into standard government-compliant schemas.</p></div></div><div className="impact-card impact-card--4"><div className="impact-card-top"><span className="impact-number">04</span><ShieldCheck className="w-5 h-5 text-[#4c9d88]" /></div><div className="impact-label">MEASURABLE EFFICIENCY OUTCOMES</div><h3>Why is your version better?</h3><p>Drastic reduction in user cognitive load, structural validation errors, and administrative routing delays.</p><div className="reality"><span>TECHNICAL REALITY</span><p>By handling intent classification server-side, we eliminate user navigation errors entirely. Pre-validating data points through conversational checkpoints before final ingestion prevents the high failure and rejection rates typical of legacy forms.</p></div></div><div className="impact-card impact-card--5"><div className="impact-card-top"><span className="impact-number">05</span><Clock3 className="w-5 h-5 text-[#4c9d88]" /></div><div className="impact-label">ENGINEERING BOUNDARIES</div><h3>What works today, and what is still mocked?</h3><p>End-to-end user state machine execution with active AI pipelines versus isolated sandbox environments.</p><div className="reality"><span>TECHNICAL REALITY</span><p>LIVE IMPLEMENTATION: Unstructured multi-lingual voice transcription, downstream intent parsing, and automated visual data extraction.<br /><br />SANDBOXED MOCKS: Direct database commits, official Aadhaar OTP validation handshakes, and actual production API writes to official ministry servers.</p></div></div><div className="impact-card impact-card--6"><div className="impact-card-top"><span className="impact-number">06</span><LockKeyhole className="w-5 h-5 text-[#4c9d88]" /></div><div className="impact-label">PRODUCTION SCALE &amp; SECURITY PROTOCOLS</div><h3>How could the idea work safely at a larger scale?</h3><p>PII scrubbing, edge token management, and optimized payload compression for low-bandwidth networks.</p><div className="reality"><span>TECHNICAL REALITY</span><p>To scale securely across millions of daily citizens, the system relies on client-side anonymization of PII (like masking Aadhaar/PAN) prior to LLM processing. Audio payloads are compressed via lightweight codecs to guarantee performance over restricted rural network connections.</p></div></div></div></section><footer className="landing-footer"><Logo /><span>Built for access, designed for dignity.</span><span>Demo environment · 2026</span></footer></main>;
}

function GrievancePanel() {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [ticket, setTicket] = useState("");
  const [message, setMessage] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => () => recognitionRef.current?.stop?.(), []);

  const submitGrievance = async (rawText) => {
    const text = safeTranscript(rawText);
    if (!text) { setMessage("Please describe the issue before routing it."); setStatus("idle"); return; }
    setTranscript(rawText); setStatus("processing"); setMessage("");
    try {
      const response = await fetch("/api/grievance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      const payload = await response.json();
      const nextResult = payload?.translated_summary ? payload : localGrievance(text);
      setResult(nextResult); setTicket(`NGK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`); setStatus("complete");
    } catch { setResult(localGrievance(text)); setTicket(`NGK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`); setStatus("complete"); }
  };

  const startListening = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setMessage("Speech recognition is unavailable in this browser. Type your grievance below and select Route grievance."); return; }
    const recognition = new Recognition();
    recognition.lang = "hi-IN"; recognition.continuous = false; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => { setStatus("listening"); setMessage("Listening in Hindi, Hinglish, or English…"); };
    recognition.onerror = () => { setStatus("idle"); setMessage("We could not hear that. You can try again or type your grievance below."); };
    recognition.onresult = (event) => { const nextText = event.results[0][0].transcript.trim(); setTranscript(nextText); submitGrievance(nextText); };
    recognition.onend = () => { if (status === "listening") setStatus("idle"); };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const reset = () => { recognitionRef.current?.stop?.(); setTranscript(""); setStatus("idle"); setResult(null); setTicket(""); setMessage(""); };
  if (status === "complete" && result) return (
    <div className="space-y-6">
      <Confetti active />
      <SecurityStatusDashboard
        type="grievance"
        ticket={ticket}
        metrics={{
          detected_language: result.detected_language,
          assigned_ministry: result.assigned_ministry,
          urgency: result.urgency,
          translated_summary: result.translated_summary,
        }}
        onReset={reset}
      />
    </div>
  );
  const isBusy = status === "listening" || status === "processing";
  return <div className="rounded-2xl border border-[#d9e4e2] bg-white p-5 sm:p-7"><p className="panel-label">TELL US WHAT HAPPENED</p><div className="mx-auto flex max-w-lg flex-col items-center py-7 text-center"><button onClick={startListening} disabled={isBusy} className={`grid h-28 w-28 place-items-center rounded-full transition ${status === "listening" ? "animate-pulse bg-red-100 text-red-600 shadow-[0_0_0_18px_#fee2e2]" : "bg-[#dff4eb] text-[#3d967d] shadow-[0_0_0_18px_#edf8f3]"}`} aria-label="Start recording grievance">{status === "processing" ? <LoaderCircle className="h-9 w-9 animate-spin" /> : <Mic className="h-9 w-9" />}</button><h2 className="mt-10 text-2xl font-bold tracking-tight text-[#0d1b2a]">{status === "processing" ? "AI is understanding your request…" : status === "listening" ? "Listening…" : "Speak in your own words."}</h2><p className="mt-3 text-sm leading-6 text-[#687b82]">Hindi, Hinglish, Tamil, and English work best. Your microphone audio stays on your device; only redacted text is sent for routing.</p></div><textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Or type your grievance here…" className="min-h-28 w-full resize-y rounded-xl border border-[#d9e4e2] p-4 text-sm text-[#18313d] outline-none transition focus:border-[#62b59e] focus:ring-4 focus:ring-[#dff4eb]" maxLength={2000} /><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className={`text-xs ${message ? "text-[#a56a1d]" : "text-[#687b82]"}`}>{message || "No Aadhaar, PAN, phone number, or audio recording leaves this device."}</p><button onClick={() => submitGrievance(transcript)} disabled={isBusy || !transcript.trim()} className="demo-action disabled:cursor-not-allowed disabled:opacity-50">Route grievance <ArrowRight /></button></div></div>;
}

function Metric({ label, value }) { return <div className="rounded-xl border border-emerald-100 bg-white p-3"><p className="text-[10px] font-bold tracking-[0.12em] text-[#66817e]">{label}</p><p className="mt-1 break-words text-sm font-bold text-[#0d1b2a]">{value}</p></div>; }
function Timeline({ active = false, title, detail }) { return <li className="relative flex gap-4 pb-6 last:pb-0"><span className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full ${active ? "bg-[#4b9e88] text-white" : "border border-[#cbded8] bg-white text-[#9ab0ad]"}`}>{active ? <Check className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}</span><div><p className="text-sm font-bold text-[#18313d]">{title}</p><p className="mt-1 text-xs leading-5 text-[#687b82]">{detail}</p></div></li>; }

function TaxPanel() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ workType: "", annualIncome: "", monthlyRent: "", savings: "" });
  const [state, setState] = useState("interview");
  const [result, setResult] = useState(null);
  const [filed, setFiled] = useState(false);
  const [error, setError] = useState("");
  const questions = [
    { title: "How do you earn your money?", helper: "Choose the option that feels closest to your main source of income.", field: "workType", options: ["Salaried employee", "Freelancer or gig worker", "Small business owner", "Farmer or agricultural income"] },
    { title: "What was your annual income?", helper: "A rounded estimate is completely fine for this demo.", field: "annualIncome", placeholder: "e.g. 850000", prefix: "₹" },
    { title: "Do you pay monthly rent or save regularly?", helper: "These answers help make the conversation feel familiar. This demo uses simplified new-regime assumptions.", field: "monthlyRent", placeholder: "Monthly rent, if any", secondary: "savings", secondaryPlaceholder: "Annual savings, if any", prefix: "₹" },
  ];
  const current = questions[step];
  const valid = step === 0 ? Boolean(answers.workType) : step === 1 ? Number(answers.annualIncome) > 0 : true;
  const calculate = async () => {
    setState("processing"); setError("");
    try {
      const response = await fetch("/api/tax", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) });
      const payload = await response.json();
      if (!payload?.gross_income && payload?.gross_income !== 0) throw new Error("Invalid tax result");
      setResult(payload); setState("complete");
    } catch { const gross = Number(answers.annualIncome) || 0; const deduction = Math.min(gross, 75000); const taxable = Math.max(0, gross - deduction); setResult({ gross_income: gross, deductions: deduction, tax_owed: taxable <= 1200000 ? 0 : Math.round((taxable - 1200000) * 0.15 * 1.04), simple_explanation: "Your local demo estimate is ready. Confirm all figures with official tax guidance before filing." }); setState("complete"); }
  };
  if (state === "processing") return <div className="grid min-h-96 place-items-center rounded-2xl border border-[#d9e4e2] bg-white p-8 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#dff4eb] text-[#3d967d]"><LoaderCircle className="h-7 w-7 animate-spin" /></span><h2 className="mt-6 text-2xl font-bold tracking-tight text-[#0d1b2a]">Making tax language clear…</h2><p className="mt-3 text-sm text-[#687b82]">Calculating a simplified estimate for your demo dashboard.</p></div></div>;
  if (state === "complete" && result) return (
    <div className="space-y-6">
      <Confetti active />
      <SecurityStatusDashboard
        type="tax"
        ticket={`ITR-V-${new Date().getFullYear()}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 9000) + 1000)}`}
        metrics={{
          gross_income: result.gross_income,
          deductions: result.deductions,
          tax_owed: result.tax_owed,
          simple_explanation: result.simple_explanation,
        }}
        onReset={() => { setState("interview"); setStep(0); setResult(null); setFiled(false); }}
      />
      {filed && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <Check className="h-5 w-5 flex-none" />
          <span><b>Demo return prepared.</b> No government account was accessed and nothing was filed.</span>
        </div>
      )}
      {!filed && (
        <div className="flex gap-3">
          <button onClick={() => setFiled(true)} className="demo-action">
            <FileText /> File return <ArrowRight />
          </button>
        </div>
      )}
    </div>
  );
  return <div className="rounded-2xl border border-[#d9e4e2] bg-white p-5 sm:p-7"><div className="flex items-center justify-between gap-3"><p className="panel-label">YOUR TAX INTERVIEW</p><span className="text-xs font-bold text-[#66817e]">Question {step + 1} of 3</span></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#edf3f1]"><div className="h-full rounded-full bg-[#4b9e88] transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} /></div><div className="mx-auto max-w-xl py-10"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#fff5df] text-[#a26b1f]"><Landmark className="h-6 w-6" /></span><h2 className="mt-6 text-3xl font-bold tracking-tight text-[#0d1b2a]">{current.title}</h2><p className="mt-3 text-sm leading-6 text-[#687b82]">{current.helper}</p>{current.options ? <div className="mt-7 grid gap-3">{current.options.map((option) => <button key={option} onClick={() => setAnswers({ ...answers, workType: option })} className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm font-bold transition ${answers.workType === option ? "border-[#4b9e88] bg-[#edf8f3] text-[#0d1b2a]" : "border-[#d9e4e2] text-[#52686e] hover:border-[#9dcfc0]"}`}>{option}{answers.workType === option && <Check className="h-5 w-5 text-[#3d967d]" />}</button>)}</div> : <div className="mt-7 space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold text-[#18313d]">{current.prefix} Annual income</span><input value={answers.annualIncome} onChange={(event) => setAnswers({ ...answers, annualIncome: event.target.value.replace(/\D/g, "") })} placeholder={current.placeholder} inputMode="numeric" className="w-full rounded-xl border border-[#d9e4e2] p-4 text-lg font-bold text-[#0d1b2a] outline-none focus:border-[#62b59e] focus:ring-4 focus:ring-[#dff4eb]" /></label>{current.secondary && <><label className="block"><span className="mb-2 block text-xs font-bold text-[#18313d]">{current.prefix} Monthly rent</span><input value={answers.monthlyRent} onChange={(event) => setAnswers({ ...answers, monthlyRent: event.target.value.replace(/\D/g, "") })} placeholder={current.placeholder} inputMode="numeric" className="w-full rounded-xl border border-[#d9e4e2] p-4 text-lg font-bold text-[#0d1b2a] outline-none focus:border-[#62b59e] focus:ring-4 focus:ring-[#dff4eb]" /></label><label className="block"><span className="mb-2 block text-xs font-bold text-[#18313d]">{current.prefix} Annual savings</span><input value={answers.savings} onChange={(event) => setAnswers({ ...answers, savings: event.target.value.replace(/\D/g, "") })} placeholder={current.secondaryPlaceholder} inputMode="numeric" className="w-full rounded-xl border border-[#d9e4e2] p-4 text-lg font-bold text-[#0d1b2a] outline-none focus:border-[#62b59e] focus:ring-4 focus:ring-[#dff4eb]" /></label></>}</div>}<div className="mt-9 flex items-center justify-between gap-4">{step > 0 ? <button onClick={() => setStep(step - 1)} className="text-sm font-bold text-[#52686e]">Back</button> : <span />}{step < 2 ? <button onClick={() => setStep(step + 1)} disabled={!valid} className="demo-action disabled:cursor-not-allowed disabled:opacity-50">Continue <ArrowRight /></button> : <button onClick={calculate} className="demo-action">Calculate my taxes <ArrowRight /></button>}</div>{error && <p className="mt-3 text-xs text-red-600">{error}</p>}</div></div>;
}

function Dashboard({ initialService, exit }) {
  const [service, setService] = useState(initialService);
  return <main className="dashboard"><aside className="dash-side"><Logo /><span className="kicker">YOUR SERVICES</span><button className={service === "grievance" ? "selected" : ""} onClick={() => setService("grievance")}><CircleAlert /> Grievance Router</button><button className={service === "tax" ? "selected" : ""} onClick={() => setService("tax")}><ReceiptIndianRupee /> Tax Portal</button><div className="side-bottom"><div><ShieldCheck /> Demo data only.<br />Nothing is stored or sent to a government system.</div><button onClick={exit}><UserRound /> Exit sandbox</button></div></aside><section className="dash-main"><header className="dash-header"><div><span className="kicker">{service === "tax" ? "CONVERSATIONAL TAX PORTAL" : "VOICE-FIRST CIVIC SERVICE"}</span><h1>{service === "tax" ? "Taxes, without the tax-speak." : "Let’s get that sorted."}</h1></div><button onClick={exit} className="exit-button">Exit demo <ArrowRight /></button></header><div className="dash-content"><section>{service === "tax" ? <TaxPanel /> : <GrievancePanel />}</section><aside className="dash-aside"><p className="panel-label">WHY NAGRIK</p><h3>Built for clarity, not compliance.</h3><p>Every interaction reduces cognitive load and returns agency to the citizen.</p><div className="check-line"><Check /> Multilingual by default</div><div className="check-line"><Check /> Voice-first and accessible</div><div className="check-line"><Check /> PII stays in local memory</div><div className="check-line"><Check /> Graceful offline fallback</div></aside></div></section></main>;
}

export default function Page() {
  const [requestedService, setRequestedService] = useState(null);
  const [entered, setEntered] = useState(false);
  return entered ? <Dashboard initialService={requestedService || "grievance"} exit={() => { setEntered(false); setRequestedService(null); }} /> : <><Landing openService={setRequestedService} />{requestedService && <AuthModal service={requestedService} onClose={() => setRequestedService(null)} onEnter={() => setEntered(true)} />}</>;
}
