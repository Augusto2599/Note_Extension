// Ouve a mensagem do content script para salvar a nota
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveNote") {
        const { title, content } = request.data;

        chrome.storage.sync.get(['cardData'], (result) => {
            let cardData = result.cardData || [];

            const newCard = {
                id: Date.now(),
                type: 'small',
                title: title,
                content: content,
                timestamp: new Date().toLocaleString('pt-BR')
            };

            cardData.unshift(newCard);

            chrome.storage.sync.set({ 'cardData': cardData }, () => {
                console.log('Nota salva com sucesso pelo background.');
                sendResponse({ status: "success" });
            });
        });
        return true; // Necessário para respostas assíncronas
    }
});