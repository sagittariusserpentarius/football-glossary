export interface PageMetadata {
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
}

/** Dark theme color used for embed accent strips (Discord, Slack, etc.) */
const EMBED_THEME_COLOR = "#0f172a";

/**
 * Updates the document's <head> with Open Graph, Twitter, and theme meta tags.
 * Always applies a dark theme-color for consistent embed appearance.
 */
export function updateMetaTags(metadata: PageMetadata): void {
  const { title, description, imageUrl, url } = metadata;

  document.title = title;

  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? "property" : "name";
    let tag = document.querySelector(`meta[${attr}="${name}"]`);

    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }

    tag.setAttribute("content", content);
  };

  // Theme color — dark accent for all embeds
  setMeta("theme-color", EMBED_THEME_COLOR);
  setMeta("color-scheme", "dark light");

  // Open Graph tags
  setMeta("og:title", title, true);
  setMeta("og:description", description, true);
  setMeta("og:url", url, true);
  setMeta("og:type", "website", true);
  setMeta("og:site_name", "Football Glossary", true);

  if (imageUrl) {
    const absoluteImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : window.location.origin + imageUrl;

    setMeta("og:image", absoluteImageUrl, true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "800", true);
  }

  // Twitter Card tags
  setMeta("twitter:card", imageUrl ? "summary_large_image" : "summary");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);

  if (imageUrl) {
    const absoluteImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : window.location.origin + imageUrl;
    setMeta("twitter:image", absoluteImageUrl);
  }
}

export function getFormationDescription(
  name: string,
  category: string,
  description: string,
): string {
  const categoryLabel = category.replace("-", " ").toLowerCase();
  return `${name} - A ${categoryLabel} formation. ${description.substring(0, 200)}${description.length > 200 ? "..." : ""}`;
}

export function getCoverageDescription(
  name: string,
  description: string,
): string {
  return `${name} coverage scheme. ${description.substring(0, 200)}${description.length > 200 ? "..." : ""}`;
}

export function getTermDescription(term: string, definition: string): string {
  return `${term}: ${definition.substring(0, 200)}${definition.length > 200 ? "..." : ""}`;
}