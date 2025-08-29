document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const userAvatar = document.getElementById('user-avatar');
    const avatarModal = document.getElementById('avatar-modal');
    const closeModal = document.getElementById('close-modal');
    const saveAvatarBtn = document.getElementById('save-avatar');
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const searchInput = document.getElementById('search-input');
    const cardsContainer = document.getElementById('cards-container');

    // --- ESTADO DA APLICAÇÃO ---
    let cardData = [
        { id: 1, type: 'small', title: 'Título do Card', content: 'Este é o texto do card, posicionado abaixo do título e alinhado à esquerda. Pode conter informações relevantes sobre o conteúdo do card.', timestamp: '27/08/2023 às 14:30' },
        { id: 2, type: 'small', title: 'Ideias Projeto', content: 'Sistema de gestão de tarefas com interface moderna e intuitiva para melhor produtividade.', timestamp: '12/08/2023 às 09:15' },
        { id: 3, type: 'small', title: 'Lista Compras', content: 'Leite, ovos, pão integral, frutas, vegetais e outros itens essenciais para a semana.', timestamp: '10/08/2023 às 16:45' },
        { id: 4, type: 'small', title: 'Reunião Equipe', content: 'Preparar agenda para reunião de equipe sobre os próximos passos do projeto principal.', timestamp: '15/08/2023 às 11:30' },
        { id: 5, type: 'small', title: 'Estudos', content: 'Revisar materiais de TailwindCSS e JavaScript para aprofundar conhecimentos técnicos.', timestamp: '20/08/2023 às 14:20' },
    ];
    let likedCardIds = [];
    let currentUserAvatar = {
        customImage: 'Assets/Gemini_Generated_Image_boy_one.png'
    };

    let sessionUploadedAvatarURL = null;

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function createCardElement(card) {
        const isLiked = likedCardIds.includes(card.id);
        const cardElement = document.createElement('div');
        cardElement.className = `group card-item bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-indigo-100 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden`;
        cardElement.dataset.cardId = card.id;
        cardElement.dataset.type = card.type;
        const heartIconClass = isLiked ? 'fas text-red-500' : 'far';
        cardElement.innerHTML = `
        <div class="flex justify-between items-start p-4">
            <div class="flex-1">
                <h3 class="font-semibold text-gray-800 mb-2">${card.title}</h3>
                <p class="text-gray-600 text-sm">${card.content}</p>
            </div>
            <div class="card-user-icon ml-4 flex-shrink-0"><div class="w-12 h-12 text-lg rounded-full flex items-center justify-center text-white font-semibold border-2 border-white shadow-lg"></div></div>
        </div>
        <div class="card-footer bg-white bg-opacity-80 px-4 py-3 flex justify-between items-center">
            <div class="text-xs text-gray-500"><i class="far fa-clock mr-1"></i> ${card.timestamp}</div>
            <div class="flex space-x-3 text-gray-500">
                <button class="like-btn hover:text-red-500" title="Curtir"><i class="fa-heart ${heartIconClass}"></i></button>
                <button class="share-btn hover:text-blue-500" title="Compartilhar"><i class="fas fa-share-alt"></i></button>
                <button class="delete-btn hover:text-red-500" title="Excluir"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>`;
        const paragraph = cardElement.querySelector('p');
        const footer = cardElement.querySelector('.card-footer');
        if (paragraph) paragraph.style.display = 'none';
        if (footer) footer.style.display = 'none';
        cardElement.addEventListener('mouseenter', () => {
            if (paragraph) paragraph.style.display = 'block';
            if (footer) footer.style.display = 'flex';
        });
        cardElement.addEventListener('mouseleave', () => {
            if (paragraph) paragraph.style.display = 'none';
            if (footer) footer.style.display = 'none';
        });
        updateCardAvatar(cardElement);
        return cardElement;
    }

    function renderCards() {
        cardsContainer.innerHTML = '';
        const sortedCards = [...cardData].sort((a, b) => likedCardIds.includes(b.id) - likedCardIds.includes(a.id));
        sortedCards.forEach(card => {
            const cardElement = createCardElement(card);
            cardsContainer.appendChild(cardElement);
        });
    }

    // --- NOVA FUNÇÃO PARA NOTIFICAÇÕES DISCRETAS ---
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        const toastMessage = document.getElementById('toast-message');

        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');

        // Esconde a notificação após 3 segundos
        setTimeout(() => {
            toast.classList.remove('opacity-100');
            toast.classList.add('opacity-0');
        }, 3000);
    }

    // --- LÓGICA DO AVATAR ---
    function openAvatarModal() { avatarModal.style.display = 'flex'; }
    function closeAvatarModal() { avatarModal.style.display = 'none'; }

    function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (sessionUploadedAvatarURL) {
            URL.revokeObjectURL(sessionUploadedAvatarURL);
        }
        sessionUploadedAvatarURL = URL.createObjectURL(file);
        document.querySelectorAll('.avatar-option.selected').forEach(el => el.classList.remove('selected'));
    }

    function saveAvatar() {
        const selectedOption = document.querySelector('.avatar-option.selected');

        if (selectedOption) {
            // Salva um avatar da lista
            const avatarSrc = selectedOption.getAttribute('src');
            // Usa chrome.storage.local para o avatar
            chrome.storage.local.set({ 'customAvatar': avatarSrc }, () => {
                currentUserAvatar.customImage = avatarSrc;
                sessionUploadedAvatarURL = null;
                updateAllAvatars();
                closeAvatarModal();
                showToast('Avatar atualizado com sucesso!');
            });
        } else if (sessionUploadedAvatarURL) {
            // Salva a imagem que foi feito upload
            fetch(sessionUploadedAvatarURL)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const base64Image = e.target.result;
                        // Usa chrome.storage.local para o avatar
                        chrome.storage.local.set({ 'customAvatar': base64Image }, () => {
                            currentUserAvatar.customImage = base64Image;
                            sessionUploadedAvatarURL = null;
                            updateAllAvatars();
                            closeAvatarModal();
                            showToast('Avatar atualizado com sucesso!');
                        });
                    };
                    reader.readAsDataURL(blob);
                });
        } else {
            closeAvatarModal();
        }
    }

    function updateAllAvatars() {
        const imageSource = sessionUploadedAvatarURL || currentUserAvatar.customImage;
        const allUserIcons = document.querySelectorAll('.card-user-icon > div, #user-avatar');
        allUserIcons.forEach(icon => {
            icon.innerHTML = '';
            icon.textContent = '';
            icon.style.backgroundImage = `url(${imageSource})`;
            icon.style.backgroundSize = 'cover';
            icon.style.backgroundPosition = 'center';
        });
        if (!userAvatar.querySelector('.fa-camera')) {
            const cameraIconContainer = document.createElement('div');
            cameraIconContainer.className = 'absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center';
            cameraIconContainer.innerHTML = '<i class="fas fa-camera text-xs"></i>';
            userAvatar.appendChild(cameraIconContainer);
        }
    }

    function updateCardAvatar(cardElement) {
        const imageSource = sessionUploadedAvatarURL || currentUserAvatar.customImage;
        const avatarDiv = cardElement.querySelector('.card-user-icon > div');
        avatarDiv.innerHTML = '';
        avatarDiv.style.backgroundImage = `url(${imageSource})`;
        avatarDiv.style.backgroundSize = 'cover';
        avatarDiv.style.backgroundPosition = 'center';
    }

    // --- LÓGICAS DOS CARDS ---
    function setupCardActions() {
        cardsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            const cardElement = e.target.closest('.card-item');
            if (!cardElement) return;
            const cardId = parseInt(cardElement.dataset.cardId);
            if (button) {
                if (button.classList.contains('like-btn')) {
                    toggleLike(cardId, button.querySelector('.fa-heart'));
                } else if (button.classList.contains('share-btn')) {
                    shareCard(cardId);
                } else if (button.classList.contains('delete-btn')) {
                    if (confirm('Tem certeza que deseja excluir este card?')) {
                        deleteCard(cardId, cardElement);
                    }
                }
            }
        });
    }

    function toggleLike(cardId) {
        const cardIndex = likedCardIds.indexOf(cardId);
        if (cardIndex > -1) {
            likedCardIds.splice(cardIndex, 1);
        } else {
            likedCardIds.push(cardId);
        }
        chrome.storage.sync.set({ 'likedCardIds': likedCardIds }, () => {
            renderCards();
        });
    }

    function shareCard(cardId) {
        const card = cardData.find(c => c.id === cardId);
        if (!card) return;
        const textToShare = `${card.title}\n\n${card.content}`;
        navigator.clipboard.writeText(textToShare).then(() => showToast('Conteúdo copiado para a área de transferência!'));
    }

    function deleteCard(cardId, cardElement) {
        cardElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateX(100px)';
        setTimeout(() => {
            cardData = cardData.filter(c => c.id !== cardId);
            likedCardIds = likedCardIds.filter(id => id !== cardId);
            // Salva o estado atualizado dos cards e curtidas
            chrome.storage.sync.set({ 'cardData': cardData, 'likedCardIds': likedCardIds }, () => {
                renderCards();
                showToast('Card excluído com sucesso!');
            });
        }, 300);
    }

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase().trim();
        document.querySelectorAll('.card-item').forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const content = card.querySelector('p')?.textContent.toLowerCase() || '';
            const isVisible = title.includes(searchTerm) || content.includes(searchTerm);
            card.style.display = isVisible ? '' : 'none';
        });
    });

    function initialize() {
        // Carrega os dados dos cards e curtidas do storage.sync
        chrome.storage.sync.get(['cardData', 'likedCardIds'], (syncResult) => {
            if (syncResult.cardData) {
                cardData = syncResult.cardData;
            }
            likedCardIds = syncResult.likedCardIds || [];

            // Carrega o avatar do storage.local
            chrome.storage.local.get(['customAvatar'], (localResult) => {
                currentUserAvatar.customImage = localResult.customAvatar || 'Assets/Gemini_Generated_Image_boy_one.png';

                // O restante da sua função de inicialização continua aqui
                userAvatar.addEventListener('click', openAvatarModal);
                closeModal.addEventListener('click', closeAvatarModal);
                window.addEventListener('click', (e) => e.target === avatarModal && closeAvatarModal());
                avatarOptions.forEach(option => {
                    option.addEventListener('click', () => {
                        document.querySelectorAll('.avatar-option.selected').forEach(el => el.classList.remove('selected'));
                        option.classList.add('selected');
                        if (avatarUpload) {
                            avatarUpload.value = '';
                        }
                        sessionUploadedAvatarURL = null;
                    });
                });
                if (avatarUpload) {
                    avatarUpload.addEventListener('change', handleAvatarUpload);
                }
                saveAvatarBtn.addEventListener('click', saveAvatar);
                setupCardActions();
                updateAllAvatars();
                renderCards();
            });
        });
    }

    initialize();
});