/**
 * ==========================================
 * CALENDÁRIO DE EVENTOS COM CORES DE STATUS
 * ==========================================
 * Integra os eventos cadastrados em "Reservar Evento" 
 * com o calendário visual do painel (dashboard)
 * Mostra cores de status dos eventos conforme status_evento e status_pagamento
 */

class CalendarioEventosSystem {
    constructor() {
        this.mesAtual = new Date().getMonth();
        this.anoAtual = new Date().getFullYear();
        this.eventos = [];
        this.corPorStatus = {
            'confirmado': '#28a745',      // Verde - Confirmado/Pago
            'pago': '#28a745',
            'pendente': '#ffc107',         // Amarelo - Pendente
            'reservado': '#007bff',        // Azul - Reservado
            'sinal_nao_pago': '#9b59b6',   // ROXO - Sinal não pago
            'nao_pago': '#dc3545',         // Vermelho - Não Pago
            'cancelado': '#dc3545',
            'finalizado': '#6c757d',       // Cinza - Finalizado
            'aguardando': '#fd7e14'        // Laranja - Aguardando
        };
    }

    /**
     * Inicializa o calendário
     */
    init() {
        this.carregarEventos();
        this.renderizarCalendario();
        this.anexarEventosBotoes();
        this.criarModalEventos();
    }

    /**
     * Carrega eventos do localStorage
     */
    carregarEventos() {
        this.eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
        this.atualizarStatusEventos();
    }

    /**
     * Atualiza status dos eventos baseado no horário atual
     */
    atualizarStatusEventos() {
        const agora = new Date();
        let atualizou = false;

        this.eventos.forEach(evento => {
            const horaFim = this.calcularHoraFim(evento);
            
            // Se o horário de término já passou
            if (agora > horaFim && evento.status_evento !== 'finalizado') {
                evento.status_evento = 'finalizado';
                atualizou = true;
            }
        });

        if (atualizou) {
            localStorage.setItem('eventos_cadastrados', JSON.stringify(this.eventos));
        }
    }

    /**
     * Calcula a hora de fim do evento
     */
    calcularHoraFim(evento) {
        if (!evento.data_evento) return new Date();
        
        const [ano, mes, dia] = evento.data_evento.split('T')[0].split('-');
        const [horaInicio, minInicio] = (evento.hora_evento || '00:00').split(':');
        const duracao = parseInt(evento.duracao) || 2;
        
        let horaFim = parseInt(horaInicio) + duracao;
        let minutoFim = parseInt(minInicio);
        
        const dataFim = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), horaFim, minutoFim, 0);
        return dataFim;
    }

    /**
     * Verifica se duas datas são o mesmo dia
     */
    isMesmoDia(data1, data2) {
        return data1.getDate() === data2.getDate() &&
               data1.getMonth() === data2.getMonth() &&
               data1.getFullYear() === data2.getFullYear();
    }

    /**
     * Determina a cor do dia baseado em TODOS os eventos do dia
     */
    determinarCorDia(eventosDia) {
        if (eventosDia.length === 0) {
            return { fundo: '#fff', borda: '#ddd' };
        }

        let temSinalNaoPago = false;
        let todosFinalizados = true;

        eventosDia.forEach(evento => {
            const status = this.determinarStatus(evento);
            
            // Verificar sinal não pago
            const sinalPago = evento.sinal_pago_status === true || evento.sinal_pago_status === 'true';
            const sinalValor = parseFloat(String(evento.valor_sinal || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
            
            if (!sinalPago && sinalValor > 0) {
                temSinalNaoPago = true;
            }
            
            // Verificar se tem evento não finalizado
            if (status !== 'finalizado') {
                todosFinalizados = false;
            }
        });

        // Se TODOS os eventos estão finalizados -> CINZA
        if (todosFinalizados && eventosDia.length > 0) {
            return { fundo: '#6c757d20', borda: '#6c757d' };
        }
        
        // Se tem sinal não pago -> ROXO (prioridade máxima)
        if (temSinalNaoPago) {
            return { fundo: '#9b59b620', borda: '#9b59b6' };
        }
        
        // Se tem evento confirmado/pago -> VERDE
        const temConfirmado = eventosDia.some(e => {
            const status = this.determinarStatus(e);
            return status === 'confirmado' || status === 'pago';
        });
        if (temConfirmado) {
            return { fundo: '#28a74520', borda: '#28a745' };
        }
        
        // Se tem evento pendente -> AMARELO
        const temPendente = eventosDia.some(e => {
            const status = this.determinarStatus(e);
            return status === 'pendente';
        });
        if (temPendente) {
            return { fundo: '#ffc10720', borda: '#ffc107' };
        }
        
        // Se tem evento reservado -> AZUL
        const temReservado = eventosDia.some(e => {
            const status = this.determinarStatus(e);
            return status === 'reservado';
        });
        if (temReservado) {
            return { fundo: '#007bff20', borda: '#007bff' };
        }
        
        return { fundo: '#fff', borda: '#ddd' };
    }

    /**
     * Determina o status do evento individual
     */
    determinarStatus(evento) {
        // Verificar se já passou do horário de término
        const agora = new Date();
        const horaFim = this.calcularHoraFim(evento);
        
        if (agora > horaFim) {
            return 'finalizado';
        }
        
        // Verificar status baseado no pagamento
        const sinalPago = evento.sinal_pago_status === true || evento.sinal_pago_status === 'true';
        const sinalValor = parseFloat(String(evento.valor_sinal || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
        
        // Sinal não pago (roxa)
        if (!sinalPago && sinalValor > 0) {
            return 'sinal_nao_pago';
        }
        
        const statusPagamento = (evento.status_pagamento || '').toLowerCase();
        const statusEvento = (evento.status_evento || '').toLowerCase();

        if (statusPagamento.includes('pago') || statusPagamento.includes('confirmado')) {
            return 'confirmado';
        }
        if (statusEvento.includes('confirmado')) {
            return 'confirmado';
        }
        if (statusEvento.includes('finalizado')) {
            return 'finalizado';
        }
        if (statusEvento.includes('reservado')) {
            return 'reservado';
        }
        return 'pendente';
    }

    /**
     * Obtém a cor para um status individual
     */
    obterCorPorStatus(status) {
        return this.corPorStatus[status?.toLowerCase()] || '#007bff';
    }

    /**
     * Renderiza o calendário do mês
     */
    renderizarCalendario() {
        const container = document.getElementById('calendar');
        if (!container) return;

        const hoje = new Date();
        const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1).getDay();
        const diasNoMes = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();

        // Atualizar cabeçalho do mês
        const nomeMes = new Date(this.anoAtual, this.mesAtual, 1).toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
        });
        const headerMes = document.getElementById('currentMonth');
        if (headerMes) {
            headerMes.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
        }

        // Cabeçalho dos dias da semana
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        let html = '';
        
        diasSemana.forEach(dia => {
            html += `<div class="calendar-day-header">${dia}</div>`;
        });

        // Dias vazios antes do mês
        for (let i = 0; i < primeiroDia; i++) {
            html += '<div class="calendar-empty-day"></div>';
        }

        // Dias do mês
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const dataDia = new Date(this.anoAtual, this.mesAtual, dia);
            dataDia.setHours(0, 0, 0, 0);
            const dataStr = this.formatarDataISO(dataDia);

            // Buscar eventos deste dia
            const eventosDia = this.obterEventosDia(dataStr);
            const ehHoje = this.isMesmoDia(dataDia, hoje);

            // Determinar cor baseada nos eventos do dia
            const { fundo, borda } = this.determinarCorDia(eventosDia);
            
            // Contador de eventos
            const quantidadeEventos = eventosDia.length;
            const badgeEventos = quantidadeEventos > 0 ? `<span class="event-count">${quantidadeEventos}</span>` : '';

            const styleHoje = ehHoje ? 'box-shadow: inset 0 0 0 3px #667eea;' : '';

            html += `
                <div class="calendar-day" data-data="${dataStr}" 
                     style="
                        background: ${fundo}; 
                        border: 2px solid ${borda}; 
                        cursor: pointer;
                        position: relative;
                        ${styleHoje}
                     "
                     onclick="window.calendarioEventos.abrirModalEventos('${dataStr}')">
                    <div class="calendar-day-number">${dia}</div>
                    ${badgeEventos}
                </div>
            `;
        }

        container.innerHTML = html;
    }

    /**
     * Formata data para ISO (YYYY-MM-DD)
     */
    formatarDataISO(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }

    /**
     * Obtém eventos de um dia específico
     */
    obterEventosDia(dataStr) {
        return this.eventos.filter(evento => {
            let dataEvento = evento.data_evento;
            if (dataEvento && dataEvento.includes('T')) {
                dataEvento = dataEvento.split('T')[0];
            }
            return dataEvento === dataStr;
        });
    }

    /**
     * Cria o modal para exibir eventos do dia
     */
    criarModalEventos() {
        if (document.getElementById('modalEventosDia')) return;
        
        const modalHTML = `
            <div id="modalEventosDia" class="modal-eventos" style="display: none;">
                <div class="modal-eventos-content">
                    <div class="modal-eventos-header">
                        <h3 id="modalEventosTitulo">📅 Eventos do Dia</h3>
                        <button class="modal-close" onclick="window.calendarioEventos.fecharModal()">&times;</button>
                    </div>
                    <div id="modalEventosLista" class="modal-eventos-lista">
                        <div style="text-align: center; padding: 2rem;">Carregando...</div>
                    </div>
                    <div class="modal-eventos-footer">
                        <button class="btn" onclick="window.calendarioEventos.fecharModal()">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Adicionar estilos do modal
        if (!document.getElementById('style-modal-eventos')) {
            const style = document.createElement('style');
            style.id = 'style-modal-eventos';
            style.textContent = `
                .modal-eventos {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(3px);
                }
                .modal-eventos-content {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 800px;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    animation: modalSlideIn 0.3s ease;
                }
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .modal-eventos-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-bottom: 2px solid #e9ecef;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 12px 12px 0 0;
                }
                .modal-eventos-header h3 {
                    margin: 0;
                    color: white;
                }
                .modal-close {
                    background: transparent;
                    border: none;
                    font-size: 1.8rem;
                    cursor: pointer;
                    color: white;
                    line-height: 1;
                }
                .modal-close:hover {
                    opacity: 0.8;
                }
                .modal-eventos-lista {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                }
                .modal-eventos-footer {
                    padding: 1rem;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: flex-end;
                }
                .evento-card-modal {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 0.8rem;
                    border-left: 4px solid;
                    transition: transform 0.2s;
                }
                .evento-card-modal:hover {
                    transform: translateX(5px);
                }
                .evento-card-modal h4 {
                    margin: 0 0 0.5rem 0;
                    color: #2c3e50;
                }
                .evento-card-modal .evento-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }
                .evento-card-modal .evento-info span {
                    color: #666;
                }
                .evento-card-modal .evento-info strong {
                    color: #333;
                }
                .evento-status {
                    display: inline-block;
                    padding: 0.2rem 0.6rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: bold;
                    margin-top: 0.5rem;
                }
                .calendar-day {
                    position: relative;
                    min-height: 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .calendar-day-number {
                    font-weight: bold;
                    font-size: 1rem;
                }
                .event-count {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: #dc3545;
                    color: white;
                    border-radius: 10px;
                    padding: 0px 6px;
                    font-size: 10px;
                    font-weight: bold;
                }
                .calendar-empty-day {
                    min-height: 80px;
                    background: transparent;
                }
                .calendar-day-header {
                    text-align: center;
                    font-weight: bold;
                    padding: 8px;
                    background: #f8f9fa;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Abre o modal com a lista de eventos do dia
     */
    abrirModalEventos(dataStr) {
        const eventosDia = this.obterEventosDia(dataStr);
        const modal = document.getElementById('modalEventosDia');
        const titulo = document.getElementById('modalEventosTitulo');
        const listaContainer = document.getElementById('modalEventosLista');
        
        if (!modal || !listaContainer) return;
        
        const dataObj = new Date(dataStr + 'T12:00:00');
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        titulo.innerHTML = `📅 Eventos em ${dataFormatada}`;
        
        if (eventosDia.length === 0) {
            listaContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Nenhum evento neste dia 📭</div>';
        } else {
            let html = '';
            eventosDia.forEach((evento, index) => {
                const status = this.determinarStatus(evento);
                const corStatus = this.obterCorPorStatus(status);
                const statusText = this.getStatusText(status);
                
                // Verificar sinal não pago
                const sinalPago = evento.sinal_pago_status === true || evento.sinal_pago_status === 'true';
                const sinalValor = parseFloat(String(evento.valor_sinal || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
                const sinalNaoPago = (!sinalPago && sinalValor > 0);
                
                const horaInicio = evento.hora_evento || '--:--';
                const duracao = parseInt(evento.duracao) || 2;
                const horaFim = this.calcularHoraFimDisplay(evento);
                
                // Calcular se evento já finalizou
                const agora = new Date();
                const horaFimDate = this.calcularHoraFim(evento);
                const eventoFinalizado = agora > horaFimDate;
                
                // Obter personagens
                let personagensTexto = 'Nenhum';
                try {
                    const personagens = evento.personagens_ids ? JSON.parse(evento.personagens_ids) : [];
                    if (personagens.length > 0) {
                        personagensTexto = personagens.map(p => p.nome || p.personagem_nome || p).join(', ');
                    }
                } catch(e) {
                    personagensTexto = evento.personagens_nomes || 'Nenhum';
                }
                
                html += `
                    <div class="evento-card-modal" style="border-left-color: ${corStatus}; opacity: ${eventoFinalizado ? 0.7 : 1}">
                        <h4>${index + 1}. ${evento.nome_cliente_evento || 'Cliente não informado'}</h4>
                        <div class="evento-info">
                            <div><span>🏠 Local:</span> <strong>${evento.nome_local_evento || evento.casa_festa || 'Não informado'}</strong></div>
                            <div><span>🕐 Horário:</span> <strong>${horaInicio} - ${horaFim}</strong></div>
                            <div><span>⏱️ Duração:</span> <strong>${duracao} horas</strong></div>
                            <div><span>💰 Valor Total:</span> <strong>${this.formatarMoeda(evento.valor_total)}</strong></div>
                        </div>
                        <div class="evento-info">
                            <div><span>💵 Sinal:</span> <strong>${this.formatarMoeda(evento.valor_sinal)}</strong> ${sinalNaoPago ? '⚠️ <span style="color:#9b59b6;">(NÃO PAGO!)</span>' : ''}</div>
                            <div><span>📊 Status Pagamento:</span> <strong>${evento.status_pagamento || 'Pendente'}</strong></div>
                            <div><span>🎭 Personagens:</span> <strong>${personagensTexto}</strong></div>
                        </div>
                        <div class="evento-status" style="background: ${corStatus}20; color: ${corStatus}; border: 1px solid ${corStatus}">
                            ${statusText} ${eventoFinalizado ? ' ✓' : ''}
                        </div>
                    </div>
                `;
            });
            listaContainer.innerHTML = html;
        }
        
        modal.style.display = 'flex';
    }
    
    /**
     * Calcula hora de fim para exibição
     */
    calcularHoraFimDisplay(evento) {
        const [horaInicio, minInicio] = (evento.hora_evento || '00:00').split(':');
        const duracao = parseInt(evento.duracao) || 2;
        
        let horaFim = parseInt(horaInicio) + duracao;
        let minutoFim = parseInt(minInicio);
        
        return `${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`;
    }
    
    /**
     * Formata valor em moeda
     */
    formatarMoeda(valor) {
        if (!valor || valor === 'undefined' || valor === 'null') return 'R$ 0,00';
        let num = 0;
        if (typeof valor === 'string') {
            num = parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.'));
        } else {
            num = valor;
        }
        if (isNaN(num)) return 'R$ 0,00';
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    
    /**
     * Retorna texto do status
     */
    getStatusText(status) {
        const statusMap = {
            'confirmado': '✅ Confirmado/Pago',
            'pago': '✅ Pago',
            'pendente': '⏳ Pendente',
            'reservado': '📌 Reservado',
            'sinal_nao_pago': '🟣 Sinal Não Pago',
            'nao_pago': '❌ Não Pago',
            'cancelado': '❌ Cancelado',
            'finalizado': '🏁 Finalizado',
            'aguardando': '🟠 Aguardando'
        };
        return statusMap[status] || status;
    }
    
    /**
     * Fecha o modal
     */
    fecharModal() {
        const modal = document.getElementById('modalEventosDia');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Fecha modal ao clicar fora
     */
    fecharModalAoClicarFora(event) {
        const modal = document.getElementById('modalEventosDia');
        if (modal && event.target === modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Navega para o mês anterior
     */
    mesAnterior() {
        this.mesAtual--;
        if (this.mesAtual < 0) {
            this.mesAtual = 11;
            this.anoAtual--;
        }
        this.carregarEventos();
        this.renderizarCalendario();
    }

    /**
     * Navega para o próximo mês
     */
    proximoMes() {
        this.mesAtual++;
        if (this.mesAtual > 11) {
            this.mesAtual = 0;
            this.anoAtual++;
        }
        this.carregarEventos();
        this.renderizarCalendario();
    }

    /**
     * Navega para o mês/ano atual
     */
    irParaHoje() {
        const hoje = new Date();
        this.mesAtual = hoje.getMonth();
        this.anoAtual = hoje.getFullYear();
        this.carregarEventos();
        this.renderizarCalendario();
    }

    /**
     * Anexa eventos aos botões de navegação
     */
    anexarEventosBotoes() {
        window.previousMonth = () => this.mesAnterior();
        window.nextMonth = () => this.proximoMes();
        window.irParaHoje = () => this.irParaHoje();
    }
}

/**
 * Inicializa quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    window.calendarioEventos = new CalendarioEventosSystem();
    window.calendarioEventos.init();
    
    document.addEventListener('click', (e) => {
        if (window.calendarioEventos) {
            window.calendarioEventos.fecharModalAoClicarFora(e);
        }
    });
});

/**
 * Atualiza calendário quando novos eventos são adicionados
 */
function atualizarCalendarioEventos() {
    if (window.calendarioEventos) {
        window.calendarioEventos.carregarEventos();
        window.calendarioEventos.renderizarCalendario();
    }
}

/**
 * Recarregar calendário periodicamente (a cada 5 minutos)
 */
setInterval(() => {
    if (window.calendarioEventos) {
        window.calendarioEventos.carregarEventos();
        window.calendarioEventos.renderizarCalendario();
    }
}, 300000);