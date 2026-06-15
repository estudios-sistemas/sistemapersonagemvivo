// ==================== MENSAGENS DO APP DE USUÁRIO ====================
// Integração com grupos criados pelo admin no sistema principal

let mensagensAppCache = { conversas: [] };
let conversaAppAtual = null;
let pollingAppInterval = null;
let hashMensagensApp = {};

// ---- Utilitários ----

function getUsuarioAppLogado() {
    try {
        const u = JSON.parse(sessionStorage.getItem('usuarioLogadoUnificado') || 'null');
        if (u && u.cpf) return u;
    } catch(e) {}
    return null;
}

function getEmpresasDoUsuarioApp() {
    const usuario = getUsuarioAppLogado();
    if (!usuario) return [];
    const empresas = [];
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave && chave.startsWith('usuarios_app_')) {
            try {
                const lista = JSON.parse(localStorage.getItem(chave) || '[]');
                if (lista.find(u => u.cpf === usuario.cpf)) {
                    const empresaId = chave.replace('usuarios_app_', '');
                    empresas.push(empresaId);
                }
            } catch(e) {}
        }
    }
    return empresas;
}

function escapeHtmlApp(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function formatarHoraRelativaApp(dataISO) {
    if (!dataISO) return '';
    const diff = Math.floor((new Date() - new Date(dataISO)) / 60000);
    if (diff < 1) return 'Agora';
    if (diff < 60) return `${diff}min`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return new Date(dataISO).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatarHorarioApp(dataISO) {
    if (!dataISO) return '';
    return new Date(dataISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ---- Carregar conversas do usuário (de todas as empresas dele) ----

function carregarConversasApp() {
    const usuario = getUsuarioAppLogado();
    if (!usuario) return [];

    const empresaIds = getEmpresasDoUsuarioApp();
    const todasConversas = [];

    const meuCpf = String(usuario.cpf || '').trim();
    const meuNome = String(usuario.nome || '').trim();

    for (const empresaId of empresaIds) {
        const storageKey = `${empresaId}_conversas`;
        let conversas = [];
        try {
            conversas = JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch(e) { continue; }

        for (const conv of conversas) {
            if (!conv.participantes) continue;
            const participantes = conv.participantes.map(p => String(p).trim());
            if (participantes.includes(meuCpf)) {
                todasConversas.push({ ...conv, _empresaId: empresaId });
            }
        }
    }

    todasConversas.sort((a, b) => {
        const dA = a.ultimaMensagemData ? new Date(a.ultimaMensagemData) : 0;
        const dB = b.ultimaMensagemData ? new Date(b.ultimaMensagemData) : 0;
        return dB - dA;
    });

    mensagensAppCache.conversas = todasConversas;
    atualizarBadgeMensagensApp();
    return todasConversas;
}

function getMensagensKeyApp(empresaId, conversaId) {
    return `${empresaId}_mensagens_${conversaId}`;
}

// ---- Badge ----

function atualizarBadgeMensagensApp() {
    const total = mensagensAppCache.conversas.reduce((s, c) => s + (c.naoLidas || 0), 0);
    const badge = document.getElementById('chatAppBadge');
    if (!badge) return;
    if (total > 0) {
        badge.style.display = 'flex';
        badge.textContent = total > 99 ? '99+' : total;
    } else {
        badge.style.display = 'none';
    }
}

// ---- Botão flutuante ----

function adicionarBotaoChatApp() {
    if (document.getElementById('chatAppFloatBtn')) return;

    const btn = document.createElement('div');
    btn.id = 'chatAppFloatBtn';
    btn.title = 'Mensagens';
    btn.style.cssText = `
        position:fixed;bottom:20px;right:20px;width:60px;height:60px;
        background:linear-gradient(135deg,#007bff,#0056b3);color:white;
        border-radius:50%;display:flex;align-items:center;justify-content:center;
        font-size:28px;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3);
        z-index:999999;transition:all 0.3s;
    `;
    btn.innerHTML = '💬';

    const badge = document.createElement('span');
    badge.id = 'chatAppBadge';
    badge.style.cssText = `
        position:absolute;top:-5px;right:-5px;background:#dc3545;color:white;
        border-radius:50%;width:22px;height:22px;font-size:12px;display:none;
        align-items:center;justify-content:center;font-weight:bold;
    `;
    btn.appendChild(badge);

    btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    btn.onclick = abrirModalMensagensApp;

    document.body.appendChild(btn);
}

// ---- Notificação flutuante ----

function mostrarNotificacaoApp(conversaNome, mensagem, remetente) {
    const modal = document.getElementById('chatAppModal');
    if (modal && modal.style.display === 'flex' && conversaAppAtual) return;

    const antiga = document.getElementById('notifAppContainer');
    if (antiga) antiga.remove();

    const notif = document.createElement('div');
    notif.id = 'notifAppContainer';
    notif.style.cssText = `
        position:fixed;bottom:100px;right:20px;width:300px;background:white;
        border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);padding:12px 15px;
        z-index:999998;cursor:pointer;border-left:4px solid #007bff;
    `;
    notif.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:40px;height:40px;background:#007bff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;">💬</div>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:bold;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtmlApp(remetente || 'Nova mensagem')}</div>
                <div style="font-size:12px;color:#666;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtmlApp(conversaNome)}</div>
                <div style="font-size:13px;margin-top:4px;overflow:hidden;text-overflow:ellipsis;">${escapeHtmlApp(String(mensagem).substring(0, 80))}${String(mensagem).length > 80 ? '...' : ''}</div>
            </div>
            <span style="cursor:pointer;color:#999;font-size:18px;padding-left:5px;" onclick="event.stopPropagation();this.closest('#notifAppContainer').remove();">&times;</span>
        </div>
    `;
    notif.onclick = () => { notif.remove(); abrirModalMensagensApp(); };
    document.body.appendChild(notif);
    setTimeout(() => notif.parentNode && notif.remove(), 5000);
}

// ---- Polling ----

function iniciarPollingApp() {
    if (pollingAppInterval) clearInterval(pollingAppInterval);
    pollingAppInterval = setInterval(() => {
        const conversas = carregarConversasApp();
        const modal = document.getElementById('chatAppModal');

        if (modal && modal.style.display === 'flex' && conversaAppAtual) {
            carregarMensagensConversaApp(conversaAppAtual._empresaId, conversaAppAtual.id);
        }

        const usuario = getUsuarioAppLogado();
        if (!usuario) return;

        for (const conv of conversas) {
            const key = getMensagensKeyApp(conv._empresaId, conv.id);
            const msgs = JSON.parse(localStorage.getItem(key) || '[]');
            const total = msgs.length;
            const hashKey = `${conv._empresaId}_${conv.id}`;

            if (hashMensagensApp[hashKey] !== undefined && total > hashMensagensApp[hashKey]) {
                const ultima = msgs[msgs.length - 1];
                if (String(ultima.remetente).trim() !== String(usuario.cpf).trim()) {
                    mostrarNotificacaoApp(conv.nome, ultima.mensagem, ultima.remetenteNome || ultima.remetente);
                }
            }
            hashMensagensApp[hashKey] = total;
        }

        if (modal && modal.style.display === 'flex') {
            renderizarListaConversasApp(conversas);
        }

        // Atualizar badge da aba de mensagens
        const totalNaoLidas = conversas.reduce((s, c) => s + (c.naoLidas || 0), 0);
        const badgeAba = document.getElementById('badgeAbaMensagens');
        if (badgeAba) {
            badgeAba.style.display = totalNaoLidas > 0 ? 'inline-flex' : 'none';
            badgeAba.textContent = totalNaoLidas;
        }
    }, 3000);
}

// ---- Modal principal ----

function abrirModalMensagensApp() {
    let modal = document.getElementById('chatAppModal');
    if (modal) {
        modal.style.display = 'flex';
        renderizarListaConversasApp(carregarConversasApp());
        return;
    }

    modal = document.createElement('div');
    modal.id = 'chatAppModal';
    modal.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);
        display:flex;align-items:center;justify-content:center;z-index:1000000;
    `;
    modal.innerHTML = `
        <div style="width:1100px;max-width:95%;height:85vh;background:white;border-radius:12px;display:flex;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.2);">
            <!-- Sidebar -->
            <div style="width:300px;background:#f8f9fa;border-right:1px solid #dee2e6;display:flex;flex-direction:column;">
                <div style="padding:1rem;background:#007bff;color:white;">
                    <h3 style="margin:0 0 0.5rem;">💬 Mensagens</h3>
                    <input type="text" id="buscaConversaApp" placeholder="Buscar..." style="width:100%;padding:6px;border-radius:20px;border:none;">
                </div>
                <div id="listaConversasApp" style="flex:1;overflow-y:auto;padding:0.5rem;"></div>
                <div style="padding:0.75rem;border-top:1px solid #dee2e6;background:white;display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:12px;color:#6c757d;">💬 Grupos criados pelo admin</span>
                    <button onclick="fecharModalMensagensApp()" style="background:#dc3545;color:white;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;">Fechar</button>
                </div>
            </div>
            <!-- Área de chat -->
            <div style="flex:1;display:flex;flex-direction:column;background:#e9ecef;">
                <div id="chatAppPlaceholder" style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#6c757d;">
                    <div style="font-size:48px;margin-bottom:1rem;">💬</div>
                    <p>Selecione um grupo para ver as mensagens</p>
                </div>
                <div id="chatAppActive" style="display:none;flex-direction:column;height:100%;">
                    <div style="padding:0.75rem 1rem;background:white;border-bottom:1px solid #dee2e6;display:flex;align-items:center;gap:0.75rem;">
                        <div id="chatAppAvatar" style="width:40px;height:40px;border-radius:50%;background:#007bff;display:flex;align-items:center;justify-content:center;color:white;">👥</div>
                        <strong id="chatAppNome">Grupo</strong>
                    </div>
                    <div id="chatAppMessages" style="flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;"></div>
                    <div style="padding:1rem;background:white;border-top:1px solid #dee2e6;">
                        <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;">
                            <button onclick="enviarRapidoApp('ok')" style="background:#28a745;color:white;border:none;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:12px;">👍 OK</button>
                            <button onclick="enviarRapidoApp('atraso')" style="background:#ffc107;color:#333;border:none;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:12px;">⏰ Atraso</button>
                            <button onclick="enviarRapidoApp('confirmado')" style="background:#17a2b8;color:white;border:none;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:12px;">✅ Confirmado</button>
                            <button onclick="enviarRapidoApp('cancelado')" style="background:#dc3545;color:white;border:none;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:12px;">❌ Cancelado</button>
                        </div>
                        <div style="display:flex;gap:0.5rem;">
                            <textarea id="chatAppInput" placeholder="Digite sua mensagem..." rows="2" style="flex:1;padding:0.5rem;border-radius:8px;border:1px solid #ddd;resize:none;"></textarea>
                            <button onclick="enviarMensagemApp()" style="background:#007bff;color:white;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    renderizarListaConversasApp(carregarConversasApp());

    document.getElementById('buscaConversaApp').addEventListener('input', () => {
        const termo = document.getElementById('buscaConversaApp').value.toLowerCase();
        document.querySelectorAll('#listaConversasApp .item-conv-app').forEach(el => {
            const nome = el.dataset.nome || '';
            el.style.display = nome.includes(termo) ? 'flex' : 'none';
        });
    });

    document.getElementById('chatAppInput').addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensagemApp(); }
    });
}

function fecharModalMensagensApp() {
    const modal = document.getElementById('chatAppModal');
    if (modal) modal.style.display = 'none';
}

// ---- Lista lateral ----

function renderizarListaConversasApp(conversas) {
    const lista = document.getElementById('listaConversasApp');
    if (!lista) return;

    if (conversas.length === 0) {
        lista.innerHTML = `<div style="text-align:center;padding:2rem;color:#6c757d;">Nenhum grupo disponível.<br><small>O admin precisa criar grupos e adicioná-lo.</small></div>`;
        return;
    }

    lista.innerHTML = conversas.map(conv => {
        const ativo = conversaAppAtual && conversaAppAtual.id === conv.id && conversaAppAtual._empresaId === conv._empresaId;
        return `
            <div class="item-conv-app" data-nome="${escapeHtmlApp(conv.nome.toLowerCase())}"
                 onclick="abrirConversaApp('${conv._empresaId}','${conv.id}')"
                 style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border-radius:8px;cursor:pointer;margin-bottom:4px;${ativo ? 'background:#e9ecef;' : ''}">
                <div style="width:45px;height:45px;border-radius:50%;background:#007bff;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;">${conv.avatar || '👥'}</div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;">
                        <strong style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtmlApp(conv.nome)}</strong>
                        <span style="font-size:10px;color:#6c757d;">${formatarHoraRelativaApp(conv.ultimaMensagemData)}</span>
                    </div>
                    <div style="font-size:12px;color:#6c757d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtmlApp(conv.ultimaMensagem || 'Nenhuma mensagem')}</div>
                </div>
                ${conv.naoLidas > 0 ? `<div style="background:#dc3545;color:white;border-radius:50%;min-width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;">${conv.naoLidas}</div>` : ''}
            </div>
        `;
    }).join('');
}

// ---- Abrir conversa ----

function abrirConversaApp(empresaId, conversaId) {
    const conversas = carregarConversasApp();
    const conv = conversas.find(c => c._empresaId === empresaId && c.id === conversaId);
    if (!conv) return;

    conversaAppAtual = conv;

    document.getElementById('chatAppPlaceholder').style.display = 'none';
    const chatActive = document.getElementById('chatAppActive');
    chatActive.style.display = 'flex';
    document.getElementById('chatAppNome').textContent = conv.nome;
    document.getElementById('chatAppAvatar').textContent = conv.avatar || '👥';

    carregarMensagensConversaApp(empresaId, conversaId);
    renderizarListaConversasApp(conversas);

    // Marcar como lidas
    if (conv.naoLidas > 0) {
        const storageKey = `${empresaId}_conversas`;
        let todasConversas = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const idx = todasConversas.findIndex(c => c.id === conversaId);
        if (idx !== -1) { todasConversas[idx].naoLidas = 0; localStorage.setItem(storageKey, JSON.stringify(todasConversas)); }
        atualizarBadgeMensagensApp();
    }
}

// ---- Mensagens da conversa ----

function carregarMensagensConversaApp(empresaId, conversaId) {
    const usuario = getUsuarioAppLogado();
    if (!usuario) return;

    const key = getMensagensKeyApp(empresaId, conversaId);
    const mensagens = JSON.parse(localStorage.getItem(key) || '[]');
    const container = document.getElementById('chatAppMessages');
    if (!container) return;

    const estavaNoFinal = container.scrollHeight - container.scrollTop <= container.clientHeight + 40;

    if (mensagens.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#6c757d;">💬 Nenhuma mensagem ainda.</div>';
        return;
    }

    container.innerHTML = '';
    for (const msg of mensagens) {
        const minha = String(msg.remetente).trim() === String(usuario.cpf).trim();
        const sistema = msg.remetente === 'sistema';
        const div = document.createElement('div');

        if (sistema) {
            div.style.cssText = 'display:flex;justify-content:center;margin-bottom:0.5rem;';
            div.innerHTML = `<div style="background:#e9ecef;color:#6c757d;padding:5px 12px;border-radius:20px;font-size:12px;"><i>${escapeHtmlApp(msg.mensagem)}</i></div>`;
        } else if (minha) {
            div.style.cssText = 'display:flex;justify-content:flex-end;margin-bottom:0.5rem;';
            div.innerHTML = `<div style="max-width:70%;background:#007bff;color:white;padding:8px 12px;border-radius:12px;">
                <div>${escapeHtmlApp(msg.mensagem)}</div>
                <div style="font-size:10px;text-align:right;margin-top:4px;opacity:0.7;">${formatarHorarioApp(msg.data)}</div>
            </div>`;
        } else {
            div.style.cssText = 'display:flex;justify-content:flex-start;margin-bottom:0.5rem;';
            div.innerHTML = `<div style="max-width:70%;">
                <div style="font-size:11px;font-weight:bold;color:#007bff;margin-bottom:2px;">${escapeHtmlApp(msg.remetenteNome || msg.remetente)}</div>
                <div style="background:white;color:#333;padding:8px 12px;border-radius:12px;box-shadow:0 1px 2px rgba(0,0,0,0.1);">
                    <div>${escapeHtmlApp(msg.mensagem)}</div>
                    <div style="font-size:10px;text-align:right;margin-top:4px;color:#999;">${formatarHorarioApp(msg.data)}</div>
                </div>
            </div>`;
        }
        container.appendChild(div);
    }

    if (estavaNoFinal) container.scrollTop = container.scrollHeight;
}

// ---- Enviar mensagem ----

function enviarMensagemApp() {
    const input = document.getElementById('chatAppInput');
    const texto = input?.value.trim();
    if (!texto || !conversaAppAtual) return;

    const usuario = getUsuarioAppLogado();
    if (!usuario) return;

    const key = getMensagensKeyApp(conversaAppAtual._empresaId, conversaAppAtual.id);
    const mensagens = JSON.parse(localStorage.getItem(key) || '[]');

    mensagens.push({
        id: Date.now(),
        remetente: usuario.cpf,
        remetenteNome: usuario.nome,
        mensagem: texto,
        data: new Date().toISOString(),
        lida: false
    });
    localStorage.setItem(key, JSON.stringify(mensagens));

    // Atualizar última mensagem na conversa
    const storageKey = `${conversaAppAtual._empresaId}_conversas`;
    let todasConversas = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const idx = todasConversas.findIndex(c => c.id === conversaAppAtual.id);
    if (idx !== -1) {
        todasConversas[idx].ultimaMensagem = texto;
        todasConversas[idx].ultimaMensagemData = new Date().toISOString();
        // Incrementar não lidas para outros participantes (exceto o remetente)
        todasConversas[idx].naoLidas = (todasConversas[idx].naoLidas || 0) + 1;
        localStorage.setItem(storageKey, JSON.stringify(todasConversas));
    }

    input.value = '';
    carregarMensagensConversaApp(conversaAppAtual._empresaId, conversaAppAtual.id);
    renderizarListaConversasApp(carregarConversasApp());
}

function enviarRapidoApp(tipo) {
    const msgs = {
        ok: '✅ OK, confirmado!',
        atraso: '⏰ Estou com um pequeno atraso, chegarei em breve.',
        confirmado: '✅ Confirmado! Estarei presente.',
        cancelado: '❌ Infelizmente não poderei comparecer.'
    };
    const input = document.getElementById('chatAppInput');
    if (input) { input.value = msgs[tipo]; enviarMensagemApp(); }
}

// ---- Inicialização ----

function inicializarMensagensApp() {
    const usuario = getUsuarioAppLogado();
    if (!usuario) { setTimeout(inicializarMensagensApp, 1000); return; }

    adicionarBotaoChatApp();
    carregarConversasApp();
    atualizarBadgeMensagensApp();
    iniciarPollingApp();
    console.log('✅ Sistema de mensagens do app inicializado para:', usuario.nome);
}

// Expor globais
window.abrirModalMensagensApp = abrirModalMensagensApp;
window.fecharModalMensagensApp = fecharModalMensagensApp;
window.abrirConversaApp = abrirConversaApp;
window.enviarMensagemApp = enviarMensagemApp;
window.enviarRapidoApp = enviarRapidoApp;
window.inicializarMensagensApp = inicializarMensagensApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(inicializarMensagensApp, 800));
} else {
    setTimeout(inicializarMensagensApp, 800);
}
