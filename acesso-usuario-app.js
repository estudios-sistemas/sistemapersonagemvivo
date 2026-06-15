// ==================== ACESSO USUÁRIO APP - VERSÃO CORRIGIDA ====================

// Função para obter a empresa logada
function getEmpresaLogada() {
    try {
        const empresaStr = sessionStorage.getItem('empresa_logada');
        if (empresaStr && empresaStr !== 'null' && empresaStr !== 'undefined') {
            const obj = JSON.parse(empresaStr);
            // Se for funcionário, resolver o id real da empresa
            if (obj && obj.tipo === 'funcionario' && obj.pasta) {
                const lista = JSON.parse(localStorage.getItem('matriz_usuarios_app_autorizados') || '[]');
                const emp = lista.find(u => u.pasta === obj.pasta);
                if (emp) return { id: emp.id, nome: emp.nome, pasta: obj.pasta };
                return { id: obj.pasta.replace(/\s+/g,'_'), nome: obj.pasta, pasta: obj.pasta };
            }
            return obj;
        }
    } catch(e) {
        console.error('Erro ao obter empresa:', e);
    }
    return null;
}

// Função para obter o ID da empresa atual
function getEmpresaId() {
    const empresa = getEmpresaLogada();
    return empresa ? empresa.id : null;
}

// Função para obter a pasta da empresa
function getEmpresaPasta() {
    const empresa = getEmpresaLogada();
    return empresa ? empresa.pasta : null;
}

// Trocar aba
function abrirTabUsuarioApp(aba) {
    const conteudos = document.querySelectorAll('#conteudo-usuario-app .tab-content');
    conteudos.forEach(tab => {
        tab.style.display = 'none';
    });
    
    const botoes = document.querySelectorAll('#acesso_usuario_app .tab-btn');
    botoes.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const abaElement = document.getElementById(`tab-${aba}`);
    if (abaElement) {
        abaElement.style.display = 'block';
    }
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Se for a aba de cadastro, carregar os tipos disponíveis
    if (aba === 'cadastro') {
        carregarTiposDisponiveis();
    }
}

// Carregar tipos disponíveis (sempre ativos, sem texto "(Nenhum cadastrado)")
function carregarTiposDisponiveis() {
    const tipoSelect = document.getElementById('tipo_usuario_cadastro');
    if (!tipoSelect) return;
    
    // Garantir que as opções estão sempre ativas
    const optionElenco = tipoSelect.querySelector('option[value="elenco"]');
    const optionMotorista = tipoSelect.querySelector('option[value="motorista"]');
    
    if (optionElenco) {
        optionElenco.disabled = false;
        optionElenco.textContent = '🎭 Elenco';
    }
    
    if (optionMotorista) {
        optionMotorista.disabled = false;
        optionMotorista.textContent = '🚗 Motorista';
    }
    
    // Remover mensagem de aviso se existir
    const aviso = document.getElementById('msgSemCadastros');
    if (aviso) aviso.remove();
}

// CARREGAR DADOS DE ELENCO E MOTORISTAS DAS CHAVES CORRETAS
function carregarDadosCadastros() {
    const empresa = getEmpresaLogada();
    if (!empresa) {
        console.error('❌ Empresa não encontrada');
        return { elenco: [], motoristas: [] };
    }
    
    const possiveisChavesElenco = [
        `${empresa.id}_elenco_cadastrados`,
        `elenco_${empresa.id}`,
        `elenco_cadastrados_${empresa.id}`,
        `${empresa.pasta}_elenco`,
        `elenco_cadastrados`
    ];
    
    const possiveisChavesMotoristas = [
        `${empresa.id}_motoristas`,
        `motoristas_${empresa.id}`,
        `motoristas_cadastrados_${empresa.id}`,
        `${empresa.pasta}_motoristas`,
        `motoristas_cadastrados`
    ];
    
    let elenco = [];
    let motoristas = [];
    
    // Buscar elenco
    for (const chave of possiveisChavesElenco) {
        const dados = localStorage.getItem(chave);
        if (dados && dados !== '[]') {
            elenco = JSON.parse(dados);
            console.log(`✅ Elenco encontrado na chave: ${chave} (${elenco.length} registros)`);
            break;
        }
    }
    
    // Buscar motoristas
    for (const chave of possiveisChavesMotoristas) {
        const dados = localStorage.getItem(chave);
        if (dados && dados !== '[]') {
            motoristas = JSON.parse(dados);
            console.log(`✅ Motoristas encontrados na chave: ${chave} (${motoristas.length} registros)`);
            break;
        }
    }
    
    console.log(`📊 Total: ${elenco.length} elenco(s), ${motoristas.length} motorista(s)`);
    
    return { elenco, motoristas };
}

// Carregar usuários disponíveis para cadastro baseado no tipo selecionado
function carregarUsuariosDisponiveis() {
    const tipo = document.getElementById('tipo_usuario_cadastro').value;
    const selectUsuario = document.getElementById('select_usuario_app');
    const container = document.getElementById('selectUsuarioContainer');
    
    if (!tipo) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    selectUsuario.innerHTML = '<option value="">— Selecione —</option>';
    
    const { elenco, motoristas } = carregarDadosCadastros();
    
    let usuarios = [];
    
    if (tipo === 'elenco') {
        usuarios = elenco;
        console.log(`🎭 Carregando ${usuarios.length} membros do elenco`);
    } else if (tipo === 'motorista') {
        usuarios = motoristas;
        console.log(`🚗 Carregando ${usuarios.length} motoristas`);
    }
    
    if (usuarios.length === 0) {
        selectUsuario.innerHTML = '<option value="">— Nenhum usuário encontrado —</option>';
        const msg = tipo === 'elenco' 
            ? 'Nenhum membro do elenco cadastrado. Cadastre elenco primeiro!' 
            : 'Nenhum motorista cadastrado. Cadastre motoristas primeiro!';
        alert(msg);
        return;
    }
    
    usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = JSON.stringify(usuario);
        const nome = usuario.nome_elenco || usuario.nome_motoristas || usuario.nome || usuario.nome_completo || 'Sem nome';
        option.textContent = nome;
        selectUsuario.appendChild(option);
    });
    
    console.log(`✅ ${usuarios.length} usuários carregados no select`);
}

// Preencher dados do usuário selecionado
function preencherDadosUsuarioApp() {
    const selectUsuario = document.getElementById('select_usuario_app');
    const dadosContainer = document.getElementById('dadosUsuarioApp');
    
    if (!selectUsuario || !selectUsuario.value) {
        if (dadosContainer) dadosContainer.style.display = 'none';
        return;
    }
    
    try {
        const usuario = JSON.parse(selectUsuario.value);
        
        const nome = usuario.nome_elenco || usuario.nome_motoristas || usuario.nome || usuario.nome_completo || '-';
        const cpf = usuario.cpf || usuario.doc_elenco_cadastro || usuario.doc_motoristas_cadastro || 
                    usuario.cpf_motorista || usuario.cpf_elenco || '-';
        const telefone = usuario.telefone_elenco || usuario.telefone_motoristas || usuario.telefone || '-';
        
        document.getElementById('nome_usuario_app').textContent = nome;
        document.getElementById('cpf_usuario_app').textContent = cpf;
        document.getElementById('telefone_usuario_app').textContent = telefone;
        
        dadosContainer.style.display = 'block';
        console.log(`✅ Dados carregados: ${nome} (CPF: ${cpf})`);
    } catch(e) {
        console.error('Erro ao processar dados do usuário:', e);
        dadosContainer.style.display = 'none';
    }
}

// Cadastrar usuário do app
function cadastrarUsuarioApp() {
    const tipo = document.getElementById('tipo_usuario_cadastro').value;
    const selectUsuario = document.getElementById('select_usuario_app');
    
    if (!tipo || !selectUsuario || !selectUsuario.value) {
        alert('❌ Preencha todos os campos! Selecione um tipo e um usuário.');
        return;
    }
    
    let usuario;
    try {
        usuario = JSON.parse(selectUsuario.value);
    } catch(e) {
        alert('❌ Erro ao processar dados do usuário!');
        return;
    }
    
    const empresaId = getEmpresaId();
    if (!empresaId) {
        alert('❌ Empresa não identificada! Faça login novamente.');
        return;
    }
    
    let cpf = usuario.cpf || usuario.doc_elenco_cadastro || usuario.doc_motoristas_cadastro ||
              usuario.cpf_motorista || usuario.cpf_elenco;
    
    if (cpf) {
        cpf = String(cpf).replace(/\D/g, '');
    }
    
    if (!cpf || cpf.length !== 11) {
        alert('❌ CPF inválido ou não encontrado para este usuário! Verifique se o cadastro possui CPF válido.');
        return;
    }
    
    const usuariosAppKey = `usuarios_app_${empresaId}`;
    let usuariosApp = JSON.parse(localStorage.getItem(usuariosAppKey) || '[]');
    
    // Verificar duplicata
    const existe = usuariosApp.find(u => u.cpf === cpf && u.tipo === tipo);
    if (existe) {
        alert(`⚠️ Este CPF (${cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}) já está cadastrado como ${existe.tipo === 'elenco' ? 'Elenco' : 'Motorista'}!`);
        return;
    }
    
    const nome = usuario.nome_elenco || usuario.nome_motoristas || usuario.nome || usuario.nome_completo;
    
    if (!nome) {
        alert('❌ Nome não encontrado para este usuário!');
        return;
    }
    
    const idOriginal = usuario.id || usuario.ID_elenco || usuario.ID_motoristas || 
                       usuario.ID || Date.now();
    
    const novoUsuario = {
        id: cpf,
        cpf: cpf,
        nome: nome,
        tipo: tipo,
        id_original: idOriginal,
        dataCadastro: new Date().toISOString()
    };
    
    usuariosApp.push(novoUsuario);
    localStorage.setItem(usuariosAppKey, JSON.stringify(usuariosApp));
    
    console.log(`✅ Usuário cadastrado: ${nome} (CPF: ${cpf})`);
    alert(`✅ Usuário "${nome}" cadastrado com sucesso! Agora ele pode fazer login no app.`);
    
    limparFormularioCadastroApp();
    
    // Atualizar a lista de usuários cadastrados se o modal estiver aberto
    const modalAberto = document.getElementById('modalUsuariosCadastrados');
    if (modalAberto) {
        abrirCadastroUsuarioApp();
    }
}

// Limpar formulário de cadastro
function limparFormularioCadastroApp() {
    const tipoSelect = document.getElementById('tipo_usuario_cadastro');
    if (tipoSelect) tipoSelect.value = '';
    
    const selectContainer = document.getElementById('selectUsuarioContainer');
    if (selectContainer) selectContainer.style.display = 'none';
    
    const dadosContainer = document.getElementById('dadosUsuarioApp');
    if (dadosContainer) dadosContainer.style.display = 'none';
    
    const selectUsuario = document.getElementById('select_usuario_app');
    if (selectUsuario) selectUsuario.innerHTML = '<option value="">— Selecione —</option>';
}

// Fazer login no app
function fazerLoginApp() {
    const cpfInput = document.getElementById('cpf_login_app');
    const tipo = document.getElementById('tipo_usuario_login').value;
    
    if (!cpfInput || !cpfInput.value || !tipo) {
        alert('❌ Preencha todos os campos!');
        return;
    }
    
    const cpf = cpfInput.value.replace(/\D/g, '');
    const empresaId = getEmpresaId();
    
    if (!empresaId) {
        alert('❌ Empresa não identificada! Faça login novamente.');
        return;
    }
    
    const usuariosAppKey = `usuarios_app_${empresaId}`;
    const usuariosApp = JSON.parse(localStorage.getItem(usuariosAppKey) || '[]');
    
    const usuario = usuariosApp.find(u => u.cpf === cpf && u.tipo === tipo);
    
    if (!usuario) {
        alert('❌ Usuário não encontrado! Verifique o CPF e o tipo de usuário.');
        return;
    }
    
    sessionStorage.setItem('usuario_logado_app', JSON.stringify(usuario));
    sessionStorage.setItem('usuario_app_logado', usuario.cpf);
    sessionStorage.setItem('usuario_logado', usuario.cpf);
    
    // Limpar cache e reinicializar sistema de mensagens para o usuário do app
    window.empresaLogada = null;
    _reinicializarSistemaMensagensApp();
    
    document.getElementById('tab-login').style.display = 'none';
    document.getElementById('tab-cadastro').style.display = 'none';
    document.getElementById('area-logada-app').style.display = 'block';
    
    document.getElementById('nome_logado').textContent = usuario.nome;
    document.getElementById('tipo_logado').textContent = usuario.tipo === 'elenco' ? '🎬 Elenco' : '🚗 Motorista';
    
    carregarMinhasEscalas();
    alert(`✅ Login realizado com sucesso! Bem-vindo(a), ${usuario.nome}!`);
}

// Fazer logout
function fazerLogoutApp() {
    sessionStorage.removeItem('usuario_logado_app');
    sessionStorage.removeItem('usuario_app_logado');
    sessionStorage.removeItem('usuario_logado');
    
    document.getElementById('tab-login').style.display = 'block';
    document.getElementById('area-logada-app').style.display = 'none';
    
    const loginForm = document.getElementById('formLoginApp');
    if (loginForm) loginForm.reset();
    
    alert('👋 Logout realizado!');
}

// Formatar CPF
function formatarCPF(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 11) {
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        input.value = valor;
    }
}

// Carregar minhas escalas (simplificado)
function carregarMinhasEscalas() {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario_logado_app') || '{}');
    
    if (!usuarioLogado.cpf) {
        console.log('Usuário não logado');
        return;
    }
    
    const tbody = document.getElementById('tabelaMinhasEscalas');
    if (!tbody) return;
    
    tbody.innerHTML = '<td><td colspan="10" style="text-align: center; padding: 2rem;">📋 Carregando escalas...</td></tr>';
    
    setTimeout(() => {
        tbody.innerHTML = '<td><td colspan="10" style="text-align: center; padding: 2rem;">✅ Sistema de escalas funcionando. Em breve serão exibidas suas escalas.</td></tr>';
    }, 500);
}

// Filtrar minhas escalas
function filtrarMinhasEscalas() {
    carregarMinhasEscalas();
}

// Abrir modal de usuários cadastrados
function abrirCadastroUsuarioApp() {
    const empresaId = getEmpresaId();
    if (!empresaId) {
        alert('❌ Empresa não identificada!');
        return;
    }
    
    const usuariosAppKey = `usuarios_app_${empresaId}`;
    const usuariosApp = JSON.parse(localStorage.getItem(usuariosAppKey) || '[]');
    
    let linhas = usuariosApp.length === 0
        ? '<tr><td colspan="4" style="text-align:center;padding:2rem;color:#999;">📭 Nenhum usuário cadastrado</td></tr>'
        : usuariosApp.map((u, i) => `
            <tr>
                <td style="padding:8px;border-bottom:1px solid #eee;">${u.nome || '-'}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;">${u.cpf ? u.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;">${u.tipo === 'elenco' ? '🎬 Elenco' : '🚗 Motorista'}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;"><button onclick="removerUsuarioApp(${i})" style="background:#dc3545;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;">🗑️</button></td>
            </tr>
        `).join('');
    
    const modalHtml = `
        <div id="modalUsuariosCadastrados" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;" onclick="if(event.target.id==='modalUsuariosCadastrados')document.getElementById('modalUsuariosCadastrados').remove()">
            <div style="background:white;border-radius:12px;max-width:700px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.2);" onclick="event.stopPropagation()">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;border-bottom:1px solid #dee2e6;background:#f8f9fa;">
                    <h3 style="margin:0;">👥 Usuários Cadastrados no App</h3>
                    <button onclick="document.getElementById('modalUsuariosCadastrados').remove()" style="background:#dc3545;color:white;border:none;padding:8px 15px;border-radius:6px;cursor:pointer;">✖ Fechar</button>
                </div>
                <div style="padding:1.5rem;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f8f9fa;border-bottom:2px solid #dee2e6;">
                                <th style="padding:10px;text-align:left;">Nome</th>
                                <th style="padding:10px;text-align:left;">CPF</th>
                                <th style="padding:10px;text-align:left;">Tipo</th>
                                <th style="padding:10px;text-align:left;">Ação</th>
                            </table>
                        </thead>
                        <tbody>${linhas}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Remover usuário do app
function removerUsuarioApp(index) {
    if (!confirm('⚠️ Remover acesso deste usuário? Esta ação não pode ser desfeita.')) return;
    
    const empresaId = getEmpresaId();
    if (!empresaId) return;
    
    const usuariosAppKey = `usuarios_app_${empresaId}`;
    const usuariosApp = JSON.parse(localStorage.getItem(usuariosAppKey) || '[]');
    
    const removido = usuariosApp[index];
    usuariosApp.splice(index, 1);
    localStorage.setItem(usuariosAppKey, JSON.stringify(usuariosApp));
    
    document.getElementById('modalUsuariosCadastrados')?.remove();
    alert(`✅ Usuário "${removido?.nome}" removido com sucesso!`);
    abrirCadastroUsuarioApp();
}

// Migrar usuários antigos que não têm campo 'id'
function migrarUsuariosAppSemId() {
    const empresaId = getEmpresaId();
    if (!empresaId) return;
    const key = `usuarios_app_${empresaId}`;
    const usuarios = JSON.parse(localStorage.getItem(key) || '[]');
    let alterado = false;
    usuarios.forEach(u => {
        if (!u.id && u.cpf) {
            u.id = u.cpf;
            alterado = true;
        }
    });
    if (alterado) localStorage.setItem(key, JSON.stringify(usuarios));
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Inicializando acesso-usuario-app.js...');
    
    migrarUsuariosAppSemId();
    
    // Verificar se há usuário logado
    const usuarioLogado = sessionStorage.getItem('usuario_logado_app');
    
    if (usuarioLogado) {
        try {
            const usuario = JSON.parse(usuarioLogado);
            
            const tabLogin = document.getElementById('tab-login');
            const tabCadastro = document.getElementById('tab-cadastro');
            const areaLogada = document.getElementById('area-logada-app');
            
            if (tabLogin) tabLogin.style.display = 'none';
            if (tabCadastro) tabCadastro.style.display = 'none';
            if (areaLogada) areaLogada.style.display = 'block';
            
            const nomeLogado = document.getElementById('nome_logado');
            const tipoLogado = document.getElementById('tipo_logado');
            
            if (nomeLogado) nomeLogado.textContent = usuario.nome;
            if (tipoLogado) tipoLogado.textContent = usuario.tipo === 'elenco' ? '🎬 Elenco' : '🚗 Motorista';
            
            carregarMinhasEscalas();
            
            // Limpar cache e reinicializar mensagens para usuário do app
            window.empresaLogada = null;
            _reinicializarSistemaMensagensApp();
        } catch(e) {
            console.error('Erro ao restaurar sessão do app:', e);
        }
    }
    
    // Carregar tipos disponíveis (sempre ativos)
    setTimeout(() => {
        carregarTiposDisponiveis();
    }, 500);
});

// Reinicializa o sistema de mensagens do zero para o usuário do app
// (remove botão antigo, para polling antigo, recria tudo com o contexto correto)
function _reinicializarSistemaMensagensApp() {
    // Parar polling anterior se existir
    if (window._pollingMensagensInterval) {
        clearInterval(window._pollingMensagensInterval);
        window._pollingMensagensInterval = null;
    }
    // Remover botão flutuante antigo para recriar com badge correto
    const btnAntigo = document.getElementById('chatFloatBtn');
    if (btnAntigo) btnAntigo.remove();
    // Fechar modal de chat se estiver aberto
    const modalAntigo = document.getElementById('chatModal');
    if (modalAntigo) modalAntigo.remove();
    // Reinicializar após pequeno delay para garantir sessionStorage atualizado
    setTimeout(() => {
        if (typeof window.inicializarMensagens === 'function') {
            window.inicializarMensagens();
        }
        // Atualizar badge de notificações do app
        if (typeof window.atualizarBadgeNotificacoes === 'function') {
            window.atualizarBadgeNotificacoes();
        }
        if (typeof window.iniciarVerificacaoNotificacoes === 'function') {
            window.iniciarVerificacaoNotificacoes();
        }
    }, 400);
}

// Exportar funções globais
window.abrirTabUsuarioApp = abrirTabUsuarioApp;
window.carregarUsuariosDisponiveis = carregarUsuariosDisponiveis;
window.preencherDadosUsuarioApp = preencherDadosUsuarioApp;
window.cadastrarUsuarioApp = cadastrarUsuarioApp;
window.limparFormularioCadastroApp = limparFormularioCadastroApp;
window.fazerLoginApp = fazerLoginApp;
window.fazerLogoutApp = fazerLogoutApp;
window.carregarMinhasEscalas = carregarMinhasEscalas;
window.filtrarMinhasEscalas = filtrarMinhasEscalas;
window.formatarCPF = formatarCPF;
window.abrirCadastroUsuarioApp = abrirCadastroUsuarioApp;
window.removerUsuarioApp = removerUsuarioApp;

console.log('✅ acesso-usuario-app.js carregado com sucesso!');