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
 * Single-word glossary names that are also ordinary English words.
 * For these we require canonical-case match so prose like "rolls down
 * the field" or "both the run and pass" doesn't auto-link.
 *
 * Multi-word / hyphenated / digit-containing names bypass this check
 * — they're structurally distinctive enough on their own.
 */
const AMBIGUOUS_COMMON_WORDS = new Set([
  // Single-word terms currently in the glossary that are common English
  "down",
  "snap",
  "sack",
  "safety",
  "fumble",
  "blitz",
  "audible",
  // Words commonly added to football glossaries that overlap with English
  "pass",
  "run",
  "block",
  "rush",
  "cover",
  "zone",
  "man",
  "line",
  "end",
  "hook",
  "flat",
  "pick",
  "route",
  "trap",
]);

/** Has a space, hyphen, digit, or any non-letter — structurally distinctive. */
function isDistinctive(name: string): boolean {
  return /[^A-Za-z]/.test(name);
}

function requiresCanonicalCase(displayName: string): boolean {
  if (isDistinctive(displayName)) return false;
  return AMBIGUOUS_COMMON_WORDS.has(displayName.toLowerCase());
}

/**
 * Turn `text` into React nodes, auto-linking any formation, coverage, or
 * glossary term whose name appears.
 *
 * Matching rules:
 *   - Word-boundary regex so sub-word fragments never match.
 *   - Longest-first alternation, so "Cover 2" beats "Cover".
 *   - Case-insensitive by default.
 *   - Single-word terms that are also common English words must appear
 *     in their canonical case (see AMBIGUOUS_COMMON_WORDS).
 *   - Only the first occurrence of each item links; later repeats are
 *     rendered as plain text to keep descriptions readable.
 *   - The page's own id never self-links.
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

  // Longer names first so "Cover 2" beats "Cover", "Pick-6" beats "Pick", etc.
  linkables.sort((a, b) => b.displayName.length - a.displayName.length);
  if (linkables.length === 0) return text;

  const pattern = linkables.map((l) => escapeRegex(l.displayName)).join("|");
  const regex = new RegExp(`\\b(?:${pattern})\\b`, "gi");

  // Lookup by lowercase name; on collision keep the longest (sort ensures we
  // see longer first, so we only set when absent).
  const byLower = new Map<string, LinkableItem>();
  for (const l of linkables) {
    const k = l.displayName.toLowerCase();
    if (!byLower.has(k)) byLower.set(k, l);
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
    const linkable = byLower.get(matchedText.toLowerCase());

    const caseOk =
      !!linkable &&
      (!requiresCanonicalCase(linkable.displayName) ||
        matchedText === linkable.displayName);

    const shouldLink =
      !!linkable &&
      caseOk &&
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