// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'copy-to-clipboard') {
    handleClipboardWrite(message.text)
      .then(() => {
        sendResponse({success: true});
      })
      .catch((error) => {
        sendResponse({success: false, error: error.message});
      });
    return true; // Keep message channel open for async response
  }
});

async function handleClipboardWrite(text) {
  // Focus the offscreen document
  window.focus();
  
  // Try using the Clipboard API with a fallback
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback: Create a textarea and use document.execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      const result = document.execCommand('copy');
      if (!result) {
        throw new Error('execCommand copy failed');
      }
    } finally {
      document.body.removeChild(textarea);
    }
  }
}