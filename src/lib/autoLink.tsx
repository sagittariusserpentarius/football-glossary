import type { ReactNode } from "react";
import type { Formation } from "../types/formations";
import type { GlossaryTerm } from "../types/glossary";
import type { Coverage } from "../types/coverages";

type LinkableType = "formation" | "term" | "coverage";

interface LinkableItem {
  id: string;
  displayName: string;
  type: LinkableType;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Turn `text` into React nodes with clickable links for any formation,
 * coverage, or glossary term whose canonical name appears verbatim.
 *
 * Matching rules (designed to avoid false positives on ordinary words):
 *   - Case-SENSITIVE. Authors must write the term exactly as it appears
 *     in the glossary for it to link. This prevents "pass", "flat",
 *     "hook", "man", "zone", etc. from auto-linking when used as plain
 *     English in prose.
 *   - Word boundaries on both sides, so sub-word fragments never match.
 *   - Longest-first alternation so "Cover 2" beats "Cover".
 *   - Only the first occurrence of each item links; later repeats are
 *     rendered as plain text.
 *   - The page's own id (`currentId`) never self-links.
 */
export function createAutoLinkedText(
  text: string,
  formations: Formation[],
  terms: GlossaryTerm[],
  coverages: Coverage[],
  onSelectFormation: (id: string) => void,
  onSelectTerm: (id: string) => void,
  onSelectCoverage: (id: string) => void,
  currentId?: string
): ReactNode {
  const linkables: LinkableItem[] = [
    ...formations.map((f) => ({
      id: f.id,
      displayName: f.name,
      type: "formation" as const,
    })),
    ...coverages.map((c) => ({
      id: c.id,
      displayName: c.name,
      type: "coverage" as const,
    })),
    ...terms.map((t) => ({
      id: t.id,
      displayName: t.term,
      type: "term" as const,
    })),
  ];

  // Longer names first so e.g. "Cover 2" wins over "Cover".
  linkables.sort((a, b) => b.displayName.length - a.displayName.length);

  if (linkables.length === 0) return text;

  const pattern = linkables.map((l) => escapeRegex(l.displayName)).join("|");
  // NOTE: case-sensitive on purpose — see function doc.
  const regex = new RegExp(`\\b(?:${pattern})\\b`, "g");

  // Fast lookup from matched text back to the LinkableItem.
  const byDisplayName = new Map<string, LinkableItem>();
  for (const l of linkables) {
    if (!byDisplayName.has(l.displayName)) byDisplayName.set(l.displayName, l);
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;
  const alreadyLinked = new Set<string>();

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t-${keyCounter++}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    const matchedText = match[0];
    const linkable = byDisplayName.get(matchedText);

    const shouldLink =
      !!linkable &&
      linkable.id !== currentId &&
      !alreadyLinked.has(linkable.id);

    if (shouldLink && linkable) {
      alreadyLinked.add(linkable.id);
      parts.push(
        <button
          key={`l-${keyCounter++}`}
          onClick={() => {
            if (linkable.type === "formation") onSelectFormation(linkable.id);
            else if (linkable.type === "coverage") onSelectCoverage(linkable.id);
            else onSelectTerm(linkable.id);
          }}
          className="text-emerald-600 hover:text-emerald-400 underline underline-offset-2 decoration-emerald-600/50 hover:decoration-emerald-400 transition-colors duration-150"
        >
          {matchedText}
        </button>
      );
    } else {
      parts.push(<span key={`t-${keyCounter++}`}>{matchedText}</span>);
    }

    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t-${keyCounter++}`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
}