// ==================== GERENCIAR EVENTOS - FILTROS E VISUALIZAÇÃO ====================

// Função para carregar eventos reservados
function carregarEventosReservados() {
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const tbody = document.getElementById('tabelaEventosReservados');
    
    if (!tbody) return;
    
    // Filtrar eventos com status 'reservado'
    const eventosReservados = eventos.filter(evento => {
        return (evento.status || '').toLowerCase() === 'reservado';
    });
    
    if (eventosReservados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;">Nenhum evento reservado</td></tr>';
        atualizarTotaisReservados([]);
        return;
    }
    
    tbody.innerHTML = '';
    
    eventosReservados.forEach((evento, index) => {
        const tr = document.createElement('tr');
        
        const dataEvento = evento.data_evento || '-';
        const horaEvento = evento.hora_evento || '-';
        const cliente = evento.nome_cliente_evento || '-';
        const local = evento.nome_local_evento || evento.casa_festa_nome || '-';
        const personagens = evento.personagens_selecionados || [];
        const valorTotal = evento.valor_total || 'R$ 0,00';
        const statusPagamento = evento.status_pagamento || 'Pendente';
        
        // Determinar cor da linha baseada nos campos de pagamento
        const sinalPago = evento.sinal_pago_status === 'true';
        const restanteRecebido = evento.valor_restante_recebido === 'true';
        let backgroundColor = '';
        if (!sinalPago) {
            backgroundColor = '#8a2be2'; // Roxa
        } else if (sinalPago && !restanteRecebido) {
            backgroundColor = '#ffff00'; // Amarela
        } else if (sinalPago && restanteRecebido) {
            backgroundColor = '#00ff00'; // Verde
        }
        
        if (backgroundColor) {
            tr.style.backgroundColor = backgroundColor;
        }
        
        let personagensTexto = '';
        if (Array.isArray(personagens) && personagens.length > 0) {
            personagensTexto = personagens.map(p => p.nome || 'Sem nome').join(', ');
        } else {
            personagensTexto = '-';
        }
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${dataEvento}<br><small>${horaEvento}</small></td>
            <td>${cliente}</td>
            <td>${local}</td>
            <td>${personagensTexto}</td>
            <td>${valorTotal}</td>
            <td><span class="badge badge-${statusPagamento.toLowerCase()}">${statusPagamento}</span></td>
            <td>
                <button class="btn btn-sm" onclick="visualizarEventoById('${evento.id || index}')">Ver</button>
                <button class="btn btn-sm" onclick="editarEventoById('${evento.id || index}')">Editar</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    atualizarTotaisReservados(eventosReservados);
}

// Função para atualizar totais de eventos reservados
function atualizarTotaisReservados(eventos) {
    const totalEventos = document.getElementById('totalEventosReservados');
    const valorTotal = document.getElementById('valorTotalReservados');
    const pendentes = document.getElementById('pendentesReservados');
    
    if (totalEventos) totalEventos.textContent = eventos.length;
    
    let somaTotal = 0;
    let somaPendente = 0;
    
    eventos.forEach(evento => {
        const valor = parseFloat((evento.valor_total || '0').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        somaTotal += valor;
        
        if (evento.status_pagamento !== 'Pago') {
            somaPendente += valor;
        }
    });
    
    if (valorTotal) valorTotal.textContent = `R$ ${somaTotal.toFixed(2).replace('.', ',')}`;
    if (pendentes) pendentes.textContent = `R$ ${somaPendente.toFixed(2).replace('.', ',')}`;
}

// Função para carregar eventos finalizados
function carregarEventosFinalizados() {
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const container = document.getElementById('listaFinalizados');
    
    if (!container) return;
    
    const hoje = new Date();
    
    // Filtrar eventos finalizados (data + hora de saída já passou)
    const eventosFinalizados = eventos.filter(evento => {
        if (!evento.data_evento || !evento.hora_saida) return false;
        
        const dataEvento = new Date(evento.data_evento + 'T' + evento.hora_saida);
        return dataEvento < hoje;
    }).sort((a, b) => {
        const dataA = new Date(a.data_evento + 'T' + a.hora_saida);
        const dataB = new Date(b.data_evento + 'T' + b.hora_saida);
        return dataB - dataA; // Mais recentes primeiro
    });
    
    if (eventosFinalizados.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#666;">Nenhum evento finalizado</div>';
        atualizarEstatisticasFinalizados([]);
        return;
    }
    
    container.innerHTML = '';
    
    eventosFinalizados.forEach((evento, index) => {
        const card = document.createElement('div');
        card.className = 'evento-finalizado-card';
        card.style.cssText = 'background:#fff;border:1px solid #ddd;border-radius:8px;padding:1.5rem;margin-bottom:1rem;';
        
        const dataEvento = evento.data_evento || '-';
        const horaEvento = evento.hora_evento || '-';
        const horaSaida = evento.hora_saida || '-';
        const cliente = evento.nome_cliente_evento || '-';
        const local = evento.nome_local_evento || evento.casa_festa_nome || '-';
        const valorTotal = evento.valor_total || 'R$ 0,00';
        const statusPagamento = evento.status_pagamento || 'Pendente';
        const avaliacao = evento.avaliacao || 0;
        
        let estrelas = '';
        for (let i = 0; i < 5; i++) {
            estrelas += i < avaliacao ? '⭐' : '☆';
        }
        
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <h4 style="margin:0;">${cliente}</h4>
                <span class="badge badge-${statusPagamento.toLowerCase()}">${statusPagamento}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.5rem;margin-bottom:1rem;">
                <p style="margin:0;"><strong>📅 Data:</strong> ${dataEvento}</p>
                <p style="margin:0;"><strong>🕐 Entrada:</strong> ${horaEvento}</p>
                <p style="margin:0;"><strong>🕐 Saída:</strong> ${horaSaida}</p>
                <p style="margin:0;"><strong>📍 Local:</strong> ${local}</p>
            </div>
            <p style="margin:0.5rem 0;"><strong>💰 Valor:</strong> ${valorTotal}</p>
            <p style="margin:0.5rem 0;"><strong>⭐ Avaliação:</strong> ${estrelas} ${avaliacao > 0 ? `(${avaliacao}/5)` : 'Sem avaliação'}</p>
            <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
                <button class="btn btn-sm" onclick="visualizarEvento(${index})">👁️ Ver Detalhes</button>
                ${avaliacao === 0 ? `<button class="btn btn-sm" style="background:#ffc107;" onclick="avaliarEvento(${index})">⭐ Avaliar</button>` : ''}
                <button class="btn btn-sm" style="background:#28a745;color:#fff;" onclick="gerarRelatorioEvento(${index})">📄 Relatório</button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    atualizarEstatisticasFinalizados(eventosFinalizados);
}

// Função para atualizar estatísticas de eventos finalizados
function atualizarEstatisticasFinalizados(eventos) {
    const totalFinalizados = document.getElementById('totalFinalizados');
    const receitaFinalizados = document.getElementById('receitaFinalizados');
    const avaliacaoMedia = document.getElementById('avaliacaoMedia');
    const pendentesAvaliacao = document.getElementById('pendentesAvaliacao');
    
    if (totalFinalizados) totalFinalizados.textContent = eventos.length;
    
    let somaReceita = 0;
    let somaAvaliacoes = 0;
    let countAvaliacoes = 0;
    let countSemAvaliacao = 0;
    
    eventos.forEach(evento => {
        const valor = parseFloat((evento.valor_total || '0').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        somaReceita += valor;
        
        const avaliacao = evento.avaliacao || 0;
        if (avaliacao > 0) {
            somaAvaliacoes += avaliacao;
            countAvaliacoes++;
        } else {
            countSemAvaliacao++;
        }
    });
    
    if (receitaFinalizados) receitaFinalizados.textContent = `R$ ${somaReceita.toFixed(2).replace('.', ',')}`;
    
    const media = countAvaliacoes > 0 ? (somaAvaliacoes / countAvaliacoes).toFixed(1) : '0.0';
    if (avaliacaoMedia) avaliacaoMedia.textContent = `${media} ⭐`;
    
    if (pendentesAvaliacao) pendentesAvaliacao.textContent = countSemAvaliacao;
}

// Função para filtrar eventos reservados
function filtrarEventosReservados() {
    const periodo = document.getElementById('periodoReservados')?.value || 'todos';
    const statusPagamento = document.getElementById('statusPagamentoReservados')?.value || 'todos';
    
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const tbody = document.getElementById('tabelaEventosReservados');
    
    if (!tbody) return;
    
    // Filtrar eventos com status 'reservado'
    let eventosFiltrados = eventos.filter(evento => {
        return (evento.status || '').toLowerCase() === 'reservado';
    });
    
    // Filtrar por período
    if (periodo !== 'todos') {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        eventosFiltrados = eventosFiltrados.filter(evento => {
            if (!evento.data_evento) return true;
            const dataEvento = new Date(evento.data_evento + 'T00:00:00');
            
            switch(periodo) {
                case 'hoje':
                    return dataEvento.toDateString() === hoje.toDateString();
                case 'semana':
                    const fimSemana = new Date(hoje);
                    fimSemana.setDate(fimSemana.getDate() + 7);
                    return dataEvento >= hoje && dataEvento <= fimSemana;
                case 'mes':
                    return dataEvento.getMonth() === hoje.getMonth() && 
                           dataEvento.getFullYear() === hoje.getFullYear();
                case 'futuro':
                    return dataEvento >= hoje;
                default:
                    return true;
            }
        });
    }
    
    // Filtrar por status de pagamento
    if (statusPagamento !== 'todos') {
        eventosFiltrados = eventosFiltrados.filter(evento => {
            const status = (evento.status_pagamento || '').toLowerCase();
            
            switch(statusPagamento) {
                case 'pago':
                    return status === 'pago' || status === 'totalmente pago';
                case 'parcial':
                    return status === 'parcial' || status === 'parcialmente pago';
                case 'pendente':
                    return status === 'pendente' || status === '';
                default:
                    return true;
            }
        });
    }
    
    // Renderizar eventos filtrados
    tbody.innerHTML = '';
    
    if (eventosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;">Nenhum evento encontrado com os filtros aplicados</td></tr>';
        atualizarTotaisReservados([]);
        return;
    }
    
    eventosFiltrados.forEach((evento, index) => {
        const tr = document.createElement('tr');
        
        const dataEvento = evento.data_evento || '-';
        const horaEvento = evento.hora_evento || '-';
        const cliente = evento.nome_cliente_evento || '-';
        const local = evento.nome_local_evento || evento.casa_festa_nome || '-';
        const personagens = evento.personagens_selecionados || [];
        const valorTotal = evento.valor_total || 'R$ 0,00';
        const statusPag = evento.status_pagamento || 'Pendente';
        
        // Determinar cor da linha baseada nos campos de pagamento
        const sinalPago = evento.sinal_pago_status === 'true';
        const restanteRecebido = evento.valor_restante_recebido === 'true';
        let backgroundColor = '';
        if (!sinalPago) {
            backgroundColor = '#8a2be2'; // Roxa
        } else if (sinalPago && !restanteRecebido) {
            backgroundColor = '#ffff00'; // Amarela
        } else if (sinalPago && restanteRecebido) {
            backgroundColor = '#00ff00'; // Verde
        }
        
        if (backgroundColor) {
            tr.style.backgroundColor = backgroundColor;
        }
        
        let personagensTexto = '';
        if (Array.isArray(personagens) && personagens.length > 0) {
            personagensTexto = personagens.map(p => p.nome || 'Sem nome').join(', ');
        } else {
            personagensTexto = '-';
        }
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${dataEvento}<br><small>${horaEvento}</small></td>
            <td>${cliente}</td>
            <td>${local}</td>
            <td>${personagensTexto}</td>
            <td>${valorTotal}</td>
            <td><span class="badge badge-${statusPag.toLowerCase()}">${statusPag}</span></td>
            <td>
                <button class="btn btn-sm" onclick="visualizarEventoById('${evento.id || index}')">Ver</button>
                <button class="btn btn-sm" onclick="editarEventoById('${evento.id || index}')">Editar</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    atualizarTotaisReservados(eventosFiltrados);
}

// Função para filtrar eventos finalizados na página
function filtrarEventosFinalizadosPagina() {
    const periodo = document.getElementById('periodoFinalizados')?.value || 'todos';
    const avaliacao = document.getElementById('avaliacaoFinalizados')?.value || 'todos';
    const pagamento = document.getElementById('pagamentoFinalizados')?.value || 'todos';
    
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const container = document.getElementById('listaFinalizados');
    
    if (!container) return;
    
    const hoje = new Date();
    
    let eventosFiltrados = eventos.filter(evento => {
        if (!evento.data_evento || !evento.hora_saida) return false;
        const dataEvento = new Date(evento.data_evento + 'T' + evento.hora_saida);
        return dataEvento < hoje;
    });
    
    // Filtrar por período
    if (periodo !== 'todos') {
        eventosFiltrados = eventosFiltrados.filter(evento => {
            const dataEvento = new Date(evento.data_evento + 'T00:00:00');
            const ontem = new Date(hoje);
            ontem.setDate(ontem.getDate() - 1);
            
            switch(periodo) {
                case 'hoje':
                    return dataEvento.toDateString() === hoje.toDateString();
                case 'ontem':
                    return dataEvento.toDateString() === ontem.toDateString();
                case 'semana':
                    const inicioSemana = new Date(hoje);
                    inicioSemana.setDate(inicioSemana.getDate() - 7);
                    return dataEvento >= inicioSemana && dataEvento <= hoje;
                case 'mes':
                    return dataEvento.getMonth() === hoje.getMonth() && 
                           dataEvento.getFullYear() === hoje.getFullYear();
                case 'mes_anterior':
                    const mesAnterior = new Date(hoje);
                    mesAnterior.setMonth(mesAnterior.getMonth() - 1);
                    return dataEvento.getMonth() === mesAnterior.getMonth() && 
                           dataEvento.getFullYear() === mesAnterior.getFullYear();
                default:
                    return true;
            }
        });
    }
    
    // Filtrar por avaliação
    if (avaliacao !== 'todos') {
        const avaliacaoNum = parseInt(avaliacao);
        eventosFiltrados = eventosFiltrados.filter(evento => {
            const avalEvento = evento.avaliacao || 0;
            return avaliacaoNum === 0 ? avalEvento === 0 : avalEvento === avaliacaoNum;
        });
    }
    
    // Filtrar por status de pagamento
    if (pagamento !== 'todos') {
        eventosFiltrados = eventosFiltrados.filter(evento => {
            const status = (evento.status_pagamento || '').toLowerCase();
            
            switch(pagamento) {
                case 'pago_totalmente':
                    return status === 'pago' || status === 'totalmente pago';
                case 'parcial':
                    return status === 'parcial' || status === 'parcialmente pago';
                case 'pendente':
                    return status === 'pendente' || status === '';
                default:
                    return true;
            }
        });
    }
    
    // Ordenar por data (mais recentes primeiro)
    eventosFiltrados.sort((a, b) => {
        const dataA = new Date(a.data_evento + 'T' + a.hora_saida);
        const dataB = new Date(b.data_evento + 'T' + b.hora_saida);
        return dataB - dataA;
    });
    
    // Renderizar eventos filtrados
    container.innerHTML = '';
    
    if (eventosFiltrados.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#666;">Nenhum evento encontrado com os filtros aplicados</div>';
        atualizarEstatisticasFinalizados([]);
        return;
    }
    
    eventosFiltrados.forEach((evento, index) => {
        const card = document.createElement('div');
        card.className = 'evento-finalizado-card';
        card.style.cssText = 'background:#fff;border:1px solid #ddd;border-radius:8px;padding:1.5rem;margin-bottom:1rem;';
        
        const dataEvento = evento.data_evento || '-';
        const horaEvento = evento.hora_evento || '-';
        const horaSaida = evento.hora_saida || '-';
        const cliente = evento.nome_cliente_evento || '-';
        const local = evento.nome_local_evento || evento.casa_festa_nome || '-';
        const valorTotal = evento.valor_total || 'R$ 0,00';
        const statusPagamento = evento.status_pagamento || 'Pendente';
        const avaliacaoEvento = evento.avaliacao || 0;
        
        let estrelas = '';
        for (let i = 0; i < 5; i++) {
            estrelas += i < avaliacaoEvento ? '⭐' : '☆';
        }
        
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <h4 style="margin:0;">${cliente}</h4>
                <span class="badge badge-${statusPagamento.toLowerCase()}">${statusPagamento}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.5rem;margin-bottom:1rem;">
                <p style="margin:0;"><strong>📅 Data:</strong> ${dataEvento}</p>
                <p style="margin:0;"><strong>🕐 Entrada:</strong> ${horaEvento}</p>
                <p style="margin:0;"><strong>🕐 Saída:</strong> ${horaSaida}</p>
                <p style="margin:0;"><strong>📍 Local:</strong> ${local}</p>
            </div>
            <p style="margin:0.5rem 0;"><strong>💰 Valor:</strong> ${valorTotal}</p>
            <p style="margin:0.5rem 0;"><strong>⭐ Avaliação:</strong> ${estrelas} ${avaliacaoEvento > 0 ? `(${avaliacaoEvento}/5)` : 'Sem avaliação'}</p>
            <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
                <button class="btn btn-sm" onclick="visualizarEvento(${index})">👁️ Ver Detalhes</button>
                ${avaliacaoEvento === 0 ? `<button class="btn btn-sm" style="background:#ffc107;" onclick="avaliarEvento(${index})">⭐ Avaliar</button>` : ''}
                <button class="btn btn-sm" style="background:#28a745;color:#fff;" onclick="gerarRelatorioEvento(${index})">📄 Relatório</button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    atualizarEstatisticasFinalizados(eventosFiltrados);
}

// Funções auxiliares
function resetarFiltrosReservados() {
    if (document.getElementById('periodoReservados')) {
        document.getElementById('periodoReservados').value = 'todos';
    }
    if (document.getElementById('statusPagamentoReservados')) {
        document.getElementById('statusPagamentoReservados').value = 'todos';
    }
    carregarEventosReservados();
}

function resetarFiltrosFinalizadosPagina() {
    if (document.getElementById('periodoFinalizados')) {
        document.getElementById('periodoFinalizados').value = 'todos';
    }
    if (document.getElementById('avaliacaoFinalizados')) {
        document.getElementById('avaliacaoFinalizados').value = 'todos';
    }
    if (document.getElementById('pagamentoFinalizados')) {
        document.getElementById('pagamentoFinalizados').value = 'todos';
    }
    carregarEventosFinalizados();
}

function exportarEventosReservados() {
    alert('Função de exportação em desenvolvimento');
}

function exportarEventosFinalizados() {
    alert('Função de exportação em desenvolvimento');
}

function imprimirRelatorioFinalizados() {
    window.print();
}

function avaliarEvento(index) {
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const evento = eventos[index];
    
    if (!evento) return;
    
    const avaliacao = prompt('Avalie o evento de 1 a 5 estrelas:', '5');
    if (avaliacao && !isNaN(avaliacao)) {
        const nota = Math.max(1, Math.min(5, parseInt(avaliacao)));
        eventos[index].avaliacao = nota;
        localStorage.setItem('eventos_cadastrados', JSON.stringify(eventos));
        carregarEventosFinalizados();
        alert(`Evento avaliado com ${nota} estrelas!`);
    }
}

function gerarRelatorioEvento(index) {
    alert('Função de geração de relatório em desenvolvimento');
}

// Exportar funções
window.carregarEventosReservados = carregarEventosReservados;
window.carregarEventosFinalizados = carregarEventosFinalizados;
window.filtrarEventosReservados = filtrarEventosReservados;
window.filtrarEventosFinalizadosPagina = filtrarEventosFinalizadosPagina;
window.resetarFiltrosReservados = resetarFiltrosReservados;
window.resetarFiltrosFinalizadosPagina = resetarFiltrosFinalizadosPagina;
window.exportarEventosReservados = exportarEventosReservados;
window.exportarEventosFinalizados = exportarEventosFinalizados;
window.imprimirRelatorioFinalizados = imprimirRelatorioFinalizados;
window.avaliarEvento = avaliarEvento;
window.gerarRelatorioEvento = gerarRelatorioEvento;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Observer para detectar mudanças de página
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList && mutation.target.classList.contains('active')) {
                const pageId = mutation.target.id;
                
                if (pageId === 'reservar_eventos_tabela') {
                    setTimeout(carregarEventosReservados, 100);
                } else if (pageId === 'eventos_finalizados') {
                    setTimeout(carregarEventosFinalizados, 100);
                }
            }
        });
    });
    
    // Observar todas as páginas
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        observer.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
    
    // Carregar dados se já estiver na página ativa
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        const pageId = activePage.id;
        if (pageId === 'reservar_eventos_tabela') {
            carregarEventosReservados();
        } else if (pageId === 'eventos_finalizados') {
            carregarEventosFinalizados();
        }
    }
});

console.log('gerenciar-eventos-filtros.js carregado com sucesso');
