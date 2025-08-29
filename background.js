// Cria o item no menu de contexto
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "saveSelectedTextAsNote",
        title: "Salvar texto como Nota",
        contexts: ["selection"]
    });
});

// Ouve o clique no item do menu e envia o texto para ser salvo
chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "saveSelectedTextAsNote" && info.selectionText) {
        // Salva o texto selecionado temporariamente no storage local
        chrome.storage.local.set({ 'newNoteFromSelection': info.selectionText });
    }
});