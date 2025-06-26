// Background service worker
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // First, try to inject the content script if it's not already injected
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (injectionError) {
      // Content script might already be injected, continue
    }
    
    // Small delay to ensure content script is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Send message to content script to convert article
    const result = await chrome.tabs.sendMessage(tab.id, {
      action: 'convertArticle'
    });
    
    if (result.success) {
      // Copy to clipboard using offscreen document
      await copyToClipboard(result.markdown);
      
      // Show badge text as visual feedback
      chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
      
      // Clear badge after 3 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '', tabId: tab.id });
      }, 3000);
    } else {
      // Show error badge
      chrome.action.setBadgeText({ text: '!', tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#F44336' });
      
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '', tabId: tab.id });
      }, 3000);
    }
  } catch (error) {
    // Show error badge
    chrome.action.setBadgeText({ text: '!', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#F44336' });
    
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '', tabId: tab.id });
    }, 3000);
  }
});

// Function to copy text to clipboard
async function copyToClipboard(text) {
  try {
    // Check if offscreen document already exists
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [chrome.runtime.getURL('offscreen.html')]
    });
    
    // Create offscreen document if it doesn't exist
    if (!existingContexts.length) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: [chrome.offscreen.Reason.CLIPBOARD],
        justification: 'Copy article markdown to clipboard'
      });
    }
    
    // Send message to offscreen document to copy text
    const response = await chrome.runtime.sendMessage({
      type: 'copy-to-clipboard',
      text: text
    });
    
    if (!response || !response.success) {
      throw new Error('Failed to copy to clipboard');
    }
    
  } catch (error) {
    throw error;
  }
}