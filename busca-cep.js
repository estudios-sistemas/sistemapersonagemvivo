// ==================== BUSCA CEP AUTOMÁTICA ====================

// Função para formatar CEP enquanto digita
function formatarCEP(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = valor.substring(0, 8);
    
    if (valor.length > 5) {
        valor = valor.substring(0, 5) + '-' + valor.substring(5);
    }
    
    input.value = valor;
    
    // Buscar automaticamente quando CEP estiver completo
    if (valor.replace(/\D/g, '').length === 8) {
        const entidade = identificarEntidadePorCampo(input.id);
        if (entidade) {
            buscarCEP(valor, entidade);
        }
    }
}

// Identificar entidade pelo ID do campo
function identificarEntidadePorCampo(campoId) {
    if (campoId.includes('cliente')) return 'cliente';
    if (campoId.includes('casa_de_festas')) return 'casa_de_festas';
    if (campoId.includes('elenco')) return 'elenco';
    if (campoId.includes('motoristas')) return 'motoristas';
    if (campoId.includes('fornecedores')) return 'fornecedores';
    if (campoId.includes('funcionarios')) return 'funcionarios';
    if (campoId.includes('local_evento')) return 'localEvento';
    return null;
}

// Função principal para buscar CEP
async function buscarCEP(cep, entidade) {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
        return;
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const dados = await response.json();
        
        if (dados.erro) {
            liberarPreenchimentoManual(entidade);
            return;
        }
        
        preencherEndereco(entidade, dados);
        bloquearCamposEndereco(entidade, false);
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        liberarPreenchimentoManual(entidade);
    }
}

// Liberar campos para preenchimento manual quando CEP não encontrado
function liberarPreenchimentoManual(entidade) {
    const mapeamento = {
        'cliente': ['logradouro_cliente', 'bairro_cliente', 'cidade_cliente', 'estado_cliente'],
        'casa_de_festas': ['logradouro_casa_de_festas', 'bairro_casa_de_festas', 'cidade_casa_de_festas', 'estado_casa_de_festas'],
        'elenco': ['logradouro_elenco', 'bairro_elenco', 'cidade_elenco', 'estado_elenco'],
        'motoristas': ['logradouro_motoristas', 'bairro_motoristas', 'cidade_motoristas', 'estado_motoristas'],
        'fornecedores': ['logradouro_fornecedores', 'bairro_fornecedores', 'cidade_fornecedores', 'estado_fornecedores'],
        'funcionarios': ['logradouro_funcionarios', 'bairro_funcionarios', 'cidade_funcionarios', 'estado_funcionarios'],
        'localEvento': ['logradouro_local_evento', 'bairro_local_evento', 'cidade_local_evento', 'estado_local_evento']
    };
    
    const campos = mapeamento[entidade];
    if (!campos) return;
    
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.removeAttribute('readonly');
            campo.style.background = '#fff';
            campo.style.border = '2px solid #ffc107';
            campo.placeholder = 'Preencha manualmente';
        }
    });
    
    // Aviso visual sem alert bloqueante
    const campoCep = document.querySelector(`[id*="cep_${entidade === 'localEvento' ? 'local_evento' : entidade}"]`);
    if (campoCep) {
        campoCep.style.border = '2px solid #ffc107';
        campoCep.title = 'CEP não encontrado - preencha o endereço manualmente';
    }
    
    console.warn(`CEP não encontrado para ${entidade}. Campos liberados para preenchimento manual.`);
}

// Bloquear/desbloquear campos após preenchimento automático
function bloquearCamposEndereco(entidade, bloquear) {
    const mapeamento = {
        'cliente': ['logradouro_cliente', 'bairro_cliente', 'cidade_cliente', 'estado_cliente'],
        'casa_de_festas': ['logradouro_casa_de_festas', 'bairro_casa_de_festas', 'cidade_casa_de_festas', 'estado_casa_de_festas'],
        'elenco': ['logradouro_elenco', 'bairro_elenco', 'cidade_elenco', 'estado_elenco'],
        'motoristas': ['logradouro_motoristas', 'bairro_motoristas', 'cidade_motoristas', 'estado_motoristas'],
        'fornecedores': ['logradouro_fornecedores', 'bairro_fornecedores', 'cidade_fornecedores', 'estado_fornecedores'],
        'funcionarios': ['logradouro_funcionarios', 'bairro_funcionarios', 'cidade_funcionarios', 'estado_funcionarios'],
        'localEvento': ['logradouro_local_evento', 'bairro_local_evento', 'cidade_local_evento', 'estado_local_evento']
    };
    
    const campos = mapeamento[entidade];
    if (!campos) return;
    
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.style.border = '';
            campo.removeAttribute('readonly');
        }
    });
}

// Preencher campos de endereço baseado na entidade
function preencherEndereco(entidade, dados) {
    const mapeamento = {
        'cliente': {
            logradouro: 'logradouro_cliente',
            bairro: 'bairro_cliente',
            cidade: 'cidade_cliente',
            estado: 'estado_cliente'
        },
        'casa_de_festas': {
            logradouro: 'logradouro_casa_de_festas',
            bairro: 'bairro_casa_de_festas',
            cidade: 'cidade_casa_de_festas',
            estado: 'estado_casa_de_festas'
        },
        'elenco': {
            logradouro: 'logradouro_elenco',
            bairro: 'bairro_elenco',
            cidade: 'cidade_elenco',
            estado: 'estado_elenco'
        },
        'motoristas': {
            logradouro: 'logradouro_motoristas',
            bairro: 'bairro_motoristas',
            cidade: 'cidade_motoristas',
            estado: 'estado_motoristas'
        },
        'fornecedores': {
            logradouro: 'logradouro_fornecedores',
            bairro: 'bairro_fornecedores',
            cidade: 'cidade_fornecedores',
            estado: 'estado_fornecedores'
        },
        'funcionarios': {
            logradouro: 'logradouro_funcionarios',
            bairro: 'bairro_funcionarios',
            cidade: 'cidade_funcionarios',
            estado: 'estado_funcionarios'
        },
        'localEvento': {
            logradouro: 'logradouro_local_evento',
            bairro: 'bairro_local_evento',
            cidade: 'cidade_local_evento',
            estado: 'estado_local_evento'
        }
    };
    
    const campos = mapeamento[entidade];
    if (!campos) return;
    
    // Preencher logradouro
    const campoLogradouro = document.getElementById(campos.logradouro);
    if (campoLogradouro && dados.logradouro) {
        campoLogradouro.value = dados.logradouro;
    }
    
    // Preencher bairro
    const campoBairro = document.getElementById(campos.bairro);
    if (campoBairro && dados.bairro) {
        campoBairro.value = dados.bairro;
    }
    
    // Preencher cidade
    const campoCidade = document.getElementById(campos.cidade);
    if (campoCidade && dados.localidade) {
        campoCidade.value = dados.localidade;
    }
    
    // Preencher estado
    const campoEstado = document.getElementById(campos.estado);
    if (campoEstado && dados.uf) {
        campoEstado.value = dados.uf;
    }
    
    console.log('Endereço preenchido automaticamente:', dados);
}

// Adicionar eventos aos campos CEP quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Lista de IDs de campos CEP
    const camposCEP = [
        'cep_cliente',
        'cep_casa_de_festas',
        'cep_elenco',
        'cep_motoristas',
        'cep_fornecedores',
        'cep_funcionarios',
        'cep_local_evento'
    ];
    
    camposCEP.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            // Adicionar formatação ao digitar
            campo.addEventListener('input', function() {
                formatarCEP(this);
            });
        }
    });
    
    console.log('Busca automática de CEP configurada');
});

// Exportar funções
window.buscarCEP = buscarCEP;
window.formatarCEP = formatarCEP;
window.liberarPreenchimentoManual = liberarPreenchimentoManual;

console.log('busca-cep.js carregado com sucesso');
