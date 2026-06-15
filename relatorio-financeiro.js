// ==================== RELATORIO-FINANCEIRO.JS ====================
console.log('💰 relatorio-financeiro.js carregado!');

// ==================== FUNÇÃO PRINCIPAL PARA CARREGAR RELATÓRIO FINANCEIRO ====================

function carregarRelatorioFinanceiro(container) {
    console.log('💰 Carregando relatório financeiro...');
    
    // Verificar se container existe
    if (!container) {
        console.error('❌ Container do relatório financeiro não encontrado!');
        return;
    }
    
    // Tentar carregar eventos de diferentes chaves do localStorage
    let eventos = [];
    
    try {
        const stored = localStorage.getItem('eventos_cadastrados');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) eventos = parsed;
            console.log('✅ Eventos carregados de eventos_cadastrados:', eventos.length);
        }
    } catch(e) { console.error('Erro ao ler eventos_cadastrados:', e); }
    
    if (eventos.length === 0) {
        try {
            const stored = localStorage.getItem('eventos');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) eventos = parsed;
                console.log('✅ Eventos carregados de eventos:', eventos.length);
            }
        } catch(e) { console.error('Erro ao ler eventos:', e); }
    }
    
    console.log('📊 Total de eventos encontrados para financeiro:', eventos.length);
    
    // CALCULAR ESTATÍSTICAS
    let totalReceitas = 0;
    let totalPago = 0;
    let totalPendente = 0;
    let eventosPagos = 0;
    let eventosPendentes = 0;
    let eventosRealizados = 0;
    let eventosCancelados = 0;
    let eventosAgendados = 0;
    let totalDescontos = 0;
    let totalDeslocamentos = 0;
    
    for (let i = 0; i < eventos.length; i++) {
        const e = eventos[i];
        
        // Calcular valor total
        let valor = 0;
        if (e.valor_total) valor = parseFloat(e.valor_total);
        else if (e.valor) valor = parseFloat(e.valor);
        else if (e.valor_evento) valor = parseFloat(e.valor_evento);
        
        if (isNaN(valor)) valor = 0;
        totalReceitas += valor;
        
        // Calcular descontos e deslocamentos
        let desconto = 0;
        let deslocamento = 0;
        if (e.desconto) desconto = parseFloat(e.desconto);
        if (e.deslocamento) deslocamento = parseFloat(e.deslocamento);
        if (!isNaN(desconto)) totalDescontos += desconto;
        if (!isNaN(deslocamento)) totalDeslocamentos += deslocamento;
        
        // Calcular valor pago
        let sinal = 0;
        let avulso = 0;
        
        if (e.valor_sinal) sinal = parseFloat(e.valor_sinal);
        else if (e.sinal) sinal = parseFloat(e.sinal);
        
        if (e.valor_avulso) avulso = parseFloat(e.valor_avulso);
        else if (e.avulso) avulso = parseFloat(e.avulso);
        
        let pago = sinal + avulso;
        if (e.valor_pago) pago = parseFloat(e.valor_pago);
        if (isNaN(pago)) pago = 0;
        
        totalPago += pago;
        
        const pendente = valor - pago;
        if (pendente > 0) totalPendente += pendente;
        
        if (pendente <= 0.01) {
            eventosPagos++;
        } else {
            eventosPendentes++;
        }
        
        // Verificar status do evento
        const status = (e.status_evento || e.status || '').toLowerCase();
        if (status === 'realizado' || status === 'finalizado') {
            eventosRealizados++;
        } else if (status === 'cancelado') {
            eventosCancelados++;
        } else {
            eventosAgendados++;
        }
    }
    
    // Calcular receita média
    const receitaMedia = eventos.length > 0 ? totalReceitas / eventos.length : 0;
    const ticketMedio = eventosPagos > 0 ? totalPago / eventosPagos : 0;
    
    // Buscar contas a receber
    let contasReceber = [];
    try {
        const stored = localStorage.getItem('contas_receber');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) contasReceber = parsed;
        }
    } catch(e) {}
    
    let totalContasPendentes = 0;
    for (let i = 0; i < contasReceber.length; i++) {
        const conta = contasReceber[i];
        if (conta.status !== 'pago' && conta.status !== 'recebido') {
            totalContasPendentes += parseFloat(conta.valor || 0);
        }
    }
    
    // Buscar contas a pagar
    let contasPagar = [];
    try {
        const stored = localStorage.getItem('contas_pagar');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) contasPagar = parsed;
        }
    } catch(e) {}
    
    let totalContasPagar = 0;
    for (let i = 0; i < contasPagar.length; i++) {
        const conta = contasPagar[i];
        if (conta.status !== 'pago') {
            totalContasPagar += parseFloat(conta.valor || 0);
        }
    }
    
    // Calcular lucro estimado
    const lucroEstimado = totalPago - totalContasPagar;
    
    // RENDERIZAR HTML
    container.innerHTML = `
        <div class="financeiro-container">
            <!-- Cards Principais -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: linear-gradient(135deg, #1e8e3e, #28a745); padding: 1.5rem; border-radius: 12px; text-align: center; color: white;">
                    <div style="font-size: 2.5rem;">💰</div>
                    <div style="font-size: 2rem; font-weight: bold;">${formatarMoeda(totalReceitas)}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Receita Total</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #0066cc, #007bff); padding: 1.5rem; border-radius: 12px; text-align: center; color: white;">
                    <div style="font-size: 2.5rem;">✅</div>
                    <div style="font-size: 2rem; font-weight: bold;">${formatarMoeda(totalPago)}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Valor Recebido</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #e68a00, #ffc107); padding: 1.5rem; border-radius: 12px; text-align: center; color: #333;">
                    <div style="font-size: 2.5rem;">⏳</div>
                    <div style="font-size: 2rem; font-weight: bold;">${formatarMoeda(totalPendente)}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Saldo Pendente</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #6f42c1, #8b5cf6); padding: 1.5rem; border-radius: 12px; text-align: center; color: white;">
                    <div style="font-size: 2.5rem;">📊</div>
                    <div style="font-size: 2rem; font-weight: bold;">${eventos.length}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Total de Eventos</div>
                </div>
            </div>
            
            <!-- Cards de Detalhes -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center; border-left: 4px solid #28a745;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #28a745;">${formatarMoeda(receitaMedia)}</div>
                    <div style="font-size: 12px; color: #666;">Receita Média</div>
                </div>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center; border-left: 4px solid #007bff;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #007bff;">${formatarMoeda(ticketMedio)}</div>
                    <div style="font-size: 12px; color: #666;">Ticket Médio</div>
                </div>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center; border-left: 4px solid #28a745;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #28a745;">✅ ${eventosPagos}</div>
                    <div style="font-size: 12px; color: #666;">Eventos Pagos</div>
                </div>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center; border-left: 4px solid #ffc107;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #856404;">⏳ ${eventosPendentes}</div>
                    <div style="font-size: 12px; color: #666;">Eventos Pendentes</div>
                </div>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center; border-left: 4px solid #28a745;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #28a745;">🎉 ${eventosRealizados}</div>
                    <div style="font-size: 12px; color: #666;">Realizados</div>
                </div>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center; border-left: 4px solid #ffc107;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #856404;">📅 ${eventosAgendados}</div>
                    <div style="font-size: 12px; color: #666;">Agendados</div>
                </div>
            </div>
            
            <!-- Cards de Custos -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #856404;">${formatarMoeda(totalDescontos)}</div>
                    <div style="font-size: 12px; color: #666;">Descontos</div>
                </div>
                
                <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #856404;">${formatarMoeda(totalDeslocamentos)}</div>
                    <div style="font-size: 12px; color: #666;">Deslocamentos</div>
                </div>
                
                <div style="background: #f8d7da; padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #721c24;">${formatarMoeda(totalContasPagar)}</div>
                    <div style="font-size: 12px; color: #666;">A Pagar</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; border-radius: 8px; text-align: center; color: white;">
                    <div style="font-size: 1.2rem; font-weight: bold;">💎 ${formatarMoeda(lucroEstimado)}</div>
                    <div style="font-size: 12px; opacity: 0.8;">Lucro Estimado</div>
                </div>
            </div>
            
            <!-- Contas -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: #e8f4fd; padding: 1rem; border-radius: 8px;">
                    <h3 style="margin: 0 0 0.5rem 0; color: #007bff;">📥 Contas a Receber</h3>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #007bff;">${formatarMoeda(totalContasPendentes)}</div>
                    <div style="font-size: 12px; color: #666;">${contasReceber.length} contas</div>
                    <button class="btn" onclick="showPage('contas_receber')" style="margin-top: 10px; background: #007bff; color: white; width: 100%;">Ver Detalhes</button>
                </div>
                
                <div style="background: #f8d7da; padding: 1rem; border-radius: 8px;">
                    <h3 style="margin: 0 0 0.5rem 0; color: #dc3545;">📤 Contas a Pagar</h3>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #dc3545;">${formatarMoeda(totalContasPagar)}</div>
                    <div style="font-size: 12px; color: #666;">${contasPagar.length} contas</div>
                    <button class="btn" onclick="showPage('contas_pagar')" style="margin-top: 10px; background: #dc3545; color: white; width: 100%;">Ver Detalhes</button>
                </div>
            </div>
            
            <!-- Botões -->
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
                <p style="color: #666; margin-bottom: 1rem;">Para mais detalhes financeiros:</p>
                <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn" onclick="showPage('contas_receber')" style="background: #17a2b8; color: white;">📥 Contas a Receber</button>
                    <button class="btn" onclick="showPage('contas_pagar')" style="background: #6c757d; color: white;">📤 Contas a Pagar</button>
                    <button class="btn" onclick="showPage('fluxo_caixa')" style="background: #28a745; color: white;">💵 Fluxo de Caixa</button>
                    <button class="btn" onclick="gerarRelatorioFinanceiroDetalhado()" style="background: #007bff; color: white;">📄 Relatório Detalhado</button>
                    <button class="btn" onclick="exportarRelatorioFinanceiro()" style="background: #28a745; color: white;">📤 Exportar CSV</button>
                </div>
            </div>
            
            <!-- Tabela de Eventos -->
            <div style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;">📋 Detalhamento de Eventos</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 10px; text-align: left;">Data</th>
                                <th style="padding: 10px; text-align: left;">Cliente</th>
                                <th style="padding: 10px; text-align: left;">Local</th>
                                <th style="padding: 10px; text-align: right;">Valor Total</th>
                                <th style="padding: 10px; text-align: right;">Valor Pago</th>
                                <th style="padding: 10px; text-align: right;">Saldo</th>
                                <th style="padding: 10px; text-align: center;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${gerarLinhasEventosFinanceiros(eventos.slice(0, 10))}
                        </tbody>
                    </table>
                </div>
                ${eventos.length > 10 ? `<div style="margin-top: 0.5rem; text-align: center;"><small>Mostrando 10 de ${eventos.length} eventos</small></div>` : ''}
            </div>
        </div>
    `;
    
    console.log('✅ Relatório financeiro renderizado com sucesso!');
}

function gerarLinhasEventosFinanceiros(eventos) {
    if (eventos.length === 0) {
        return `<tr><td colspan="7" style="text-align: center; padding: 2rem;">Nenhum evento cadastrado</td></tr>`;
    }
    
    let html = '';
    for (let i = 0; i < eventos.length; i++) {
        const e = eventos[i];
        const valorTotal = parseFloat(e.valor_total || e.valor || 0);
        
        let valorPago = 0;
        const sinal = parseFloat(e.valor_sinal || e.sinal || 0);
        const avulso = parseFloat(e.valor_avulso || e.avulso || 0);
        valorPago = sinal + avulso;
        if (e.valor_pago) valorPago = parseFloat(e.valor_pago);
        
        const saldo = valorTotal - valorPago;
        const status = saldo <= 0 ? 'Pago' : (valorPago > 0 ? 'Parcial' : 'Pendente');
        const statusColor = saldo <= 0 ? '#28a745' : (valorPago > 0 ? '#ffc107' : '#dc3545');
        
        html += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px;">${formatarData(e.data_evento || e.data)}</td>
                <td style="padding: 8px;">${e.cliente_nome || e.cliente || e.nome_cliente_evento || '-'}</td>
                <td style="padding: 8px;">${e.local || e.nome_local_evento || '-'}</td>
                <td style="padding: 8px; text-align: right;">${formatarMoeda(valorTotal)}</td>
                <td style="padding: 8px; text-align: right;">${formatarMoeda(valorPago)}</td>
                <td style="padding: 8px; text-align: right; color: ${statusColor}; font-weight: bold;">${formatarMoeda(saldo)}</td>
                <td style="padding: 8px; text-align: center;"><span style="background: ${statusColor}; color: ${statusColor === '#ffc107' ? '#333' : 'white'}; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${status}</span></td>
            </tr>
        `;
    }
    return html;
}

// ==================== FUNÇÃO PARA GERAR RELATÓRIO DETALHADO ====================

function gerarRelatorioFinanceiroDetalhado() {
    console.log('📄 Gerando relatório financeiro detalhado...');
    
    let eventos = [];
    
    try {
        const stored = localStorage.getItem('eventos_cadastrados');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) eventos = parsed;
        }
    } catch(e) {}
    
    if (eventos.length === 0) {
        try {
            const stored = localStorage.getItem('eventos');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) eventos = parsed;
            }
        } catch(e) {}
    }
    
    const dataAtual = new Date().toLocaleString('pt-BR');
    
    let totalReceitas = 0;
    let totalPago = 0;
    
    for (let i = 0; i < eventos.length; i++) {
        const e = eventos[i];
        const valor = parseFloat(e.valor_total || e.valor || 0);
        totalReceitas += valor;
        
        const sinal = parseFloat(e.valor_sinal || e.sinal || 0);
        const avulso = parseFloat(e.valor_avulso || e.avulso || 0);
        totalPago += (sinal + avulso);
    }
    
    let tableRows = '';
    for (let i = 0; i < eventos.length; i++) {
        const e = eventos[i];
        const valorTotal = parseFloat(e.valor_total || e.valor || 0);
        const sinal = parseFloat(e.valor_sinal || e.sinal || 0);
        const avulso = parseFloat(e.valor_avulso || e.avulso || 0);
        const valorPago = sinal + avulso;
        const saldoDevedor = valorTotal - valorPago;
        
        tableRows += `
            <tr>
                <td>${formatarData(e.data_evento || e.data)}</td>
                <td>${e.cliente_nome || e.cliente || e.nome_cliente_evento || '-'}</td>
                <td>${e.local || e.nome_local_evento || '-'}</td>
                <td style="text-align: right;">${formatarMoeda(valorTotal)}</td>
                <td style="text-align: right;">${formatarMoeda(valorPago)}</td>
                <td style="text-align: right; ${saldoDevedor > 0 ? 'color: #dc3545;' : 'color: #28a745;'}">${formatarMoeda(saldoDevedor)}</td>
                <td>${e.status_evento || e.status || 'Reservado'}</td>
            </tr>
        `;
    }
    
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Relatório Financeiro Detalhado</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #28a745; }
                .header h1 { color: #28a745; }
                .resumo { display: flex; justify-content: space-between; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
                .resumo-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; flex: 1; min-width: 150px; }
                .resumo-card h3 { margin-bottom: 10px; color: #666; }
                .resumo-card .valor { font-size: 24px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f2f2f2; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                @media print { body { margin: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>💰 Relatório Financeiro Detalhado</h1>
                <p>Gerado em: ${dataAtual}</p>
            </div>
            <div class="resumo">
                <div class="resumo-card"><h3>Total de Eventos</h3><div class="valor">${eventos.length}</div></div>
                <div class="resumo-card"><h3>Receita Total</h3><div class="valor" style="color: #28a745;">${formatarMoeda(totalReceitas)}</div></div>
                <div class="resumo-card"><h3>Valor Recebido</h3><div class="valor" style="color: #007bff;">${formatarMoeda(totalPago)}</div></div>
                <div class="resumo-card"><h3>Saldo Pendente</h3><div class="valor" style="color: #dc3545;">${formatarMoeda(totalReceitas - totalPago)}</div></div>
            </div>
            <h3>📋 Detalhamento dos Eventos</h3>
            <table><thead><tr><th>Data</th><th>Cliente</th><th>Local</th><th>Valor Total</th><th>Valor Pago</th><th>Saldo</th><th>Status</th></tr></thead><tbody>${tableRows || '<tr><td colspan="7" style="text-align:center;">Nenhum evento encontrado</td></tr>'}</tbody></table>
            <div class="footer"><p>Documento gerado automaticamente pelo Sistema de Gestão de Eventos</p></div>
            <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
        </body>
        </html>
    `);
    win.document.close();
}

// ==================== FUNÇÃO PARA EXPORTAR CSV ====================

function exportarRelatorioFinanceiro() {
    console.log('📤 Exportando relatório financeiro...');
    
    let eventos = [];
    
    try {
        const stored = localStorage.getItem('eventos_cadastrados');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) eventos = parsed;
        }
    } catch(e) {}
    
    if (eventos.length === 0) {
        try {
            const stored = localStorage.getItem('eventos');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) eventos = parsed;
            }
        } catch(e) {}
    }
    
    const headers = ['Data', 'Cliente', 'Local', 'Valor Total', 'Valor Sinal', 'Valor Avulso', 'Valor Pago', 'Saldo', 'Status Evento'];
    const rows = [];
    
    for (let i = 0; i < eventos.length; i++) {
        const e = eventos[i];
        const valorTotal = parseFloat(e.valor_total || e.valor || 0);
        const sinal = parseFloat(e.valor_sinal || e.sinal || 0);
        const avulso = parseFloat(e.valor_avulso || e.avulso || 0);
        const valorPago = sinal + avulso;
        const saldo = valorTotal - valorPago;
        
        rows.push([
            formatarData(e.data_evento || e.data),
            e.cliente_nome || e.cliente || e.nome_cliente_evento || '-',
            e.local || e.nome_local_evento || '-',
            valorTotal.toFixed(2),
            sinal.toFixed(2),
            avulso.toFixed(2),
            valorPago.toFixed(2),
            saldo.toFixed(2),
            e.status_evento || e.status || 'Reservado'
        ]);
    }
    
    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    mostrarMensagemToast('📤 Relatório financeiro exportado com sucesso!');
}

// ==================== FUNÇÃO AUXILIAR ====================

function formatarData(dataString) {
    if (!dataString) return '--/--/----';
    try {
        const data = new Date(dataString);
        if (isNaN(data.getTime())) {
            const partes = dataString.split('-');
            if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
            return '--/--/----';
        }
        return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
    } catch(e) {
        return '--/--/----';
    }
}

function formatarMoeda(valor) {
    if (valor === undefined || valor === null || isNaN(valor)) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mostrarMensagemToast(mensagem, isError = false) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${isError ? '#dc3545' : '#28a745'};
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
}

// Adicionar estilo de animação
if (!document.getElementById('toastAnimationStyle')) {
    const style = document.createElement('style');
    style.id = 'toastAnimationStyle';
    style.textContent = `@keyframes fadeInOut {0%{opacity:0;transform:translateX(20px)}15%{opacity:1;transform:translateX(0)}85%{opacity:1;transform:translateX(0)}100%{opacity:0;transform:translateX(20px)}}`;
    document.head.appendChild(style);
}

// ==================== EXPORTAR FUNÇÕES GLOBAIS ====================
window.carregarRelatorioFinanceiro = carregarRelatorioFinanceiro;
window.gerarRelatorioFinanceiroDetalhado = gerarRelatorioFinanceiroDetalhado;
window.exportarRelatorioFinanceiro = exportarRelatorioFinanceiro;

console.log('✅ relatorio-financeiro.js carregado com sucesso!');