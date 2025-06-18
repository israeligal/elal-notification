/**
 * Cleans HTML content by removing scripts, tracking elements, navigation, and other noise
 * while preserving the main content structure.
 */
export function cleanHtml(html: string): string {
  const cleaned = html
    // Remove script, style, meta, link, and title tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<title\b[^<]*(?:(?!<\/title>)<[^<]*)*<\/title>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<base\b[^>]*>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove entire structural sections (navigation, header, footer)
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    // Remove Angular component wrappers
    .replace(/<app-[^>]*>/gi, '')
    .replace(/<\/app-[^>]*>/gi, '')
    // Remove form elements and interactive controls
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
    .replace(/<input\b[^>]*>/gi, '')
    .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
    // Remove common tracking/analytics elements
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    // Remove tracking pixels and small images
    .replace(/<img[^>]*width="1"[^>]*>/gi, '')
    .replace(/<img[^>]*height="1"[^>]*>/gi, '')
    // Remove breadcrumb navigation
    .replace(/<[^>]*bread[^>]*>.*?<\/[^>]*>/gi, '')
    // Remove social media sections
    .replace(/<[^>]*social[^>]*>.*?<\/[^>]*>/gi, '')
    // Remove CSS classes and IDs to reduce noise
    .replace(/\s(class|id)="[^"]*"/gi, '')
    // Remove inline styles
    .replace(/\sstyle="[^"]*"/gi, '')
    // Remove data attributes (with or without values)
    .replace(/\sdata-[^=>\s]+(?:="[^"]*")?/gi, '')
    // Remove angular attributes (with or without values)
    .replace(/\s_ng\S+/gi, '')
    .replace(/\sng-\S+/gi, '')
    // Remove accessibility-specific attributes
    .replace(/\su1st-[^=>\s]+(?:="[^"]*")?/gi, '')
    .replace(/\saria-[^=]*="[^"]*"/gi, '')
    .replace(/\srole="[^"]*"/gi, '')
    .replace(/\stabindex="[^"]*"/gi, '')
    .replace(/\saccesskey="[^"]*"/gi, '')
    // Remove event handlers
    .replace(/\son[a-z]+="[^"]*"/gi, '')
    // Remove security and loading attributes
    .replace(/\scrossorigin="[^"]*"/gi, '')
    .replace(/\sintegrity="[^"]*"/gi, '')
    .replace(/\sasync="[^"]*"/gi, '')
    .replace(/\sasync\b/gi, '')
    .replace(/\scharset="[^"]*"/gi, '')
    .replace(/\stype="[^"]*"/gi, '')
    .replace(/\sloading="[^"]*"/gi, '')
    .replace(/\srel="[^"]*"/gi, '')
    // Remove common framework attributes
    .replace(/\sdirection="[^"]*"/gi, '')
    .replace(/\slang="[^"]*"/gi, '')
    .replace(/\sdir="[^"]*"/gi, '')
    .replace(/\starget="[^"]*"/gi, '')
    // Remove Angular Material and other framework attributes
    .replace(/\smat[^=>\s]+(?:="[^"]*")?/gi, '')
    .replace(/\sformcontrolname="[^"]*"/gi, '')
    .replace(/\snovalidate="[^"]*"/gi, '')
    .replace(/\sappearance="[^"]*"/gi, '')
    .replace(/\srequired="[^"]*"/gi, '')
    .replace(/\sframeborder="[^"]*"/gi, '')
    .replace(/\sscrolling="[^"]*"/gi, '')
    // Remove cookie/privacy elements (very safe - never content)
    .replace(/<[^>]*cookie[^>]*>.*?<\/[^>]*>/gi, '')
    .replace(/<[^>]*privacy[^>]*>.*?<\/[^>]*>/gi, '')
    .replace(/<[^>]*consent[^>]*>.*?<\/[^>]*>/gi, '')
    // Remove specific cookie consent text patterns
    .replace(/<h2[^>]*>Privacy Preference Center<\/h2>/gi, '')
    .replace(/<h3[^>]*>\s*Manage Consent Preferences\s*<\/h3>/gi, '')
    .replace(/<h4[^>]*>(Performance|Social Media|Strictly Necessary|Functional|Targeting)\s*Cookies<\/h4>/gi, '')
    .replace(/<span[^>]*>(Performance|Social Media|Strictly Necessary|Functional|Targeting)\s*Cookies<\/span>/gi, '')
    .replace(/<h3[^>]*>Cookie List<\/h3>/gi, '')
    // Remove long cookie/privacy related paragraphs (require 3+ key terms)
    .replace(/<p[^>]*>.*?cookies.*?browser.*?website.*?<\/p>/gi, '')
    .replace(/<p[^>]*>.*?cookies.*?tracking.*?site.*?<\/p>/gi, '')
    .replace(/<p[^>]*>.*?tracking.*?website.*?experience.*?<\/p>/gi, '')
    .replace(/<p[^>]*>.*?privacy.*?information.*?browser.*?<\/p>/gi, '')
    .replace(/<p[^>]*>.*?cookies.*?preferences.*?device.*?<\/p>/gi, '')
    .replace(/<div[^>]*>.*?cookies and other tracking tools.*?<\/div>/gi, '')
    .replace(/<div[^>]*>.*?Privacy Preference Center.*?<\/div>/gi, '')
    // Remove specific cookie consent text block
    .replace(/<div[^>]*>When you visit any website.*?services we are able to offer\.\s*<br[^>]*><\/div>/gi, '')
    .replace(/<div[^>]*>.*?When you visit any website.*?services we are able to offer.*?<\/div>/gi, '')
    // Remove country navigation links (multiple href attributes in single div)
    .replace(/<div[^>]*>(?:\s*<a\s+href="\/[^"]*"[^>]*><\/a>\s*){10,}<\/div>/gi, '')
    // Remove divs with multiple country-style href links
    .replace(/<div[^>]*href="\/[^"]*"[^>]*>(?:[^<]*<a[^>]*href="\/[^"]*"[^>]*><\/a>[^<]*){5,}<\/div>/gi, '')
    // Remove OneTrust cookie consent elements
    .replace(/<label[^>]*for="ot-group-id[^"]*"[^>]*>.*?<\/label>/gi, '')
    .replace(/<div[^>]*>Always Active<\/div>/gi, '')
    .replace(/<span[^>]*>Consent<\/span>/gi, '')
    .replace(/<span[^>]*>Leg\.Interest<\/span>/gi, '')
    .replace(/<label[^>]*for="select-all-[^"]*"[^>]*>.*?<\/label>/gi, '')
    .replace(/<label[^>]*for="chkbox-id"[^>]*>.*?<\/label>/gi, '')
    .replace(/<span[^>]*>checkbox label<\/span>/gi, '')
    .replace(/<span[^>]*>label<\/span>/gi, '')
    // Remove entire sections containing cookie consent patterns
    .replace(/<section[^>]*>.*?ot-group-id.*?<\/section>/gi, '')
    .replace(/<section[^>]*>.*?Consent.*?Leg\.Interest.*?<\/section>/gi, '')
    .replace(/<div[^>]*>.*?When you visit any website.*?services we are able to offer.*?<\/div>/gi, '')
    // Remove accessibility menu elements
    .replace(/<a[^>]*title="[^"]*accessibility[^"]*"[^>]*>.*?<\/a>/gi, '')
    .replace(/<div[^>]*>.*?Click for accessibility menu.*?<\/div>/gi, '')
    // Remove empty elements (safe - no content loss)
    .replace(/<(div|span|section)[^>]*>\s*<\/\1>/gi, '')
    // Clean up whitespace (safe formatting)
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+|\s+$/gm, '')

  return cleaned;
} 