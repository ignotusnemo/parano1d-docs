import MarkdownIt from "markdown-it";
import katex from "katex";

type MarkdownItInstance = ReturnType<typeof MarkdownIt>;
type MathToken = { content: string };

const katexOptions = {
  output: "htmlAndMathml" as const,
  throwOnError: true,
  strict: "error" as const,
  trust: false,
  macros: {
    "\\State": "\\mathsf{State}",
    "\\HistoryStep": "\\mathsf{HistoryStep}",
    "\\Parano": "\\mathsf{Parano1d}"
  }
};

function isEscaped(source: string, index: number): boolean {
  let slashes = 0;
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === "\\"; cursor -= 1) {
    slashes += 1;
  }
  return slashes % 2 === 1;
}

export function mathPlugin(md: MarkdownItInstance): void {
  md.inline.ruler.after("escape", "math_inline", (state: any, silent: boolean) => {
    const start = state.pos;
    if (state.src[start] !== "$" || state.src[start + 1] === "$" || isEscaped(state.src, start)) {
      return false;
    }

    let end = start + 1;
    while (end < state.posMax) {
      if (state.src[end] === "\n") return false;
      if (state.src[end] === "$" && !isEscaped(state.src, end)) break;
      end += 1;
    }

    if (end >= state.posMax || end === start + 1) return false;
    const content = state.src.slice(start + 1, end);
    if (/^\s|\s$/.test(content)) return false;

    if (!silent) {
      const token = state.push("math_inline", "math", 0);
      token.content = content;
      token.markup = "$";
    }
    state.pos = end + 1;
    return true;
  });

  md.block.ruler.after("blockquote", "math_block", (state: any, startLine: number, endLine: number, silent: boolean) => {
    const firstStart = state.bMarks[startLine] + state.tShift[startLine];
    const firstEnd = state.eMarks[startLine];
    const first = state.src.slice(firstStart, firstEnd).trim();
    if (!first.startsWith("$$")) return false;

    let content = "";
    let nextLine = startLine + 1;
    const singleLine = first.length > 4 && first.endsWith("$$");

    if (singleLine) {
      content = first.slice(2, -2).trim();
    } else {
      const opening = first.slice(2).trim();
      if (opening) content = opening;

      let closed = false;
      for (; nextLine < endLine; nextLine += 1) {
        const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
        const lineEnd = state.eMarks[nextLine];
        const line = state.src.slice(lineStart, lineEnd);
        const trimmed = line.trim();

        if (trimmed.endsWith("$$") && !isEscaped(trimmed, trimmed.length - 2)) {
          const beforeClose = trimmed.slice(0, -2).trimEnd();
          content += `${content ? "\n" : ""}${beforeClose}`;
          nextLine += 1;
          closed = true;
          break;
        }
        content += `${content ? "\n" : ""}${line}`;
      }
      if (!closed) return false;
    }

    if (!content) return false;
    if (silent) return true;

    const token = state.push("math_block", "math", 0);
    token.block = true;
    token.content = content;
    token.map = [startLine, nextLine];
    token.markup = "$$";
    state.line = nextLine;
    return true;
  });

  md.renderer.rules.math_inline = (tokens: MathToken[], index: number) =>
    katex.renderToString(tokens[index].content, {
      ...katexOptions,
      displayMode: false
    });

  md.renderer.rules.math_block = (tokens: MathToken[], index: number) =>
    `<div class="math-display">${katex.renderToString(tokens[index].content, {
      ...katexOptions,
      displayMode: true
    })}</div>`;
}
