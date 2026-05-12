import html2canvas from 'html2canvas';

export interface PageMetadata {
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
}

/**
 * Captures a screenshot of a specific element, excluding certain selectors.
 * Returns a data URL of the screenshot.
 */
export async function captureElementScreenshot(
  elementId: string,
  excludeSelectors: string[] = []
): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Temporarily hide excluded elements
  const hiddenElements: { el: HTMLElement; display: string }[] = [];
  
  for (const selector of excludeSelectors) {
    const els = element.querySelectorAll(selector);
    els.forEach((el) => {
      if (el instanceof HTMLElement) {
        hiddenElements.push({ el, display: el.style.display });
        el.style.display = 'none';
      }
    });
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#2d5a27', // Match field background
      scale: 2, // Higher resolution for better quality
      useCORS: true,
      allowTaint: true,
    });
    
    const dataUrl = canvas.toDataURL('image/png', 0.85);
    return dataUrl;
  } finally {
    // Restore hidden elements
    hiddenElements.forEach(({ el, display }) => {
      el.style.display = display;
    });
  }
}

/**
 * Updates the document's <head> with Open Graph and Twitter meta tags.
 */
export function updateMetaTags(metadata: PageMetadata): void {
  const { title, description, imageUrl, url } = metadata;
  
  // Update or create title
  document.title = title;
  
  // Helper to set or create a meta tag
  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let tag = document.querySelector(`meta[${attr}="${name}"]`);
    
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    
    tag.setAttribute('content', content);
  };

  // Open Graph tags
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('og:url', url, true);
  setMeta('og:type', 'website', true);
  
  if (imageUrl) {
    setMeta('og:image', imageUrl, true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);
  }

  // Twitter Card tags
  setMeta('twitter:card', imageUrl ? 'summary_large_image' : 'summary');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  
  if (imageUrl) {
    setMeta('twitter:image', imageUrl);
  }

  // Discord-specific (uses og: tags, but let's be explicit)
  setMeta('og:site_name', 'Football Glossary', true);
}

/**
 * Generates a description for a formation page.
 */
export function getFormationDescription(name: string, category: string, description: string): string {
  const categoryLabel = category.replace('-', ' ').toLowerCase();
  return `${name} - A ${categoryLabel} formation. ${description.substring(0, 200)}${description.length > 200 ? '...' : ''}`;
}

/**
 * Generates a description for a coverage page.
 */
export function getCoverageDescription(name: string, description: string): string {
  return `${name} coverage scheme. ${description.substring(0, 200)}${description.length > 200 ? '...' : ''}`;
}

/**
 * Generates a description for a term page.
 */
export function getTermDescription(term: string, definition: string): string {
  return `${term}: ${definition.substring(0, 200)}${definition.length > 200 ? '...' : ''}`;
}