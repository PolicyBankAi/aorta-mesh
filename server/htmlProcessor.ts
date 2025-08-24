/**
 * HTML Post-processor to strip Replit/Cartographer scripts
 * Ensures no Replit banners or telemetry scripts leak into production builds.
 */

export function stripReplitScripts(html: string): string {
  const shouldStrip =
    process.env.NODE_ENV === "production" ||
    (global as any).__STRIP_REPLIT_SCRIPTS__;

  if (!shouldStrip) {
    return html;
  }

  let cleanHtml = html
    // Remove inline scripts containing suspicious Replit/cartographer markers
    .replace(
      /<script[^>]*>[\s\S]*?(HIGHLIGHT_COLOR|cartographer|replit\.dev|replit)[\s\S]*?<\/script>/gi,
      ""
    )
    .replace(
      /<script[^>]*type="module"[^>]*>[\s\S]*?(HIGHLIGHT_COLOR|cartographer|replit)[\s\S]*?<\/script>/gi,
      ""
    )
    // Remove external scripts pointing to Replit/cartographer
    .replace(/<script[^>]*src=["'][^"']*(replit|cartographer)[^"']*["'][^>]*><\/script>/gi, "")
    // Remove data-replit attributes
    .replace(/\s+data-replit[^=]*=(["']).*?\1/gi, "")
    // Remove HTML comments mentioning replit
    .replace(/<!--[\s\S]*?replit[\s\S]*?-->/gi, "");

  if (process.env.NODE_ENV !== "test") {
    console.log("✅ stripReplitScripts: Removed Replit/cartographer injections");
  }

  return cleanHtml;
}
