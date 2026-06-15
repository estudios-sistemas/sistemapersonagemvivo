// Sistema de Notificações do App

// Criar notificação quando elenco é escalado
function criarNotificacaoEscala(cpf, eventoId, nomeEvento, dataEvento) {
    const empresaStr = sessionStorage.getItem('empresa_logada');
    const empresaObj = empresaStr ? JSON.parse(empresaStr) : null;
    const empresaId = empresaObj ? (empresaObj.id || empresaObj.pasta || 'app') : 'app';
    const storageKey = `notificacoes_app_${empresaId}`;
    const notificacoes = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const nova = {
        id: Date.now(),
        cpf: cpf,
        tipo: 'escala',
        titulo: '🎭 Você foi escalado!',
        mensagem: 'Verifique seu evento',
        eventoId: eventoId,
        nomeEvento: nomeEvento,
        dataEvento: dataEvento,
        lida: false,
        dataCriacao: new Date().toISOString()
    };
    
    notificacoes.push(nova);
    localStorage.setItem(storageKey, JSON.stringify(notificacoes));
}

// Obter chave de armazenamento das notificações
function getNotificacoesKey() {
    const empresaStr = sessionStorage.getItem('empresa_logada');
    const empresaObj = empresaStr ? JSON.parse(empresaStr) : null;
    const empresaId = empresaObj ? (empresaObj.id || empresaObj.pasta || 'app') : 'app';
    return `notificacoes_app_${empresaId}`;
}

// Carregar notificações do usuário logado
function carregarNotificacoesUsuario() {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario_logado_app') || '{}');
    if (!usuarioLogado.cpf) return [];
    const cpfLimpo = String(usuarioLogado.cpf).replace(/\D/g,'');
    const notificacoes = JSON.parse(localStorage.getItem(getNotificacoesKey()) || '[]');
    return notificacoes.filter(n => String(n.cpf).replace(/\D/g,'') === cpfLimpo);
}

// Contar notificações não lidas
function contarNotificacoesNaoLidas() {
    const notificacoes = carregarNotificacoesUsuario();
    return notificacoes.filter(n => !n.lida).length;
}

// Marcar notificação como lida
function marcarNotificacaoLida(id) {
    const notificacoes = JSON.parse(localStorage.getItem(getNotificacoesKey()) || '[]');
    const notif = notificacoes.find(n => n.id === id);
    if (notif) {
        notif.lida = true;
        localStorage.setItem(getNotificacoesKey(), JSON.stringify(notificacoes));
        atualizarBadgeNotificacoes();
    }
}

// Marcar todas como lidas
function marcarTodasLidas() {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario_logado_app') || '{}');
    const cpfLimpo = String(usuarioLogado.cpf || '').replace(/\D/g,'');
    const notificacoes = JSON.parse(localStorage.getItem(getNotificacoesKey()) || '[]');
    notificacoes.forEach(n => {
        if (String(n.cpf).replace(/\D/g,'') === cpfLimpo) n.lida = true;
    });
    localStorage.setItem(getNotificacoesKey(), JSON.stringify(notificacoes));
    atualizarBadgeNotificacoes();
    mostrarNotificacoes();
}

// Atualizar badge de notificações
function atualizarBadgeNotificacoes() {
    const count = contarNotificacoesNaoLidas();
    const badge = document.getElementById('badgeNotificacoes');
    
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Mostrar painel de notificações
function mostrarNotificacoes() {
    const notificacoes = carregarNotificacoesUsuario();
    notificacoes.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
    
    let html = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;" id="modalNotificacoes" onclick="if(event.target.id==='modalNotificacoes') fecharNotificacoes()">
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0;">🔔 Notificações</h3>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn" onclick="marcarTodasLidas()" style="padding: 4px 8px; font-size: 12px;">Marcar todas como lidas</button>
                        <button class="btn danger" onclick="fecharNotificacoes()">✖</button>
                    </div>
                </div>
    `;
    
    if (notificacoes.length === 0) {
        html += '<p style="text-align: center; color: #6c757d; padding: 2rem;">Nenhuma notificação</p>';
    } else {
        notificacoes.forEach(notif => {
            const dataFormatada = new Date(notif.dataCriacao).toLocaleString('pt-BR');
            const bgColor = notif.lida ? '#f8f9fa' : '#e8f4fd';
            const borderColor = notif.lida ? '#dee2e6' : '#007bff';
            
            html += `
                <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; cursor: pointer;" onclick="marcarNotificacaoLida(${notif.id})">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 0.5rem 0;">${notif.titulo}</h4>
                            <p style="margin: 0 0 0.5rem 0;">${notif.mensagem}</p>
                            ${notif.nomeEvento ? `<p style="margin: 0; font-size: 14px; color: #666;"><strong>Evento:</strong> ${notif.nomeEvento}</p>` : ''}
                            ${notif.dataEvento ? `<p style="margin: 0; font-size: 14px; color: #666;"><strong>Data:</strong> ${new Date(notif.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')}</p>` : ''}
                            <small style="color: #6c757d;">${dataFormatada}</small>
                        </div>
                        ${!notif.lida ? '<div style="width: 10px; height: 10px; background: #007bff; border-radius: 50%; margin-left: 1rem;"></div>' : ''}
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// Fechar painel de notificações
function fecharNotificacoes() {
    const modal = document.getElementById('modalNotificacoes');
    if (modal) modal.remove();
}

// Verificar novas notificações periodicamente
function iniciarVerificacaoNotificacoes() {
    atualizarBadgeNotificacoes();
    setInterval(() => {
        atualizarBadgeNotificacoes();
    }, 30000); // Verifica a cada 30 segundos
}

// Exportar funções
window.criarNotificacaoEscala = criarNotificacaoEscala;
window.carregarNotificacoesUsuario = carregarNotificacoesUsuario;
window.contarNotificacoesNaoLidas = contarNotificacoesNaoLidas;
window.marcarNotificacaoLida = marcarNotificacaoLida;
window.marcarTodasLidas = marcarTodasLidas;
window.atualizarBadgeNotificacoes = atualizarBadgeNotificacoes;
window.mostrarNotificacoes = mostrarNotificacoes;
window.fecharNotificacoes = fecharNotificacoes;
window.iniciarVerificacaoNotificacoes = iniciarVerificacaoNotificacoes;

console.log('notificacoes-app.js carregado');
