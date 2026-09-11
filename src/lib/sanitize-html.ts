import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
    'p', 'h1', 'h2', 'h3', 'strong', 'em', 'u', 's', 'mark', 'a', 'img',
    'ul', 'ol', 'li', 'blockquote', 'hr', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'br', 'span',
];
const ALLOWED_ATTR = ['style', 'href', 'src', 'alt', 'colspan', 'rowspan'];

/**
 * Sanitizes HTML produced by the writing notebook editor before it is rendered
 * read-only outside of Tiptap (e.g. in the teacher dashboard), since the stored
 * content could in principle be edited directly in Firestore.
 */
export function sanitizeWritingHtml(html: string): string {
    if (typeof window === 'undefined') return '';
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
