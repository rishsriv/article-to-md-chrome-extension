// Wrap in IIFE to prevent duplicate declarations
(() => {
  // Check if already loaded
  if (window.__articleToMarkdownLoaded) {
    return;
  }
  window.__articleToMarkdownLoaded = true;

  // HTML to Markdown converter
  class HtmlToMarkdown {
    constructor() {
      this.rules = [
        {tag: 'h1', convert: (text) => `# ${text}\n\n`},
        {tag: 'h2', convert: (text) => `## ${text}\n\n`},
        {tag: 'h3', convert: (text) => `### ${text}\n\n`},
        {tag: 'h4', convert: (text) => `#### ${text}\n\n`},
        {tag: 'h5', convert: (text) => `##### ${text}\n\n`},
        {tag: 'h6', convert: (text) => `###### ${text}\n\n`},
        {tag: 'p', convert: (text) => `${text}\n\n`},
        {tag: 'strong', convert: (text) => `**${text}**`},
        {tag: 'b', convert: (text) => `**${text}**`},
        {tag: 'em', convert: (text) => `*${text}*`},
        {tag: 'i', convert: (text) => `*${text}*`},
        {tag: 'code', convert: (text) => `\`${text}\``},
        {tag: 'pre', convert: (text) => `\`\`\`\n${text}\n\`\`\`\n\n`},
        {tag: 'blockquote', convert: (text) => `> ${text.replace(/\n/g, '\n> ')}\n\n`},
        {tag: 'br', convert: () => '\n'},
        {tag: 'hr', convert: () => '---\n\n'}
      ];
    }
    
    convert(element) {
      if (element.nodeType === Node.TEXT_NODE) {
        return element.textContent.trim() ? element.textContent : '';
      }
      
      if (element.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }
      
      const tagName = element.tagName.toLowerCase();
      
      // Handle links
      if (tagName === 'a') {
        const text = this.getTextContent(element);
        const href = element.getAttribute('href');
        return href ? `[${text}](${href})` : text;
      }
      
      // Handle images
      if (tagName === 'img') {
        const alt = element.getAttribute('alt') || '';
        const src = element.getAttribute('src') || '';
        return `![${alt}](${src})\n\n`;
      }
      
      // Handle lists
      if (tagName === 'ul' || tagName === 'ol') {
        const items = Array.from(element.children)
          .filter(child => child.tagName.toLowerCase() === 'li')
          .map((li, index) => {
            const content = this.getTextContent(li);
            const prefix = tagName === 'ol' ? `${index + 1}. ` : '- ';
            return `${prefix}${content}`;
          })
          .join('\n');
        return items + '\n\n';
      }
      
      // Handle other elements
      const rule = this.rules.find(r => r.tag === tagName);
      const textContent = this.getTextContent(element);
      
      if (rule) {
        return rule.convert(textContent);
      }
      
      // Default: just return text content
      return textContent ? textContent + '\n\n' : '';
    }
    
    getTextContent(element) {
      let result = '';
      
      for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          result += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          result += this.convert(child);
        }
      }
      
      return result.trim();
    }
  }

  // Article extractor
  class ArticleExtractor {
    extractArticle() {
      // Try common article selectors
      const selectors = [
        'article',
        '[role="main"]',
        '.article',
        '.post',
        '.content',
        '.main-content',
        '.entry-content',
        '.post-content',
        'main',
        '#content',
        '#main'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && this.hasSignificantContent(element)) {
          return element;
        }
      }
      
      // Fallback: find the largest text block
      return this.findLargestTextBlock();
    }
    
    hasSignificantContent(element) {
      const text = element.textContent.trim();
      const paragraphs = element.querySelectorAll('p');
      return text.length > 200 && paragraphs.length > 1;
    }
    
    findLargestTextBlock() {
      const candidates = document.querySelectorAll('div, section, article');
      let bestElement = null;
      let maxScore = 0;
      
      candidates.forEach(element => {
        const score = this.scoreElement(element);
        if (score > maxScore) {
          maxScore = score;
          bestElement = element;
        }
      });
      
      return bestElement || document.body;
    }
    
    scoreElement(element) {
      const text = element.textContent.trim();
      const paragraphs = element.querySelectorAll('p');
      const links = element.querySelectorAll('a');
      
      let score = text.length;
      score += paragraphs.length * 50;
      score -= links.length * 10; // Penalize navigation-heavy sections
      
      // Bonus for semantic elements
      if (element.matches('article, .article, .post, .content')) {
        score += 200;
      }
      
      return score;
    }
  }

  // Message listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      if (request.action === 'convertArticle') {
        const converter = new HtmlToMarkdown();
        const extractor = new ArticleExtractor();
        
        const article = extractor.extractArticle();
        if (!article) {
          sendResponse({success: false, error: 'No article content found'});
          return;
        }
        
        const markdown = converter.convert(article);
        const title = document.title;
        const url = window.location.href;
        
        const fullMarkdown = `# ${title}\n\n*Source: [${url}](${url})*\n\n${markdown}`;
        
        sendResponse({
          success: true,
          markdown: fullMarkdown.trim()
        });
      }
    } catch (error) {
      sendResponse({success: false, error: error.message});
    }
  });
})();