// Adicionar ao arquivo que gerencia escalas (equipe.js ou similar)

// Função para enviar notificações ao salvar escala
function enviarNotificacoesEscala(eventoId, elencoEscalado, motoristaEscalado) {
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const evento = eventos.find(e => e.id === eventoId);
    
    if (!evento) return;
    
    const nomeEvento = `${evento.nome_cliente_evento || 'Evento'} - ${evento.data_evento || ''}`;
    const dataEvento = evento.data_evento;
    
    // Notificar elenco escalado
    if (elencoEscalado && Array.isArray(elencoEscalado)) {
        elencoEscalado.forEach(membro => {
            const cpf = (membro.cpf || membro.doc_elenco_cadastro || '').replace(/\D/g, '');
            if (cpf && typeof criarNotificacaoEscala === 'function') {
                criarNotificacaoEscala(cpf, eventoId, nomeEvento, dataEvento);
            }
        });
    }
    
    // Notificar motorista escalado
    if (motoristaEscalado) {
        const cpf = (motoristaEscalado.cpf || motoristaEscalado.doc_motoristas_cadastro || '').replace(/\D/g, '');
        if (cpf && typeof criarNotificacaoEscala === 'function') {
            criarNotificacaoEscala(cpf, eventoId, nomeEvento, dataEvento);
        }
    }
}

// Exportar
window.enviarNotificacoesEscala = enviarNotificacoesEscala;
