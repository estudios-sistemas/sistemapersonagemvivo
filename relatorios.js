// ==================== RELATORIOS-EQUIPE.JS - VERSÃO CORRIGIDA ====================

console.log('📊 relatorios.js carregado!');

// ==================== FUNÇÃO PRINCIPAL PARA CARREGAR RELATÓRIOS ====================

function carregarRelatorio(pageId) {
    console.log('📄 Carregando relatório:', pageId);
    
    // Captura a seção correta (relatorio_equipe ou relatorio_financeiro)
    const container = document.getElementById(pageId);
    if (!container) {
        console.error('❌ Container não encontrado:', pageId);
        return;
    }
    
    const titulos = {
        'relatorio_eventos': '📊 Relatório de Eventos',
        'relatorio_clientes': '👤 Relatório de Clientes',
        'relatorio_personagens': '🦸 Catálogo de Personagens',
        'relatorio_casas_de_festa': '🏠 Relatório de Casas de Festa',
        'relatorio_checklist': '📋 Relatório de Checklist',
        'relatorio_equipe': '👥 Relatório de Equipe',
        'relatorio_financeiro': '💰 Relatório Financeiro'
    };
    
    const titulo = titulos[pageId] || '📊 Relatório';
    
    // Cria o esqueleto do card específico com um ID dinâmico único e limpo
    container.innerHTML = `
        <div class="card">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <h2 style="margin: 0;">${titulo}</h2>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn primary" onclick="exportarRelatorioAtual('${pageId}')">📤 Exportar</button>
                    <button class="btn" onclick="imprimirRelatorioAtual('${pageId}')">🖨️ Imprimir</button>
                </div>
            </div>
            <div class="card-body">
                <div id="conteudoRelatorio_${pageId}">
                    <div style="text-align: center; padding: 2rem;">
                        <div>🔄 Carregando dados...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        carregarDadosEspecificos(pageId);
    }, 100);
}

function carregarDadosEspecificos(pageId) {
    console.log('📊 Carregando dados específicos para:', pageId);
    
    const conteudoDiv = document.getElementById(`conteudoRelatorio_${pageId}`);
    if (!conteudoDiv) return;
    
    switch(pageId) {
        case 'relatorio_eventos':
            if (typeof carregarRelatorioEventos === 'function') carregarRelatorioEventos(conteudoDiv);
            break;
        case 'relatorio_clientes':
            if (typeof carregarRelatorioClientes === 'function') carregarRelatorioClientes(conteudoDiv);
            break;
        case 'relatorio_personagens':
            if (typeof carregarRelatorioPersonagens === 'function') carregarRelatorioPersonagens(conteudoDiv);
            break;
        case 'relatorio_casas_de_festa':
            if (typeof carregarRelatorioCasasFesta === 'function') carregarRelatorioCasasFesta(conteudoDiv);
            break;
        case 'relatorio_checklist':
            if (typeof carregarRelatorioChecklist === 'function') carregarRelatorioChecklist(conteudoDiv);
            break;
        case 'relatorio_equipe':
            // Certifique-se de que a função da equipe recebe este sub-container limpo
            if (typeof carregarRelatorioEquipe === 'function') {
                carregarRelatorioEquipe(conteudoDiv);
            }
            break;
        case 'relatorio_financeiro':
            // Chama o módulo financeiro que unificamos
            if (typeof carregarRelatorioFinanceiroUnificado === 'function') {
                carregarRelatorioFinanceiroUnificado(conteudoDiv);
            }
            break;
        default:
            conteudoDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999;">Relatório em desenvolvimento</div>';
    }
}
function visualizarChecklistModal(checklistId) {
    const checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const checklist = checklists.find(c => c.id == checklistId);
    if (!checklist) { mostrarMensagemToast('❌ Checklist não encontrado!', true); return; }
    
    const personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
    const personagem = personagens.find(p => p.id == checklist.personagemId || p.ID_personagens == checklist.personagemId);
    const fotoPersonagem = personagem?.foto || personagem?.foto_personagem || '';
    
    let itensHtml = '';
    if (checklist.itens && checklist.itens.length > 0) {
        checklist.itens.forEach((item, idx) => {
            itensHtml += `<div style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${idx+1}.</strong> ${escapeHtml(item.nome || item.item || '-')} - Qtd: ${item.quantidade || 1} - ${item.concluido ? '✅ Concluído' : '⏳ Pendente'}</div>`;
        });
    } else {
        itensHtml = '<div style="text-align:center;padding:20px;">Nenhum item cadastrado</div>';
    }
    
    const modalHtml = `
        <div id="modalChecklistVisualizar" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;">
            <div style="background:white;border-radius:12px;max-width:600px;width:90%;max-height:80vh;overflow:auto;">
                <div style="padding:15px 20px;border-bottom:2px solid #28a745;background:#f8f9fa;display:flex;justify-content:space-between;">
                    <h2 style="margin:0;color:#28a745;">📋 ${escapeHtml(checklist.nome)}</h2>
                    <button onclick="document.getElementById('modalChecklistVisualizar').remove()" style="background:none;border:none;font-size:24px;">&times;</button>
                    <button class="btn small" onclick="visualizarChecklistModal('${checklistId}')" style="background: #17a2b8; color: white;">👁️ Visualizar</button>

                </div>
                <div style="padding:20px;">
                    <div style="display:flex;gap:20px;margin-bottom:20px;">
                        ${fotoPersonagem ? `<img src="${fotoPersonagem}" style="width:80px;height:80px;object-fit:cover;border-radius:50%;">` : '<div style="width:80px;height:80px;background:#eee;border-radius:50%;display:flex;align-items:center;justify-content:center;">🎭</div>'}
                        <div>
                            <p><strong>Personagem:</strong> ${escapeHtml(checklist.personagemNome || '-')}</p>
                            <p><strong>Descrição:</strong> ${escapeHtml(checklist.descricao || '-')}</p>
                            <p><strong>Data:</strong> ${formatarData(checklist.dataCriacao)}</p>
                            <p><strong>Status:</strong> ${checklist.status || 'Pendente'}</p>
                        </div>
                    </div>
                    <h3>Itens do Checklist</h3>
                    ${itensHtml}
                </div>
                <div style="padding:15px;background:#f8f9fa;text-align:right;">
                    <button onclick="gerarPDFChecklistComFoto('${checklistId}'); document.getElementById('modalChecklistVisualizar').remove();" style="background:#28a745;color:white;border:none;padding:8px 16px;border-radius:4px;">📄 Gerar PDF</button>
                    <button onclick="document.getElementById('modalChecklistVisualizar').remove()" style="background:#6c757d;color:white;border:none;padding:8px 16px;border-radius:4px;">Fechar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function gerarPDFChecklistComFoto(checklistId) {
    const checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const checklist = checklists.find(c => c.id == checklistId);
    if (!checklist) { mostrarMensagemToast('❌ Checklist não encontrado!', true); return; }
    
    const personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
    const personagem = personagens.find(p => p.id == checklist.personagemId || p.ID_personagens == checklist.personagemId);
    const fotoPersonagem = personagem?.foto || personagem?.foto_personagem || '';
    
    let itensTable = '';
    if (checklist.itens && checklist.itens.length > 0) {
        checklist.itens.forEach((item, idx) => {
            itensTable += `<tr><td>${idx+1}</td><td>${escapeHtml(item.nome || item.item || '-')}</td><td>${escapeHtml(item.categoria || '-')}</td><td>${item.quantidade || 1}</td><td>${item.concluido ? '✅ Concluído' : '⏳ Pendente'}</td></tr>`;
        });
    }
    
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Checklist ${checklist.nome}</title>
        <style>body{font-family:Arial;margin:40px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:10px}th{background:#f2f2f2}.header{text-align:center;border-bottom:2px solid #28a745}.info{display:flex;gap:20px;background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0}.foto{width:100px;height:100px;object-fit:cover;border-radius:50%}</style>
        </head><body><div class="header"><h1>📋 ${escapeHtml(checklist.nome)}</h1><p>Checklist de itens e materiais</p></div>
        <div class="info">${fotoPersonagem ? `<img src="${fotoPersonagem}" class="foto">` : '<div style="width:100px;height:100px;background:#eee;border-radius:50%;text-align:center;line-height:100px;">🎭</div>'}
        <div><p><strong>Personagem:</strong> ${escapeHtml(checklist.personagemNome || '-')}</p><p><strong>Descrição:</strong> ${escapeHtml(checklist.descricao || '-')}</p><p><strong>Data Criação:</strong> ${formatarData(checklist.dataCriacao)}</p><p><strong>Status:</strong> ${checklist.status || 'Pendente'}</p></div></div>
        <h3>Lista de Itens</h3><table><thead><tr><th>#</th><th>Item</th><th>Categoria</th><th>Qtd</th><th>Status</th></tr></thead><tbody>${itensTable}</tbody></table>
        <div style="text-align:center;margin-top:30px;font-size:12px;color:#666;">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
        </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
}


// ==================== FUNÇÃO PARA CALCULAR COR DO STATUS POR DATA ====================

function getStatusColorByDate(dataEvento) {
    if (!dataEvento) return 'status-azul'; // Mais de 5 dias (padrão)
    
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        let dataEventoObj;
        if (dataEvento.includes('-')) {
            const [ano, mes, dia] = dataEvento.split('-');
            dataEventoObj = new Date(ano, mes - 1, dia);
        } else if (dataEvento.includes('/')) {
            const [dia, mes, ano] = dataEvento.split('/');
            dataEventoObj = new Date(ano, mes - 1, dia);
        } else {
            dataEventoObj = new Date(dataEvento);
        }
        dataEventoObj.setHours(0, 0, 0, 0);
        
        const diffTime = dataEventoObj - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Classificação por dias
        if (diffDays < 0) return 'status-cinza'; // Finalizado (passou)
        if (diffDays === 0) return 'status-verde'; // Dia do evento
        if (diffDays === 1) return 'status-vermelho'; // 1 dia
        if (diffDays >= 2 && diffDays <= 4) return 'status-amarelo'; // 2 a 4 dias
        return 'status-azul'; // Mais de 5 dias
    } catch(e) {
        return 'status-azul';
    }
}

function getStatusStyleClass(dataEvento, statusEvento) {
    // Se o evento estiver finalizado ou cancelado, usa cinza
    const statusLower = (statusEvento || '').toLowerCase();
    if (statusLower === 'finalizado' || statusLower === 'cancelado') {
        return 'status-cinza';
    }
    return getStatusColorByDate(dataEvento);
}

// ==================== RELATÓRIO DE EVENTOS (COM CORES POR DATA) ====================

function carregarRelatorioEventos(container) {
    let eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    if (eventos.length === 0) eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    
    console.log('📊 Eventos encontrados:', eventos.length);
    
    // Adicionar CSS para os status
    const styleId = 'statusEventosStyle';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .status-cinza { background-color: #6c757d; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
            .status-verde { background-color: #28a745; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
            .status-vermelho { background-color: #dc3545; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
            .status-amarelo { background-color: #ffc107; color: #333; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
            .status-azul { background-color: #007bff; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
        `;
        document.head.appendChild(style);
    }
    
    if (eventos.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
                <h3>Nenhum evento cadastrado</h3>
                <p>Cadastre eventos na seção "Reservar Evento" para visualizá-los aqui.</p>
                <button class="btn primary" onclick="showPage('reservar_evento')">➕ Reservar Evento</button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <input type="text" id="buscarEventoRel" placeholder="🔍 Buscar evento..." 
                           style="padding: 8px; width: 250px; border: 1px solid #ddd; border-radius: 4px;" 
                           onkeyup="filtrarTabelaRelatorio('tabelaEventosRel', this)">
                    <select id="filtroStatusEventoRel" onchange="filtrarTabelaRelatorio('tabelaEventosRel', document.getElementById('buscarEventoRel'))" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="todos">📋 Todos os status</option>
                        <option value="reservado">📌 Reservado</option>
                        <option value="confirmado">✅ Confirmado</option>
                        <option value="finalizado">🏁 Finalizado</option>
                        <option value="cancelado">❌ Cancelado</option>
                    </select>
                </div>
            </div>
            <table class="tabela-relatorio" id="tabelaEventosRel" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Data</th>
                        <th style="padding: 10px; text-align: left;">Cliente</th>
                        <th style="padding: 10px; text-align: left;">Local</th>
                        <th style="padding: 10px; text-align: left;">Personagens</th>
                        <th style="padding: 10px; text-align: left;">Valor</th>
                        <th style="padding: 10px; text-align: left;">Status Evento</th>
                        <th style="padding: 10px; text-align: left;">Prazo</th>
                        <th style="padding: 10px; text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    eventos.forEach((evento, index) => {
        const eventoId = evento.id || evento.ID_eventos || index;
        const statusEvento = evento.status_evento || evento.status || 'Reservado';
        const dataEvento = evento.data_evento || evento.data || '';
        const dataFormatada = formatarData(dataEvento);
        
        // Determinar classe de cor baseada na data
        const statusClass = getStatusStyleClass(dataEvento, statusEvento);
        
        // Texto do prazo
        let prazoTexto = getPrazoTexto(dataEvento);
        
        html += `
            <tr data-id="${eventoId}" data-status="${statusEvento}">
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${dataFormatada}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${evento.cliente_nome || evento.cliente || evento.nome_cliente_evento || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${evento.local || evento.nome_local_evento || evento.casa_festa || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${evento.personagens ? (Array.isArray(evento.personagens) ? evento.personagens.join(', ') : evento.personagens) : '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">R$ ${(parseFloat(evento.valor_total || evento.valor || 0)).toFixed(2).replace('.', ',')}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><span class="badge ${getStatusBadgeClass(statusEvento)}">${statusEvento}</span></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><span class="${statusClass}">${prazoTexto}</span></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    <button class="btn small" onclick="editarEvento('${eventoId}')" style="background: #ffc107; color: #333; margin-right: 5px;">✏️ Editar</button>
                    <button class="btn small" onclick="excluirEvento('${eventoId}')" style="background: #dc3545; color: white;">🗑️ Excluir</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; text-align: right;">
            <small>Total: ${eventos.length} eventos</small>
        </div>
    `;
    
    container.innerHTML = html;
}

// Função para obter texto do prazo
function getPrazoTexto(dataEvento) {
    if (!dataEvento) return '📅 Sem data';
    
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        let dataEventoObj;
        if (dataEvento.includes('-')) {
            const [ano, mes, dia] = dataEvento.split('-');
            dataEventoObj = new Date(ano, mes - 1, dia);
        } else if (dataEvento.includes('/')) {
            const [dia, mes, ano] = dataEvento.split('/');
            dataEventoObj = new Date(ano, mes - 1, dia);
        } else {
            dataEventoObj = new Date(dataEvento);
        }
        dataEventoObj.setHours(0, 0, 0, 0);
        
        const diffTime = dataEventoObj - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return '🏁 Finalizado';
        if (diffDays === 0) return '🎉 HOJE!';
        if (diffDays === 1) return '⚠️ Amanhã!';
        if (diffDays <= 4) return `⏰ Em ${diffDays} dias`;
        return `📅 Em ${diffDays} dias`;
    } catch(e) {
        return '📅 Data inválida';
    }
}

// ==================== RELATÓRIO DE CLIENTES ====================

function carregarRelatorioClientes(container) {
    let clientes = JSON.parse(localStorage.getItem('clientes_cadastrados') || '[]');
    if (clientes.length === 0) clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    
    console.log('📊 Clientes encontrados:', clientes.length);
    
    if (clientes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
                <h3>Nenhum cliente cadastrado</h3>
                <p>Cadastre clientes na seção "Clientes" para visualizá-los aqui.</p>
                <button class="btn primary" onclick="showPage('clientes')">➕ Cadastrar Cliente</button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <div style="margin-bottom: 1rem;">
                <input type="text" id="buscarClienteRel" placeholder="🔍 Buscar cliente..." 
                       style="padding: 8px; width: 100%; max-width: 300px; border: 1px solid #ddd; border-radius: 4px;" 
                       onkeyup="filtrarTabelaRelatorio('tabelaClientesRel', this)">
            </div>
            <table class="tabela-relatorio" id="tabelaClientesRel" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">ID</th>
                        <th style="padding: 10px; text-align: left;">Nome</th>
                        <th style="padding: 10px; text-align: left;">Documento</th>
                        <th style="padding: 10px; text-align: left;">Telefone</th>
                        <th style="padding: 10px; text-align: left;">Email</th>
                        <th style="padding: 10px; text-align: left;">Cadastro</th>
                        <th style="padding: 10px; text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    clientes.forEach((cliente, index) => {
        const clienteId = cliente.id || cliente.ID_clientes || index;
        
        html += `
            <tr data-id="${clienteId}">
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${cliente.id || cliente.ID_clientes || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${cliente.nome_clientes || cliente.nome || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatarDocumento(cliente.doc_clientes_cadastros_cpf || cliente.doc_clientes_cadastros_cnpj || '')}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${cliente.telefone_cliente || cliente.telefone || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${cliente.email_cliente || cliente.email || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatarData(cliente.dataCadastro)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    <button class="btn small" onclick="editarCliente('${clienteId}')" style="background: #ffc107; color: #333; margin-right: 5px;">✏️ Editar</button>
                    <button class="btn small" onclick="excluirCliente('${clienteId}')" style="background: #dc3545; color: white;">🗑️ Excluir</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; text-align: right;">
            <small>Total: ${clientes.length} clientes</small>
        </div>
    `;
    
    container.innerHTML = html;
}

// ==================== RELATÓRIO DE PERSONAGENS ====================

function carregarRelatorioPersonagens(container) {
    let personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
    if (personagens.length === 0) personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
    
    console.log('📊 Personagens encontrados:', personagens.length);
    
    if (personagens.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🦸</div>
                <h3>Nenhum personagem cadastrado</h3>
                <p>Cadastre personagens na seção "Personagens" para visualizá-los aqui.</p>
                <button class="btn primary" onclick="showPage('personagens')">➕ Cadastrar Personagem</button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <div style="margin-bottom: 1rem;">
                <input type="text" id="buscarPersonagemRel" placeholder="🔍 Buscar personagem..." 
                       style="padding: 8px; width: 100%; max-width: 300px; border: 1px solid #ddd; border-radius: 4px;" 
                       onkeyup="filtrarTabelaRelatorio('tabelaPersonagensRel', this)">
            </div>
            <table class="tabela-relatorio" id="tabelaPersonagensRel" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Foto</th>
                        <th style="padding: 10px; text-align: left;">Nome</th>
                        <th style="padding: 10px; text-align: left;">Figurino</th>
                        <th style="padding: 10px; text-align: left;">Tema</th>
                        <th style="padding: 10px; text-align: left;">Quantidade</th>
                        <th style="padding: 10px; text-align: left;">Valor</th>
                        <th style="padding: 10px; text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    personagens.forEach((p, index) => {
        const personagemId = p.id || p.ID_personagens || index;
        const fotoHtml = p.foto ? `<img src="${p.foto}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : 
                        (p.foto_personagem ? `<img src="${p.foto_personagem}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : 
                        '<span style="color: #999;">📷</span>');
        
        html += `
            <tr data-id="${personagemId}">
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${fotoHtml}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${p.nome_personagens || p.nome || '-'}</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.figurino || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.tema || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.quantidade || '1'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatarValorPersonagemParaExibicao(p.valor_personagens || p.valor || p.valor_hora || 0)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    <button class="btn small" onclick="editarPersonagem('${personagemId}')" style="background: #ffc107; color: #333; margin-right: 5px;">✏️ Editar</button>
                    <button class="btn small" onclick="excluirPersonagem('${personagemId}')" style="background: #dc3545; color: white;">🗑️ Excluir</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; text-align: right;">
            <small>Total: ${personagens.length} personagens</small>
        </div>
    `;
    
    container.innerHTML = html;
}

// ==================== RELATÓRIO DE CASAS DE FESTA ====================

function carregarRelatorioCasasFesta(container) {
    let casas = JSON.parse(localStorage.getItem('casa_de_festas_cadastrados') || '[]');
    
    console.log('📊 Casas de festa encontradas:', casas.length);
    
    if (casas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🏠</div>
                <h3>Nenhuma casa de festa cadastrada</h3>
                <p>Cadastre casas de festa na seção "Casa de Festas" para visualizá-las aqui.</p>
                <button class="btn primary" onclick="showPage('casa_de_festas')">➕ Cadastrar Casa</button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <div style="margin-bottom: 1rem;">
                <input type="text" id="buscarCasaRel" placeholder="🔍 Buscar casa..." 
                       style="padding: 8px; width: 100%; max-width: 300px; border: 1px solid #ddd; border-radius: 4px;" 
                       onkeyup="filtrarTabelaRelatorio('tabelaCasasRel', this)">
            </div>
            <table class="tabela-relatorio" id="tabelaCasasRel" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">ID</th>
                        <th style="padding: 10px; text-align: left;">Nome</th>
                        <th style="padding: 10px; text-align: left;">Telefone</th>
                        <th style="padding: 10px; text-align: left;">Endereço</th>
                        <th style="padding: 10px; text-align: left;">Cidade</th>
                        <th style="padding: 10px; text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    casas.forEach((casa, index) => {
        const casaId = casa.id || casa.ID_casa_de_festas || index;
        
        html += `
            <tr data-id="${casaId}">
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${casa.id || casa.ID_casa_de_festas || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${casa.nome_casa_de_festas || casa.nome || '-'}</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${casa.telefone_casa_de_festas || casa.telefone || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${casa.logradouro_casa_de_festas || ''} ${casa.numero_casa_de_festas || ''}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${casa.cidade_casa_de_festas || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    <button class="btn small" onclick="editarCasaFesta('${casaId}')" style="background: #ffc107; color: #333; margin-right: 5px;">✏️ Editar</button>
                    <button class="btn small" onclick="excluirCasaFesta('${casaId}')" style="background: #dc3545; color: white;">🗑️ Excluir</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; text-align: right;">
            <small>Total: ${casas.length} casas de festa</small>
        </div>
    `;
    
    container.innerHTML = html;
}


// ==================== RELATÓRIO DE CHECKLIST (COM VISUALIZAR, PDF E EDITAR) ====================

function carregarRelatorioChecklist(container) {
    console.log('📋 Carregando relatório de checklist...');
    
    let checklists = [];
    try {
        const stored = localStorage.getItem('checklists_cadastrados');
        if (stored) checklists = JSON.parse(stored);
    } catch(e) { 
        checklists = []; 
    }
    
    // Adicionar CSS para o modal
    const styleId = 'checklistModalStyle';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .modal-checklist {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-checklist-content {
                background: white;
                border-radius: 12px;
                max-width: 700px;
                width: 90%;
                max-height: 85vh;
                overflow: auto;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }
            .checklist-foto {
                width: 100px;
                height: 100px;
                object-fit: cover;
                border-radius: 50%;
                border: 3px solid #28a745;
            }
            .checklist-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                border-bottom: 1px solid #eee;
            }
            .checklist-item:hover {
                background: #f8f9fa;
            }
            .item-concluido {
                color: #28a745;
                font-weight: bold;
            }
            .item-pendente {
                color: #dc3545;
                font-weight: bold;
            }
            .badge-pendente { background-color: #ffc107; color: #333; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
            .badge-ativo { background-color: #28a745; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
            .badge-desativado { background-color: #dc3545; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
            .btn.small { padding: 5px 10px; font-size: 12px; border: none; border-radius: 4px; cursor: pointer; margin: 2px; }
            .table-container { overflow-x: auto; }
            .tabela-relatorio { width: 100%; border-collapse: collapse; }
        `;
        document.head.appendChild(style);
    }
    
    if (checklists.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 3rem;">📋</div>
                <h3>Nenhum checklist criado</h3>
                <button class="btn primary" onclick="showPage('criar_checklist')">➕ Criar Checklist</button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-container">
            <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <input type="text" id="buscarChecklistRel" placeholder="🔍 Buscar checklist..." style="padding: 8px; width: 250px; border: 1px solid #ddd; border-radius: 4px;" onkeyup="filtrarTabelaRelatorio('tabelaChecklistRel', this)">
                    <select id="filtroStatusChecklistRel" onchange="filtrarTabelaRelatorio('tabelaChecklistRel', document.getElementById('buscarChecklistRel'))" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="todos">📋 Todos</option>
                        <option value="pendente">⏳ Pendente</option>
                        <option value="ativo">✅ Ativo</option>
                        <option value="desativado">❌ Desativado</option>
                    </select>
                </div>
                <div>
                    <button class="btn" onclick="gerarPDFListaChecklists()" style="background: #dc3545; color: white;">📄 PDF da Lista</button>
                </div>
            </div>
            <table class="tabela-relatorio" id="tabelaChecklistRel">
                <thead><tr style="background:#f8f9fa;"><th>Nome</th><th>Personagem</th><th>Itens</th><th>Data</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
    `;
    
    for (let i = 0; i < checklists.length; i++) {
        const c = checklists[i];
        const checklistId = c.id || i;
        const dataFormatada = formatarData(c.dataCriacao);
        
        html += `
            <tr data-id="${checklistId}" data-status="${c.status || 'pendente'}">
                <td style="padding: 8px;"><strong>${escapeHtml(c.nome || '-')}</strong></td>
                <td style="padding: 8px;">${escapeHtml(c.personagemNome || '-')}</td>
                <td style="padding: 8px; text-align: center;">${c.itens ? c.itens.length : 0}</td>
                <td style="padding: 8px;">${dataFormatada}</td>
                <td style="padding: 8px;">
                    <select data-id="${checklistId}" onchange="alterarStatusChecklistRel(this)" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="pendente" ${c.status === 'pendente' || !c.status ? 'selected' : ''}>⏳ Pendente</option>
                        <option value="ativo" ${c.status === 'ativo' ? 'selected' : ''}>✅ Ativo</option>
                        <option value="desativado" ${c.status === 'desativado' ? 'selected' : ''}>❌ Desativado</option>
                    </select>
                </td>
                <td style="padding: 8px; text-align: center;">
                    <button class="btn small" onclick="visualizarChecklistModal('${checklistId}')" style="background: #17a2b8; color: white;">👁️ Visualizar</button>
                    <button class="btn small" onclick="editarChecklistRel('${checklistId}')" style="background: #ffc107; color: #333;">✏️ Editar</button>
                    <button class="btn small" onclick="excluirChecklistRel('${checklistId}')" style="background: #dc3545; color: white;">🗑️ Excluir</button>
                </td>
            </tr>
        `;
    }
    
    html += `</tbody><tr></div><div style="margin-top:1rem;"><small>Total: ${checklists.length} checklists</small></div>`;
    container.innerHTML = html;
}

// ==================== FUNÇÃO EDITAR CHECKLIST (REDIRECIONA COM DADOS) ====================

function editarChecklistRel(checklistId) {
    console.log('✏️ Editando checklist:', checklistId);
    
    // Buscar o checklist no localStorage
    const checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const checklist = checklists.find(c => c.id == checklistId);
    
    if (!checklist) {
        mostrarMensagemToast('❌ Checklist não encontrado!', true);
        return;
    }
    
    // Salvar os dados do checklist no sessionStorage para recuperar na página de cadastro
    sessionStorage.setItem('editarChecklistId', checklistId);
    sessionStorage.setItem('editarChecklistDados', JSON.stringify(checklist));
    
    // Redirecionar para a página de criar checklist
    if (typeof showPage === 'function') {
        showPage('criar_checklist');
        
        // Aguardar a página carregar e preencher os dados
        setTimeout(() => {
            if (typeof preencherChecklistParaEdicao === 'function') {
                preencherChecklistParaEdicao(checklist);
            } else {
                // Se a função específica não existir, tentar preencher diretamente
                preencherFormularioChecklist(checklist);
            }
        }, 200);
    } else {
        alert('Função de navegação não disponível');
    }
}

// ==================== FUNÇÃO PARA PREENCHER O FORMULÁRIO DE CHECKLIST ====================

function preencherFormularioChecklist(checklist) {
    console.log('📝 Preenchendo formulário com dados do checklist:', checklist);
    
    try {
        // Preencher nome do checklist
        const nomeInput = document.getElementById('nomeChecklist');
        if (nomeInput) nomeInput.value = checklist.nome || '';
        
        // Preencher descrição
        const descricaoInput = document.getElementById('descricaoChecklist');
        if (descricaoInput) descricaoInput.value = checklist.descricao || '';
        
        // Preencher personagem selecionado
        const personagemSelect = document.getElementById('personagemChecklist');
        if (personagemSelect && checklist.personagemId) {
            personagemSelect.value = checklist.personagemId;
            // Disparar evento change para carregar itens se necessário
            if (typeof carregarItensPersonagem === 'function') {
                carregarItensPersonagem(checklist.personagemId);
            }
        }
        
        // Preencher status
        const statusSelect = document.getElementById('statusChecklist');
        if (statusSelect && checklist.status) {
            statusSelect.value = checklist.status;
        }
        
        // Preencher itens do checklist
        if (checklist.itens && checklist.itens.length > 0 && typeof adicionarItensNaTabela === 'function') {
            adicionarItensNaTabela(checklist.itens);
        } else if (checklist.itens && checklist.itens.length > 0) {
            // Tentar preencher a tabela de itens manualmente
            preencherTabelaItens(checklist.itens);
        }
        
        // Mostrar mensagem de sucesso
        mostrarMensagemToast('✅ Dados carregados para edição!');
        
    } catch(e) {
        console.error('Erro ao preencher formulário:', e);
        mostrarMensagemToast('⚠️ Dados carregados, mas alguns campos podem precisar ser ajustados manualmente', false);
    }
}

// ==================== FUNÇÃO PARA PREENCHER TABELA DE ITENS ====================

function preencherTabelaItens(itens) {
    console.log('📋 Preenchendo tabela com', itens.length, 'itens');
    
    const tbody = document.querySelector('#tabelaItensChecklist tbody');
    if (!tbody) {
        console.warn('Tabela de itens não encontrada');
        return;
    }
    
    // Limpar tabela existente
    tbody.innerHTML = '';
    
    // Adicionar cada item
    itens.forEach((item, index) => {
        const row = tbody.insertRow();
        
        // Célula do nome do item
        const cellNome = row.insertCell(0);
        const inputNome = document.createElement('input');
        inputNome.type = 'text';
        inputNome.className = 'item-nome';
        inputNome.value = item.nome || item.item || '';
        inputNome.style.width = '100%';
        inputNome.style.padding = '6px';
        inputNome.style.border = '1px solid #ddd';
        inputNome.style.borderRadius = '4px';
        cellNome.appendChild(inputNome);
        
        // Célula da categoria
        const cellCategoria = row.insertCell(1);
        const inputCategoria = document.createElement('input');
        inputCategoria.type = 'text';
        inputCategoria.className = 'item-categoria';
        inputCategoria.value = item.categoria || '';
        inputCategoria.style.width = '100%';
        inputCategoria.style.padding = '6px';
        inputCategoria.style.border = '1px solid #ddd';
        inputCategoria.style.borderRadius = '4px';
        cellCategoria.appendChild(inputCategoria);
        
        // Célula da quantidade
        const cellQtd = row.insertCell(2);
        const inputQtd = document.createElement('input');
        inputQtd.type = 'number';
        inputQtd.className = 'item-quantidade';
        inputQtd.value = item.quantidade || 1;
        inputQtd.min = 1;
        inputQtd.style.width = '80px';
        inputQtd.style.padding = '6px';
        inputQtd.style.border = '1px solid #ddd';
        inputQtd.style.borderRadius = '4px';
        cellQtd.appendChild(inputQtd);
        
        // Célula do status (checkbox)
        const cellStatus = row.insertCell(3);
        const inputStatus = document.createElement('input');
        inputStatus.type = 'checkbox';
        inputStatus.className = 'item-status';
        inputStatus.checked = item.concluido === true;
        inputStatus.style.width = '20px';
        inputStatus.style.height = '20px';
        cellStatus.appendChild(inputStatus);
        cellStatus.style.textAlign = 'center';
        
        // Célula de ações (botão remover)
        const cellAcoes = row.insertCell(4);
        const btnRemover = document.createElement('button');
        btnRemover.innerHTML = '🗑️';
        btnRemover.className = 'btn small';
        btnRemover.style.background = '#dc3545';
        btnRemover.style.color = 'white';
        btnRemover.onclick = function() { row.remove(); };
        cellAcoes.appendChild(btnRemover);
        cellAcoes.style.textAlign = 'center';
    });
    
    // Atualizar contador de itens
    const contador = document.getElementById('contadorItens');
    if (contador) contador.textContent = itens.length;
}

// ==================== FUNÇÃO VISUALIZAR CHECKLIST MODAL ====================

function visualizarChecklistModal(checklistId) {
    console.log('👁️ Visualizando checklist:', checklistId);
    
    const checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const checklist = checklists.find(c => c.id == checklistId);
    
    if (!checklist) {
        mostrarMensagemToast('❌ Checklist não encontrado!', true);
        return;
    }
    
    // Buscar foto do personagem
    let fotoPersonagem = '';
    let personagemNome = checklist.personagemNome || 'Não informado';
    
    try {
        const personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
        let personagens2 = JSON.parse(localStorage.getItem('personagens') || '[]');
        const todosPersonagens = [...personagens, ...personagens2];
        
        const personagem = todosPersonagens.find(p => p.id == checklist.personagemId || p.ID_personagens == checklist.personagemId);
        if (personagem) {
            fotoPersonagem = personagem.foto || personagem.foto_personagem || '';
            personagemNome = personagem.nome_personagens || personagem.nome || checklist.personagemNome || 'Não informado';
        }
    } catch(e) {
        console.error('Erro ao buscar foto do personagem:', e);
    }
    
    // Gerar itens do checklist
    let itensHtml = '';
    let itensConcluidos = 0;
    let itensTotais = checklist.itens ? checklist.itens.length : 0;
    
    if (checklist.itens && checklist.itens.length > 0) {
        checklist.itens.forEach((item, idx) => {
            if (item.concluido) itensConcluidos++;
            const statusIcon = item.concluido ? '✅' : '⏳';
            const statusClass = item.concluido ? 'item-concluido' : 'item-pendente';
            
            itensHtml += `
                <div class="checklist-item">
                    <div><strong>${idx+1}.</strong> ${escapeHtml(item.nome || item.item || '-')} ${item.categoria ? `<span style="color:#666;font-size:12px;">(${escapeHtml(item.categoria)})</span>` : ''}</div>
                    <div>📦 Qtd: ${item.quantidade || 1} | <span class="${statusClass}">${statusIcon} ${item.concluido ? 'Concluído' : 'Pendente'}</span></div>
                </div>
            `;
        });
    } else {
        itensHtml = '<div style="text-align:center;padding:30px;color:#999;">Nenhum item cadastrado neste checklist</div>';
    }
    
    const percentualConcluido = itensTotais > 0 ? Math.round((itensConcluidos / itensTotais) * 100) : 0;
    const statusText = checklist.status === 'ativo' ? 'Ativo' : (checklist.status === 'desativado' ? 'Desativado' : 'Pendente');
    const statusClass = checklist.status === 'ativo' ? 'badge-ativo' : (checklist.status === 'desativado' ? 'badge-desativado' : 'badge-pendente');
    
    const modalHtml = `
        <div id="modalChecklistVisualizar" class="modal-checklist">
            <div class="modal-checklist-content">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 2px solid #28a745; background: linear-gradient(135deg, #f8f9fa, #e8f5e9);">
                    <h2 style="margin: 0; color: #28a745;">📋 ${escapeHtml(checklist.nome)}</h2>
                    <button onclick="fecharModalChecklistVisualizar()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666;">&times;</button>
                </div>
                
                <div style="padding: 20px;">
                    <div style="display: flex; gap: 20px; margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 12px; flex-wrap: wrap;">
                        <div style="text-align: center;">
                            ${fotoPersonagem ? 
                                `<img src="${fotoPersonagem}" class="checklist-foto" alt="Foto do Personagem">` : 
                                `<div style="width: 100px; height: 100px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48px; color: white;">🎭</div>`
                            }
                        </div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 10px 0; color: #28a745;">🎭 ${escapeHtml(personagemNome)}</h3>
                            <p style="margin: 5px 0;"><strong>📝 Descrição:</strong> ${escapeHtml(checklist.descricao || 'Sem descrição')}</p>
                            <p style="margin: 5px 0;"><strong>📅 Data de Criação:</strong> ${formatarData(checklist.dataCriacao)}</p>
                            <p style="margin: 5px 0;"><strong>⚡ Status:</strong> <span class="${statusClass}">${statusText}</span></p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <strong>📊 Progresso</strong>
                            <span>${itensConcluidos}/${itensTotais} itens (${percentualConcluido}%)</span>
                        </div>
                        <div style="background: #e0e0e0; border-radius: 10px; height: 10px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #28a745, #20c997); width: ${percentualConcluido}%; height: 100%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                    
                    <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-top: 20px;">📋 Itens do Checklist</h3>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px;">
                        ${itensHtml}
                    </div>
                </div>
                
                <div style="padding: 15px 20px; background: #f8f9fa; text-align: right; border-top: 1px solid #eee; display: flex; justify-content: space-between; gap: 10px;">
                    <div>
                        <button onclick="fecharModalChecklistVisualizar()" class="btn" style="background: #6c757d; color: white;">Fechar</button>
                    </div>
                    <div>
                        <button onclick="editarChecklistRel('${checklistId}'); fecharModalChecklistVisualizar();" class="btn" style="background: #ffc107; color: #333;">✏️ Editar</button>
                        <button onclick="gerarPDFChecklistComFoto('${checklistId}');" class="btn" style="background: #28a745; color: white;">📄 Gerar PDF</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function fecharModalChecklistVisualizar() {
    const modal = document.getElementById('modalChecklistVisualizar');
    if (modal) modal.remove();
}

// ==================== FUNÇÃO EXCLUIR CHECKLIST ====================

function excluirChecklistRel(checklistId) {
    if (confirm('⚠️ Tem certeza que deseja excluir este checklist? Esta ação não pode ser desfeita!')) {
        let checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
        const index = checklists.findIndex(c => c.id == checklistId);
        
        if (index !== -1) {
            checklists.splice(index, 1);
            localStorage.setItem('checklists_cadastrados', JSON.stringify(checklists));
            mostrarMensagemToast('✅ Checklist excluído com sucesso!');
            carregarRelatorio('relatorio_checklist');
        } else {
            mostrarMensagemToast('❌ Checklist não encontrado!', true);
        }
    }
}

// ==================== FUNÇÃO ALTERAR STATUS CHECKLIST ====================

function alterarStatusChecklistRel(selectElement) {
    const checklistId = selectElement.getAttribute('data-id');
    const novoStatus = selectElement.value;
    
    let checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const index = checklists.findIndex(c => c.id == checklistId);
    
    if (index !== -1) {
        checklists[index].status = novoStatus;
        checklists[index].dataAtualizacao = new Date().toISOString();
        localStorage.setItem('checklists_cadastrados', JSON.stringify(checklists));
        
        let bgColor, textColor;
        if (novoStatus === 'ativo') {
            bgColor = '#d4edda';
            textColor = '#155724';
        } else if (novoStatus === 'desativado') {
            bgColor = '#f8d7da';
            textColor = '#721c24';
        } else {
            bgColor = '#fff3cd';
            textColor = '#856404';
        }
        
        selectElement.style.backgroundColor = bgColor;
        selectElement.style.color = textColor;
        
        mostrarMensagemToast(`✅ Status alterado para ${novoStatus === 'ativo' ? 'Ativo' : (novoStatus === 'desativado' ? 'Desativado' : 'Pendente')}`);
    } else {
        mostrarMensagemToast('❌ Erro ao alterar status!', true);
    }
    
    // Buscar foto do personagem
    let fotoPersonagem = '';
    let personagemNome = checklist.personagemNome || 'Não informado';
    
    try {
        const personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
        let personagens2 = JSON.parse(localStorage.getItem('personagens') || '[]');
        const todosPersonagens = [...personagens, ...personagens2];
        
        const personagem = todosPersonagens.find(p => p.id == checklist.personagemId || p.ID_personagens == checklist.personagemId);
        if (personagem) {
            fotoPersonagem = personagem.foto || personagem.foto_personagem || '';
            personagemNome = personagem.nome_personagens || personagem.nome || checklist.personagemNome || 'Não informado';
        }
    } catch(e) {
        console.error('Erro ao buscar foto do personagem:', e);
    }
    
    // Gerar itens do checklist
    let itensHtml = '';
    let itensConcluidos = 0;
    let itensTotais = checklist.itens ? checklist.itens.length : 0;
    
    if (checklist.itens && checklist.itens.length > 0) {
        checklist.itens.forEach((item, idx) => {
            if (item.concluido) itensConcluidos++;
            const statusIcon = item.concluido ? '✅' : '⏳';
            const statusClass = item.concluido ? 'item-concluido' : 'item-pendente';
            
            itensHtml += `
                <div class="checklist-item">
                    <div><strong>${idx+1}.</strong> ${escapeHtml(item.nome || item.item || '-')} ${item.categoria ? `<span style="color:#666;font-size:12px;">(${escapeHtml(item.categoria)})</span>` : ''}</div>
                    <div>📦 Qtd: ${item.quantidade || 1} | <span class="${statusClass}">${statusIcon} ${item.concluido ? 'Concluído' : 'Pendente'}</span></div>
                </div>
            `;
        });
    } else {
        itensHtml = '<div style="text-align:center;padding:30px;color:#999;">Nenhum item cadastrado neste checklist</div>';
    }
    
    const percentualConcluido = itensTotais > 0 ? Math.round((itensConcluidos / itensTotais) * 100) : 0;
    const statusText = checklist.status === 'ativo' ? 'Ativo' : (checklist.status === 'desativado' ? 'Desativado' : 'Pendente');
    const statusClass = checklist.status === 'ativo' ? 'badge-ativo' : (checklist.status === 'desativado' ? 'badge-desativado' : 'badge-pendente');
    
    const modalHtml = `
        <div id="modalChecklistVisualizar" class="modal-checklist">
            <div class="modal-checklist-content">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 2px solid #28a745; background: linear-gradient(135deg, #f8f9fa, #e8f5e9);">
                    <h2 style="margin: 0; color: #28a745;">📋 ${escapeHtml(checklist.nome)}</h2>
                    <button onclick="fecharModalChecklistVisualizar()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666;">&times;</button>
                </div>
                
                <div style="padding: 20px;">
                    <!-- Foto e Informações do Personagem -->
                    <div style="display: flex; gap: 20px; margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 12px; flex-wrap: wrap;">
                        <div style="text-align: center;">
                            ${fotoPersonagem ? 
                                `<img src="${fotoPersonagem}" class="checklist-foto" alt="Foto do Personagem">` : 
                                `<div style="width: 100px; height: 100px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48px; color: white;">🎭</div>`
                            }
                        </div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 10px 0; color: #28a745;">🎭 ${escapeHtml(personagemNome)}</h3>
                            <p style="margin: 5px 0;"><strong>📝 Descrição:</strong> ${escapeHtml(checklist.descricao || 'Sem descrição')}</p>
                            <p style="margin: 5px 0;"><strong>📅 Data de Criação:</strong> ${formatarData(checklist.dataCriacao)}</p>
                            <p style="margin: 5px 0;"><strong>⚡ Status:</strong> <span class="${statusClass}">${statusText}</span></p>
                        </div>
                    </div>
                    
                    <!-- Barra de Progresso -->
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <strong>📊 Progresso</strong>
                            <span>${itensConcluidos}/${itensTotais} itens (${percentualConcluido}%)</span>
                        </div>
                        <div style="background: #e0e0e0; border-radius: 10px; height: 10px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #28a745, #20c997); width: ${percentualConcluido}%; height: 100%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                    
                    <!-- Lista de Itens -->
                    <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-top: 20px;">📋 Itens do Checklist</h3>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px;">
                        ${itensHtml}
                    </div>
                </div>
                
                <div style="padding: 15px 20px; background: #f8f9fa; text-align: right; border-top: 1px solid #eee; display: flex; justify-content: space-between; gap: 10px;">
                    <div>
                        <button onclick="fecharModalChecklistVisualizar()" class="btn" style="background: #6c757d; color: white;">Fechar</button>
                    </div>
                    <div>
                        <button onclick="editarChecklistRel('${checklistId}'); fecharModalChecklistVisualizar();" class="btn" style="background: #ffc107; color: #333;">✏️ Editar</button>
                        <button onclick="gerarPDFChecklistComFoto('${checklistId}');" class="btn" style="background: #28a745; color: white;">📄 Gerar PDF</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function fecharModalChecklistVisualizar() {
    const modal = document.getElementById('modalChecklistVisualizar');
    if (modal) modal.remove();
}

// ==================== FUNÇÃO GERAR PDF CHECKLIST COM FOTO ====================

function gerarPDFChecklistComFoto(checklistId) {
    console.log('📄 Gerando PDF do checklist com foto:', checklistId);
    
    const checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const checklist = checklists.find(c => c.id == checklistId);
    
    if (!checklist) {
        mostrarMensagemToast('❌ Checklist não encontrado!', true);
        return;
    }
    
    // Buscar foto do personagem
    let fotoPersonagem = '';
    let personagemNome = checklist.personagemNome || 'Não informado';
    
    try {
        const personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
        let personagens2 = JSON.parse(localStorage.getItem('personagens') || '[]');
        const todosPersonagens = [...personagens, ...personagens2];
        
        const personagem = todosPersonagens.find(p => p.id == checklist.personagemId || p.ID_personagens == checklist.personagemId);
        if (personagem) {
            fotoPersonagem = personagem.foto || personagem.foto_personagem || '';
            personagemNome = personagem.nome_personagens || personagem.nome || checklist.personagemNome || 'Não informado';
        }
    } catch(e) {
        console.error('Erro ao buscar foto do personagem:', e);
    }
    
    const dataAtual = new Date().toLocaleString('pt-BR');
    const dataCriacao = checklist.dataCriacao ? new Date(checklist.dataCriacao).toLocaleDateString('pt-BR') : 'Data não informada';
    
    let itensConcluidos = 0;
    let itensTable = '';
    
    if (checklist.itens && checklist.itens.length > 0) {
        checklist.itens.forEach((item, idx) => {
            if (item.concluido) itensConcluidos++;
            const statusText = item.concluido ? '✅ Concluído' : '⏳ Pendente';
            const statusColor = item.concluido ? '#28a745' : '#dc3545';
            
            itensTable += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px; text-align: center; width: 50px;">${idx + 1}</td>
                    <td style="padding: 10px;"><strong>${escapeHtml(item.nome || item.item || '-')}</strong></td>
                    <td style="padding: 10px;">${escapeHtml(item.categoria || '-')}</td>
                    <td style="padding: 10px; text-align: center;">${item.quantidade || 1}</td>
                    <td style="padding: 10px; text-align: center; color: ${statusColor}; font-weight: bold;">${statusText}</td>
                </tr>
            `;
        });
    } else {
        itensTable = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Nenhum item cadastrado neste checklist</td></tr>';
    }
    
    const percentualConcluido = checklist.itens && checklist.itens.length > 0 ? Math.round((itensConcluidos / checklist.itens.length) * 100) : 0;
    const statusText = checklist.status === 'ativo' ? 'Ativo' : (checklist.status === 'desativado' ? 'Desativado' : 'Pendente');
    
    let fotoHtml = '';
    if (fotoPersonagem && fotoPersonagem !== '') {
        fotoHtml = `<img src="${fotoPersonagem}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%; border: 3px solid #28a745;">`;
    } else {
        fotoHtml = `<div style="width: 120px; height: 120px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 60px; color: white;">🎭</div>`;
    }
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Checklist - ${escapeHtml(checklist.nome)}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Arial', sans-serif; 
                    margin: 40px; 
                    background: white;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 3px solid #28a745; 
                    padding-bottom: 15px;
                }
                .header h1 { 
                    color: #28a745; 
                    margin: 0 0 10px 0;
                    font-size: 28px;
                }
                .header p {
                    color: #666;
                    font-size: 14px;
                }
                .info-personagem {
                    display: flex;
                    gap: 25px;
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .dados-personagem {
                    flex: 1;
                }
                .dados-personagem p {
                    margin: 8px 0;
                }
                .progresso {
                    margin-bottom: 25px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .progresso-bar {
                    background: #e0e0e0;
                    border-radius: 10px;
                    height: 12px;
                    margin-top: 8px;
                    overflow: hidden;
                }
                .progresso-fill {
                    background: linear-gradient(90deg, #28a745, #20c997);
                    width: ${percentualConcluido}%;
                    height: 100%;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background: #28a745;
                    color: white;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                }
                .badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .badge-ativo { background-color: #28a745; color: white; }
                .badge-pendente { background-color: #ffc107; color: #333; }
                .badge-desativado { background-color: #dc3545; color: white; }
                .total-info {
                    margin-top: 15px;
                    text-align: right;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📋 ${escapeHtml(checklist.nome)}</h1>
                <p>Checklist de itens e materiais - Documento oficial</p>
            </div>
            
            <div class="info-personagem">
                ${fotoHtml}
                <div class="dados-personagem">
                    <h2 style="color: #28a745; margin-bottom: 10px;">🎭 ${escapeHtml(personagemNome)}</h2>
                    <p><strong>📝 Descrição:</strong> ${escapeHtml(checklist.descricao || 'Sem descrição')}</p>
                    <p><strong>📅 Data de Criação:</strong> ${dataCriacao}</p>
                    <p><strong>⚡ Status:</strong> <span class="badge badge-${checklist.status === 'ativo' ? 'ativo' : (checklist.status === 'desativado' ? 'desativado' : 'pendente')}">${statusText}</span></p>
                </div>
            </div>
            
            <div class="progresso">
                <div style="display: flex; justify-content: space-between;">
                    <strong>📊 Progresso do Checklist</strong>
                    <span>${itensConcluidos}/${checklist.itens ? checklist.itens.length : 0} itens concluídos (${percentualConcluido}%)</span>
                </div>
                <div class="progresso-bar">
                    <div class="progresso-fill"></div>
                </div>
            </div>
            
            <h3>📋 Lista de Itens</h3>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">#</th>
                        <th>Item</th>
                        <th>Categoria</th>
                        <th style="text-align: center;">Quantidade</th>
                        <th style="text-align: center;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${itensTable}
                </tbody>
            </table>
            
            <div class="total-info">
                <p>Total de itens: ${checklist.itens ? checklist.itens.length : 0}</p>
            </div>
            
            <div class="footer">
                <p>Documento gerado automaticamente pelo Sistema de Gestão de Eventos</p>
                <p>Data de emissão: ${dataAtual}</p>
                <p>Checklist ID: ${checklistId}</p>
            </div>
        </body>
        </html>
    `;
    
    // Fechar modal se estiver aberto
    const modal = document.getElementById('modalChecklistVisualizar');
    if (modal) modal.remove();
    
    const win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
    setTimeout(() => win.print(), 500);
}

function gerarPDFListaChecklists() {
    const checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const dataAtual = new Date().toLocaleString('pt-BR');
    
    let tableRows = '';
    for (let i = 0; i < checklists.length; i++) {
        const c = checklists[i];
        const dataCriacao = c.dataCriacao ? new Date(c.dataCriacao).toLocaleDateString('pt-BR') : 'Data não informada';
        tableRows += `
            <tr>
                <td style="text-align: center;">${i+1}</td>
                <td><strong>${escapeHtml(c.nome || '-')}</strong></td>
                <td>${escapeHtml(c.personagemNome || '-')}</td>
                <td style="text-align: center;">${c.itens ? c.itens.length : 0}</td>
                <td style="text-align: center;">${dataCriacao}</td>
                <td style="text-align: center;">${c.status === 'ativo' ? '✅ Ativo' : (c.status === 'desativado' ? '❌ Desativado' : '⏳ Pendente')}</td>
            </tr>
        `;
    }
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Checklists</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                .header h1 { color: #007bff; margin: 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #007bff; color: white; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📋 Relatório de Checklists</h1>
                <p>Lista completa de todos os checklists cadastrados no sistema</p>
            </div>
            <p><strong>📊 Total de Checklists:</strong> ${checklists.length}</p>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">#</th>
                        <th>Nome</th>
                        <th>Personagem</th>
                        <th style="text-align: center;">Itens</th>
                        <th style="text-align: center;">Data Criação</th>
                        <th style="text-align: center;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows || '<tr><td colspan="6" style="text-align: center;">Nenhum checklist cadastrado</td></tr>'}
                </tbody>
            </table>
            <div class="footer">
                <p>Documento gerado automaticamente pelo Sistema de Gestão de Eventos</p>
                <p>Data de emissão: ${dataAtual}</p>
            </div>
        </body>
        </html>
    `;
    
    const win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
    setTimeout(() => win.print(), 500);
}

function alterarStatusChecklistRel(selectElement) {
    const checklistId = selectElement.getAttribute('data-id');
    const novoStatus = selectElement.value;
    
    let checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const index = checklists.findIndex(c => c.id == checklistId);
    
    if (index !== -1) {
        checklists[index].status = novoStatus;
        checklists[index].dataAtualizacao = new Date().toISOString();
        localStorage.setItem('checklists_cadastrados', JSON.stringify(checklists));
        
        let bgColor, textColor;
        if (novoStatus === 'ativo') {
            bgColor = '#d4edda';
            textColor = '#155724';
        } else if (novoStatus === 'desativado') {
            bgColor = '#f8d7da';
            textColor = '#721c24';
        } else {
            bgColor = '#fff3cd';
            textColor = '#856404';
        }
        
        selectElement.style.backgroundColor = bgColor;
        selectElement.style.color = textColor;
        
        mostrarMensagemToast(`✅ Status alterado para ${novoStatus === 'ativo' ? 'Ativo' : (novoStatus === 'desativado' ? 'Desativado' : 'Pendente')}`);
    } else {
        mostrarMensagemToast('❌ Erro ao alterar status!', true);
    }
}


// ==================== RELATÓRIO DE EQUIPE ====================

function carregarRelatorioEquipe(container) {
    console.log('👥 Carregando relatório de equipe...');
    
    let elenco = [];
    let motoristas = [];
    let funcionarios = [];
    
    try {
        // ELENCO
        let elencoDados = localStorage.getItem('elenco_cadastrados');
        if (elencoDados) elenco = JSON.parse(elencoDados);
        if (elenco.length === 0) {
            elencoDados = localStorage.getItem('elenco');
            if (elencoDados) elenco = JSON.parse(elencoDados);
        }
        console.log('✅ Elenco carregado:', elenco.length, 'registros');
        
        // MOTORISTAS
        let motoristasDados = localStorage.getItem('motoristas_cadastrados');
        if (motoristasDados) motoristas = JSON.parse(motoristasDados);
        if (motoristas.length === 0) {
            motoristasDados = localStorage.getItem('motoristas');
            if (motoristasDados) motoristas = JSON.parse(motoristasDados);
        }
        console.log('✅ Motoristas carregados:', motoristas.length, 'registros');
        
        // FUNCIONARIOS
        let funcionariosDados = localStorage.getItem('funcionarios_cadastrados');
        if (funcionariosDados) funcionarios = JSON.parse(funcionariosDados);
        if (funcionarios.length === 0) {
            funcionariosDados = localStorage.getItem('funcionarios');
            if (funcionariosDados) funcionarios = JSON.parse(funcionariosDados);
        }
        console.log('✅ Funcionários carregados:', funcionarios.length, 'registros', funcionarios);
    } catch(e) {
        console.error('Erro ao carregar equipe:', e);
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: #e8f4fd; padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer;" onclick="mostrarAbaEquipeRel('elenco')">
                <div style="font-size: 2rem;">🎭</div>
                <div style="font-size: 1.5rem; font-weight: bold;">${elenco.length}</div>
                <div>Elenco</div>
            </div>
            <div style="background: #d4edda; padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer;" onclick="mostrarAbaEquipeRel('motoristas')">
                <div style="font-size: 2rem;">🚗</div>
                <div style="font-size: 1.5rem; font-weight: bold;">${motoristas.length}</div>
                <div>Motoristas</div>
            </div>
            <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer;" onclick="mostrarAbaEquipeRel('funcionarios')">
                <div style="font-size: 2rem;">👥</div>
                <div style="font-size: 1.5rem; font-weight: bold;">${funcionarios.length}</div>
                <div>Funcionários</div>
            </div>
        </div>
        <div id="abaEquipeContainerRel">
            ${montarTabelaEquipe('elenco', elenco)}
        </div>
    `;
}
// ==================== FUNÇÕES PARA RELATÓRIO DE EQUIPE CORRIGIDAS ====================

// Função para montar tabela de equipe com todos os dados (versão completa)
function montarTabelaEquipeCompleta(tipo, dados) {
    if (!dados || dados.length === 0) {
        return `<div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px;">Nenhum ${tipo} cadastrado</div>`;
    }
    
    let html = `
        <div class="table-container">
            <div style="margin-bottom: 1rem;">
                <input type="text" id="buscarEquipeRel" placeholder="🔍 Buscar por nome, documento ou telefone..." 
                       style="padding: 8px; width: 100%; max-width: 350px; border: 1px solid #ddd; border-radius: 4px;" 
                       onkeyup="filtrarTabelaEquipeRel(this)">
            </div>
            <div style="overflow-x: auto;">
                <table class="tabela-relatorio" id="tabelaEquipeRel" style="width: 100%; border-collapse: collapse; min-width: 800px;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 10px; text-align: left;">ID</th>
                            <th style="padding: 10px; text-align: left;">Nome</th>
                            <th style="padding: 10px; text-align: left;">Documento</th>
                            <th style="padding: 10px; text-align: left;">Telefone</th>
                            <th style="padding: 10px; text-align: left;">Email</th>
    `;
    
    // Adicionar colunas específicas por tipo
    if (tipo === 'motoristas') {
        html += `
                            <th style="padding: 10px; text-align: left;">CNH</th>
                            <th style="padding: 10px; text-align: left;">Veículo</th>
                            <th style="padding: 10px; text-align: left;">Placa</th>
                            <th style="padding: 10px; text-align: left;">Chave PIX</th>
                            <th style="padding: 10px; text-align: left;">Endereço</th>
                            <th style="padding: 10px; text-align: left;">Data Nasc.</th>
                            <th style="padding: 10px; text-align: left;">Idade</th>
        `;
    } else if (tipo === 'elenco') {
        html += `
                            <th style="padding: 10px; text-align: left;">Faz Drive?</th>
                            <th style="padding: 10px; text-align: left;">Chave PIX</th>
                            <th style="padding: 10px; text-align: left;">Endereço</th>
                            <th style="padding: 10px; text-align: left;">Data Nasc.</th>
                            <th style="padding: 10px; text-align: left;">Idade</th>
        `;
    } else if (tipo === 'funcionarios') {
        html += `
                            <th style="padding: 10px; text-align: left;">Cargo</th>
                            <th style="padding: 10px; text-align: left;">Endereço</th>
                            <th style="padding: 10px; text-align: left;">Data Nasc.</th>
                            <th style="padding: 10px; text-align: left;">Idade</th>
        `;
    }
    
    html += `
                            <th style="padding: 10px; text-align: center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    dados.forEach((membro, index) => {
        const membroId = membro.id || membro.ID_elenco || membro.ID_motoristas || membro.ID_funcionarios || index;
        const nome = membro.nome_elenco || membro.nome_motoristas || membro.nome_funcionarios || membro.nome || '-';
        const documento = membro.doc_elenco_cadastro || membro.doc_motoristas_cadastro || membro.doc_funcionarios_cadastro || '';
        const telefone = membro.telefone_elenco || membro.telefone_motoristas || membro.telefone_funcionarios || membro.telefone || '-';
        const email = membro.email_elenco || membro.email_motoristas || membro.email_funcionarios || membro.email || '-';
        
        // Endereço completo
        const endereco = [
            membro.logradouro_elenco || membro.logradouro_motoristas || membro.logradouro_funcionarios || '',
            membro.numero_elenco || membro.numero_motoristas || membro.numero_funcionarios || '',
            membro.bairro_elenco || membro.bairro_motoristas || membro.bairro_funcionarios || '',
            membro.cidade_elenco || membro.cidade_motoristas || membro.cidade_funcionarios || ''
        ].filter(Boolean).join(', ') || '-';
        
        // Data de nascimento e idade
        let dataNasc = '';
        let idade = '';
        
        if (tipo === 'motoristas') {
            dataNasc = membro.data_nascimento_motoristas || '';
            idade = membro.idade_motoristas || calcularIdadeTexto(dataNasc);
        } else if (tipo === 'elenco') {
            dataNasc = membro.data_nascimento_elenco || '';
            idade = membro.idade_elenco || calcularIdadeTexto(dataNasc);
        } else if (tipo === 'funcionarios') {
            dataNasc = membro.data_nascimento_funcionarios || '';
            idade = membro.idade_funcionarios || calcularIdadeTexto(dataNasc);
        }
        
        // Formatar data de nascimento
        if (dataNasc) {
            const [ano, mes, dia] = dataNasc.split('-');
            dataNasc = `${dia}/${mes}/${ano}`;
        }
        
        html += `<tr data-nome="${nome.toLowerCase()}" data-documento="${documento}" data-telefone="${telefone}">`;
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${membroId}</td>`;
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${escapeHtml(nome)}</strong></td>`;
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${formatarDocumento(documento)}</td>`;
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${telefone}</td>`;
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td>`;
        
        if (tipo === 'motoristas') {
            const cnh = membro.cnh_motoristas || '';
            const veiculo = membro.veiculo_motoristas || '';
            const placa = membro.placa_motoristas || '';
            const chavePix = membro.chave_pix_motoristas || '';
            
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${cnh || '-'}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${veiculo || '-'}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${placa || '-'}</strong></td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${chavePix || '-'}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 12px;">${endereco}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${dataNasc || '-'}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${idade}</td>`;
        } else if (tipo === 'elenco') {
            const fazDrive = membro.faz_drive_elenco === 'sim' ? '✅ Sim' : '❌ Não';
            const chavePix = membro.chave_pix_elenco || '';
            
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${fazDrive}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${chavePix || '-'}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 12px;">${endereco}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${dataNasc || '-'}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${idade}</td>`;
        } else if (tipo === 'funcionarios') {
            const cargo = membro.cargo_funcionarios || membro.cargo || '-';
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${cargo}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 12px;">${endereco}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${dataNasc || '-'}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${idade}</td>`;
        }
        
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    <button class="btn small" onclick="editarEquipeRel('${tipo}', '${membroId}')" 
                            style="background: #ffc107; color: #333; margin-right: 5px; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">
                        ✏️ Editar
                    </button>
                    <button class="btn small" onclick="excluirEquipeRel('${tipo}', '${membroId}')" 
                            style="background: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">
                        🗑️ Excluir
                    </button>
                </td>`;
        html += `</tr>`;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        <div style="margin-top: 1rem; text-align: right;">
            <small>Total: ${dados.length} registros</small>
        </div>
    `;
    
    return html;
}

// Função para calcular idade a partir da data
function calcularIdadeTexto(dataNascimento) {
    if (!dataNascimento) return '';
    try {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        if (isNaN(nascimento.getTime())) return '';
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mesDiff = hoje.getMonth() - nascimento.getMonth();
        if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade > 0 ? `${idade} anos` : '';
    } catch(e) {
        return '';
    }
}

// Função para filtrar tabela de equipe
function filtrarTabelaEquipeRel(input) {
    const filter = input ? input.value.toLowerCase() : '';
    const table = document.getElementById('tabelaEquipeRel');
    if (!table) return;
    
    const rows = table.getElementsByTagName('tbody')[0]?.getElementsByTagName('tr') || [];
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const nome = row.getAttribute('data-nome') || '';
        const documento = row.getAttribute('data-documento') || '';
        const telefone = row.getAttribute('data-telefone') || '';
        
        const matches = filter === '' || 
            nome.includes(filter) || 
            documento.includes(filter) || 
            telefone.includes(filter);
        
        row.style.display = matches ? '' : 'none';
    }
}

// ==================== FUNÇÕES CORRIGIDAS PARA RELATÓRIO DE EQUIPE ====================

// Função para mostrar aba de equipe no relatório
function mostrarAbaEquipeRel(tipo) {
    console.log(`📋 Mostrando aba: ${tipo}`);
    
    let dados = [];
    try {
        if (tipo === 'elenco') {
            dados = JSON.parse(localStorage.getItem('elenco_cadastrados') || '[]');
            if (dados.length === 0) dados = JSON.parse(localStorage.getItem('elenco') || '[]');
            console.log(`🎭 Elenco encontrado: ${dados.length} registros`);
        } else if (tipo === 'motoristas') {
            dados = JSON.parse(localStorage.getItem('motoristas_cadastrados') || '[]');
            if (dados.length === 0) dados = JSON.parse(localStorage.getItem('motoristas') || '[]');
            console.log(`🚗 Motoristas encontrados: ${dados.length} registros`);
        } else if (tipo === 'funcionarios') {
            dados = JSON.parse(localStorage.getItem('funcionarios_cadastrados') || '[]');
            if (dados.length === 0) dados = JSON.parse(localStorage.getItem('funcionarios') || '[]');
            console.log(`👥 Funcionários encontrados: ${dados.length} registros`);
        }
    } catch(e) { 
        console.error('Erro ao carregar dados:', e);
        dados = []; 
    }
    
    const container = document.getElementById('abaEquipeContainerRel');
    if (container) {
        container.innerHTML = montarTabelaEquipeCompleta(tipo, dados);
    } else {
        console.error('❌ Container abaEquipeContainerRel não encontrado');
        // Tentar criar um container alternativo
        const relatorioContainer = document.getElementById('conteudoRelatorio_relatorio_equipe');
        if (relatorioContainer) {
            relatorioContainer.innerHTML = montarTabelaEquipeCompleta(tipo, dados);
        }
    }
}

// Função para montar tabela de equipe completa (CORRIGIDA)
function montarTabelaEquipeCompleta(tipo, dados) {
    if (!dados || dados.length === 0) {
        return `<div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
            <p>Nenhum ${tipo === 'elenco' ? 'membro do elenco' : (tipo === 'motoristas' ? 'motorista' : 'funcionário')} cadastrado.</p>
            <button class="btn primary" onclick="showPage('${tipo}')">➕ Cadastrar ${tipo === 'elenco' ? 'Elenco' : (tipo === 'motoristas' ? 'Motorista' : 'Funcionário')}</button>
        </div>`;
    }
    
    let html = `
        <div class="table-container">
            <div style="margin-bottom: 1rem;">
                <input type="text" id="buscarEquipeRel" placeholder="🔍 Buscar por nome, documento ou telefone..." 
                       style="padding: 8px; width: 100%; max-width: 350px; border: 1px solid #ddd; border-radius: 4px;" 
                       onkeyup="filtrarTabelaEquipeRel(this)">
            </div>
            <div style="overflow-x: auto;">
                <table class="tabela-relatorio" id="tabelaEquipeRel" style="width: 100%; border-collapse: collapse; min-width: 600px;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 10px; text-align: left;">ID</th>
                            <th style="padding: 10px; text-align: left;">Nome</th>
                            <th style="padding: 10px; text-align: left;">Documento</th>
                            <th style="padding: 10px; text-align: left;">Telefone</th>
                            <th style="padding: 10px; text-align: left;">Email</th>
    `;
    
    // Adicionar colunas específicas por tipo
    if (tipo === 'motoristas') {
        html += `
                            <th style="padding: 10px; text-align: left;">Veículo</th>
                            <th style="padding: 10px; text-align: left;">Placa</th>
        `;
    } else if (tipo === 'elenco') {
        html += `
                            <th style="padding: 10px; text-align: left;">Faz Drive?</th>
        `;
    } else if (tipo === 'funcionarios') {
        html += `
                            <th style="padding: 10px; text-align: left;">Cargo</th>
        `;
    }
    
    html += `
                            <th style="padding: 10px; text-align: center;">Ações</th>
                         </tr>
                    </thead>
                    <tbody>
    `;
    
    for (let i = 0; i < dados.length; i++) {
        const membro = dados[i];
        const membroId = membro.id || membro.ID_elenco || membro.ID_motoristas || membro.ID_funcionarios || i;
        const nome = membro.nome_elenco || membro.nome_motoristas || membro.nome_funcionarios || membro.nome || '-';
        const documento = membro.doc_elenco_cadastro || membro.doc_motoristas_cadastro || membro.doc_funcionarios_cadastro || '';
        const telefone = membro.telefone_elenco || membro.telefone_motoristas || membro.telefone_funcionarios || membro.telefone || '-';
        const email = membro.email_elenco || membro.email_motoristas || membro.email_funcionarios || membro.email || '-';
        
        // Formatar documento para exibição
        let docFormatado = '';
        if (documento) {
            if (documento.length === 11) {
                docFormatado = documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (documento.length === 14) {
                docFormatado = documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            } else {
                docFormatado = documento;
            }
        }
        
        html += `<tr data-nome="${nome.toLowerCase()}" data-documento="${documento}" data-telefone="${telefone}">`;
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${membroId}</td>`;
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${escapeHtml(nome)}</strong></td>`;
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${docFormatado || '-'}</td>`;
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${telefone}</td>`;
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td>`;
        
        if (tipo === 'motoristas') {
            const veiculo = membro.veiculo_motoristas || membro.veiculo || '-';
            const placa = membro.placa_motoristas || membro.placa || '-';
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${veiculo}</td>`;
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${placa}</strong></td>`;
        } else if (tipo === 'elenco') {
            const fazDrive = membro.faz_drive_elenco === 'sim' ? '✅ Sim' : '❌ Não';
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${fazDrive}</td>`;
        } else if (tipo === 'funcionarios') {
            const cargo = membro.cargo_funcionarios || membro.cargo || '-';
            html += `<td style="padding: 8px; border-bottom: 1px solid #eee;">${cargo}</td>`;
        }
        
        html += `<td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    <button class="btn small" onclick="editarEquipeRel('${tipo}', '${membroId}')" 
                            style="background: #ffc107; color: #333; margin-right: 5px; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">
                        ✏️ Editar
                    </button>
                    <button class="btn small" onclick="excluirEquipeRel('${tipo}', '${membroId}')" 
                            style="background: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">
                        🗑️ Excluir
                    </button>
                 </td>`;
        html += `</tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        <div style="margin-top: 1rem; text-align: right;">
            <small>Total: ${dados.length} registros</small>
        </div>
    `;
    
    return html;
}

// Função para filtrar tabela de equipe
function filtrarTabelaEquipeRel(input) {
    const filter = input ? input.value.toLowerCase() : '';
    const table = document.getElementById('tabelaEquipeRel');
    if (!table) return;
    
    const rows = table.getElementsByTagName('tbody')[0]?.getElementsByTagName('tr') || [];
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const nome = row.getAttribute('data-nome') || '';
        const documento = row.getAttribute('data-documento') || '';
        const telefone = row.getAttribute('data-telefone') || '';
        
        const matches = filter === '' || 
            nome.includes(filter) || 
            documento.includes(filter) || 
            telefone.includes(filter);
        
        row.style.display = matches ? '' : 'none';
    }
}

// Função para carregar relatório de equipe
function carregarRelatorioEquipe(container) {
    console.log('👥 Carregando relatório de equipe...');
    
    let elenco = [];
    let motoristas = [];
    let funcionarios = [];
    
    try {
        // ELENCO
        let elencoDados = localStorage.getItem('elenco_cadastrados');
        if (elencoDados) elenco = JSON.parse(elencoDados);
        if (elenco.length === 0) {
            elencoDados = localStorage.getItem('elenco');
            if (elencoDados) elenco = JSON.parse(elencoDados);
        }
        
        // MOTORISTAS
        let motoristasDados = localStorage.getItem('motoristas_cadastrados');
        if (motoristasDados) motoristas = JSON.parse(motoristasDados);
        if (motoristas.length === 0) {
            motoristasDados = localStorage.getItem('motoristas');
            if (motoristasDados) motoristas = JSON.parse(motoristasDados);
        }
        
        // FUNCIONARIOS
        let funcionariosDados = localStorage.getItem('funcionarios_cadastrados');
        if (funcionariosDados) funcionarios = JSON.parse(funcionariosDados);
        if (funcionarios.length === 0) {
            funcionariosDados = localStorage.getItem('funcionarios');
            if (funcionariosDados) funcionarios = JSON.parse(funcionariosDados);
        }
        
        console.log(`📊 Elenco: ${elenco.length}, Motoristas: ${motoristas.length}, Funcionários: ${funcionarios.length}`);
        
    } catch(e) {
        console.error('Erro ao carregar dados:', e);
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: #e8f4fd; padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s;" 
                 onclick="mostrarAbaEquipeRel('elenco')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <div style="font-size: 2rem;">🎭</div>
                <div style="font-size: 1.8rem; font-weight: bold;">${elenco.length}</div>
                <div style="font-weight: bold;">Elenco</div>
                <small style="color: #666;">Membros do elenco cadastrados</small>
            </div>
            <div style="background: #d4edda; padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s;" 
                 onclick="mostrarAbaEquipeRel('motoristas')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <div style="font-size: 2rem;">🚗</div>
                <div style="font-size: 1.8rem; font-weight: bold;">${motoristas.length}</div>
                <div style="font-weight: bold;">Motoristas</div>
                <small style="color: #666;">Motoristas cadastrados</small>
            </div>
            <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s;" 
                 onclick="mostrarAbaEquipeRel('funcionarios')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <div style="font-size: 2rem;">👥</div>
                <div style="font-size: 1.8rem; font-weight: bold;">${funcionarios.length}</div>
                <div style="font-weight: bold;">Funcionários</div>
                <small style="color: #666;">Funcionários cadastrados</small>
            </div>
        </div>
        <div id="abaEquipeContainerRel">
            ${montarTabelaEquipeCompleta('elenco', elenco)}
        </div>
    `;
}


// Função para salvar dados editados (SALVAR COMPLETO)
function salvarEquipeEditado(tipo, id, dadosAtualizados) {
    console.log(`💾 Salvando ${tipo} editado:`, id);
    
    let storageKey = '';
    let backupKey = '';
    
    switch(tipo) {
        case 'elenco':
            storageKey = 'elenco_cadastrados';
            backupKey = 'elenco';
            break;
        case 'motoristas':
            storageKey = 'motoristas_cadastrados';
            backupKey = 'motoristas';
            break;
        case 'funcionarios':
            storageKey = 'funcionarios_cadastrados';
            backupKey = 'funcionarios';
            break;
        default:
            mostrarMensagemToast('❌ Tipo inválido!', true);
            return false;
    }
    
    try {
        // Carregar dados existentes
        let dados = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (dados.length === 0) {
            dados = JSON.parse(localStorage.getItem(backupKey) || '[]');
        }
        
        // Encontrar e atualizar o registro
        const index = dados.findIndex(m => {
            const mId = m.id || m.ID_elenco || m.ID_motoristas || m.ID_funcionarios;
            return mId == id;
        });
        
        if (index !== -1) {
            // Preservar campos que não foram atualizados
            dados[index] = { ...dados[index], ...dadosAtualizados, data_atualizacao: new Date().toISOString() };
            localStorage.setItem(storageKey, JSON.stringify(dados));
            console.log('✅ Dados salvos com sucesso!');
            return true;
        } else {
            console.error('❌ Registro não encontrado para atualização');
            return false;
        }
    } catch(e) {
        console.error('Erro ao salvar:', e);
        return false;
    }
}

// Função para coletar dados do formulário de edição e salvar
function coletarESalvarEquipeEditado(tipo, id) {
    console.log(`📝 Coletando dados do formulário para ${tipo}...`);
    
    let dadosAtualizados = {};
    
    if (tipo === 'motoristas') {
        dadosAtualizados = {
            // Dados básicos
            nome_motoristas: document.getElementById('nome_motoristas')?.value || '',
            doc_motoristas_cadastro: document.getElementById('doc_motoristas_cadastro')?.value?.replace(/\D/g, '') || '',
            telefone_motoristas: document.getElementById('telefone_motoristas')?.value || '',
            email_motoristas: document.getElementById('email_motoristas')?.value || '',
            aceita_producao_motoristas: document.getElementById('aceita_producao_motoristas')?.value || 'nao',
            
            // Data de nascimento e idade
            data_nascimento_motoristas: document.getElementById('data_nascimento_motoristas')?.value || '',
            idade_motoristas: document.getElementById('idade_motoristas')?.value || '',
            
            // Dados específicos
            cnh_motoristas: document.getElementById('cnh_motoristas')?.value || '',
            veiculo_motoristas: document.getElementById('veiculo_motoristas')?.value || '',
            placa_motoristas: document.getElementById('placa_motoristas')?.value || '',
            chave_pix_motoristas: document.getElementById('chave_pix_motoristas')?.value || '',
            
            // Endereço
            cep_motoristas: document.getElementById('cep_motoristas')?.value?.replace(/\D/g, '') || '',
            logradouro_motoristas: document.getElementById('logradouro_motoristas')?.value || '',
            numero_motoristas: document.getElementById('numero_motoristas')?.value || '',
            complemento_motoristas: document.getElementById('complemento_motoristas')?.value || '',
            bairro_motoristas: document.getElementById('bairro_motoristas')?.value || '',
            cidade_motoristas: document.getElementById('cidade_motoristas')?.value || '',
            estado_motoristas: document.getElementById('estado_motoristas')?.value || ''
        };
    } else if (tipo === 'elenco') {
        dadosAtualizados = {
            // Dados básicos
            nome_elenco: document.getElementById('nome_elenco')?.value || '',
            doc_elenco_cadastro: document.getElementById('doc_elenco_cadastro')?.value?.replace(/\D/g, '') || '',
            telefone_elenco: document.getElementById('telefone_elenco')?.value || '',
            email_elenco: document.getElementById('email_elenco')?.value || '',
            aceita_producao_elenco: document.getElementById('aceita_producao_elenco')?.value || 'nao',
            
            // Data de nascimento e idade
            data_nascimento_elenco: document.getElementById('data_nascimento_elenco')?.value || '',
            idade_elenco: document.getElementById('idade_elenco')?.value || '',
            
            // Dados específicos
            faz_drive_elenco: document.getElementById('faz_drive_elenco')?.value || 'nao',
            chave_pix_elenco: document.getElementById('chave_pix_elenco')?.value || '',
            
            // Dados de motorista (se fizer drive)
            cnh_motorista_elenco: document.getElementById('cnh_motorista_elenco')?.value || '',
            modelo_carro_elenco: document.getElementById('modelo_carro_elenco')?.value || '',
            placa_carro_elenco: document.getElementById('placa_carro_elenco')?.value || '',
            
            // Endereço
            cep_elenco: document.getElementById('cep_elenco')?.value?.replace(/\D/g, '') || '',
            logradouro_elenco: document.getElementById('logradouro_elenco')?.value || '',
            numero_elenco: document.getElementById('numero_elenco')?.value || '',
            complemento_elenco: document.getElementById('complemento_elenco')?.value || '',
            bairro_elenco: document.getElementById('bairro_elenco')?.value || '',
            cidade_elenco: document.getElementById('cidade_elenco')?.value || '',
            estado_elenco: document.getElementById('estado_elenco')?.value || ''
        };
    } else if (tipo === 'funcionarios') {
        dadosAtualizados = {
            nome_funcionarios: document.getElementById('nome_funcionarios')?.value || '',
            doc_funcionarios_cadastro: document.getElementById('doc_funcionarios_cadastro')?.value?.replace(/\D/g, '') || '',
            telefone_funcionarios: document.getElementById('telefone_funcionarios')?.value || '',
            email_funcionarios: document.getElementById('email_funcionarios')?.value || '',
            cargo_funcionarios: document.getElementById('cargo_funcionarios')?.value || '',
            data_nascimento_funcionarios: document.getElementById('data_nascimento_funcionarios')?.value || '',
            idade_funcionarios: document.getElementById('idade_funcionarios')?.value || '',
            cep_funcionarios: document.getElementById('cep_funcionarios')?.value?.replace(/\D/g, '') || '',
            logradouro_funcionarios: document.getElementById('logradouro_funcionarios')?.value || '',
            numero_funcionarios: document.getElementById('numero_funcionarios')?.value || '',
            complemento_funcionarios: document.getElementById('complemento_funcionarios')?.value || '',
            bairro_funcionarios: document.getElementById('bairro_funcionarios')?.value || '',
            cidade_funcionarios: document.getElementById('cidade_funcionarios')?.value || '',
            estado_funcionarios: document.getElementById('estado_funcionarios')?.value || ''
        };
    }
    
    // Salvar os dados
    const sucesso = salvarEquipeEditado(tipo, id, dadosAtualizados);
    
    if (sucesso) {
        mostrarMensagemToast(`✅ ${tipo === 'motoristas' ? 'Motorista' : (tipo === 'elenco' ? 'Membro do Elenco' : 'Funcionário')} atualizado com sucesso!`);
        
        // Limpar sessionStorage
        sessionStorage.removeItem('editarEquipeId');
        sessionStorage.removeItem('editarEquipeTipo');
        sessionStorage.removeItem('editarEquipeDados');
        
        // Voltar para relatórios
        if (typeof carregarRelatorio === 'function') {
            carregarRelatorio('relatorio_equipe');
        } else if (typeof showPage === 'function') {
            showPage('relatorio_equipe');
            setTimeout(() => {
                if (typeof carregarRelatorioEquipe === 'function') {
                    const container = document.getElementById('conteudoRelatorio_relatorio_equipe');
                    if (container) carregarRelatorioEquipe(container);
                }
            }, 200);
        }
        
        return true;
    } else {
        mostrarMensagemToast('❌ Erro ao salvar os dados!', true);
        return false;
    }
}

// Função para preencher formulário de equipe com todos os dados (completa)
function preencherFormularioEquipeCompleto(tipo, membro) {
    console.log(`📝 Preenchendo formulário de ${tipo} com dados completos:`, membro);
    console.log('🔍 Todas as chaves disponíveis:', Object.keys(membro));
    
    try {
        if (tipo === 'motoristas') {
            // ID
            const idField = document.getElementById('ID_motoristas');
            if (idField) idField.value = membro.id || membro.ID_motoristas || '';
            
            // Nome
            const nomeField = document.getElementById('nome_motoristas');
            if (nomeField) nomeField.value = membro.nome_motoristas || membro.nome || '';
            
            // Documento
            const docField = document.getElementById('doc_motoristas_cadastro');
            if (docField) {
                let doc = membro.doc_motoristas_cadastro || membro.documento || '';
                if (doc && doc.length === 11) {
                    docField.value = doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else if (doc && doc.length === 14) {
                    docField.value = doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                } else {
                    docField.value = doc;
                }
            }
            
            // Telefone
            const telefoneField = document.getElementById('telefone_motoristas');
            if (telefoneField) telefoneField.value = membro.telefone_motoristas || membro.telefone || '';
            
            // Email
            const emailField = document.getElementById('email_motoristas');
            if (emailField) emailField.value = membro.email_motoristas || membro.email || '';
            
            // Aceita Produção
            const aceitaField = document.getElementById('aceita_producao_motoristas');
            if (aceitaField) aceitaField.value = membro.aceita_producao_motoristas || 'nao';
            
            // DATA DE NASCIMENTO E IDADE
            const dataField = document.getElementById('data_nascimento_motoristas');
            if (dataField && membro.data_nascimento_motoristas) {
                dataField.value = membro.data_nascimento_motoristas;
                const idadeField = document.getElementById('idade_motoristas');
                if (idadeField && dataField.value) {
                    const hoje = new Date();
                    const nascimento = new Date(dataField.value);
                    let idade = hoje.getFullYear() - nascimento.getFullYear();
                    const mesDiff = hoje.getMonth() - nascimento.getMonth();
                    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
                        idade--;
                    }
                    idadeField.value = idade > 0 ? `${idade} anos` : '';
                }
            }
            
            // CNH
            const cnhField = document.getElementById('cnh_motoristas');
            if (cnhField) cnhField.value = membro.cnh_motoristas || '';
            
            // Veículo
            const veiculoField = document.getElementById('veiculo_motoristas');
            if (veiculoField) veiculoField.value = membro.veiculo_motoristas || '';
            
            // Placa
            const placaField = document.getElementById('placa_motoristas');
            if (placaField) placaField.value = membro.placa_motoristas || '';
            
            // Chave PIX
            const pixField = document.getElementById('chave_pix_motoristas');
            if (pixField) pixField.value = membro.chave_pix_motoristas || '';
            
            // ========== ENDEREÇO ==========
            const cepField = document.getElementById('cep_motoristas');
            if (cepField && membro.cep_motoristas) {
                let cep = membro.cep_motoristas;
                if (cep.length === 8) cep = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
                cepField.value = cep;
            }
            
            const logradouroField = document.getElementById('logradouro_motoristas');
            if (logradouroField) logradouroField.value = membro.logradouro_motoristas || '';
            
            const numeroField = document.getElementById('numero_motoristas');
            if (numeroField) numeroField.value = membro.numero_motoristas || '';
            
            const complementoField = document.getElementById('complemento_motoristas');
            if (complementoField) {
                let complemento = membro.complemento_motoristas || membro.complemento || '';
                complementoField.value = complemento;
            }
            
            const bairroField = document.getElementById('bairro_motoristas');
            if (bairroField) bairroField.value = membro.bairro_motoristas || '';
            
            const cidadeField = document.getElementById('cidade_motoristas');
            if (cidadeField) cidadeField.value = membro.cidade_motoristas || '';
            
            const estadoField = document.getElementById('estado_motoristas');
            if (estadoField) estadoField.value = membro.estado_motoristas || '';
            
            // Adicionar botão de salvar se não existir
            adicionarBotaoSalvarEdicao(tipo);
            
            mostrarMensagemToast('✅ Dados do motorista carregados para edição!');
            
        } else if (tipo === 'elenco') {
            // ID
            const idField = document.getElementById('ID_elenco');
            if (idField) idField.value = membro.id || membro.ID_elenco || '';
            
            // Nome
            const nomeField = document.getElementById('nome_elenco');
            if (nomeField) nomeField.value = membro.nome_elenco || membro.nome || '';
            
            // Documento
            const docField = document.getElementById('doc_elenco_cadastro');
            if (docField) {
                let doc = membro.doc_elenco_cadastro || '';
                if (doc && doc.length === 11) {
                    docField.value = doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else {
                    docField.value = doc;
                }
            }
            
            // Telefone
            const telefoneField = document.getElementById('telefone_elenco');
            if (telefoneField) telefoneField.value = membro.telefone_elenco || '';
            
            // Email
            const emailField = document.getElementById('email_elenco');
            if (emailField) emailField.value = membro.email_elenco || '';
            
            // Aceita Produção
            const aceitaField = document.getElementById('aceita_producao_elenco');
            if (aceitaField) aceitaField.value = membro.aceita_producao_elenco || 'nao';
            
            // Data Nascimento
            const dataField = document.getElementById('data_nascimento_elenco');
            if (dataField && membro.data_nascimento_elenco) {
                dataField.value = membro.data_nascimento_elenco;
                const idadeField = document.getElementById('idade_elenco');
                if (idadeField && dataField.value) {
                    const hoje = new Date();
                    const nascimento = new Date(dataField.value);
                    let idade = hoje.getFullYear() - nascimento.getFullYear();
                    const mesDiff = hoje.getMonth() - nascimento.getMonth();
                    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
                        idade--;
                    }
                    idadeField.value = idade > 0 ? `${idade} anos` : '';
                }
            }
            
            // Faz Drive
            const fazDriveField = document.getElementById('faz_drive_elenco');
            if (fazDriveField) {
                fazDriveField.value = membro.faz_drive_elenco || 'nao';
                if (typeof toggleCamposMotorista === 'function') {
                    setTimeout(() => toggleCamposMotorista(), 100);
                }
            }
            
            // Chave PIX
            const pixField = document.getElementById('chave_pix_elenco');
            if (pixField) pixField.value = membro.chave_pix_elenco || '';
            
            // Dados do motorista
            const cnhMotoristaField = document.getElementById('cnh_motorista_elenco');
            if (cnhMotoristaField) cnhMotoristaField.value = membro.cnh_motorista_elenco || '';
            
            const modeloField = document.getElementById('modelo_carro_elenco');
            if (modeloField) modeloField.value = membro.modelo_carro_elenco || '';
            
            const placaMotoristaField = document.getElementById('placa_carro_elenco');
            if (placaMotoristaField) placaMotoristaField.value = membro.placa_carro_elenco || '';
            
            // Endereço
            const cepField = document.getElementById('cep_elenco');
            if (cepField && membro.cep_elenco) {
                let cep = membro.cep_elenco;
                if (cep.length === 8) cep = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
                cepField.value = cep;
            }
            
            const logradouroField = document.getElementById('logradouro_elenco');
            if (logradouroField) logradouroField.value = membro.logradouro_elenco || '';
            
            const numeroField = document.getElementById('numero_elenco');
            if (numeroField) numeroField.value = membro.numero_elenco || '';
            
            const complementoField = document.getElementById('complemento_elenco');
            if (complementoField) {
                let complemento = membro.complemento_elenco || membro.complemento || '';
                complementoField.value = complemento;
            }
            
            const bairroField = document.getElementById('bairro_elenco');
            if (bairroField) bairroField.value = membro.bairro_elenco || '';
            
            const cidadeField = document.getElementById('cidade_elenco');
            if (cidadeField) cidadeField.value = membro.cidade_elenco || '';
            
            const estadoField = document.getElementById('estado_elenco');
            if (estadoField) estadoField.value = membro.estado_elenco || '';
            
            adicionarBotaoSalvarEdicao(tipo);
            mostrarMensagemToast('✅ Dados do elenco carregados para edição!');
            
        } else if (tipo === 'funcionarios') {
            // ID
            const idField = document.getElementById('ID_funcionarios');
            if (idField) idField.value = membro.id || membro.ID_funcionarios || '';
            
            // Nome
            const nomeField = document.getElementById('nome_funcionarios');
            if (nomeField) nomeField.value = membro.nome_funcionarios || membro.nome || '';
            
            // Documento
            const docField = document.getElementById('doc_funcionarios_cadastro');
            if (docField) docField.value = membro.doc_funcionarios_cadastro || '';
            
            // Telefone
            const telefoneField = document.getElementById('telefone_funcionarios');
            if (telefoneField) telefoneField.value = membro.telefone_funcionarios || '';
            
            // Email
            const emailField = document.getElementById('email_funcionarios');
            if (emailField) emailField.value = membro.email_funcionarios || '';
            
            // Cargo
            const cargoField = document.getElementById('cargo_funcionarios');
            if (cargoField) cargoField.value = membro.cargo_funcionarios || membro.cargo || '';
            
            // Data Nascimento
            const dataField = document.getElementById('data_nascimento_funcionarios');
            if (dataField && membro.data_nascimento_funcionarios) {
                dataField.value = membro.data_nascimento_funcionarios;
            }
            
            adicionarBotaoSalvarEdicao(tipo);
            mostrarMensagemToast('✅ Dados do funcionário carregados para edição!');
        }
        
        // Destacar campos preenchidos
        setTimeout(() => {
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.value && input.type !== 'hidden' && !input.id?.includes('ID_')) {
                    input.style.backgroundColor = '#e8f5e9';
                    input.style.transition = 'all 0.5s';
                    setTimeout(() => {
                        if (input) input.style.backgroundColor = '';
                    }, 1500);
                }
            });
        }, 200);
        
    } catch(e) {
        console.error('Erro ao preencher formulário:', e);
        mostrarMensagemToast('⚠️ Erro ao carregar alguns dados, verifique manualmente', true);
    }
}

// Função para adicionar botão de salvar na página de edição
function adicionarBotaoSalvarEdicao(tipo) {
    // Verificar se o botão já existe
    if (document.getElementById('btnSalvarEdicaoEquipe')) return;
    
    // Encontrar os botões de ação
    const formActions = document.querySelector('.form-actions');
    if (!formActions) return;
    
    // Criar botão de salvar
    const btnSalvar = document.createElement('button');
    btnSalvar.id = 'btnSalvarEdicaoEquipe';
    btnSalvar.type = 'button';
    btnSalvar.className = 'btn primary';
    btnSalvar.style.background = '#28a745';
    btnSalvar.style.color = 'white';
    btnSalvar.style.marginLeft = '10px';
    btnSalvar.innerHTML = '💾 Salvar Alterações e Voltar';
    
    // Obter ID do membro sendo editado
    const membroId = sessionStorage.getItem('editarEquipeId');
    
    btnSalvar.onclick = function() {
        if (confirm('✅ Deseja salvar as alterações e voltar para o relatório?')) {
            coletarESalvarEquipeEditado(tipo, membroId);
        }
    };
    
    formActions.appendChild(btnSalvar);
    
    // Também modificar o botão de limpar para cancelar edição
    const btnLimpar = formActions.querySelector('.btn:not(.primary)');
    if (btnLimpar && btnLimpar.textContent.includes('Limpar')) {
        btnLimpar.textContent = '❌ Cancelar Edição';
        btnLimpar.onclick = function() {
            if (confirm('⚠️ Deseja cancelar a edição e voltar ao relatório? As alterações não serão salvas.')) {
                sessionStorage.removeItem('editarEquipeId');
                sessionStorage.removeItem('editarEquipeTipo');
                sessionStorage.removeItem('editarEquipeDados');
                
                if (typeof carregarRelatorio === 'function') {
                    carregarRelatorio('relatorio_equipe');
                } else if (typeof showPage === 'function') {
                    showPage('relatorio_equipe');
                }
            }
        };
    }
}

// Função para carregar relatório de equipe (principal)
function carregarRelatorioEquipe(container) {
    console.log('👥 Carregando relatório de equipe...');
    
    let elenco = [];
    let motoristas = [];
    let funcionarios = [];
    
    try {
        // ELENCO
        let elencoDados = localStorage.getItem('elenco_cadastrados');
        if (elencoDados) elenco = JSON.parse(elencoDados);
        if (elenco.length === 0) {
            elencoDados = localStorage.getItem('elenco');
            if (elencoDados) elenco = JSON.parse(elencoDados);
        }
        
        // MOTORISTAS
        let motoristasDados = localStorage.getItem('motoristas_cadastrados');
        if (motoristasDados) motoristas = JSON.parse(motoristasDados);
        if (motoristas.length === 0) {
            motoristasDados = localStorage.getItem('motoristas');
            if (motoristasDados) motoristas = JSON.parse(motoristasDados);
        }
        
        // FUNCIONARIOS
        let funcionariosDados = localStorage.getItem('funcionarios_cadastrados');
        if (funcionariosDados) funcionarios = JSON.parse(funcionariosDados);
        if (funcionarios.length === 0) {
            funcionariosDados = localStorage.getItem('funcionarios');
            if (funcionariosDados) funcionarios = JSON.parse(funcionariosDados);
        }
        
        console.log(`📊 Elenco: ${elenco.length}, Motoristas: ${motoristas.length}, Funcionários: ${funcionarios.length}`);
        
    } catch(e) {
        console.error('Erro ao carregar dados:', e);
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: #e8f4fd; padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s;" 
                 onclick="mostrarAbaEquipeRel('elenco')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <div style="font-size: 2rem;">🎭</div>
                <div style="font-size: 1.8rem; font-weight: bold;">${elenco.length}</div>
                <div style="font-weight: bold;">Elenco</div>
                <small style="color: #666;">Membros do elenco cadastrados</small>
            </div>
            <div style="background: #d4edda; padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s;" 
                 onclick="mostrarAbaEquipeRel('motoristas')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <div style="font-size: 2rem;">🚗</div>
                <div style="font-size: 1.8rem; font-weight: bold;">${motoristas.length}</div>
                <div style="font-weight: bold;">Motoristas</div>
                <small style="color: #666;">Motoristas cadastrados</small>
            </div>
            <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s;" 
                 onclick="mostrarAbaEquipeRel('funcionarios')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <div style="font-size: 2rem;">👥</div>
                <div style="font-size: 1.8rem; font-weight: bold;">${funcionarios.length}</div>
                <div style="font-weight: bold;">Funcionários</div>
                <small style="color: #666;">Funcionários cadastrados</small>
            </div>
        </div>
        <div id="abaEquipeContainerRel">
            ${montarTabelaEquipeCompleta('elenco', elenco)}
        </div>
    `;
}

// Exportar funções
window.carregarRelatorioEquipe = carregarRelatorioEquipe;
window.montarTabelaEquipeCompleta = montarTabelaEquipeCompleta;
window.mostrarAbaEquipeRel = mostrarAbaEquipeRel;
window.filtrarTabelaEquipeRel = filtrarTabelaEquipeRel;
window.calcularIdadeTexto = calcularIdadeTexto;
window.coletarESalvarEquipeEditado = coletarESalvarEquipeEditado;
window.salvarEquipeEditado = salvarEquipeEditado;
window.preencherFormularioEquipeCompleto = preencherFormularioEquipeCompleto;
window.adicionarBotaoSalvarEdicao = adicionarBotaoSalvarEdicao;

console.log('✅ Funções de equipe corrigidas e carregadas!');

function gerarTabelaEquipeRel(tipo, dados) {
    if (dados.length === 0) {
        return `<div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px;">Nenhum membro cadastrado</div>`;
    }
    
    let html = `
        <div class="table-container">
            <div style="margin-bottom: 1rem;">
                <input type="text" id="buscarEquipeRel" placeholder="🔍 Buscar..." 
                       style="padding: 8px; width: 100%; max-width: 300px; border: 1px solid #ddd; border-radius: 4px;" 
                       onkeyup="filtrarTabelaRelatorio('tabelaEquipeRel', this)">
            </div>
            <table class="tabela-relatorio" id="tabelaEquipeRel" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">ID</th>
                        <th style="padding: 10px; text-align: left;">Nome</th>
                        <th style="padding: 10px; text-align: left;">Documento</th>
                        <th style="padding: 10px; text-align: left;">Telefone</th>
                        <th style="padding: 10px; text-align: left;">Email</th>
                        <th style="padding: 10px; text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    dados.forEach((m, index) => {
        const membroId = m.id || m.ID_elenco || m.ID_motoristas || m.ID_funcionarios || index;
        const nome = m.nome_elenco || m.nome_motoristas || m.nome_funcionarios || m.nome || '-';
        const documento = m.doc_elenco_cadastro || m.doc_motoristas_cadastro || m.doc_funcionarios_cadastro || '';
        const telefone = m.telefone_elenco || m.telefone_motoristas || m.telefone_funcionarios || m.telefone || '-';
        const email = m.email_elenco || m.email_motoristas || m.email_funcionarios || m.email || '-';
        
        html += `
            <tr data-id="${membroId}">
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${membroId}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${nome}</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatarDocumento(documento)}</
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${telefone}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    <button class="btn small" onclick="editarEquipeRel('${tipo}', '${membroId}')" style="background: #ffc107; color: #333; margin-right: 5px;">✏️ Editar</button>
                    <button class="btn small" onclick="excluirEquipeRel('${tipo}', '${membroId}')" style="background: #dc3545; color: white;">🗑️ Excluir</button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; text-align: right;">
            <small>Total: ${dados.length} membros</small>
        </div>
    `;
    
    return html;
}


// ==================== FUNÇÃO VISUALIZAR EVENTO ====================

function visualizarEvento(eventoId) {
    console.log('👁️ Visualizando evento:', eventoId);
    
    let eventos = [];
    try {
        const stored = localStorage.getItem('eventos_cadastrados');
        if (stored) eventos = JSON.parse(stored);
        if (eventos.length === 0) {
            const stored2 = localStorage.getItem('eventos');
            if (stored2) eventos = JSON.parse(stored2);
        }
    } catch(e) {
        console.error('Erro ao carregar eventos:', e);
    }
    
    const evento = eventos.find(e => (e.id == eventoId || e.ID_eventos == eventoId));
    
    if (!evento) {
        mostrarMensagemToast('❌ Evento não encontrado!', true);
        return;
    }
    
    const valorTotal = parseFloat(evento.valor_total || evento.valor || evento.valor_evento || 0);
    const sinal = parseFloat(evento.valor_sinal || evento.sinal || 0);
    const dataSinal = evento.data_sinal || evento.dataSinal || '';
    
    const modalHtml = `
        <div id="modalEventoVisualizar" class="modal-evento">
            <div class="modal-evento-content">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 2px solid #17a2b8; background: #f8f9fa;">
                    <h2 style="margin: 0; color: #17a2b8;">📅 Detalhes do Evento</h2>
                    <button onclick="fecharModalEvento()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div style="padding: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                        <div><strong>📅 Data do Evento:</strong><br>${formatarData(evento.data_evento || evento.data)}</div>
                        <div><strong>👤 Cliente:</strong><br>${escapeHtml(evento.cliente_nome || evento.cliente || '-')}</div>
                        <div><strong>🏠 Local:</strong><br>${escapeHtml(evento.local || evento.nome_local_evento || evento.casa_festa || '-')}</div>
                        <div><strong>🎭 Tema:</strong><br>${escapeHtml(evento.tema_evento || evento.tipo_evento || '-')}</div>
                        <div><strong>💰 Valor Total:</strong><br>${formatarMoeda(valorTotal)}</div>
                        <div><strong>💵 Sinal:</strong><br>${formatarMoeda(sinal)}</div>
                        <div><strong>📅 Data do Sinal:</strong><br>${formatarData(dataSinal)}</div>
                        <div><strong>📌 Status:</strong><br><span class="badge ${getStatusBadgeClass(evento.status_evento || evento.status)}">${evento.status_evento || evento.status || 'Reservado'}</span></div>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
                        <strong>📋 Observações:</strong><br>
                        ${escapeHtml(evento.observacoes || evento.obs || 'Nenhuma observação')}
                    </div>
                </div>
                <div style="padding: 15px 20px; background: #f8f9fa; text-align: right; border-top: 1px solid #eee;">
                    <button onclick="fecharModalEvento()" class="btn">Fechar</button>
                    <button onclick="editarEvento('${eventoId}'); fecharModalEvento();" class="btn" style="background: #ffc107; color: #333;">✏️ Editar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function fecharModalEvento() {
    const modal = document.getElementById('modalEventoVisualizar');
    if (modal) modal.remove();
}

// ==================== FUNÇÕES DE EDIÇÃO CORRIGIDAS ====================

// Eventos
function editarEvento(eventoId) {
    console.log('✏️ Editando evento:', eventoId);
    
    // Buscar o evento no localStorage
    let eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    if (eventos.length === 0) eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    const evento = eventos.find(e => (e.id == eventoId || e.ID_eventos == eventoId));
    
    if (!evento) {
        mostrarMensagemToast('❌ Evento não encontrado!', true);
        return;
    }
    
    // Salvar dados no sessionStorage para recuperar na página de edição
    sessionStorage.setItem('editarEventoId', eventoId);
    sessionStorage.setItem('editarEventoDados', JSON.stringify(evento));
    
    // Redirecionar para a página de reservar evento
    if (typeof showPage === 'function') {
        showPage('reservar_evento');
        
        // Aguardar a página carregar e preencher os dados
        setTimeout(() => {
            if (typeof preencherEventoParaEdicao === 'function') {
                preencherEventoParaEdicao(evento);
            } else {
                preencherFormularioEvento(evento);
            }
        }, 300);
    } else {
        alert('Função de navegação não disponível');
    }
}

function preencherFormularioEvento(evento) {
    console.log('📝 Preenchendo formulário do evento:', evento);
    try {
        // Preencher campos do formulário
        const campos = {
            'cliente_nome': evento.cliente_nome || evento.cliente || '',
            'data_evento': evento.data_evento || evento.data || '',
            'local': evento.local || evento.nome_local_evento || '',
            'tema_evento': evento.tema_evento || evento.tipo_evento || '',
            'valor_total': evento.valor_total || evento.valor || '',
            'valor_sinal': evento.valor_sinal || evento.sinal || '',
            'status_evento': evento.status_evento || evento.status || 'Reservado'
        };
        
        for (const [campo, valor] of Object.entries(campos)) {
            const input = document.querySelector(`[name="${campo}"], [id="${campo}"]`);
            if (input) input.value = valor;
        }
        
        // Preencher personagens selecionados
        if (evento.personagens) {
            const personagensIds = Array.isArray(evento.personagens) ? evento.personagens : [evento.personagens];
            // Disparar evento para marcar checkboxes
            if (typeof marcarPersonagensSelecionados === 'function') {
                marcarPersonagensSelecionados(personagensIds);
            }
        }
        
        mostrarMensagemToast('✅ Dados do evento carregados para edição!');
    } catch(e) {
        console.error('Erro ao preencher formulário:', e);
        mostrarMensagemToast('⚠️ Dados carregados, revise os campos manualmente', false);
    }
}

function excluirEvento(eventoId) {
    if (confirm('⚠️ Tem certeza que deseja excluir este evento?')) {
        let eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
        eventos = eventos.filter(e => (e.id != eventoId && e.ID_eventos != eventoId));
        localStorage.setItem('eventos_cadastrados', JSON.stringify(eventos));
        mostrarMensagemToast('✅ Evento excluído com sucesso!');
        carregarRelatorio('relatorio_eventos');
    }
}

// Clientes
function editarCliente(clienteId) {
    console.log('✏️ Editando cliente:', clienteId);
    
    let clientes = JSON.parse(localStorage.getItem('clientes_cadastrados') || '[]');
    if (clientes.length === 0) clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    const cliente = clientes.find(c => (c.id == clienteId || c.ID_clientes == clienteId));
    
    if (!cliente) {
        mostrarMensagemToast('❌ Cliente não encontrado!', true);
        return;
    }
    
    sessionStorage.setItem('editarClienteId', clienteId);
    sessionStorage.setItem('editarClienteDados', JSON.stringify(cliente));
    
    if (typeof showPage === 'function') {
        showPage('clientes');
        setTimeout(() => {
            if (typeof preencherClienteParaEdicao === 'function') {
                preencherClienteParaEdicao(cliente);
            } else {
                preencherFormularioCliente(cliente);
            }
        }, 300);
    }
}

function preencherFormularioCliente(cliente) {
    console.log('📝 Preenchendo formulário do cliente:', cliente);
    try {
        const campos = {
            'nome_clientes': cliente.nome_clientes || cliente.nome || '',
            'telefone_cliente': cliente.telefone_cliente || cliente.telefone || '',
            'email_cliente': cliente.email_cliente || cliente.email || '',
            'doc_clientes_cadastros_cpf': cliente.doc_clientes_cadastros_cpf || '',
            'doc_clientes_cadastros_cnpj': cliente.doc_clientes_cadastros_cnpj || ''
        };
        
        for (const [campo, valor] of Object.entries(campos)) {
            const input = document.querySelector(`[name="${campo}"], [id="${campo}"]`);
            if (input && valor) input.value = valor;
        }
        mostrarMensagemToast('✅ Dados do cliente carregados para edição!');
    } catch(e) {
        console.error('Erro ao preencher formulário:', e);
    }
}

function excluirCliente(clienteId) {
    if (confirm('⚠️ Tem certeza que deseja excluir este cliente?')) {
        let clientes = JSON.parse(localStorage.getItem('clientes_cadastrados') || '[]');
        clientes = clientes.filter(c => (c.id != clienteId && c.ID_clientes != clienteId));
        localStorage.setItem('clientes_cadastrados', JSON.stringify(clientes));
        mostrarMensagemToast('✅ Cliente excluído com sucesso!');
        carregarRelatorio('relatorio_clientes');
    }
}

// Personagens
// ==================== FUNÇÃO EDITAR PERSONAGEM CORRIGIDA ====================

function editarPersonagem(personagemId) {
    console.log('✏️ Editando personagem:', personagemId);
    
    // Buscar personagem em todos os possíveis storages
    let personagem = null;
    let storageOrigem = '';
    
    try {
        // Tentar buscar em personagens_cadastrados
        let personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
        personagem = personagens.find(p => (p.id == personagemId || p.ID_personagens == personagemId || p.ID == personagemId));
        if (personagem) storageOrigem = 'personagens_cadastrados';
        
        // Se não encontrar, tentar em personagens
        if (!personagem) {
            personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
            personagem = personagens.find(p => (p.id == personagemId || p.ID_personagens == personagemId || p.ID == personagemId));
            if (personagem) storageOrigem = 'personagens';
        }
        
        // Se ainda não encontrar, tentar em personagens_cadastrados com chaves diferentes
        if (!personagem) {
            const todasChaves = ['personagens_cadastrados', 'personagens', 'lista_personagens', 'cadastro_personagens'];
            for (const chave of todasChaves) {
                const dados = JSON.parse(localStorage.getItem(chave) || '[]');
                const encontrado = dados.find(p => (p.id == personagemId || p.ID_personagens == personagemId || p.ID == personagemId));
                if (encontrado) {
                    personagem = encontrado;
                    storageOrigem = chave;
                    break;
                }
            }
        }
    } catch(e) {
        console.error('Erro ao buscar personagem:', e);
    }
    
    if (!personagem) {
        mostrarMensagemToast('❌ Personagem não encontrado!', true);
        return;
    }
    
    // Salvar dados completos no sessionStorage
    sessionStorage.setItem('editarPersonagemId', personagemId);
    sessionStorage.setItem('editarPersonagemOrigem', storageOrigem);
    sessionStorage.setItem('editarPersonagemDados', JSON.stringify(personagem));
    
    // Redirecionar para a página de personagens
    if (typeof showPage === 'function') {
        showPage('personagens');
        
        // Aguardar a página carregar e preencher os dados
        setTimeout(() => {
            preencherFormularioPersonagemCompleto(personagem);
        }, 300);
    } else {
        alert('Função de navegação não disponível');
    }
}

function preencherFormularioPersonagemCompleto(personagem) {
    console.log('📝 Preenchendo formulário do personagem com dados completos:', personagem);
    
    try {
        // Preencher campos básicos
        const camposMap = {
            'nome_personagens': personagem.nome_personagens || personagem.nome || '',
            'figurino': personagem.figurino || '',
            'tema': personagem.tema || '',
            'quantidade': personagem.quantidade || '1',
            'ID_personagens': personagem.id || personagem.ID_personagens || personagem.ID || ''
        };
        
        for (const [campoId, valor] of Object.entries(camposMap)) {
            const elemento = document.getElementById(campoId);
            if (elemento && valor) {
                elemento.value = valor;
                console.log(`✅ Campo ${campoId} preenchido:`, valor);
            }
        }
        
        // Preencher valor (formatado como moeda)
        const valorPersonagem = personagem.valor_personagens || personagem.valor || personagem.valor_hora || '';
        const valorInput = document.getElementById('valor_personagens');
        if (valorInput && valorPersonagem) {
            // Se já estiver formatado como moeda, manter; senão formatar
            if (typeof valorPersonagem === 'string' && valorPersonagem.includes('R$')) {
                valorInput.value = valorPersonagem;
            } else {
                const numValor = parseFloat(valorPersonagem);
                if (!isNaN(numValor)) {
                    valorInput.value = numValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                } else {
                    valorInput.value = valorPersonagem;
                }
            }
        }
        
        // Restaurar foto do personagem
        const fotoBase64 = personagem.foto || personagem.foto_personagem || '';
        const previewContainer = document.getElementById('previewContainer');
        const fotoPreview = document.getElementById('fotoPreview');
        const previewText = document.getElementById('previewText');
        
        if (fotoBase64 && fotoPreview) {
            fotoPreview.src = fotoBase64;
            fotoPreview.style.display = 'block';
            if (previewText) previewText.style.display = 'none';
            if (previewContainer) {
                previewContainer.style.border = '2px solid #4361ee';
                previewContainer.style.padding = '5px';
            }
            console.log('✅ Foto do personagem restaurada');
        }
        
        // Atualizar o campo ID (readonly) se existir
        const idInput = document.getElementById('ID_personagens');
        if (idInput && camposMap.ID_personagens) {
            idInput.value = camposMap.ID_personagens;
        }
        
        mostrarMensagemToast('✅ Dados do personagem carregados para edição!');
        
        // Destacar campos preenchidos
        destacarCamposPreenchidos();
        
    } catch(e) {
        console.error('Erro ao preencher formulário do personagem:', e);
        mostrarMensagemToast('⚠️ Erro ao carregar dados, tente novamente', true);
    }
}

function destacarCamposPreenchidos() {
    const campos = ['nome_personagens', 'figurino', 'tema', 'valor_personagens', 'quantidade'];
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento && elemento.value) {
            elemento.style.backgroundColor = '#e8f5e9';
            elemento.style.border = '1px solid #4caf50';
            setTimeout(() => {
                if (elemento) {
                    elemento.style.backgroundColor = '';
                    elemento.style.border = '';
                }
            }, 2000);
        }
    });
}

function excluirPersonagem(personagemId) {
    if (confirm('⚠️ Tem certeza que deseja excluir este personagem?')) {
        let personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
        personagens = personagens.filter(p => (p.id != personagemId && p.ID_personagens != personagemId));
        localStorage.setItem('personagens_cadastrados', JSON.stringify(personagens));
        mostrarMensagemToast('✅ Personagem excluído com sucesso!');
        carregarRelatorio('relatorio_personagens');
    }
}

// ==================== FUNÇÃO EDITAR CASA DE FESTA CORRIGIDA ====================

function editarCasaFesta(casaId) {
    console.log('✏️ Editando casa de festa:', casaId);
    
    // Buscar dados da casa
    let casas = JSON.parse(localStorage.getItem('casa_de_festas_cadastrados') || '[]');
    if (casas.length === 0) casas = JSON.parse(localStorage.getItem('casa_de_festas') || '[]');
    
    const casa = casas.find(c => (c.id == casaId || c.ID_casa_de_festas == casaId));
    
    if (!casa) {
        mostrarMensagemToast('❌ Casa de festa não encontrada!', true);
        return;
    }
    
    console.log('📦 Dados da casa encontrados:', casa);
    
    // Salvar dados no sessionStorage
    sessionStorage.setItem('editarCasaId', casaId);
    sessionStorage.setItem('editarCasaDados', JSON.stringify(casa));
    
    // Redirecionar para a página de cadastro
    if (typeof showPage === 'function') {
        showPage('casa_de_festas');
        
        // Aguardar a página carregar e preencher os dados
        setTimeout(() => {
            preencherFormularioCasaCompleto(casa);
        }, 400);
    } else {
        alert('Função de navegação não disponível');
    }
}

// Função para preencher o formulário de casa de festa com todos os dados
function preencherFormularioCasaCompleto(casa) {
    console.log('📝 Preenchendo formulário da casa de festa:', casa);
    
    try {
        // Mapeamento completo dos campos
        const camposMap = {
            // ID
            id: 'ID_casa_de_festas',
            // Nome
            nome: 'nome_casa_de_festas',
            // Documento (CNPJ)
            documento: 'doc_casa_de_festas_cadastro',
            // Contatos
            telefone: 'telefone_casa_de_festas',
            email: 'email_casa_de_festas',
            // Endereço completo
            cep: 'cep_casa_de_festas',
            logradouro: 'logradouro_casa_de_festas',
            numero: 'numero_casa_de_festas',
            complemento: 'complemento_casa_de_festas',
            bairro: 'bairro_casa_de_festas',
            cidade: 'cidade_casa_de_festas',
            estado: 'estado_casa_de_festas'
        };
        
        // 1. Preencher ID
        const idField = document.getElementById(camposMap.id);
        if (idField && casa.id) {
            idField.value = casa.id;
            console.log(`✅ ID preenchido: ${casa.id}`);
        }
        
        // 2. Preencher Nome Fantasia
        const nomeField = document.getElementById(camposMap.nome);
        if (nomeField) {
            nomeField.value = casa.nome_casa_de_festas || casa.nome || '';
            nomeField.readOnly = false;
            nomeField.style.backgroundColor = '#ffffff';
            console.log(`✅ Nome preenchido: ${nomeField.value}`);
        }
        
        // 3. Preencher CNPJ (documento)
        const docField = document.getElementById(camposMap.documento);
        if (docField) {
            let docValue = casa.doc_casa_de_festas_cadastro || casa.documento || casa.cnpj || '';
            // Formatar CNPJ para exibição
            if (docValue && docValue.length === 14) {
                docField.value = docValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            } else {
                docField.value = docValue;
            }
            console.log(`✅ CNPJ preenchido: ${docField.value}`);
        }
        
        // 4. Preencher Telefone
        const telefoneField = document.getElementById(camposMap.telefone);
        if (telefoneField) {
            let telefone = casa.telefone_casa_de_festas || casa.telefone || '';
            telefoneField.value = telefone;
            console.log(`✅ Telefone preenchido: ${telefone}`);
        }
        
        // 5. Preencher Email
        const emailField = document.getElementById(camposMap.email);
        if (emailField) {
            let email = casa.email_casa_de_festas || casa.email || '';
            emailField.value = email;
            console.log(`✅ Email preenchido: ${email}`);
        }
        
        // 6. Preencher CEP
        const cepField = document.getElementById(camposMap.cep);
        if (cepField) {
            let cep = casa.cep_casa_de_festas || casa.cep || '';
            if (cep && cep.length === 8) {
                cepField.value = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
            } else {
                cepField.value = cep;
            }
            console.log(`✅ CEP preenchido: ${cepField.value}`);
        }
        
        // 7. Preencher Logradouro
        const logradouroField = document.getElementById(camposMap.logradouro);
        if (logradouroField) {
            logradouroField.value = casa.logradouro_casa_de_festas || casa.logradouro || '';
            console.log(`✅ Logradouro preenchido: ${logradouroField.value}`);
        }
        
        // 8. Preencher Número
        const numeroField = document.getElementById(camposMap.numero);
        if (numeroField) {
            numeroField.value = casa.numero_casa_de_festas || casa.numero || '';
            console.log(`✅ Número preenchido: ${numeroField.value}`);
        }
        
        // 9. Preencher Complemento
        const complementoField = document.getElementById(camposMap.complemento);
        if (complementoField) {
            complementoField.value = casa.complemento_casa_de_festas || casa.complemento || '';
            console.log(`✅ Complemento preenchido: ${complementoField.value}`);
        }
        
        // 10. Preencher Bairro
        const bairroField = document.getElementById(camposMap.bairro);
        if (bairroField) {
            bairroField.value = casa.bairro_casa_de_festas || casa.bairro || '';
            console.log(`✅ Bairro preenchido: ${bairroField.value}`);
        }
        
        // 11. Preencher Cidade
        const cidadeField = document.getElementById(camposMap.cidade);
        if (cidadeField) {
            cidadeField.value = casa.cidade_casa_de_festas || casa.cidade || '';
            console.log(`✅ Cidade preenchido: ${cidadeField.value}`);
        }
        
        // 12. Preencher Estado
        const estadoField = document.getElementById(camposMap.estado);
        if (estadoField) {
            estadoField.value = casa.estado_casa_de_festas || casa.estado || '';
            console.log(`✅ Estado preenchido: ${estadoField.value}`);
        }
        
        // Verificar se o botão CNPJ está ativo e ajustar
        const btnCnpj = document.getElementById('btnCnpj_casa_de_festas');
        if (btnCnpj && docField && docField.value) {
            btnCnpj.classList.add('active');
            const btnCpf = document.getElementById('btnCpf_casa_de_festas');
            if (btnCpf) btnCpf.classList.remove('active');
        }
        
        mostrarMensagemToast('✅ Dados da casa de festa carregados para edição!');
        
        // Destacar campos preenchidos
        destacarCamposPreenchidosCasa(camposMap);
        
    } catch(e) {
        console.error('Erro ao preencher formulário da casa:', e);
        mostrarMensagemToast('⚠️ Erro ao carregar dados, verifique os campos manualmente', true);
    }
}

function destacarCamposPreenchidosCasa(camposMap) {
    const camposIds = Object.values(camposMap);
    camposIds.forEach(campoId => {
        const elemento = document.getElementById(campoId);
        if (elemento && elemento.value) {
            elemento.style.backgroundColor = '#e8f5e9';
            elemento.style.border = '1px solid #4caf50';
            setTimeout(() => {
                if (elemento) {
                    elemento.style.backgroundColor = '';
                    elemento.style.border = '';
                }
            }, 2000);
        }
    });
}

// Também corrigir a função de exclusão para garantir que funciona
function excluirCasaFesta(casaId) {
    if (confirm('⚠️ Tem certeza que deseja excluir esta casa de festa? Esta ação não pode ser desfeita!')) {
        let casas = JSON.parse(localStorage.getItem('casa_de_festas_cadastrados') || '[]');
        const index = casas.findIndex(c => (c.id == casaId || c.ID_casa_de_festas == casaId));
        
        if (index !== -1) {
            casas.splice(index, 1);
            localStorage.setItem('casa_de_festas_cadastrados', JSON.stringify(casas));
            mostrarMensagemToast('✅ Casa de festa excluída com sucesso!');
            carregarRelatorio('relatorio_casas_de_festa');
        } else {
            mostrarMensagemToast('❌ Casa de festa não encontrada!', true);
        }
    }
}

function preencherFormularioCasa(casa) {
    console.log('📝 Preenchendo formulário da casa:', casa);
    try {
        const campos = {
            'nome_casa_de_festas': casa.nome_casa_de_festas || casa.nome || '',
            'telefone_casa_de_festas': casa.telefone_casa_de_festas || casa.telefone || '',
            'logradouro_casa_de_festas': casa.logradouro_casa_de_festas || '',
            'numero_casa_de_festas': casa.numero_casa_de_festas || '',
            'cidade_casa_de_festas': casa.cidade_casa_de_festas || ''
        };
        
        for (const [campo, valor] of Object.entries(campos)) {
            const input = document.querySelector(`[name="${campo}"], [id="${campo}"]`);
            if (input && valor) input.value = valor;
        }
        mostrarMensagemToast('✅ Dados da casa carregados para edição!');
    } catch(e) {
        console.error('Erro ao preencher formulário:', e);
    }
}

function excluirCasaFesta(casaId) {
    if (confirm('⚠️ Tem certeza que deseja excluir esta casa de festa?')) {
        let casas = JSON.parse(localStorage.getItem('casa_de_festas_cadastrados') || '[]');
        casas = casas.filter(c => (c.id != casaId && c.ID_casa_de_festas != casaId));
        localStorage.setItem('casa_de_festas_cadastrados', JSON.stringify(casas));
        mostrarMensagemToast('✅ Casa de festa excluída com sucesso!');
        carregarRelatorio('relatorio_casas_de_festa');
    }
}

// ==================== FUNÇÃO EDITAR CHECKLIST CORRIGIDA ====================

function editarChecklistRel(checklistId) {
    console.log('✏️ Editando checklist:', checklistId);
    
    // Buscar checklist em todos os possíveis storages
    let checklist = null;
    let storageOrigem = '';
    
    try {
        // Tentar buscar em checklists_cadastrados
        let checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
        checklist = checklists.find(c => c.id == checklistId);
        if (checklist) storageOrigem = 'checklists_cadastrados';
        
        // Se não encontrar, tentar em checklists
        if (!checklist) {
            checklists = JSON.parse(localStorage.getItem('checklists') || '[]');
            checklist = checklists.find(c => c.id == checklistId);
            if (checklist) storageOrigem = 'checklists';
        }
    } catch(e) {
        console.error('Erro ao buscar checklist:', e);
    }
    
    if (!checklist) {
        mostrarMensagemToast('❌ Checklist não encontrado!', true);
        return;
    }
    
    // Buscar foto do personagem associado
    let fotoPersonagem = '';
    let fotoDataUrl = '';
    
    try {
        const personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
        const personagens2 = JSON.parse(localStorage.getItem('personagens') || '[]');
        const todosPersonagens = [...personagens, ...personagens2];
        
        const personagem = todosPersonagens.find(p => p.id == checklist.personagemId || p.ID_personagens == checklist.personagemId);
        if (personagem) {
            fotoPersonagem = personagem.nome_personagens || personagem.nome || checklist.personagemNome || '';
            fotoDataUrl = personagem.foto || personagem.foto_personagem || '';
            checklist.personagemNome = fotoPersonagem;
            checklist.personagemFoto = fotoDataUrl;
        }
    } catch(e) {
        console.error('Erro ao buscar foto do personagem:', e);
    }
    
    // Salvar dados completos no sessionStorage
    sessionStorage.setItem('editarChecklistId', checklistId);
    sessionStorage.setItem('editarChecklistOrigem', storageOrigem);
    sessionStorage.setItem('editarChecklistDados', JSON.stringify(checklist));
    sessionStorage.setItem('editarChecklistFoto', fotoDataUrl);
    sessionStorage.setItem('editarChecklistPersonagemNome', fotoPersonagem);
    
    // Redirecionar para a página de criar checklist
    if (typeof showPage === 'function') {
        showPage('criar_checklist');
        
        // Aguardar a página carregar e preencher os dados
        setTimeout(() => {
            preencherFormularioChecklistCompleto(checklist, fotoDataUrl);
        }, 400);
    } else {
        alert('Função de navegação não disponível');
    }
}

function preencherFormularioChecklistCompleto(checklist, fotoDataUrl) {
    console.log('📝 Preenchendo formulário do checklist com dados completos:', checklist);
    
    try {
        // 1. Preencher nome do checklist
        const nomeInput = document.getElementById('nome_checklist');
        if (nomeInput && checklist.nome) {
            nomeInput.value = checklist.nome;
            console.log('✅ Nome do checklist preenchido:', checklist.nome);
        }
        
        // 2. Preencher descrição
        const descricaoInput = document.getElementById('descricao_checklist');
        if (descricaoInput && checklist.descricao) {
            descricaoInput.value = checklist.descricao;
            console.log('✅ Descrição preenchida');
        }
        
        // 3. Selecionar o personagem correto no dropdown
        const personagemSelect = document.getElementById('personagem_checklist');
        if (personagemSelect && checklist.personagemId) {
            // Aguardar o dropdown carregar os personagens
            const waitForSelect = setInterval(() => {
                const options = personagemSelect.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value == checklist.personagemId) {
                        personagemSelect.selectedIndex = i;
                        personagemSelect.dispatchEvent(new Event('change'));
                        clearInterval(waitForSelect);
                        console.log('✅ Personagem selecionado:', checklist.personagemId);
                        break;
                    }
                }
            }, 100);
            
            // Timeout para não ficar esperando infinitamente
            setTimeout(() => clearInterval(waitForSelect), 5000);
        }
        
        // 4. Restaurar foto do personagem
        if (fotoDataUrl) {
            restaurarFotoChecklist(fotoDataUrl);
        } else if (checklist.personagemFoto) {
            restaurarFotoChecklist(checklist.personagemFoto);
        }
        
        // 5. Restaurar itens do checklist
        if (checklist.itens && checklist.itens.length > 0) {
            preencherItensChecklistCompletos(checklist.itens);
        }
        
        // 6. Restaurar tipo de checklist
        const tipoSelect = document.getElementById('tipo_checklist');
        if (tipoSelect && checklist.tipo) {
            tipoSelect.value = checklist.tipo;
        }
        
        // 7. Restaurar status
        const statusSelect = document.getElementById('status_checklist');
        if (statusSelect && checklist.status) {
            statusSelect.value = checklist.status;
        }
        
        mostrarMensagemToast('✅ Dados do checklist carregados para edição!');
        
    } catch(e) {
        console.error('Erro ao preencher formulário do checklist:', e);
        mostrarMensagemToast('⚠️ Erro ao carregar dados, verifique os campos manualmente', true);
    }
}

function restaurarFotoChecklist(fotoDataUrl) {
    try {
        const fotoContainer = document.getElementById('fotoContainerChecklist');
        const fotoImg = document.getElementById('fotoPersonagemChecklist');
        const semFotoSpan = document.getElementById('semFotoChecklist');
        
        if (fotoImg && fotoDataUrl) {
            fotoImg.src = fotoDataUrl;
            fotoImg.style.display = 'block';
            if (semFotoSpan) semFotoSpan.style.display = 'none';
            if (fotoContainer) {
                fotoContainer.style.border = '2px solid #28a745';
                fotoContainer.style.backgroundColor = '#f0fff4';
            }
            console.log('✅ Foto do personagem restaurada no checklist');
        }
    } catch(e) {
        console.error('Erro ao restaurar foto:', e);
    }
}

function preencherItensChecklistCompletos(itens) {
    console.log('📋 Preenchendo', itens.length, 'itens do checklist');
    
    const container = document.getElementById('listaItensChecklist');
    if (!container) {
        console.warn('Container de itens não encontrado');
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Adicionar cada item
    itens.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checklist-item';
        itemDiv.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 6px; border: 1px solid #e0e0e0;';
        itemDiv.setAttribute('data-item-index', index);
        
        // Nome do item
        const nomeSpan = document.createElement('span');
        nomeSpan.style.flex = '2';
        nomeSpan.innerHTML = `<strong>${escapeHtml(item.nome || item.item || 'Item sem nome')}</strong>`;
        
        // Categoria
        const categoriaSpan = document.createElement('span');
        categoriaSpan.style.flex = '1';
        categoriaSpan.style.fontSize = '12px';
        categoriaSpan.style.color = '#666';
        categoriaSpan.innerHTML = `📁 ${escapeHtml(item.categoria || 'Geral')}`;
        
        // Quantidade
        const qtdSpan = document.createElement('span');
        qtdSpan.style.flex = '0.5';
        qtdSpan.style.textAlign = 'center';
        qtdSpan.innerHTML = `📦 ${item.quantidade || 1}x`;
        
        // Status (checkbox)
        const statusCheckbox = document.createElement('input');
        statusCheckbox.type = 'checkbox';
        statusCheckbox.checked = item.concluido === true;
        statusCheckbox.style.margin = '0 10px';
        statusCheckbox.onchange = function() {
            item.concluido = this.checked;
            salvarChecklistAtualizado();
        };
        
        // Botão remover
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '🗑️';
        removeBtn.className = 'btn small';
        removeBtn.style.background = '#dc3545';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.padding = '4px 8px';
        removeBtn.style.borderRadius = '4px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.onclick = function() {
            itemDiv.remove();
            atualizarContadorItens();
            salvarChecklistAtualizado();
        };
        
        itemDiv.appendChild(nomeSpan);
        itemDiv.appendChild(categoriaSpan);
        itemDiv.appendChild(qtdSpan);
        itemDiv.appendChild(statusCheckbox);
        itemDiv.appendChild(removeBtn);
        
        container.appendChild(itemDiv);
    });
    
    atualizarContadorItens();
    
    // Salvar os itens no objeto global de edição
    window.checklistItensEditando = itens;
}

function atualizarContadorItens() {
    const container = document.getElementById('listaItensChecklist');
    const contador = document.getElementById('contadorItens');
    if (container && contador) {
        const totalItens = container.children.length;
        contador.textContent = `Total: ${totalItens} itens`;
    }
}

function salvarChecklistAtualizado() {
    // Coletar itens atuais do container
    const container = document.getElementById('listaItensChecklist');
    if (!container) return;
    
    const itens = [];
    for (let i = 0; i < container.children.length; i++) {
        const itemDiv = container.children[i];
        const nomeSpan = itemDiv.querySelector('span:first-child');
        const categoriaSpan = itemDiv.querySelector('span:nth-child(2)');
        const qtdSpan = itemDiv.querySelector('span:nth-child(3)');
        const statusCheckbox = itemDiv.querySelector('input[type="checkbox"]');
        
        let nome = '';
        let categoria = '';
        let quantidade = 1;
        
        if (nomeSpan) {
            const nomeText = nomeSpan.innerHTML;
            const match = nomeText.match(/>([^<]+)</);
            nome = match ? match[1] : nomeText.replace(/<[^>]*>/g, '');
        }
        
        if (categoriaSpan) {
            const catText = categoriaSpan.innerHTML;
            const match = catText.match(/📁 (.+)/);
            categoria = match ? match[1] : 'Geral';
        }
        
        if (qtdSpan) {
            const qtdText = qtdSpan.innerHTML;
            const match = qtdText.match(/📦 (\d+)x/);
            quantidade = match ? parseInt(match[1]) : 1;
        }
        
        itens.push({
            nome: nome,
            categoria: categoria,
            quantidade: quantidade,
            concluido: statusCheckbox ? statusCheckbox.checked : false
        });
    }
    
    window.checklistItensEditando = itens;
    console.log('📋 Itens do checklist atualizados:', itens.length);
}

// Função auxiliar para carregar foto do personagem no checklist
function carregarFotoPersonagemChecklist() {
    const select = document.getElementById('personagem_checklist');
    const personagemId = select ? select.value : null;
    
    if (!personagemId) {
        const fotoImg = document.getElementById('fotoPersonagemChecklist');
        const semFotoSpan = document.getElementById('semFotoChecklist');
        if (fotoImg) {
            fotoImg.style.display = 'none';
            fotoImg.src = '';
        }
        if (semFotoSpan) semFotoSpan.style.display = 'block';
        return;
    }
    
    try {
        let personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
        if (personagens.length === 0) personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
        
        const personagem = personagens.find(p => p.id == personagemId || p.ID_personagens == personagemId);
        
        if (personagem && (personagem.foto || personagem.foto_personagem)) {
            const fotoUrl = personagem.foto || personagem.foto_personagem;
            const fotoImg = document.getElementById('fotoPersonagemChecklist');
            const semFotoSpan = document.getElementById('semFotoChecklist');
            
            if (fotoImg) {
                fotoImg.src = fotoUrl;
                fotoImg.style.display = 'block';
                if (semFotoSpan) semFotoSpan.style.display = 'none';
            }
        }
    } catch(e) {
        console.error('Erro ao carregar foto do personagem:', e);
    }
}


function preencherTabelaItensChecklist(itens) {
    const tbody = document.querySelector('#tabelaItensChecklist tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    itens.forEach((item) => {
        const row = tbody.insertRow();
        
        const cellNome = row.insertCell(0);
        const inputNome = document.createElement('input');
        inputNome.type = 'text';
        inputNome.value = item.nome || item.item || '';
        inputNome.style.width = '100%';
        inputNome.style.padding = '6px';
        inputNome.style.border = '1px solid #ddd';
        inputNome.style.borderRadius = '4px';
        cellNome.appendChild(inputNome);
        
        const cellCategoria = row.insertCell(1);
        const inputCategoria = document.createElement('input');
        inputCategoria.type = 'text';
        inputCategoria.value = item.categoria || '';
        inputCategoria.style.width = '100%';
        inputCategoria.style.padding = '6px';
        inputCategoria.style.border = '1px solid #ddd';
        inputCategoria.style.borderRadius = '4px';
        cellCategoria.appendChild(inputCategoria);
        
        const cellQtd = row.insertCell(2);
        const inputQtd = document.createElement('input');
        inputQtd.type = 'number';
        inputQtd.value = item.quantidade || 1;
        inputQtd.min = 1;
        inputQtd.style.width = '80px';
        inputQtd.style.padding = '6px';
        cellQtd.appendChild(inputQtd);
        
        const cellStatus = row.insertCell(3);
        const inputStatus = document.createElement('input');
        inputStatus.type = 'checkbox';
        inputStatus.checked = item.concluido === true;
        cellStatus.appendChild(inputStatus);
        cellStatus.style.textAlign = 'center';
        
        const cellAcoes = row.insertCell(4);
        const btnRemover = document.createElement('button');
        btnRemover.innerHTML = '🗑️';
        btnRemover.className = 'btn small';
        btnRemover.style.background = '#dc3545';
        btnRemover.style.color = 'white';
        btnRemover.onclick = function() { row.remove(); };
        cellAcoes.appendChild(btnRemover);
        cellAcoes.style.textAlign = 'center';
    });
    
    const contador = document.getElementById('contadorItens');
    if (contador) contador.textContent = itens.length;
}

function excluirChecklistRel(checklistId) {
    if (confirm('⚠️ Tem certeza que deseja excluir este checklist?')) {
        let checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
        checklists = checklists.filter(c => c.id != checklistId);
        localStorage.setItem('checklists_cadastrados', JSON.stringify(checklists));
        mostrarMensagemToast('✅ Checklist excluído com sucesso!');
        carregarRelatorio('relatorio_checklist');
    }
}

// ==================== FUNÇÃO EDITAR EQUIPE CORRIGIDA ====================
function editarEquipeRel(tipo, membroId) {
    console.log(`✏️ Editando ${tipo}:`, membroId);
    console.log(`📌 Tipo recebido: ${tipo}, ID: ${membroId}`);
    
    // Buscar os dados do membro
    let storageKey = '';
    let dados = [];
    let pagina = '';
    
    switch(tipo) {
        case 'elenco':
            storageKey = 'elenco_cadastrados';
            dados = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (dados.length === 0) dados = JSON.parse(localStorage.getItem('elenco') || '[]');
            pagina = 'elenco';
            break;
        case 'motoristas':
            storageKey = 'motoristas_cadastrados';
            dados = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (dados.length === 0) dados = JSON.parse(localStorage.getItem('motoristas') || '[]');
            pagina = 'motoristas';
            break;
        case 'funcionarios':
            storageKey = 'funcionarios_cadastrados';
            dados = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (dados.length === 0) dados = JSON.parse(localStorage.getItem('funcionarios') || '[]');
            pagina = 'funcionarios';
            break;
        default:
            mostrarMensagemToast('❌ Tipo inválido!', true);
            return;
    }
    
    console.log(`📊 Dados carregados de ${storageKey}:`, dados.length, 'registros');
    
    // Buscar o membro pelo ID - tentando diferentes formatos de ID
    const membro = dados.find(m => {
        const mId = m.id || m.ID_elenco || m.ID_motoristas || m.ID_funcionarios;
        console.log(`Comparando: ${mId} == ${membroId}?`, mId == membroId);
        return mId == membroId;
    });
    
    if (!membro) {
        console.error(`❌ ${tipo} não encontrado! ID:`, membroId);
        console.log('IDs disponíveis:', dados.map(m => m.id || m.ID_elenco || m.ID_motoristas || m.ID_funcionarios));
        mostrarMensagemToast(`❌ ${tipo} não encontrado! ID: ${membroId}`, true);
        return;
    }
    
    console.log('📦 Dados do membro para edição:', membro);
    console.log('🔍 Todas as chaves do membro:', Object.keys(membro));
    
    // Salvar dados no sessionStorage
    sessionStorage.setItem('editarEquipeId', String(membroId));
    sessionStorage.setItem('editarEquipeTipo', tipo);
    sessionStorage.setItem('editarEquipeDados', JSON.stringify(membro));
    
    // Redirecionar para a página de cadastro
    if (typeof showPage === 'function') {
        console.log(`🔄 Redirecionando para página: ${pagina}`);
        showPage(pagina);
        
        // Aguardar a página carregar e preencher os dados
        setTimeout(() => {
            console.log(`⏳ Preenchendo formulário após ${300}ms`);
            preencherFormularioEquipeCompleto(tipo, membro);
        }, 500);
    } else {
        console.error('❌ Função showPage não disponível!');
        alert('Função de navegação não disponível');
    }
}


// ==================== FUNÇÃO PARA PREENCHER FORMULÁRIO DE EQUIPE ====================
function preencherFormularioEquipeCompleto(tipo, membro) {
    console.log(`📝 Preenchendo formulário de ${tipo}:`, membro);
    console.log('🔍 Todas as chaves disponíveis:', Object.keys(membro));
    
    try {
        if (tipo === 'motoristas') {
            // ID
            const idField = document.getElementById('ID_motoristas');
            if (idField) idField.value = membro.id || membro.ID_motoristas || '';
            
            // Nome
            const nomeField = document.getElementById('nome_motoristas');
            if (nomeField) nomeField.value = membro.nome_motoristas || membro.nome || '';
            
            // Documento
            const docField = document.getElementById('doc_motoristas_cadastro');
            if (docField) {
                let doc = membro.doc_motoristas_cadastro || membro.documento || '';
                if (doc && doc.length === 11) {
                    docField.value = doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else if (doc && doc.length === 14) {
                    docField.value = doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                } else {
                    docField.value = doc;
                }
            }
            
            // DATA DE NASCIMENTO E IDADE
            const dataField = document.getElementById('data_nascimento_motoristas');
            if (dataField && membro.data_nascimento_motoristas) {
                dataField.value = membro.data_nascimento_motoristas;
                
                const idadeField = document.getElementById('idade_motoristas');
                if (idadeField && dataField.value) {
                    const hoje = new Date();
                    const nascimento = new Date(dataField.value);
                    let idade = hoje.getFullYear() - nascimento.getFullYear();
                    const mesDiff = hoje.getMonth() - nascimento.getMonth();
                    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
                        idade--;
                    }
                    idadeField.value = idade > 0 ? `${idade} anos` : '';
                }
            }
            
            // Telefone
            const telefoneField = document.getElementById('telefone_motoristas');
            if (telefoneField) telefoneField.value = membro.telefone_motoristas || membro.telefone || '';
            
            // Email
            const emailField = document.getElementById('email_motoristas');
            if (emailField) emailField.value = membro.email_motoristas || membro.email || '';
            
            // Aceita Produção
            const aceitaField = document.getElementById('aceita_producao_motoristas');
            if (aceitaField) aceitaField.value = membro.aceita_producao_motoristas || 'nao';
            
            // CNH
            const cnhField = document.getElementById('cnh_motoristas');
            if (cnhField) cnhField.value = membro.cnh_motoristas || '';
            
            // Veículo
            const veiculoField = document.getElementById('veiculo_motoristas');
            if (veiculoField) veiculoField.value = membro.veiculo_motoristas || '';
            
            // Placa
            const placaField = document.getElementById('placa_motoristas');
            if (placaField) placaField.value = membro.placa_motoristas || '';
            
            // Chave PIX
            const pixField = document.getElementById('chave_pix_motoristas');
            if (pixField) pixField.value = membro.chave_pix_motoristas || '';
            
            // ========== ENDEREÇO ==========
            // CEP
            const cepField = document.getElementById('cep_motoristas');
            if (cepField && membro.cep_motoristas) {
                let cep = membro.cep_motoristas;
                if (cep.length === 8) cep = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
                cepField.value = cep;
            }
            
            // Logradouro
            const logradouroField = document.getElementById('logradouro_motoristas');
            if (logradouroField) logradouroField.value = membro.logradouro_motoristas || '';
            
            // Número
            const numeroField = document.getElementById('numero_motoristas');
            if (numeroField) numeroField.value = membro.numero_motoristas || '';
            
            // ========== COMPLEMENTO - CORREÇÃO AQUI ==========
            const complementoField = document.getElementById('complemento_motoristas');
            if (complementoField) {
                // Buscar complemento em TODAS as possíveis chaves
                let complemento = membro.complemento_motoristas || 
                                 membro.complemento || 
                                 membro.complemento_motorista ||
                                 membro.complemento_endereco ||
                                 membro.comp_motoristas ||
                                 membro.comp ||
                                 membro.endereco_complemento ||
                                 '';
                
                complementoField.value = complemento;
                console.log('✅ Complemento preenchido com valor:', `"${complemento}"`);
                
                // Destacar se foi preenchido
                if (complemento) {
                    complementoField.style.backgroundColor = '#e8f5e9';
                    setTimeout(() => {
                        if (complementoField) complementoField.style.backgroundColor = '';
                    }, 2000);
                }
            } else {
                console.log('⚠️ Campo complemento_motoristas não encontrado no HTML');
            }
            
            // Bairro
            const bairroField = document.getElementById('bairro_motoristas');
            if (bairroField) bairdoField.value = membro.bairro_motoristas || '';
            
            // Cidade
            const cidadeField = document.getElementById('cidade_motoristas');
            if (cidadeField) cidadeField.value = membro.cidade_motoristas || '';
            
            // Estado
            const estadoField = document.getElementById('estado_motoristas');
            if (estadoField) estadoField.value = membro.estado_motoristas || '';
            
            mostrarMensagemToast('✅ Dados do motorista carregados!');
            
        } else if (tipo === 'elenco') {
            // ... código do elenco (manter o mesmo)
            const idField = document.getElementById('ID_elenco');
            if (idField) idField.value = membro.id || membro.ID_elenco || '';
            
            const nomeField = document.getElementById('nome_elenco');
            if (nomeField) nomeField.value = membro.nome_elenco || membro.nome || '';
            
            const docField = document.getElementById('doc_elenco_cadastro');
            if (docField) {
                let doc = membro.doc_elenco_cadastro || '';
                if (doc && doc.length === 11) {
                    docField.value = doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else {
                    docField.value = doc;
                }
            }
            
            const dataField = document.getElementById('data_nascimento_elenco');
            if (dataField && membro.data_nascimento_elenco) {
                dataField.value = membro.data_nascimento_elenco;
                const idadeField = document.getElementById('idade_elenco');
                if (idadeField && dataField.value) {
                    const hoje = new Date();
                    const nascimento = new Date(dataField.value);
                    let idade = hoje.getFullYear() - nascimento.getFullYear();
                    const mesDiff = hoje.getMonth() - nascimento.getMonth();
                    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
                        idade--;
                    }
                    idadeField.value = idade > 0 ? `${idade} anos` : '';
                }
            }
            
            const telefoneField = document.getElementById('telefone_elenco');
            if (telefoneField) telefoneField.value = membro.telefone_elenco || '';
            
            const emailField = document.getElementById('email_elenco');
            if (emailField) emailField.value = membro.email_elenco || '';
            
            const aceitaField = document.getElementById('aceita_producao_elenco');
            if (aceitaField) aceitaField.value = membro.aceita_producao_elenco || 'nao';
            
            const fazDriveField = document.getElementById('faz_drive_elenco');
            if (fazDriveField) {
                fazDriveField.value = membro.faz_drive_elenco || 'nao';
                if (typeof toggleCamposMotorista === 'function') {
                    setTimeout(() => toggleCamposMotorista(), 100);
                }
            }
            
            const pixField = document.getElementById('chave_pix_elenco');
            if (pixField) pixField.value = membro.chave_pix_elenco || '';
            
            const cnhMotoristaField = document.getElementById('cnh_motorista_elenco');
            if (cnhMotoristaField) cnhMotoristaField.value = membro.cnh_motorista_elenco || '';
            
            const modeloField = document.getElementById('modelo_carro_elenco');
            if (modeloField) modeloField.value = membro.modelo_carro_elenco || '';
            
            const placaMotoristaField = document.getElementById('placa_carro_elenco');
            if (placaMotoristaField) placaMotoristaField.value = membro.placa_carro_elenco || '';
            
            const cepField = document.getElementById('cep_elenco');
            if (cepField && membro.cep_elenco) {
                let cep = membro.cep_elenco;
                if (cep.length === 8) cep = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
                cepField.value = cep;
            }
            
            const logradouroField = document.getElementById('logradouro_elenco');
            if (logradouroField) logradouroField.value = membro.logradouro_elenco || '';
            
            const numeroField = document.getElementById('numero_elenco');
            if (numeroField) numeroField.value = membro.numero_elenco || '';
            
            const complementoField = document.getElementById('complemento_elenco');
            if (complementoField) {
                let complemento = membro.complemento_elenco || membro.complemento || '';
                complementoField.value = complemento;
            }
            
            const bairroField = document.getElementById('bairro_elenco');
            if (bairroField) bairroField.value = membro.bairro_elenco || '';
            
            const cidadeField = document.getElementById('cidade_elenco');
            if (cidadeField) cidadeField.value = membro.cidade_elenco || '';
            
            const estadoField = document.getElementById('estado_elenco');
            if (estadoField) estadoField.value = membro.estado_elenco || '';
            
            mostrarMensagemToast('✅ Dados do elenco carregados!');
            
        } else if (tipo === 'funcionarios') {
            // ... código dos funcionários (manter o mesmo)
            const idField = document.getElementById('ID_funcionarios');
            if (idField) idField.value = membro.id || membro.ID_funcionarios || '';
            
            const nomeField = document.getElementById('nome_funcionarios');
            if (nomeField) nomeField.value = membro.nome_funcionarios || membro.nome || '';
            
            const docField = document.getElementById('doc_funcionarios_cadastro');
            if (docField) docField.value = membro.doc_funcionarios_cadastro || '';
            
            const telefoneField = document.getElementById('telefone_funcionarios');
            if (telefoneField) telefoneField.value = membro.telefone_funcionarios || '';
            
            const emailField = document.getElementById('email_funcionarios');
            if (emailField) emailField.value = membro.email_funcionarios || '';
            
            mostrarMensagemToast('✅ Dados do funcionário carregados!');
        }
        
        // Destacar campos preenchidos (feedback visual)
        setTimeout(() => {
            const inputs = document.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.value && input.type !== 'hidden' && !input.id.includes('ID_')) {
                    input.style.backgroundColor = '#e8f5e9';
                    input.style.transition = 'all 0.5s';
                    setTimeout(() => {
                        input.style.backgroundColor = '';
                    }, 1500);
                }
            });
        }, 200);
        
    } catch(e) {
        console.error('Erro ao preencher formulário:', e);
        mostrarMensagemToast('⚠️ Erro ao carregar alguns dados', true);
    }
}
// ==================== FUNÇÃO ADICIONAR BOTÃO SALVAR (CORRIGIDA) ====================

function adicionarBotaoSalvarEdicao(tipo) {
    console.log(`🔘 Adicionando botão salvar para ${tipo}...`);
    
    // Verificar se o botão já existe
    if (document.getElementById('btnSalvarEdicaoEquipe')) {
        console.log('⚠️ Botão salvar já existe, removendo para recriar...');
        document.getElementById('btnSalvarEdicaoEquipe').remove();
    }
    
    // Tentar encontrar o container de botões
    let formActions = document.querySelector('.form-actions');
    
    if (!formActions) {
        formActions = document.querySelector('.botoes-form');
    }
    if (!formActions) {
        formActions = document.querySelector('.form-buttons');
    }
    if (!formActions) {
        formActions = document.querySelector('.acoes-form');
    }
    if (!formActions) {
        // Criar um container se não existir
        const cardBody = document.querySelector('.card-body');
        if (cardBody) {
            formActions = document.createElement('div');
            formActions.className = 'form-actions';
            formActions.style.marginTop = '20px';
            formActions.style.display = 'flex';
            formActions.style.gap = '10px';
            formActions.style.justifyContent = 'flex-end';
            cardBody.appendChild(formActions);
            console.log('✅ Container de botões criado');
        }
    }
    
    if (!formActions) {
        console.error('❌ Não foi possível encontrar ou criar container para os botões');
        return;
    }
    
    // Obter ID do membro sendo editado
    const membroId = sessionStorage.getItem('editarEquipeId');
    const tipoSalvo = sessionStorage.getItem('editarEquipeTipo');
    
    console.log(`📌 Editando ID: ${membroId}, Tipo: ${tipoSalvo}`);
    
    // Criar botão de salvar
    const btnSalvar = document.createElement('button');
    btnSalvar.id = 'btnSalvarEdicaoEquipe';
    btnSalvar.type = 'button';
    btnSalvar.className = 'btn primary';
    btnSalvar.style.background = '#28a745';
    btnSalvar.style.color = 'white';
    btnSalvar.style.padding = '10px 20px';
    btnSalvar.style.border = 'none';
    btnSalvar.style.borderRadius = '6px';
    btnSalvar.style.cursor = 'pointer';
    btnSalvar.style.fontSize = '14px';
    btnSalvar.style.fontWeight = 'bold';
    btnSalvar.innerHTML = '💾 Salvar Alterações e Voltar';
    
    btnSalvar.onclick = function() {
        console.log('💾 Botão Salvar clicado!');
        if (confirm('✅ Deseja salvar as alterações e voltar para o relatório?')) {
            coletarESalvarEquipeEditado(tipoSalvo || tipo, membroId);
        }
    };
    
    formActions.appendChild(btnSalvar);
    console.log('✅ Botão salvar adicionado com sucesso!');
    
    // Modificar o botão de cancelar se existir
    const botoesExistentes = formActions.querySelectorAll('button:not(#btnSalvarEdicaoEquipe)');
    botoesExistentes.forEach(btn => {
        const textoBtn = btn.textContent || '';
        if (textoBtn.includes('Limpar') || textoBtn.includes('Cancelar') || textoBtn.includes('clear')) {
            const originalText = btn.textContent;
            btn.textContent = '❌ Cancelar Edição';
            const oldOnclick = btn.onclick;
            btn.onclick = function(e) {
                if (confirm('⚠️ Deseja cancelar a edição e voltar ao relatório? As alterações não serão salvas.')) {
                    console.log('❌ Cancelando edição...');
                    sessionStorage.removeItem('editarEquipeId');
                    sessionStorage.removeItem('editarEquipeTipo');
                    sessionStorage.removeItem('editarEquipeDados');
                    
                    if (typeof carregarRelatorio === 'function') {
                        carregarRelatorio('relatorio_equipe');
                    } else if (typeof showPage === 'function') {
                        showPage('relatorio_equipe');
                    }
                }
            };
            console.log('✅ Botão cancelar modificado');
        }
    });
}
function destacarCamposPreenchidosEquipe(campos) {
    const camposIds = Object.values(campos);
    camposIds.forEach(campoId => {
        const elemento = document.getElementById(campoId);
        if (elemento && elemento.value) {
            elemento.style.backgroundColor = '#e8f5e9';
            elemento.style.border = '1px solid #4caf50';
            setTimeout(() => {
                if (elemento) {
                    elemento.style.backgroundColor = '';
                    elemento.style.border = '';
                }
            }, 2000);
        }
    });
}

// Também adicionar a função para preencher dados na página de cadastro (fallback)
function carregarEquipeParaEdicao(tipo, id) {
    console.log(`🔄 Carregando ${tipo} para edição com ID:`, id);
    
    let storageKey = '';
    switch(tipo) {
        case 'elenco': storageKey = 'elenco_cadastrados'; break;
        case 'motoristas': storageKey = 'motoristas_cadastrados'; break;
        case 'funcionarios': storageKey = 'funcionarios_cadastrados'; break;
        default: return;
    }
    
    let dados = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (dados.length === 0) {
        if (tipo === 'elenco') dados = JSON.parse(localStorage.getItem('elenco') || '[]');
        if (tipo === 'motoristas') dados = JSON.parse(localStorage.getItem('motoristas') || '[]');
        if (tipo === 'funcionarios') dados = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    }
    
    const membro = dados.find(m => (m.id == id || m.ID_elenco == id || m.ID_motoristas == id || m.ID_funcionarios == id));
    
    if (membro) {
        preencherFormularioEquipeCompleto(tipo, membro);
    } else {
        mostrarMensagemToast(`❌ ${tipo} não encontrado!`, true);
    }
}

function preencherFormularioEquipe(tipo, membro) {
    console.log(`📝 Preenchendo formulário de ${tipo}:`, membro);
    try {
        const nomeKey = tipo === 'elenco' ? 'nome_elenco' : (tipo === 'motoristas' ? 'nome_motoristas' : 'nome_funcionarios');
        const telefoneKey = tipo === 'elenco' ? 'telefone_elenco' : (tipo === 'motoristas' ? 'telefone_motoristas' : 'telefone_funcionarios');
        const emailKey = tipo === 'elenco' ? 'email_elenco' : (tipo === 'motoristas' ? 'email_motoristas' : 'email_funcionarios');
        const docKey = tipo === 'elenco' ? 'doc_elenco_cadastro' : (tipo === 'motoristas' ? 'doc_motoristas_cadastro' : 'doc_funcionarios_cadastro');
        
        const inputs = document.querySelectorAll('input, select');
        for (let input of inputs) {
            if (input.name === nomeKey || input.id === nomeKey) input.value = membro[nomeKey] || '';
            if (input.name === telefoneKey || input.id === telefoneKey) input.value = membro[telefoneKey] || '';
            if (input.name === emailKey || input.id === emailKey) input.value = membro[emailKey] || '';
            if (input.name === docKey || input.id === docKey) input.value = membro[docKey] || '';
        }
        mostrarMensagemToast(`✅ Dados do ${tipo} carregados para edição!`);
    } catch(e) {
        console.error('Erro ao preencher formulário:', e);
    }
}

function excluirEquipeRel(tipo, membroId) {
    if (confirm(`⚠️ Tem certeza que deseja excluir este ${tipo}?`)) {
        let storageKey = '';
        switch(tipo) {
            case 'elenco': storageKey = 'elenco_cadastrados'; break;
            case 'motoristas': storageKey = 'motoristas_cadastrados'; break;
            case 'funcionarios': storageKey = 'funcionarios_cadastrados'; break;
            default: return;
        }
        let dados = JSON.parse(localStorage.getItem(storageKey) || '[]');
        dados = dados.filter(m => (m.id != membroId && m.ID_elenco != membroId && m.ID_motoristas != membroId && m.ID_funcionarios != membroId));
        localStorage.setItem(storageKey, JSON.stringify(dados));
        mostrarMensagemToast(`✅ ${tipo} excluído com sucesso!`);
        carregarRelatorio('relatorio_equipe');
    }
}

function alterarStatusEquipeRel(selectElement) {
    const membroId = selectElement.getAttribute('data-id');
    const tipo = selectElement.getAttribute('data-tipo');
    const novoStatus = selectElement.value;
    
    let storageKey = '';
    switch(tipo) {
        case 'elenco': storageKey = 'elenco_cadastrados'; break;
        case 'motoristas': storageKey = 'motoristas_cadastrados'; break;
        case 'funcionarios': storageKey = 'funcionarios_cadastrados'; break;
        default: return;
    }
    
    let dados = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const index = dados.findIndex(m => (m.id == membroId || m.ID_elenco == membroId || m.ID_motoristas == membroId || m.ID_funcionarios == membroId));
    
    if (index !== -1) {
        dados[index].status = novoStatus;
        localStorage.setItem(storageKey, JSON.stringify(dados));
        mostrarMensagemToast(`✅ Status alterado para ${novoStatus === 'ativo' ? 'Ativo' : 'Desativado'}`);
    }
}

// Função auxiliar para marcar personagens selecionados
function marcarPersonagensSelecionados(ids) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name*="personagem"], .personagem-checkbox');
    for (let cb of checkboxes) {
        if (ids.includes(cb.value) || ids.includes(cb.id)) {
            cb.checked = true;
        }
    }
}

function alterarStatusChecklistRel(selectElement) {
    const checklistId = selectElement.getAttribute('data-id');
    const novoStatus = selectElement.value;
    let checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const index = checklists.findIndex(c => c.id == checklistId);
    
    if (index !== -1) {
        checklists[index].status = novoStatus;
        localStorage.setItem('checklists_cadastrados', JSON.stringify(checklists));
        mostrarMensagemToast(`✅ Status alterado para ${novoStatus}`);
    }
}

// ==================== FUNÇÃO ALTERAR STATUS CHECKLIST ====================

function alterarStatusChecklistRel(selectElement) {
    const checklistId = selectElement.getAttribute('data-id');
    const novoStatus = selectElement.value;
    
    let checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const index = checklists.findIndex(c => c.id == checklistId);
    
    if (index !== -1) {
        checklists[index].status = novoStatus;
        checklists[index].dataAtualizacao = new Date().toISOString();
        localStorage.setItem('checklists_cadastrados', JSON.stringify(checklists));
        
        // Atualizar estilo do select
        let bgColor, textColor;
        if (novoStatus === 'ativo') {
            bgColor = '#d4edda';
            textColor = '#155724';
        } else if (novoStatus === 'desativado') {
            bgColor = '#f8d7da';
            textColor = '#721c24';
        } else {
            bgColor = '#fff3cd';
            textColor = '#856404';
        }
        
        selectElement.style.backgroundColor = bgColor;
        selectElement.style.color = textColor;
        
        mostrarMensagemToast(`✅ Status alterado para ${novoStatus === 'ativo' ? 'Ativo' : (novoStatus === 'desativado' ? 'Desativado' : 'Pendente')}`);
    } else {
        mostrarMensagemToast('❌ Erro ao alterar status!', true);
    }
}
// ==================== FUNÇÕES AUXILIARES ====================

function formatarData(dataString) {
    if (!dataString) return '--/--/----';
    try {
        const data = new Date(dataString);
        if (isNaN(data.getTime())) {
            const [ano, mes, dia] = dataString.split('-');
            if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
            return '--/--/----';
        }
        return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
    } catch(e) {
        return '--/--/----';
    }
}

function formatarDocumento(doc) {
    if (!doc) return '--';
    const limpo = doc.replace(/\D/g, '');
    if (limpo.length === 11) {
        return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (limpo.length === 14) {
        return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
}

function formatarMoeda(valor) {
    if (!valor && valor !== 0) return 'R$ 0,00';
    const num = parseFloat(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getStatusBadgeClass(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'confirmado' || statusLower === 'ativo' || statusLower === 'pago') return 'badge-success';
    if (statusLower === 'cancelado' || statusLower === 'desativado') return 'badge-danger';
    if (statusLower === 'finalizado') return 'badge-secondary';
    return 'badge-warning';
}

function getStatusBgColor(status) {
    if (status === 'ativo') return '#d4edda';
    if (status === 'desativado') return '#f8d7da';
    return '#fff3cd';
}

function getStatusTextColor(status) {
    if (status === 'ativo') return '#155724';
    if (status === 'desativado') return '#721c24';
    return '#856404';
}

function filtrarTabelaRelatorio(tableId, input) {
    const filter = input ? input.value.toLowerCase() : '';
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.getElementsByTagName('tbody')[0]?.getElementsByTagName('tr') || [];
    const statusFiltroId = `filtroStatus${tableId.replace('tabela', '')}`;
    const statusFiltro = document.getElementById(statusFiltroId)?.value || 'todos';
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let matchesSearch = true;
        let matchesStatus = true;
        
        if (filter) {
            const cells = row.getElementsByTagName('td');
            let found = false;
            for (let j = 0; j < cells.length - 1; j++) {
                if (cells[j] && cells[j].textContent.toLowerCase().includes(filter)) {
                    found = true;
                    break;
                }
            }
            matchesSearch = found;
        }
        
        if (statusFiltro !== 'todos') {
            const statusAttr = row.getAttribute('data-status');
            if (statusAttr) {
                matchesStatus = statusAttr.toLowerCase() === statusFiltro.toLowerCase();
            } else {
                const statusCell = row.cells[5];
                if (statusCell) {
                    const statusText = statusCell.textContent.toLowerCase();
                    matchesStatus = statusText.includes(statusFiltro.toLowerCase());
                }
            }
        }
        
        row.style.display = (matchesSearch && matchesStatus) ? '' : 'none';
    }
}

function exportarRelatorioAtual(pageId) {
    const conteudo = document.getElementById(`conteudoRelatorio_${pageId}`);
    if (!conteudo) return;
    
    const tabela = conteudo.querySelector('table');
    if (!tabela) {
        alert('Nenhuma tabela encontrada para exportar');
        return;
    }
    
    let csv = [];
    const rows = tabela.querySelectorAll('tr');
    
    rows.forEach(row => {
        const rowData = [];
        const cols = row.querySelectorAll('th, td');
        cols.forEach((col, index) => {
            // Pular coluna de ações (última coluna)
            if (col.tagName === 'TD' && index === cols.length - 1 && cols.length > 2) return;
            rowData.push('"' + col.innerText.replace(/"/g, '""') + '"');
        });
        if (rowData.length > 0) csv.push(rowData.join(','));
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${pageId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    mostrarMensagemToast('📤 Relatório exportado com sucesso!');
}

function imprimirRelatorioAtual(pageId) {
    const conteudo = document.getElementById(`conteudoRelatorio_${pageId}`);
    if (!conteudo) return;
    
    const titulo = pageId.replace('relatorio_', '').replace(/_/g, ' ').toUpperCase();
    
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Relatório - ${titulo}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f5f5f5; }
                .header { text-align: center; margin-bottom: 20px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                @media print {
                    .no-print { display: none; }
                    button { display: none; }
                }
                .badge-success { background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; }
                .badge-danger { background: #dc3545; color: white; padding: 2px 8px; border-radius: 12px; }
                .badge-warning { background: #ffc107; color: #333; padding: 2px 8px; border-radius: 12px; }
                .badge-secondary { background: #6c757d; color: white; padding: 2px 8px; border-radius: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Relatório - ${titulo}</h1>
                <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            ${conteudo.innerHTML}
            <div class="footer">
                <p>Sistema de Gestão de Eventos - Relatório Oficial</p>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            <\/script>
        </body>
        </html>
    `);
    win.document.close();
}

function mostrarMensagemToast(mensagem, isError = false) {
    // Remove toast anterior se existir
    const toastAntigo = document.querySelector('.toast-mensagem');
    if (toastAntigo) toastAntigo.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-mensagem';
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${isError ? '#dc3545' : '#28a745'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 14px;
        animation: fadeInOut 3s ease-in-out;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    // Adiciona estilo de animação se não existir
    if (!document.getElementById('toastAnimationStyle')) {
        const style = document.createElement('style');
        style.id = 'toastAnimationStyle';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(20px); }
                15% { opacity: 1; transform: translateX(0); }
                85% { opacity: 1; transform: translateX(0); }
                100% { opacity: 0; transform: translateX(20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==================== FUNÇÃO GERAR PDF CHECKLIST COM FOTO ====================

function gerarPDFChecklistComFoto(checklistId) {
    console.log('📄 Gerando PDF do checklist com foto:', checklistId);
    
    const checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const checklist = checklists.find(c => c.id == checklistId);
    
    if (!checklist) {
        mostrarMensagemToast('❌ Checklist não encontrado!', true);
        return;
    }
    
    // Buscar foto do personagem
    let fotoPersonagem = '';
    let personagemNome = checklist.personagemNome || 'Não informado';
    
    try {
        const personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
        let personagens2 = JSON.parse(localStorage.getItem('personagens') || '[]');
        const todosPersonagens = [...personagens, ...personagens2];
        
        const personagem = todosPersonagens.find(p => p.id == checklist.personagemId || p.ID_personagens == checklist.personagemId);
        if (personagem) {
            fotoPersonagem = personagem.foto || personagem.foto_personagem || '';
            personagemNome = personagem.nome_personagens || personagem.nome || checklist.personagemNome || 'Não informado';
        }
    } catch(e) {
        console.error('Erro ao buscar foto do personagem:', e);
    }
    
    const dataAtual = new Date().toLocaleString('pt-BR');
    const dataCriacao = checklist.dataCriacao ? new Date(checklist.dataCriacao).toLocaleDateString('pt-BR') : 'Data não informada';
    
    let itensConcluidos = 0;
    let itensTable = '';
    
    if (checklist.itens && checklist.itens.length > 0) {
        checklist.itens.forEach((item, idx) => {
            if (item.concluido) itensConcluidos++;
            const statusText = item.concluido ? '✅ Concluído' : '⏳ Pendente';
            const statusColor = item.concluido ? '#28a745' : '#dc3545';
            
            itensTable += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px; text-align: center; width: 50px;">${idx + 1}</td>
                    <td style="padding: 10px;"><strong>${escapeHtml(item.nome || item.item || '-')}</strong></td>
                    <td style="padding: 10px;">${escapeHtml(item.categoria || '-')}</td>
                    <td style="padding: 10px; text-align: center;">${item.quantidade || 1}</td>
                    <td style="padding: 10px; text-align: center; color: ${statusColor}; font-weight: bold;">${statusText}</td>
                </tr>
            `;
        });
    } else {
        itensTable = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Nenhum item cadastrado neste checklist</td></tr>';
    }
    
    const percentualConcluido = checklist.itens && checklist.itens.length > 0 ? Math.round((itensConcluidos / checklist.itens.length) * 100) : 0;
    const statusText = checklist.status === 'ativo' ? 'Ativo' : (checklist.status === 'desativado' ? 'Desativado' : 'Pendente');
    const statusColor = checklist.status === 'ativo' ? '#28a745' : (checklist.status === 'desativado' ? '#dc3545' : '#ffc107');
    
    let fotoHtml = '';
    if (fotoPersonagem) {
        fotoHtml = `<img src="${fotoPersonagem}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%; border: 3px solid #28a745;">`;
    } else {
        fotoHtml = `<div style="width: 120px; height: 120px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 60px; color: white;">🎭</div>`;
    }
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Checklist - ${checklist.nome}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Arial', sans-serif; 
                    margin: 40px; 
                    background: white;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 3px solid #28a745; 
                    padding-bottom: 15px;
                }
                .header h1 { 
                    color: #28a745; 
                    margin: 0 0 10px 0;
                    font-size: 28px;
                }
                .header p {
                    color: #666;
                    font-size: 14px;
                }
                .info-personagem {
                    display: flex;
                    gap: 25px;
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .dados-personagem {
                    flex: 1;
                }
                .dados-personagem p {
                    margin: 8px 0;
                }
                .progresso {
                    margin-bottom: 25px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .progresso-bar {
                    background: #e0e0e0;
                    border-radius: 10px;
                    height: 12px;
                    margin-top: 8px;
                    overflow: hidden;
                }
                .progresso-fill {
                    background: linear-gradient(90deg, #28a745, #20c997);
                    width: ${percentualConcluido}%;
                    height: 100%;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background: #28a745;
                    color: white;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                }
                .badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .badge-ativo { background-color: #28a745; color: white; }
                .badge-pendente { background-color: #ffc107; color: #333; }
                .badge-desativado { background-color: #dc3545; color: white; }
                .total-info {
                    margin-top: 15px;
                    text-align: right;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📋 ${escapeHtml(checklist.nome)}</h1>
                <p>Checklist de itens e materiais - Documento oficial</p>
            </div>
            
            <div class="info-personagem">
                ${fotoHtml}
                <div class="dados-personagem">
                    <h2 style="color: #28a745; margin-bottom: 10px;">🎭 ${escapeHtml(personagemNome)}</h2>
                    <p><strong>📝 Descrição:</strong> ${escapeHtml(checklist.descricao || 'Sem descrição')}</p>
                    <p><strong>📅 Data de Criação:</strong> ${dataCriacao}</p>
                    <p><strong>⚡ Status:</strong> <span class="badge badge-${checklist.status === 'ativo' ? 'ativo' : (checklist.status === 'desativado' ? 'desativado' : 'pendente')}">${statusText}</span></p>
                </div>
            </div>
            
            <div class="progresso">
                <div style="display: flex; justify-content: space-between;">
                    <strong>📊 Progresso do Checklist</strong>
                    <span>${itensConcluidos}/${checklist.itens ? checklist.itens.length : 0} itens concluídos (${percentualConcluido}%)</span>
                </div>
                <div class="progresso-bar">
                    <div class="progresso-fill"></div>
                </div>
            </div>
            
            <h3>📋 Lista de Itens</h3>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">#</th>
                        <th>Item</th>
                        <th>Categoria</th>
                        <th style="text-align: center;">Quantidade</th>
                        <th style="text-align: center;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${itensTable}
                </tbody>
            </table>
            
            <div class="total-info">
                <p>Total de itens: ${checklist.itens ? checklist.itens.length : 0}</p>
            </div>
            
            <div class="footer">
                <p>Documento gerado automaticamente pelo Sistema de Gestão de Eventos</p>
                <p>Data de emissão: ${dataAtual}</p>
                <p>Checklist ID: ${checklistId}</p>
            </div>
        </body>
        </html>
    `;
    
    const win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
    setTimeout(() => win.print(), 500);
}

function gerarPDFListaChecklists() {
    const checklists = JSON.parse(localStorage.getItem('checklists_cadastrados') || '[]');
    const dataAtual = new Date().toLocaleString('pt-BR');
    
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Checklists</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                .header h1 { color: #007bff; margin: 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f2f2f2; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                .status-ativo { color: #28a745; font-weight: bold; }
                .status-pendente { color: #ffc107; font-weight: bold; }
                .status-desativado { color: #dc3545; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📋 Relatório de Checklists</h1>
                <p>Lista completa de todos os checklists cadastrados no sistema</p>
            </div>
            <p><strong>📊 Total de Checklists:</strong> ${checklists.length}</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 50px;">#</th>
                        <th>Nome</th>
                        <th>Personagem</th>
                        <th>Itens</th>
                        <th>Data Criação</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    if (checklists.length > 0) {
        checklists.forEach((c, index) => {
            const dataCriacao = c.dataCriacao ? new Date(c.dataCriacao).toLocaleDateString('pt-BR') : 'Data não informada';
            let statusClass = '';
            let statusText = c.status || 'Pendente';
            
            if (statusText === 'ativo') statusClass = 'status-ativo';
            else if (statusText === 'pendente') statusClass = 'status-pendente';
            else if (statusText === 'desativado') statusClass = 'status-desativado';
            
            htmlContent += `
                <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td><strong>${c.nome || '-'}</strong></td>
                    <td>${c.personagemNome || '-'}</td>
                    <td style="text-align: center;">${c.itens ? c.itens.length : 0}</td>
                    <td>${dataCriacao}</td>
                    <td class="${statusClass}">${statusText === 'ativo' ? '✅ Ativo' : (statusText === 'pendente' ? '⏳ Pendente' : '❌ Desativado')}</td>
                </tr>
            `;
        });
    } else {
        htmlContent += `<tr><td colspan="6" style="text-align: center;">Nenhum checklist cadastrado</td></tr>`;
    }
    
    htmlContent += `
                </tbody>
            </table>
            <div class="footer">
                <p>Documento gerado automaticamente pelo Sistema de Gestão de Eventos</p>
                <p>Data de emissão: ${dataAtual}</p>
            </div>
        </body>
        </html>
    `;
    
    const win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
    setTimeout(() => win.print(), 500);
}

// ==================== FUNÇÕES AUXILIARES PARA ESCAPE HTML ====================

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
// ==================== MÓDULO FINANCEIRO UNIFICADO ====================

function carregarRelatorioFinanceiroUnificado(container) {
    console.log('💰 Inicializando interface do relatório financeiro...');
    
    // 1. Criar os Formulários de Filtro e os Cards de Resumo
    container.innerHTML = `
        <div class="filtro-container" style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid #e9ecef;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: flex-end;">
                <div>
                    <label style="display:block; margin-bottom:0.5rem; font-weight:bold; font-size:14px;">Data Início</label>
                    <input type="date" id="fin_data_inicio" class="form-control" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                </div>
                <div>
                    <label style="display:block; margin-bottom:0.5rem; font-weight:bold; font-size:14px;">Data Fim</label>
                    <input type="date" id="fin_data_fim" class="form-control" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                </div>
                <div>
                    <label style="display:block; margin-bottom:0.5rem; font-weight:bold; font-size:14px;">Status do Evento</label>
                    <select id="fin_status" class="form-control" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        <option value="">Todos os Status</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>
                </div>
                <div>
                    <button type="button" class="btn primary" onclick="filtrarDadosFinanceiros()" style="width:100%; padding:9px;">🔍 Filtrar Finanças</button>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: #e3f2fd; border-left: 5px solid #2196f3; padding: 1rem; border-radius: 6px;">
                <div style="font-size: 14px; color: #555; font-weight: bold;">Faturamento Total</div>
                <div id="card_faturamento" style="font-size: 24px; font-weight: bold; color: #0d47a1; margin-top: 0.5rem;">R$ 0,00</div>
            </div>
            <div style="background: #e8f5e9; border-left: 5px solid #4caf50; padding: 1rem; border-radius: 6px;">
                <div style="font-size: 14px; color: #555; font-weight: bold;">Total Recebido (Sinal)</div>
                <div id="card_recebido" style="font-size: 24px; font-weight: bold; color: #1b5e20; margin-top: 0.5rem;">R$ 0,00</div>
            </div>
            <div style="background: #fff3e0; border-left: 5px solid #ff9800; padding: 1rem; border-radius: 6px;">
                <div style="font-size: 14px; color: #555; font-weight: bold;">A Receber (Saldo)</div>
                <div id="card_areceber" style="font-size: 24px; font-weight: bold; color: #e65100; margin-top: 0.5rem;">R$ 0,00</div>
            </div>
        </div>

        <div class="table-container">
            <table class="tabela-relatorio" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f1f3f5; text-align: left;">
                        <th style="padding: 10px; border-bottom: 2px solid #dee2e6;">Data</th>
                        <th style="padding: 10px; border-bottom: 2px solid #dee2e6;">Cliente / Evento</th>
                        <th style="padding: 10px; border-bottom: 2px solid #dee2e6;">Status</th>
                        <th style="padding: 10px; border-bottom: 2px solid #dee2e6;">Valor Total</th>
                        <th style="padding: 10px; border-bottom: 2px solid #dee2e6;">Sinal Pago</th>
                        <th style="padding: 10px; border-bottom: 2px solid #dee2e6;">Saldo Restante</th>
                    </tr>
                </thead>
                <tbody id="tabela_financeira_body">
                    <tr>
                        <td colspan="6" style="text-align:center; padding:2rem; color:#888;">Nenhum dado filtrado ainda.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // Executa a primeira listagem automática carregando os dados reais
    filtrarDadosFinanceiros();
}

function filtrarDadosFinanceiros() {
    const dataInicio = document.getElementById('fin_data_inicio')?.value;
    const dataFim = document.getElementById('fin_data_fim')?.value;
    const statusFiltro = document.getElementById('fin_status')?.value;
    const tbody = document.getElementById('tabela_financeira_body');
    
    if (!tbody) return;

    // Buscar eventos dos armazenamentos comuns
    let eventos = [];
    try {
        const stored = localStorage.getItem('eventos_cadastrados') || localStorage.getItem('eventos');
        if (stored) eventos = JSON.parse(stored);
    } catch(e) {
        console.error("Erro ao ler dados do localStorage para finanças:", e);
    }

    if (!Array.isArray(eventos)) eventos = [];

    let faturamentoTotal = 0;
    let recebidoTotal = 0;
    let aReceberTotal = 0;
    let htmlTabela = '';

    // Filtragem dos itens
    const eventosFiltrados = eventos.filter(ev => {
        if (statusFiltro && ev.status !== statusFiltro) return false;
        if (dataInicio && ev.data && ev.data < dataInicio) return false;
        if (dataFim && ev.data && ev.data > dataFim) return false;
        return true;
    });

    if (eventosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:#999;">Nenhum registro financeiro encontrado para os filtros selecionados.</td></tr>`;
        atualizarCardsFinanceiros(0, 0, 0);
        return;
    }

    // Montar as linhas e efetuar os cálculos matemáticos
    eventosFiltrados.forEach(ev => {
        // Conversão segura de valores monetários numéricos
        const vTotal = parseFloat(ev.valorTotal || ev.valor || 0);
        const vSinal = parseFloat(ev.valorSinal || ev.sinal || 0);
        const vSaldo = Math.max(0, vTotal - vSinal);

        faturamentoTotal += vTotal;
        recebidoTotal += vSinal;
        aReceberTotal += vSaldo;

        const dataFormatada = ev.data ? ev.data.split('-').reverse().join('/') : '---';
        const nomeCliente = ev.cliente || ev.nomeCliente || 'Não Informado';
        const nomeEvento = ev.titulo || ev.nomeEvento || ev.tipoEvento || 'Evento';

        htmlTabela += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${dataFormatada}</td>
                <td style="padding: 10px;"><strong>${nomeCliente}</strong><br><small style="color:#666">${nomeEvento}</small></td>
                <td style="padding: 10px;"><span class="badge ${obterClasseStatusFin(ev.status)}">${ev.status || 'Pendente'}</span></td>
                <td style="padding: 10px; font-weight: 500;">${formatarMoedaCorporativa(vTotal)}</td>
                <td style="padding: 10px; color: green;">${formatarMoedaCorporativa(vSinal)}</td>
                <td style="padding: 10px; color: ${vSaldo > 0 ? '#ff9800' : '#4caf50'}; font-weight: 500;">${formatarMoedaCorporativa(vSaldo)}</td>
            </tr>
        `;
    });

    tbody.innerHTML = htmlTabela;
    atualizarCardsFinanceiros(faturamentoTotal, recebidoTotal, aReceberTotal);
}

function atualizarCardsFinanceiros(fat, rec, aRec) {
    if(document.getElementById('card_faturamento')) document.getElementById('card_faturamento').textContent = formatarMoedaCorporativa(fat);
    if(document.getElementById('card_recebido')) document.getElementById('card_recebido').textContent = formatarMoedaCorporativa(rec);
    if(document.getElementById('card_areceber')) document.getElementById('card_areceber').textContent = formatarMoedaCorporativa(aRec);
}

function formatarMoedaCorporativa(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function obterClasseStatusFin(status) {
    if (!status) return 'status-pendente';
    const s = status.toLowerCase();
    if (s.includes('conf') || s === 'pago') return 'status-confirmado';
    if (s.includes('canc')) return 'status-cancelado';
    return 'status-pendente';
}
// ==================== FUNÇÃO AUXILIAR PARA FORMATAR VALOR ====================

function formatarValorPersonagemParaExibicao(valor) {
    if (valor === undefined || valor === null || valor === '') return 'R$ 0,00';
    
    // Se já for string com R$, retorna como está
    if (typeof valor === 'string' && valor.includes('R$')) return valor;
    
    let num;
    if (typeof valor === 'number') {
        num = valor;
    } else {
        // Converte string para número
        let limpo = String(valor).replace(/[^\d,-]/g, '').replace(',', '.');
        num = parseFloat(limpo) || 0;
    }
    
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Vincular escopo global para os botões HTML conseguirem executar as ações
window.carregarRelatorioFinanceiroUnificado = carregarRelatorioFinanceiroUnificado;
window.filtrarDadosFinanceiros = filtrarDadosFinanceiros;
// Exportar funções globais
window.carregarRelatorio = carregarRelatorio;
window.visualizarEvento = visualizarEvento;
window.editarEvento = editarEvento;
window.excluirEvento = excluirEvento;
window.editarCliente = editarCliente;
window.excluirCliente = excluirCliente;
window.editarPersonagem = editarPersonagem;
window.excluirPersonagem = excluirPersonagem;
window.editarCasaFesta = editarCasaFesta;
window.excluirCasaFesta = excluirCasaFesta;
window.visualizarChecklistModal = visualizarChecklistModal;
window.fecharModalChecklistVisualizar = fecharModalChecklistVisualizar;
window.gerarPDFChecklistComFoto = gerarPDFChecklistComFoto;
window.gerarPDFListaChecklists = gerarPDFListaChecklists;
window.editarChecklistRel = editarChecklistRel;
window.excluirChecklistRel = excluirChecklistRel;
window.alterarStatusChecklistRel = alterarStatusChecklistRel;
window.editarEquipeRel = editarEquipeRel;
window.excluirEquipeRel = excluirEquipeRel;
window.mostrarAbaEquipeRel = mostrarAbaEquipeRel;
window.filtrarTabelaRelatorio = filtrarTabelaRelatorio;
window.exportarRelatorioAtual = exportarRelatorioAtual;
window.imprimirRelatorioAtual = imprimirRelatorioAtual;
window.mostrarMensagemToast = mostrarMensagemToast;
window.formatarData = formatarData;
window.formatarDocumento = formatarDocumento;
window.formatarMoeda = formatarMoeda;
// Exportar funções adicionais
window.editarPersonagem = editarPersonagem;
window.preencherFormularioPersonagemCompleto = preencherFormularioPersonagemCompleto;
window.editarChecklistRel = editarChecklistRel;
window.preencherFormularioChecklistCompleto = preencherFormularioChecklistCompleto;
window.carregarFotoPersonagemChecklist = carregarFotoPersonagemChecklist;
window.restaurarFotoChecklist = restaurarFotoChecklist;
window.preencherItensChecklistCompletos = preencherItensChecklistCompletos;
// Exportar funções
window.carregarRelatorioEquipe = carregarRelatorioEquipe;
window.montarTabelaEquipeCompleta = montarTabelaEquipeCompleta;
window.mostrarAbaEquipeRel = mostrarAbaEquipeRel;
window.filtrarTabelaEquipeRel = filtrarTabelaEquipeRel;
window.salvarElencoCompleto = salvarElencoCompleto;
console.log('✅ relatorios-equipe.js carregado com sucesso! (Versão corrigida)');
