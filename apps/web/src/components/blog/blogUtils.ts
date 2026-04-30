export const BLOG_IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="100%" height="100%" fill="#dbeafe"/>
    <circle cx="1000" cy="150" r="200" fill="rgba(37,99,235,0.14)"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#1e3a8a" font-family="Arial, Helvetica, sans-serif" font-size="42">EduCourse Blog</text>
  </svg>`
)}`;

export function safeBlogImage(src?: string | null) {
  return src && src.trim().length > 0 ? src : BLOG_IMAGE_FALLBACK;
}

export function sanitizeBlogHtml(input: string) {
  return input
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*style[\s\S]*?<\s*\/\s*style\s*>/gi, "")
    .replace(/<\s*iframe[\s\S]*?<\s*\/\s*iframe\s*>/gi, "")
    .replace(/<\s*object[\s\S]*?<\s*\/\s*object\s*>/gi, "")
    .replace(/<\s*embed[\s\S]*?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\sstyle\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, " $1=\"#\"")
    .replace(/\s(href|src)\s*=\s*javascript:[^\s>]+/gi, " $1=\"#\"");
}
