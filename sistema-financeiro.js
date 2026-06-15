// ==================== SISTEMA FINANCEIRO COMPLETO ====================
// Versão corrigida - Contas a Pagar com abas funcionando

// Variável global para armazenar usuários do sistema
let usuariosSistema = [];

// Função para carregar usuários do sistema
function carregarUsuariosSistema() {
    usuariosSistema = JSON.parse(localStorage.getItem('usuarios_sistema') || '[]');
    if (usuariosSistema.length === 0) {
        // Usuário padrão
        usuariosSistema = [{ id: 1, nome: 'Administrador', login: 'admin' }];
        localStorage.setItem('usuarios_sistema', JSON.stringify(usuariosSistema));
    }
}

// ==================== FUNÇÕES PARA ABA EQUIPE ====================

function abrirTabContasPagar(tab) {
    document.querySelectorAll('#contas_pagar .tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    document.querySelectorAll('#contas_pagar .tab-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.background = '#6c757d';
    });
    
    const selectedTab = document.getElementById(`tab-${tab}`);
    if (selectedTab) selectedTab.style.display = 'block';
    
    const clickedBtn = event.target;
    clickedBtn.style.opacity = '1';
    if (tab === 'equipe') clickedBtn.style.background = '#007bff';
    else if (tab === 'funcionarios') clickedBtn.style.background = '#6f42c1';
    else if (tab === 'fornecedores') clickedBtn.style.background = '#20c997';
    
    if (tab === 'equipe') {
        carregarPagamentosEquipe();
    } else if (tab === 'funcionarios') {
        carregarFolhaPagamento();
    } else if (tab === 'fornecedores') {
        carregarContasFornecedores();
    }
}

function carregarPagamentosEquipe() {
    const tipo = document.getElementById('filtroTipoEquipe')?.value || 'todos';
    const statusEventoFiltro = document.getElementById('filtroStatusEventoEquipe')?.value || 'todos';
    
    const tbody = document.getElementById('tabelaPagamentosEquipe');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:2rem;">Carregando...</td></tr>';
    
    const escalas = JSON.parse(localStorage.getItem('escalas_eventos') || '[]');
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const elenco = JSON.parse(localStorage.getItem('elenco') || '[]');
    const motoristas = JSON.parse(localStorage.getItem('motoristas') || '[]');
    
    let pagamentos = [];
    let totalPagar = 0;
    let totalPago = 0;
    
    escalas.forEach(escala => {
        const evento = eventos.find(e => e.id == escala.evento_id);
        if (!evento) return;
        
        // Determinar status do evento baseado na data
        let statusEvento = evento.status || 'a_realizar';
        const dataEvento = new Date(evento.data_evento);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (dataEvento < hoje) {
            statusEvento = 'realizado';
        } else if (dataEvento.toDateString() === hoje.toDateString()) {
            statusEvento = 'a_realizar';
        } else {
            statusEvento = 'a_realizar';
        }
        
        if (evento.status === 'cancelado') statusEvento = 'cancelado';
        
        if (statusEventoFiltro !== 'todos' && statusEvento !== statusEventoFiltro) return;
        
        const tempoEvento = `${evento.duracao || 2}h`;
        const nomeEvento = evento.nome_cliente_evento || 'Evento sem nome';
        
        // Elenco
        if (tipo === 'todos' || tipo === 'elenco') {
            if (escala.personagens_elenco) {
                Object.entries(escala.personagens_elenco).forEach(([personagemId, elencoId]) => {
                    const membro = elenco.find(e => e.id == elencoId || e.ID == elencoId);
                    if (membro) {
                        // Valor zero se evento cancelado
                        let valor = (statusEvento === 'cancelado') ? 0 : 150;
                        const statusPag = escala.pagamentos_elenco?.[elencoId]?.status || 
                                        (statusEvento === 'cancelado' ? 'cancelado' : 'pendente');
                        
                        if (statusEvento === 'cancelado') valor = 0;
                        if (statusEvento === 'realizado' && statusPag === 'pendente') {
                            // Mantém pendente para pagamento após realização
                        }
                        
                        pagamentos.push({
                            id: elencoId,
                            nome: membro.nome || membro.nome_elenco || '-',
                            funcao: 'Elenco',
                            personagem: personagemId,
                            evento: nomeEvento,
                            dataEvento: evento.data_evento,
                            tempoEvento: tempoEvento,
                            valor: valor,
                            statusEvento: statusEvento,
                            statusPag: statusPag,
                            dataPag: escala.pagamentos_elenco?.[elencoId]?.data || '',
                            quemPagou: escala.pagamentos_elenco?.[elencoId]?.quemPagou || '',
                            tipo: 'elenco'
                        });
                        if (statusPag === 'pendente' && statusEvento !== 'cancelado') totalPagar += valor;
                        else if (statusPag === 'pago') totalPago += valor;
                    }
                });
            }
        }
        
        // Motoristas
        if (tipo === 'todos' || tipo === 'motorista') {
            if (escala.motorista_id) {
                const motorista = motoristas.find(m => m.id == escala.motorista_id || m.ID == escala.motorista_id);
                if (motorista) {
                    let valor = (statusEvento === 'cancelado') ? 0 : 100;
                    const statusPag = escala.pagamento_motorista?.status || 
                                    (statusEvento === 'cancelado' ? 'cancelado' : 'pendente');
                    
                    if (statusEvento === 'cancelado') valor = 0;
                    
                    pagamentos.push({
                        id: escala.motorista_id,
                        nome: motorista.nome || motorista.nome_motorista || '-',
                        funcao: 'Motorista',
                        personagem: motorista.veiculo || '-',
                        evento: nomeEvento,
                        dataEvento: evento.data_evento,
                        tempoEvento: tempoEvento,
                        valor: valor,
                        statusEvento: statusEvento,
                        statusPag: statusPag,
                        dataPag: escala.pagamento_motorista?.data || '',
                        quemPagou: escala.pagamento_motorista?.quemPagou || '',
                        tipo: 'motorista'
                    });
                    if (statusPag === 'pendente' && statusEvento !== 'cancelado') totalPagar += valor;
                    else if (statusPag === 'pago') totalPago += valor;
                }
            }
        }
        
        // Produção
        if (tipo === 'todos' || tipo === 'producao') {
            if (escala.producao_id) {
                let valor = (statusEvento === 'cancelado') ? 0 : (escala.valor_producao || 200);
                const statusPag = escala.pagamento_producao?.status || 
                                (statusEvento === 'cancelado' ? 'cancelado' : 'pendente');
                
                if (statusEvento === 'cancelado') valor = 0;
                
                pagamentos.push({
                    id: escala.producao_id,
                    nome: escala.producao_nome || 'Produção',
                    funcao: escala.producao_cargo || 'Produção',
                    personagem: '-',
                    evento: nomeEvento,
                    dataEvento: evento.data_evento,
                    tempoEvento: tempoEvento,
                    valor: valor,
                    statusEvento: statusEvento,
                    statusPag: statusPag,
                    dataPag: escala.pagamento_producao?.data || '',
                    quemPagou: escala.pagamento_producao?.quemPagou || '',
                    tipo: 'producao'
                });
                if (statusPag === 'pendente' && statusEvento !== 'cancelado') totalPagar += valor;
                else if (statusPag === 'pago') totalPago += valor;
            }
        }
    });
    
    // Ordenar por data do evento
    pagamentos.sort((a, b) => new Date(b.dataEvento) - new Date(a.dataEvento));
    
    // Atualiza totais
    document.getElementById('totalPagarEquipe').innerHTML = `R$ ${totalPagar.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalPagoEquipe').innerHTML = `R$ ${totalPago.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalPendenteEquipe').innerHTML = `R$ ${totalPagar.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalMembrosEquipe').innerHTML = pagamentos.length;
    
    // Preenche tabela
    if (pagamentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:2rem;">Nenhum pagamento encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = pagamentos.map(pag => {
        const statusEventoClass = pag.statusEvento === 'realizado' ? 'status-realizado' : 
                                 (pag.statusEvento === 'cancelado' ? 'status-cancelado' : 'status-pendente');
        const statusEventoText = pag.statusEvento === 'realizado' ? '✅ Realizado' : 
                                (pag.statusEvento === 'cancelado' ? '❌ Cancelado' : '🟡 A Realizar');
        const statusPagText = pag.statusPag === 'pago' ? '✅ Pago' : 
                             (pag.statusPag === 'cancelado' ? '❌ Cancelado' : '⏳ Pendente');
        
        // Gerar select de quem pagou
        const quemPagouSelect = `<select class="quem-pagou-select" data-id="${pag.id}" data-tipo="${pag.tipo}" 
                                    onchange="atualizarQuemPagouEquipe('${pag.id}', '${pag.tipo}', this.value)">
                                    <option value="">Selecione</option>
                                    ${usuariosSistema.map(u => `<option value="${u.nome}" ${pag.quemPagou === u.nome ? 'selected' : ''}>${u.nome}</option>`).join('')}
                                </select>`;
        
        return `
            <tr style="${pag.statusEvento === 'cancelado' ? 'opacity:0.6; background:#f8d7da;' : ''}">
                <td><input type="checkbox" class="check-equipe" data-id="${pag.id}" data-tipo="${pag.tipo}" ${pag.statusPag === 'pago' || pag.statusEvento === 'cancelado' ? 'disabled' : ''}></td>
                <td>${formatarData(pag.dataEvento)}</td>
                <td>${pag.evento}</td>
                <td><strong>${pag.nome}</strong></td>
                <td>${pag.funcao}</td>
                <td>${pag.personagem}</td>
                <td>${pag.tempoEvento}</td>
                <td style="color: ${pag.valor === 0 ? '#999' : '#dc3545'}; font-weight: bold;">R$ ${pag.valor.toFixed(2).replace('.', ',')}</td>
                <td><span class="status-badge ${statusEventoClass}">${statusEventoText}</span></td>
                <td><span class="status-badge ${pag.statusPag}">${statusPagText}</span></td>
                <td>${pag.dataPag ? formatarData(pag.dataPag) : '-'}</td>
                <td>${quemPagouSelect}</td>
                <td>
                    ${pag.statusPag === 'pendente' && pag.statusEvento !== 'cancelado' && pag.valor > 0 ? 
                        `<button class="btn small" onclick="registrarPagamentoEquipe('${pag.id}', '${pag.tipo}')">Pagar</button>` : 
                        pag.statusPag === 'pago' ? '<span style="color:#28a745;">✓ Pago</span>' : '-'
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function atualizarQuemPagouEquipe(id, tipo, quemPagou) {
    const escalas = JSON.parse(localStorage.getItem('escalas_eventos') || '[]');
    
    for (let escala of escalas) {
        if (tipo === 'elenco' && escala.pagamentos_elenco && escala.pagamentos_elenco[id]) {
            escala.pagamentos_elenco[id].quemPagou = quemPagou;
        } else if (tipo === 'motorista' && escala.pagamento_motorista) {
            escala.pagamento_motorista.quemPagou = quemPagou;
        } else if (tipo === 'producao' && escala.pagamento_producao) {
            escala.pagamento_producao.quemPagou = quemPagou;
        }
    }
    
    localStorage.setItem('escalas_eventos', JSON.stringify(escalas));
}

function selecionarTodosEquipe() {
    const checkbox = document.getElementById('selectAllEquipe');
    const checkboxes = document.querySelectorAll('#tabelaPagamentosEquipe .check-equipe:not([disabled])');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
}

function resetarFiltrosEquipe() {
    document.getElementById('filtroTipoEquipe').value = 'todos';
    document.getElementById('filtroStatusEventoEquipe').value = 'todos';
    carregarPagamentosEquipe();
}

function registrarPagamentoEquipeEmMassa() {
    const checkboxes = document.querySelectorAll('#tabelaPagamentosEquipe .check-equipe:checked');
    if (checkboxes.length === 0) {
        alert('Selecione pelo menos um membro para pagar');
        return;
    }
    
    const forma = prompt('Forma de pagamento:', 'Dinheiro');
    if (!forma) return;
    
    const quemPagou = prompt('Quem está realizando o pagamento:', usuariosSistema[0]?.nome || 'Administrador');
    if (!quemPagou) return;
    
    const escalas = JSON.parse(localStorage.getItem('escalas_eventos') || '[]');
    const dataPagamento = new Date().toISOString().split('T')[0];
    
    checkboxes.forEach(cb => {
        const id = cb.getAttribute('data-id');
        const tipo = cb.getAttribute('data-tipo');
        
        for (let escala of escalas) {
            if (tipo === 'elenco' && escala.personagens_elenco) {
                for (let [personagem, elencoId] of Object.entries(escala.personagens_elenco)) {
                    if (elencoId == id) {
                        if (!escala.pagamentos_elenco) escala.pagamentos_elenco = {};
                        escala.pagamentos_elenco[elencoId] = {
                            status: 'pago',
                            data: dataPagamento,
                            forma: forma,
                            quemPagou: quemPagou
                        };
                    }
                }
            } else if (tipo === 'motorista' && escala.motorista_id == id) {
                escala.pagamento_motorista = {
                    status: 'pago',
                    data: dataPagamento,
                    forma: forma,
                    quemPagou: quemPagou
                };
            } else if (tipo === 'producao' && escala.producao_id == id) {
                escala.pagamento_producao = {
                    status: 'pago',
                    data: dataPagamento,
                    forma: forma,
                    quemPagou: quemPagou
                };
            }
        }
    });
    
    localStorage.setItem('escalas_eventos', JSON.stringify(escalas));
    alert(`${checkboxes.length} pagamento(s) registrado(s)!`);
    carregarPagamentosEquipe();
}

function registrarPagamentoEquipe(id, tipo) {
    const forma = prompt('Forma de pagamento:', 'Dinheiro');
    if (!forma) return;
    
    const quemPagou = prompt('Quem está realizando o pagamento:', usuariosSistema[0]?.nome || 'Administrador');
    if (!quemPagou) return;
    
    const escalas = JSON.parse(localStorage.getItem('escalas_eventos') || '[]');
    const dataPagamento = new Date().toISOString().split('T')[0];
    
    for (let escala of escalas) {
        if (tipo === 'elenco' && escala.personagens_elenco) {
            for (let [personagem, elencoId] of Object.entries(escala.personagens_elenco)) {
                if (elencoId == id) {
                    if (!escala.pagamentos_elenco) escala.pagamentos_elenco = {};
                    escala.pagamentos_elenco[elencoId] = {
                        status: 'pago',
                        data: dataPagamento,
                        forma: forma,
                        quemPagou: quemPagou
                    };
                }
            }
        } else if (tipo === 'motorista' && escala.motorista_id == id) {
            escala.pagamento_motorista = {
                status: 'pago',
                data: dataPagamento,
                forma: forma,
                quemPagou: quemPagou
            };
        } else if (tipo === 'producao' && escala.producao_id == id) {
            escala.pagamento_producao = {
                status: 'pago',
                data: dataPagamento,
                forma: forma,
                quemPagou: quemPagou
            };
        }
    }
    
    localStorage.setItem('escalas_eventos', JSON.stringify(escalas));
    alert('Pagamento registrado!');
    carregarPagamentosEquipe();
}

// ==================== FUNÇÕES PARA ABA FUNCIONÁRIOS ====================

function carregarFolhaPagamento() {
    const mesAno = document.getElementById('mesFolhaFuncionarios')?.value || new Date().toISOString().slice(0, 7);
    const statusFiltro = document.getElementById('statusFolhaFuncionarios')?.value || 'todos';
    
    const tbody = document.getElementById('tabelaFolhaPagamento');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:2rem;">Carregando...</td></tr>';
    
    let funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    let pagamentos = JSON.parse(localStorage.getItem('pagamentos_funcionarios') || '[]');
    
    let totalFolha = 0;
    let totalPago = 0;
    let totalPendente = 0;
    let funcionariosList = [];
    
    funcionarios.forEach(func => {
        const pagamentoMes = pagamentos.find(p => p.funcionario_id == func.id && p.mes_ano === mesAno);
        const salario = converterParaNumero(func.salario) || 1500;
        const valeTransporte = converterParaNumero(func.vale_transporte) || 0;
        const valeAlimentacao = converterParaNumero(func.vale_alimentacao) || 0;
        const outros = converterParaNumero(func.outros_beneficios) || 0;
        const adiantamentos = converterParaNumero(pagamentoMes?.adiantamentos) || 0;
        
        const totalPagar = salario + valeTransporte + valeAlimentacao + outros - adiantamentos;
        const status = pagamentoMes?.status || 'pendente';
        
        if (statusFiltro === 'todos' || statusFiltro === status) {
            funcionariosList.push({
                ...func,
                salario, valeTransporte, valeAlimentacao, outros, adiantamentos,
                totalPagar, status, dataPagamento: pagamentoMes?.data_pagamento || '',
                quemPagou: pagamentoMes?.quemPagou || ''
            });
            
            totalFolha += totalPagar;
            if (status === 'pago') totalPago += totalPagar;
            else totalPendente += totalPagar;
        }
    });
    
    document.getElementById('totalFolhaFuncionarios').innerHTML = `R$ ${totalFolha.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalPagoFuncionarios').innerHTML = `R$ ${totalPago.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalPendenteFuncionarios').innerHTML = `R$ ${totalPendente.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalFuncionariosCount').innerHTML = funcionariosList.length;
    
    if (funcionariosList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:2rem;">Nenhum funcionário encontrado</td</tr>';
        return;
    }
    
    tbody.innerHTML = funcionariosList.map(func => {
        const quemPagouSelect = `<select class="quem-pagou-func" data-id="${func.id}" 
                                    onchange="atualizarQuemPagouFuncionario('${func.id}', this.value)">
                                    <option value="">Selecione</option>
                                    ${usuariosSistema.map(u => `<option value="${u.nome}" ${func.quemPagou === u.nome ? 'selected' : ''}>${u.nome}</option>`).join('')}
                                </select>`;
        
        return `
            <tr>
                <td><input type="checkbox" class="check-funcionario" data-id="${func.id}" ${func.status === 'pago' ? 'disabled' : ''}></td>
                <td><strong>${func.nome || func.nome_funcionarios || '-'}</strong></td>
                <td>${func.cargo || '-'}</td>
                <td>R$ ${func.salario.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${func.valeTransporte.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${func.valeAlimentacao.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${func.outros.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${func.adiantamentos.toFixed(2).replace('.', ',')}</td>
                <td><strong>R$ ${func.totalPagar.toFixed(2).replace('.', ',')}</strong></td>
                <td><span class="status-badge ${func.status}">${func.status === 'pago' ? '✅ Pago' : '⏳ Pendente'}</span></td>
                <td>${func.dataPagamento ? formatarData(func.dataPagamento) : '-'}</td>
                <td>${quemPagouSelect}</td>
                <td>
                    ${func.status === 'pendente' ? 
                        `<button class="btn small" onclick="registrarPagamentoFuncionario('${func.id}')">Pagar</button>` : 
                        '<span style="color:#28a745;">✓ Pago</span>'
                    }
                </td>
            </td>
        `;
    }).join('');
}

function registrarPagamentoFuncionario(funcionarioId) {
    const forma = prompt('Forma de pagamento:', 'Dinheiro');
    if (!forma) return;
    
    const quemPagou = prompt('Quem está realizando o pagamento:', usuariosSistema[0]?.nome || 'Administrador');
    if (!quemPagou) return;
    
    const mesAno = document.getElementById('mesFolhaFuncionarios')?.value || new Date().toISOString().slice(0, 7);
    const dataPagamento = new Date().toISOString().split('T')[0];
    
    let pagamentos = JSON.parse(localStorage.getItem('pagamentos_funcionarios') || '[]');
    
    const existingIndex = pagamentos.findIndex(p => p.funcionario_id == funcionarioId && p.mes_ano === mesAno);
    
    const pagamento = {
        funcionario_id: funcionarioId,
        mes_ano: mesAno,
        status: 'pago',
        data_pagamento: dataPagamento,
        forma: forma,
        quemPagou: quemPagou
    };
    
    if (existingIndex !== -1) {
        pagamentos[existingIndex] = { ...pagamentos[existingIndex], ...pagamento };
    } else {
        pagamentos.push(pagamento);
    }
    
    localStorage.setItem('pagamentos_funcionarios', JSON.stringify(pagamentos));
    alert('Pagamento registrado!');
    carregarFolhaPagamento();
    atualizarResumoGeral();
}

function selecionarTodosFuncionarios() {
    const checkbox = document.getElementById('selectAllFuncionarios');
    const checkboxes = document.querySelectorAll('#tabelaFolhaPagamento .check-funcionario:not([disabled])');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
}

function limparFiltrosFolha() {
    document.getElementById('mesFolhaFuncionarios').value = new Date().toISOString().slice(0, 7);
    document.getElementById('statusFolhaFuncionarios').value = 'todos';
    carregarFolhaPagamento();
}

function gerarFolhaMesAtual() {
    const mesAno = new Date().toISOString().slice(0, 7);
    document.getElementById('mesFolhaFuncionarios').value = mesAno;
    carregarFolhaPagamento();
    alert(`Folha do mês ${mesAno} gerada!`);
}

function atualizarQuemPagouFuncionario(funcionarioId, quemPagou) {
    const mesAno = document.getElementById('mesFolhaFuncionarios')?.value || new Date().toISOString().slice(0, 7);
    let pagamentos = JSON.parse(localStorage.getItem('pagamentos_funcionarios') || '[]');
    
    const index = pagamentos.findIndex(p => p.funcionario_id == funcionarioId && p.mes_ano === mesAno);
    if (index !== -1) {
        pagamentos[index].quemPagou = quemPagou;
        localStorage.setItem('pagamentos_funcionarios', JSON.stringify(pagamentos));
    }
}

// ==================== FUNÇÕES PARA ABA FORNECEDORES ====================

function carregarContasFornecedores() {
    const statusFiltro = document.getElementById('filtroStatusFornecedores')?.value || 'todos';
    const periodoFiltro = document.getElementById('periodoFornecedores')?.value || 'todos';
    
    const tbody = document.getElementById('tabelaContasFornecedores');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;padding:2rem;">Carregando...</td</tr>';
    
    let fornecedores = JSON.parse(localStorage.getItem('fornecedores') || '[]');
    let compras = JSON.parse(localStorage.getItem('compras_fornecedores') || '[]');
    
    let totalPagar = 0;
    let totalPago = 0;
    let totalItens = 0;
    let comprasList = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    compras.forEach(compra => {
        const fornecedor = fornecedores.find(f => f.id == compra.fornecedor_id);
        const vencimento = new Date(compra.data_vencimento);
        
        // Filtrar por período
        if (periodoFiltro !== 'todos') {
            if (periodoFiltro === 'vencer' && vencimento.toDateString() !== hoje.toDateString()) return;
            if (periodoFiltro === 'semana') {
                const diffDays = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
                if (diffDays < 0 || diffDays > 7) return;
            }
            if (periodoFiltro === 'mes' && vencimento.getMonth() !== hoje.getMonth()) return;
        }
        
        if (statusFiltro === 'todos' || statusFiltro === compra.status) {
            comprasList.push({
                ...compra,
                fornecedor_nome: fornecedor?.nome || fornecedor?.nome_fornecedores || 'Fornecedor não encontrado'
            });
            
            if (compra.status === 'pendente') totalPagar += compra.valor_total;
            else if (compra.status === 'pago') totalPago += compra.valor_total;
            totalItens++;
        }
    });
    
    document.getElementById('totalPagarFornecedores').innerHTML = `R$ ${totalPagar.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalPagoFornecedores').innerHTML = `R$ ${totalPago.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalItensFornecedores').innerHTML = totalItens;
    
    if (comprasList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;padding:2rem;">Nenhuma compra encontrada</td</tr>';
        return;
    }
    
    tbody.innerHTML = comprasList.map(compra => {
        const quemPagouSelect = `<select class="quem-pagou-forn" data-id="${compra.id}" 
                                    onchange="atualizarQuemPagouFornecedor('${compra.id}', this.value)">
                                    <option value="">Selecione</option>
                                    ${usuariosSistema.map(u => `<option value="${u.nome}" ${compra.quemPagou === u.nome ? 'selected' : ''}>${u.nome}</option>`).join('')}
                                </select>`;
        
        return `
            <tr>
                <td><strong>${compra.fornecedor_nome}</strong></td>
                <td>${compra.produto_servico}</td>
                <td>${compra.quantidade}</td>
                <td>R$ ${compra.valor_unitario.toFixed(2).replace('.', ',')}</td>
                <td><strong>R$ ${compra.valor_total.toFixed(2).replace('.', ',')}</strong></td>
                <td>${formatarData(compra.data_compra)}</td>
                <td>${formatarData(compra.data_vencimento)}</td>
                <td><span class="status-badge ${compra.status}">${compra.status === 'pago' ? '✅ Pago' : '⏳ Pendente'}</span></td>
                <td>${compra.forma_pagamento || '-'}</td>
                <td>${compra.data_pagamento ? formatarData(compra.data_pagamento) : '-'}</td>
                <td>${quemPagouSelect}</td>
                <td>
                    ${compra.status === 'pendente' ? 
                        `<button class="btn small" onclick="registrarPagamentoFornecedor('${compra.id}')">Pagar</button>` : 
                        '<span style="color:#28a745;">✓ Pago</span>'
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function salvarCompraFornecedor() {
    const fornecedorId = document.getElementById('fornecedorCompra')?.value;
    const produtoServico = document.getElementById('produtoServicoFornecedor')?.value;
    const quantidade = parseInt(document.getElementById('quantidadeCompraFornecedor')?.value) || 1;
    const valorUnitarioStr = document.getElementById('valorUnitarioFornecedor')?.value || '0';
    const valorTotalStr = document.getElementById('valorTotalCompraFornecedor')?.value || '0';
    const dataCompra = document.getElementById('dataCompraFornecedor')?.value;
    const dataVencimento = document.getElementById('dataVencimentoFornecedor')?.value;
    const formaPagamento = document.getElementById('formaPagamentoFornecedor')?.value;
    
    if (!fornecedorId || !produtoServico || !dataCompra) {
        alert('Preencha os campos obrigatórios!');
        return;
    }
    
    const valorUnitario = converterParaNumero(valorUnitarioStr);
    const valorTotal = converterParaNumero(valorTotalStr);
    
    let compras = JSON.parse(localStorage.getItem('compras_fornecedores') || '[]');
    
    const novaCompra = {
        id: Date.now().toString(),
        fornecedor_id: fornecedorId,
        produto_servico: produtoServico,
        quantidade: quantidade,
        valor_unitario: valorUnitario,
        valor_total: valorTotal > 0 ? valorTotal : (valorUnitario * quantidade),
        data_compra: dataCompra,
        data_vencimento: dataVencimento || '',
        forma_pagamento: formaPagamento,
        status: 'pendente',
        data_pagamento: '',
        quemPagou: ''
    };
    
    compras.push(novaCompra);
    localStorage.setItem('compras_fornecedores', JSON.stringify(compras));
    
    alert('Compra registrada com sucesso!');
    limparFormularioCompraFornecedor();
    carregarContasFornecedores();
    carregarSelectFornecedores();
}

function registrarPagamentoFornecedor(compraId) {
    const forma = prompt('Forma de pagamento:', 'Dinheiro');
    if (!forma) return;
    
    const quemPagou = prompt('Quem está realizando o pagamento:', usuariosSistema[0]?.nome || 'Administrador');
    if (!quemPagou) return;
    
    let compras = JSON.parse(localStorage.getItem('compras_fornecedores') || '[]');
    const index = compras.findIndex(c => c.id == compraId);
    
    if (index !== -1) {
        compras[index].status = 'pago';
        compras[index].data_pagamento = new Date().toISOString().split('T')[0];
        compras[index].forma_pagamento = forma;
        compras[index].quemPagou = quemPagou;
        localStorage.setItem('compras_fornecedores', JSON.stringify(compras));
        alert('Pagamento registrado!');
        carregarContasFornecedores();
    }
}

function carregarSelectFornecedores() {
    const select = document.getElementById('fornecedorCompra');
    if (!select) return;
    
    const fornecedores = JSON.parse(localStorage.getItem('fornecedores') || '[]');
    select.innerHTML = '<option value="">Selecione</option>';
    
    fornecedores.forEach(f => {
        const option = document.createElement('option');
        option.value = f.id || f.ID;
        option.textContent = f.nome || f.nome_fornecedores || 'Fornecedor sem nome';
        select.appendChild(option);
    });
}

function calcularTotalCompraFornecedor() {
    const quantidade = parseInt(document.getElementById('quantidadeCompraFornecedor')?.value) || 1;
    const valorUnitarioStr = document.getElementById('valorUnitarioFornecedor')?.value || '0';
    const valorUnitario = converterParaNumero(valorUnitarioStr);
    const valorTotal = quantidade * valorUnitario;
    
    const totalField = document.getElementById('valorTotalCompraFornecedor');
    if (totalField) {
        totalField.value = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
    }
}

function limparFormularioCompraFornecedor() {
    document.getElementById('fornecedorCompra').value = '';
    document.getElementById('produtoServicoFornecedor').value = '';
    document.getElementById('quantidadeCompraFornecedor').value = '1';
    document.getElementById('valorUnitarioFornecedor').value = '';
    document.getElementById('valorTotalCompraFornecedor').value = '';
    document.getElementById('dataCompraFornecedor').value = '';
    document.getElementById('dataVencimentoFornecedor').value = '';
    document.getElementById('formaPagamentoFornecedor').value = 'dinheiro';
}

function resetarFiltrosFornecedores() {
    document.getElementById('filtroStatusFornecedores').value = 'todos';
    document.getElementById('periodoFornecedores').value = 'todos';
    carregarContasFornecedores();
}

function exportarContasFornecedores() {
    alert('Função de exportação em desenvolvimento');
}

function atualizarQuemPagouFornecedor(compraId, quemPagou) {
    let compras = JSON.parse(localStorage.getItem('compras_fornecedores') || '[]');
    const index = compras.findIndex(c => c.id == compraId);
    if (index !== -1) {
        compras[index].quemPagou = quemPagou;
        localStorage.setItem('compras_fornecedores', JSON.stringify(compras));
    }
}

// ==================== RESUMO GERAL ====================

function atualizarResumoGeral() {
    // Total Equipe
    const escalas = JSON.parse(localStorage.getItem('escalas_eventos') || '[]');
    let totalEquipePago = 0;
    let totalEquipePendente = 0;
    
    escalas.forEach(escala => {
        if (escala.pagamentos_elenco) {
            Object.values(escala.pagamentos_elenco).forEach(pag => {
                if (pag.status === 'pago') totalEquipePago += 150;
                else totalEquipePendente += 150;
            });
        }
        if (escala.pagamento_motorista) {
            if (escala.pagamento_motorista.status === 'pago') totalEquipePago += 100;
            else totalEquipePendente += 100;
        }
        if (escala.pagamento_producao) {
            if (escala.pagamento_producao.status === 'pago') totalEquipePago += 200;
            else totalEquipePendente += 200;
        }
    });
    
    // Total Funcionários
    let totalFuncPago = 0;
    let totalFuncPendente = 0;
    const pagamentosFunc = JSON.parse(localStorage.getItem('pagamentos_funcionarios') || '[]');
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    
    funcionarios.forEach(func => {
        const salario = converterParaNumero(func.salario) || 1500;
        const pagamento = pagamentosFunc.find(p => p.funcionario_id == func.id);
        if (pagamento?.status === 'pago') totalFuncPago += salario;
        else totalFuncPendente += salario;
    });
    
    // Total Fornecedores
    let totalFornecedorPago = 0;
    let totalFornecedorPendente = 0;
    const compras = JSON.parse(localStorage.getItem('compras_fornecedores') || '[]');
    
    compras.forEach(compra => {
        if (compra.status === 'pago') totalFornecedorPago += compra.valor_total;
        else totalFornecedorPendente += compra.valor_total;
    });
    
    const totalGeralPago = totalEquipePago + totalFuncPago + totalFornecedorPago;
    const totalGeralPendente = totalEquipePendente + totalFuncPendente + totalFornecedorPendente;
    const totalGeral = totalGeralPago + totalGeralPendente;
    
    document.getElementById('resumoTotalEquipe').innerHTML = `R$ ${(totalEquipePago + totalEquipePendente).toFixed(2).replace('.', ',')}`;
    document.getElementById('resumoPendenteEquipe').innerHTML = `Pendente: R$ ${totalEquipePendente.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumoTotalFuncionarios').innerHTML = `R$ ${(totalFuncPago + totalFuncPendente).toFixed(2).replace('.', ',')}`;
    document.getElementById('resumoPendenteFuncionarios').innerHTML = `Pendente: R$ ${totalFuncPendente.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumoTotalFornecedores').innerHTML = `R$ ${(totalFornecedorPago + totalFornecedorPendente).toFixed(2).replace('.', ',')}`;
    document.getElementById('resumoPendenteFornecedores').innerHTML = `Pendente: R$ ${totalFornecedorPendente.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumoTotalGeral').innerHTML = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    document.getElementById('resumoPendenteGeral').innerHTML = `Total Pendente: R$ ${totalGeralPendente.toFixed(2).replace('.', ',')}`;
}

// ==================== FUNÇÕES AUXILIARES ====================

function formatarData(data) {
    if (!data) return '-';
    if (data.includes('-')) {
        const partes = data.split('-');
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return data;
}

function converterParaNumero(valor) {
    if (valor === undefined || valor === null || valor === '') return 0;
    if (typeof valor === 'number') return valor;
    
    const str = String(valor);
    const numero = parseFloat(str.replace(/[^\d,-]/g, '').replace(',', '.'));
    return isNaN(numero) ? 0 : numero;
}
// ==================== FLUXO DE CAIXA PROFISSIONAL ====================

function carregarFluxoCaixa() {
    const periodo = document.getElementById('periodoFluxo')?.value || 'mes';
    const tipo = document.getElementById('tipoFluxo')?.value || 'todos';
    
    const tbody = document.getElementById('tabelaFluxoCaixa');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:3rem;">Carregando dados...</td</tr>';
    
    // Buscar dados
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const escalas = JSON.parse(localStorage.getItem('escalas_eventos') || '[]');
    const pagamentosFuncionarios = JSON.parse(localStorage.getItem('pagamentos_funcionarios') || '[]');
    const comprasFornecedores = JSON.parse(localStorage.getItem('compras_fornecedores') || '[]');
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    
    let movimentacoes = [];
    let totalEntradas = 0;
    let totalSaidas = 0;
    let totalAPagar = 0;
    let totalAReceber = 0;
    let entradaCount = 0;
    let saidaCount = 0;
    
    // Definir período
    const { dataInicio, dataFim } = getPeriodoDatas(periodo);
    
    // ========== ENTRADAS - Pagamentos de Eventos ==========
    eventos.forEach(evento => {
        const dataEvento = evento.data_evento;
        if (!isDataNoPeriodo(dataEvento, dataInicio, dataFim)) return;
        
        const valorTotal = converterParaNumero(evento.valor_total);
        const valorFalta = converterParaNumero(evento.valor_falta_receber);
        const valorRecebido = valorTotal - valorFalta;
        
        if (valorRecebido > 0 && (tipo === 'todos' || tipo === 'entrada')) {
            totalEntradas += valorRecebido;
            entradaCount++;
            movimentacoes.push({
                data: dataEvento,
                descricao: `🎉 Evento: ${evento.nome_cliente_evento || 'Cliente'}`,
                categoria: 'Receita de Evento',
                origem: `Cliente: ${evento.nome_cliente_evento || '-'} | Local: ${evento.nome_local || '-'}`,
                entrada: valorRecebido,
                saida: 0,
                tipo: 'entrada'
            });
        }
        
        if (valorFalta > 0) {
            totalAReceber += valorFalta;
        }
    });
    
    // ========== SAÍDAS - Pagamentos de Elenco ==========
    escalas.forEach(escala => {
        const evento = eventos.find(e => e.id == escala.evento_id);
        if (!evento) return;
        
        const dataEvento = evento.data_evento;
        if (!isDataNoPeriodo(dataEvento, dataInicio, dataFim)) return;
        
        // Pagamentos do Elenco
        if (escala.pagamentos_elenco) {
            Object.values(escala.pagamentos_elenco).forEach(pag => {
                if (pag.status === 'pago' && (tipo === 'todos' || tipo === 'saida')) {
                    totalSaidas += 150;
                    saidaCount++;
                    movimentacoes.push({
                        data: pag.data || dataEvento,
                        descricao: `🎭 Cachê Elenco - ${evento.nome_cliente_evento || 'Evento'}`,
                        categoria: 'Folha de Pagamento',
                        origem: `Evento: ${evento.nome_cliente_evento || '-'} | Data: ${evento.data_evento}`,
                        entrada: 0,
                        saida: 150,
                        tipo: 'saida'
                    });
                }
            });
        }
        
        // Pagamentos de Motoristas
        if (escala.pagamento_motorista?.status === 'pago' && (tipo === 'todos' || tipo === 'saida')) {
            totalSaidas += 100;
            saidaCount++;
            movimentacoes.push({
                data: escala.pagamento_motorista.data || dataEvento,
                descricao: `🚗 Motorista - ${evento.nome_cliente_evento || 'Evento'}`,
                categoria: 'Transporte',
                origem: `Evento: ${evento.nome_cliente_evento || '-'}`,
                entrada: 0,
                saida: 100,
                tipo: 'saida'
            });
        }
        
        // Pagamentos de Produção
        if (escala.pagamento_producao?.status === 'pago' && (tipo === 'todos' || tipo === 'saida')) {
            totalSaidas += 200;
            saidaCount++;
            movimentacoes.push({
                data: escala.pagamento_producao.data || dataEvento,
                descricao: `🎬 Produção - ${evento.nome_cliente_evento || 'Evento'}`,
                categoria: 'Produção',
                origem: `Evento: ${evento.nome_cliente_evento || '-'}`,
                entrada: 0,
                saida: 200,
                tipo: 'saida'
            });
        }
    });
    
    // ========== SAÍDAS - Folha de Pagamento de Funcionários ==========
    pagamentosFuncionarios.forEach(pag => {
        if (pag.status === 'pago' && (tipo === 'todos' || tipo === 'saida')) {
            const funcionario = funcionarios.find(f => f.id == pag.funcionario_id);
            const salario = converterParaNumero(funcionario?.salario) || 1500;
            
            if (isDataNoPeriodo(pag.data_pagamento, dataInicio, dataFim)) {
                totalSaidas += salario;
                saidaCount++;
                movimentacoes.push({
                    data: pag.data_pagamento,
                    descricao: `👥 Salário - ${funcionario?.nome || funcionario?.nome_funcionarios || 'Funcionário'}`,
                    categoria: 'Folha de Pagamento',
                    origem: `Cargo: ${funcionario?.cargo || '-'} | Mês: ${pag.mes_ano}`,
                    entrada: 0,
                    saida: salario,
                    tipo: 'saida'
                });
            }
        }
    });
    
    // ========== SAÍDAS - Compras de Fornecedores ==========
    comprasFornecedores.forEach(compra => {
        if (compra.status === 'pago' && (tipo === 'todos' || tipo === 'saida')) {
            if (isDataNoPeriodo(compra.data_pagamento, dataInicio, dataFim)) {
                totalSaidas += compra.valor_total;
                saidaCount++;
                movimentacoes.push({
                    data: compra.data_pagamento,
                    descricao: `📦 ${compra.produto_servico}`,
                    categoria: 'Compras',
                    origem: `Fornecedor: ${compra.fornecedor_nome || 'Fornecedor'} | Qtd: ${compra.quantidade}`,
                    entrada: 0,
                    saida: compra.valor_total,
                    tipo: 'saida'
                });
            }
        }
        
        // Contas a pagar (pendentes)
        if (compra.status === 'pendente') {
            totalAPagar += compra.valor_total;
        }
    });
    
    // Ordenar por data (mais recente primeiro)
    movimentacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Calcular saldo acumulado
    let saldoAcumulado = 0;
    const saldoFinal = totalEntradas - totalSaidas;
    
    // Atualizar cards de resumo
    document.getElementById('totalEntradasFluxo').innerHTML = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalSaidasFluxo').innerHTML = `R$ ${totalSaidas.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalAPagarFluxo').innerHTML = `R$ ${totalAPagar.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalAReceberFluxo').innerHTML = `R$ ${totalAReceber.toFixed(2).replace('.', ',')}`;
    document.getElementById('saldoAtualFluxo').innerHTML = `R$ ${saldoFinal.toFixed(2).replace('.', ',')}`;
    document.getElementById('lucroFluxo').innerHTML = `R$ ${saldoFinal.toFixed(2).replace('.', ',')}`;
    
    // Atualizar gráfico de porcentagem
    const totalGeral = totalEntradas + totalSaidas;
    const porcentagemEntrada = totalGeral > 0 ? (totalEntradas / totalGeral * 100).toFixed(0) : 0;
    const porcentagemSaida = totalGeral > 0 ? (totalSaidas / totalGeral * 100).toFixed(0) : 0;
    document.getElementById('porcentagemEntrada').innerHTML = `${porcentagemEntrada}%`;
    document.getElementById('porcentagemSaida').innerHTML = `${porcentagemSaida}%`;
    
    // Atualizar contadores
    document.getElementById('totalMovimentacoes').innerHTML = movimentacoes.length;
    document.getElementById('totalEntradasCount').innerHTML = entradaCount;
    document.getElementById('totalSaidasCount').innerHTML = saidaCount;
    
    // Preencher tabela
    if (movimentacoes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:3rem;color:#6c757d;">
            <div style="font-size:3rem;margin-bottom:1rem;">📭</div>
            <p>Nenhuma movimentação encontrada no período selecionado</p>
        </td></tr>`;
    } else {
        tbody.innerHTML = movimentacoes.map(mov => {
            saldoAcumulado += mov.entrada - mov.saida;
            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px;">${formatarData(mov.data)}</td>
                    <td style="padding: 12px;">
                        <strong>${mov.descricao}</strong>
                        <br>
                        <small style="color: #666;">${mov.origem}</small>
                    </td>
                    <td style="padding: 12px;">
                        <span style="background: #e9ecef; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
                            ${mov.categoria}
                        </span>
                    </td>
                    <td style="padding: 12px; font-size: 13px; color: #666;">${mov.origem}</td>
                    <td style="padding: 12px; text-align: right;">
                        ${mov.entrada > 0 ? `<span style="color: #28a745; font-weight: bold; font-size: 1.1rem;">R$ ${mov.entrada.toFixed(2).replace('.', ',')}</span>` : '-'}
                    </td>
                    <td style="padding: 12px; text-align: right;">
                        ${mov.saida > 0 ? `<span style="color: #dc3545; font-weight: bold; font-size: 1.1rem;">R$ ${mov.saida.toFixed(2).replace('.', ',')}</span>` : '-'}
                    </td>
                    <td style="padding: 12px; text-align: right;">
                        <span style="font-weight: bold; color: ${saldoAcumulado >= 0 ? '#0056b3' : '#dc3545'};">
                            R$ ${saldoAcumulado.toFixed(2).replace('.', ',')}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Adicionar rodapé com totais
        const tfoot = document.getElementById('tfootFluxoCaixa');
        if (tfoot) {
            tfoot.innerHTML = `
                <tr style="background: #f8f9fa; border-top: 2px solid #dee2e6;">
                    <td colspan="4" style="padding: 12px; text-align: right;"><strong>TOTAIS:</strong></td>
                    <td style="padding: 12px; text-align: right;"><strong style="color: #28a745;">R$ ${totalEntradas.toFixed(2).replace('.', ',')}</strong></td>
                    <td style="padding: 12px; text-align: right;"><strong style="color: #dc3545;">R$ ${totalSaidas.toFixed(2).replace('.', ',')}</strong></td>
                    <td style="padding: 12px; text-align: right;"><strong style="color: #0056b3;">R$ ${saldoFinal.toFixed(2).replace('.', ',')}</strong></td>
                </tr>
            `;
        }
    }
}

function getPeriodoDatas(periodo) {
    const hoje = new Date();
    let dataInicio = new Date();
    let dataFim = new Date();
    
    switch(periodo) {
        case 'hoje':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
            break;
        case 'ontem':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1);
            break;
        case 'semana':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 7);
            dataFim = hoje;
            break;
        case 'quinzena':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 15);
            dataFim = hoje;
            break;
        case 'mes':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            break;
        case 'mes_anterior':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
            break;
        case 'trimestre':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
            dataFim = hoje;
            break;
        case 'ano':
            dataInicio = new Date(hoje.getFullYear(), 0, 1);
            dataFim = new Date(hoje.getFullYear(), 11, 31);
            break;
        case 'personalizado':
            const inicioInput = document.getElementById('dataInicioFluxo')?.value;
            const fimInput = document.getElementById('dataFimFluxo')?.value;
            dataInicio = inicioInput ? new Date(inicioInput) : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataFim = fimInput ? new Date(fimInput) : hoje;
            break;
        default:
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataFim = hoje;
    }
    
    dataInicio.setHours(0, 0, 0, 0);
    dataFim.setHours(23, 59, 59, 999);
    
    return { dataInicio, dataFim };
}

function isDataNoPeriodo(dataStr, dataInicio, dataFim) {
    if (!dataStr) return false;
    const data = new Date(dataStr);
    data.setHours(0, 0, 0, 0);
    return data >= dataInicio && data <= dataFim;
}

function filtrarFluxoCaixa() {
    const periodo = document.getElementById('periodoFluxo')?.value;
    const dataInicioDiv = document.getElementById('dataInicioFluxoDiv');
    const dataFimDiv = document.getElementById('dataFimFluxoDiv');
    
    if (periodo === 'personalizado') {
        if (dataInicioDiv) dataInicioDiv.style.display = 'block';
        if (dataFimDiv) dataFimDiv.style.display = 'block';
    } else {
        if (dataInicioDiv) dataInicioDiv.style.display = 'none';
        if (dataFimDiv) dataFimDiv.style.display = 'none';
    }
    
    carregarFluxoCaixa();
}

function resetarFiltrosFluxo() {
    const periodoEl = document.getElementById('periodoFluxo');
    const tipoEl = document.getElementById('tipoFluxo');
    const dataInicioEl = document.getElementById('dataInicioFluxo');
    const dataFimEl = document.getElementById('dataFimFluxo');
    
    if (periodoEl) periodoEl.value = 'mes';
    if (tipoEl) tipoEl.value = 'todos';
    if (dataInicioEl) dataInicioEl.value = '';
    if (dataFimEl) dataFimEl.value = '';
    
    const dataInicioDiv = document.getElementById('dataInicioFluxoDiv');
    const dataFimDiv = document.getElementById('dataFimFluxoDiv');
    if (dataInicioDiv) dataInicioDiv.style.display = 'none';
    if (dataFimDiv) dataFimDiv.style.display = 'none';
    
    carregarFluxoCaixa();
}

function atualizarFluxoCaixa() {
    carregarFluxoCaixa();
}

function exportarFluxoCaixa() {
    alert('Função de exportação em desenvolvimento - Em breve poderá exportar para Excel/CSV');
}

function imprimirFluxoCaixa() {
    const conteudo = document.getElementById('fluxo_caixa').cloneNode(true);
    const janela = window.open('', '_blank');
    janela.document.write(`
        <html>
        <head>
            <title>Fluxo de Caixa - Sistema de Eventos</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f5f5f5; }
                .card-mini { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            ${conteudo.innerHTML}
        </body>
        </html>
    `);
    janela.document.close();
    janela.print();
}
// ==================== SINCRONIZAÇÃO DE CACHÊ ENTRE ESCALA E DISPONIBILIDADE ====================

/**
 * Atualiza o cachê do usuário quando a empresa define o valor na escala
 * @param {string} cpfUsuario - CPF do usuário escalado
 * @param {string} dataEvento - Data do evento (formato YYYY-MM-DD)
 * @param {string} empresaId - ID da empresa
 * @param {number} valorCache - Valor do cachê definido
 */
function atualizarCacheNaDisponibilidade(cpfUsuario, dataEvento, empresaId, valorCache) {
    console.log(`💰 Atualizando cachê para ${cpfUsuario} na data ${dataEvento}: R$ ${valorCache}`);
    
    // Buscar disponibilidades do usuário
    const disponibilidadesKey = `disponibilidades_usuario_${cpfUsuario}`;
    let disponibilidades = JSON.parse(localStorage.getItem(disponibilidadesKey) || '[]');
    
    // Encontrar a disponibilidade para esta data e empresa
    const index = disponibilidades.findIndex(d => d.data === dataEvento && d.empresaId === empresaId);
    
    if (index !== -1) {
        // Atualizar o cachê existente
        disponibilidades[index].cache = valorCache;
        disponibilidades[index].cacheAtualizadoPor = 'escala';
        disponibilidades[index].dataAtualizacao = new Date().toISOString();
        console.log(`✅ Cache atualizado na disponibilidade existente`);
    } else {
        // Criar nova disponibilidade com o cachê
        disponibilidades.push({
            empresaId: empresaId,
            empresaNome: '',
            data: dataEvento,
            status: 'disponivel',
            cache: valorCache,
            horario: '',
            observacao: 'Valor definido na escala',
            dataCadastro: new Date().toISOString(),
            cacheAtualizadoPor: 'escala'
        });
        console.log(`✅ Nova disponibilidade criada com o cache`);
    }
    
    localStorage.setItem(disponibilidadesKey, JSON.stringify(disponibilidades));
    
    // Também atualizar na empresa
    const empresaDispKey = `disponibilidades_empresa_${empresaId}`;
    let empresaDisps = JSON.parse(localStorage.getItem(empresaDispKey) || '[]');
    
    const empresaIndex = empresaDisps.findIndex(d => d.cpf === cpfUsuario && d.data === dataEvento);
    if (empresaIndex !== -1) {
        empresaDisps[empresaIndex].cache = valorCache;
    } else {
        empresaDisps.push({
            cpf: cpfUsuario,
            nome: '',
            data: dataEvento,
            status: 'disponivel',
            cache: valorCache,
            observacao: 'Valor definido na escala'
        });
    }
    
    localStorage.setItem(empresaDispKey, JSON.stringify(empresaDisps));
    
    // Disparar evento para atualizar a interface
    window.dispatchEvent(new CustomEvent('cacheAtualizado', {
        detail: { cpfUsuario, dataEvento, empresaId, valorCache }
    }));
}

/**
 * Atualiza o status de pagamento quando a empresa registra o pagamento
 * @param {string} cpfUsuario - CPF do usuário
 * @param {string} dataEvento - Data do evento
 * @param {string} empresaId - ID da empresa
 * @param {boolean} pago - Status do pagamento
 */
function atualizarStatusPagamentoDisponibilidade(cpfUsuario, dataEvento, empresaId, pago) {
    console.log(`💵 Atualizando status de pagamento para ${cpfUsuario} na data ${dataEvento}: ${pago ? 'Pago' : 'Pendente'}`);
    
    const disponibilidadesKey = `disponibilidades_usuario_${cpfUsuario}`;
    let disponibilidades = JSON.parse(localStorage.getItem(disponibilidadesKey) || '[]');
    
    const index = disponibilidades.findIndex(d => d.data === dataEvento && d.empresaId === empresaId);
    
    if (index !== -1) {
        disponibilidades[index].statusPagamento = pago ? 'pago' : 'pendente';
        disponibilidades[index].dataPagamento = pago ? new Date().toISOString() : null;
        localStorage.setItem(disponibilidadesKey, JSON.stringify(disponibilidades));
        console.log(`✅ Status de pagamento atualizado`);
    }
}

// Adicionar listener para quando a escala é salva
function conectarAtualizacaoCacheNaEscala() {
    // Interceptar a função de salvar escala original
    const salvarEscalaOriginal = window.salvarEscala;
    
    if (salvarEscalaOriginal) {
        window.salvarEscala = function() {
            // Chamar função original
            const resultado = salvarEscalaOriginal.apply(this, arguments);
            
            // Após salvar, verificar e atualizar cachês
            setTimeout(() => {
                const empresa = JSON.parse(sessionStorage.getItem('empresa_logada') || '{}');
                const escalas = JSON.parse(localStorage.getItem(`${empresa.id}_escalas_eventos`) || '[]');
                const eventos = JSON.parse(localStorage.getItem(`${empresa.id}_eventos_cadastrados`) || '[]');
                
                // Para cada escala, verificar o valor e atualizar a disponibilidade
                for (const escala of escalas) {
                    const evento = eventos.find(e => e.id === escala.evento_id);
                    if (!evento) continue;
                    
                    // Para cada membro do elenco
                    if (escala.elenco && Array.isArray(escala.elenco)) {
                        for (const membro of escala.elenco) {
                            const cpf = membro.cpf || membro.doc_elenco_cadastro;
                            if (cpf && membro.cache) {
                                const cpfLimpo = cpf.replace(/\D/g, '');
                                atualizarCacheNaDisponibilidade(cpfLimpo, evento.data_evento, empresa.id, parseFloat(membro.cache));
                            }
                        }
                    }
                    
                    // Para o motorista
                    if (escala.motorista && escala.motorista.cache) {
                        const cpf = escala.motorista.cpf || escala.motorista.doc_motoristas_cadastro;
                        if (cpf) {
                            const cpfLimpo = cpf.replace(/\D/g, '');
                            atualizarCacheNaDisponibilidade(cpfLimpo, evento.data_evento, empresa.id, parseFloat(escala.motorista.cache));
                        }
                    }
                }
            }, 500);
            
            return resultado;
        };
        console.log('✅ Sincronização de cache conectada à função de salvar escala');
    }
}

// Executar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    conectarAtualizacaoCacheNaEscala();
});

// Exportar funções
window.atualizarCacheNaDisponibilidade = atualizarCacheNaDisponibilidade;
window.atualizarStatusPagamentoDisponibilidade = atualizarStatusPagamentoDisponibilidade;
window.conectarAtualizacaoCacheNaEscala = conectarAtualizacaoCacheNaEscala;

console.log('✅ sincronizar-cache-escala.js carregado');
// Exportar funções
window.carregarFluxoCaixa = carregarFluxoCaixa;
window.filtrarFluxoCaixa = filtrarFluxoCaixa;
window.resetarFiltrosFluxo = resetarFiltrosFluxo;
window.atualizarFluxoCaixa = atualizarFluxoCaixa;
window.exportarFluxoCaixa = exportarFluxoCaixa;
window.imprimirFluxoCaixa = imprimirFluxoCaixa;
// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', function() {
    carregarUsuariosSistema();
    carregarSelectFornecedores();
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList && mutation.target.classList.contains('active')) {
                const pageId = mutation.target.id;
                if (pageId === 'contas_pagar') {
                    setTimeout(() => {
                        carregarPagamentosEquipe();
                        carregarFolhaPagamento();
                        carregarContasFornecedores();
                        atualizarResumoGeral();
                    }, 100);
                } else if (pageId === 'contas_receber') {
                    setTimeout(carregarContasReceber, 100);
                } else if (pageId === 'fluxo_caixa') {
                    setTimeout(carregarFluxoCaixa, 100);
                }
            }
        });
    });
    
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        observer.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
    
    // Inicializa selects de evento
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const eventoSelect = document.getElementById('eventoEquipePagar');
    if (eventoSelect) {
        eventoSelect.innerHTML = '<option value="todos">Todos os Eventos</option>' +
            eventos.map(e => `<option value="${e.id}">${e.nome_cliente_evento || 'Evento'} - ${e.data_evento || ''}</option>`).join('');
    }
    
    carregarFluxoCaixa();
});

console.log('sistema-financeiro.js carregado com sucesso');