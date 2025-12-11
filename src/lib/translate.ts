// Translation service using MyMemory API (FREE - no API key required!)
// MyMemory provides 5000 chars/day free, 10000 with email registration

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';
const MAX_CHUNK_SIZE = 450; // MyMemory has ~500 char limit per request, use 450 to be safe

interface TranslationCache {
  [key: string]: {
    text: string;
    timestamp: number;
  };
}

// In-memory cache for translations (persists during server runtime)
const translationCache: TranslationCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Split text into chunks at sentence boundaries
function splitIntoChunks(text: string, maxSize: number): string[] {
  if (text.length <= maxSize) return [text];
  
  const chunks: string[] = [];
  const paragraphs = text.split('\n');
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If single paragraph is too long, split by sentences
    if (paragraph.length > maxSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // Split by Arabic/English sentence endings
      const sentences = paragraph.split(/(?<=[.!?،؟])\s+/);
      for (const sentence of sentences) {
        if ((currentChunk + ' ' + sentence).length > maxSize) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
        }
      }
    } else if ((currentChunk + '\n' + paragraph).length > maxSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n' + paragraph : paragraph;
    }
  }
  
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}

async function translateChunk(
  text: string,
  source: string,
  targetLang: string
): Promise<string> {
  const langPair = `${source}|${targetLang}`;
  const url = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${langPair}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
    console.warn('Translation chunk failed:', data.responseStatus);
    return text;
  }

  return data.responseData.translatedText;
}

export async function translateText(
  text: string,
  targetLang: 'en' | 'ar',
  sourceLang?: 'en' | 'ar'
): Promise<string> {
  if (!text || text.trim() === '') return text;

  // Detect source language if not provided
  const source = sourceLang || ((/[\u0600-\u06FF]/.test(text)) ? 'ar' : 'en');
  
  // If source and target are the same, return original
  if (source === targetLang) return text;

  // Create cache key (use hash for long text)
  const cacheKey = `${source}_${targetLang}_${text.length}_${text.substring(0, 50)}`;
  
  // Check cache
  const cached = translationCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.text;
  }

  try {
    // Split long text into chunks
    const chunks = splitIntoChunks(text, MAX_CHUNK_SIZE);
    
    // Translate chunks sequentially to avoid rate limiting
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      const translated = await translateChunk(chunk, source, targetLang);
      translatedChunks.push(translated);
      
      // Small delay between chunks to avoid rate limiting
      if (chunks.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const translatedText = translatedChunks.join('\n');

    // Cache the result
    translationCache[cacheKey] = {
      text: translatedText,
      timestamp: Date.now(),
    };

    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original on error
  }
}

export async function translateBlogPost(
  post: {
    title: string;
    excerpt: string;
    content: string;
  },
  targetLang: 'en' | 'ar'
): Promise<{
  title: string;
  excerpt: string;
  content: string;
}> {
  // Detect source language (if content has Arabic characters, source is Arabic)
  const hasArabic = /[\u0600-\u06FF]/.test(post.title);
  const sourceLang = hasArabic ? 'ar' : 'en';
  
  // If target is same as source, return original
  if (targetLang === sourceLang) {
    return post;
  }

  // Translate sequentially to avoid rate limits
  const title = await translateText(post.title, targetLang, sourceLang);
  const excerpt = await translateText(post.excerpt, targetLang, sourceLang);
  const content = await translateText(post.content, targetLang, sourceLang);

  return { title, excerpt, content };
}
