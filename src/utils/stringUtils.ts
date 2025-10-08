// Utility helpers for decoding and normalizing category strings

export function decodeHtmlEntities(html: string): string {
    if (html == null) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Normalize category labels for robust matching across sources
// - Decode HTML entities (e.g., &amp; -> &)
// - Unify spacing around ampersands and colons
// - Collapse whitespace, trim, lowercase
export function normalizeCategoryLabel(s: string): string {
    return decodeHtmlEntities(s || '')
        .replace(/\s*&\s*/g, '&')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

// Generate alternative keys for a category label:
// - Full normalized name
// - Child segment after the first colon (if present)
export function categoryNameKeys(label: string): string[] {
    const full = normalizeCategoryLabel(label);
    const keys = new Set<string>([full]);
    const parts = full.split(':');
    if (parts.length > 1) {
        const child = parts.slice(1).join(':').trim();
        if (child) keys.add(child);
    }
    return Array.from(keys);
}

