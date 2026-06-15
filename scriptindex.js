// ==================== scriptindex.js - VERSÃO CORRIGIDA ====================

// ==================== FUNÇÕES DE NAVEGAÇÃO ====================

function showPage(pageId) {
    console.log(`📄 Mostrando página: ${pageId}`);

    // Bloquear acesso a páginas sem permissão para funcionários
    if (window._pagesPermitidas && !window._pagesPermitidas.has(pageId)) {
        console.warn(`🚫 Acesso negado à página: ${pageId}`);
        const toast = document.createElement('div');
        toast.textContent = '⚠️ Você não tem permissão para acessar esta página.';
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#dc3545;color:white;padding:12px 20px;border-radius:8px;z-index:9999;font-size:14px;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        return;
    }
    
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Mostrar a página selecionada
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
        
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        console.log(`✅ Página ${pageId} exibida`);
        
        if (pageId === 'criar_checklist') {
            setTimeout(() => {
                if (typeof carregarPersonagensNoDropdown === 'function') carregarPersonagensNoDropdown();
                if (typeof carregarPersonagemChecklistAutomatico === 'function') carregarPersonagemChecklistAutomatico();
            }, 100);
        }

        if (typeof window.inicializarIDFormulario === 'function') {
            const pageToEntidade = {
                clientes: 'clientes',
                casa_de_festas: 'casa_de_festas',
                elenco: 'elenco',
                personagens: 'personagens',
                motoristas: 'motoristas',
                fornecedores: 'fornecedores',
                funcionarios: 'funcionarios',
                eventos: 'eventos',
                usuarios: 'usuarios'
            };
            const entidade = pageToEntidade[pageId];
            if (entidade) {
                window.inicializarIDFormulario(entidade);
            }
        }
        
        if (pageId.startsWith('relatorio_') && typeof carregarRelatorio === 'function') {
            carregarRelatorio(pageId);
        }
    } else {
        console.error(`❌ Página não encontrada: ${pageId}`);
    }
    
    updateActiveMenu(pageId);
}

function updateActiveMenu(pageId) {
    // Remove active de todos os botões
    document.querySelectorAll('.nav-btn, .nav-subbtn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adiciona active ao botão correspondente
    const activeBtn = document.querySelector(`[data-page="${pageId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// ==================== APLICAR PERMISSÕES DO FUNCIONÁRIO NO MENU ====================

function aplicarPermissoesFuncionario(permissoesModulos) {
    const pagesPermitidas = new Set(['dashboard']); // dashboard sempre visível

    // Cada id do módulo agora é diretamente o data-page, ignorar entradas de grupo (header)
    modulosSistema.forEach(modulo => {
        if (modulo.grupo === 'header') return;
        const perms = permissoesModulos[modulo.id];
        if (perms && perms.visualizar) {
            pagesPermitidas.add(modulo.id);
        }
    });

    // Ocultar botões do menu sem permissão
    document.querySelectorAll('[data-page]').forEach(btn => {
        if (!pagesPermitidas.has(btn.getAttribute('data-page'))) {
            btn.style.display = 'none';
        }
    });

    // Ocultar grupos de menu cujos filhos foram todos ocultados
    document.querySelectorAll('[data-toggle]').forEach(toggleBtn => {
        const submenu = document.getElementById(toggleBtn.getAttribute('data-toggle'));
        if (!submenu) return;
        const visiveis = [...submenu.querySelectorAll('[data-page]')]
            .filter(b => b.style.display !== 'none').length;
        if (visiveis === 0) {
            toggleBtn.style.display = 'none';
            const navGroup = toggleBtn.closest('.nav-group');
            if (navGroup) navGroup.style.display = 'none';
        }
    });

    window._pagesPermitidas = pagesPermitidas;
    console.log('🔐 Permissões aplicadas:', [...pagesPermitidas]);
}

// ==================== INICIALIZAÇÃO PRINCIPAL ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema...');
    
    // Verificar login no sessionStorage
    let empresaLogada = null;
    try {
        const empresaStr = sessionStorage.getItem('empresa_logada');
        if (empresaStr && empresaStr !== 'null' && empresaStr !== 'undefined') {
            empresaLogada = JSON.parse(empresaStr);
        }
    } catch(e) {
        console.error('Erro ao ler sessionStorage:', e);
    }
    
    if (!empresaLogada || !empresaLogada.id) {
        console.log('❌ Não logado - redirecionando para login');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('✅ Logado:', empresaLogada.nome);
    window.pastaAtual = sessionStorage.getItem('pasta_atual');
    
    // Configurar nome do usuário
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) {
        userNameSpan.textContent = empresaLogada.nome || empresaLogada.login;
    }
    
    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = function(e) {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        };
    }
    
    // Inicializar relógio
    function updateClock() {
        const clock = document.getElementById('userClock');
        if (clock) {
            clock.textContent = new Date().toLocaleTimeString('pt-BR');
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
    
    // ===== CONFIGURAR BOTÕES DE NAVEGAÇÃO =====
    document.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const pageId = this.getAttribute('data-page');
            console.log(`🔘 Botão clicado: ${pageId}`);
            showPage(pageId);
        });
    });
    
    // ===== CONFIGURAR SUBMENUS (data-toggle) =====
    document.querySelectorAll('[data-toggle]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const menuId = this.getAttribute('data-toggle');
            const menu = document.getElementById(menuId);
            if (menu) {
                const isVisible = menu.style.display === 'block';
                document.querySelectorAll('.sidebar-submenu').forEach(submenu => {
                    submenu.style.display = 'none';
                });
                if (!isVisible) {
                    menu.style.display = 'block';
                }
            }
        });
    });
    
    // ===== APLICAR PERMISSÕES SE FOR FUNCIONÁRIO =====
    if (empresaLogada.tipo === 'funcionario') {
        try {
            const pasta = sessionStorage.getItem('pasta_atual') || empresaLogada.pasta;
            const chavePermissoes = `permissoes_${pasta}`;
            const todasPermissoes = JSON.parse(localStorage.getItem(chavePermissoes) || '{}');
            const permissoesDoUsuario = todasPermissoes[empresaLogada.id] || {};
            aplicarPermissoesFuncionario(permissoesDoUsuario);
        } catch(e) {
            console.error('Erro ao aplicar permissões:', e);
        }
    }

    // Mostrar dashboard inicial
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
        dashboard.classList.add('active');
    }
    
    // Marcar botão dashboard como ativo
    const dashboardBtn = document.querySelector('[data-page="dashboard"]');
    if (dashboardBtn) dashboardBtn.classList.add('active');
    
    console.log('✅ Sistema inicializado com sucesso!');
});

// ==================== FUNÇÕES AUXILIARES ====================

function gerarID(formulario) {
    const prefixos = {
        'clientes': 'CLI', 'casa_de_festas': 'CF', 'elenco': 'EL',
        'personagens': 'PER', 'motoristas': 'MOT', 'fornecedores': 'FOR',
        'funcionarios': 'FUNC', 'usuarios': 'USR', 'eventos': 'EV'
    };
    const prefixo = prefixos[formulario] || 'ID';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefixo}-${timestamp}-${random}`;
}

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

function mostrarMensagemSucesso(mensagem) {
    const div = document.createElement('div');
    div.innerHTML = `<div style="position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:15px 20px;border-radius:5px;z-index:9999;">${mensagem}</div>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Funções de calendário
let currentDate = new Date();
let eventos = [];

function loadCalendarData() {
    eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]').map(e => ({
        data: e.data_evento || e.data || '',
        hora: e.hora_evento || e.hora || '',
        cliente: e.nome_cliente_evento || e.cliente || '',
        local: e.nome_local_evento || e.casa_festa || e.local || ''
    }));
}

function updateCalendar() {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const currentMonthElement = document.getElementById('currentMonth');
    if (currentMonthElement) {
        currentMonthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    const calendar = document.getElementById('calendar');
    if (calendar) {
        calendar.innerHTML = `<div class="calendar-grid">${generateCalendarHTML()}</div>`;
    }
}

function generateCalendarHTML() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let html = '';
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    diasSemana.forEach(dia => html += `<div class="calendar-day-header">${dia}</div>`);
    for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day-empty"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const eventosNoDia = eventos.filter(e => e.data === dateStr);
        const isToday = (new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year);
        html += `<div class="calendar-day${isToday ? ' today' : ''}"><div class="day-number">${day}</div>`;
        eventosNoDia.slice(0, 2).forEach(e => {
            html += `<div class="event-indicator" title="${e.cliente || 'Evento'}">${(e.cliente || 'Evento').substring(0, 10)}</div>`;
        });
        if (eventosNoDia.length > 2) html += `<div class="event-indicator">+${eventosNoDia.length - 2}</div>`;
        html += '</div>';
    }
    return html;
}
// ==================== SISTEMA DE USUÁRIOS E PERMISSÕES ====================

// Array para armazenar usuários
let usuariosSistema = [];
let permissoesUsuarios = {};

// ==================== FUNÇÕES DE USUÁRIOS ====================

// Carregar usuários da empresa
function carregarUsuariosSistema() {
    try {
        const empresaLogada = sessionStorage.getItem('empresa_logada');
        if (empresaLogada) {
            const empresa = JSON.parse(empresaLogada);
            const chave = `usuarios_sistema_${empresa.pasta}`;
            const usuariosSalvos = localStorage.getItem(chave);
            
            if (usuariosSalvos) {
                usuariosSistema = JSON.parse(usuariosSalvos);
            } else {
                // Usuário administrador padrão
                usuariosSistema = [{
                    id: gerarID('USR'),
                    nome: "Administrador",
                    login: "admin",
                    senha: "admin123",
                    cpf: "000.000.000-00",
                    email: "admin@sistema.com",
                    telefone: "",
                    cargo: "administrador",
                    status: "ativo",
                    data_cadastro: new Date().toISOString()
                }];
                salvarUsuariosSistema();
            }
            
            // Carregar permissões
            carregarPermissoes();
            atualizarListaUsuarios();
        }
    } catch(e) {
        console.error('Erro ao carregar usuários:', e);
    }
}



// Salvar usuários no localStorage
function salvarUsuariosSistema() {
    const empresaLogada = JSON.parse(sessionStorage.getItem('empresa_logada'));
    if (empresaLogada && empresaLogada.pasta) {
        const chave = `usuarios_sistema_${empresaLogada.pasta}`;
        localStorage.setItem(chave, JSON.stringify(usuariosSistema));
        console.log('✅ Usuários salvos! Chave:', chave);
    }
}

// Salvar permissões no storage (função auxiliar)
function salvarPermissoesStorage() {
    try {
        const empresaLogada = JSON.parse(sessionStorage.getItem('empresa_logada'));
        if (empresaLogada && empresaLogada.pasta) {
            const chave = `permissoes_${empresaLogada.pasta}`;
            localStorage.setItem(chave, JSON.stringify(permissoesUsuarios));
            console.log('✅ Permissões salvas no storage');
            return true;
        }
    } catch(e) {
        console.error('❌ Erro ao salvar permissões:', e);
    }
    return false;
}

// Função para carregar permissões do localStorage (CORRIGIDA)
function carregarPermissoes() {
    try {
        const empresaLogada = JSON.parse(sessionStorage.getItem('empresa_logada'));
        if (empresaLogada && empresaLogada.pasta) {
            const chave = `permissoes_${empresaLogada.pasta}`;
            const permissoesSalvas = localStorage.getItem(chave);
            
            if (permissoesSalvas) {
                permissoesUsuarios = JSON.parse(permissoesSalvas);
                console.log('✅ Permissões carregadas do localStorage:', permissoesUsuarios);
            } else {
                permissoesUsuarios = {};
                console.log('📁 Nenhuma permissão encontrada, iniciando vazio');
            }
        } else {
            permissoesUsuarios = {};
        }
    } catch(e) {
        console.error('❌ Erro ao carregar permissões:', e);
        permissoesUsuarios = {};
    }
}

// Atualizar lista de usuários na tabela
function atualizarListaUsuarios() {
    const tbody = document.getElementById('listaUsuariosSistema');
    if (!tbody) return;
    
    if (usuariosSistema.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum usuário cadastrado</td></tr>';
        document.getElementById('totalUsuariosSistema').textContent = '0';
        document.getElementById('totalUsuariosAtivos').textContent = '0';
        document.getElementById('totalUsuariosInativos').textContent = '0';
        return;
    }
    
    let ativos = 0, inativos = 0;
    
    tbody.innerHTML = usuariosSistema.map(user => {
        if (user.status === 'ativo') ativos++;
        else inativos++;
        
        return `
            <tr>
                <td>${user.id || user.ID || '-'}</td>
                <td><strong>${user.nome}</strong></td>
                <td>${user.login}</td>
                <td>${user.cpf || '-'}</td>
                <td>${getCargoNome(user.cargo)}</td>
                <td>
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; ${user.status === 'ativo' ? 'background: #d4edda; color: #155724;' : 'background: #f8d7da; color: #721c24;'}">
                        ${user.status === 'ativo' ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn-sm" onclick="editarUsuarioSistema('${user.id}')" style="background: #ffc107; color: #333;">✏️</button>
                    <button class="btn-sm" onclick="confirmarExcluirUsuario('${user.id}')" style="background: #dc3545; color: white;">🗑️</button>
                    <button class="btn-sm" onclick="irParaPermissoes('${user.id}')" style="background: #17a2b8; color: white;">🔐</button>
                </td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('totalUsuariosSistema').textContent = usuariosSistema.length;
    document.getElementById('totalUsuariosAtivos').textContent = ativos;
    document.getElementById('totalUsuariosInativos').textContent = inativos;
    
    // Atualizar select de permissões
    atualizarSelectUsuariosPermissoes();
}

// Atualizar select de permissões
function atualizarSelectUsuariosPermissoes() {
    const select = document.getElementById('usuario_permissoes_select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um usuário...</option>';
    
    usuariosSistema.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.nome} (${user.login}) - ${user.status === 'ativo' ? 'Ativo' : 'Inativo'}`;
        select.appendChild(option);
    });
}

// Filtrar usuários na lista
function filtrarUsuariosSistema() {
    const busca = document.getElementById('buscarUsuarioSistema').value.toLowerCase();
    const linhas = document.querySelectorAll('#listaUsuariosSistema tr');
    
    linhas.forEach(linha => {
        const texto = linha.textContent.toLowerCase();
        if (texto.includes(busca) || busca === '') {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
}

// Salvar usuário
function salvarUsuarioSistema() {
    const id = document.getElementById('ID_usuario_sistema').value;
    const nome = document.getElementById('nome_usuario_sistema').value.trim();
    const cpf = document.getElementById('cpf_usuario_sistema').value;
    const login = document.getElementById('login_usuario_sistema').value.trim();
    const senha = document.getElementById('senha_usuario_sistema').value;
    const confirmar = document.getElementById('confirmar_senha_usuario').value;
    const email = document.getElementById('email_usuario_sistema').value;
    const telefone = document.getElementById('telefone_usuario_sistema').value;
    const cargo = document.getElementById('cargo_usuario_sistema').value;
    const status = document.getElementById('status_usuario_sistema').value;
    
    // Validações
    if (!nome || !login || !senha) {
        mostrarAlertaUsuario('Preencha Nome, Login e Senha!', 'error');
        return;
    }
    
    if (senha !== confirmar) {
        mostrarAlertaUsuario('As senhas não coincidem!', 'error');
        return;
    }
    
    if (senha.length < 6) {
        mostrarAlertaUsuario('A senha deve ter no mínimo 6 caracteres!', 'error');
        return;
    }
    
    // Verificar login duplicado
    const loginExiste = usuariosSistema.some(u => u.login === login && u.id !== id);
    if (loginExiste) {
        mostrarAlertaUsuario('Este login já está em uso!', 'error');
        return;
    }
    
    const usuario = {
        id: id || gerarID('USR'),
        nome: nome,
        cpf: cpf,
        login: login,
        senha: senha,
        email: email,
        telefone: telefone,
        cargo: cargo || 'atendente',
        status: status,
        data_cadastro: id ? undefined : new Date().toISOString(),
        data_atualizacao: new Date().toISOString()
    };
    
    if (id) {
        // Atualizar
        const index = usuariosSistema.findIndex(u => u.id === id);
        if (index !== -1) {
            usuariosSistema[index] = { ...usuariosSistema[index], ...usuario };
            mostrarAlertaUsuario('✅ Usuário atualizado com sucesso!', 'success');
        }
    } else {
        // Novo
        usuariosSistema.push(usuario);
        mostrarAlertaUsuario('✅ Usuário cadastrado com sucesso!', 'success');
    }
    
    salvarUsuariosSistema();
    limparFormularioUsuarioSistema();
    atualizarListaUsuarios();
}

// Editar usuário
function editarUsuarioSistema(id) {
    const usuario = usuariosSistema.find(u => u.id === id);
    if (usuario) {
        document.getElementById('ID_usuario_sistema').value = usuario.id;
        document.getElementById('nome_usuario_sistema').value = usuario.nome;
        document.getElementById('cpf_usuario_sistema').value = usuario.cpf || '';
        document.getElementById('login_usuario_sistema').value = usuario.login;
        document.getElementById('email_usuario_sistema').value = usuario.email || '';
        document.getElementById('telefone_usuario_sistema').value = usuario.telefone || '';
        document.getElementById('cargo_usuario_sistema').value = usuario.cargo || '';
        document.getElementById('status_usuario_sistema').value = usuario.status || 'ativo';
        document.getElementById('senha_usuario_sistema').value = '';
        document.getElementById('confirmar_senha_usuario').value = '';
        
        document.querySelector('#usuarios_sistema .card h3:first-of-type').innerHTML = '✏️ Editar Usuário';
        document.querySelector('#usuarios_sistema .btn.primary').innerHTML = '💾 ATUALIZAR REGISTRO';
        
        mostrarAlertaUsuario(`Editando usuário: ${usuario.nome}`, 'info');
    }
}

// Confirmar exclusão
function confirmarExcluirUsuario(id) {
    if (confirm('⚠️ Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita!')) {
        const index = usuariosSistema.findIndex(u => u.id === id);
        if (index !== -1) {
            usuariosSistema.splice(index, 1);
            salvarUsuariosSistema();
            atualizarListaUsuarios();
            mostrarAlertaUsuario('✅ Usuário excluído com sucesso!', 'success');
        }
    }
}

// Limpar formulário
function limparFormularioUsuarioSistema() {
    document.getElementById('ID_usuario_sistema').value = '';
    document.getElementById('nome_usuario_sistema').value = '';
    document.getElementById('cpf_usuario_sistema').value = '';
    document.getElementById('login_usuario_sistema').value = '';
    document.getElementById('senha_usuario_sistema').value = '';
    document.getElementById('confirmar_senha_usuario').value = '';
    document.getElementById('email_usuario_sistema').value = '';
    document.getElementById('telefone_usuario_sistema').value = '';
    document.getElementById('cargo_usuario_sistema').value = '';
    document.getElementById('status_usuario_sistema').value = 'ativo';
    
    document.querySelector('#usuarios_sistema .card h3:first-of-type').innerHTML = '➕ Novo Usuário';
    document.querySelector('#usuarios_sistema .btn.primary').innerHTML = '💾 SALVAR REGISTRO';
}

// Mostrar alerta
function mostrarAlertaUsuario(mensagem, tipo) {
    const successDiv = document.getElementById('alertUsuarioSuccess');
    const errorDiv = document.getElementById('alertUsuarioError');
    
    if (successDiv) successDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';
    
    if (tipo === 'success' && successDiv) {
        successDiv.textContent = mensagem;
        successDiv.style.display = 'block';
        setTimeout(() => { successDiv.style.display = 'none'; }, 3000);
    } else if (errorDiv) {
        errorDiv.textContent = mensagem;
        errorDiv.style.display = 'block';
        setTimeout(() => { errorDiv.style.display = 'none'; }, 3000);
    } else {
        alert(mensagem);
    }
}

// ==================== FUNÇÕES DE PERMISSÕES ====================

// Módulos do sistema — reflete exatamente os botões/subbotões do menu
const modulosSistema = [
    { nome: "📊 Painel (Dashboard)",          id: "dashboard",                   grupo: null },
    // --- EVENTOS ---
    { nome: "🎉 Eventos",                      id: "_grupo_eventos",               grupo: "header" },
    { nome: "  📅 Reservar Evento",            id: "reservar_evento",              grupo: "eventos" },
    { nome: "  📋 Eventos Reservados",         id: "eventos_reservados",           grupo: "eventos" },
    { nome: "  📌 Todos os Eventos",           id: "todos_eventos",                grupo: "eventos" },
    { nome: "  ⏰ Eventos Futuros",            id: "eventos_futuros",              grupo: "eventos" },
    { nome: "  ✅ Confirmar Dados",            id: "confirmar_dados",              grupo: "eventos" },
    { nome: "  🏁 Eventos Finalizados",        id: "eventos_finalizados",          grupo: "eventos" },
    // --- CADASTROS ---
    { nome: "📝 Cadastros",                    id: "_grupo_cadastros",             grupo: "header" },
    { nome: "  👤 Clientes",                   id: "clientes",                     grupo: "cadastros" },
    { nome: "  🏠 Casa de Festas",             id: "casa_de_festas",               grupo: "cadastros" },
    { nome: "  🎭 Elenco",                     id: "elenco",                       grupo: "cadastros" },
    { nome: "  🦸 Personagens",                id: "personagens",                  grupo: "cadastros" },
    { nome: "  🚗 Motoristas",                 id: "motoristas",                   grupo: "cadastros" },
    { nome: "  📦 Fornecedores",               id: "fornecedores",                 grupo: "cadastros" },
    { nome: "  👥 Funcionários",               id: "funcionarios",                 grupo: "cadastros" },
    { nome: "  ✓ Criar Check List",            id: "criar_checklist",              grupo: "cadastros" },
    // --- ESCALAS ---
    { nome: "🎭 Escalas",                      id: "_grupo_escalas",               grupo: "header" },
    { nome: "  📋 Escalar Equipe",             id: "escalas",                      grupo: "escalas" },
    // --- FINANCEIRO ---
    { nome: "💰 Financeiro",                   id: "_grupo_financeiro",            grupo: "header" },
    { nome: "  📥 Contas a Receber",           id: "contas_receber",               grupo: "financeiro" },
    { nome: "  📤 Contas a Pagar",             id: "contas_pagar",                 grupo: "financeiro" },
    { nome: "  💵 Fluxo de Caixa",             id: "fluxo_caixa",                  grupo: "financeiro" },
    { nome: "  📊 Orçamentos",                 id: "orcamentos",                   grupo: "financeiro" },
    // --- DISPONIBILIDADE ---
    { nome: "🎭 Disponibilidade de Personagem",id: "disponibilidade_personagem",   grupo: null },
    // --- ACESSO APP ---
    { nome: "👤 Acesso Usuário App",           id: "acesso_usuario_app",           grupo: null },
    // --- MANUTENÇÃO ---
    { nome: "🔧 Manutenção",                   id: "_grupo_manutencao",            grupo: "header" },
    { nome: "  ➕ Cadastrar Manutenção",        id: "cadastrar_manutencao",         grupo: "manutencao" },
    { nome: "  📋 Lista de Manutenção",        id: "lista_de_manutencao",          grupo: "manutencao" },
    // --- RELATÓRIOS ---
    { nome: "📚 Relatórios",                   id: "_grupo_relatorios",            grupo: "header" },
    { nome: "  🎉 Rel. Eventos",               id: "relatorio_eventos",            grupo: "relatorios" },
    { nome: "  👤 Rel. Clientes",              id: "relatorio_clientes",           grupo: "relatorios" },
    { nome: "  🦸 Rel. Personagens",           id: "relatorio_personagens",        grupo: "relatorios" },
    { nome: "  🏠 Rel. Casas de Festa",        id: "relatorio_casas_de_festa",     grupo: "relatorios" },
    { nome: "  ✓ Rel. Check List",             id: "relatorio_checklist",          grupo: "relatorios" },
    { nome: "  💰 Rel. Financeiro",            id: "relatorio_financeiro",         grupo: "relatorios" },
    { nome: "  👥 Rel. Equipe",                id: "relatorio_equipe",             grupo: "relatorios" },
    // --- CONFIGURAÇÕES ---
    { nome: "⚙️ Configurações",               id: "_grupo_config",                grupo: "header" },
    { nome: "  👤 Cadastrar Usuário",          id: "usuarios_sistema",             grupo: "config" },
    { nome: "  🔐 Gerenciar Permissões",       id: "permissoes_sistema",           grupo: "config" }
];

// Função para carregar permissões do usuário selecionado (CORRIGIDA)
function carregarPermissoesUsuario() {
    const userId = document.getElementById('usuario_permissoes_select').value;
    const tabelaContainer = document.getElementById('tabelaPermissoesContainer');
    const nenhumUsuarioDiv = document.getElementById('nenhumUsuarioSelecionado');
    const infoUsuarioDiv = document.getElementById('infoUsuarioPermissao');
    
    if (!userId) {
        if (tabelaContainer) tabelaContainer.style.display = 'none';
        if (nenhumUsuarioDiv) nenhumUsuarioDiv.style.display = 'block';
        if (infoUsuarioDiv) infoUsuarioDiv.style.display = 'none';
        return;
    }
    
    const usuario = usuariosSistema.find(u => u.id === userId);
    if (!usuario) return;
    
    // Mostrar informações do usuário
    const infoNome = document.getElementById('infoUsuarioNome');
    const infoLogin = document.getElementById('infoUsuarioLogin');
    const infoCpf = document.getElementById('infoUsuarioCpf');
    const infoCargo = document.getElementById('infoUsuarioCargo');
    const infoStatus = document.getElementById('infoUsuarioStatus');
    
    if (infoNome) infoNome.textContent = usuario.nome;
    if (infoLogin) infoLogin.textContent = usuario.login;
    if (infoCpf) infoCpf.textContent = usuario.cpf || '-';
    if (infoCargo) infoCargo.textContent = getCargoNome(usuario.cargo);
    if (infoStatus) {
        infoStatus.innerHTML = usuario.status === 'ativo' 
            ? '<span style="color: #28a745;">✅ Ativo</span>' 
            : '<span style="color: #dc3545;">❌ Inativo</span>';
    }
    
    if (infoUsuarioDiv) infoUsuarioDiv.style.display = 'block';
    
    // Carregar permissões do usuário
    const permissoesUsuario = permissoesUsuarios[userId] || {};
    
    // Gerar tabela de permissões
    const tbody = document.getElementById('tabelaPermissoesBody');
    if (!tbody) return;
    
    tbody.innerHTML = modulosSistema.map(modulo => {
        // Linha de cabeçalho de grupo
        if (modulo.grupo === 'header') {
            return `
            <tr style="background:#2c3e50;">
                <td colspan="6" style="padding:8px 12px;color:white;font-weight:bold;font-size:13px;letter-spacing:1px;">
                    ${modulo.nome}
                </td>
            </tr>`;
        }

        const perms = permissoesUsuario[modulo.id] || {
            visualizar: false, criar: false, editar: false, excluir: false, exportar: false
        };
        const isSubitem = modulo.grupo !== null;
        const bg = isSubitem ? '' : 'background:#f0f4f8;';
        const fw = isSubitem ? '' : 'font-weight:bold;';

        return `
            <tr style="${bg}">
                <td style="padding-left:${isSubitem ? '24px' : '10px'};${fw}">${modulo.nome}</td>
                <td style="text-align:center;">
                    <input type="checkbox" class="perm-checkbox" data-modulo="${modulo.id}" data-permissao="visualizar" ${perms.visualizar ? 'checked' : ''}>
                </td>
                <td style="text-align:center;">
                    <input type="checkbox" class="perm-checkbox" data-modulo="${modulo.id}" data-permissao="criar" ${perms.criar ? 'checked' : ''}>
                </td>
                <td style="text-align:center;">
                    <input type="checkbox" class="perm-checkbox" data-modulo="${modulo.id}" data-permissao="editar" ${perms.editar ? 'checked' : ''}>
                </td>
                <td style="text-align:center;">
                    <input type="checkbox" class="perm-checkbox" data-modulo="${modulo.id}" data-permissao="excluir" ${perms.excluir ? 'checked' : ''}>
                </td>
                <td style="text-align:center;">
                    <input type="checkbox" class="perm-checkbox" data-modulo="${modulo.id}" data-permissao="exportar" ${perms.exportar ? 'checked' : ''}>
                </td>
            </tr>`;
    }).join('');
    
    if (tabelaContainer) tabelaContainer.style.display = 'block';
    if (nenhumUsuarioDiv) nenhumUsuarioDiv.style.display = 'none';
}
// Salvar permissões - VERSÃO QUE SALVA E VOLTA RAPIDAMENTE
function salvarPermissoes() {
    console.log('🔐 Botão Salvar Permissões clicado');
    
    const selectUsuario = document.getElementById('usuario_permissoes_select');
    if (!selectUsuario) {
        mostrarAlertaPermissao('❌ Erro: Select de usuários não encontrado!', 'error');
        return;
    }
    
    const userId = selectUsuario.value;
    
    if (!userId) {
        mostrarAlertaPermissao('❌ Selecione um usuário primeiro!', 'error');
        return;
    }
    
    const usuario = usuariosSistema.find(u => u.id === userId);
    if (!usuario) {
        mostrarAlertaPermissao('❌ Usuário não encontrado!', 'error');
        return;
    }
    
    // Coleta as permissões
    const permissoesUsuario = {};
    document.querySelectorAll('.perm-checkbox').forEach(checkbox => {
        const modulo = checkbox.getAttribute('data-modulo');
        const permissao = checkbox.getAttribute('data-permissao');
        
        if (!modulo || !permissao) return;
        
        if (!permissoesUsuario[modulo]) {
            permissoesUsuario[modulo] = { 
                visualizar: false, criar: false, editar: false, 
                excluir: false, exportar: false 
            };
        }
        permissoesUsuario[modulo][permissao] = checkbox.checked;
    });
    
    // Salva
    permissoesUsuarios[userId] = permissoesUsuario;
    
    try {
        const empresaLogada = JSON.parse(sessionStorage.getItem('empresa_logada'));
        if (empresaLogada && empresaLogada.pasta) {
            const chave = `permissoes_${empresaLogada.pasta}`;
            localStorage.setItem(chave, JSON.stringify(permissoesUsuarios));
        }
    } catch(e) {
        console.error('Erro ao salvar:', e);
    }
    
    // Mostra mensagem e volta rapidamente
    mostrarAlertaPermissao(`✅ Permissões de "${usuario.nome}" salvas!`, 'success');
    
    // Volta para página de usuários após 1 segundo
    setTimeout(() => {
        const paginaUsuarios = document.getElementById('usuarios_sistema');
        if (paginaUsuarios) {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
                page.style.display = 'none';
            });
            paginaUsuarios.classList.add('active');
            paginaUsuarios.style.display = 'block';
            
            // Atualiza menu
            document.querySelectorAll('.nav-btn, .nav-subbtn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = document.querySelector('[data-page="usuarios_sistema"]');
            if (activeBtn) activeBtn.classList.add('active');
            
            atualizarListaUsuarios();
        } else {
            showPage('dashboard');
        }
    }, 1000);
}
        
    
// Selecionar todas as permissões
function selecionarTodasPermissoes() {
    const userId = document.getElementById('usuario_permissoes_select').value;
    if (!userId) {
        mostrarAlertaPermissao('❌ Selecione um usuário primeiro!', 'error');
        return;
    }
    
    document.querySelectorAll('.perm-checkbox').forEach(cb => {
        cb.checked = true;
    });
    
    mostrarAlertaPermissao('✅ Todas as permissões marcadas. Clique em "Salvar Permissões" para confirmar.', 'info');
}

// Desmarcar todas as permissões
function desmarcarTodasPermissoes() {
    const userId = document.getElementById('usuario_permissoes_select').value;
    if (!userId) {
        mostrarAlertaPermissao('❌ Selecione um usuário primeiro!', 'error');
        return;
    }
    
    document.querySelectorAll('.perm-checkbox').forEach(cb => {
        cb.checked = false;
    });
    
    mostrarAlertaPermissao('✅ Todas as permissões desmarcadas. Clique em "Salvar Permissões" para confirmar.', 'info');
}
// Configurar permissões de Administrador
function permissoesAdministrador() {
    const userId = document.getElementById('usuario_permissoes_select').value;
    if (!userId) {
        mostrarAlertaPermissao('❌ Selecione um usuário primeiro!', 'error');
        return;
    }
    
    document.querySelectorAll('.perm-checkbox').forEach(cb => {
        cb.checked = true;
    });
    
    mostrarAlertaPermissao('✅ Permissões de Administrador aplicadas. Clique em "Salvar Permissões" para confirmar.', 'info');
}

// Configurar permissões de Gerente
function permissoesGerente() {
    const userId = document.getElementById('usuario_permissoes_select').value;
    if (!userId) {
        mostrarAlertaPermissao('❌ Selecione um usuário primeiro!', 'error');
        return;
    }
    
    document.querySelectorAll('.perm-checkbox').forEach(cb => {
        const permissao = cb.getAttribute('data-permissao');
        cb.checked = (permissao !== 'excluir');
    });
    
    mostrarAlertaPermissao('✅ Permissões de Gerente aplicadas (sem exclusão). Clique em "Salvar Permissões" para confirmar.', 'info');
}

// Permissões de Atendente
function permissoesAtendente() {
    document.querySelectorAll('.perm-checkbox').forEach(cb => {
        const modulo = cb.getAttribute('data-modulo');
        const permissao = cb.getAttribute('data-permissao');
        
        if (modulo === 'dashboard' || modulo === 'eventos' || modulo === 'reservar_evento' || modulo === 'clientes') {
            cb.checked = (permissao !== 'excluir');
        } else {
            cb.checked = (permissao === 'visualizar');
        }
    });
}

// Limpar permissões (DESMARCAR TODOS OS CHECKBOXES)
function limparPermissoes() {
    const userId = document.getElementById('usuario_permissoes_select').value;
    
    if (!userId) {
        mostrarAlertaPermissao('❌ Selecione um usuário primeiro!', 'error');
        return;
    }
    
    if (confirm('⚠️ Tem certeza que deseja desmarcar TODAS as permissões deste usuário?')) {
        // Desmarcar todos os checkboxes
        document.querySelectorAll('.perm-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        mostrarAlertaPermissao('✅ Todas as permissões foram desmarcadas. Clique em "Salvar Permissões" para confirmar.', 'info');
    }
}
// Copiar permissões de outro usuário
function copiarPermissoesDeOutro() {
    const usuariosLista = usuariosSistema.filter(u => u.status === 'ativo');
    if (usuariosLista.length === 0) {
        mostrarAlertaPermissao('Nenhum usuário disponível para copiar!', 'error');
        return;
    }
    
    let menu = 'Selecione o usuário para copiar permissões:\n';
    usuariosLista.forEach((u, i) => {
        menu += `${i + 1}. ${u.nome} (${u.login})\n`;
    });
    
    const escolha = prompt(menu + '\n\nDigite o número do usuário:');
    if (escolha) {
        const index = parseInt(escolha) - 1;
        if (usuariosLista[index]) {
            const userIdOrigem = usuariosLista[index].id;
            const userIdDestino = document.getElementById('usuario_permissoes_select').value;
            
            if (userIdDestino && permissoesUsuarios[userIdOrigem]) {
                permissoesUsuarios[userIdDestino] = JSON.parse(JSON.stringify(permissoesUsuarios[userIdOrigem]));
                salvarPermissoesStorage();
                carregarPermissoesUsuario();
                mostrarAlertaPermissao('✅ Permissões copiadas com sucesso!', 'success');
            } else {
                mostrarAlertaPermissao('Usuário de origem não possui permissões configuradas!', 'error');
            }
        }
    }
}

// Filtrar usuários no select de permissões
function filtrarUsuariosPermissoes(filtro) {
    const select = document.getElementById('usuario_permissoes_select');
    if (!select) return;
    
    // Atualizar estilo dos botões
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#e9ecef';
        btn.style.color = '#333';
    });
    const btnAtivo = document.querySelector(`.btn-filter[data-filter="${filtro}"]`);
    if (btnAtivo) {
        btnAtivo.classList.add('active');
        btnAtivo.style.background = '#007bff';
        btnAtivo.style.color = 'white';
    }
    
    // Filtrar opções
    const options = select.querySelectorAll('option');
    options.forEach(option => {
        if (option.value === '') return;
        
        const usuario = usuariosSistema.find(u => u.id === option.value);
        if (!usuario) return;
        
        if (filtro === 'todos') {
            option.style.display = '';
        } else if (filtro === 'ativo') {
            option.style.display = usuario.status === 'ativo' ? '' : 'none';
        } else if (filtro === 'inativo') {
            option.style.display = usuario.status === 'inativo' ? '' : 'none';
        }
    });
}

// Ir para permissões
function irParaPermissoes(userId) {
    showPage('permissoes_sistema');
    setTimeout(() => {
        const select = document.getElementById('usuario_permissoes_select');
        if (select) {
            select.value = userId;
            carregarPermissoesUsuario();
        }
    }, 200);
}

// Mostrar alerta de permissão (CORRIGIDA)
function mostrarAlertaPermissao(mensagem, tipo) {
    const successDiv = document.getElementById('alertPermissaoSuccess');
    const errorDiv = document.getElementById('alertPermissaoError');
    
    // Esconder ambos
    if (successDiv) successDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';
    
    // Criar toast se não existirem os elementos
    if ((tipo === 'success' && !successDiv) || (tipo === 'error' && !errorDiv)) {
        // Fallback: usar toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : '#17a2b8'};
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
        setTimeout(() => toast.remove(), 3000);
        return;
    }
    
    if (tipo === 'success' && successDiv) {
        successDiv.textContent = mensagem;
        successDiv.style.display = 'block';
        setTimeout(() => { 
            if (successDiv) successDiv.style.display = 'none'; 
        }, 3000);
    } else if (errorDiv) {
        errorDiv.textContent = mensagem;
        errorDiv.style.display = 'block';
        setTimeout(() => { 
            if (errorDiv) errorDiv.style.display = 'none'; 
        }, 3000);
    }
}


// Helper: Nome do cargo
function getCargoNome(cargo) {
    const cargos = {
        'administrador': '👑 Administrador',
        'gerente': '📊 Gerente',
        'coordenador': '📋 Coordenador',
        'atendente': '🎯 Atendente',
        'producao': '🎬 Produção',
        'financeiro': '💰 Financeiro',
        'estoque': '📦 Estoque'
    };
    return cargos[cargo] || cargo || '👤 Usuário';
}

// Toggle senha
function toggleSenhaUsuario() {
    const senhaInput = document.getElementById('senha_usuario_sistema');
    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
    } else {
        senhaInput.type = 'password';
    }
}

// Exportar usuários
function exportarUsuariosSistema() {
    if (usuariosSistema.length === 0) {
        mostrarAlertaUsuario('Nenhum usuário para exportar!', 'error');
        return;
    }
    
    let csv = "ID,Nome,Login,CPF,Email,Telefone,Cargo,Status,Data Cadastro\n";
    usuariosSistema.forEach(user => {
        csv += `"${user.id}","${user.nome}","${user.login}","${user.cpf || ''}","${user.email || ''}","${user.telefone || ''}","${getCargoNome(user.cargo)}","${user.status}","${user.data_cadastro || ''}"\n`;
    });
    
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'usuarios_sistema.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    mostrarAlertaUsuario('📤 Usuários exportados com sucesso!', 'success');
}
// ==================== PERSISTÊNCIA DE PÁGINA ATIVA ====================
// ==================== scriptindex.js - VERSÃO CORRIGIDA COM PERSISTÊNCIA ====================

// ==================== PERSISTÊNCIA DE PÁGINA ATIVA ====================

// Salvar a página atual no sessionStorage
function salvarPaginaAtiva(pageId) {
    if (pageId && pageId !== 'login') {
        sessionStorage.setItem('paginaAtiva', pageId);
        console.log(`📌 Página salva: ${pageId}`);
    }
}

// Recuperar a última página ativa
function recuperarPaginaAtiva() {
    return sessionStorage.getItem('paginaAtiva');
}

// Navegar para uma página específica e salvar
function navegarParaPagina(pageId, event) {
    if (event) event.preventDefault();
    
    console.log(`🔍 Navegando para: ${pageId}`);
    
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Mostrar a página selecionada
    const paginaSelecionada = document.getElementById(pageId);
    if (paginaSelecionada) {
        paginaSelecionada.classList.add('active');
        paginaSelecionada.style.display = 'block';
        
        // Salvar no sessionStorage
        salvarPaginaAtiva(pageId);
        
        // Atualizar menu ativo
        atualizarMenuAtivo(pageId);
        
        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Disparar eventos específicos da página
        dispararEventosPagina(pageId);
        
        console.log(`✅ Página exibida: ${pageId}`);
    } else {
        console.error(`❌ Página não encontrada: ${pageId}`);
    }
}

// Atualizar visual do menu ativo
function atualizarMenuAtivo(pageId) {
    // Remover active de todos os botões de navegação
    document.querySelectorAll('.nav-btn, .nav-subbtn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Remover active também dos itens de menu (se houver)
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Adicionar active ao botão correspondente
    const activeBtn = document.querySelector(`[data-page="${pageId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Também marcar o grupo pai como expandido se necessário
    const btnPai = activeBtn?.closest('.nav-group')?.querySelector('[data-toggle]');
    if (btnPai) {
        const menuId = btnPai.getAttribute('data-toggle');
        const submenu = document.getElementById(menuId);
        if (submenu && submenu.style.display !== 'block') {
            // Fechar outros submenus
            document.querySelectorAll('.sidebar-submenu').forEach(sm => {
                sm.style.display = 'none';
            });
            submenu.style.display = 'block';
        }
    }
}

// Disparar eventos específicos quando uma página é carregada
function dispararEventosPagina(pageId) {
    // Inicializar IDs nos formulários de cadastro
    if (typeof window.inicializarIDFormulario === 'function') {
        const pageToEntidade = {
            'clientes': 'clientes',
            'casa_de_festas': 'casa_de_festas',
            'elenco': 'elenco',
            'personagens': 'personagens',
            'motoristas': 'motoristas',
            'fornecedores': 'fornecedores',
            'funcionarios': 'funcionarios'
        };
        const entidade = pageToEntidade[pageId];
        if (entidade) {
            window.inicializarIDFormulario(entidade);
        }
    }
    
    // Carregar relatórios
    if (pageId.startsWith('relatorio_') && typeof carregarRelatorio === 'function') {
        setTimeout(() => carregarRelatorio(pageId), 100);
    }
    
    // Configurar checklist
    if (pageId === 'criar_checklist') {
        setTimeout(() => {
            if (typeof carregarPersonagensNoDropdown === 'function') {
                carregarPersonagensNoDropdown();
            }
        }, 100);
    }
    
    // Configurar elenco (faz drive)
    if (pageId === 'elenco') {
        setTimeout(() => {
            if (typeof configurarFazDriveEvent === 'function') {
                configurarFazDriveEvent();
            }
        }, 100);
    }
}

// Restaurar a última página ao carregar o sistema
function restaurarPaginaAnterior() {
    const paginaSalva = recuperarPaginaAtiva();
    
    if (paginaSalva) {
        const paginaElemento = document.getElementById(paginaSalva);
        if (paginaElemento) {
            console.log(`🔄 Restaurando página: ${paginaSalva}`);
            navegarParaPagina(paginaSalva);
            return true;
        } else {
            console.warn(`⚠️ Página salva "${paginaSalva}" não encontrada`);
        }
    }
    
    // Se não houver página salva, vai para o dashboard
    console.log('📌 Nenhuma página salva, indo para o dashboard');
    navegarParaPagina('dashboard');
    return false;
}

// ==================== FUNÇÕES DE NAVEGAÇÃO ORIGINAIS (ADAPTADAS) ====================

function showPage(pageId) {
    navegarParaPagina(pageId);
}

// ==================== CONFIGURAR MENU PERSISTENTE ====================

function configurarMenuPersistente() {
    console.log('🔧 Configurando menu persistente...');
    
    // Configurar botões principais e sub-botões
    document.querySelectorAll('[data-page]').forEach(button => {
        // Remover eventos antigos clonando
        const novoBotao = button.cloneNode(true);
        button.parentNode.replaceChild(novoBotao, button);
        
        // Adicionar novo evento
        novoBotao.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                navegarParaPagina(pageId, e);
            }
        });
    });
    
    // Configurar botões de toggle (submenus)
    document.querySelectorAll('[data-toggle]').forEach(button => {
        // Remover eventos antigos
        const novoBotao = button.cloneNode(true);
        button.parentNode.replaceChild(novoBotao, button);
        
        // Adicionar novo evento
        novoBotao.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const menuId = this.getAttribute('data-toggle');
            const menu = document.getElementById(menuId);
            if (menu) {
                const isVisible = menu.style.display === 'block';
                // Fechar todos os submenus
                document.querySelectorAll('.sidebar-submenu').forEach(submenu => {
                    submenu.style.display = 'none';
                });
                // Abrir o clicado se não estava visível
                if (!isVisible) {
                    menu.style.display = 'block';
                }
            }
        });
    });
    
    console.log('✅ Menu persistente configurado');
}

// ==================== SALVAR PÁGINA ANTES DE FECHAR ====================

function configurarSalvamentoAntesFechar() {
    window.addEventListener('beforeunload', function() {
        const paginaAtiva = document.querySelector('.page.active');
        if (paginaAtiva && paginaAtiva.id && paginaAtiva.id !== 'login') {
            sessionStorage.setItem('paginaAtiva', paginaAtiva.id);
            console.log(`💾 Página salva antes de fechar: ${paginaAtiva.id}`);
        }
    });
}

// ==================== FUNÇÕES DE BOTÕES VOLTAR PARA RELATÓRIOS ====================

// Função para voltar ao relatório após editar
function voltarParaRelatorio(entidade) {
    const paginaRelatorio = `relatorio_${entidade}`;
    salvarPaginaAtiva(paginaRelatorio);
    navegarParaPagina(paginaRelatorio);
}

// Função para editar e voltar corretamente
function editarRegistro(entidade, dados) {
    // Salvar a página atual (relatório) para poder voltar depois
    const paginaAtual = document.querySelector('.page.active');
    if (paginaAtual) {
        sessionStorage.setItem('paginaAnterior', paginaAtual.id);
    }
    
    // Salvar os dados para edição
    sessionStorage.setItem(`editar${entidade.charAt(0).toUpperCase() + entidade.slice(1)}Dados`, JSON.stringify(dados));
    sessionStorage.setItem(`editar${entidade.charAt(0).toUpperCase() + entidade.slice(1)}Id`, dados.id);
    
    // Ir para o formulário de cadastro
    navegarParaPagina(entidade);
}

// Função para voltar após salvar/editar
function voltarAposSalvar(entidade) {
    const paginaAnterior = sessionStorage.getItem('paginaAnterior');
    
    if (paginaAnterior && paginaAnterior !== entidade) {
        // Voltar para a página anterior (relatório)
        navegarParaPagina(paginaAnterior);
        sessionStorage.removeItem('paginaAnterior');
    } else {
        // Se não tiver página anterior, vai para o relatório correspondente
        navegarParaPagina(`relatorio_${entidade}`);
    }
}

// ==================== FUNÇÕES DE CÁLCULO DE IDADE (DO FORMULARIO.JS) ====================

function calcularIdade(dataNascimento) {
    if (!dataNascimento) return '';
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    
    if (isNaN(nascimento.getTime())) return '';
    
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesDiff = hoje.getMonth() - nascimento.getMonth();
    
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    
    return idade >= 0 ? idade : '';
}

function calcularTempoEmpresa(dataAbertura) {
    if (!dataAbertura) return '';
    
    const hoje = new Date();
    const abertura = new Date(dataAbertura);
    
    if (isNaN(abertura.getTime())) return '';
    
    let anos = hoje.getFullYear() - abertura.getFullYear();
    const mesDiff = hoje.getMonth() - abertura.getMonth();
    
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < abertura.getDate())) {
        anos--;
    }
    
    return anos >= 0 ? anos : '';
}

function calcularIdadeOuTempo(tipo, element = null) {
    console.log(`📊 Calculando idade/tempo para: ${tipo}`);
    
    let dataValue = '';
    let campoIdade = null;
    
    if (element && element.value !== undefined) {
        dataValue = element.value;
        const dataId = element.id;
        if (dataId.includes('data_nascimento')) {
            const idadeId = dataId.replace('data_nascimento', 'idade');
            campoIdade = document.getElementById(idadeId);
        } else if (dataId.includes('data_abertura')) {
            const idadeId = dataId.replace('data_abertura', 'idade');
            campoIdade = document.getElementById(idadeId);
        }
    } else {
        const mapeamento = {
            'clientes': { dataId: 'data_nascimento_clientes', idadeId: 'idade_clientes', tipoCalculo: 'idade' },
            'elenco': { dataId: 'data_nascimento_elenco', idadeId: 'idade_elenco', tipoCalculo: 'idade' },
            'motoristas': { dataId: 'data_nascimento_motoristas', idadeId: 'idade_motoristas', tipoCalculo: 'idade' },
            'funcionarios': { dataId: 'data_nascimento_funcionarios', idadeId: 'idade_funcionarios', tipoCalculo: 'idade' },
            'fornecedores': { dataId: 'data_abertura_fornecedores', idadeId: 'idade_fornecedores', tipoCalculo: 'tempo' },
            'casa_de_festas': { dataId: 'data_abertura_casa_de_festas', idadeId: 'idade_casa_de_festas', tipoCalculo: 'tempo' }
        };
        
        const config = mapeamento[tipo];
        if (config) {
            const dataInput = document.getElementById(config.dataId);
            if (dataInput) {
                dataValue = dataInput.value;
                campoIdade = document.getElementById(config.idadeId);
            }
        }
    }
    
    if (!campoIdade) return '';
    if (!dataValue) {
        campoIdade.value = '';
        return '';
    }
    
    let resultado;
    if (tipo === 'fornecedores' || tipo === 'casa_de_festas') {
        resultado = calcularTempoEmpresa(dataValue);
        campoIdade.value = resultado ? `${resultado} anos` : '';
    } else {
        resultado = calcularIdade(dataValue);
        campoIdade.value = resultado ? `${resultado} anos` : '';
    }
    
    return resultado;
}

// ==================== INICIALIZAÇÃO PRINCIPAL ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de navegação persistente...');
    
    // Verificar login no sessionStorage
    let empresaLogada = null;
    let pastaAtual = null;
    
    try {
        const empresaStr = sessionStorage.getItem('empresa_logada');
        const pastaStr = sessionStorage.getItem('pasta_atual');
        
        if (empresaStr && empresaStr !== 'null' && empresaStr !== 'undefined') {
            empresaLogada = JSON.parse(empresaStr);
        }
        
        if (pastaStr && pastaStr !== 'null' && pastaStr !== 'undefined') {
            pastaAtual = pastaStr;
        }
    } catch(e) {
        console.error('Erro ao ler sessionStorage:', e);
    }
    
    // Verificar se está logado
    const temDadosValidos = (empresaLogada && empresaLogada.id && empresaLogada.login && pastaAtual);
    
    if (!temDadosValidos) {
        console.log('❌ SEM DADOS VÁLIDOS - Redirecionando para login');
        const destino = pastaAtual ? pastaAtual + '/login.html' : 'login.html';
        window.location.href = destino;
        return;
    }
    
    console.log('✅ Logado:', empresaLogada.nome);
    window.pastaAtual = pastaAtual;
    window.empresaLogada = empresaLogada;
    
    // Configurar nome do usuário na interface
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) {
        userNameSpan.textContent = empresaLogada.nome || empresaLogada.login;
    }
    
    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = function(e) {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        };
    }
    
    // Inicializar relógio
    function updateClock() {
        const clock = document.getElementById('userClock');
        if (clock) {
            clock.textContent = new Date().toLocaleTimeString('pt-BR');
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
    
    // Configurar menu persistente
    configurarMenuPersistente();
    
    // Configurar salvamento antes de fechar
    configurarSalvamentoAntesFechar();
    
    // Restaurar a última página ativa
    restaurarPaginaAnterior();
    
    // Configurar sidebar mobile
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (hamburgerBtn && sidebar && overlay) {
        hamburgerBtn.addEventListener('click', function() {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });
        
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
    
    console.log('✅ Sistema inicializado com sucesso!');
});

// ==================== FUNÇÕES AUXILIARES ====================

function gerarID(formulario) {
    const prefixos = {
        'clientes': 'CLI', 'casa_de_festas': 'CF', 'elenco': 'EL',
        'personagens': 'PER', 'motoristas': 'MOT', 'fornecedores': 'FOR',
        'funcionarios': 'FUNC', 'usuarios': 'USR', 'eventos': 'EV'
    };
    const prefixo = prefixos[formulario] || 'ID';
    const ano = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefixo}-${ano}${timestamp}-${random}`;
}

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

function mostrarMensagemSucesso(mensagem) {
    const div = document.createElement('div');
    div.innerHTML = `<div style="position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:15px 20px;border-radius:5px;z-index:9999;">${mensagem}</div>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Exportar funções para uso global
window.showPage = showPage;
window.navegarParaPagina = navegarParaPagina;
window.salvarPaginaAtiva = salvarPaginaAtiva;
window.recuperarPaginaAtiva = recuperarPaginaAtiva;
window.voltarParaRelatorio = voltarParaRelatorio;
window.editarRegistro = editarRegistro;
window.voltarAposSalvar = voltarAposSalvar;
window.calcularIdadeOuTempo = calcularIdadeOuTempo;
window.gerarID = gerarID;

console.log('✅ scriptindex.js carregado com sucesso!');