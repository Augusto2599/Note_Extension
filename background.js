// Cria o item no menu de contexto (clique com o botão direito)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "saveSelectedTextAsNote",
        title: "Salvar texto como Nota",
        contexts: ["selection"] // Só aparece quando há texto selecionado
    });
});

// Ouve o clique no item do menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "saveSelectedTextAsNote") {
        const selectedText = info.selectionText;

        // Recupera os cards existentes, adiciona o novo e salva
        chrome.storage.sync.get(['cardData'], (result) => {
            let cardData = result.cardData || [];

            // Cria um novo card com o texto selecionado
            const newCard = {
                id: Date.now(), // ID único baseado no tempo atual
                type: 'small',
                title: selectedText.substring(0, 20) + '...', // Pega os primeiros 20 caracteres para o título
                content: selectedText, // O conteúdo completo é o texto selecionado
                timestamp: new Date().toLocaleString('pt-BR')
            };

            cardData.unshift(newCard); // Adiciona o novo card no início da lista

            // Salva a lista de cards atualizada
            chrome.storage.sync.set({ 'cardData': cardData }, () => {
                console.log('Nota salva com sucesso!');
                // Opcional: Enviar uma notificação para a aba ativa (mais complexo)
            });
        });
    }
});