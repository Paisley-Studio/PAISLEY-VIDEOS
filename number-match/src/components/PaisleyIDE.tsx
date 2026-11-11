import React from "react";
import { C, IDE, MONO, QUICKSAND } from "../styles/theme";
import { Lang, Line, tokenize } from "./highlight";

/**
 * The Paisley Studio IDE ("Paisley VS Code"), rebuilt from the supplied
 * screenshots at native 1920×1080. Only controls visible in the screenshots
 * are drawn. IDE_RECTS gives every control's box for highlights and cursors.
 */

export type Rect = { x: number; y: number; w: number; h: number };
export const TOPBAR_H = 66;
export const SIDEBAR_W = 300;
export const EDITOR_X = 300;
export const PREVIEW_X = 1110;
export const HINT_H = 66;
export const CONSOLE_H = 44;

export const IDE_RECTS = {
  pill: { x: 12, y: 14, w: 200, h: 38 },
  layoutBtn: { x: 1612, y: 12, w: 46, h: 42 },
  collapseBtn: { x: 1667, y: 12, w: 46, h: 42 },
  save: { x: 1721, y: 12, w: 96, h: 42 },
  run: { x: 1823, y: 12, w: 85, h: 42 },
  sidebar: { x: 0, y: TOPBAR_H, w: SIDEBAR_W, h: 1080 - TOPBAR_H },
  sideButtons: { x: 8, y: 74, w: 170, h: 43 },
  newFile: { x: 11, y: 77, w: 50, h: 37 },
  newFolder: { x: 68, y: 77, w: 50, h: 37 },
  upload: { x: 125, y: 77, w: 50, h: 37 },
  editor: { x: EDITOR_X, y: TOPBAR_H, w: PREVIEW_X - EDITOR_X, h: 1080 - TOPBAR_H - HINT_H },
  hint: { x: EDITOR_X, y: 1080 - HINT_H, w: PREVIEW_X - EDITOR_X, h: HINT_H },
  preview: { x: PREVIEW_X, y: TOPBAR_H, w: 1920 - PREVIEW_X, h: 1080 - TOPBAR_H - CONSOLE_H },
  console: { x: PREVIEW_X, y: 1080 - CONSOLE_H, w: 1920 - PREVIEW_X, h: CONSOLE_H },
} satisfies Record<string, Rect>;

/** Row rectangle of the n-th entry in the file list (0 = project row). */
export const fileRowRect = (n: number): Rect => ({ x: 0, y: 132 + n * 44, w: SIDEBAR_W, h: 42 });
export const fileActionRects = (n: number) => ({
  rename: { x: 220, y: 132 + n * 44 + 6, w: 30, h: 30 },
  remove: { x: 256, y: 132 + n * 44 + 6, w: 30, h: 30 },
});

export type IdeFile = { name: string; kind: "project" | "folder" | "html" | "css" | "js"; depth?: number };

export type IdeCode = {
  lang: Lang;
  lines: string[];
  /** characters visible (counting \n between lines); Infinity = all */
  chars?: number;
  fontSize?: number; // native px; the real IDE uses 19
  scroll?: number; // in lines
  /** line backgrounds: 1-based inclusive ranges */
  marks?: { from: number; to: number; color: string }[];
  caret?: { line: number; col: number } | "end" | null;
  /** select (highlight) text on a line: 1-based line, 0-based cols */
  selection?: { line: number; from: number; to: number } | null;
};

export type Focus = { target: keyof typeof IDE_RECTS | Rect; amount: number; label?: string; labelSide?: "below" | "right" | "left" | "above" };

type Props = {
  files: IdeFile[];
  activeFile?: string;
  activePath?: string;
  showFileActions?: boolean;
  newFileInput?: string | null;
  code?: IdeCode;
  hint?: string;
  preview?: React.ReactNode;
  previewBlank?: boolean;
  consoleOpen?: number; // 0..1
  consoleLines?: string[];
  showSave?: boolean;
  press?: { save?: number; run?: number; newFile?: number };
  focus?: Focus[];
};

// ---------- icons (simple flat SVG) ----------
const S = ({ children, size = 22, color = IDE.iconGreen }: { children: React.ReactNode; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    {children}
  </svg>
);
const NewFileIcon = () => (
  <S>
    <path d="M6 2h8l5 5v6.2a6 6 0 0 0-7.8 8.8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5" />
    <circle cx="17.5" cy="18.5" r="4.5" />
    <path d="M17 16h1v2h2v1h-2v2h-1v-2h-2v-1h2z" fill="#fff" />
  </S>
);
const NewFolderIcon = () => (
  <S>
    <path d="M3 5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M11.3 9h1.4v2.8h2.8v1.4h-2.8V16h-1.4v-2.8H8.5v-1.4h2.8z" fill="#fff" />
  </S>
);
const UploadIcon = () => (
  <S>
    <path d="M12 3l6 6h-4v6h-4V9H6zM4 17h3v2h10v-2h3v5H4z" />
  </S>
);
const PencilIcon = () => (
  <S size={20}>
    <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z" />
  </S>
);
const TrashIcon = () => (
  <S size={20}>
    <path d="M6 7h12l-1 14H7zM9 3h6l1 2h4v2H4V5h4z" />
  </S>
);
const SaveIcon = () => (
  <S size={20} color="#fff">
    <path d="M4 3h12l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 2v5h10V5Zm6 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  </S>
);
const PlayIcon = () => (
  <S size={20} color={IDE.runText}>
    <path d="M7 4l13 8-13 8z" />
  </S>
);
const LayoutIcon = () => (
  <S size={20}>
    <path d="M3 4h18v16H3Zm2 2v12h6V6Zm8 0v12h6V6Z" />
  </S>
);
const CollapseIcon = () => (
  <S size={18}>
    <path d="M9 3v6H3V7h4V3Zm6 0h2v4h4v2h-6Zm-6 18H7v-4H3v-2h6Zm6 0v-6h6v2h-4v4Z" />
  </S>
);
export const FileIcon: React.FC<{ kind: IdeFile["kind"]; size?: number }> = ({ kind, size = 20 }) => {
  if (kind === "project")
    return (
      <S size={size} color={IDE.folderYellow}>
        <path d="M3 4h18v4H3zM4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm5 2v2h6v-2Z" />
      </S>
    );
  if (kind === "folder")
    return (
      <S size={size} color={IDE.folderYellow}>
        <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v1H6l-3 9H2Zm3 4h18l-3 10H2Z" />
      </S>
    );
  if (kind === "js")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" fill={IDE.jsIcon} />
        <text x="12" y="18" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Arial">JS</text>
      </svg>
    );
  const color = kind === "html" ? IDE.htmlIcon : IDE.cssIcon;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M4 2h16l-1.5 17L12 22l-6.5-3z" fill={color} />
      <path d="M8 6h8l-.3 3H11l.2 2.4h4.3l-.5 5L12 17.5l-3-1-.2-2.4h2.2l.1 1 .9.3.9-.3.1-1.6H8.5z" fill="#fff" />
    </svg>
  );
};

// ---------- pieces ----------
const BtnSquare: React.FC<{ rect: Rect; children: React.ReactNode; pressed?: number }> = ({ rect, children, pressed = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
      borderRadius: 10,
      border: `2px solid ${IDE.buttonBorder}`,
      background: pressed > 0 ? IDE.sidebarActive : C.white,
      boxSizing: "border-box",
      display: "grid",
      placeItems: "center",
      transform: `scale(${1 - pressed * 0.08})`,
    }}
  >
    {children}
  </div>
);

export const FocusRing: React.FC<{ focus: Focus }> = ({ focus }) => {
  const r = typeof focus.target === "string" ? IDE_RECTS[focus.target] : focus.target;
  if (focus.amount <= 0) return null;
  const pad = 6;
  const a = focus.amount;
  const side = focus.labelSide ?? "below";
  const labelStyle: React.CSSProperties = {
    position: "absolute",
    whiteSpace: "nowrap",
    background: C.gold,
    color: C.ink,
    fontFamily: QUICKSAND,
    fontWeight: 700,
    fontSize: 26,
    letterSpacing: "0.06em",
    padding: "8px 18px",
    borderRadius: 12,
    boxShadow: `0 5px 0 ${C.goldDark}`,
    opacity: a,
  };
  const pos: React.CSSProperties =
    side === "below"
      ? { left: r.x - pad, top: r.y + r.h + pad + 14 }
      : side === "above"
        ? { left: r.x - pad, top: r.y - pad - 66 }
        : side === "right"
          ? { left: r.x + r.w + pad + 16, top: r.y + r.h / 2 - 25 }
          : { right: 1920 - (r.x - pad - 16), top: r.y + r.h / 2 - 25 };
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: r.x - pad,
          top: r.y - pad,
          width: r.w + pad * 2,
          height: r.h + pad * 2,
          border: `5px solid ${C.gold}`,
          borderRadius: 14,
          boxSizing: "border-box",
          opacity: a,
          transform: `scale(${1.06 - 0.06 * a})`,
        }}
      />
      {focus.label && <div style={{ ...labelStyle, ...pos, transform: `translateY(${(1 - a) * 10}px)` }}>{focus.label}</div>}
    </>
  );
};

export const PaisleyIDE: React.FC<Props> = ({
  files,
  activeFile,
  activePath,
  showFileActions = false,
  newFileInput = null,
  code,
  hint = "HTML · Type a tag (d → div), Enter or Tab writes it · Ctrl+Space for suggestions · Emmet: ul>li*3 then Tab",
  preview,
  previewBlank = false,
  consoleOpen = 0,
  consoleLines = [],
  showSave = true,
  press = {},
  focus = [],
}) => {
  const fontSize = code?.fontSize ?? 19;
  const lineH = Math.round(fontSize * 1.65);
  const activeIndex = files.findIndex((f) => f.name === activeFile);
  const activeKind = files[activeIndex]?.kind ?? "html";

  // code visibility by characters
  const lines = code?.lines ?? [];
  const toks = code ? tokenize(lines, code.lang) : [];
  let budget = code?.chars ?? Infinity;
  const visible = lines.map((l) => {
    const v = Math.max(0, Math.min(l.length, budget));
    budget -= l.length + 1;
    return v;
  });
  let caretLine = -1;
  let caretCol = 0;
  if (code?.caret === "end") {
    let left = code.chars ?? Infinity;
    for (let i = 0; i < lines.length; i++) {
      if (left <= lines[i].length) {
        caretLine = i;
        caretCol = Math.max(0, left);
        break;
      }
      left -= lines[i].length + 1;
      if (i === lines.length - 1) {
        caretLine = i;
        caretCol = lines[i].length;
      }
    }
  } else if (code?.caret) {
    caretLine = code.caret.line - 1;
    caretCol = code.caret.col;
  }
  const scroll = code?.scroll ?? 0;
  const lineCount = Math.max(lines.length + 2, 12);
  const charW = fontSize * 0.6; // JetBrains Mono advance

  return (
    <div style={{ position: "relative", width: 1920, height: 1080, background: IDE.editorBg, overflow: "hidden", fontFamily: QUICKSAND }}>
      {/* top bar */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: TOPBAR_H, background: IDE.topbar, borderBottom: `2px solid ${IDE.topbarLine}`, boxSizing: "border-box" }}>
        <div
          style={{
            position: "absolute",
            ...rectStyle(IDE_RECTS.pill),
            background: IDE.pill,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 13,
            boxSizing: "border-box",
            color: C.white,
            fontWeight: 700,
            fontSize: 18,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: IDE.pillIcon, fontWeight: 700, fontFamily: MONO, fontSize: 17 }}>&lt;/&gt;</span> Paisley VS Code
        </div>
        <div style={{ position: "absolute", left: 222, top: 18, display: "flex", alignItems: "center", gap: 10, color: IDE.pathText, fontWeight: 600, fontSize: 21 }}>
          {activeFile && <FileIcon kind={activeKind} size={20} />}
          {activePath ?? activeFile}
        </div>
        <BtnSquare rect={IDE_RECTS.layoutBtn}>
          <LayoutIcon />
        </BtnSquare>
        <BtnSquare rect={IDE_RECTS.collapseBtn}>
          <CollapseIcon />
        </BtnSquare>
        {showSave && (
          <div
            style={{
              position: "absolute",
              ...rectStyle(IDE_RECTS.save),
              background: IDE.save,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: C.white,
              fontWeight: 700,
              fontSize: 19,
              transform: `scale(${1 - (press.save ?? 0) * 0.08})`,
            }}
          >
            <SaveIcon /> Save
          </div>
        )}
        <div
          style={{
            position: "absolute",
            ...rectStyle(IDE_RECTS.run),
            background: IDE.run,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            color: IDE.runText,
            fontWeight: 700,
            fontSize: 19,
            transform: `scale(${1 - (press.run ?? 0) * 0.08})`,
          }}
        >
          <PlayIcon /> Run
        </div>
      </div>

      {/* sidebar */}
      <div style={{ position: "absolute", ...rectStyle(IDE_RECTS.sidebar), background: IDE.sidebar, borderRight: `2px solid ${IDE.splitter}`, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 0, top: 58, width: SIDEBAR_W, height: 2, background: IDE.topbarLine }} />
      </div>
      <BtnSquare rect={IDE_RECTS.newFile} pressed={press.newFile}>
        <NewFileIcon />
      </BtnSquare>
      <BtnSquare rect={IDE_RECTS.newFolder}>
        <NewFolderIcon />
      </BtnSquare>
      <BtnSquare rect={IDE_RECTS.upload}>
        <UploadIcon />
      </BtnSquare>
      {files.map((f, n) => {
        const r = fileRowRect(n);
        const active = f.name === activeFile || f.kind === "project";
        const actions = fileActionRects(n);
        return (
          <div key={f.name + n} style={{ position: "absolute", ...rectStyle(r), background: active ? IDE.sidebarActive : "transparent", display: "flex", alignItems: "center", gap: 10, paddingLeft: 14 + (f.depth ?? 0) * 20, boxSizing: "border-box", color: IDE.sidebarText, fontWeight: 600, fontSize: 21 }}>
            <FileIcon kind={f.kind} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", maxWidth: 190 - (f.depth ?? 0) * 20 }}>{f.name}</span>
            {showFileActions && f.name === activeFile && f.kind !== "project" && (
              <>
                <div style={{ position: "absolute", ...rectStyle(actions.rename), display: "grid", placeItems: "center" }}>
                  <PencilIcon />
                </div>
                <div style={{ position: "absolute", ...rectStyle(actions.remove), display: "grid", placeItems: "center" }}>
                  <TrashIcon />
                </div>
              </>
            )}
          </div>
        );
      })}
      {newFileInput !== null && (
        <div style={{ position: "absolute", ...rectStyle(fileRowRect(files.length)), display: "flex", alignItems: "center", paddingLeft: 14, gap: 10, boxSizing: "border-box" }}>
          <FileIcon kind={newFileInput.endsWith(".css") ? "css" : newFileInput.endsWith(".js") ? "js" : "html"} />
          <div style={{ flex: 1, marginRight: 14, height: 32, border: `2px solid ${IDE.run}`, borderRadius: 6, background: C.white, display: "flex", alignItems: "center", paddingLeft: 8, fontSize: 20, fontWeight: 600, color: IDE.sidebarText }}>
            {newFileInput}
            <span style={{ width: 2, height: 22, background: IDE.sidebarText, marginLeft: 1 }} />
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: 14, bottom: 18, width: 270, color: IDE.sidebarHint, fontSize: 17, fontWeight: 500, lineHeight: 1.3 }}>
        Make a folder (for example images or videos), press its Upload button and pick files from your computer.
      </div>

      {/* editor */}
      <div style={{ position: "absolute", ...rectStyle(IDE_RECTS.editor), overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 45 + (fontSize - 19) * 1.6, height: "100%", background: IDE.gutter }} />
        <div style={{ position: "absolute", left: 0, top: 10 - scroll * lineH, right: 0 }}>
          {Array.from({ length: lineCount }).map((_, i) => {
            const mark = code?.marks?.find((m) => i + 1 >= m.from && i + 1 <= m.to);
            const isCaret = i === caretLine;
            const gutterW = 45 + (fontSize - 19) * 1.6;
            const sel = code?.selection && code.selection.line === i + 1 ? code.selection : null;
            return (
              <div key={i} style={{ position: "relative", height: lineH, display: "flex", alignItems: "center", background: mark ? mark.color : isCaret ? IDE.activeLine : "transparent" }}>
                <div style={{ width: gutterW, flexShrink: 0, textAlign: "right", paddingRight: 8, boxSizing: "border-box", color: IDE.gutterText, fontFamily: MONO, fontSize: fontSize * 0.95 }}>{i + 1}</div>
                <div style={{ position: "relative", paddingLeft: 7, fontFamily: MONO, fontSize, whiteSpace: "pre", color: IDE.tok.plain }}>
                  {sel && <div style={{ position: "absolute", left: 7 + sel.from * charW, top: -3, width: (sel.to - sel.from) * charW, height: fontSize * 1.4, background: "#b9dcf5" }} />}
                  <span style={{ position: "relative" }}>{i < lines.length ? <Line toks={toks[i]} chars={visible[i]} /> : null}</span>
                  {isCaret && <span style={{ position: "absolute", left: 7 + caretCol * charW, top: -2, width: 2.5, height: fontSize * 1.3, background: IDE.tok.plain }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", ...rectStyle(IDE_RECTS.hint), background: IDE.hintBar, borderTop: `2px solid ${IDE.splitter}`, boxSizing: "border-box", padding: "8px 18px", color: IDE.hintText, fontWeight: 600, fontSize: 17, lineHeight: 1.35 }}>
        {hint}
      </div>

      {/* preview */}
      <div style={{ position: "absolute", left: PREVIEW_X - 2, top: TOPBAR_H, width: 2, height: 1080 - TOPBAR_H, background: IDE.splitter }} />
      <div style={{ position: "absolute", ...rectStyle(IDE_RECTS.preview), background: IDE.previewBg, overflow: "hidden" }}>{!previewBlank && preview}</div>
      <div
        style={{
          position: "absolute",
          left: PREVIEW_X,
          width: 1920 - PREVIEW_X,
          top: 1080 - CONSOLE_H - consoleOpen * 220,
          height: CONSOLE_H + consoleOpen * 220,
          background: IDE.consoleBar,
          color: IDE.consoleText,
          fontWeight: 700,
          fontSize: 20,
          boxSizing: "border-box",
          padding: "9px 16px",
        }}
      >
        <span>{consoleOpen > 0.5 ? "▼" : "▶"} &gt;_ Console</span>
        {consoleOpen > 0 && (
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 22, color: "#e8f3ef", opacity: consoleOpen }}>
            {consoleLines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
      </div>

      {focus.map((f, i) => (
        <FocusRing key={i} focus={f} />
      ))}
    </div>
  );
};

const rectStyle = (r: Rect): React.CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h });

/** Screen position (native px) of a code character, for cursors and callouts. */
export const codePoint = (line: number, col: number, fontSize = 19, scroll = 0) => {
  const lineH = Math.round(fontSize * 1.65);
  const gutterW = 45 + (fontSize - 19) * 1.6;
  return { x: EDITOR_X + gutterW + 7 + col * fontSize * 0.6, y: TOPBAR_H + 10 + (line - 1 - scroll) * lineH + lineH / 2 };
};
