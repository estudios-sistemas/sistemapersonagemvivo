// ==================== CONFIGURAÇÃO CENTRAL DO SISTEMA ====================

const CONFIG = {
    // Versão do sistema
    VERSAO: '2.0.0',
    
    // Modo de desenvolvimento (true = localStorage, false = API)
    MODO_DESENVOLVIMENTO: true,
    
    // URL da API (para quando migrar para backend)
    API_URL: 'http://localhost:3000/api',
    
    // Configurações de storage
    STORAGE_PREFIX: 'eventos_sistema_',
    
    // Pastas das empresas
    PASTA_PADRAO: 'empresas',
    
    // Configurações de backup
    BACKUP_AUTOMATICO: true,
    BACKUP_INTERVALO: 24 * 60 * 60 * 1000, // 24 horas
    
    // Logs
    DEBUG_MODE: true
};

// Inicializar estrutura de pastas no localStorage
function inicializarEstruturaEmpresas() {
    const empresas = localStorage.getItem(`${CONFIG.STORAGE_PREFIX}empresas`);
    if (!empresas) {
        const empresasPadrao = {
            'empresa1': {
                nome: 'Eventos Plus',
                cnpj: '00.000.000/0001-00',
                dataCadastro: new Date().toISOString()
            },
            'empresa_demo': {
                nome: 'Demo Eventos',
                cnpj: '00.000.000/0001-00',
                dataCadastro: new Date().toISOString()
            }
        };
        localStorage.setItem(`${CONFIG.STORAGE_PREFIX}empresas`, JSON.stringify(empresasPadrao));
    }
}

// Função para obter storage da empresa atual
function getStorageEmpresa(pasta, chave) {
    const key = `${CONFIG.STORAGE_PREFIX}${pasta}_${chave}`;
    return localStorage.getItem(key);
}

function setStorageEmpresa(pasta, chave, valor) {
    const key = `${CONFIG.STORAGE_PREFIX}${pasta}_${chave}`;
    localStorage.setItem(key, valor);
}

// Exportar configurações
window.CONFIG = CONFIG;
window.getStorageEmpresa = getStorageEmpresa;
window.setStorageEmpresa = setStorageEmpresa;
window.inicializarEstruturaEmpresas = inicializarEstruturaEmpresas;

console.log('✅ Configuração central carregada!');