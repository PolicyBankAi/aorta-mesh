/**
 * HTML Post-processor to remove Replit banner scripts
 */

export function stripReplitScripts(html: string): string {
  if (process.env.NODE_ENV !== 'development' || !(global as any).__STRIP_REPLIT_SCRIPTS__) {
    return html;
  }
  
  // Remove any script tags containing Replit/cartographer content with more aggressive patterns
  let cleanHtml = html
    // Remove inline scripts with Replit content - more aggressive
    .replace(/<script[^>]*type="module"[^>]*>[\s\S]*?HIGHLIGHT_COLOR[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?HIGHLIGHT_COLOR[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?0\.2\.8[\s\S]*?<\/script>/gi, '') // version number from cartographer
    .replace(/<script[^>]*>[\s\S]*?replit\.dev[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?replit[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?cartographer[\s\S]*?<\/script>/gi, '')
    // Remove script tags with Replit sources
    .replace(/<script[^>]*src[^>]*replit[^>]*><\/script>/gi, '')
    .replace(/<script[^>]*src[^>]*cartographer[^>]*><\/script>/gi, '')
    // Remove any data-replit attributes
    .replace(/\s+data-replit[^=]*="[^"]*"/gi, '')
    .replace(/\s+data-replit[^=]*='[^']*'/gi, '')
    // Remove Replit metadata
    .replace(/<!--[\s\S]*?replit[\s\S]*?-->/gi, '');
  
  console.log('HTML processed: Stripped Replit scripts and metadata with aggressive patterns');
  return cleanHtml;
}