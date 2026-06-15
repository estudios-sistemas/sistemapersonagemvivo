/**
 * ==========================================
 * PAINEL DE EVENTOS COM CORES E PREVISÕES
 * ==========================================
 * Funcionalidades:
 * - Calendário com cores de status dos eventos
 * - Datas clicáveis para filtrar eventos
 * - Previsão do tempo (OpenWeatherMap)
 * - Informações de trânsito (Google Maps)
 */

class PainelEventosUsuario {
    constructor() {
        this.cpfUsuario = '';
        this.nomeUsuario = '';
        this.apiWeatherKey = 'eda6c5e0e82b23d3e7a3c1c3f8e5b4a9'; // Chave de exemplo - substitua pela sua
        this.eventos = [];
        this.escalas = [];
        this.mesExibicao = new Date().getMonth();
        this.anoExibicao = new Date().getFullYear();
    }

    /**
     * Inicializa o painel
     */
    init(cpf, nome) {
        this.cpfUsuario = cpf;
        this.nomeUsuario = nome;
        this.carregarDados();
        this.renderizarCalendarioEventos();
        this.setupEventListeners();
    }

    /**
     * Configura listeners de eventos para navegação
     */
    setupEventListeners() {
        const btnAnterior = document.getElementById('btnMesAnterior');
        const btnProximo = document.getElementById('btnProximoMes');

        if (btnAnterior) {
            btnAnterior.addEventListener('click', () => {
                this.mesExibicao--;
                if (this.mesExibicao < 0) {
                    this.mesExibicao = 11;
                    this.anoExibicao--;
                }
                this.renderizarDiasCalendario(this.mesExibicao, this.anoExibicao);
            });
        }

        if (btnProximo) {
            btnProximo.addEventListener('click', () => {
                this.mesExibicao++;
                if (this.mesExibicao > 11) {
                    this.mesExibicao = 0;
                    this.anoExibicao++;
                }
                this.renderizarDiasCalendario(this.mesExibicao, this.anoExibicao);
            });
        }
    }

    /**
     * Carrega dados do localStorage
     */
    carregarDados() {
        this.eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
        this.escalas = JSON.parse(localStorage.getItem('escalas_eventos') || '[]');
    }

    /**
     * Renderiza o calendário com cores de eventos
     */
    renderizarCalendarioEventos() {
        const container = document.getElementById('calendarioEventos');
        if (!container) return;

        // Usar mês e ano de exibição
        const mesExib = this.mesExibicao;
        const anoExib = this.anoExibicao;

        // Cabeçalho do calendário
        let html = `
            <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: #333;">📅 Calendário de Eventos</h3>
                    <div style="display: flex; gap: 0.5rem;">
                        <button id="btnMesAnterior" style="padding: 6px 10px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">⬅</button>
                        <span id="mesanoAtual" style="min-width: 150px; text-align: center; font-weight: 600;"></span>
                        <button id="btnProximoMes" style="padding: 6px 10px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">➡</button>
                    </div>
                </div>

                <!-- Legenda de cores -->
                <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 24px; height: 24px; background: #28a745; border-radius: 4px;"></div>
                        <span style="font-size: 0.9rem;">✅ Confirmado</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 24px; height: 24px; background: #ffc107; border-radius: 4px;"></div>
                        <span style="font-size: 0.9rem;">⏳ Pendente</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 24px; height: 24px; background: #007bff; border-radius: 4px;"></div>
                        <span style="font-size: 0.9rem;">📌 Reservado</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 24px; height: 24px; background: #dc3545; border-radius: 4px;"></div>
                        <span style="font-size: 0.9rem;">❌ Não Pago</span>
                    </div>
                </div>

                <!-- Grid do calendário -->
                <div id="gridCalendario" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;"></div>
            </div>
        `;

        container.innerHTML = html;

        // Renderizar dias
        this.renderizarDiasCalendario(mesExib, anoExib);

        // Configurar listeners
        this.setupEventListeners();
    }

    /**
     * Renderiza os dias do calendário
     */
    renderizarDiasCalendario(mes, ano) {
        const container = document.getElementById('gridCalendario');
        if (!container) return;

        // Atualizar header
        const nomeMes = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const header = document.getElementById('mesanoAtual');
        if (header) header.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

        // Obter primeiro dia do mês e número de dias
        const primeiroDia = new Date(ano, mes, 1).getDay();
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        let html = '';

        // Cabeçalho dos dias da semana
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        diasSemana.forEach(dia => {
            html += `<div style="text-align: center; font-weight: 600; padding: 0.5rem; color: #666; font-size: 0.85rem;">${dia}</div>`;
        });

        // Dias vazios antes do mês
        for (let i = 0; i < primeiroDia; i++) {
            html += '<div></div>';
        }

        // Dias do mês
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const dataDia = new Date(ano, mes, dia);
            dataDia.setHours(0, 0, 0, 0);
            const dataStr = dataDia.toISOString().split('T')[0];

            // Encontrar eventos do dia
            const eventosoDia = this.obterEventosDia(dataStr);
            const temEvento = eventosoDia.length > 0;

            // Determinar cor do evento
            let corFundo = '#f8f9fa';
            let corBorda = '#e0e0e0';
            let corTexto = '#333';

            if (temEvento) {
                const eventoPrincipal = eventosoDia[0];
                const cor = this.obterCorEvento(eventoPrincipal.status);
                corBorda = cor;
                corFundo = cor + '20'; // Adiciona transparência
                corTexto = '#000';
            }

            // Destaque para o dia atual
            const ehHoje = dataDia.getTime() === hoje.getTime();
            const styleHoje = ehHoje ? 'box-shadow: inset 0 0 0 2px #667eea;' : '';

            html += `
                <button
                    class="dia-calendario"
                    data-data="${dataStr}"
                    style="
                        padding: 0.75rem;
                        background: ${corFundo};
                        border: 2px solid ${corBorda};
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        color: ${corTexto};
                        position: relative;
                        transition: all 0.2s;
                        ${styleHoje}
                    "
                    onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';"
                    onclick="mostrarEventosDia('${dataStr}')">
                    <div style="font-size: 1.1rem;">${dia}</div>
                    ${temEvento ? `<div style="font-size: 0.65rem; margin-top: 0.25rem;">● ${eventosoDia.length} evento${eventosoDia.length > 1 ? 's' : ''}</div>` : ''}
                </button>
            `;
        }

        container.innerHTML = html;
    }

    /**
     * Obtém eventos de um dia específico
     */
    obterEventosDia(dataStr) {
        const eventosoDia = [];

        // Filtrar escalas do usuário naquela data
        const minhasEscalas = this.escalas.filter(escala => {
            const dataEscala = escala.evento_data ? escala.evento_data.split('T')[0] : '';
            const pertenceAoUsuario = (escala.elenco_cpfs || []).includes(this.cpfUsuario) ||
                                     escala.motorista_cpf === this.cpfUsuario;
            return dataEscala === dataStr && pertenceAoUsuario;
        });

        minhasEscalas.forEach(escala => {
            const evento = this.eventos.find(e => e.id === escala.evento_id);
            if (evento) {
                eventosoDia.push({
                    ...evento,
                    status: this.determinarStatusEvento(evento),
                    escala: escala
                });
            }
        });

        return eventosoDia;
    }

    /**
     * Determina o status do evento baseado em seus campos
     */
    determinarStatusEvento(evento) {
        const statusPagamento = evento.status_pagamento?.toLowerCase() || '';
        const statusEvento = evento.status_evento?.toLowerCase() || '';
        const statusConfirmacao = evento.status_confirmacao?.toLowerCase() || '';

        // Prioridade: pagamento > confirmação > evento
        if (statusPagamento.includes('pago') || statusPagamento.includes('confirmado')) {
            return 'confirmado';
        }
        if (statusPagamento.includes('não') || statusPagamento.includes('nao')) {
            return 'nao_pago';
        }
        if (statusConfirmacao.includes('confirmado') || statusEvento.includes('confirmado')) {
            return 'confirmado';
        }
        if (statusEvento.includes('reservado')) {
            return 'reservado';
        }
        return 'pendente';
    }

    /**
     * Obtém cor baseada no status do evento
     */
    obterCorEvento(status) {
        const cores = {
            'confirmado': '#28a745',
            'pago': '#28a745',
            'pendente': '#ffc107',
            'reservado': '#007bff',
            'nao_pago': '#dc3545',
            'cancelado': '#dc3545'
        };
        return cores[status?.toLowerCase()] || '#007bff';
    }

    /**
     * Obtém previsão do tempo para uma localização
     */
    async obterPrevisaoTempo(latitude, longitude) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${this.apiWeatherKey}`
            );
            const data = await response.json();

            if (data.cod === 200) {
                return {
                    temp: data.main.temp,
                    sensacao: data.main.feels_like,
                    umidade: data.main.humidity,
                    vento: data.wind.speed,
                    condicao: data.weather[0].main,
                    descricao: data.weather[0].description,
                    icone: data.weather[0].icon
                };
            }
        } catch (error) {
            console.error('Erro ao obter previsão:', error);
        }
        return null;
    }

    /**
     * Monta HTML da previsão do tempo
     */
    montarHTMLPrevisao(previsao) {
        if (!previsao) return '';

        const iconUrl = `https://openweathermap.org/img/wn/${previsao.icone}@2x.png`;

        return `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border-radius: 8px; margin-top: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${iconUrl}" alt="Previsão" style="width: 60px; height: 60px;">
                    <div>
                        <p style="margin: 0; font-size: 0.9rem; text-transform: capitalize;">${previsao.descricao}</p>
                        <p style="margin: 0.25rem 0; font-size: 1.2rem; font-weight: 600;">${Math.round(previsao.temp)}°C</p>
                        <p style="margin: 0; font-size: 0.8rem;">Sensação: ${Math.round(previsao.sensacao)}° | Umidade: ${previsao.umidade}% | Vento: ${previsao.vento} m/s</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtém coordenadas do CEP
     */
    async obterCoordenadas(cep) {
        try {
            const response = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
            const data = await response.json();
            if (data.lat && data.lng) {
                return {
                    latitude: parseFloat(data.lat),
                    longitude: parseFloat(data.lng)
                };
            }
        } catch (error) {
            console.error('Erro ao obter coordenadas:', error);
        }
        return null;
    }

    /**
     * Monta URL do Google Maps para rota
     */
    montarRotaGoogleMaps(endereco) {
        const encodedEndereco = encodeURIComponent(endereco);
        return `https://www.google.com/maps/search/${encodedEndereco}`;
    }

    /**
     * Formata dados de evento para exibição
     */
    formatarEventoParaExibicao(evento, index) {
        const dataEvento = new Date(evento.data_evento + 'T00:00:00');
        const dataFormatada = dataEvento.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const horaEvento = evento.hora_evento || 'Não informada';
        const horaSaida = evento.hora_saida || 'Não informada';

        let enderecoCompleto = '';
        if (evento.logradouro_local_evento) {
            enderecoCompleto = `${evento.logradouro_local_evento} ${evento.numero_local_evento || ''}, ${evento.bairro_local_evento || ''} - ${evento.cidade_local_evento || ''}`.trim();
        }

        const status = this.determinarStatusEvento(evento);
        const corStatus = this.obterCorEvento(status);
        const textStatus = {
            'confirmado': 'Confirmado',
            'pendente': 'Pendente',
            'reservado': 'Reservado',
            'nao_pago': 'Não Pago',
            'cancelado': 'Cancelado'
        }[status] || 'Desconhecido';

        return {
            dataFormatada,
            horaEvento,
            horaSaida,
            enderecoCompleto,
            corStatus,
            status,
            textStatus
        };
    }
}

// Função global para mostrar eventos do dia
async function mostrarEventosDia(dataStr) {
    const painel = new PainelEventosUsuario();
    painel.cpfUsuario = (JSON.parse(sessionStorage.getItem('usuarioLogado') || '{}').cpf_usuario || '').replace(/\D/g, '');
    painel.carregarDados();

    const eventosoDia = painel.obterEventosDia(dataStr);
    const container = document.getElementById('eventosDodia');

    if (!container) {
        console.error('Container eventosDodia não encontrado');
        return;
    }

    if (eventosoDia.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">📭 Nenhum evento neste dia</p>';
        return;
    }

    const dataBR = new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    let html = `<h3 style="margin-bottom: 1rem; color: #333;">📅 Eventos em ${dataBR}</h3>`;

    for (let i = 0; i < eventosoDia.length; i++) {
        const evento = eventosoDia[i];
        const formatado = painel.formatarEventoParaExibicao(evento, i);

        html += `
            <div style="background: white; border-left: 4px solid ${formatado.corStatus}; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #333;">👤 ${evento.nome_cliente_evento || 'Evento sem nome'}</h4>
                        <p style="margin: 0.25rem 0; color: #666;"><strong>🏢 Local:</strong> ${evento.nome_local_evento || 'Não informado'}</p>
                        ${formatado.enderecoCompleto ? `<p style="margin: 0.25rem 0; color: #666;"><strong>📍 Endereço:</strong> ${formatado.enderecoCompleto}</p>` : ''}
                        <p style="margin: 0.25rem 0; color: #666;"><strong>🕐 Horário:</strong> ${formatado.horaEvento}</p>
                        <p style="margin: 0.25rem 0; color: #666;"><strong>🚗 Saída:</strong> ${formatado.horaSaida}</p>
                        <p style="margin: 0.5rem 0 0; padding: 0.5rem 0.75rem; background: ${formatado.corStatus}; color: white; border-radius: 4px; width: fit-content; font-size: 0.9rem; font-weight: 600;">
                            ${formatado.textStatus}
                        </p>

                        <!-- Previsão do Tempo -->
                        <div id="previsao_${i}" style="margin-top: 0.75rem; display: none;">
                            <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">⏳ Carregando previsão do tempo...</p>
                        </div>

                        <!-- Botão de navegação -->
                        ${formatado.enderecoCompleto ? `
                            <a href="${painel.montarRotaGoogleMaps(formatado.enderecoCompleto)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 0.75rem; padding: 0.5rem 1rem; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 0.9rem; cursor: pointer;">
                                🗺️ Ver no Mapa
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Carregar previsão do tempo depois
        if (evento.cep_evento) {
            (async () => {
                const cep = evento.cep_evento.replace(/\D/g, '');
                if (cep && cep.length === 8) {
                    const coords = await painel.obterCoordenadas(cep);
                    if (coords) {
                        const previsao = await painel.obterPrevisaoTempo(coords.latitude, coords.longitude);
                        const prevDiv = document.getElementById(`previsao_${i}`);
                        if (prevDiv) {
                            prevDiv.style.display = 'block';
                            prevDiv.innerHTML = painel.montarHTMLPrevisao(previsao);
                        }
                    }
                }
            })();
        }
    }

    container.innerHTML = html;
}

// Função para inicializar o painel quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado') || 'null');
    if (!usuarioLogado) return;

    const painel = new PainelEventosUsuario();
    const cpf = (usuarioLogado.cpf_usuario || '').replace(/\D/g, '');
    const nome = usuarioLogado.nome_usuario || 'Usuário';

    painel.init(cpf, nome);
});
