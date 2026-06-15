// ==================== CADASTROS.JS - CORREÇÃO DE IDs AUTOMÁTICOS ====================

// ==================== PREFIXOS DE ID ====================
const PREFIXOS_ID = {
    'clientes': 'CLI',
    'casa_de_festas': 'CF',
    'elenco': 'EL',
    'personagens': 'PER',
    'motoristas': 'MOT',
    'fornecedores': 'FOR',
    'funcionarios': 'FUNC',
    'eventos': 'EV',
    'usuarios': 'USR'
};

// Gerar ID com prefixo e ano — agora sequencial por entidade/ano/pasta
function gerarIDComPrefixo(entidade) {
    try {
        const prefixo = PREFIXOS_ID[entidade] || entidade.substring(0, 3).toUpperCase();
        const ano = new Date().getFullYear();

        // Determina a pasta/empresa atual para isolar sequências entre empresas
        let pasta = 'DEFAULT';
        try {
            const empresaStr = sessionStorage?.getItem('empresa_logada');
            if (empresaStr && empresaStr !== 'null' && empresaStr !== 'undefined') {
                const empresa = JSON.parse(empresaStr);
                pasta = empresa?.pasta || sessionStorage?.getItem('pasta_atual') || 'DEFAULT';
            } else {
                pasta = sessionStorage?.getItem('pasta_atual') || 'DEFAULT';
            }
        } catch (e) {
            console.warn('Aviso ao obter pasta:', e);
            pasta = 'DEFAULT';
        }

        // Limpar espaços e caracteres inválidos
        pasta = (pasta || 'DEFAULT').toString().replace(/[^a-zA-Z0-9_-]/g, '');
        if (!pasta) pasta = 'DEFAULT';

        const chaveSeq = `seq_${pasta}_${entidade}_${ano}`;
        let seq = parseInt(localStorage?.getItem(chaveSeq) || '0', 10) || 0;
        seq = seq + 1;
        localStorage?.setItem(chaveSeq, seq.toString());

        const sequencial = String(seq).padStart(4, '0');
        const novoId = `${prefixo}-${ano}-${sequencial}`;
        console.log(`✅ Novo ID gerado: ${novoId} (chave: ${chaveSeq}, seq: ${seq})`);
        return novoId;
    } catch (err) {
        console.error('Erro ao gerar ID sequencial:', err);
        const prefixo = PREFIXOS_ID[entidade] || entidade.substring(0, 3).toUpperCase();
        const ano = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const fallbackId = `${prefixo}-${ano}${timestamp}-${random}`;
        console.log(`⚠️ ID gerado em modo fallback: ${fallbackId}`);
        return fallbackId;
    }
}

// ==================== FUNÇÃO PRINCIPAL PARA INICIALIZAR TODOS OS IDs ====================
function inicializarTodosIDs() {
    console.log('🆔 Inicializando IDs de todos os formulários...');
    
    const entidades = ['clientes', 'casa_de_festas', 'elenco', 'personagens', 'motoristas', 'fornecedores', 'funcionarios'];
    
    entidades.forEach(entidade => {
        const idField = document.getElementById(`ID_${entidade}`);
        if (idField) {
            const currentValue = idField.value ? idField.value.toString().trim() : '';
            
            // Só gera novo ID se o campo estiver vazio
            if (!currentValue) {
                const novoId = gerarIDComPrefixo(entidade);
                idField.value = novoId;
                console.log(`📝 ID gerado para ${entidade}: ${novoId}`);
            } else {
                console.log(`📝 ID já existe para ${entidade}: ${currentValue}`);
            }
        } else {
            console.log(`⚠️ Campo ID_${entidade} não encontrado no DOM`);
        }
    });
}

// ==================== FUNÇÃO PARA GERAR ID ESPECÍFICO POR FORMULÁRIO ====================
function inicializarIDFormulario(entidade) {
    const idField = document.getElementById(`ID_${entidade}`);
    if (idField) {
        const currentValue = idField.value ? idField.value.toString().trim() : '';
        if (!currentValue) {
            const novoId = gerarIDComPrefixo(entidade);
            idField.value = novoId;
            console.log(`🆔 ID gerado para ${entidade}: ${novoId}`);
            return novoId;
        }
        return currentValue;
    }
    console.log(`⚠️ Campo ID_${entidade} não encontrado`);
    return null;
}

// ==================== FUNÇÃO PARA LIMPAR FORMULÁRIO E GERAR NOVO ID ====================
function limparFormularioComNovoID(entidade, formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        resetarEstiloValidacaoFormulario(form);
    }
    
    // Gerar novo ID
    const idField = document.getElementById(`ID_${entidade}`);
    if (idField) {
        const novoId = gerarIDComPrefixo(entidade);
        idField.value = novoId;
        console.log(`🆔 Novo ID gerado para ${entidade}: ${novoId}`);
    }
    
    // Resetar botões CPF/CNPJ para padrão (CPF)
    const btnCPF = document.getElementById(`btnCpf_${entidade}`);
    const btnCNPJ = document.getElementById(`btnCnpj_${entidade}`);
    if (btnCPF && btnCNPJ) {
        btnCPF.classList.add('active');
        btnCPF.style.opacity = '1';
        btnCNPJ.classList.remove('active');
        btnCNPJ.style.opacity = '0.7';
    }
    
    // Limpar campos de documento
    const inputCpf = document.getElementById(`doc_${entidade}_cadastros_cpf`);
    const inputCnpj = document.getElementById(`doc_${entidade}_cadastros_cnpj`);
    const inputSimples = document.getElementById(`doc_${entidade}_cadastro`);
    
    if (inputCpf) {
        inputCpf.value = '';
        inputCpf.style.display = 'block';
    }
    if (inputCnpj) {
        inputCnpj.value = '';
        inputCnpj.style.display = 'none';
    }
    if (inputSimples) inputSimples.value = '';
    
    // Liberar campo nome para digitação manual
    const nomeField = document.getElementById(`nome_${entidade}`);
    if (nomeField) {
        nomeField.value = '';
        nomeField.readOnly = false;
        nomeField.style.backgroundColor = '#ffffff';
        nomeField.placeholder = 'Digite o nome completo';
    }
    
    // Para elenco, esconder campos de motorista
    if (entidade === 'elenco') {
        const camposMotorista = document.getElementById('campos_drive_elenco');
        if (camposMotorista) {
            camposMotorista.style.display = 'none';
        }
        const selectFazDrive = document.getElementById('faz_drive_elenco');
        if (selectFazDrive) {
            selectFazDrive.value = 'nao';
        }
    }
    
    console.log(`🧹 Formulário de ${entidade} limpo e novo ID gerado`);
}

// ==================== INICIALIZAÇÃO DAS PÁGINAS ====================
function inicializarPaginaCadastro(entidade) {
    console.log(`🔧 Inicializando página de cadastro: ${entidade}`);
    
    // GERAR ID AUTOMATICAMENTE
    const idField = document.getElementById(`ID_${entidade}`);
    if (idField && (!idField.value || idField.value.trim() === '')) {
        const novoId = gerarIDComPrefixo(entidade);
        idField.value = novoId;
        console.log(`🆔 ID gerado para ${entidade}: ${novoId}`);
    }
    
    // Verificar se há edição pendente (sobrescreve o ID se for edição)
    if (verificarEdicaoPendente(entidade)) {
        console.log(`📝 Modo edição ativo para ${entidade}, ID mantido`);
    }
    
    // Liberar campo nome para digitação manual
    const nomeField = document.getElementById(`nome_${entidade}`);
    if (nomeField) {
        nomeField.readOnly = false;
        nomeField.style.backgroundColor = '#ffffff';
        nomeField.placeholder = 'Digite o nome completo';
    }
    
    // Adicionar evento de cálculo de idade
    const campoData = document.getElementById(`data_nascimento_${entidade}`);
    if (campoData) {
        campoData.removeEventListener('change', () => calcularIdadeOuTempo(entidade));
        campoData.removeEventListener('blur', () => calcularIdadeOuTempo(entidade));
        campoData.addEventListener('change', () => calcularIdadeOuTempo(entidade));
        campoData.addEventListener('blur', () => calcularIdadeOuTempo(entidade));
    }
    
    // Configurar formatação de documentos
    configurarFormatacaoDocumentos(entidade);
    
    // Configurar botão de busca
    const btnBuscar = document.getElementById(`btnBuscar_${entidade}`);
    if (btnBuscar) {
        btnBuscar.removeEventListener('click', () => buscarClientePorDocumento(entidade));
        btnBuscar.addEventListener('click', () => buscarClientePorDocumento(entidade));
    }
}

// Função auxiliar para configurar formatação de documentos
function configurarFormatacaoDocumentos(entidade) {
    const inputCpf = document.getElementById(`doc_${entidade}_cadastros_cpf`);
    const inputCnpj = document.getElementById(`doc_${entidade}_cadastros_cnpj`);
    const inputSimples = document.getElementById(`doc_${entidade}_cadastro`);
    
    if (inputCpf) {
        inputCpf.removeEventListener('input', handleCpfInput);
        inputCpf.removeEventListener('blur', handleCpfBlur);
        inputCpf.addEventListener('input', handleCpfInput);
        inputCpf.addEventListener('blur', handleCpfBlur);
        
        if (inputCpf.value) {
            inputCpf.value = formatarCPF(inputCpf.value);
        }
    }
    
    if (inputCnpj) {
        inputCnpj.removeEventListener('input', handleCnpjInput);
        inputCnpj.removeEventListener('blur', handleCnpjBlur);
        inputCnpj.addEventListener('input', handleCnpjInput);
        inputCnpj.addEventListener('blur', handleCnpjBlur);
        
        if (inputCnpj.value) {
            inputCnpj.value = formatarCNPJ(inputCnpj.value);
        }
    }
    
    if (inputSimples) {
        inputSimples.removeEventListener('input', handleSimplesInput);
        inputSimples.addEventListener('input', handleSimplesInput);
    }
}

// Handlers para formatação
function handleCpfInput(e) {
    formatarCPFInput(e.target);
}

function handleCpfBlur(e) {
    let numeros = e.target.value.replace(/\D/g, '');
    if (numeros.length === 11) {
        e.target.value = numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}

function handleCnpjInput(e) {
    formatarCNPJInput(e.target);
}

function handleCnpjBlur(e) {
    let numeros = e.target.value.replace(/\D/g, '');
    if (numeros.length === 14) {
        e.target.value = numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}

function handleSimplesInput(e) {
    let numeros = e.target.value.replace(/\D/g, '');
    if (numeros.length <= 11) {
        formatarCPFInput(e.target);
    } else {
        formatarCNPJInput(e.target);
    }
}

function formatarCPFInput(input) {
    if (!input) return;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);
    
    if (valor.length <= 3) input.value = valor;
    else if (valor.length <= 6) input.value = valor.replace(/(\d{3})(\d+)/, '$1.$2');
    else if (valor.length <= 9) input.value = valor.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    else input.value = valor.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
}

function formatarCNPJInput(input) {
    if (!input) return;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 14) valor = valor.slice(0, 14);
    
    if (valor.length <= 2) input.value = valor;
    else if (valor.length <= 5) input.value = valor.replace(/(\d{2})(\d+)/, '$1.$2');
    else if (valor.length <= 8) input.value = valor.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    else if (valor.length <= 12) input.value = valor.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    else input.value = valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
}

// ==================== INICIALIZAÇÃO GLOBAL ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de cadastros...');
    
    // Inicializar TODOS os IDs imediatamente
    setTimeout(() => {
        inicializarTodosIDs();
    }, 100);
    
    // Observar mudanças de página para inicializar os formulários
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const page = mutation.target;
                if (page.classList && page.classList.contains('active')) {
                    const pageId = page.id;
                    
                    const entidades = ['clientes', 'casa_de_festas', 'elenco', 'personagens', 'motoristas', 'fornecedores', 'funcionarios'];
                    
                    for (const entidade of entidades) {
                        if (pageId === entidade) {
                            console.log(`📄 Página ${entidade} ativada, inicializando...`);
                            setTimeout(() => inicializarPaginaCadastro(entidade), 100);
                            break;
                        }
                    }
                }
            }
        });
    });
    
    // Observar todas as páginas
    const entidades = ['clientes', 'casa_de_festas', 'elenco', 'personagens', 'motoristas', 'fornecedores', 'funcionarios'];
    entidades.forEach(entidade => {
        const page = document.getElementById(entidade);
        if (page) {
            observer.observe(page, { attributes: true, attributeFilter: ['class'] });
        }
    });
    
    // Inicializar a página que já está ativa
    entidades.forEach(entidade => {
        const page = document.getElementById(entidade);
        if (page && page.classList.contains('active')) {
            setTimeout(() => inicializarPaginaCadastro(entidade), 100);
        }
    });
});

// ==================== EXPORTAR FUNÇÕES ====================

window.gerarIDComPrefixo = gerarIDComPrefixo;
window.inicializarIDFormulario = inicializarIDFormulario;
window.inicializarTodosIDs = inicializarTodosIDs;
window.limparFormularioComNovoID = limparFormularioComNovoID;
window.inicializarPaginaCadastro = inicializarPaginaCadastro;

console.log('✅ cadastros.js carregado com sucesso - Sistema de IDs automáticos ativo!');