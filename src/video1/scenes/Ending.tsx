import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, handStyle, Kicker, Marker, pop, progress, SceneFade, Sfx, Strike, TypeOn } from "../../shared/anim";
import { FULL_SKETCH, PaperSketch } from "../../shared/PaperSketch";
import { Laptop, LANG_FILES } from "../../shared/Props";
import { cuesFor } from "../timeline";
import { C, QUICKSAND, SHADOW } from "../../shared/theme";
import { PencilIcon } from "./Paper";

// ---------------- Where AI fits ----------------

const Tool: React.FC<{ label: string; children: React.ReactNode; highlight?: boolean }> = ({ label, children, highlight }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
    <div
      style={{
        width: 190,
        height: 190,
        borderRadius: 36,
        background: "white",
        boxShadow: SHADOW,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: highlight ? `5px solid ${C.dino}` : "5px solid transparent",
      }}
    >
      {children}
    </div>
    <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, color: C.ink }}>{label}</div>
  </div>
);

const ChatBubble: React.FC<{ from: "you" | "claude"; children: React.ReactNode; tag?: string; tagColor?: string }> = ({ from, children, tag, tagColor }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: from === "you" ? "flex-end" : "flex-start", marginBottom: 14 }}>
    {tag ? (
      <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: "white", background: tagColor, padding: "5px 14px", borderRadius: 999, marginBottom: 8 }}>
        {tag}
      </div>
    ) : null}
    <div
      style={{
        maxWidth: 820,
        padding: "16px 24px",
        borderRadius: from === "you" ? "24px 24px 6px 24px" : "24px 24px 24px 6px",
        background: from === "you" ? C.ink : "#f4efe7",
        color: from === "you" ? "white" : C.ink,
        fontFamily: QUICKSAND,
        fontWeight: 600,
        fontSize: 30,
        lineHeight: 1.35,
      }}
    >
      {children}
    </div>
  </div>
);

const CHATS = [
  { line: "ai4", tag: "A CLEAR REQUIREMENT", color: C.html, you: "I need my dinosaur to jump when I press Space.", claude: "Here's how a key press can trigger a jump. First, the game needs to listen for the key..." },
  { line: "ai5", tag: "A PROBLEM", color: C.danger, you: "My collision isn't working.", claude: "Let's investigate. Can you show me how you check whether the two boxes overlap?" },
  { line: "ai6", tag: "AN IDEA", color: C.css, you: "I want the game to get faster as the score goes up.", claude: "Let's think through the logic first. What should happen at 100 points?" },
];

const LOOP = ["ASK", "UNDERSTAND", "TEST", "CHECK", "IMPROVE"];

export const AiFits: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = cuesFor("ai");
  const toolsOut = progress(frame, cues.line("ai4") - 14, 16, EASE_IN_OUT);
  const chatOut = progress(frame, cues.line("ai7") - 6, 14, EASE_IN_OUT);
  const badOut = progress(frame, cues.line("ai9") - 4, 14, EASE_IN_OUT);
  const loopOut = progress(frame, cues.line("ai10") - 6, 14, EASE_IN_OUT);
  const loopWords = ["ask", "understand", "test", "check", "improve"];

  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Introduce AI</Kicker>

      {/* Toolbox */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - toolsOut }}>
        <div style={{ display: "flex", gap: 50, alignItems: "flex-end" }}>
          <Appear at={4} kind="up">
            <Tool label="Pencil">
              <PencilIcon style={{ transform: "scale(1.7)" }} />
            </Tool>
          </Appear>
          <Appear at={8} kind="up">
            <Tool label="Paper">
              <PaperSketch p={FULL_SKETCH} width={150} />
            </Tool>
          </Appear>
          <Appear at={12} kind="up">
            <Tool label="Code editor">
              <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 56, color: C.css }}>{"</>"}</div>
            </Tool>
          </Appear>
          <Appear at={16} kind="up">
            <Tool label="Browser">
              <svg width={110} height={90} viewBox="0 0 110 90">
                <rect x={4} y={4} width={102} height={82} rx={12} fill="none" stroke={C.ink} strokeWidth={5} />
                <line x1={4} y1={26} x2={106} y2={26} stroke={C.ink} strokeWidth={5} />
                <circle cx={55} cy={56} r={16} fill={C.dino} />
              </svg>
            </Tool>
          </Appear>
          <div style={{ transform: `translateY(${(1 - pop(frame, fps, cues.line("ai2"), 11)) * -500}px)`, opacity: frame >= cues.line("ai2") ? 1 : 0 }}>
            <Tool label="AI · Claude" highlight>
              <div style={{ width: 130, borderRadius: 16, background: "#f4efe7", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ alignSelf: "flex-end", width: 70, height: 16, borderRadius: 8, background: C.ink }} />
                <div style={{ width: 90, height: 16, borderRadius: 8, background: C.dino }} />
                <div style={{ width: 60, height: 16, borderRadius: 8, background: C.dino, opacity: 0.6 }} />
              </div>
            </Tool>
          </div>
        </div>
        <Appear at={cues.word("ai3", "after")} kind="pop" style={{ marginTop: 70 }}>
          <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 58, color: C.ink }}>
            AI comes in <Marker at={cues.word("ai3", "thinking")}>after the thinking.</Marker>
          </span>
        </Appear>
      </AbsoluteFill>

      {/* Chat examples */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: toolsOut * (1 - chatOut) }}>
        <div style={{ width: 1300, background: "white", borderRadius: 34, boxShadow: SHADOW, overflow: "hidden" }}>
          <div style={{ padding: "18px 30px", background: "#f7f2ea", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, color: C.ink, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.dino }} />
            Claude
          </div>
          <div style={{ padding: "26px 36px 14px", height: 760 }}>
            {CHATS.map((chat) => (
              <div key={chat.line}>
                <Appear at={cues.line(chat.line) - 4} kind="up">
                  <ChatBubble from="you" tag={chat.tag} tagColor={chat.color}>
                    <TypeOn text={chat.you} at={cues.line(chat.line) - 2} cps={34} caret={false} />
                  </ChatBubble>
                </Appear>
                <Appear at={cues.word(chat.line, "ai")} kind="up">
                  <ChatBubble from="claude">{chat.claude}</ChatBubble>
                </Appear>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>

      {/* "Make me a game." crossed out */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: chatOut * (1 - badOut) }}>
        <Appear at={cues.line("ai8") - 4} kind="pop">
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 110, color: C.ink, background: "white", padding: "36px 80px", borderRadius: 40, boxShadow: SHADOW }}>
            <Strike at={cues.end("ai8") + 4} thickness={14}>
              "Make me a game."
            </Strike>
          </div>
        </Appear>
      </AbsoluteFill>

      {/* The loop */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: badOut * (1 - loopOut) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {LOOP.map((step, i) => (
            <React.Fragment key={step}>
              <Appear at={cues.word("ai9", loopWords[i]) - 2} kind="pop">
                <div
                  style={{
                    fontFamily: QUICKSAND,
                    fontWeight: 700,
                    fontSize: 42,
                    letterSpacing: 2,
                    padding: "24px 36px",
                    borderRadius: 999,
                    background: [C.html, C.css, C.good, C.js, C.dino][i],
                    color: i === 3 ? C.ink : "white",
                    boxShadow: SHADOW,
                  }}
                >
                  {step}
                </div>
              </Appear>
              {i < LOOP.length - 1 ? (
                <Appear at={cues.word("ai9", loopWords[i + 1]) - 4} kind="fade" style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 50, color: C.inkSoft }}>
                  →
                </Appear>
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </AbsoluteFill>

      {/* Final statements */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: loopOut }}>
        <div style={{ textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700, color: C.ink }}>
          <Appear at={cues.line("ai10")} style={{ fontSize: 64, lineHeight: 1.25 }}>
            The better you understand your project,
            <br />
            the better you can use AI.
          </Appear>
          <Appear at={cues.line("ai11")} style={{ fontSize: 50, color: C.inkSoft, marginTop: 50 }}>
            AI helps you build faster.
          </Appear>
          <Appear at={cues.line("ai12")} style={{ fontSize: 58, marginTop: 30 }}>
            The idea, the decisions and the understanding
            <br />
            still belong to <Marker at={cues.word("ai12", "you")}>you.</Marker>
          </Appear>
        </div>
      </AbsoluteFill>

      <Sfx at={cues.line("ai2")} name="whoosh" volume={0.35} />
      <Sfx at={cues.line("ai2") + 8} name="pop" volume={0.45} />
      {CHATS.map((chat) => (
        <React.Fragment key={chat.line}>
          <Sfx at={cues.line(chat.line) - 2} name="typing" volume={0.25} />
          <Sfx at={cues.word(chat.line, "ai")} name="pop" volume={0.3} />
        </React.Fragment>
      ))}
      <Sfx at={cues.line("ai8") - 4} name="pop" volume={0.4} />
      <Sfx at={cues.end("ai8") + 4} name="scribble" volume={0.6} />
      {loopWords.map((w) => (
        <Sfx key={w} at={cues.word("ai9", w) - 2} name="tick" volume={0.45} />
      ))}
    </SceneFade>
  );
};

// ---------------- Your turn ----------------

const DRAW_LIST = [
  { text: "your player", word: "player" },
  { text: "an obstacle", word: "obstacle" },
  { text: "the game area", word: "area" },
  { text: "the score", word: "score" },
  { text: "a restart button", word: "restart" },
  { text: "what happens on a hit", word: "hits" },
];

const QUESTIONS = [
  { text: "What will my game look like?", word: "look" },
  { text: "What can the player do?", word: "do" },
  { text: "What happens when the player makes a mistake?", word: "mistake" },
  { text: "What do I need to build it?", word: "need" },
  { text: "What could make my version different?", word: "different" },
];

const IdeaCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ width: 380, height: 360, background: "white", borderRadius: 30, boxShadow: SHADOW, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
    <svg width={220} height={180} viewBox="0 0 220 180">
      {children}
    </svg>
    <div style={{ ...handStyle(44, C.ink) }}>{title}</div>
  </div>
);

export const YourTurn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = cuesFor("task");
  const titleOut = progress(frame, cues.line("t2") + 30, 16, EASE_IN_OUT);
  const listsOut = progress(frame, cues.line("t6") - 6, 14, EASE_IN_OUT);
  const ideasOut = progress(frame, cues.line("t7") - 6, 14, EASE_IN_OUT);
  const keepOut = progress(frame, cues.line("t8") - 4, 14, EASE_IN_OUT);
  const endCard = cues.end("t8") + 20;
  const previewOut = progress(frame, endCard - 4, 14, EASE_IN_OUT);
  const stroke = { stroke: C.pencil, strokeWidth: 5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <SceneFade duration={cues.duration} fadeOut={20}>
      {/* YOUR TURN */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - titleOut }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 210, color: C.ink, transform: `scale(${0.5 + 0.5 * pop(frame, fps, cues.line("t1"), 11)})` }}>
          Your <span style={{ color: C.dino }}>turn.</span>
        </div>
        <Appear at={cues.line("t2")} style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: QUICKSAND, fontWeight: 600, fontSize: 52, color: C.inkSoft }}>
          <PencilIcon />
          Grab some paper. Design your own version.
        </Appear>
      </AbsoluteFill>

      {/* Two lists */}
      <div style={{ position: "absolute", inset: 0, opacity: titleOut * (1 - listsOut) }}>
        <Kicker at={cues.line("t3") - 10}>Your task</Kicker>
        <div style={{ position: "absolute", left: 130, top: 260, width: 700, background: "white", borderRadius: 34, boxShadow: SHADOW, padding: "40px 50px" }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.ink, marginBottom: 24 }}>Draw:</div>
          {DRAW_LIST.map((item) => {
            const at = cues.word("t3", item.word);
            const tick = pop(frame, fps, at, 12);
            return (
              <Appear key={item.text} at={at - 3} kind="left" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, border: `4px solid ${C.dino}`, display: "flex", alignItems: "center", justifyContent: "center", background: tick > 0.1 ? C.dino : "white" }}>
                  <svg width={26} height={26} viewBox="0 0 34 34" style={{ transform: `scale(${tick})` }}>
                    <path d="M 6 18 L 14 26 L 28 8" stroke="white" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ ...handStyle(46, C.ink) }}>{item.text}</div>
              </Appear>
            );
          })}
        </div>
        <Appear at={cues.line("t4") - 4} kind="right" style={{ position: "absolute", left: 900, top: 260, width: 890, background: "white", borderRadius: 34, boxShadow: SHADOW, padding: "40px 50px" }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.ink, marginBottom: 24 }}>Then answer:</div>
          {QUESTIONS.map((q, i) => (
            <Appear key={q.text} at={cues.word("t5", q.word, q.word === "do" ? 0 : 0) - 8} kind="up" style={{ display: "flex", gap: 18, alignItems: "baseline", marginBottom: 22 }}>
              <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, color: C.dino, minWidth: 34 }}>{i + 1}.</div>
              <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 36, color: C.ink }}>{q.text}</div>
            </Appear>
          ))}
        </Appear>
      </div>

      {/* Idea cards: make it yours */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: listsOut * (1 - ideasOut) }}>
        <div style={{ display: "flex", gap: 50 }}>
          <Appear at={cues.word("t6", "cat")} kind="drop">
            <IdeaCard title="a cat runner">
              <path d="M 70 150 Q 60 90 110 85 Q 160 90 150 150 Z" {...stroke} />
              <path d="M 80 100 L 75 60 L 100 86 M 140 100 L 145 60 L 120 86" {...stroke} />
              <circle cx={98} cy={112} r={4} fill={C.pencil} />
              <circle cx={124} cy={112} r={4} fill={C.pencil} />
              <path d="M 150 140 Q 190 130 185 95" {...stroke} />
              <line x1={20} y1={160} x2={200} y2={160} {...stroke} />
            </IdeaCard>
          </Appear>
          <Appear at={cues.word("t6", "puddles")} kind="drop">
            <IdeaCard title="puddle obstacles">
              <ellipse cx={110} cy={130} rx={80} ry={22} fill={C.sky} stroke={C.css} strokeWidth={5} />
              <path d="M 90 60 Q 100 80 90 95 Q 80 80 90 60 Z" fill={C.css} />
              <path d="M 140 40 Q 150 60 140 75 Q 130 60 140 40 Z" fill={C.css} />
              <line x1={20} y1={160} x2={200} y2={160} {...stroke} />
            </IdeaCard>
          </Appear>
          <Appear at={cues.word("t6", "robot")} kind="drop">
            <IdeaCard title="a robot on Mars">
              <rect x={20} y={140} width={180} height={30} rx={8} fill="#e07a5f" opacity={0.85} />
              <rect x={75} y={60} width={70} height={60} rx={14} {...stroke} />
              <line x1={110} y1={60} x2={110} y2={38} {...stroke} />
              <circle cx={110} cy={32} r={7} fill={C.dino} />
              <circle cx={96} cy={86} r={6} fill={C.pencil} />
              <circle cx={124} cy={86} r={6} fill={C.pencil} />
              <path d="M 90 120 L 88 140 M 130 120 L 132 140" {...stroke} />
            </IdeaCard>
          </Appear>
        </div>
        <Appear at={cues.word("t6", "design", 0)} kind="up" style={{ marginTop: 60, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 64, color: C.ink }}>
          It's <Marker at={cues.word("t6", "your")}>your</Marker> design.
        </Appear>
      </AbsoluteFill>

      {/* Keep your design */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: ideasOut * (1 - keepOut) }}>
        <Appear at={cues.line("t7")} kind="pop" style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 120, color: C.ink, textAlign: "center" }}>
          Keep your design.
        </Appear>
        <Appear at={cues.word("t7", "use")} style={{ fontFamily: QUICKSAND, fontWeight: 600, fontSize: 56, color: C.dino, marginTop: 20 }}>
          We're going to use it.
        </Appear>
      </AbsoluteFill>

      {/* Preview of video 2 */}
      <div style={{ position: "absolute", inset: 0, opacity: keepOut * (1 - previewOut) }}>
        <div style={{ position: "absolute", left: 100, top: 230, transform: `translateX(${(1 - keepOut) * -300}px) rotate(-3deg)` }}>
          <PaperSketch p={FULL_SKETCH} width={720} />
        </div>
        <div style={{ position: "absolute", left: 880, top: 210, transform: `translateX(${(1 - keepOut) * 300}px)` }}>
          <Laptop width={940} files={LANG_FILES} activeFile="index.html">
            <div style={{ fontFamily: "monospace", fontSize: 25, lineHeight: 1.7, color: C.ink }}>
              <div style={{ color: "#a59c90" }}>{"<body>"}</div>
              <div
                style={{
                  paddingLeft: 30,
                  background: `rgba(240,138,75,${0.25 * progress(frame, cues.word("t8", "structure"), 12)})`,
                  borderRadius: 6,
                }}
              >
                <span style={{ color: C.html }}>{"<main "}</span>
                <span style={{ color: C.css }}>{'id="game"'}</span>
                <span style={{ color: C.html }}>{">"}</span>
              </div>
              <div style={{ paddingLeft: 60, color: "#a59c90" }}>{"<!-- the game goes here -->"}</div>
              <div style={{ paddingLeft: 30, color: C.html }}>{"</main>"}</div>
              <div style={{ color: "#a59c90" }}>{"</body>"}</div>
            </div>
          </Laptop>
        </div>
        <Appear at={cues.word("t8", "html")} kind="pop" style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center" }}>
          <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 50, color: "white", background: C.html, padding: "16px 40px", borderRadius: 999 }}>
            Next: build the structure with HTML
          </span>
        </Appear>
      </div>

      {/* End card */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: previewOut }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: C.inkSoft }}>PAISLEY TECH STUDIO</div>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 96, color: C.ink, marginTop: 20, textAlign: "center", lineHeight: 1.1 }}>
          Dino Runner Build Series
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 50 }}>
          {[
            ["1", "Think like a creator", C.ink],
            ["2", "HTML", C.html],
            ["3", "CSS", C.css],
            ["4", "JavaScript", C.js],
            ["5", "AI", C.dino],
          ].map(([n, label, color], i) => (
            <div
              key={n}
              style={{
                fontFamily: QUICKSAND,
                fontWeight: 700,
                fontSize: 28,
                padding: "14px 28px",
                borderRadius: 999,
                background: i === 0 ? C.good : "white",
                color: i === 0 ? "white" : C.ink,
                border: `3px solid ${i === 0 ? C.good : color}`,
                opacity: interpolate(frame, [endCard + i * 4, endCard + i * 4 + 10], [0, 1], CLAMP),
              }}
            >
              {i === 0 ? "✓ " : ""}
              {n}. {label}
            </div>
          ))}
        </div>
      </AbsoluteFill>

      <Sfx at={cues.line("t1")} name="pop" volume={0.5} />
      {DRAW_LIST.map((item) => (
        <Sfx key={item.word} at={cues.word("t3", item.word)} name="tick" volume={0.4} />
      ))}
      {QUESTIONS.map((q) => (
        <Sfx key={q.word} at={cues.word("t5", q.word) - 8} name="tick" volume={0.3} />
      ))}
      {["cat", "puddles", "robot"].map((w) => (
        <Sfx key={w} at={cues.word("t6", w)} name="thunk" volume={0.4} />
      ))}
      <Sfx at={cues.line("t8") - 4} name="whoosh" volume={0.35} />
      <Sfx at={endCard} name="chime" volume={0.45} />
    </SceneFade>
  );
};
