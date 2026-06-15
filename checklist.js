// ==================== CHECKLIST.JS - VERSÃO COMPLETA FUNCIONAL ====================
console.log('📋 checklist.js carregado - VERSÃO FUNCIONAL');

// ==================== VARIÁVEIS GLOBAIS ====================
let itensChecklist = [];

// ==================== CARREGAR PERSONAGENS ====================

function carregarPersonagensChecklist() {
    console.log('🔄 Carregando personagens...');
    
    let personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
    if (personagens.length === 0) personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
    
    const select = document.getElementById('personagem_checklist');
    if (!select) return;
    
    select.innerHTML = '<option value="">🔽 Selecione um personagem</option>';
    
    personagens.forEach(personagem => {
        const id = personagem.id || personagem.ID_personagens;
        const nome = personagem.nome_personagens || personagem.nome || 'Sem nome';
        const tema = personagem.tema || '';
        const option = document.createElement('option');
        option.value = id;
        option.textContent = tema ? `${nome} - ${tema}` : nome;
        select.appendChild(option);
    });
    
    select.onchange = function() {
        if (this.value) {
            carregarFotoPersonagemChecklist();
            carregarItensDoPersonagem(this.value);
        } else {
            esconderFotoInfo();
        }
    };
    
    console.log(`✅ ${personagens.length} personagens carregados`);
}

// Carregar itens salvos do personagem
function carregarItensDoPersonagem(personagemId) {
    console.log('🔄 Carregando itens do personagem:', personagemId);
    
    const checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const checklistPersonagem = checklists.filter(c => c.personagemId === personagemId);
    
    if (checklistPersonagem.length > 0) {
        const ultimoChecklist = checklistPersonagem[checklistPersonagem.length - 1];
        if (ultimoChecklist.itens && ultimoChecklist.itens.length > 0) {
            console.log(`📋 Encontrados ${ultimoChecklist.itens.length} itens salvos para este personagem`);
            // Mostrar sugestão para carregar itens anteriores
            const container = document.getElementById('listaItensChecklist');
            if (container && container.children.length === 0) {
                const sugestaoDiv = document.createElement('div');
                sugestaoDiv.id = 'sugestaoItens';
                sugestaoDiv.style.cssText = 'background: #e3f2fd; padding: 10px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;';
                sugestaoDiv.innerHTML = `
                    <span>📋 Existem ${ultimoChecklist.itens.length} itens salvos para este personagem.</span>
                    <button type="button" class="btn small" onclick="carregarItensAnteriores('${personagemId}')" style="background: #2196f3; color: white;">Carregar Itens</button>
                `;
                if (!document.getElementById('sugestaoItens')) {
                    container.parentNode.insertBefore(sugestaoDiv, container);
                }
            }
        }
    }
}

function carregarItensAnteriores(personagemId) {
    const checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const checklistPersonagem = checklists.filter(c => c.personagemId === personagemId);
    
    if (checklistPersonagem.length > 0) {
        const ultimoChecklist = checklistPersonagem[checklistPersonagem.length - 1];
        if (ultimoChecklist.itens && ultimoChecklist.itens.length > 0) {
            const container = document.getElementById('listaItensChecklist');
            container.innerHTML = '';
            ultimoChecklist.itens.forEach(item => {
                adicionarItemNaLista(item.nome, item.categoria);
            });
            const sugestaoDiv = document.getElementById('sugestaoItens');
            if (sugestaoDiv) sugestaoDiv.remove();
            alert(`✅ ${ultimoChecklist.itens.length} itens carregados!`);
        }
    }
}

// ==================== FOTO DO PERSONAGEM ====================

function carregarFotoPersonagemChecklist() {
    const select = document.getElementById('personagem_checklist');
    if (!select || !select.value) return;
    
    let personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
    if (personagens.length === 0) personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
    
    const personagem = personagens.find(p => p.id === select.value || p.ID_personagens === select.value);
    if (!personagem) return;
    
    const infoDiv = document.getElementById('infoPersonagemChecklist');
    if (infoDiv) {
        infoDiv.style.display = 'block';
        document.getElementById('figurinoChecklist').textContent = personagem.figurino || '-';
        document.getElementById('temaChecklist').textContent = personagem.tema || '-';
        document.getElementById('valorChecklist').textContent = personagem.valorFormatado || 'R$ 0,00';
    }
    
    const fotoImg = document.getElementById('fotoPersonagemChecklist');
    const semFotoSpan = document.getElementById('semFotoChecklist');
    
    if (fotoImg) {
        const foto = personagem.foto || personagem.foto_personagem || personagem.foto_personagens;
        if (foto && foto !== '') {
            fotoImg.src = foto;
            fotoImg.style.display = 'block';
            if (semFotoSpan) semFotoSpan.style.display = 'none';
        } else {
            fotoImg.style.display = 'none';
            if (semFotoSpan) semFotoSpan.style.display = 'inline';
        }
    }
}

function esconderFotoInfo() {
    const infoDiv = document.getElementById('infoPersonagemChecklist');
    if (infoDiv) infoDiv.style.display = 'none';
    const fotoImg = document.getElementById('fotoPersonagemChecklist');
    const semFotoSpan = document.getElementById('semFotoChecklist');
    if (fotoImg) fotoImg.style.display = 'none';
    if (semFotoSpan) semFotoSpan.style.display = 'inline';
    const sugestaoDiv = document.getElementById('sugestaoItens');
    if (sugestaoDiv) sugestaoDiv.remove();
}

// ==================== FUNÇÕES DE ITENS DO CHECKLIST - CORRIGIDAS ====================

// Adicionar novo item (chamado pelo botão)
function adicionarNovoItem() {
    console.log('➕ Botão Adicionar Item clicado');
    
    const input = document.getElementById('novoItemInput');
    if (!input) {
        console.error('❌ Campo novoItemInput não encontrado');
        alert('Erro: Campo de item não encontrado!');
        return;
    }
    
    const itemNome = input.value.trim();
    if (!itemNome) {
        alert('❌ Digite o nome do item!');
        input.focus();
        return;
    }
    
    // Obter categoria selecionada
    const categoriaSelect = document.getElementById('categoriaItemSelect');
    const categoria = categoriaSelect ? categoriaSelect.value : 'outros';
    
    // Adicionar item na lista
    adicionarItemNaLista(itemNome, categoria);
    
    // Limpar input e manter foco
    input.value = '';
    input.focus();
}

// Função auxiliar para adicionar item na lista visual
function adicionarItemNaLista(nome, categoria) {
    const container = document.getElementById('listaItensChecklist');
    if (!container) {
        console.error('❌ Container listaItensChecklist não encontrado');
        return;
    }
    
    // Verificar duplicado
    const itensExistentes = document.querySelectorAll('#listaItensChecklist .item-nome');
    for (let item of itensExistentes) {
        if (item.value.trim().toLowerCase() === nome.toLowerCase()) {
            alert('⚠️ Este item já foi adicionado!');
            return false;
        }
    }
    
    const itemId = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'checklist-item';
    itemDiv.id = itemId;
    itemDiv.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745;';
    
    // Mapear categorias para ícones
    const categoriaIcone = {
        'figurino': '👕',
        'acessorios': '💍',
        'maquiagem': '💄',
        'documentos': '📄',
        'outros': '📌'
    };
    const icone = categoriaIcone[categoria] || '📋';
    
    itemDiv.innerHTML = `
        <div style="width: 30px; text-align: center; font-size: 20px;">${icone}</div>
        <input type="text" class="item-nome" value="${nome.replace(/"/g, '&quot;')}" style="flex: 2; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: white;">
        <select class="item-categoria" style="width: 120px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="figurino" ${categoria === 'figurino' ? 'selected' : ''}>👕 Figurino</option>
            <option value="acessorios" ${categoria === 'acessorios' ? 'selected' : ''}>💍 Acessórios</option>
            <option value="maquiagem" ${categoria === 'maquiagem' ? 'selected' : ''}>💄 Maquiagem</option>
            <option value="documentos" ${categoria === 'documentos' ? 'selected' : ''}>📄 Documentos</option>
            <option value="outros" ${categoria === 'outros' ? 'selected' : ''}>📌 Outros</option>
        </select>
        <button type="button" class="btn small" onclick="editarItem(this)" style="background: #ffc107; color: #333; padding: 5px 10px;">✏️</button>
        <button type="button" class="btn small danger" onclick="removerItem(this)" style="padding: 5px 10px;">🗑️</button>
    `;
    
    // Adicionar evento de mudança de categoria
    const categoriaSelectNovo = itemDiv.querySelector('.item-categoria');
    categoriaSelectNovo.onchange = function() {
        const iconeDiv = this.closest('.checklist-item').querySelector('div:first-child');
        const novosIcones = {
            'figurino': '👕', 'acessorios': '💍', 'maquiagem': '💄',
            'documentos': '📄', 'outros': '📌'
        };
        iconeDiv.textContent = novosIcones[this.value] || '📋';
    };
    
    container.appendChild(itemDiv);
    atualizarContadorItens();
    
    console.log('✅ Item adicionado:', nome);
    return true;
}

// Remover item
function removerItem(botao) {
    if (confirm('❌ Remover este item?')) {
        const itemDiv = botao.closest('.checklist-item');
        if (itemDiv) {
            itemDiv.remove();
            atualizarContadorItens();
            console.log('🗑️ Item removido');
        }
    }
}

// Editar item
function editarItem(botao) {
    const itemDiv = botao.closest('.checklist-item');
    const inputNome = itemDiv.querySelector('.item-nome');
    const novoNome = prompt('✏️ Editar item:', inputNome.value);
    if (novoNome && novoNome.trim()) {
        inputNome.value = novoNome.trim();
        console.log('✏️ Item editado:', inputNome.value);
    }
}

// Atualizar contador de itens
function atualizarContadorItens() {
    const count = document.querySelectorAll('#listaItensChecklist .checklist-item').length;
    const contador = document.getElementById('contadorItens');
    if (contador) {
        contador.innerHTML = `📊 Total de itens: <strong style="font-size: 18px; color: ${count === 0 ? '#dc3545' : '#28a745'}">${count}</strong>`;
    }
    console.log(`📊 Total de itens na lista: ${count}`);
}

// Filtrar itens por categoria
function filtrarItensPorCategoria(categoria, btnElement) {
    console.log('🔍 Filtrando por categoria:', categoria);
    
    const itens = document.querySelectorAll('#listaItensChecklist .checklist-item');
    
    // Atualizar botões ativos
    const botoes = document.querySelectorAll('.btn-categoria');
    botoes.forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    
    let countVisiveis = 0;
    itens.forEach(item => {
        const select = item.querySelector('.item-categoria');
        if (categoria === 'todos' || (select && select.value === categoria)) {
            item.style.display = 'flex';
            countVisiveis++;
        } else {
            item.style.display = 'none';
        }
    });
    
    console.log(`📊 ${countVisiveis} itens visíveis`);
}

// ==================== SALVAR CHECKLIST ====================

function salvarChecklist() {
    console.log('💾 Salvando checklist...');
    
    const select = document.getElementById('personagem_checklist');
    const personagemId = select ? select.value : '';
    const nomeChecklist = document.getElementById('nome_checklist')?.value.trim();
    const tipoChecklist = document.getElementById('tipo_checklist')?.value;
    const descricao = document.getElementById('descricao_checklist')?.value;
    
    if (!personagemId) {
        alert('❌ Selecione um personagem!');
        return;
    }
    
    if (!nomeChecklist) {
        alert('❌ Informe o nome do checklist!');
        document.getElementById('nome_checklist')?.focus();
        return;
    }
    
    // Coletar itens
    const itens = [];
    document.querySelectorAll('#listaItensChecklist .checklist-item').forEach(itemDiv => {
        const nome = itemDiv.querySelector('.item-nome')?.value.trim();
        const categoria = itemDiv.querySelector('.item-categoria')?.value || 'outros';
        if (nome) {
            itens.push({ nome, categoria, concluido: false });
        }
    });
    
    if (itens.length === 0) {
        if (!confirm('⚠️ Você não adicionou nenhum item. Deseja salvar mesmo assim?')) {
            return;
        }
    }
    
    // Buscar nome do personagem
    let personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
    if (personagens.length === 0) personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
    
    const personagem = personagens.find(p => p.id === personagemId || p.ID_personagens === personagemId);
    const personagemNome = personagem ? (personagem.nome_personagens || personagem.nome) : 'Personagem';
    
    const checklist = {
        id: 'CHK-' + Date.now(),
        personagemId: personagemId,
        personagemNome: personagemNome,
        nome: nomeChecklist,
        tipo: tipoChecklist || 'evento',
        descricao: descricao,
        itens: itens,
        totalItens: itens.length,
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        status: 'pendente'
    };
    
    let checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    checklists.push(checklist);
    localStorage.setItem('checklists_cadastrados', JSON.stringify(checklists));
    
    console.log('✅ Checklist salvo:', checklist);
    alert(`✅ Checklist "${nomeChecklist}" salvo com ${itens.length} itens!`);
    
    limparChecklist();
    
    setTimeout(() => {
        if (typeof showPage === 'function') showPage('lista_checklist');
    }, 1000);
}

function limparChecklist() {
    document.getElementById('nome_checklist').value = '';
    document.getElementById('tipo_checklist').value = 'evento';
    document.getElementById('descricao_checklist').value = '';
    document.getElementById('listaItensChecklist').innerHTML = '';
    document.getElementById('novoItemInput').value = '';
    
    const select = document.getElementById('personagem_checklist');
    if (select) select.value = '';
    
    esconderFotoInfo();
    atualizarContadorItens();
    
    // Resetar botões de categoria
    const botoes = document.querySelectorAll('.btn-categoria');
    botoes.forEach(btn => btn.classList.remove('active'));
    const btnTodos = document.querySelector('.btn-categoria[data-categoria="todos"]');
    if (btnTodos) btnTodos.classList.add('active');
    
    console.log('🧹 Formulário limpo');
}

function carregarChecklistModelo() {
    console.log('📋 Carregando modelo de checklist...');
    
    const container = document.getElementById('listaItensChecklist');
    if (!container) return;
    
    const modeloItens = [
        { nome: 'Verificar figurino completo', categoria: 'figurino' },
        { nome: 'Conferir acessórios', categoria: 'acessorios' },
        { nome: 'Maquiagem e cabelo prontos', categoria: 'maquiagem' },
        { nome: 'Documentos e contratos em ordem', categoria: 'documentos' },
        { nome: 'Material de apoio separado', categoria: 'outros' }
    ];
    
    container.innerHTML = '';
    modeloItens.forEach(item => {
        adicionarItemNaLista(item.nome, item.categoria);
    });
    
    atualizarContadorItens();
    alert('✅ Modelo com 5 itens carregado!');
}

function visualizarChecklist() {
    const count = document.querySelectorAll('#listaItensChecklist .checklist-item').length;
    const nome = document.getElementById('nome_checklist')?.value || 'Sem nome';
    alert(`📋 VISUALIZAÇÃO DO CHECKLIST\n\n📌 Nome: ${nome}\n📊 Total de itens: ${count}\n\nOs itens serão exibidos detalhadamente em breve.`);
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - inicializando...');
    
    // Configurar eventos dos botões de categoria
    const botoesCategoria = document.querySelectorAll('.btn-categoria');
    botoesCategoria.forEach(btn => {
        btn.onclick = function() {
            const categoria = this.getAttribute('data-categoria');
            filtrarItensPorCategoria(categoria, this);
        };
    });
    
    // Configurar tecla Enter no campo de item
    const inputItem = document.getElementById('novoItemInput');
    if (inputItem) {
        inputItem.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                adicionarNovoItem();
            }
        });
    }
    
    // Carregar personagens se a página estiver ativa
    const criarChecklistPage = document.getElementById('criar_checklist');
    if (criarChecklistPage && criarChecklistPage.classList.contains('active')) {
        carregarPersonagensChecklist();
        atualizarContadorItens();
    }
});

// Observador para quando a página mudar
const observer = new MutationObserver(function() {
    const criarChecklistPage = document.getElementById('criar_checklist');
    if (criarChecklistPage && criarChecklistPage.classList.contains('active') && criarChecklistPage.style.display === 'block') {
        console.log('📄 Página criar_checklist ativada');
        carregarPersonagensChecklist();
        atualizarContadorItens();
    }
});
observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });
// Modificar a função salvarChecklist para verificar se é edição
const salvarChecklistOriginalFunc = window.salvarChecklist;
window.salvarChecklist = function() {
    const editarId = sessionStorage.getItem('editarChecklistId');
    if (editarId) {
        // Se estiver editando, chama a função do relatorios-equipe.js
        if (typeof salvarChecklistEditado === 'function') {
            salvarChecklistEditado(editarId);
        } else {
            alert('Erro: Função de edição não encontrada');
        }
    } else {
        salvarChecklistOriginalFunc();
    }
};
// ==================== EXPORTAR FUNÇÕES ====================

window.carregarPersonagensChecklist = carregarPersonagensChecklist;
window.carregarFotoPersonagemChecklist = carregarFotoPersonagemChecklist;
window.adicionarNovoItem = adicionarNovoItem;
window.removerItem = removerItem;
window.editarItem = editarItem;
window.salvarChecklist = salvarChecklist;
window.limparChecklist = limparChecklist;
window.carregarChecklistModelo = carregarChecklistModelo;
window.visualizarChecklist = visualizarChecklist;
window.filtrarItensPorCategoria = filtrarItensPorCategoria;
window.atualizarContadorItens = atualizarContadorItens;
window.carregarItensAnteriores = carregarItensAnteriores;

console.log('✅ checklist.js carregado com sucesso!');