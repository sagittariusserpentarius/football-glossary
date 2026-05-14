import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  updateMetaTags,
  getFormationDescription,
  getCoverageDescription,
  getTermDescription,
  type PageMetadata
} from '../lib/embedUtils';
import { formations } from '../data/formations';
import { coverages } from '../data/coverages';
import { glossaryTerms } from '../data/terms';

// Cache for manifest data
let manifestCache: { 
  formations: Record<string, string | null>; 
  coverages: Record<string, string | null>; 
} | null = null;

async function loadManifest() {
  if (manifestCache) return manifestCache;
  
  try {
    const response = await fetch('/embed-images/manifest.json');
    if (!response.ok) {
      console.warn('Could not load embed images manifest');
      return null;
    }
    const data = await response.json();
    manifestCache = {
      formations: data.formations || {},
      coverages: data.coverages || {},
    };
    return manifestCache;
  } catch (error) {
    console.warn('Error loading embed images manifest:', error);
    return null;
  }
}

function getImageUrl(manifest: NonNullable<typeof manifestCache>, type: 'formation' | 'coverage', id: string): string | undefined {
  const imageFilename = type === 'formation' 
    ? manifest.formations[id] 
    : manifest.coverages[id];
  
  if (imageFilename) {
    return `/embed-images/${imageFilename}`;
  }
  return undefined;
}

/**
 * Manages Open Graph meta tags for embeds.
 * Uses pre-generated images from the /embed-images directory.
 */
export default function EmbedManager() {
  const location = useLocation();

  useEffect(() => {
    const updateTags = async () => {
      const path = location.pathname;
      const baseUrl = window.location.origin;
      const fullUrl = baseUrl + location.pathname + location.search;
      
      let metadata: PageMetadata | null = null;

      if (path === '/') {
        metadata = {
          title: 'Football Glossary',
          description: 'A comprehensive glossary of football formations, coverages, and terminology.',
          url: fullUrl,
        };
      } else if (path.startsWith('/formation/')) {
        const id = path.replace('/formation/', '');
        const formation = formations.find(f => f.id === id);
        
        if (formation) {
          metadata = {
            title: `${formation.name} - Football Glossary`,
            description: getFormationDescription(formation.name, formation.category, formation.description),
            url: fullUrl,
          };
          
          // Try to load pre-generated image
          const manifest = await loadManifest();
          if (manifest) {
            const imageUrl = getImageUrl(manifest, 'formation', formation.id);
            if (imageUrl) {
              metadata.imageUrl = imageUrl;
            }
          }
        }
      } else if (path.startsWith('/coverage/')) {
        const id = path.replace('/coverage/', '');
        const coverage = coverages.find(c => c.id === id);
        
        if (coverage) {
          metadata = {
            title: `${coverage.name} - Football Glossary`,
            description: getCoverageDescription(coverage.name, coverage.description),
            url: fullUrl,
          };
          
          // Try to load pre-generated image
          const manifest = await loadManifest();
          if (manifest) {
            const imageUrl = getImageUrl(manifest, 'coverage', coverage.id);
            if (imageUrl) {
              metadata.imageUrl = imageUrl;
            }
          }
        }
      } else if (path.startsWith('/term/')) {
        const id = path.replace('/term/', '');
        const term = glossaryTerms.find(t => t.id === id);
        
        if (term) {
          metadata = {
            title: `${term.term} - Football Glossary`,
            description: getTermDescription(term.term, term.definition),
            url: fullUrl,
            // No image for terms (accessibility)
          };
        }
      }

      if (!metadata) {
        metadata = {
          title: 'Football Glossary',
          description: 'A comprehensive glossary of football formations, coverages, and terminology.',
          url: fullUrl,
        };
      }

      // Update meta tags
      updateMetaTags(metadata);
    };

    updateTags();
  }, [location.pathname, location.search]);

  return null;
}