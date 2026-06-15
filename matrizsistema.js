// ==================== SISTEMA MATRIZ - GESTÃO DE ACESSO APP ====================

let usuariosAutorizados = [];
let empresasCadastradas = [];
let logsAtividades = [];
let empresasCredenciais = [];
let registrosAlteracoes = [];

function init() {
    carregarDados();
    renderizarEmpresas();
    renderizarUsuarios();
    renderizarRegistros();
    inicializarAbas();
}

function inicializarAbas() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            if (tabId) {
                mudarTab(tab, tabId);
            }
        });
    });
}

function carregarDados() {
    const empresasSalvas = localStorage.getItem('matriz_empresas');
    empresasCadastradas = empresasSalvas ? JSON.parse(empresasSalvas) : [];
    
    const usuariosSalvos = localStorage.getItem('matriz_usuarios_app_autorizados') || localStorage.getItem('matriz_usuarios_autorizados');
    usuariosAutorizados = usuariosSalvos ? JSON.parse(usuariosSalvos) : [];
    
    const logsSalvos = localStorage.getItem('matriz_logs_atividades');
    logsAtividades = logsSalvos ? JSON.parse(logsSalvos) : [];
    
    const credenciaisSalvas = localStorage.getItem('matriz_empresas_credenciais');
    empresasCredenciais = credenciaisSalvas ? JSON.parse(credenciaisSalvas) : [];
    
    const registrosSalvos = localStorage.getItem('matriz_registros_alteracoes');
    registrosAlteracoes = registrosSalvos ? JSON.parse(registrosSalvos) : [];
}

function salvarEmpresas() {
    localStorage.setItem('matriz_empresas', JSON.stringify(empresasCadastradas));
}

function salvarUsuarios() {
    const usuariosJson = JSON.stringify(usuariosAutorizados);
    localStorage.setItem('matriz_usuarios_autorizados', usuariosJson);
    localStorage.setItem('matriz_usuarios_app_autorizados', usuariosJson);
    sincronizarComAppUsuario();
}

function salvarLogs() {
    localStorage.setItem('matriz_logs_atividades', JSON.stringify(logsAtividades));
}

function salvarEmpresasCredenciais() {
    localStorage.setItem('matriz_empresas_credenciais', JSON.stringify(empresasCredenciais));
}

function sincronizarComAppUsuario() {
    usuariosAutorizados.forEach(usuario => {
        const key = `autorizacoes_usuario_${usuario.cpf}`;
        localStorage.setItem(key, JSON.stringify({
            cpf_usuario: usuario.cpf,
            empresas_autorizadas: usuario.empresas,
            ultima_sincronizacao: new Date().toISOString()
        }));
    });
}

function formatarCPF(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 11) {
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        input.value = valor;
    }
}

function formatarCPFExibir(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarCNPJ(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 14) {
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
        input.value = valor;
    }
}

function renderizarEmpresas() {
    const tbody = document.getElementById('listaEmpresas');
    
    if (empresasCadastradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhuma empresa cadastrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = empresasCadastradas.map(emp => {
        const credencial = empresasCredenciais.find(c => c.id_empresa === emp.id);
        const statusSenha = credencial ? (credencial.senha_provisoria ? '⚠️ Provisória' : '✅ Definida') : '❌ Não definida';
        const statusColor = credencial ? (credencial.senha_provisoria ? '#ffc107' : '#28a745') : '#dc3545';
        
        return `
            <tr>
                <td data-label="ID">${emp.id}</td>
                <td data-label="Nome">
                    <span style="display: inline-block; width: 12px; height: 12px; background: ${emp.cor}; border-radius: 2px; margin-right: 8px;"></span>
                    ${emp.nome}
                </td>
                <td data-label="CNPJ">${emp.cnpj}</td>
                <td data-label="Pasta">📁 ${emp.pastaSistema || 'Não definida'}</td>
                <td data-label="Login">${credencial ? credencial.login : '-'}</td>
                <td data-label="Status Senha">
                    <span style="color: ${statusColor}; font-weight: bold;">${statusSenha}</span>
                </td>
                <td data-label="Ações">
                    <button class="btn-acao" onclick="editarCredenciais('${emp.id}')" title="Editar">✏️</button>
                    <button class="btn-acao btn-danger" onclick="excluirEmpresa('${emp.id}')" title="Excluir">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderizarUsuarios(filtro = '') {
    const tbody = document.getElementById('listaUsuarios');
    
    let usuariosFiltrados = usuariosAutorizados;
    if (filtro) {
        usuariosFiltrados = usuariosAutorizados.filter(u => 
            u.cpf.includes(filtro) || 
            u.nome.toLowerCase().includes(filtro.toLowerCase())
        );
    }
    
    if (usuariosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum usuário encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = usuariosFiltrados.map(usuario => `
        <tr>
            <td data-label="CPF">${formatarCPFExibir(usuario.cpf)}</td>
            <td data-label="Nome">${usuario.nome}</td>
            <td data-label="Empresas">
                ${usuario.empresas.map(e => `<span style="display: inline-block; margin: 2px;">🏢 ${e.nome_empresa}</span>`).join('<br>')}
            </td>
            <td data-label="Cargo">${usuario.empresas[0]?.cargo || '-'}</td>
            <td data-label="Status">
                <span class="status-badge status-ativo">Ativo</span>
            </td>
            <td data-label="Ações">
                <button class="btn-acao btn-danger" onclick="removerUsuario('${usuario.cpf}')">🔒 Remover</button>
            </td>
        </tr>
    `).join('');
}

function removerUsuario(cpf) {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;
    usuariosAutorizados = usuariosAutorizados.filter(u => u.cpf !== cpf);
    salvarUsuarios();
    renderizarUsuarios();
}

function renderizarRegistros() {
    const tbody = document.getElementById('listaRegistros');
    
    if (registrosAlteracoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum registro encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = registrosAlteracoes.reverse().map(reg => `
        <tr>
            <td data-label="Data">${reg.data}</td>
            <td data-label="Empresa">${reg.empresa}</td>
            <td data-label="Login Antigo">${reg.login_antigo}</td>
            <td data-label="Login Novo">${reg.login_novo}</td>
            <td data-label="Status">${reg.status}</td>
        </tr>
    `).join('');
}

function editarCredenciais(idEmpresa) {
    const empresa = empresasCadastradas.find(e => e.id === idEmpresa);
    const credencial = empresasCredenciais.find(c => c.id_empresa === idEmpresa);
    
    const novoLogin = prompt('Digite o novo login da empresa:', credencial?.login || '');
    const novaSenha = prompt('Digite a nova senha da empresa:');
    
    if (novoLogin && novaSenha) {
        const index = empresasCredenciais.findIndex(c => c.id_empresa === idEmpresa);
        
        if (index !== -1) {
            const credencialAntiga = {...empresasCredenciais[index]};
            empresasCredenciais[index].login = novoLogin;
            empresasCredenciais[index].senha = novaSenha;
            empresasCredenciais[index].senha_provisoria = false;
            empresasCredenciais[index].data_atualizacao = new Date().toISOString();
            
            salvarEmpresasCredenciais();
            
            registrosAlteracoes.push({
                id: Date.now(),
                empresa: empresa.nome,
                login_antigo: credencialAntiga.login,
                login_novo: novoLogin,
                data: new Date().toLocaleString(),
                status: 'Credenciais alteradas pelo admin'
            });
            localStorage.setItem('matriz_registros_alteracoes', JSON.stringify(registrosAlteracoes));
            
            atualizarLoginHTML(empresa.pastaSistema, idEmpresa, novoLogin, novaSenha);
            
            renderizarEmpresas();
            renderizarRegistros();
            alert('✅ Credenciais atualizadas com sucesso!');
        }
    }
}

function atualizarLoginHTML(pasta, idEmpresa, novoLogin, novaSenha) {
    const empresasLogin = JSON.parse(localStorage.getItem(`empresas_login_${pasta}`) || '[]');
    const index = empresasLogin.findIndex(e => e.id === idEmpresa);
    if (index !== -1) {
        empresasLogin[index].login = novoLogin;
        empresasLogin[index].senha = novaSenha;
        empresasLogin[index].senha_provisoria = false;
        localStorage.setItem(`empresas_login_${pasta}`, JSON.stringify(empresasLogin));
    }
}

function excluirEmpresa(id) {
    if (!confirm('Tem certeza? Isso removerá o acesso de todos os usuários a esta empresa.')) return;
    
    const empresa = empresasCadastradas.find(e => e.id === id);
    
    empresasCadastradas = empresasCadastradas.filter(e => e.id !== id);
    empresasCredenciais = empresasCredenciais.filter(c => c.id_empresa !== id);
    
    usuariosAutorizados.forEach(usuario => {
        usuario.empresas = usuario.empresas.filter(e => e.id_empresa !== id);
    });
    
    if (empresa) {
        const empresasLogin = JSON.parse(localStorage.getItem(`empresas_login_${empresa.pastaSistema}`) || '[]');
        const novasEmpresasLogin = empresasLogin.filter(e => e.id !== id);
        localStorage.setItem(`empresas_login_${empresa.pastaSistema}`, JSON.stringify(novasEmpresasLogin));
    }
    
    salvarEmpresas();
    salvarEmpresasCredenciais();
    salvarUsuarios();
    renderizarEmpresas();
    renderizarUsuarios();
    
    alert('✅ Empresa removida com sucesso!');
}

function mudarTab(button, tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    button.classList.add('active');
    const tabElement = document.getElementById(`tab-${tabId}`);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    if (tabId === 'registros') renderizarRegistros();
}

function salvarEmpresa() {
    const nome = document.getElementById('novaEmpresaNome').value;
    const cnpj = document.getElementById('novaEmpresaCnpj').value;
    const cpfTitular = document.getElementById('novaEmpresaCpfTitular').value;
    const login = document.getElementById('novaEmpresaLogin').value;
    const senha = document.getElementById('novaEmpresaSenha').value;
    const pastaSistema = document.getElementById('novaEmpresaPasta').value;
    const cor = document.getElementById('novaEmpresaCor').value;
    
    if (!nome || !cnpj || !cpfTitular || !login || !senha || !pastaSistema) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }
    
    if (empresasCadastradas.find(e => e.cnpj === cnpj)) {
        alert('CNPJ já cadastrado!');
        return;
    }
    
    if (empresasCredenciais.find(c => c.login === login)) {
        alert('Login já existe!');
        return;
    }
    
    const id = 'emp_' + Date.now();
    
    empresasCadastradas.push({
        id: id,
        nome: nome,
        cnpj: cnpj,
        cpf_titular: cpfTitular.replace(/\D/g, ''),
        pastaSistema: pastaSistema,
        cor: cor,
        dataCadastro: new Date().toISOString()
    });
    
    empresasCredenciais.push({
        id_empresa: id,
        login: login,
        senha: senha,
        senha_provisoria: true,
        data_criacao: new Date().toISOString()
    });
    
    salvarEmpresas();
    salvarEmpresasCredenciais();
    
    const empresasLogin = JSON.parse(localStorage.getItem(`empresas_login_${pastaSistema}`) || '[]');
    empresasLogin.push({
        id: id,
        nome: nome,
        login: login,
        senha: senha,
        senha_provisoria: true,
        pasta: pastaSistema
    });
    localStorage.setItem(`empresas_login_${pastaSistema}`, JSON.stringify(empresasLogin));
    
    limparFormularioEmpresa();
    renderizarEmpresas();
    alert('✅ Empresa cadastrada com sucesso!');
}

function limparFormularioEmpresa() {
    document.getElementById('novaEmpresaNome').value = '';
    document.getElementById('novaEmpresaCnpj').value = '';
    document.getElementById('novaEmpresaCpfTitular').value = '';
    document.getElementById('novaEmpresaLogin').value = '';
    document.getElementById('novaEmpresaSenha').value = '';
    document.getElementById('novaEmpresaPasta').value = '';
    document.getElementById('novaEmpresaCor').value = '#667eea';
}

function filtrarUsuarios() {
    const search = document.getElementById('searchUsuario').value;
    renderizarUsuarios(search);
}

document.addEventListener('DOMContentLoaded', init);