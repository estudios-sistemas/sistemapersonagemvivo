// ==================== SISTEMA DE MENSAGENS INSTANTÂNEAS - VERSÃO 16.0 ====================

let mensagensCache = { conversas: [] };
let conversaAtual = null;
let tipoConversaAtual = null;
let pollingInterval = null;
let hashMensagensAntigo = {};
let hashInicializado = false;

// ==================== EMPRESA ====================
function getEmpresaLogada() {
    try {
        if (window.empresaLogada && window.empresaLogada.id) return window.empresaLogada;
        const empresaStr = sessionStorage.getItem('empresa_logada');
        if (empresaStr && empresaStr !== 'null' && empresaStr !== 'undefined') {
            const obj = JSON.parse(empresaStr);
            // Se for funcionário, buscar o id real da empresa via matriz_usuarios_app_autorizados
            if (obj && obj.tipo === 'funcionario' && obj.pasta) {
                const lista = JSON.parse(localStorage.getItem('matriz_usuarios_app_autorizados') || '[]');
                const emp = lista.find(u => u.pasta === obj.pasta);
                if (emp) {
                    window.empresaLogada = { id: emp.id, nome: emp.nome, pasta: obj.pasta };
                    return window.empresaLogada;
                }
                // Fallback: usar pasta como id
                window.empresaLogada = { id: obj.pasta.replace(/\s+/g,'_'), nome: obj.pasta, pasta: obj.pasta };
                return window.empresaLogada;
            }
            window.empresaLogada = obj;
            return window.empresaLogada;
        }
        const backup = localStorage.getItem('empresa_atual_backup');
        if (backup) { window.empresaLogada = JSON.parse(backup); return window.empresaLogada; }
    } catch(e) {}
    return null;
}

// ==================== USUÁRIOS ====================
function obterUsuariosApp() {
    const empresa = getEmpresaLogada();
    if (!empresa) return [];
    const map = new Map();
    const lista = JSON.parse(localStorage.getItem(`usuarios_app_${empresa.id}`) || '[]');
    lista.forEach(u => {
        const cpfLimpo = String(u.cpf || '').replace(/\D/g,'').trim();
        const id = cpfLimpo || String(u.id || '').trim();
        if (id && id !== 'undefined') map.set(id, {
            id, nome: u.nome,
            tipo: u.tipo === 'elenco' ? '\uD83C\uDFAD Elenco' : '\uD83D\uDE97 Motorista',
            categoria: 'app', cpf: cpfLimpo, login: cpfLimpo, status: 'ativo'
        });
    });
    return Array.from(map.values());
}

function obterFuncionariosSistema() {
    const empresa = getEmpresaLogada();
    if (!empresa || !empresa.pasta) return [];
    const map = new Map();
    const lista = JSON.parse(localStorage.getItem(`usuarios_sistema_${empresa.pasta}`) || '[]');
    lista.forEach(u => {
        const id = String(u.id || u.login || u.cpf || '').trim();
        if (id && id !== 'undefined') {
            const icon = u.cargo === 'administrador' ? '👑' : (u.cargo === 'gerente' ? '📊' : '👤');
            map.set(id, {
                id, nome: u.nome, tipo: `${icon} ${u.cargo || 'Funcionário'}`,
                categoria: 'funcionario', login: String(u.login || '').trim(),
                cpf: String(u.cpf || '').trim(), cargo: u.cargo, status: u.status || 'ativo'
            });
        }
    });
    return Array.from(map.values());
}

function obterTodosUsuariosComIds() {
    const map = new Map();
    obterFuncionariosSistema().forEach(f => map.set(f.id, f));
    obterUsuariosApp().forEach(a => { if (!map.has(a.id)) map.set(a.id, a); });
    return Array.from(map.values());
}

// ==================== STORAGE KEYS ====================
function getConversasStorageKey() {
    const e = getEmpresaLogada();
    return (e && e.id) ? `${e.id}_conversas` : null;
}
function getMensagensStorageKey(conversaId) {
    const e = getEmpresaLogada();
    return (e && e.id && conversaId) ? `${e.id}_mensagens_${conversaId}` : null;
}

// ==================== USUÁRIO LOGADO ====================
function getUsuarioLogado() {
    try {
        const empresa = getEmpresaLogada();
        if (!empresa) return null;

        // 1. Usuário do App
        const appStr = sessionStorage.getItem('usuario_logado_app');
        if (appStr && appStr !== 'null') {
            try {
                const u = JSON.parse(appStr);
                if (u && u.cpf) {
                    const cpfLimpo = String(u.cpf).replace(/\D/g,'');
                    return { id: cpfLimpo, nome: u.nome, cpf: cpfLimpo, login: cpfLimpo, tipo: u.tipo, categoria: 'app', status: 'ativo' };
                }
            } catch(e) {}
        }

        // 2. Funcionário interno (login.html salva tipo:'funcionario')
        const empStr = sessionStorage.getItem('empresa_logada');
        if (empStr) {
            try {
                const obj = JSON.parse(empStr);
                if (obj && obj.tipo === 'funcionario' && obj.id) {
                    const icon = obj.cargo === 'administrador' ? '👑' : (obj.cargo === 'gerente' ? '📊' : '👤');
                    return { id: obj.id, nome: obj.nome, login: obj.login, cpf: obj.cpf || '', cargo: obj.cargo, tipo: `${icon} ${obj.cargo || 'Funcionário'}`, categoria: 'funcionario', status: obj.status || 'ativo' };
                }
                // 3. Empresa (admin do sistema)
                if (obj && obj.tipo === 'empresa') return { id: 'admin', nome: obj.nome || 'Administrador', login: 'admin', tipo: 'sistema', cargo: 'administrador', status: 'ativo' };
            } catch(e) {}
        }

        // 4. Fallback via usuario_logado
        const loginSalvo = sessionStorage.getItem('usuario_logado');
        if (loginSalvo && loginSalvo !== 'null') {
            if (loginSalvo === 'admin' || loginSalvo === 'administrador') return { id: 'admin', nome: 'Administrador', login: 'admin', tipo: 'sistema', cargo: 'administrador', status: 'ativo' };
            const todos = obterTodosUsuariosComIds();
            const encontrado = todos.find(u => u.id === loginSalvo || u.login === loginSalvo || u.cpf === loginSalvo);
            if (encontrado) return encontrado;
        }

        return { id: 'admin', nome: 'Administrador', login: 'admin', tipo: 'sistema', cargo: 'administrador', status: 'ativo' };
    } catch(e) {
        return { id: 'admin', nome: 'Administrador', login: 'admin', tipo: 'sistema', cargo: 'administrador', status: 'ativo' };
    }
}

function isUsuarioAdministrador() {
    try {
        if (sessionStorage.getItem('usuario_logado_app')) return false;
        const empStr = sessionStorage.getItem('empresa_logada');
        if (empStr) {
            const obj = JSON.parse(empStr);
            if (obj.tipo === 'empresa') return true;
            if (obj.tipo === 'funcionario') return obj.cargo === 'administrador';
        }
        return false;
    } catch(e) { return false; }
}

// Retorna todos os identificadores possíveis do usuário atual (id, cpf, login) - normalizados
function getMeusIds() {
    const u = getUsuarioLogado();
    if (!u) return [];
    const ids = [...new Set([
        String(u.id || '').trim(),
        String(u.cpf || '').trim(),
        String(u.login || '').trim()
    ].filter(v => v && v !== 'undefined' && v !== 'null' && v !== ''))];
    
    // Adicionar versões normalizadas também
    const normalized = ids.map(id => normalizarId(id)).filter(id => id);
    return [...new Set([...ids, ...normalized])];
}

// ==================== CONVERSAS ====================
async function carregarConversas() {
    try {
        const empresa = getEmpresaLogada();
        if (!empresa) return [];
        const storageKey = getConversasStorageKey();
        if (!storageKey) return [];

        const meusIds = getMeusIds();
        const isAdmin = isUsuarioAdministrador();
        const todasConversas = JSON.parse(localStorage.getItem(storageKey) || '[]');

        let conversasDoUsuario = todasConversas.filter(conv => {
            if (!conv.participantes) return false;
            if (isAdmin) return true;
            const ps = conv.participantes.map(p => String(p).trim());
            return meusIds.some(meuId => ps.includes(meuId));
        });

        conversasDoUsuario.sort((a, b) => new Date(b.ultimaMensagemData || 0) - new Date(a.ultimaMensagemData || 0));
        mensagensCache.conversas = conversasDoUsuario;
        atualizarBadgeMensagens();
        return conversasDoUsuario;
    } catch(e) { return []; }
}

// ==================== STATUS DE LEITURA ====================
// Salva quais mensagens cada usuário visualizou: {[conversaId]: {[msgId]: true}}
function getReadStorageKey() {
    const u = getUsuarioLogado();
    const e = getEmpresaLogada();
    if (!u || !e) return null;
    return `${e.id}_lidas_${normalizarId(u.id)}`;
}

function marcarMensagensComoLidas(conversaId) {
    const key = getReadStorageKey();
    if (!key) return;
    const msgKey = getMensagensStorageKey(conversaId);
    if (!msgKey) return;
    const msgs = JSON.parse(localStorage.getItem(msgKey) || '[]');
    const lidas = JSON.parse(localStorage.getItem(key) || '{}');
    if (!lidas[conversaId]) lidas[conversaId] = {};
    msgs.forEach(m => { lidas[conversaId][m.id] = true; });
    localStorage.setItem(key, JSON.stringify(lidas));
}

function getMensagensLidasPorMim(conversaId) {
    const key = getReadStorageKey();
    if (!key) return {};
    const lidas = JSON.parse(localStorage.getItem(key) || '{}');
    return lidas[conversaId] || {};
}

// Verifica quantos participantes (excluindo remetente) leram determinada mensagem
function contarLeiturasMensagem(conversaId, msgId, remetentId, participantes, empresaId) {
    let count = 0;
    const remetIdNorm = normalizarId(remetentId);
    participantes.forEach(pId => {
        if (idsIguais(pId, remetIdNorm)) return;
        const pIdNorm = normalizarId(pId);
        const key = `${empresaId}_lidas_${pIdNorm}`;
        const lidas = JSON.parse(localStorage.getItem(key) || '{}');
        if (lidas[conversaId] && lidas[conversaId][msgId]) count++;
    });
    return count;
}

// Renderiza o ícone de status da mensagem
function renderStatusMsg(conversaId, msg, participantes, remetenteId, empresaId) {
    const outrosParticipantes = participantes.filter(p => String(p).trim() !== String(remetenteId).trim());
    const totalOutros = outrosParticipantes.length;
    if (totalOutros === 0) return '';
    const lidos = contarLeiturasMensagem(conversaId, msg.id, remetenteId, participantes, empresaId);
    // ✓✓ azul = todos visualizaram | ✓✓ cinza = pelo menos um leu | ✓ = enviado/entregue
    if (lidos >= totalOutros) return '<span style="color:#4fc3f7;font-size:11px;margin-left:3px;" title="Visualizado por todos">✓✓</span>';
    if (lidos > 0)            return '<span style="color:#90caf9;font-size:11px;margin-left:3px;" title="Parcialmente lido">✓✓</span>';
    return '<span style="color:#bbb;font-size:11px;margin-left:3px;" title="Enviado">✓</span>';
}

// ==================== CARREGAR MENSAGENS ====================
async function carregarMensagensConversa(conversaId) {
    const empresa = getEmpresaLogada();
    if (!empresa) return;
    const msgKey = getMensagensStorageKey(conversaId);
    if (!msgKey) return;
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;

    const mensagens = JSON.parse(localStorage.getItem(msgKey) || '[]');
    const usuarioAtual = getUsuarioLogado();
    const meusIds = getMeusIds();

    // Buscar participantes da conversa
    const storageKey = getConversasStorageKey();
    const todasConversas = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const conversa = todasConversas.find(c => c.id === conversaId);
    const participantes = conversa ? conversa.participantes : [];

    // Marcar como lidas ANTES de renderizar
    marcarMensagensComoLidas(conversaId);

    if (mensagens.length === 0) {
        messagesDiv.innerHTML = '<div style="text-align:center;padding:2rem;color:#6c757d;">💬 Nenhuma mensagem ainda.</div>';
        return;
    }

    const estavaNoFinal = messagesDiv.scrollHeight - messagesDiv.scrollTop <= messagesDiv.clientHeight + 40;
    messagesDiv.innerHTML = '';

    for (const msg of mensagens) {
        const isMinha = meusIds.some(mid =>
            idsIguais(String(msg.remetente).trim(), mid)
        );
        const isSistema = msg.remetente === 'sistema';
        const estiloRapida = obterEstiloMensagemRapida(msg.mensagem);
        const div = document.createElement('div');

        if (isSistema) {
            div.style.cssText = 'display:flex;justify-content:center;margin-bottom:0.5rem;';
            div.innerHTML = `<div style="background:#f0f0f0;color:#888;padding:4px 12px;border-radius:20px;font-size:11px;"><i>${escapeHtml(msg.mensagem)}</i></div>`;

        } else if (isMinha) {
            // QUEM ENVIOU: sempre lado direito
            const statusIcon = renderStatusMsg(conversaId, msg, participantes, usuarioAtual.id, empresa.id);
            const corFundo = estiloRapida.isRapida ? estiloRapida.corFundo : '#007bff';
            const corTexto = estiloRapida.isRapida ? estiloRapida.corTexto : 'white';
            div.style.cssText = 'display:flex;justify-content:flex-end;margin-bottom:0.5rem;';
            div.innerHTML = `
                <div style="max-width:70%;">
                    <div style="background:${corFundo};color:${corTexto};padding:8px 12px;border-radius:12px 12px 2px 12px;border:${estiloRapida.isRapida ? `2px solid ${estiloRapida.corTexto}` : 'none'};font-weight:${estiloRapida.isRapida ? '600' : '400'};">
                        <div>${escapeHtml(msg.mensagem)}</div>
                        <div style="font-size:10px;text-align:right;margin-top:4px;opacity:0.85;display:flex;align-items:center;justify-content:flex-end;gap:2px;">
                            ${formatarHorario(msg.data)}${statusIcon}
                        </div>
                    </div>
                </div>`;

        } else {
            // QUEM RECEBEU: sempre lado esquerdo
            const statusIcon = renderStatusMsg(conversaId, msg, participantes, msg.remetente, empresa.id);
            const corFundo = estiloRapida.isRapida ? estiloRapida.corFundo : 'white';
            const corTexto = estiloRapida.isRapida ? estiloRapida.corTexto : '#222';
            const bordaStyle = estiloRapida.isRapida ? `2px solid ${estiloRapida.corTexto}` : '1px solid #e0e0e0';
            div.style.cssText = 'display:flex;justify-content:flex-start;margin-bottom:0.5rem;';
            div.innerHTML = `
                <div style="max-width:70%;">
                    <div style="font-size:11px;font-weight:bold;color:#555;margin-bottom:2px;">${escapeHtml(msg.remetenteNome || msg.remetente)}</div>
                    <div style="background:${corFundo};color:${corTexto};padding:8px 12px;border-radius:12px 12px 12px 2px;border:${bordaStyle};font-weight:${estiloRapida.isRapida ? '600' : '400'};">
                        <div>${escapeHtml(msg.mensagem)}</div>
                        <div style="font-size:10px;text-align:right;margin-top:4px;color:${estiloRapida.isRapida ? estiloRapida.corTexto : '#999'};display:flex;align-items:center;justify-content:flex-end;gap:2px;">
                            ${formatarHorario(msg.data)}${statusIcon}
                        </div>
                    </div>
                </div>`;
        }
        messagesDiv.appendChild(div);
    }

    if (estavaNoFinal) messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ==================== ENVIAR MENSAGEM ====================
async function enviarMensagem() {
    const input = document.getElementById('chatMessageInput');
    const texto = input?.value.trim();
    if (!texto || !conversaAtual) return;

    const empresa = getEmpresaLogada();
    if (!empresa) return;
    const usuarioAtual = getUsuarioLogado();
    const msgKey = getMensagensStorageKey(conversaAtual);
    if (!msgKey) return;

    const novaMensagem = {
        id: Date.now(),
        remetente: usuarioAtual.id,
        remetenteNome: usuarioAtual.nome,
        mensagem: texto,
        data: new Date().toISOString()
    };

    const mensagens = JSON.parse(localStorage.getItem(msgKey) || '[]');
    mensagens.push(novaMensagem);
    localStorage.setItem(msgKey, JSON.stringify(mensagens));

    // Atualizar conversa + incrementar naoLidas para OUTROS participantes (app e sistema)
    const storageKey = getConversasStorageKey();
    if (storageKey) {
        const todasConversas = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const idx = todasConversas.findIndex(c => c.id === conversaAtual);
        if (idx !== -1) {
            todasConversas[idx].ultimaMensagem = texto;
            todasConversas[idx].ultimaMensagemData = new Date().toISOString();
            // Incrementar naoLidas por participante (chave separada por usuário) - para TODOS os participantes
            const participantes = todasConversas[idx].participantes || [];
            const usuarioAtualIdNorm = normalizarId(usuarioAtual.id);
            participantes.forEach(pId => {
                if (idsIguais(pId, usuarioAtualIdNorm)) return;
                const pIdNorm = normalizarId(pId);
                const naoLidasKey = `${empresa.id}_naoLidas_${pIdNorm}`;
                const naoLidas = JSON.parse(localStorage.getItem(naoLidasKey) || '{}');
                naoLidas[conversaAtual] = (naoLidas[conversaAtual] || 0) + 1;
                localStorage.setItem(naoLidasKey, JSON.stringify(naoLidas));
            });
            localStorage.setItem(storageKey, JSON.stringify(todasConversas));
        }
    }

    // Marcar como lida por mim imediatamente
    marcarMensagensComoLidas(conversaAtual);

    input.value = '';
    await carregarMensagensConversa(conversaAtual);
    await carregarConversasNoModal();
}

// Obter naoLidas do usuário atual (soma de todos os seus ids possíveis)
function getNaoLidasDoUsuario() {
    const e = getEmpresaLogada();
    if (!e) return {};
    const resultado = {};
    getMeusIds().forEach(uid => {
        const key = `${e.id}_naoLidas_${uid}`;
        const nl = JSON.parse(localStorage.getItem(key) || '{}');
        Object.entries(nl).forEach(([convId, qtd]) => {
            resultado[convId] = Math.max(resultado[convId] || 0, qtd);
        });
    });
    return resultado;
}

// Zerar contador de naoLidas desta conversa para o usuário atual
function zerarNaoLidasConversa(conversaId) {
    const u = getUsuarioLogado();
    const e = getEmpresaLogada();
    if (!u || !e) return;
    // Zerar por todos os ids possíveis do usuário
    getMeusIds().forEach(uid => {
        const key = `${e.id}_naoLidas_${uid}`;
        const nl = JSON.parse(localStorage.getItem(key) || '{}');
        if (nl[conversaId]) {
            delete nl[conversaId];
            localStorage.setItem(key, JSON.stringify(nl));
        }
    });
}

// ==================== EXCLUIR CONVERSA ====================
async function excluirConversa(conversaId, e) {
    if (e) e.stopPropagation();
    if (!confirm('🗑️ Excluir esta conversa? Todas as mensagens serão apagadas.')) return;
    const storageKey = getConversasStorageKey();
    const empresa = getEmpresaLogada();
    if (!storageKey || !empresa) return;
    let todas = JSON.parse(localStorage.getItem(storageKey) || '[]');
    todas = todas.filter(c => c.id !== conversaId);
    localStorage.setItem(storageKey, JSON.stringify(todas));
    localStorage.removeItem(getMensagensStorageKey(conversaId));
    if (conversaAtual === conversaId) {
        conversaAtual = null;
        const chatPlaceholder = document.getElementById('chatPlaceholder');
        const chatActive = document.getElementById('chatActive');
        if (chatPlaceholder) chatPlaceholder.style.display = 'flex';
        if (chatActive) chatActive.style.display = 'none';
    }
    await carregarConversasNoModal();
}

// ==================== PAINEL DE PARTICIPANTES ====================
function abrirPainelParticipantes() {
    const empresa = getEmpresaLogada();
    if (!empresa || !conversaAtual) return;
    const storageKey = getConversasStorageKey();
    const todas = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const conversa = todas.find(c => c.id === conversaAtual);
    if (!conversa) return;

    document.getElementById('modalParticipantes')?.remove();

    const isAdmin = isUsuarioAdministrador();
    const todosUsuarios = obterTodosUsuariosComIds();
    const participantesAtuais = conversa.participantes || [];

    const listaParticipantes = participantesAtuais.map(pId => {
        const u = todosUsuarios.find(x => x.id === pId || x.cpf === pId) || { id: pId, nome: pId };
        const btnRemover = isAdmin ? `<button onclick="removerParticipanteConversa('${conversa.id}','${pId}')" style="background:#dc3545;color:white;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:12px;">✖</button>` : '';
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem;border-bottom:1px solid #eee;">
            <span>👤 <strong>${escapeHtml(u.nome || pId)}</strong><span style="font-size:11px;color:#888;margin-left:6px;">${escapeHtml(u.tipo||'')}</span></span>
            ${btnRemover}
        </div>`;
    }).join('');

    const naoParticipam = todosUsuarios.filter(u => !participantesAtuais.includes(u.id) && !participantesAtuais.includes(u.cpf));
    const listaAdicionar = !isAdmin ? '' : (naoParticipam.length === 0 ? '<div style="color:#999;text-align:center;padding:0.5rem;">Todos os usuários já participam</div>' :
        naoParticipam.map(u => `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem;border-bottom:1px solid #eee;">
            <span>👤 <strong>${escapeHtml(u.nome)}</strong><span style="font-size:11px;color:#888;margin-left:6px;">${escapeHtml(u.tipo||'')}</span></span>
            <button onclick="adicionarParticipanteConversa('${conversa.id}','${u.id}','${escapeHtml(u.nome)}')" style="background:#28a745;color:white;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:12px;">➕</button>
        </div>`).join(''));

    const secaoAdicionar = isAdmin ? `
        <div style="margin-top:1rem;">
            <h4 style="margin:0 0 0.5rem 0;color:#28a745;">➕ Adicionar participante</h4>
            <div style="max-height:150px;overflow-y:auto;border:1px solid #dee2e6;border-radius:8px;">${listaAdicionar}</div>
        </div>` : '';

    const html = `<div id="modalParticipantes" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000002;display:flex;align-items:center;justify-content:center;" onclick="if(event.target.id==='modalParticipantes')document.getElementById('modalParticipantes').remove()">
        <div style="background:white;border-radius:12px;max-width:480px;width:90%;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
            <div style="padding:1rem 1.5rem;background:#007bff;color:white;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;">👥 Participantes — ${escapeHtml(conversa.nome)}</h3>
                <button onclick="document.getElementById('modalParticipantes').remove()" style="background:rgba(255,255,255,0.2);color:white;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;">✖</button>
            </div>
            <div style="padding:1rem 1.5rem;">
                <h4 style="margin:0 0 0.5rem 0;">Participantes atuais (${participantesAtuais.length})</h4>
                <div style="max-height:200px;overflow-y:auto;border:1px solid #dee2e6;border-radius:8px;">${listaParticipantes || '<div style="padding:0.5rem;color:#999;">Nenhum</div>'}</div>
                ${secaoAdicionar}
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

async function removerParticipanteConversa(conversaId, participanteId) {
    const storageKey = getConversasStorageKey();
    if (!storageKey) return;
    const todas = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const idx = todas.findIndex(c => c.id === conversaId);
    if (idx === -1) return;
    todas[idx].participantes = todas[idx].participantes.filter(p => p !== participanteId);
    if (todas[idx].participantesInfo) todas[idx].participantesInfo = todas[idx].participantesInfo.filter(p => p.id !== participanteId);
    localStorage.setItem(storageKey, JSON.stringify(todas));
    document.getElementById('modalParticipantes')?.remove();
    abrirPainelParticipantes();
    await carregarConversasNoModal();
}

async function adicionarParticipanteConversa(conversaId, participanteId, participanteNome) {
    const storageKey = getConversasStorageKey();
    const empresa = getEmpresaLogada();
    if (!storageKey || !empresa) return;
    const todas = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const idx = todas.findIndex(c => c.id === conversaId);
    if (idx === -1) return;
    if (!todas[idx].participantes.includes(participanteId)) {
        todas[idx].participantes.push(participanteId);
        if (!todas[idx].participantesInfo) todas[idx].participantesInfo = [];
        todas[idx].participantesInfo.push({ id: participanteId, nome: participanteNome });
        // Notificar novo participante
        const naoLidasKey = `${empresa.id}_naoLidas_${participanteId}`;
        const nl = JSON.parse(localStorage.getItem(naoLidasKey) || '{}');
        nl[conversaId] = (nl[conversaId] || 0) + 1;
        localStorage.setItem(naoLidasKey, JSON.stringify(nl));
    }
    localStorage.setItem(storageKey, JSON.stringify(todas));
    document.getElementById('modalParticipantes')?.remove();
    abrirPainelParticipantes();
    await carregarConversasNoModal();
}

// ==================== ABRIR CONVERSA ====================
async function abrirConversaModal(conversaId) {
    const conversas = await carregarConversas();
    const conversa = conversas.find(c => c.id === conversaId);
    if (!conversa) return;

    conversaAtual = conversaId;
    tipoConversaAtual = conversa.tipo;

    const chatNome = document.getElementById('chatNomeDestinatario');
    const chatAvatar = document.getElementById('chatAvatar');
    const chatPlaceholder = document.getElementById('chatPlaceholder');
    const chatActive = document.getElementById('chatActive');
    const isAdmin = isUsuarioAdministrador();

    if (chatNome) chatNome.innerText = conversa.nome;
    if (chatAvatar) chatAvatar.innerHTML = conversa.avatar || (conversa.tipo === 'grupo' ? '👥' : '👤');
    if (chatPlaceholder) chatPlaceholder.style.display = 'none';
    if (chatActive) chatActive.style.display = 'flex';

    // Botão participantes no header (apenas admin)
    const btnPart = document.getElementById('btnVerParticipantes');
    if (btnPart) btnPart.style.display = isAdmin ? 'inline-flex' : 'none';

    // Zerar naoLidas desta conversa para mim
    zerarNaoLidasConversa(conversaId);
    marcarMensagensComoLidas(conversaId);

    await carregarMensagensConversa(conversaId);
    atualizarBadgeMensagens();
    atualizarListaLateral(conversas);
}

// ==================== MODAL DE MENSAGENS ====================
function abrirModalMensagens() {
    let modal = document.getElementById('chatModal');
    if (modal) { modal.style.display = 'flex'; carregarConversasNoModal(); return; }

    const isAdmin = isUsuarioAdministrador();
    modal = document.createElement('div');
    modal.id = 'chatModal';
    modal.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100%!important;height:100%!important;background:rgba(0,0,0,0.5)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:1000000!important;';

    const botaoNova = isAdmin ? '<button id="novaConversaBtn" style="background:white;color:#007bff;border:none;padding:6px 12px;border-radius:20px;cursor:pointer;font-weight:bold;">➕ Nova</button>' : '';

    modal.innerHTML = `
        <div style="width:1200px;max-width:95%;height:85vh;background:white;border-radius:12px;display:flex;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.2);">
            <div style="width:320px;background:#f8f9fa;border-right:1px solid #dee2e6;display:flex;flex-direction:column;">
                <div style="padding:1rem;background:#007bff;color:white;">
                    <h3 style="margin:0;">💬 Mensagens</h3>
                    <div style="margin-top:0.5rem;display:flex;gap:0.5rem;">
                        <input type="text" id="buscarConversa" placeholder="Buscar..." style="flex:1;padding:6px;border-radius:20px;border:none;">
                        ${botaoNova}
                    </div>
                </div>
                <div id="listaConversas" style="flex:1;overflow-y:auto;padding:0.5rem;"></div>
                <div style="padding:0.75rem;border-top:1px solid #dee2e6;background:white;display:flex;align-items:center;gap:0.5rem;">
                    <div style="width:10px;height:10px;border-radius:50%;background:#28a745;"></div>
                    <span style="font-size:12px;">Online</span>
                    <span style="flex:1;"></span>
                    <button onclick="fecharModalChat()" style="background:#dc3545;color:white;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;">Fechar</button>
                </div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;background:#e9ecef;">
                <div id="chatPlaceholder" style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#6c757d;">
                    <div style="font-size:48px;margin-bottom:1rem;">💬</div>
                    <p>Selecione uma conversa para começar</p>
                </div>
                <div id="chatActive" style="display:none;flex-direction:column;height:100%;">
                    <div style="padding:0.75rem 1rem;background:white;border-bottom:1px solid #dee2e6;">
                        <div style="display:flex;align-items:center;gap:0.75rem;">
                            <div id="chatAvatar" style="width:40px;height:40px;border-radius:50%;background:#007bff;display:flex;align-items:center;justify-content:center;color:white;">👤</div>
                            <strong id="chatNomeDestinatario" style="flex:1;">Nome</strong>
                            <button id="btnVerParticipantes" onclick="abrirPainelParticipantes()" style="display:none;background:#17a2b8;color:white;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:12px;">👥 Participantes</button>
                        </div>
                    </div>
                    <div id="chatMessages" style="flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.5rem;"></div>
                    <div style="padding:1rem;background:white;border-top:1px solid #dee2e6;">
                        <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;">
                            <button onclick="enviarMensagemRapida('ok')" style="background:#28a745;color:white;border:none;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;">👍 OK</button>
                            <button onclick="enviarMensagemRapida('atraso')" style="background:#ffc107;color:#333;border:none;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;">⏰ Atraso</button>
                            <button onclick="enviarMensagemRapida('cancelado')" style="background:#dc3545;color:white;border:none;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;">❌ Cancelado</button>
                            <button onclick="enviarMensagemRapida('confirmado')" style="background:#17a2b8;color:white;border:none;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;">✅ Confirmado</button>
                        </div>
                        <div style="display:flex;gap:0.5rem;">
                            <textarea id="chatMessageInput" placeholder="Digite sua mensagem..." rows="2" style="flex:1;padding:0.5rem;border-radius:8px;border:1px solid #ddd;resize:none;"></textarea>
                            <button onclick="enviarMensagem()" style="background:#007bff;color:white;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.appendChild(modal);
    carregarConversasNoModal();

    document.getElementById('buscarConversa')?.addEventListener('input', filtrarConversasModal);
    if (isAdmin) {
        const btn = document.getElementById('novaConversaBtn');
        if (btn) btn.onclick = e => { e.stopPropagation(); abrirModalNovaConversa(); };
    }
    document.getElementById('chatMessageInput')?.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensagem(); }
    });
}

function fecharModalChat() {
    const modal = document.getElementById('chatModal');
    if (modal) modal.style.display = 'none';
}

// ==================== LISTA LATERAL ====================
async function carregarConversasNoModal() {
    const conversas = await carregarConversas();
    atualizarListaLateral(conversas);
}

function atualizarListaLateral(conversas) {
    const listaDiv = document.getElementById('listaConversas');
    if (!listaDiv) return;

    const isAdmin = isUsuarioAdministrador();
    const naoLidas = getNaoLidasDoUsuario();
    const termo = (document.getElementById('buscarConversa')?.value || '').toLowerCase();
    let html = '';

    for (const conv of conversas) {
        if (termo && !conv.nome.toLowerCase().includes(termo)) continue;
        const ativo = conv.id === conversaAtual ? 'background:#dce9f9;' : '';
        const qtd = naoLidas[conv.id] || 0;
        const badge = qtd > 0 ? `<div style="background:#dc3545;color:white;border-radius:50%;min-width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;padding:0 4px;">${qtd}</div>` : '';
        const btnExcluir = isAdmin ? `<button onclick="excluirConversa('${conv.id}',event)" title="Excluir conversa" style="background:#dc3545;color:white;border:none;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button>` : '';
        html += `
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:4px;">
                <div onclick="abrirConversaModal('${conv.id}')" style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;border-radius:8px;cursor:pointer;flex:1;min-width:0;${ativo}" class="item-conversa-lista">
                    <div style="width:42px;height:42px;border-radius:50%;background:#007bff;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;flex-shrink:0;">${conv.avatar || '👥'}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;"><strong style="font-size:13px;">${escapeHtml(conv.nome)}</strong><span style="font-size:10px;color:#6c757d;">${formatarHoraRelativa(conv.ultimaMensagemData)}</span></div>
                        <div style="font-size:12px;color:#6c757d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(conv.ultimaMensagem || '')}</div>
                    </div>
                    ${badge}
                </div>
                ${btnExcluir}
            </div>`;
    }

    listaDiv.innerHTML = html || '<div style="text-align:center;padding:2rem;color:#6c757d;">Nenhuma conversa</div>';
}

function filtrarConversasModal() {
    carregarConversasNoModal();
}

// ==================== POLLING ====================
function iniciarPollingMensagens() {
    if (pollingInterval) clearInterval(pollingInterval);
    // Expor globalmente para permitir parada externa (ex: ao trocar usuário do app)
    window._pollingMensagensInterval = pollingInterval;

    pollingInterval = setInterval(async () => {
        const empresa = getEmpresaLogada();
        if (!empresa) return;

        const conversas = await carregarConversas();
        const usuarioAtual = getUsuarioLogado();
        const chatModal = document.getElementById('chatModal');
        const modalAberto = chatModal && chatModal.style.display === 'flex';

        for (const conv of conversas) {
            const msgKey = getMensagensStorageKey(conv.id);
            if (!msgKey) continue;
            const msgs = JSON.parse(localStorage.getItem(msgKey) || '[]');
            const total = msgs.length;

            if (!hashInicializado) {
                // Na primeira rodada só registra o estado atual, não notifica
                hashMensagensAntigo[conv.id] = total;
                continue;
            }

            const anterior = hashMensagensAntigo[conv.id] ?? total;

            if (total > anterior) {
                const novas = msgs.slice(anterior);
                novas.forEach(msg => {
                    const rem = String(msg.remetente).trim();
                    const ehMinha = getMeusIds().some(mid => idsIguais(rem, mid));
                    if (!ehMinha) {
                        // Mostrar notificação visual se modal fechado ou em outra conversa
                        if (!modalAberto || conv.id !== conversaAtual) {
                            mostrarNotificacaoMensagem(conv.nome, msg.mensagem, msg.remetenteNome);
                        }
                    }
                });
            }
            hashMensagensAntigo[conv.id] = total;
        }

        if (!hashInicializado) hashInicializado = true;

        // Atualizar UI se modal estiver aberto
        if (modalAberto) {
            if (conversaAtual) await carregarMensagensConversa(conversaAtual);
            atualizarListaLateral(conversas);
        }

        atualizarBadgeMensagens();
    }, 2500);
    // Manter referência global sincronizada
    window._pollingMensagensInterval = pollingInterval;
}

// ==================== NOTIFICAÇÃO VISUAL ====================
function mostrarNotificacaoMensagem(conversaNome, mensagem, remetente) {
    try {
        document.getElementById('notif-container-instan')?.remove();
        const n = document.createElement('div');
        n.id = 'notif-container-instan';
        n.style.cssText = 'position:fixed;bottom:100px;right:20px;width:300px;background:white;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);padding:12px 15px;z-index:999998;cursor:pointer;border-left:4px solid #007bff;';
        n.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:40px;height:40px;background:#007bff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;">💬</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:bold;font-size:13px;">${escapeHtml(remetente || 'Nova mensagem')}</div>
                    <div style="font-size:11px;color:#888;">${escapeHtml(conversaNome)}</div>
                    <div style="font-size:13px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(mensagem.substring(0, 80))}</div>
                </div>
                <div class="fecharNotif" style="color:#aaa;font-size:20px;line-height:1;">&times;</div>
            </div>`;
        n.onclick = e => {
            if (e.target.classList.contains('fecharNotif')) { n.remove(); return; }
            n.remove();
            abrirModalMensagens();
        };
        document.body.appendChild(n);
        setTimeout(() => n.parentNode && n.remove(), 6000);
    } catch(e) {}
}

// ==================== BADGE ====================
function atualizarBadgeMensagens() {
    const naoLidas = getNaoLidasDoUsuario();
    const total = Object.values(naoLidas).reduce((s, v) => s + (v || 0), 0);
    const badge = document.getElementById('chatBadge');
    if (badge) {
        badge.style.display = total > 0 ? 'flex' : 'none';
        badge.textContent = total > 99 ? '99+' : String(total);
    }
}

// ==================== BOTÃO FLUTUANTE ====================
function adicionarBotaoChatGlobal() {
    if (document.getElementById('chatFloatBtn')) return;
    const btn = document.createElement('div');
    btn.id = 'chatFloatBtn';
    btn.innerHTML = '💬';
    btn.title = 'Mensagens';
    btn.style.cssText = 'position:fixed!important;bottom:20px!important;right:20px!important;width:60px!important;height:60px!important;background:linear-gradient(135deg,#007bff,#0056b3)!important;color:white!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:28px!important;cursor:pointer!important;box-shadow:0 4px 15px rgba(0,0,0,0.3)!important;z-index:999999!important;transition:transform 0.2s!important;';
    const badge = document.createElement('span');
    badge.id = 'chatBadge';
    badge.style.cssText = 'position:absolute!important;top:-5px!important;right:-5px!important;background:#dc3545!important;color:white!important;border-radius:50%!important;min-width:22px!important;height:22px!important;font-size:12px!important;display:none!important;align-items:center!important;justify-content:center!important;font-weight:bold!important;padding:0 3px!important;';
    btn.appendChild(badge);
    btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    btn.onclick = abrirModalMensagens;
    document.body.appendChild(btn);
}

// ==================== NOVA CONVERSA ====================
const GRUPOS_PREDEFINIDOS = [
    { nome: 'Geral', emoji: '🏠' },
    { nome: 'Comercial', emoji: '💼' },
    { nome: 'Financeiro', emoji: '💰' },
    { nome: 'Manutenção', emoji: '🔧' },
    { nome: 'Perucas & Make', emoji: '💇' },
    { nome: 'Drivers', emoji: '🚗' },
    { nome: 'Elenco', emoji: '🎭' },
];

function abrirModalNovaConversa() {
    document.getElementById('modalNovaConversa')?.remove();
    const usuariosApp = obterUsuariosApp();
    const funcionarios = obterFuncionariosSistema();
    const eu = getUsuarioLogado();

    const mkUserRow = (u, detalhe) => `
        <label style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.6rem;border-radius:6px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='#f0f4ff'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" value="${u.id}" data-nome="${escapeHtml(u.nome)}" data-tipo="${escapeHtml(u.tipo||'')}" class="participante-checkbox" style="width:16px;height:16px;cursor:pointer;accent-color:#007bff;">
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(u.nome)}</div>
                <div style="font-size:11px;color:#888;">${escapeHtml(detalhe)}</div>
            </div>
        </label>`;

    const listaApp = usuariosApp.filter(u => u.id !== eu.id && u.cpf !== eu.cpf).length === 0
        ? '<div style="padding:1rem;text-align:center;color:#999;">Nenhum usuário cadastrado no App</div>'
        : usuariosApp.filter(u => u.id !== eu.id && u.cpf !== eu.cpf)
            .map(u => mkUserRow(u, `${u.tipo} • CPF: ${u.cpf}`)).join('');

    const listaFuncs = funcionarios.filter(u => u.id !== eu.id).length === 0
        ? '<div style="padding:1rem;text-align:center;color:#999;">Nenhum funcionário cadastrado</div>'
        : funcionarios.filter(u => u.id !== eu.id)
            .map(u => mkUserRow(u, `${u.tipo} • Login: ${u.login}`)).join('');

    const gruposBtns = GRUPOS_PREDEFINIDOS.map(g =>
        `<button type="button" onclick="_selecionarGrupoPredefinido('${escapeHtml(g.nome)}')" id="gpBtn_${g.nome.replace(/\s/g,'_')}" style="padding:6px 12px;border:2px solid #dee2e6;border-radius:20px;background:white;cursor:pointer;font-size:13px;transition:all 0.15s;">${g.emoji} ${g.nome}</button>`
    ).join('');

    const html = `
    <div id="modalNovaConversa" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);z-index:1000001;display:flex;align-items:center;justify-content:center;" onclick="if(event.target.id==='modalNovaConversa')fecharModalNovaConversa()">
        <div style="background:white;border-radius:14px;width:660px;max-width:95%;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">

            <!-- Header -->
            <div style="padding:1rem 1.5rem;background:#007bff;color:white;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                <h3 style="margin:0;">➕ Nova Conversa</h3>
                <button onclick="fecharModalNovaConversa()" style="background:rgba(255,255,255,0.2);color:white;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;">✖</button>
            </div>

            <div style="overflow-y:auto;padding:1.25rem 1.5rem;display:flex;flex-direction:column;gap:1rem;">

                <!-- TIPO -->
                <div>
                    <label style="font-weight:600;display:block;margin-bottom:0.4rem;">Tipo de conversa</label>
                    <div style="display:flex;gap:0.5rem;">
                        <button type="button" id="btnTipoGrupo" onclick="_ncTrocarTipo('grupo')" style="flex:1;padding:8px;border:2px solid #007bff;border-radius:8px;background:#007bff;color:white;cursor:pointer;font-weight:600;">👥 Grupo</button>
                        <button type="button" id="btnTipoIndividual" onclick="_ncTrocarTipo('individual')" style="flex:1;padding:8px;border:2px solid #dee2e6;border-radius:8px;background:white;color:#333;cursor:pointer;font-weight:600;">👤 Individual</button>
                    </div>
                    <input type="hidden" id="novaConversaTipo" value="grupo">
                </div>

                <!-- NOME DO GRUPO (só aparece quando grupo) -->
                <div id="secaoNomeGrupo">
                    <label style="font-weight:600;display:block;margin-bottom:0.4rem;">Nome do Grupo</label>
                    <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.6rem;">${gruposBtns}
                        <button type="button" onclick="_selecionarGrupoPredefinido('_novo')" id="gpBtn__novo" style="padding:6px 12px;border:2px solid #dee2e6;border-radius:20px;background:white;cursor:pointer;font-size:13px;">✏️ Criar novo</button>
                    </div>
                    <input type="text" id="novaConversaNome" placeholder="Digite o nome do grupo..." style="width:100%;padding:0.6rem;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
                </div>

                <!-- PARTICIPANTES - ABAS EXPANSÍVEIS -->
                <div style="display:flex;flex-direction:column;gap:0.75rem;">

                    <!-- Aba App -->
                    <div style="border:1px solid #dee2e6;border-radius:8px;overflow:hidden;">
                        <button type="button" onclick="_ncAlternarAba('app')" id="abaHeader_app" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;background:#f8f9fa;border:none;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s;">
                            <span style="display:flex;align-items:center;gap:0.5rem;flex:1;">
                                <span id="abaArrow_app" style="display:inline-block;transition:transform 0.2s;">▼</span>
                                📱 Usuários App
                            </span>
                            <button type="button" onclick="event.stopPropagation(); _ncSelecionarTodos('app')" style="font-size:11px;border:none;background:#e8f4fd;color:#007bff;padding:2px 8px;border-radius:10px;cursor:pointer;">Todos</button>
                        </button>
                        <div id="abaConteudo_app" style="max-height:250px;overflow-y:auto;padding:0.25rem;border-top:1px solid #dee2e6;">
                            ${listaApp}
                        </div>
                    </div>

                    <!-- Aba Sistema -->
                    <div style="border:1px solid #dee2e6;border-radius:8px;overflow:hidden;">
                        <button type="button" onclick="_ncAlternarAba('sistema')" id="abaHeader_sistema" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;background:#f8f9fa;border:none;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s;">
                            <span style="display:flex;align-items:center;gap:0.5rem;flex:1;">
                                <span id="abaArrow_sistema" style="display:inline-block;transition:transform 0.2s;">▼</span>
                                🖥️ Sistema
                            </span>
                            <button type="button" onclick="event.stopPropagation(); _ncSelecionarTodos('sistema')" style="font-size:11px;border:none;background:#e8f4fd;color:#007bff;padding:2px 8px;border-radius:10px;cursor:pointer;">Todos</button>
                        </button>
                        <div id="abaConteudo_sistema" style="max-height:250px;overflow-y:auto;padding:0.25rem;border-top:1px solid #dee2e6;">
                            ${listaFuncs}
                        </div>
                    </div>
                </div>

                <!-- Rótulos selecionados -->
                <div id="listaParticipantesSelecionados" style="min-height:32px;padding:0.5rem;background:#f0f4ff;border-radius:8px;font-size:12px;color:#999;">Nenhum participante selecionado</div>

                <!-- Botão criar -->
                <button onclick="criarNovaConversa()" style="width:100%;padding:0.75rem;background:#28a745;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:15px;">➕ Criar Conversa</button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    document.querySelectorAll('.participante-checkbox').forEach(cb => cb.addEventListener('change', atualizarListaParticipantesSelecionados));
}

function _ncTrocarTipo(tipo) {
    document.getElementById('novaConversaTipo').value = tipo;
    const isGrupo = tipo === 'grupo';
    document.getElementById('btnTipoGrupo').style.cssText    = `flex:1;padding:8px;border:2px solid ${isGrupo?'#007bff':'#dee2e6'};border-radius:8px;background:${isGrupo?'#007bff':'white'};color:${isGrupo?'white':'#333'};cursor:pointer;font-weight:600;`;
    document.getElementById('btnTipoIndividual').style.cssText = `flex:1;padding:8px;border:2px solid ${!isGrupo?'#007bff':'#dee2e6'};border-radius:8px;background:${!isGrupo?'#007bff':'white'};color:${!isGrupo?'white':'#333'};cursor:pointer;font-weight:600;`;
    document.getElementById('secaoNomeGrupo').style.display = isGrupo ? 'block' : 'none';
    if (!isGrupo) document.getElementById('novaConversaNome').value = '';
}

function _selecionarGrupoPredefinido(nome) {
    // Resetar estilo de todos os botões
    document.querySelectorAll('[id^="gpBtn_"]').forEach(b => {
        b.style.borderColor = '#dee2e6'; b.style.background = 'white'; b.style.color = '#333';
    });
    const btnId = 'gpBtn_' + nome.replace(/\s/g,'_');
    const btn = document.getElementById(btnId);
    if (btn) { btn.style.borderColor = '#007bff'; btn.style.background = '#007bff'; btn.style.color = 'white'; }
    const input = document.getElementById('novaConversaNome');
    if (nome === '_novo') {
        input.value = ''; input.focus();
    } else {
        input.value = nome;
    }
}

function _ncAlternarAba(aba) {
    const conteudo = document.getElementById(`abaConteudo_${aba}`);
    const arrow = document.getElementById(`abaArrow_${aba}`);
    const header = document.getElementById(`abaHeader_${aba}`);
    
    const estaAberto = conteudo.style.display !== 'none' && conteudo.style.maxHeight !== '0px';
    
    if (estaAberto) {
        // Contrair
        conteudo.style.opacity = '0';
        conteudo.style.maxHeight = '0px';
        conteudo.style.overflow = 'hidden';
        conteudo.style.transition = 'opacity 0.2s, max-height 0.2s';
        arrow.style.transform = 'rotate(-90deg)';
        header.style.background = '#f8f9fa';
        setTimeout(() => { conteudo.style.display = 'none'; }, 200);
    } else {
        // Expandir
        conteudo.style.display = 'block';
        conteudo.style.maxHeight = '250px';
        conteudo.style.opacity = '1';
        conteudo.style.transition = 'opacity 0.2s, max-height 0.2s';
        arrow.style.transform = 'rotate(0deg)';
        header.style.background = '#e8f4ff';
    }
}

function _ncSelecionarTodos(coluna) {
    const checks = document.querySelectorAll('.participante-checkbox');
    // Determinar quais checkboxes pertencem à coluna
    // App: data-tipo contém Elenco ou Motorista; Sistema: resto
    checks.forEach(cb => {
        const tipo = (cb.getAttribute('data-tipo') || '').toLowerCase();
        const isApp = tipo.includes('elenco') || tipo.includes('motorista');
        if ((coluna === 'app' && isApp) || (coluna === 'sistema' && !isApp)) {
            cb.checked = true;
        }
    });
    atualizarListaParticipantesSelecionados();
}

function trocarAbaParticipantes(aba) {
    // mantida por compatibilidade, não usada mais no novo modal
}

function atualizarListaParticipantesSelecionados() {
    const checks = document.querySelectorAll('.participante-checkbox:checked');
    const div = document.getElementById('listaParticipantesSelecionados');
    if (!div) return;
    div.innerHTML = checks.length === 0
        ? '<span style="color:#999;">Nenhum participante selecionado</span>'
        : Array.from(checks).map(cb =>
            `<span style="display:inline-flex;align-items:center;gap:4px;background:#007bff;color:white;padding:3px 8px;border-radius:20px;margin:2px;font-size:12px;">${escapeHtml(cb.getAttribute('data-nome'))}<span onclick="this.closest('span').previousSibling;_ncDesmarcar('${cb.value}')" style="cursor:pointer;opacity:0.7;">&times;</span></span>`
          ).join('');
}

function _ncDesmarcar(id) {
    const cb = document.querySelector(`.participante-checkbox[value="${id}"]`);
    if (cb) { cb.checked = false; atualizarListaParticipantesSelecionados(); }
}

function fecharModalNovaConversa() {
    document.getElementById('modalNovaConversa')?.remove();
}

async function criarNovaConversa() {
    const checks = document.querySelectorAll('.participante-checkbox:checked');
    const participantes = Array.from(checks).map(cb => cb.value);
    const nomes = Array.from(checks).map(cb => cb.getAttribute('data-nome'));
    const tipos = Array.from(checks).map(cb => cb.getAttribute('data-tipo'));
    const nomeCustom = document.getElementById('novaConversaNome')?.value.trim();
    const tipoConversa = document.getElementById('novaConversaTipo')?.value || 'grupo';
    const eu = getUsuarioLogado();
    const empresa = getEmpresaLogada();

    // Normalizar ids (CPF sem pontuação)
    for (let i = 0; i < participantes.length; i++) {
        participantes[i] = normalizarId(participantes[i]);
    }
    const euIdNorm = normalizarId(eu.id);
    if (!participantes.includes(euIdNorm)) { 
        participantes.push(euIdNorm); 
        nomes.push(eu.nome); 
        tipos.push(eu.tipo || 'Admin'); 
    }
    if (participantes.length < 2) { alert('❌ Selecione pelo menos um participante.'); return; }
    if (tipoConversa === 'individual' && participantes.length > 2) { alert('❌ Individual permite apenas 2 pessoas.'); return; }
    if (!empresa) { alert('❌ Empresa não identificada'); return; }

    const storageKey = getConversasStorageKey();
    const todasConversas = JSON.parse(localStorage.getItem(storageKey) || '[]');

    let nomeConversa = nomeCustom || (tipoConversa === 'individual'
        ? nomes.find(n => n !== eu.nome) || 'Conversa'
        : nomes.filter(n => n !== eu.nome).join(', ').substring(0, 50));

    if (tipoConversa === 'individual') {
        const ps = [...participantes].sort();
        const existe = todasConversas.find(c => c.tipo === 'individual' && JSON.stringify([...c.participantes].sort()) === JSON.stringify(ps));
        if (existe) { alert('⚠️ Conversa individual já existe!'); fecharModalNovaConversa(); abrirConversaModal(existe.id); return; }
    }

    const novaConversa = {
        id: Date.now().toString(), nome: nomeConversa, tipo: tipoConversa,
        participantes, participantesInfo: participantes.map((id, i) => ({ id, nome: nomes[i], tipo: tipos[i] })),
        dataCriacao: new Date().toISOString(), ultimaMensagem: 'Conversa criada',
        ultimaMensagemData: new Date().toISOString(), avatar: tipoConversa === 'grupo' ? '👥' : '👤'
    };

    todasConversas.push(novaConversa);
    localStorage.setItem(storageKey, JSON.stringify(todasConversas));

    const msgKey = getMensagensStorageKey(novaConversa.id);
    if (msgKey) localStorage.setItem(msgKey, JSON.stringify([{ id: Date.now(), remetente: 'sistema', remetenteNome: 'Sistema', mensagem: `Conversa criada por ${eu.nome}`, data: new Date().toISOString() }]));

    // Notificar outros participantes (incrementar naoLidas) - para TODOS (app e sistema)
    participantes.forEach(pId => {
        if (idsIguais(pId, euIdNorm)) return;
        const naoLidasKey = `${empresa.id}_naoLidas_${normalizarId(pId)}`;
        const nl = JSON.parse(localStorage.getItem(naoLidasKey) || '{}');
        nl[novaConversa.id] = (nl[novaConversa.id] || 0) + 1;
        localStorage.setItem(naoLidasKey, JSON.stringify(nl));
    });

    fecharModalNovaConversa();
    await carregarConversasNoModal();
    abrirConversaModal(novaConversa.id);
}

// ==================== MENSAGENS RÁPIDAS ====================
const MENSAGENS_RAPIDAS = {
    ok: { texto: '✅ OK, confirmado!', cor: '#28a745', corFundo: '#d4edda' },
    atraso: { texto: '⏰ Estou com atraso, chego em breve.', cor: '#ffc107', corFundo: '#fff3cd' },
    cancelado: { texto: '❌ Não poderei comparecer.', cor: '#dc3545', corFundo: '#f8d7da' },
    confirmado: { texto: '✅ Confirmado! Estarei presente.', cor: '#17a2b8', corFundo: '#d1ecf1' }
};

function obterEstiloMensagemRapida(texto) {
    texto = String(texto || '').trim();
    for (const [tipo, config] of Object.entries(MENSAGENS_RAPIDAS)) {
        if (texto === config.texto) {
            return {
                tipo,
                corTexto: config.cor,
                corFundo: config.corFundo,
                isRapida: true
            };
        }
    }
    return { isRapida: false };
}

function enviarMensagemRapida(tipo) {
    const config = MENSAGENS_RAPIDAS[tipo];
    if (!config) return;
    const input = document.getElementById('chatMessageInput');
    if (input) { input.value = config.texto; enviarMensagem(); }
}

// ==================== SALVAR CONVERSAS (compatibilidade) ====================
async function salvarConversas(conversas) {
    const storageKey = getConversasStorageKey();
    if (!storageKey) return;
    const todasConversas = JSON.parse(localStorage.getItem(storageKey) || '[]');
    conversas.forEach(c => {
        const i = todasConversas.findIndex(x => x.id === c.id);
        if (i !== -1) todasConversas[i] = c; else todasConversas.push(c);
    });
    localStorage.setItem(storageKey, JSON.stringify(todasConversas));
    mensagensCache.conversas = conversas;
}

// ==================== UTILITÁRIOS ====================
function formatarHoraRelativa(dataISO) {
    if (!dataISO) return '';
    const diff = Math.floor((new Date() - new Date(dataISO)) / 60000);
    if (diff < 1) return 'Agora';
    if (diff < 60) return `${diff}min`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return new Date(dataISO).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
function formatarHorario(dataISO) {
    if (!dataISO) return '';
    return new Date(dataISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function escapeHtml(text) {
    if (!text) return '';
    const d = document.createElement('div'); d.textContent = text; return d.innerHTML;
}

// ==================== NORMALIZAR ID ====================
function normalizarId(id) {
    if (!id) return '';
    const str = String(id).trim();
    const limpo = str.replace(/\D/g, '');
    return (limpo.length >= 11) ? limpo : str;
}

function idsIguais(id1, id2) {
    return normalizarId(id1) === normalizarId(id2);
}

// ==================== INICIALIZAÇÃO ====================
function inicializarMensagens() {
    const empresa = getEmpresaLogada();
    if (!empresa) { setTimeout(inicializarMensagens, 1000); return; }

    // Resetar hash para não notificar mensagens antigas ao trocar usuário
    hashMensagensAntigo = {};
    hashInicializado = false;

    adicionarBotaoChatGlobal();

    carregarConversas().then(conversas => {
        atualizarBadgeMensagens();
        iniciarPollingMensagens();

        // Notificar grupos novos para TODOS os usuários (incluindo admin)
        const eu = getUsuarioLogado();
        if (eu && conversas.length > 0) {
            const vistosKey = `notif_grupos_vistos_${empresa.id}_${eu.id}`;
            const vistos = JSON.parse(localStorage.getItem(vistosKey) || '[]');
            const novos = conversas.filter(c => !vistos.includes(c.id));
            if (novos.length > 0) {
                setTimeout(() => {
                    novos.forEach(c => mostrarNotificacaoMensagem(c.nome, '📢 Você foi adicionado a este grupo', 'Sistema'));
                    localStorage.setItem(vistosKey, JSON.stringify([...new Set([...vistos, ...conversas.map(c => c.id)])]));
                }, 1500);
            }
        }
    });
}

// ==================== EXPORTS ====================
window.excluirConversa = excluirConversa;
window.abrirPainelParticipantes = abrirPainelParticipantes;
window.removerParticipanteConversa = removerParticipanteConversa;
window.adicionarParticipanteConversa = adicionarParticipanteConversa;
window.inicializarMensagens = inicializarMensagens;
window.abrirModalMensagens = abrirModalMensagens;
window.fecharModalChat = fecharModalChat;
window.enviarMensagem = enviarMensagem;
window.enviarMensagemRapida = enviarMensagemRapida;
window.carregarConversasNoModal = carregarConversasNoModal;
window.getUsuarioLogado = getUsuarioLogado;
window.isUsuarioAdministrador = isUsuarioAdministrador;
window.getEmpresaLogada = getEmpresaLogada;
window.adicionarBotaoChatGlobal = adicionarBotaoChatGlobal;
window.mostrarNotificacaoMensagem = mostrarNotificacaoMensagem;
window.abrirModalNovaConversa = abrirModalNovaConversa;
window.fecharModalNovaConversa = fecharModalNovaConversa;
window.criarNovaConversa = criarNovaConversa;
window.trocarAbaParticipantes = trocarAbaParticipantes;
window._ncTrocarTipo = _ncTrocarTipo;
window._selecionarGrupoPredefinido = _selecionarGrupoPredefinido;
window._ncSelecionarTodos = _ncSelecionarTodos;
window._ncDesmarcar = _ncDesmarcar;
window.abrirConversaModal = abrirConversaModal;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(inicializarMensagens, 500));
} else {
    setTimeout(inicializarMensagens, 500);
}
