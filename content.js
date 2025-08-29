let floatingIcon;
let modal;

// --- CRIAÇÃO DOS ELEMENTOS ---

function createFloatingIcon() {
    if (document.getElementById('note-extension-save-icon')) return;

    floatingIcon = document.createElement('div');
    floatingIcon.id = 'note-extension-save-icon';

    const iconImage = document.createElement('img');
    iconImage.src = chrome.runtime.getURL('Assets/notes.png');
    floatingIcon.appendChild(iconImage);

    document.body.appendChild(floatingIcon);
    floatingIcon.style.display = 'none';

    floatingIcon.addEventListener('click', () => {
        const selectedText = window.getSelection().toString();
        if (selectedText.trim().length > 0) {
            showConfirmationModal(selectedText);
        }
        floatingIcon.style.display = 'none';
    });
}

function createConfirmationModal() {
    if (document.getElementById('note-extension-modal-container')) return;

    modal = document.createElement('div');
    modal.id = 'note-extension-modal-container';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Salvar Nova Nota</h3>
            <div style="margin-bottom: 1rem;">
                <label for="modal-title-input">Título</label>
                <input type="text" id="modal-title-input">
            </div>
            <div>
                <label for="modal-content-textarea">Conteúdo</label>
                <textarea id="modal-content-textarea" rows="6"></textarea>
            </div>
            <div class="modal-actions">
                <button id="modal-discard-btn">Descartar</button>
                <button id="modal-save-btn">Salvar Nota</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'none';

    modal.querySelector('#modal-save-btn').addEventListener('click', handleSaveNote);
    modal.querySelector('#modal-discard-btn').addEventListener('click', hideConfirmationModal);
    // Fecha se clicar fora do conteúdo
    modal.addEventListener('click', (e) => {
        if (e.target.id === 'note-extension-modal-container') {
            hideConfirmationModal();
        }
    });
}

// --- LÓGICA DE EXIBIÇÃO ---

function showFloatingIcon(range) {
    if (!floatingIcon) createFloatingIcon();
    const rect = range.getBoundingClientRect();
    floatingIcon.style.top = `${window.scrollY + rect.bottom + 5}px`;
    floatingIcon.style.left = `${window.scrollX + rect.left}px`;
    floatingIcon.style.display = 'flex';
}

function hideFloatingIcon() {
    if (floatingIcon) {
        floatingIcon.style.display = 'none';
    }
}

function showConfirmationModal(text) {
    if (!modal) createConfirmationModal();

    modal.querySelector('#modal-title-input').value = text.substring(0, 40) + (text.length > 40 ? '...' : '');
    modal.querySelector('#modal-content-textarea').value = text;
    modal.style.display = 'flex';
}

function hideConfirmationModal() {
    if (modal) {
        modal.style.display = 'none';
    }
}

// --- AÇÕES ---

function handleSaveNote() {
    const title = modal.querySelector('#modal-title-input').value.trim();
    const content = modal.querySelector('#modal-content-textarea').value.trim();

    if (title && content) {
        chrome.runtime.sendMessage({
            action: 'saveNote',
            data: { title, content }
        }, (response) => {
            if (response.status === 'success') {
                // Aqui poderíamos mostrar uma notificação de sucesso na página
                console.log('Nota salva!');
            }
        });
        hideConfirmationModal();
    }
}

// --- EVENTOS PRINCIPAIS ---

// Cria os elementos na primeira vez que o script é injetado
createFloatingIcon();
createConfirmationModal();

document.addEventListener('mouseup', (e) => {
    // Atraso para garantir que a seleção foi finalizada
    setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            // Não mostra o ícone se o clique foi dentro do nosso modal
            if (!e.target.closest('#note-extension-modal-container')) {
                const range = selection.getRangeAt(0);
                showFloatingIcon(range);
            }
        } else {
            hideFloatingIcon();
        }
    }, 10);
});