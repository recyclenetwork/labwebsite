/**
 * Zero-dependency HTML sanitizer for scientific articles & CMS content.
 * Runs safely in both Node.js (SSR/SSG) and browser environments.
 */

const ALLOWED_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "mark", "sub", "sup", "small",
  "blockquote", "pre", "code",
  "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "a", "img", "span", "div"
]);

const ALLOWED_ATTRS = new Set([
  "href", "title", "target", "rel",
  "src", "alt", "width", "height", "class"
]);

/**
 * Strips dangerous tags (scripts, iframes, on* handlers, javascript: URIs)
 * while preserving valid formatting and links for scientific news & articles.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";

  // 1. Remove dangerous blocks and their entire contents
  let clean = dirty.replace(/<(script|style|iframe|object|embed|applet|form)[\s\S]*?<\/\1>/gi, "");
  clean = clean.replace(/<(script|style|iframe|object|embed|applet|form)[^>]*>/gi, "");

  // 2. Filter allowed tags and strip unauthorized attributes
  clean = clean.replace(/<\/?([a-zA-Z0-9_-]+)([^>]*)>/gi, (match, tagName, attrsStr) => {
    const lowerTag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(lowerTag)) {
      return "";
    }

    const isClosing = match.startsWith("</");
    if (isClosing) {
      return `</${lowerTag}>`;
    }

    // Parse attributes
    const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s>]+)))?/gi;
    let safeAttrs = "";
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

      // Disallow all event handlers (onclick, onerror, onload, onmouseover, etc.)
      if (attrName.startsWith("on")) continue;

      if (ALLOWED_ATTRS.has(attrName)) {
        // Prevent javascript: / vbscript: / malicious data: links
        if (attrName === "href" || attrName === "src") {
          const trimmedVal = attrValue.trim().toLowerCase();
          if (
            trimmedVal.startsWith("javascript:") ||
            trimmedVal.startsWith("vbscript:") ||
            (trimmedVal.startsWith("data:") && !trimmedVal.startsWith("data:image/"))
          ) {
            continue;
          }
        }

        // Auto-enforce rel="noopener noreferrer" for external targets
        if (attrName === "target" && attrValue === "_blank") {
          safeAttrs += ` target="_blank" rel="noopener noreferrer"`;
          continue;
        }

        const escapedVal = attrValue
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        safeAttrs += ` ${attrName}="${escapedVal}"`;
      }
    }

    const isSelfClosing = match.endsWith("/>") ? " />" : ">";
    return `<${lowerTag}${safeAttrs}${isSelfClosing}`;
  });

  return clean;
}
