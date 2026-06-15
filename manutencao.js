// ==================== CARREGAR PERSONAGENS NA MANUTENÇÃO ====================
function carregarPersonagensManutencao() {
    console.log('🎭 Carregando personagens para manutenção...');
    
    const selectPersonagem = document.getElementById('personagem_manutencao');
    if (!selectPersonagem) {
        console.log('⚠️ Select personagem_manutencao não encontrado');
        // Tentar novamente após 500ms
        setTimeout(carregarPersonagensManutencao, 500);
        return;
    }
    
    // Buscar personagens do localStorage
    let personagens = [];
    try {
        // Tentar primeiro 'personagens' (usado no formulario.js)
        const stored = localStorage.getItem('personagens');
        if (stored) {
            personagens = JSON.parse(stored);
            console.log(`📊 Encontrados ${personagens.length} personagens em 'personagens'`);
        }
        
        // Se não tiver, tentar 'personagens_cadastrados'
        if (personagens.length === 0) {
            const stored2 = localStorage.getItem('personagens_cadastrados');
            if (stored2) {
                personagens = JSON.parse(stored2);
                console.log(`📊 Encontrados ${personagens.length} personagens em 'personagens_cadastrados'`);
            }
        }
    } catch(e) {
        console.error('Erro ao carregar personagens:', e);
    }
    
    // Limpar select
    selectPersonagem.innerHTML = '<option value=""> selecione o personagem </option>';
    
    // Adicionar personagens
    if (personagens.length > 0) {
        personagens.forEach(personagem => {
            const option = document.createElement('option');
            // Tentar diferentes formas de obter o ID
            const id = personagem.id || personagem.ID_personagens || personagem.ID;
            const nome = personagem.nome_personagens || personagem.nome || 'Sem nome';
            
            if (id) {
                option.value = id;
                option.textContent = nome;
                selectPersonagem.appendChild(option);
                console.log(`✅ Personagem adicionado: ${nome} (ID: ${id})`);
            }
        });
        console.log(`✅ Total de ${selectPersonagem.options.length - 1} personagens carregados`);
    } else {
        selectPersonagem.innerHTML = '<option value=""> Nenhum personagem cadastrado. Cadastre um personagem primeiro.</option>';
        console.log('⚠️ Nenhum personagem encontrado no localStorage');
    }
}

// ==================== CARREGAR FOTO DO PERSONAGEM NA MANUTENÇÃO ====================
function carregarFotoPersonagemManutencao() {
    const select = document.getElementById('personagem_manutencao');
    const personagemId = select ? select.value : null;
    
    const fotoImg = document.getElementById('fotoPersonagemManutencao');
    const semFotoSpan = document.getElementById('semFotoManutencao');
    const infoDiv = document.getElementById('infoPersonagemManutencao');
    
    if (!personagemId) {
        if (fotoImg) {
            fotoImg.style.display = 'none';
            fotoImg.src = '';
        }
        if (semFotoSpan) semFotoSpan.style.display = 'block';
        if (infoDiv) infoDiv.style.display = 'none';
        return;
    }
    
    try {
        // Buscar personagens
        let personagens = [];
        const stored = localStorage.getItem('personagens');
        if (stored) personagens = JSON.parse(stored);
        if (personagens.length === 0) {
            const stored2 = localStorage.getItem('personagens_cadastrados');
            if (stored2) personagens = JSON.parse(stored2);
        }
        
        const personagem = personagens.find(p => {
            const id = p.id || p.ID_personagens || p.ID;
            return id == personagemId;
        });
        
        console.log('Personagem encontrado:', personagem);
        
        if (personagem) {
            // Mostrar informações
            if (infoDiv) infoDiv.style.display = 'block';
            
            const figurinoSpan = document.getElementById('figurinoPersonagem');
            const temaLocSpan = document.getElementById('temaPersonagem');
            const valorSpan = document.getElementById('valorPersonagem');
            const statusSpan = document.getElementById('statusPersonagem');
            
            if (figurinoSpan) figurinoSpan.textContent = personagem.figurino || '-';
            if (temaLocSpan) temaLocSpan.textContent = personagem.tema || '-';
            
            let valor = personagem.valor_personagens || personagem.valor || personagem.valor_hora || 0;
            if (typeof valor === 'string') {
                valor = parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
            }
            if (valorSpan) valorSpan.textContent = `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
            if (statusSpan) statusSpan.textContent = 'Disponível';
            
            // Carregar foto
            const fotoUrl = personagem.foto || personagem.foto_personagem;
            if (fotoUrl && fotoImg) {
                fotoImg.src = fotoUrl;
                fotoImg.style.display = 'block';
                if (semFotoSpan) semFotoSpan.style.display = 'none';
            } else if (fotoImg) {
                fotoImg.style.display = 'none';
                if (semFotoSpan) semFotoSpan.style.display = 'block';
            }
        }
    } catch(e) {
        console.error('Erro ao carregar foto:', e);
    }
}

// ==================== FUNÇÃO PARA SALVAR MANUTENÇÃO ====================
async function salvarRegistroManutencao() {
    console.log('🔧 Salvando registro de manutenção...');
    
    // Validar campos obrigatórios
    const personagemSelect = document.getElementById('personagem_manutencao');
    const personagemId = personagemSelect ? personagemSelect.value : null;
    const descricao = document.getElementById('descricao_defeito')?.value || '';
    const prioridade = document.getElementById('prioridade_manutencao')?.value || '';
    
    if (!personagemId) {
        mostrarMensagemToastManutencao('❌ Selecione um personagem!', true);
        return;
    }
    
    if (!descricao.trim()) {
        mostrarMensagemToastManutencao('❌ Descreva o defeito!', true);
        document.getElementById('descricao_defeito').focus();
        return;
    }
    
    if (!prioridade) {
        mostrarMensagemToastManutencao('❌ Selecione a prioridade!', true);
        return;
    }
    
    // Buscar dados do personagem
    let personagens = [];
    try {
        const stored = localStorage.getItem('personagens');
        if (stored) personagens = JSON.parse(stored);
        if (personagens.length === 0) {
            const stored2 = localStorage.getItem('personagens_cadastrados');
            if (stored2) personagens = JSON.parse(stored2);
        }
    } catch(e) {
        console.error('Erro ao carregar personagens:', e);
    }
    
    const personagem = personagens.find(p => {
        const id = p.id || p.ID_personagens || p.ID;
        return id == personagemId;
    });
    const nomePersonagem = personagem ? (personagem.nome_personagens || personagem.nome || 'Desconhecido') : 'Desconhecido';
    
    // Coletar fotos
    const fotosInput = document.getElementById('fotos_defeito');
    let fotos = [];
    
    if (fotosInput && fotosInput.files && fotosInput.files.length > 0) {
        for (let i = 0; i < fotosInput.files.length && i < 5; i++) {
            const file = fotosInput.files[i];
            if (file.type.startsWith('image/')) {
                const fotoBase64 = await lerArquivoComoBase64(file);
                fotos.push(fotoBase64);
            }
        }
    }
    
    // Gerar ID da manutenção
    const idManutencao = gerarID('MANUT');
    const dataAtual = new Date();
    const dataRegistro = dataAtual.toLocaleDateString('pt-BR');
    const horaRegistro = dataAtual.toLocaleTimeString('pt-BR');
    
    // Criar objeto de manutenção
    const manutencao = {
        id: idManutencao,
        personagem_id: personagemId,
        personagem_nome: nomePersonagem,
        descricao: descricao.trim(),
        prioridade: prioridade,
        local_defeito: document.getElementById('local_defeito')?.value || '',
        status: 'aguardando',
        data_registro: dataRegistro,
        hora_registro: horaRegistro,
        data_completa: dataAtual.toISOString(),
        fotos: fotos,
        observacoes: ''
    };
    
    // Salvar no localStorage
    let manutencoes = [];
    try {
        const stored = localStorage.getItem('manutencoes_registros');
        if (stored) manutencoes = JSON.parse(stored);
    } catch(e) {
        console.error('Erro ao carregar manutenções:', e);
    }
    
    manutencoes.unshift(manutencao);
    localStorage.setItem('manutencoes_registros', JSON.stringify(manutencoes));
    
    console.log('✅ Manutenção salva:', manutencao);
    mostrarMensagemToastManutencao('✅ Manutenção registrada com sucesso!');
    
    // Limpar formulário
    limparFormularioManutencao();
}

// Função auxiliar para ler arquivo como Base64
function lerArquivoComoBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ==================== FUNÇÃO PARA LIMPAR FORMULÁRIO ====================
function limparFormularioManutencao() {
    console.log('🧹 Limpando formulário de manutenção');
    
    const personagemSelect = document.getElementById('personagem_manutencao');
    if (personagemSelect) personagemSelect.value = '';
    
    const descricao = document.getElementById('descricao_defeito');
    if (descricao) descricao.value = '';
    
    const prioridade = document.getElementById('prioridade_manutencao');
    if (prioridade) prioridade.value = '';
    
    const localDefeito = document.getElementById('local_defeito');
    if (localDefeito) localDefeito.value = '';
    
    const fotosInput = document.getElementById('fotos_defeito');
    if (fotosInput) fotosInput.value = '';
    
    const previewContainer = document.getElementById('previewFotos');
    const previewWrapper = document.getElementById('previewFotosContainer');
    if (previewContainer) previewContainer.innerHTML = '';
    if (previewWrapper) previewWrapper.style.display = 'none';
    
    const fotoImg = document.getElementById('fotoPersonagemManutencao');
    const semFotoSpan = document.getElementById('semFotoManutencao');
    const infoDiv = document.getElementById('infoPersonagemManutencao');
    
    if (fotoImg) {
        fotoImg.style.display = 'none';
        fotoImg.src = '';
    }
    if (semFotoSpan) semFotoSpan.style.display = 'block';
    if (infoDiv) infoDiv.style.display = 'none';
    
    mostrarMensagemToastManutencao('🧹 Formulário limpo!');
}

// ==================== FUNÇÃO PARA CARREGAR MANUTENÇÕES NA LISTA ====================
function carregarManutencoes() {
    console.log('📋 Carregando lista de manutenções...');
    
    let manutencoes = [];
    try {
        const stored = localStorage.getItem('manutencoes_registros');
        if (stored) manutencoes = JSON.parse(stored);
    } catch(e) {
        console.error('Erro ao carregar manutenções:', e);
    }
    
    console.log(`📊 ${manutencoes.length} manutenções encontradas`);
    
    // Atualizar totais
    const totalAguardando = manutencoes.filter(m => m.status === 'aguardando').length;
    const totalEmAndamento = manutencoes.filter(m => m.status === 'em_andamento').length;
    const totalConcluidas = manutencoes.filter(m => m.status === 'concluida').length;
    
    const totalAguardandoSpan = document.getElementById('totalAguardando');
    const totalEmAndamentoSpan = document.getElementById('totalEmAndamento');
    const totalConcluidasSpan = document.getElementById('totalConcluidas');
    const totalManutencoesSpan = document.getElementById('totalManutencoes');
    
    if (totalAguardandoSpan) totalAguardandoSpan.textContent = totalAguardando;
    if (totalEmAndamentoSpan) totalEmAndamentoSpan.textContent = totalEmAndamento;
    if (totalConcluidasSpan) totalConcluidasSpan.textContent = totalConcluidas;
    if (totalManutencoesSpan) totalManutencoesSpan.textContent = manutencoes.length;
    
    // Carregar personagens no filtro
    carregarPersonagensFiltroLista();
    
    const tabelaBody = document.getElementById('tabelaManutencoes');
    if (!tabelaBody) return;
    
    if (manutencoes.length === 0) {
        tabelaBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">📭 Nenhum registro de manutenção encontrado</td></tr>`;
        return;
    }
    
    renderizarTabelaManutencoes(manutencoes);
}

function carregarPersonagensFiltroLista() {
    const filtroPersonagem = document.getElementById('filtroPersonagemManutencao');
    if (!filtroPersonagem) return;
    
    let personagens = [];
    try {
        const stored = localStorage.getItem('personagens');
        if (stored) personagens = JSON.parse(stored);
        if (personagens.length === 0) {
            const stored2 = localStorage.getItem('personagens_cadastrados');
            if (stored2) personagens = JSON.parse(stored2);
        }
    } catch(e) {
        console.error('Erro ao carregar personagens:', e);
    }
    
    filtroPersonagem.innerHTML = '<option value="todos">Todos os personagens</option>';
    
    personagens.forEach(personagem => {
        const nome = personagem.nome_personagens || personagem.nome || 'Sem nome';
        const option = document.createElement('option');
        option.value = nome;
        option.textContent = nome;
        filtroPersonagem.appendChild(option);
    });
}

function renderizarTabelaManutencoes(manutencoes) {
    const tabelaBody = document.getElementById('tabelaManutencoes');
    if (!tabelaBody) return;
    
    const getStatusBadge = (status) => {
        switch(status) {
            case 'aguardando': return '<span style="background: #6c757d; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">⏳ Aguardando</span>';
            case 'em_andamento': return '<span style="background: #ffc107; color: #333; padding: 4px 8px; border-radius: 12px; font-size: 12px;">🔧 Em andamento</span>';
            case 'concluida': return '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">✅ Concluída</span>';
            case 'cancelada': return '<span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">❌ Cancelada</span>';
            default: return status;
        }
    };
    
    const getPrioridadeBadge = (prioridade) => {
        switch(prioridade) {
            case 'alta': return '<span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">🔴 Alta</span>';
            case 'media': return '<span style="background: #ffc107; color: #333; padding: 4px 8px; border-radius: 12px; font-size: 12px;">🟡 Média</span>';
            case 'baixa': return '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">🟢 Baixa</span>';
            default: return prioridade;
        }
    };
    
    tabelaBody.innerHTML = manutencoes.map((m, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${m.personagem_nome}</strong></td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.descricao.replace(/"/g, '&quot;')}">${m.descricao.substring(0, 50)}${m.descricao.length > 50 ? '...' : ''}</td>
            <td>${getPrioridadeBadge(m.prioridade)}</td>
            <td><small>${m.data_registro}<br>${m.hora_registro}</small></td>
            <td>${getStatusBadge(m.status)}</td>
            <td>
                <button class="btn-small" onclick="verDetalhesManutencao('${m.id}')" style="background: #007bff; color: white; padding: 4px 8px; margin: 2px; border: none; border-radius: 4px; cursor: pointer;">👁️</button>
                <button class="btn-small" onclick="editarStatusManutencao('${m.id}')" style="background: #28a745; color: white; padding: 4px 8px; margin: 2px; border: none; border-radius: 4px; cursor: pointer;">✏️</button>
            </td>
        </tr>
    `).join('');
}

// ==================== FUNÇÕES DE FILTRO ====================
function filtrarManutencoes() {
    console.log('🔍 Filtrando manutenções...');
    let manutencoes = [];
    try {
        const stored = localStorage.getItem('manutencoes_registros');
        if (stored) manutencoes = JSON.parse(stored);
    } catch(e) {
        console.error('Erro ao carregar manutenções:', e);
    }
    
    const statusFiltro = document.getElementById('filtroStatusManutencao')?.value || 'todos';
    const personagemFiltro = document.getElementById('filtroPersonagemManutencao')?.value || 'todos';
    const prioridadeFiltro = document.getElementById('filtroPrioridadeManutencao')?.value || 'todos';
    
    let filtradas = [...manutencoes];
    
    if (statusFiltro !== 'todos') {
        filtradas = filtradas.filter(m => m.status === statusFiltro);
    }
    if (personagemFiltro !== 'todos') {
        filtradas = filtradas.filter(m => m.personagem_nome === personagemFiltro);
    }
    if (prioridadeFiltro !== 'todos') {
        filtradas = filtradas.filter(m => m.prioridade === prioridadeFiltro);
    }
    
    renderizarTabelaManutencoes(filtradas);
}

function resetarFiltrosManutencao() {
    const statusSelect = document.getElementById('filtroStatusManutencao');
    const personagemSelect = document.getElementById('filtroPersonagemManutencao');
    const prioridadeSelect = document.getElementById('filtroPrioridadeManutencao');
    
    if (statusSelect) statusSelect.value = 'todos';
    if (personagemSelect) personagemSelect.value = 'todos';
    if (prioridadeSelect) prioridadeSelect.value = 'todos';
    
    filtrarManutencoes();
}

// ==================== FUNÇÕES DE AÇÃO ====================
function verDetalhesManutencao(id) {
    let manutencoes = [];
    try {
        const stored = localStorage.getItem('manutencoes_registros');
        if (stored) manutencoes = JSON.parse(stored);
    } catch(e) {
        console.error('Erro ao carregar manutenções:', e);
    }
    
    const manutencao = manutencoes.find(m => m.id === id);
    if (!manutencao) {
        mostrarMensagemToastManutencao('❌ Manutenção não encontrada!', true);
        return;
    }
    
    const modal = document.createElement('div');
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 100000; display: flex; justify-content: center; align-items: center; cursor: pointer;`;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `background: white; max-width: 600px; width: 90%; max-height: 80%; overflow-y: auto; border-radius: 12px; padding: 1.5rem; cursor: default;`;
    
    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0;">🔧 Detalhes da Manutenção</h3>
            <button onclick="this.closest('div').parentElement.remove()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">✕</button>
        </div>
        <div><strong>Personagem:</strong> ${manutencao.personagem_nome}</div>
        <div><strong>Data Registro:</strong> ${manutencao.data_registro} às ${manutencao.hora_registro}</div>
        <div><strong>Prioridade:</strong> ${manutencao.prioridade}</div>
        <div><strong>Local do Defeito:</strong> ${manutencao.local_defeito || '-'}</div>
        <div><strong>Status:</strong> ${manutencao.status}</div>
        <div style="margin-top: 1rem;"><strong>Descrição do Defeito:</strong></div>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">${manutencao.descricao}</div>
        ${manutencao.fotos && manutencao.fotos.length > 0 ? `
            <div style="margin-top: 1rem;"><strong>Fotos Anexadas:</strong></div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                ${manutencao.fotos.map(foto => `<img src="${foto}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer;" onclick="window.open('${foto}', '_blank')">`).join('')}
            </div>
        ` : ''}
    `;
    
    modal.appendChild(modalContent);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
}

function editarStatusManutencao(id) {
    let manutencoes = [];
    try {
        const stored = localStorage.getItem('manutencoes_registros');
        if (stored) manutencoes = JSON.parse(stored);
    } catch(e) {
        console.error('Erro ao carregar manutenções:', e);
    }
    
    const manutencao = manutencoes.find(m => m.id === id);
    if (!manutencao) {
        mostrarMensagemToastManutencao('❌ Manutenção não encontrada!', true);
        return;
    }
    
    const modal = document.createElement('div');
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 100000; display: flex; justify-content: center; align-items: center;`;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `background: white; max-width: 400px; width: 90%; border-radius: 12px; padding: 1.5rem;`;
    
    modalContent.innerHTML = `
        <h3 style="margin-top: 0;">✏️ Atualizar Status</h3>
        <div><strong>Personagem:</strong> ${manutencao.personagem_nome}</div>
        <div style="margin: 1rem 0;">
            <label>Novo Status:</label>
            <select id="novoStatusManutencao" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 6px; border: 1px solid #ddd;">
                <option value="aguardando" ${manutencao.status === 'aguardando' ? 'selected' : ''}>⏳ Aguardando</option>
                <option value="em_andamento" ${manutencao.status === 'em_andamento' ? 'selected' : ''}>🔧 Em andamento</option>
                <option value="concluida" ${manutencao.status === 'concluida' ? 'selected' : ''}>✅ Concluída</option>
                <option value="cancelada" ${manutencao.status === 'cancelada' ? 'selected' : ''}>❌ Cancelada</option>
            </select>
        </div>
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button onclick="this.closest('div').parentElement.parentElement.remove()" style="padding: 8px 16px; border-radius: 6px; border: 1px solid #ddd; background: #f8f9fa; cursor: pointer;">Cancelar</button>
            <button onclick="atualizarStatusManutencao('${id}')" style="padding: 8px 16px; border-radius: 6px; background: #28a745; color: white; border: none; cursor: pointer;">Salvar</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function atualizarStatusManutencao(id) {
    const novoStatus = document.getElementById('novoStatusManutencao')?.value;
    if (!novoStatus) return;
    
    let manutencoes = [];
    try {
        const stored = localStorage.getItem('manutencoes_registros');
        if (stored) manutencoes = JSON.parse(stored);
    } catch(e) {
        console.error('Erro ao carregar manutenções:', e);
    }
    
    const index = manutencoes.findIndex(m => m.id === id);
    if (index !== -1) {
        manutencoes[index].status = novoStatus;
        localStorage.setItem('manutencoes_registros', JSON.stringify(manutencoes));
        mostrarMensagemToastManutencao(`✅ Status atualizado para ${novoStatus}`);
        
        const modal = document.querySelector('div[style*="position: fixed"][style*="z-index: 100000"]');
        if (modal) modal.remove();
        
        carregarManutencoes();
    }
}

function exportarManutencoes() {
    let manutencoes = [];
    try {
        const stored = localStorage.getItem('manutencoes_registros');
        if (stored) manutencoes = JSON.parse(stored);
    } catch(e) {
        console.error('Erro ao carregar manutenções:', e);
    }
    
    if (manutencoes.length === 0) {
        mostrarMensagemToastManutencao('❌ Nenhuma manutenção para exportar!', true);
        return;
    }
    
    const headers = ['ID', 'Personagem', 'Descrição', 'Prioridade', 'Local', 'Status', 'Data Registro', 'Hora Registro'];
    const rows = manutencoes.map(m => [
        m.id, m.personagem_nome, m.descricao.replace(/"/g, '""'),
        m.prioridade, m.local_defeito, m.status, m.data_registro, m.hora_registro
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `manutencoes_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    mostrarMensagemToastManutencao('📤 Manutenções exportadas com sucesso!');
}

// ==================== FUNÇÕES AUXILIARES ====================
function gerarID(prefixo) {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = String(data.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefixo}-${ano}${mes}${dia}-${horas}${minutos}${segundos}-${random}`;
}

function mostrarMensagemToastManutencao(mensagem, isError = false) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${isError ? '#dc3545' : '#28a745'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 99999;
        font-size: 14px;
        animation: fadeInOut 3s ease-in-out;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast && toast.remove) toast.remove(); }, 3000);
}

// ==================== INICIALIZAÇÃO ====================
function initManutencaoPage() {
    console.log('🔧 Inicializando página de manutenção...');
    carregarPersonagensManutencao();
}

// Observer para quando as páginas forem ativadas
const observerManutencaoFinal = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target;
            if (target.id === 'cadastrar_manutencao' && target.classList.contains('active')) {
                console.log('📄 Página Cadastro de Manutenção ativada');
                setTimeout(carregarPersonagensManutencao, 200);
            }
            if (target.id === 'lista_de_manutencao' && target.classList.contains('active')) {
                console.log('📄 Página Lista de Manutenção ativada');
                setTimeout(carregarManutencoes, 200);
            }
        }
    });
});

const paginaCadastro = document.getElementById('cadastrar_manutencao');
const paginaLista = document.getElementById('lista_de_manutencao');

if (paginaCadastro) observerManutencaoFinal.observe(paginaCadastro, { attributes: true });
if (paginaLista) observerManutencaoFinal.observe(paginaLista, { attributes: true });

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initManutencaoPage, 300);
        setTimeout(carregarManutencoes, 500);
    });
} else {
    setTimeout(initManutencaoPage, 300);
    setTimeout(carregarManutencoes, 500);
}
// ==================== SCRIPT PARA FOTOS DA MANUTENÇÃO (CORRIGIDO) ====================
(function() {
    console.log('📸 Inicializando sistema de fotos para manutenção...');
    
    // Função para mostrar mensagem toast (definida localmente)
    function mostrarToast(mensagem, isError = false) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${isError ? '#dc3545' : '#28a745'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 99999;
            font-size: 14px;
            animation: fadeInOut 3s ease-in-out;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        toast.textContent = mensagem;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast && toast.remove) toast.remove();
        }, 3000);
    }
    
    // Função principal para preview das fotos
    window.previewFotosDefeito = function() {
        console.log('📸 previewFotosDefeito chamado');
        
        const input = document.getElementById('fotos_defeito');
        const previewContainer = document.getElementById('previewFotos');
        const previewWrapper = document.getElementById('previewFotosContainer');
        
        if (!input) {
            console.error('❌ Input fotos_defeito não encontrado');
            return;
        }
        
        if (!previewContainer) {
            console.error('❌ Container previewFotos não encontrado');
            return;
        }
        
        const files = input.files;
        console.log(`📁 ${files.length} arquivo(s) selecionado(s)`);
        
        if (!files || files.length === 0) {
            if (previewWrapper) previewWrapper.style.display = 'none';
            previewContainer.innerHTML = '';
            return;
        }
        
        // Mostrar o container de preview
        if (previewWrapper) previewWrapper.style.display = 'block';
        previewContainer.innerHTML = '';
        
        // Processar cada arquivo
        Array.from(files).forEach((file, index) => {
            console.log(`📄 Processando arquivo ${index + 1}: ${file.name}`);
            
            if (!file.type.startsWith('image/')) {
                mostrarToast(`❌ "${file.name}" não é uma imagem!`, true);
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                mostrarToast(`❌ "${file.name}" excede 5MB!`, true);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const div = document.createElement('div');
                div.style.cssText = `
                    position: relative;
                    width: 100px;
                    height: 100px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #f8f9fa;
                    transition: transform 0.2s;
                `;
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    cursor: pointer;
                `;
                img.onclick = function() {
                    ampliarFoto(e.target.result);
                };
                
                const btnRemove = document.createElement('button');
                btnRemove.innerHTML = '✕';
                btnRemove.style.cssText = `
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 22px;
                    height: 22px;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                `;
                btnRemove.onclick = function(e) {
                    e.stopPropagation();
                    div.remove();
                    // Verificar se ainda tem fotos
                    if (previewContainer.children.length === 0) {
                        if (previewWrapper) previewWrapper.style.display = 'none';
                        input.value = '';
                    }
                    mostrarToast('🗑️ Foto removida');
                };
                
                div.appendChild(img);
                div.appendChild(btnRemove);
                previewContainer.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
        
        mostrarToast(`✅ ${files.length} foto(s) anexada(s)`);
    };
    
    // Função para ampliar foto
    function ampliarFoto(dataUrl) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 100000;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 0 30px rgba(0,0,0,0.5);
        `;
        
        const btnFechar = document.createElement('button');
        btnFechar.innerHTML = '✕';
        btnFechar.style.cssText = `
            position: absolute;
            top: 20px;
            right: 30px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
            font-weight: bold;
        `;
        
        modal.appendChild(img);
        modal.appendChild(btnFechar);
        
        modal.onclick = function(e) {
            if (e.target === modal) modal.remove();
        };
        
        btnFechar.onclick = function() {
            modal.remove();
        };
        
        document.body.appendChild(modal);
    }
    
    // Função para limpar as fotos
    window.limparFotosManutencao = function() {
        const input = document.getElementById('fotos_defeito');
        const previewContainer = document.getElementById('previewFotos');
        const previewWrapper = document.getElementById('previewFotosContainer');
        
        if (input) input.value = '';
        if (previewContainer) previewContainer.innerHTML = '';
        if (previewWrapper) previewWrapper.style.display = 'none';
        
        console.log('🧹 Fotos limpas');
        mostrarToast('🧹 Fotos removidas');
    };
    
    // Configurar o input de fotos
    function configurarInputFotos() {
        const input = document.getElementById('fotos_defeito');
        if (input) {
            // Remover listeners antigos para evitar duplicação
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            newInput.addEventListener('change', window.previewFotosDefeito);
            console.log('✅ Evento change configurado no input de fotos');
            
            // Atualizar referência global
            window.fotosDefeitoInput = newInput;
        } else {
            console.log('⚠️ Input fotos_defeito não encontrado, tentando novamente...');
            setTimeout(configurarInputFotos, 500);
        }
    }
    
    // Botão de selecionar fotos
    function configurarBotaoSelecionarFotos() {
        const btnSelecionar = document.querySelector('button[onclick*="fotos_defeito"]');
        if (btnSelecionar) {
            btnSelecionar.onclick = function() {
                const input = document.getElementById('fotos_defeito');
                if (input) input.click();
            };
            console.log('✅ Botão de selecionar fotos configurado');
        }
        
        // Também configurar clique na área de drag & drop
        const dropArea = document.querySelector('#cadastrar_manutencao .form-group div[style*="border: 2px dashed"]');
        if (dropArea && !dropArea.hasAttribute('data-click-configured')) {
            dropArea.style.cursor = 'pointer';
            dropArea.onclick = function() {
                const input = document.getElementById('fotos_defeito');
                if (input) input.click();
            };
            dropArea.setAttribute('data-click-configured', 'true');
            console.log('✅ Área de drop configurada');
        }
    }
    
    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(configurarInputFotos, 500);
            setTimeout(configurarBotaoSelecionarFotos, 600);
        });
    } else {
        setTimeout(configurarInputFotos, 500);
        setTimeout(configurarBotaoSelecionarFotos, 600);
    }
    
    // Observer para quando a página de manutenção for ativada
    const observerFotos = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.id === 'cadastrar_manutencao' && target.classList.contains('active')) {
                    console.log('📄 Página Manutenção ativada - configurando fotos...');
                    setTimeout(configurarInputFotos, 200);
                    setTimeout(configurarBotaoSelecionarFotos, 300);
                }
            }
        });
    });
    
    const paginaManutencaoFoto = document.getElementById('cadastrar_manutencao');
    if (paginaManutencaoFoto) {
        observerFotos.observe(paginaManutencaoFoto, { attributes: true });
    }
    
    console.log('✅ Script de fotos da manutenção carregado!');
})();

// ==================== FUNÇÃO PARA SALVAR MANUTENÇÃO COM FOTOS ====================
async function salvarRegistroManutencao() {
    console.log('🔧 Salvando registro de manutenção...');
    
    // Validar campos obrigatórios
    const personagemSelect = document.getElementById('personagem_manutencao');
    const personagemId = personagemSelect ? personagemSelect.value : null;
    const descricao = document.getElementById('descricao_defeito')?.value || '';
    const prioridade = document.getElementById('prioridade_manutencao')?.value || '';
    
    if (!personagemId) {
        mostrarMensagemToastManutencao('❌ Selecione um personagem!', true);
        return;
    }
    
    if (!descricao.trim()) {
        mostrarMensagemToastManutencao('❌ Descreva o defeito!', true);
        document.getElementById('descricao_defeito').focus();
        return;
    }
    
    if (!prioridade) {
        mostrarMensagemToastManutencao('❌ Selecione a prioridade!', true);
        return;
    }
    
    // Buscar dados do personagem
    let personagens = [];
    try {
        const stored = localStorage.getItem('personagens');
        if (stored) personagens = JSON.parse(stored);
        if (personagens.length === 0) {
            const stored2 = localStorage.getItem('personagens_cadastrados');
            if (stored2) personagens = JSON.parse(stored2);
        }
    } catch(e) {
        console.error('Erro ao carregar personagens:', e);
    }
    
    const personagem = personagens.find(p => {
        const id = p.id || p.ID_personagens || p.ID;
        return id == personagemId;
    });
    const nomePersonagem = personagem ? (personagem.nome_personagens || personagem.nome || 'Desconhecido') : 'Desconhecido';
    
    // Coletar fotos do input
    const fotosInput = document.getElementById('fotos_defeito');
    let fotos = [];
    
    if (fotosInput && fotosInput.files && fotosInput.files.length > 0) {
        console.log(`📸 Processando ${fotosInput.files.length} foto(s)...`);
        
        for (let i = 0; i < fotosInput.files.length && i < 5; i++) {
            const file = fotosInput.files[i];
            if (file.type.startsWith('image/')) {
                try {
                    const fotoBase64 = await lerArquivoComoBase64(file);
                    fotos.push(fotoBase64);
                    console.log(`✅ Foto ${i + 1} convertida com sucesso`);
                } catch(error) {
                    console.error(`Erro ao converter foto ${i + 1}:`, error);
                }
            }
        }
    }
    
    console.log(`📸 Total de fotos anexadas: ${fotos.length}`);
    
    // Gerar ID da manutenção
    const idManutencao = gerarID('MANUT');
    const dataAtual = new Date();
    const dataRegistro = dataAtual.toLocaleDateString('pt-BR');
    const horaRegistro = dataAtual.toLocaleTimeString('pt-BR');
    
    // Criar objeto de manutenção
    const manutencao = {
        id: idManutencao,
        personagem_id: personagemId,
        personagem_nome: nomePersonagem,
        descricao: descricao.trim(),
        prioridade: prioridade,
        local_defeito: document.getElementById('local_defeito')?.value || '',
        status: 'aguardando',
        data_registro: dataRegistro,
        hora_registro: horaRegistro,
        data_completa: dataAtual.toISOString(),
        fotos: fotos,
        observacoes: ''
    };
    
    // Salvar no localStorage
    let manutencoes = [];
    try {
        const stored = localStorage.getItem('manutencoes_registros');
        if (stored) manutencoes = JSON.parse(stored);
    } catch(e) {
        console.error('Erro ao carregar manutenções:', e);
    }
    
    manutencoes.unshift(manutencao);
    localStorage.setItem('manutencoes_registros', JSON.stringify(manutencoes));
    
    console.log('✅ Manutenção salva:', manutencao);
    mostrarMensagemToastManutencao(`✅ Manutenção registrada com ${fotos.length} foto(s)!`);
    
    // Limpar formulário
    limparFormularioManutencao();
}

// Função auxiliar para ler arquivo como Base64
function lerArquivoComoBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// ==================== FUNÇÃO PARA LIMPAR FORMULÁRIO ====================
function limparFormularioManutencao() {
    console.log('🧹 Limpando formulário de manutenção');
    
    const personagemSelect = document.getElementById('personagem_manutencao');
    if (personagemSelect) personagemSelect.value = '';
    
    const descricao = document.getElementById('descricao_defeito');
    if (descricao) descricao.value = '';
    
    const prioridade = document.getElementById('prioridade_manutencao');
    if (prioridade) prioridade.value = '';
    
    const localDefeito = document.getElementById('local_defeito');
    if (localDefeito) localDefeito.value = '';
    
    // Limpar fotos
    const fotosInput = document.getElementById('fotos_defeito');
    if (fotosInput) fotosInput.value = '';
    
    const previewContainer = document.getElementById('previewFotos');
    const previewWrapper = document.getElementById('previewFotosContainer');
    if (previewContainer) previewContainer.innerHTML = '';
    if (previewWrapper) previewWrapper.style.display = 'none';
    
    // Limpar informações do personagem
    const fotoImg = document.getElementById('fotoPersonagemManutencao');
    const semFotoSpan = document.getElementById('semFotoManutencao');
    const infoDiv = document.getElementById('infoPersonagemManutencao');
    
    if (fotoImg) {
        fotoImg.style.display = 'none';
        fotoImg.src = '';
    }
    if (semFotoSpan) semFotoSpan.style.display = 'block';
    if (infoDiv) infoDiv.style.display = 'none';
    
    mostrarMensagemToastManutencao('🧹 Formulário limpo!');
}

// ==================== OBSERVER PARA PÁGINA DE MANUTENÇÃO ====================
const observerManutencaoPaginas = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target;
            if (target.id === 'cadastrar_manutencao' && target.classList.contains('active')) {
                console.log('📄 Página Cadastro de Manutenção ativada');
                setTimeout(carregarPersonagensManutencao, 200);
            }
            if (target.id === 'lista_de_manutencao' && target.classList.contains('active')) {
                console.log('📄 Página Lista de Manutenção ativada');
                setTimeout(carregarManutencoes, 200);
            }
        }
    });
});

const paginaCadastroManut = document.getElementById('cadastrar_manutencao');
const paginaListaManut = document.getElementById('lista_de_manutencao');

if (paginaCadastroManut) observerManutencaoPaginas.observe(paginaCadastroManut, { attributes: true });
if (paginaListaManut) observerManutencaoPaginas.observe(paginaListaManut, { attributes: true });

// ==================== INICIALIZAÇÃO ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(carregarPersonagensManutencao, 300);
        setTimeout(carregarManutencoes, 500);
    });
} else {
    setTimeout(carregarPersonagensManutencao, 300);
    setTimeout(carregarManutencoes, 500);
}

console.log('✅ Arquivo manutencao.js carregado com sistema de fotos corrigido!');
// ==================== EXPORTAR FUNÇÕES ====================
window.carregarPersonagensManutencao = carregarPersonagensManutencao;
window.carregarFotoPersonagemManutencao = carregarFotoPersonagemManutencao;
window.initManutencaoPage = initManutencaoPage;
window.salvarRegistroManutencao = salvarRegistroManutencao;
window.limparFormularioManutencao = limparFormularioManutencao;
window.carregarManutencoes = carregarManutencoes;
window.filtrarManutencoes = filtrarManutencoes;
window.resetarFiltrosManutencao = resetarFiltrosManutencao;
window.verDetalhesManutencao = verDetalhesManutencao;
window.editarStatusManutencao = editarStatusManutencao;
window.exportarManutencoes = exportarManutencoes;
window.mostrarMensagemToastManutencao = mostrarMensagemToastManutencao;

console.log('✅ Arquivo manutencao.js carregado e configurado!');