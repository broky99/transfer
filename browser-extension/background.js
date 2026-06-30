const KIS_BRIDGE_URL = 'https://broky99.github.io/transfer/';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'send-to-kis-bridge',
    title: 'An KIS Bridge senden',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== 'send-to-kis-bridge') return;

  const selectedText = info.selectionText || '';
  if (!selectedText.trim()) return;

  const targetUrl = `${KIS_BRIDGE_URL}#send=${encodeURIComponent(selectedText)}&cat=Sonstiges`;
  chrome.tabs.create({ url: targetUrl });
});
