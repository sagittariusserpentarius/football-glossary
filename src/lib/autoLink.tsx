import type { ReactNode } from "react";
import type { Formation } from "../types/formations";
import type { GlossaryTerm } from "../types/glossary";

interface LinkableItem {
  id: string;
  displayName: string;
  type: "formation" | "term";
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Takes a text string and returns React nodes with clickable links
 * for any terms or formations that are defined in the glossary.
 */
export function createAutoLinkedText(
  text: string,
  formations: Formation[],
  terms: GlossaryTerm[],
  onSelectFormation: (id: string) => void,
  onSelectTerm: (id: string) => void,
  currentId?: string
): ReactNode {
  // Build a list of all linkable items
  const linkables: LinkableItem[] = [
    ...formations.map((f) => ({
      id: f.id,
      displayName: f.name,
      type: "formation" as const,
    })),
    ...terms.map((t) => ({
      id: t.id,
      displayName: t.term,
      type: "term" as const,
    })),
  ];

  // Sort by length descending to match longer terms first (e.g., "pick-6" before "pick")
  linkables.sort((a, b) => b.displayName.length - a.displayName.length);

  if (linkables.length === 0) return text;

  // Create a regex pattern for all terms (case-insensitive, word boundaries)
  const pattern = linkables.map((l) => escapeRegex(l.displayName)).join("|");

  // Use word boundaries to avoid matching partial words
  const regex = new RegExp(`\\b(${pattern})\\b`, "gi");

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${keyCounter++}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    const matchedText = match[0];
    const linkable = linkables.find(
      (l) => l.displayName.toLowerCase() === matchedText.toLowerCase()
    );

    if (linkable && linkable.id !== currentId) {
      // Create a clickable link
      parts.push(
        <button
          key={`link-${keyCounter++}`}
          onClick={() =>
            linkable.type === "formation"
              ? onSelectFormation(linkable.id)
              : onSelectTerm(linkable.id)
          }
          className="text-emerald-600 hover:text-emerald-400 underline underline-offset-2 decoration-emerald-600/50 hover:decoration-emerald-400 transition-colors duration-150"
        >
          {matchedText}
        </button>
      );
    } else {
      // It's the current term or not found, don't link
      parts.push(<span key={`text-${keyCounter++}`}>{matchedText}</span>);
    }

    lastIndex = match.index + matchedText.length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${keyCounter++}`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
}