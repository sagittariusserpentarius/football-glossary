import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  updateMetaTags, 
  captureElementScreenshot,
  getFormationDescription,
  getCoverageDescription,
  getTermDescription,
  type PageMetadata
} from '../lib/embedUtils';
import { formations } from '../data/formations';
import { coverages } from '../data/coverages';
import { glossaryTerms } from '../data/terms';

/**
 * Manages Open Graph meta tags and screenshot generation for embeds.
 * Placed at the top level of the app to respond to route changes.
 */
export default function EmbedManager() {
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    // Parse the current route
    const path = location.pathname;
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '');
    
    let metadata: PageMetadata | null = null;
    let captureElementId: string | null = null;
    let excludeSelectors: string[] = [];

    if (path === '/') {
      // Home page
      metadata = {
        title: 'Football Glossary',
        description: 'A comprehensive glossary of football formations, coverages, and terminology.',
        url: baseUrl,
      };
    } else if (path.startsWith('/formation/')) {
      const id = path.replace('/formation/', '');
      const formation = formations.find(f => f.id === id);
      
      if (formation) {
        metadata = {
          title: `${formation.name} - Football Glossary`,
          description: getFormationDescription(formation.name, formation.category, formation.description),
          url: baseUrl + location.search,
        };
        
        // Capture the field view, excluding the description text and share button
        captureElementId = 'field-container';
        excludeSelectors = ['.field-description', '.share-button-container'];
      }
    } else if (path.startsWith('/coverage/')) {
      const id = path.replace('/coverage/', '');
      const coverage = coverages.find(c => c.id === id);
      
      if (coverage) {
        metadata = {
          title: `${coverage.name} - Football Glossary`,
          description: getCoverageDescription(coverage.name, coverage.description),
          url: baseUrl,
        };
        
        // Capture the coverage view field, excluding description
        captureElementId = 'coverage-container';
        excludeSelectors = ['.coverage-description', '.share-button-container'];
      }
    } else if (path.startsWith('/term/')) {
      const id = path.replace('/term/', '');
      const term = glossaryTerms.find(t => t.id === id);
      
      if (term) {
        metadata = {
          title: `${term.term} - Football Glossary`,
          description: getTermDescription(term.term, term.definition),
          url: baseUrl,
        };
        
        // Terms don't need screenshots (accessibility concern with text in images)
        // but we still update meta tags
      }
    }

    if (!metadata) {
      metadata = {
        title: 'Football Glossary',
        description: 'A comprehensive glossary of football formations, coverages, and terminology.',
        url: window.location.href,
      };
    }

    // Update meta tags immediately
    updateMetaTags(metadata);

    // Capture screenshot if needed (for formations and coverages)
    if (captureElementId && !selectedImage) {
      setIsCapturing(true);
      captureElementScreenshot(captureElementId, excludeSelectors)
        .then(imageUrl => {
          setSelectedImage(imageUrl);
          // Update meta tags with the image
          updateMetaTags({ ...metadata!, imageUrl });
        })
        .catch(error => {
          console.error('Failed to capture screenshot:', error);
        })
        .finally(() => {
          setIsCapturing(false);
        });
    }

    // Reset selected image when route changes
    return () => {
      setSelectedImage(null);
    };
  }, [location.pathname, location.search]);

  // This component doesn't render anything visible
  return null;
}