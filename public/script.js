let currentPassword = '';
let currentUser = null;
let currentEquipmentId = null;

const loginScreen = document.getElementById('loginScreen');
const mainScreen = document.getElementById('mainScreen');
const passwordDisplay = document.getElementById('passwordDisplay');
const enterBtn = document.getElementById('enterBtn');
const equipmentGrid = document.getElementById('equipmentGrid');
const newEquipmentBtn = document.getElementById('newEquipmentBtn');


const commentsModal = document.getElementById('commentsModal');
const newCommentModal = document.getElementById('newCommentModal');
const newEquipmentModal = document.getElementById('newEquipmentModal');
const deleteModal = document.getElementById('deleteModal');
const loadingOverlay = document.getElementById('loadingOverlay');


document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});


function setupEventListeners() {
    
    document.querySelectorAll('.key-btn').forEach(btn => {
        btn.addEventListener('click', handleKeyPress);
    });

    
    document.getElementById('exitBtn').addEventListener('click', () => window.close());
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('newEquipmentBtn').addEventListener('click', () => openModal('newEquipmentModal'));

    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });

    
    document.getElementById('newCommentForm').addEventListener('submit', handleNewComment);
    document.getElementById('newEquipmentForm').addEventListener('submit', handleNewEquipment);

    
    document.getElementById('cancelCommentBtn').addEventListener('click', () => closeModal('newCommentModal'));
    document.getElementById('cancelEquipmentBtn').addEventListener('click', () => closeModal('newEquipmentModal'));
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('deleteModal'));

    
    document.getElementById('addCommentBtn').addEventListener('click', () => openModal('newCommentModal'));

   
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteEquipment);

    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}


async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            showMainScreen();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showLoginScreen();
    }
}


function handleKeyPress(e) {
    const key = e.target.dataset.key;
    
    switch (key) {
        case 'clear':
            currentPassword = '';
            updatePasswordDisplay();
            break;
        case 'enter':
            if (currentPassword.length === 6) {
                handleLogin();
            }
            break;
        default:
            if (currentPassword.length < 6) {
                currentPassword += key;
                updatePasswordDisplay();
            }
            break;
    }
}


function updatePasswordDisplay() {
    const display = '•'.repeat(currentPassword.length) + '•'.repeat(6 - currentPassword.length);
    passwordDisplay.textContent = display;
    
   
    enterBtn.disabled = currentPassword.length !== 6;
    
   
    if (currentPassword.length === 6) {
        passwordDisplay.classList.add('filled');
    } else {
        passwordDisplay.classList.remove('filled');
    }
}


async function handleLogin() {
    if (currentPassword.length !== 6) return;
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ senha: currentPassword })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentUser = data.user;
            showMainScreen();
            currentPassword = '';
            updatePasswordDisplay();
        } else {
            alert(data.error || 'Erro ao fazer login');
            currentPassword = '';
            updatePasswordDisplay();
        }
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro de conexão. Tente novamente.');
        currentPassword = '';
        updatePasswordDisplay();
    } finally {
        showLoading(false);
    }
}


async function handleLogout() {
    showLoading(true);
    
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        showLoginScreen();
    } catch (error) {
        console.error('Erro no logout:', error);
    } finally {
        showLoading(false);
    }
}


function showLoginScreen() {
    loginScreen.classList.add('active');
    mainScreen.classList.remove('active');
}


function showMainScreen() {
    loginScreen.classList.remove('active');
    mainScreen.classList.add('active');
    
   
    if (currentUser && currentUser.perfil === 'administrador') {
        newEquipmentBtn.style.display = 'inline-flex';
    } else {
        newEquipmentBtn.style.display = 'none';
    }
    
    loadEquipments();
}


async function loadEquipments() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/equipamentos');
        const equipments = await response.json();
        
        if (response.ok) {
            renderEquipments(equipments);
        } else {
            console.error('Erro ao carregar equipamentos:', equipments.error);
        }
    } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
    } finally {
        showLoading(false);
    }
}

function renderEquipments(equipments) {
    equipmentGrid.innerHTML = '';
    
    equipments.forEach(equipment => {
        const card = createEquipmentCard(equipment);
        equipmentGrid.appendChild(card);
    });
}


function createEquipmentCard(equipment) {
    const card = document.createElement('div');
    card.className = 'equipment-card';
    
    const isAdmin = currentUser && currentUser.perfil === 'administrador';
    const statusClass = equipment.status_ativo ? 'active' : 'inactive';
    const statusText = equipment.status_ativo ? 'Ativo' : 'Inativo';
    
    card.innerHTML = `
        <img src="${equipment.url_imagem}" alt="${equipment.nome}" class="equipment-image" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA4MEgxMjBWMTIwSDgwVjgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'">
        <div class="equipment-content">
            <div class="equipment-header">
                <div>
                    <h3 class="equipment-title">${equipment.nome}</h3>
                    <span class="equipment-status ${statusClass}">${statusText}</span>
                </div>
            </div>
            <p class="equipment-description">${equipment.descricao}</p>
            <div class="equipment-actions">
                <button class="btn-primary" onclick="openComments(${equipment.id}, '${equipment.nome}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Comentários
                </button>
                ${isAdmin ? `
                    <button class="btn-danger" onclick="confirmDelete(${equipment.id}, '${equipment.nome}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                        Excluir
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

async function openComments(equipmentId, equipmentName) {
    currentEquipmentId = equipmentId;
    document.getElementById('modalTitle').textContent = `Comentários - ${equipmentName}`;
    
    showLoading(true);
    
    try {
        const response = await fetch(`/api/comentarios/equipamento/${equipmentId}`);
        const comments = await response.json();
        
        if (response.ok) {
            renderComments(comments);
            openModal('commentsModal');
        } else {
            alert('Erro ao carregar comentários');
        }
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        alert('Erro de conexão');
    } finally {
        showLoading(false);
    }
}


function renderComments(comments) {
    const commentsList = document.getElementById('commentsList');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Nenhum comentário ainda.</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.usuario_perfil}</span>
                <span class="comment-date">${formatDate(comment.data_inclusao)}</span>
            </div>
            <p class="comment-text">${comment.texto}</p>
        </div>
    `).join('');
}


async function handleNewComment(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const texto = formData.get('commentText').trim();
    
    if (!texto) {
        alert('Por favor, digite um comentário');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/comentarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                texto: texto,
                equipamento_id: currentEquipmentId
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            closeModal('newCommentModal');
            document.getElementById('newCommentForm').reset();
            
            openComments(currentEquipmentId, document.getElementById('modalTitle').textContent.replace('Comentários - ', ''));
        } else {
            alert(data.error || 'Erro ao adicionar comentário');
        }
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        alert('Erro de conexão');
    } finally {
        showLoading(false);
    }
}


async function handleNewEquipment(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const equipmentData = {
        nome: formData.get('equipmentName').trim(),
        descricao: formData.get('equipmentDescription').trim(),
        url_imagem: formData.get('equipmentImage').trim(),
        status_ativo: formData.get('equipmentActive') === 'on'
    };
    
    if (!equipmentData.nome || !equipmentData.descricao || !equipmentData.url_imagem) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/equipamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(equipmentData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            closeModal('newEquipmentModal');
            document.getElementById('newEquipmentForm').reset();
            loadEquipments(); // Recarregar lista
        } else {
            alert(data.error || 'Erro ao cadastrar equipamento');
        }
    } catch (error) {
        console.error('Erro ao cadastrar equipamento:', error);
        alert('Erro de conexão');
    } finally {
        showLoading(false);
    }
}

function confirmDelete(equipmentId, equipmentName) {
    currentEquipmentId = equipmentId;
    openModal('deleteModal');
}


async function handleDeleteEquipment() {
    if (!currentEquipmentId) return;
    
    showLoading(true);
    
    try {
        const response = await fetch(`/api/equipamentos/${currentEquipmentId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            closeModal('deleteModal');
            loadEquipments(); 
        } else {
            alert(data.error || 'Erro ao excluir equipamento');
        }
    } catch (error) {
        console.error('Erro ao excluir equipamento:', error);
        alert('Erro de conexão');
    } finally {
        showLoading(false);
    }
}


function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function initializeApp() {
    
    updatePasswordDisplay();
    
    
    currentPassword = '';
    currentUser = null;
    currentEquipmentId = null;
}

