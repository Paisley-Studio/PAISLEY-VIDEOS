import React from "react";
import { IDE } from "../styles/theme";

export type Lang = "html" | "css" | "js";
type Tok = { t: string; c: string };
const T = IDE.tok;

const JS_KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "new", "try", "catch", "of", "in", "typeof",
]);
const JS_ATOMS = new Set(["true", "false", "null", "undefined"]);

const html = (line: string): Tok[] => {
  const out: Tok[] = [];
  let i = 0;
  while (i < line.length) {
    if (line.startsWith("<!--", i)) {
      const end = line.indexOf("-->", i);
      const j = end < 0 ? line.length : end + 3;
      out.push({ t: line.slice(i, j), c: T.comment });
      i = j;
    } else if (line.startsWith("<!", i)) {
      const j = line.indexOf(">", i) + 1 || line.length;
      out.push({ t: line.slice(i, j), c: T.meta });
      i = j;
    } else if (line[i] === "<") {
      const m = /^<\/?[a-zA-Z0-9-]*/.exec(line.slice(i))!;
      out.push({ t: m[0], c: T.tag });
      i += m[0].length;
      while (i < line.length && line[i] !== ">") {
        const rest = line.slice(i);
        const attr = /^[a-zA-Z-:]+/.exec(rest);
        const str = /^("[^"]*"?|'[^']*'?)/.exec(rest);
        if (attr) {
          out.push({ t: attr[0], c: T.attr });
          i += attr[0].length;
        } else if (str) {
          out.push({ t: str[0], c: T.string });
          i += str[0].length;
        } else if (rest.startsWith("/>")) {
          break;
        } else {
          out.push({ t: line[i], c: T.plain });
          i++;
        }
      }
      if (line.startsWith("/>", i)) {
        out.push({ t: "/>", c: T.tag });
        i += 2;
      } else if (line[i] === ">") {
        out.push({ t: ">", c: T.tag });
        i++;
      }
    } else {
      const j = line.indexOf("<", i);
      const k = j < 0 ? line.length : j;
      out.push({ t: line.slice(i, k), c: T.plain });
      i = k;
    }
  }
  return out;
};

const css = (line: string, state: { inBlock: boolean; inComment: boolean }): Tok[] => {
  const out: Tok[] = [];
  let i = 0;
  let afterColon = false;
  while (i < line.length) {
    const rest = line.slice(i);
    if (state.inComment || rest.startsWith("/*")) {
      const end = line.indexOf("*/", state.inComment ? i : i + 2);
      const j = end < 0 ? line.length : end + 2;
      state.inComment = end < 0;
      out.push({ t: line.slice(i, j), c: T.comment });
      i = j;
      continue;
    }
    let m: RegExpExecArray | null;
    if (rest[0] === "{") {
      state.inBlock = true;
      out.push({ t: "{", c: T.plain });
      i++;
    } else if (rest[0] === "}") {
      state.inBlock = false;
      out.push({ t: "}", c: T.plain });
      i++;
    } else if ((m = /^--[a-zA-Z0-9-]+/.exec(rest))) {
      out.push({ t: m[0], c: T.variable2 });
      i += m[0].length;
    } else if ((m = /^("[^"]*"|'[^']*')/.exec(rest))) {
      out.push({ t: m[0], c: T.string });
      i += m[0].length;
    } else if ((m = /^#[0-9a-fA-F]{3,8}\b/.exec(rest)) && state.inBlock) {
      out.push({ t: m[0], c: T.atom });
      i += m[0].length;
    } else if ((m = /^-?[0-9.]+(px|deg|s|%|fr|vw|em|rem)?/.exec(rest)) && (state.inBlock || afterColon)) {
      out.push({ t: m[0], c: T.number });
      i += m[0].length;
    } else if ((m = /^@[a-z-]+/.exec(rest))) {
      out.push({ t: m[0], c: T.def });
      i += m[0].length;
    } else if (!state.inBlock && (m = /^#[a-zA-Z][\w-]*/.exec(rest))) {
      out.push({ t: m[0], c: T.builtin });
      i += m[0].length;
    } else if (!state.inBlock && (m = /^\.[a-zA-Z][\w-]*/.exec(rest))) {
      out.push({ t: m[0], c: T.qualifier });
      i += m[0].length;
    } else if (!state.inBlock && (m = /^:{1,2}[a-zA-Z-]+/.exec(rest))) {
      out.push({ t: m[0], c: T.variable2 });
      i += m[0].length;
    } else if ((m = /^[a-zA-Z-]+/.exec(rest))) {
      const isProp = state.inBlock && !afterColon && /^\s*:/.test(rest.slice(m[0].length));
      const c = !state.inBlock ? T.tag : isProp ? T.plain : T.atom;
      out.push({ t: m[0], c });
      i += m[0].length;
    } else {
      if (rest[0] === ":") afterColon = true;
      if (rest[0] === ";") afterColon = false;
      out.push({ t: rest[0], c: T.plain });
      i++;
    }
  }
  return out;
};

const js = (line: string): Tok[] => {
  const out: Tok[] = [];
  let i = 0;
  let prevWord = "";
  while (i < line.length) {
    const rest = line.slice(i);
    let m: RegExpExecArray | null;
    if (rest.startsWith("//")) {
      out.push({ t: rest, c: T.comment });
      break;
    } else if ((m = /^("[^"]*"|'[^']*'|`[^`]*`?)/.exec(rest))) {
      out.push({ t: m[0], c: T.string });
      i += m[0].length;
    } else if ((m = /^[0-9][0-9.]*/.exec(rest))) {
      out.push({ t: m[0], c: T.number });
      i += m[0].length;
    } else if ((m = /^[A-Za-z_$][\w$]*/.exec(rest))) {
      const w = m[0];
      const before = line.slice(0, i).trimEnd();
      let c: string = T.plain;
      if (JS_KEYWORDS.has(w)) c = T.keyword;
      else if (JS_ATOMS.has(w)) c = T.atom;
      else if (["const", "let", "var", "function"].includes(prevWord)) c = T.def;
      else if (before.endsWith(".")) c = T.plain;
      out.push({ t: w, c });
      prevWord = w;
      i += w.length;
      continue;
    } else {
      out.push({ t: rest[0], c: T.plain });
      i++;
    }
    if (!/^\s/.test(rest)) prevWord = "";
  }
  return out;
};

/** Tokenise a whole file (state carries across lines for CSS blocks/comments). */
export const tokenize = (lines: string[], lang: Lang): Tok[][] => {
  const cssState = { inBlock: false, inComment: false };
  return lines.map((l) => (lang === "html" ? html(l) : lang === "css" ? css(l, cssState) : js(l)));
};

/** Renders tokens for one line, showing only the first `chars` characters (for typing). */
export const Line: React.FC<{ toks: Tok[]; chars?: number }> = ({ toks, chars = Infinity }) => {
  let left = chars;
  const spans: React.ReactNode[] = [];
  toks.forEach((tok, k) => {
    if (left <= 0) return;
    const text = tok.t.slice(0, left);
    left -= text.length;
    spans.push(
      <span key={k} style={{ color: tok.c }}>
        {text}
      </span>,
    );
  });
  return <>{spans}</>;
};
