// Em background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveNote") {
        const { title, content, url } = request.data; // <-- ADICIONE 'url' AQUI

        chrome.storage.sync.get(['cardData'], (result) => {
            let cardData = result.cardData || [];

            const newCard = {
                id: Date.now(),
                type: 'small',
                title: title,
                content: content,
                timestamp: new Date().toLocaleString('pt-BR'),
                url: url // <-- ADICIONE ESTA LINHA para salvar a URL na nota
            };

            cardData.unshift(newCard);

            chrome.storage.sync.set({ 'cardData': cardData }, () => {
                console.log('Nota salva com sucesso pelo background.');
                sendResponse({ status: "success" });
            });
        });
        return true;
    }
});