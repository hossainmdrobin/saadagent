"use client";

import { useMemo } from "react";
import type { Language } from "./file-tree";

export type TokenType =
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "function"
  | "property"
  | "tag"
  | "attribute"
  | "operator"
  | "punctuation"
  | "plain";

export interface Token {
  type: TokenType;
  value: string;
}

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: "#569CD6",
  string: "#CE9178",
  number: "#B5CEA8",
  comment: "#6A9955",
  function: "#DCDCAA",
  property: "#9CDCFE",
  tag: "#4EC9B0",
  attribute: "#9CDCFE",
  operator: "#D4D4D4",
  punctuation: "#D4D4D4",
  plain: "#D4D4D4",
};

const JS_KEYWORDS = [
  "abstract",
  "any",
  "as",
  "async",
  "await",
  "bigint",
  "boolean",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "declare",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "get",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "keyof",
  "let",
  "new",
  "never",
  "null",
  "number",
  "object",
  "of",
  "private",
  "protected",
  "public",
  "readonly",
  "return",
  "satisfies",
  "set",
  "static",
  "string",
  "super",
  "switch",
  "symbol",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "unknown",
  "var",
  "void",
  "while",
  "yield",
];

interface LanguageSpec {
  pattern: RegExp;
  groups: (TokenType | "whitespace")[];
}

const JS_SPEC: LanguageSpec = {
  pattern: new RegExp(
    [
      String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
      String.raw`(?<string>"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\`(?:[^\`\\]|\\.)*\`)`,
      String.raw`(?<number>\b(?:0[xXbBoO][\da-fA-F]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b)`,
      String.raw`(?<keyword>\b(?:${JS_KEYWORDS.join("|")})\b)`,
      String.raw`(?<function>[A-Za-z_$][\w$]*(?=\s*\())`,
      String.raw`(?<property>(?<=\.)[A-Za-z_$][\w$]*)`,
      String.raw`(?<tag>(?<=<\/?)[A-Za-z][\w$-]*)`,
      String.raw`(?<attribute>(?<=[<\s\/])[A-Za-z_$][\w$-]*(?=\s*=))`,
      String.raw`(?<whitespace>[ \t\r\n]+)`,
      String.raw`(?<operator>=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\*\*|[-+*/%=<>!&|?^~])`,
      String.raw`(?<punctuation>[;:,.()\[\]{}@#])`,
      String.raw`(?<plain>[A-Za-z_$][\w$]*|.)`,
    ].join("|"),
    "g",
  ),
  groups: [
    "comment",
    "string",
    "number",
    "keyword",
    "function",
    "property",
    "tag",
    "attribute",
    "whitespace",
    "operator",
    "punctuation",
    "plain",
  ],
};

const JSON_SPEC: LanguageSpec = {
  pattern: new RegExp(
    [
      String.raw`(?<attribute>"(?:[^"\\\n]|\\.)*"(?=\s*:))`,
      String.raw`(?<string>"(?:[^"\\\n]|\\.)*")`,
      String.raw`(?<number>-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)`,
      String.raw`(?<keyword>\b(?:true|false|null)\b)`,
      String.raw`(?<whitespace>[ \t\r\n]+)`,
      String.raw`(?<punctuation>[{}[\]:,])`,
      String.raw`(?<plain>.)`,
    ].join("|"),
    "g",
  ),
  groups: [
    "attribute",
    "string",
    "number",
    "keyword",
    "whitespace",
    "punctuation",
    "plain",
  ],
};

const CSS_SPEC: LanguageSpec = {
  pattern: new RegExp(
    [
      String.raw`(?<comment>\/\*[\s\S]*?\*\/)`,
      String.raw`(?<string>"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')`,
      String.raw`(?<keyword>@[\w-]+)`,
      String.raw`(?<number>#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|r?em|%|vh|vw|vmin|vmax|ch|ex|s|ms|deg|rad|fr|pt|dpi)?\b)`,
      String.raw`(?<property>(?<=[;{\s])[a-z-]+(?=\s*:))`,
      String.raw`(?<tag>[^{};:\n][^{}\n]*(?=\s*\{))`,
      String.raw`(?<whitespace>[ \t\r\n]+)`,
      String.raw`(?<punctuation>[{}:;,>~+*=.()\[\]])`,
      String.raw`(?<plain>[^\s{}:;,>~+*=.()\[\]]+)`,
    ].join("|"),
    "g",
  ),
  groups: [
    "comment",
    "string",
    "keyword",
    "number",
    "property",
    "tag",
    "whitespace",
    "punctuation",
    "plain",
  ],
};

const MARKDOWN_SPEC: LanguageSpec = {
  pattern: new RegExp(
    [
      String.raw`(?<keyword>^#{1,6}[^\n]*)`,
      String.raw`(?<string>\[[^\]\n]*\]\([^\s)]+\))`,
      String.raw`(?<function>(?<!\w)\*\*[^*]+\*\*)`,
      String.raw`(?<tag>(?<!\w)\*[^*\n]+\*)`,
      String.raw`(?<attribute>\`[^\`\n]+\`)`,
      String.raw`(?<comment>^[-*>][^\n]*)`,
      String.raw`(?<whitespace>[ \t\r\n]+)`,
      String.raw`(?<plain>.)`,
    ].join("|"),
    "gm",
  ),
  groups: [
    "keyword",
    "string",
    "function",
    "tag",
    "attribute",
    "comment",
    "whitespace",
    "plain",
  ],
};

const SPECS: Record<Language, LanguageSpec> = {
  javascript: JS_SPEC,
  typescript: JS_SPEC,
  html: JS_SPEC,
  json: JSON_SPEC,
  css: CSS_SPEC,
  markdown: MARKDOWN_SPEC,
  plaintext: {
    pattern: new RegExp(String.raw`(?<plain>.)`, "gs"),
    groups: ["plain"],
  },
};

export function tokenize(code: string, language: Language): Token[] {
  const spec = SPECS[language];
  const tokens: Token[] = [];
  const pattern = new RegExp(spec.pattern.source, spec.pattern.flags);
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(code);

  while (match) {
    if (match.index > lastIndex) {
      tokens.push({ type: "plain", value: code.slice(lastIndex, match.index) });
    }

    const matchedGroup = spec.groups.find((group) => match?.groups?.[group]);
    tokens.push({
      type:
        matchedGroup === undefined || matchedGroup === "whitespace"
          ? "plain"
          : matchedGroup,
      value: match[0],
    });

    lastIndex = pattern.lastIndex;

    if (match[0] === "") {
      pattern.lastIndex += 1;
    }

    match = pattern.exec(code);
  }

  if (lastIndex < code.length) {
    tokens.push({ type: "plain", value: code.slice(lastIndex) });
  }

  return tokens;
}

export function SyntaxHighlighter({
  code,
  language,
}: {
  code: string;
  language: Language;
}) {
  const tokens = useMemo(() => tokenize(code, language), [code, language]);

  return (
    <code>
      {tokens.map((token, index) => (
        <span key={index} style={{ color: TOKEN_COLORS[token.type] }}>
          {token.value}
        </span>
      ))}
    </code>
  );
}
