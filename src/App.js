import React, { useEffect, useState } from "react";
import { assessRiskProfile } from "./utils/api";

const C = {
  ink: "#1A1033", muted: "#4E4766", ground: "#F5F3FF", indigo: "#2B1B8F",
  amber: "#FFB020", purple: "#5A2FE0", violet: "#B78CFF", pink: "#FF7FAE",
  orange: "#FF9F43", mint: "#3EE0B5", blue: "#6CB8FF", yellow: "#FFD23F",
  line: "#DCD5F5", soft: "#E4DEFF",
};
const DISP = "'Sora', 'DM Sans', sans-serif";
const HI = "'Noto Sans Devanagari', 'DM Sans', sans-serif";

const QUESTIONS = [
  { key: "age", group: "Your situation", q: "How old are you?", hi: "आपकी उम्र क्या है?",
    options: [["Under 30", "30 से कम", 25], ["30 to 45", "30 से 45", 37], ["45 to 60", "45 से 60", 52], ["Over 60", "60 से ज़्यादा", 65]] },
  { key: "income_stability", group: "Your situation", q: "How steady is your income?", hi: "आपकी आमदनी कितनी स्थिर है?",
    options: [["Very steady (fixed salary)", "बहुत स्थिर (पक्की तनख़्वाह)", 90], ["Mostly steady", "ज़्यादातर स्थिर", 70], ["It varies a lot", "बहुत ऊपर-नीचे होती है", 40], ["No regular income", "कोई नियमित आय नहीं", 10]] },
  { key: "emergency_fund", group: "Your situation", q: "If your income stopped, how long could your savings cover your expenses?", hi: "आमदनी रुक जाए तो बचत से कितने महीने चलेगा?",
    options: [["6 months or more", "6 महीने या ज़्यादा", 100], ["3 to 6 months", "3 से 6 महीने", 70], ["Less than 3 months", "3 महीने से कम", 35], ["No savings", "कोई बचत नहीं", 0]] },
  { key: "liabilities", group: "Your situation", q: "How much of your monthly income goes to EMIs?", hi: "आपकी मासिक आय का कितना हिस्सा EMI में जाता है?",
    options: [["No loans", "कोई लोन नहीं", 0], ["Less than 20%", "20% से कम", 25], ["20% to 40%", "20% से 40%", 60], ["More than 40%", "40% से ज़्यादा", 90]] },
  { key: "crash_reaction", group: "Risk tolerance", q: "If the market falls 30% in a month, what would you do?", hi: "अगर बाज़ार एक महीने में 30% गिर जाए, तो आप क्या करेंगे?",
    options: [["Sell everything to stop the loss", "सब बेच दूँगा", 5], ["Sell some, keep the rest", "थोड़ा बेचूँगा", 30], ["Do nothing and wait", "कुछ नहीं करूँगा, इंतज़ार करूँगा", 65], ["Invest more at lower prices", "और निवेश करूँगा", 95]] },
  { key: "experience", group: "Risk tolerance", q: "How much investing experience do you have?", hi: "आपको निवेश का कितना अनुभव है?",
    options: [["None yet", "अभी तक नहीं", 10], ["Only FD, PPF or similar", "सिर्फ़ FD, PPF जैसे", 30], ["Mutual funds for a few years", "कुछ साल से म्यूचुअल फंड", 65], ["Stocks and funds, 5+ years", "5+ साल से शेयर और फंड", 95]] },
  { key: "checking_frequency", group: "Risk tolerance", q: "How often do you check your investments?", hi: "आप अपने निवेश कितनी बार देखते हैं?",
    options: [["Every day", "रोज़", 90], ["Every week", "हर हफ़्ते", 65], ["Every month", "हर महीने", 35], ["Rarely", "कभी-कभार", 10]] },
];

const PROFILES = {
  Conservative: { hi: "सावधान निवेशक", desc: "Stability first. You prefer steady returns over big swings.", color: C.blue, mix: [30, 50, 20] },
  Balanced: { hi: "संतुलित निवेशक", desc: "Growth with stability. You can handle some ups and downs.", color: C.mint, mix: [55, 35, 10] },
  Aggressive: { hi: "साहसी निवेशक", desc: "Long-term growth. You can sit through big swings.", color: C.orange, mix: [75, 20, 5] },
};

const ICONS = {
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  gauge: <><path d="M4 17a8 8 0 1 1 16 0" /><path d="M12 17l4-5" /></>,
  calc: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  book: <><path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z" /><path d="M20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z" /></>,
  chart: <><path d="M4 4v16h16" /><path d="M8 15l4-4 3 3 5-6" /></>,
  rupee: <><path d="M7 5h10M7 9h10" /><path d="M7 5h3a4 4 0 0 1 0 8H7l7 7" /></>,
  back: <path d="M15 5l-7 7 7 7" />,
  check: <path d="M5 12l5 5 9-10" />,
  arrow: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
};

function Icon({ name, size = 22, color = C.ink, sw = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
  );
}

function Mark({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill={C.indigo} />
      <path d="M9.5 21.5l6.5 6.5 14-15" fill="none" stroke={C.amber} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23.5 12.5H30v6.5" fill="none" stroke={C.amber} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const btnReset = { border: "none", cursor: "pointer", fontFamily: "inherit" };

function Disclaimer() {
  return (
    <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
      <Icon name="shield" size={14} color={C.muted} /> For education only. Not investment advice.
    </p>
  );
}

function TabBar({ active, onTab }) {
  const tabs = [["home", "Home", "home", C.violet], ["risk", "Risk", "gauge", C.pink], ["tools", "Tools", "calc", C.orange], ["goals", "Goals", "target", C.mint], ["learn", "Learn", "book", C.yellow]];
  return (
    <nav aria-label="Main" style={{ position: "sticky", bottom: 0, display: "flex", justifyContent: "space-around", alignItems: "center", height: 78, background: "#FFFFFF", borderTop: "1px solid #E6E1F7" }}>
      {tabs.map(([id, label, icon, col]) => {
        const on = id === active;
        return (
          <button key={id} onClick={() => onTab(id)} style={{ ...btnReset, background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 60, minHeight: 52, justifyContent: "center", color: on ? C.ink : C.muted }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: on ? 52 : 32, height: 32, borderRadius: 16, background: on ? col : "transparent", border: on ? "none" : `2px solid ${col}`, boxSizing: "border-box" }}>
              <Icon name={icon} size={on ? 20 : 18} color={on ? C.ink : C.muted} sw={on ? 2.2 : 2} />
            </span>
            <span style={{ fontSize: 12, fontWeight: on ? 700 : 500 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [soonName, setSoonName] = useState("");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHindi, setShowHindi] = useState(true);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;700&family=Noto+Sans+Devanagari:wght@500;600&display=swap";
    document.head.appendChild(link);
    document.body.style.margin = "0";
    document.body.style.background = C.ground;
  }, []);

  const startRisk = () => { setStep(0); setAnswers({}); setResult(null); setError(""); setScreen("risk"); };
  const openSoon = (name) => { setSoonName(name); setScreen("soon"); };

  const onTab = (id) => {
    if (id === "home") setScreen("home");
    else if (id === "risk") { if (result) setScreen("result"); else startRisk(); }
    else if (id === "tools") openSoon("Tools");
    else if (id === "goals") openSoon("Goal Planner");
    else openSoon("Learn");
  };

  const submit = async (finalAnswers) => {
    setLoading(true);
    setError("");
    try {
      const res = await assessRiskProfile(finalAnswers);
      if (!res || !res.profile_level) throw new Error("bad");
      setResult(res);
      setScreen("result");
    } catch {
      setError("Could not reach the server. Please try again in a minute.");
    }
    setLoading(false);
  };

  const q = QUESTIONS[step];
  const picked = q ? answers[q.key] : undefined;
  const activeTab = screen === "home" ? "home" : screen === "risk" || screen === "result" ? "risk" : soonName === "Goal Planner" ? "goals" : soonName === "Learn" ? "learn" : "tools";

  const header = (title, onBack, right) => (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button aria-label="Back" onClick={onBack} style={{ ...btnReset, width: 44, height: 44, borderRadius: 22, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="back" />
        </button>
        <span style={{ fontFamily: DISP, fontSize: 18, fontWeight: 700 }}>{title}</span>
      </div>
      {right}
    </header>
  );

  const tile = (title, hi, icon, col, onClick) => (
    <button key={title} onClick={onClick} style={{ ...btnReset, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", gap: 8, height: 104, padding: 14, borderRadius: 22, background: col, color: C.ink, textAlign: "left" }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 12, background: "#FFFFFF" }}><Icon name={icon} size={20} sw={2.2} /></span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: DISP, fontSize: 15, fontWeight: 700 }}>{title}</span>
        {showHindi && <span style={{ fontFamily: HI, fontSize: 12, fontWeight: 500 }}>{hi}</span>}
      </span>
    </button>
  );

  let body = null;

  if (screen === "home") {
    body = (
      <>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mark />
            <span style={{ fontFamily: DISP, fontSize: 21, fontWeight: 800, letterSpacing: -0.3 }}>Invest<span style={{ color: C.purple }}>Right</span></span>
          </div>
          <button onClick={() => setShowHindi(!showHindi)} style={{ ...btnReset, height: 44, padding: "0 14px", borderRadius: 22, border: `2px solid ${C.ink}`, background: showHindi ? C.yellow : "#FFFFFF", color: C.ink, fontSize: 14, fontWeight: 700 }}>
            {showHindi ? "हिं + EN" : "EN"}
          </button>
        </header>
        <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, padding: "8px 20px 16px" }}>
          <div>
            {showHindi && <div style={{ fontFamily: HI, fontSize: 15, fontWeight: 600, color: C.muted }}>नमस्ते!</div>}
            <h1 style={{ margin: 0, fontFamily: DISP, fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>Plan your money, your way</h1>
          </div>
          <section style={{ display: "flex", flexDirection: "column", gap: 12, padding: 18, borderRadius: 26, background: C.indigo, color: "#FFFFFF" }}>
            <span style={{ alignSelf: "flex-start", padding: "4px 10px", borderRadius: 12, background: C.mint, color: C.ink, fontSize: 12, fontWeight: 700 }}>2 min · 7 questions</span>
            <h2 style={{ margin: 0, fontFamily: DISP, fontSize: 21, fontWeight: 700, lineHeight: 1.25 }}>Know your real risk, not your guess</h2>
            {showHindi && <span style={{ fontFamily: HI, fontSize: 14, color: C.soft }}>अपना असली रिस्क जानिए</span>}
            <button onClick={startRisk} style={{ ...btnReset, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 25, background: C.amber, color: C.ink, fontSize: 16, fontWeight: 700 }}>
              Start Risk Profiler <Icon name="arrow" size={20} sw={2.4} />
            </button>
          </section>
          <h2 style={{ margin: "4px 0 0", fontFamily: DISP, fontSize: 17, fontWeight: 700 }}>Your tools</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            {tile("Risk Profiler", "रिस्क प्रोफ़ाइल", "gauge", C.violet, startRisk)}
            {tile("SIP Calculator", "SIP कैलकुलेटर", "calc", C.orange, () => openSoon("SIP Calculator"))}
            {tile("SWP Planner", "रिटायरमेंट आय", "rupee", C.mint, () => openSoon("SWP Planner"))}
            {tile("Goal Planner", "लक्ष्य योजना", "target", C.pink, () => openSoon("Goal Planner"))}
            {tile("Crash Scenarios", "मार्केट क्रैश", "chart", C.blue, () => openSoon("Crash Scenarios"))}
            {tile("Learn", "सीखिए", "book", C.yellow, () => openSoon("Learn"))}
          </div>
          <Disclaimer />
        </main>
      </>
    );
  } else if (screen === "risk") {
    const last = step === QUESTIONS.length - 1;
    body = (
      <>
        {header("Risk Profiler", () => (step === 0 ? setScreen("home") : setStep(step - 1)),
          <span style={{ padding: "6px 12px", borderRadius: 14, background: C.pink, fontSize: 13, fontWeight: 700 }}>{step + 1} of {QUESTIONS.length}</span>)}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, padding: "8px 20px 20px" }}>
          <div style={{ display: "flex", gap: 6 }} aria-label={`Question ${step + 1} of ${QUESTIONS.length}`}>
            {QUESTIONS.map((x, i) => (
              <span key={x.key} style={{ flex: 1, height: 8, borderRadius: 4, background: i <= step ? C.purple : C.line }} />
            ))}
          </div>
          <span style={{ alignSelf: "flex-start", padding: "5px 12px", borderRadius: 12, background: q.group === "Risk tolerance" ? C.yellow : C.mint, fontSize: 12, fontWeight: 700 }}>{q.group}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h1 style={{ margin: 0, fontFamily: DISP, fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>{q.q}</h1>
            {showHindi && <span style={{ fontFamily: HI, fontSize: 15, color: C.muted, lineHeight: 1.5 }}>{q.hi}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map(([en, hi, val]) => {
              const sel = picked === val;
              return (
                <button key={en} aria-pressed={sel} onClick={() => setAnswers({ ...answers, [q.key]: val })}
                  style={{ ...btnReset, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", minHeight: 68, padding: "12px 16px", borderRadius: 20, border: sel ? `3px solid ${C.purple}` : `2px solid ${C.line}`, background: sel ? C.violet : "#FFFFFF", color: C.ink, textAlign: "left" }}>
                  <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: sel ? 700 : 500 }}>{en}</span>
                    {showHindi && <span style={{ fontFamily: HI, fontSize: 13, color: sel ? C.ink : C.muted }}>{hi}</span>}
                  </span>
                  {sel
                    ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 15, background: C.ink, flexShrink: 0 }}><Icon name="check" size={18} color="#FFFFFF" sw={3} /></span>
                    : <span style={{ width: 26, height: 26, borderRadius: 13, border: "2px solid #C9C0EC", flexShrink: 0, boxSizing: "border-box" }} />}
                </button>
              );
            })}
          </div>
          {error && <p style={{ margin: 0, padding: "12px 14px", borderRadius: 16, background: C.pink, fontSize: 14, fontWeight: 700 }}>{error}</p>}
          <div style={{ flex: 1 }} />
          <button disabled={picked === undefined || loading}
            onClick={() => (last ? submit(answers) : setStep(step + 1))}
            style={{ ...btnReset, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 54, borderRadius: 27, background: picked === undefined ? C.line : C.indigo, color: picked === undefined ? C.muted : "#FFFFFF", fontSize: 16, fontWeight: 700 }}>
            {loading ? "Calculating… (first time can take up to a minute)" : last ? "See my profile" : "Next"}
            {!loading && <Icon name="arrow" size={20} color={picked === undefined ? C.muted : "#FFFFFF"} sw={2.4} />}
          </button>
        </main>
      </>
    );
  } else if (screen === "result" && result) {
    const p = PROFILES[result.profile_level] || PROFILES.Balanced;
    const score = Math.min(result.risk_capacity, result.risk_tolerance);
    const bar = (label, sub, val, col) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
          <span style={{ fontFamily: DISP, fontSize: 20, fontWeight: 800 }}>{val}</span>
        </div>
        <div style={{ height: 12, borderRadius: 6, background: "#ECE8FA", overflow: "hidden" }}>
          <div style={{ width: `${val}%`, height: 12, borderRadius: 6, background: col }} />
        </div>
        <span style={{ fontSize: 12, color: C.muted }}>{sub}</span>
      </div>
    );
    body = (
      <>
        {header("Your profile", () => setScreen("home"), <span />)}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, padding: "8px 20px 16px" }}>
          <section style={{ display: "flex", flexDirection: "column", gap: 6, padding: 20, borderRadius: 26, background: p.color }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>You are a</span>
            <h1 style={{ margin: 0, fontFamily: DISP, fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>{result.profile_level} investor</h1>
            {showHindi && <span style={{ fontFamily: HI, fontSize: 15, fontWeight: 600 }}>{p.hi}</span>}
            <span style={{ fontSize: 14, lineHeight: 1.5 }}>{p.desc}</span>
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: 14, padding: 18, borderRadius: 22, background: "#FFFFFF" }}>
            {bar("Risk capacity", "What your finances can absorb", result.risk_capacity, C.violet)}
            {bar("Risk tolerance", "What you can stomach in a crash", result.risk_tolerance, C.pink)}
            <span style={{ padding: "8px 12px", borderRadius: 12, background: C.yellow, fontSize: 13, fontWeight: 700 }}>Your profile uses the lower score: {score}</span>
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: 10, padding: 18, borderRadius: 22, background: "#FFFFFF" }}>
            <h2 style={{ margin: 0, fontFamily: DISP, fontSize: 16, fontWeight: 700 }}>Typical mix for this profile</h2>
            <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", gap: 3 }}>
              <span style={{ flex: p.mix[0], background: C.purple }} />
              <span style={{ flex: p.mix[1], background: C.blue }} />
              <span style={{ flex: p.mix[2], background: C.yellow }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
              <span>Equity {p.mix[0]}%</span><span>Debt {p.mix[1]}%</span><span>Liquid {p.mix[2]}%</span>
            </div>
          </section>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={startRisk} style={{ ...btnReset, flex: 1, height: 50, borderRadius: 25, background: C.indigo, color: "#FFFFFF", fontSize: 14, fontWeight: 700 }}>Retake test</button>
            <button onClick={() => openSoon("Goal Planner")} style={{ ...btnReset, flex: 1, height: 50, borderRadius: 25, background: C.amber, color: C.ink, fontSize: 14, fontWeight: 700 }}>Plan a goal</button>
          </div>
          <Disclaimer />
        </main>
      </>
    );
  } else {
    body = (
      <>
        {header(soonName || "Coming soon", () => setScreen("home"), <span />)}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
          <Mark size={72} />
          <h1 style={{ margin: 0, fontFamily: DISP, fontSize: 24, fontWeight: 800 }}>{soonName} is coming soon</h1>
          {showHindi && <span style={{ fontFamily: HI, fontSize: 15, color: C.muted }}>जल्द आ रहा है</span>}
          <button onClick={startRisk} style={{ ...btnReset, height: 50, padding: "0 24px", borderRadius: 25, background: C.amber, color: C.ink, fontSize: 15, fontWeight: 700 }}>Try the Risk Profiler</button>
        </main>
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", background: C.ground }}>
      <div style={{ width: "100%", maxWidth: 480, minHeight: "100vh", display: "flex", flexDirection: "column", color: C.ink, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {body}
        <TabBar active={activeTab} onTab={onTab} />
      </div>
    </div>
  );
}
