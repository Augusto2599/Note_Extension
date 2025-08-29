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

    // Elementos do novo modal de notas
    const noteConfirmationModal = document.getElementById('note-confirmation-modal');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteContentTextarea = document.getElementById('note-content-textarea');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const discardNoteBtn = document.getElementById('discard-note-btn');

    // Elementos da notificação "toast"
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');


    // --- ESTADO DA APLICAÇÃO ---
    let cardData = [];
    let likedCardIds = [];
    let currentUserAvatar = {
        customImage: 'Assets/Gemini_Generated_Image_boy_one.png'
    };
    let sessionUploadedAvatarURL = null;

    // --- FUNÇÕES DE NOTIFICAÇÃO ---
    function showToast(message) {
        if (!toast || !toastMessage) return;
        toastMessage.textContent = message;
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }

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
            const avatarSrc = selectedOption.getAttribute('src');
            chrome.storage.local.set({ 'customAvatar': avatarSrc }, () => {
                currentUserAvatar.customImage = avatarSrc;
                sessionUploadedAvatarURL = null;
                updateAllAvatars();
                closeAvatarModal();
                showToast('Avatar atualizado com sucesso!');
            });
        } else if (sessionUploadedAvatarURL) {
            fetch(sessionUploadedAvatarURL)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const base64Image = e.target.result;
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

    // --- LÓGICA DO NOVO MODAL DE NOTAS ---
    function openNoteConfirmationModal(text) {
        noteTitleInput.value = text.substring(0, 30) + (text.length > 30 ? '...' : '');
        noteContentTextarea.value = text;
        noteConfirmationModal.style.display = 'flex';
    }

    function closeNoteConfirmationModal() {
        noteConfirmationModal.style.display = 'none';
        chrome.storage.local.remove('newNoteFromSelection');
    }

    function saveNewNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentTextarea.value.trim();
        if (!title || !content) {
            alert('O título e o conteúdo não podem estar vazios.');
            return;
        }
        const newCard = {
            id: Date.now(),
            type: 'small',
            title: title,
            content: content,
            timestamp: new Date().toLocaleString('pt-BR')
        };
        cardData.unshift(newCard);
        chrome.storage.sync.set({ 'cardData': cardData }, () => {
            renderCards();
            showToast('Nota salva com sucesso!');
            closeNoteConfirmationModal();
        });
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

    // --- FUNÇÕES DE INICIALIZAÇÃO ---
    function loadDataAndRender() {
        chrome.storage.sync.get(['cardData', 'likedCardIds'], (syncResult) => {
            cardData = syncResult.cardData || [];
            likedCardIds = syncResult.likedCardIds || [];

            chrome.storage.local.get(['customAvatar', 'newNoteFromSelection'], (localResult) => {
                currentUserAvatar.customImage = localResult.customAvatar || 'Assets/Gemini_Generated_Image_boy_one.png';

                updateAllAvatars();
                renderCards();

                if (localResult.newNoteFromSelection) {
                    openNoteConfirmationModal(localResult.newNoteFromSelection);
                }
            });
        });
    }

    function initialize() {
        // Registra todos os eventos primeiro
        userAvatar.addEventListener('click', openAvatarModal);
        closeModal.addEventListener('click', closeAvatarModal);
        window.addEventListener('click', (e) => e.target === avatarModal && closeAvatarModal());

        avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option.selected').forEach(el => el.classList.remove('selected'));
                option.classList.add('selected');
                if (avatarUpload) avatarUpload.value = '';
                sessionUploadedAvatarURL = null;
            });
        });

        if (avatarUpload) avatarUpload.addEventListener('change', handleAvatarUpload);
        saveAvatarBtn.addEventListener('click', saveAvatar);

        saveNoteBtn.addEventListener('click', saveNewNote);
        discardNoteBtn.addEventListener('click', closeNoteConfirmationModal);

        setupCardActions();

        // Depois de configurar tudo, carrega os dados
        loadDataAndRender();
    }

    // Inicia a aplicação
    initialize();
});