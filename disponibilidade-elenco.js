// ==================== DISPONIBILIDADE DA EQUIPE - VERSÃO CORRIGIDA ====================

// Cache das disponibilidades para uso no calendário
let disponibilidadesCache = null;

/**
 * Verifica disponibilidade da equipe - Busca APENAS disponibilidades registradas
 */
function verificarDisponibilidadeEquipe() {
    const disponibilidadesMap = new Map();
    
    // 1. Buscar disponibilidades do app unificado (fonte principal)
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave && chave.includes('disponibilidades_usuario_')) {
            try {
                const cpfUsuario = chave.replace('disponibilidades_usuario_', '');
                const disps = JSON.parse(localStorage.getItem(chave) || '[]');
                
                for (const disp of disps) {
                    const uniqueKey = `${cpfUsuario}|${disp.data}|${disp.empresaId}`;
                    
                    if (!disponibilidadesMap.has(uniqueKey)) {
                        disponibilidadesMap.set(uniqueKey, {
                            cpf: cpfUsuario,
                            nome: disp.empresaNome || 'Usuário',
                            data: disp.data,
                            status: disp.status,
                            cache: disp.cache || 0,
                            horario: disp.horario || '',
                            observacao: disp.observacao || '',
                            hora_inicio: disp.horario || '',
                            hora_fim: '',
                            fonte: 'usuario'
                        });
                    }
                }
            } catch(e) { console.error('Erro ao ler:', chave, e); }
        }
    }
    
    // 2. Buscar disponibilidades por empresa (app unificado)
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        if (chave && chave.includes('disponibilidades_empresa_')) {
            try {
                const disps = JSON.parse(localStorage.getItem(chave) || '[]');
                for (const disp of disps) {
                    if (disp.cpf) {
                        const uniqueKey = `${disp.cpf}|${disp.data}|${chave}`;
                        if (!disponibilidadesMap.has(uniqueKey)) {
                            disponibilidadesMap.set(uniqueKey, {
                                cpf: disp.cpf,
                                nome: disp.nome || 'Usuário',
                                data: disp.data,
                                status: disp.status,
                                cache: disp.cache || 0,
                                horario: disp.horario || '',
                                observacao: disp.observacao || '',
                                hora_inicio: disp.horario || '',
                                hora_fim: '',
                                fonte: 'empresa'
                            });
                        }
                    }
                }
            } catch(e) { console.error('Erro ao ler:', chave, e); }
        }
    }
    
    // Converter Map para array
    const disponibilidades = Array.from(disponibilidadesMap.values());
    console.log(`📋 Total de disponibilidades únicas: ${disponibilidades.length}`);
    
    // Carregar cadastros de elenco e motoristas
    const elenco = JSON.parse(localStorage.getItem('elenco_cadastrados') || '[]');
    const motoristas = JSON.parse(localStorage.getItem('motoristas_cadastrados') || '[]');
    
    // Agrupar por data
    const porData = {};
    
    for (const disp of disponibilidades) {
        const dataDisp = disp.data;
        
        if (!porData[dataDisp]) {
            porData[dataDisp] = {
                disponiveis: [],
                indisponiveis: [],
                totalDisponivel: 0,
                totalIndisponivel: 0
            };
        }
        
        let pessoa = null;
        let nome = disp.nome || 'Usuário';
        let tipo = 'Equipe';
        
        if (disp.cpf) {
            pessoa = elenco.find(e => (e.doc_elenco_cadastro || '').replace(/\D/g, '') === disp.cpf) ||
                      motoristas.find(m => (m.doc_motoristas_cadastro || '').replace(/\D/g, '') === disp.cpf);
            
            if (pessoa) {
                nome = pessoa.nome_elenco || pessoa.nome_motoristas || nome;
                tipo = pessoa.nome_elenco ? '🎭 Elenco' : '🚗 Motorista';
            }
        }
        
        const cache = disp.cache || 0;
        const horarioInicio = disp.hora_inicio || disp.horario || '';
        const horarioFim = disp.hora_fim || '';
        
        if (disp.status === 'disponivel') {
            porData[dataDisp].disponiveis.push({ 
                nome, 
                tipo, 
                cpf: disp.cpf,
                obs: disp.observacao, 
                cache, 
                horarioInicio,
                horarioFim
            });
            porData[dataDisp].totalDisponivel += cache;
        } else if (disp.status === 'indisponivel') {
            porData[dataDisp].indisponiveis.push({ 
                nome, 
                tipo, 
                cpf: disp.cpf,
                obs: disp.observacao, 
                cache,
                horarioInicio,
                horarioFim
            });
            porData[dataDisp].totalIndisponivel += cache;
        }
    }
    
    // Atualizar cache
    disponibilidadesCache = porData;
    
    return porData;
}

/**
 * Mostrar calendário de disponibilidade da equipe - VERSÃO CORRIGIDA
 */
function mostrarDisponibilidadeElenco() {
    const disponibilidades = verificarDisponibilidadeEquipe();
    
    // Usar o mês e ano atual
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    
    // Criar o HTML do calendário
    let html = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;" id="modalDisponibilidade" onclick="if(event.target.id==='modalDisponibilidade') fecharModalDisponibilidade()">
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 1200px; width: 95%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0;">📅 Calendário de Disponibilidade da Equipe</h3>
                    <button class="btn danger" onclick="fecharModalDisponibilidade()" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">✖ Fechar</button>
                </div>
                
                <!-- Cabeçalho do calendário -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <button onclick="mudarMesCalendarioEquipe(-1)" style="background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">◀ Mês anterior</button>
                    <h3 id="mesAnoCalendarioEquipe" style="margin: 0;"></h3>
                    <button onclick="mudarMesCalendarioEquipe(1)" style="background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Próximo mês ▶</button>
                </div>
                
                <!-- Grid do calendário -->
                <div id="calendarioEquipeGrid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-bottom: 1.5rem;"></div>
                
                <!-- Legenda -->
                <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <h4>📌 Legenda:</h4>
                    <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;"><div style="width: 20px; height: 20px; background: #d4edda; border: 1px solid #28a745; border-radius: 4px;"></div><span>Todos disponíveis</span></div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;"><div style="width: 20px; height: 20px; background: #f8d7da; border: 1px solid #dc3545; border-radius: 4px;"></div><span>Todos indisponíveis</span></div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;"><div style="width: 20px; height: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;"></div><span>Disponibilidade mista</span></div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;"><div style="width: 20px; height: 20px; background: #e0e0e0; border: 1px solid #999; border-radius: 4px;"></div><span>Data passada</span></div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;"><div style="width: 20px; height: 20px; background: white; border: 1px solid #ddd; border-radius: 4px;"></div><span>Sem informação</span></div>
                    </div>
                    <p style="margin-top: 1rem; color: #666; font-size: 14px;">💡 Clique em um dia para ver detalhes da equipe</p>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior se existir
    const modalExistente = document.getElementById('modalDisponibilidade');
    if (modalExistente) modalExistente.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // Inicializar variáveis de controle
    window.calendarioEquipeMes = mesAtual;
    window.calendarioEquipeAno = anoAtual;
    
    // Renderizar calendário
    renderizarCalendarioEquipe(mesAtual, anoAtual);
}

/**
 * Renderizar calendário da equipe
 */
function renderizarCalendarioEquipe(mes, ano) {
    const disponibilidades = disponibilidadesCache || verificarDisponibilidadeEquipe();
    const container = document.getElementById('calendarioEquipeGrid');
    const mesAnoEl = document.getElementById('mesAnoCalendarioEquipe');
    if (!container) return;
    
    mesAnoEl.textContent = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataAtual = new Date(ano, mes, 1);
    
    let html = '';
    
    // Dias da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    diasSemana.forEach(dia => {
        html += `<div style="text-align:center;font-weight:600;padding:0.5rem;color:#667eea;">${dia}</div>`;
    });
    
    // Dias vazios antes do início do mês
    for (let i = 0; i < primeiroDia; i++) {
        html += `<div style="background: #f5f5f5; min-height: 100px; border-radius: 8px; padding: 0.5rem; opacity: 0.5;"></div>`;
    }
    
    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const dataObj = new Date(ano, mes, dia);
        const isDataPassada = dataObj < hoje && !(dataObj.getFullYear() === hoje.getFullYear() && dataObj.getMonth() === hoje.getMonth() && dataObj.getDate() === hoje.getDate());
        
        const disp = disponibilidades[dataStr];
        
        const totalDisp = disp ? disp.disponiveis.length : 0;
        const totalIndisp = disp ? disp.indisponiveis.length : 0;
        
        let corCard = 'white';
        let borderColor = '#ddd';
        let icone = '';
        
        // Definir cor baseada no status, mas se for data passada, sobrepor com cinza
        if (isDataPassada) {
            corCard = '#e0e0e0';
            borderColor = '#999';
            icone = '📅';
        } else if (totalDisp > 0 && totalIndisp === 0) {
            corCard = '#d4edda';
            borderColor = '#28a745';
            icone = '✅';
        } else if (totalIndisp > 0 && totalDisp === 0) {
            corCard = '#f8d7da';
            borderColor = '#dc3545';
            icone = '❌';
        } else if (totalDisp > 0 && totalIndisp > 0) {
            corCard = '#fff3cd';
            borderColor = '#ffc107';
            icone = '⚠️';
        }
        
        const isHoje = dataObj.getTime() === hoje.getTime();
        const hojeStyle = isHoje ? 'box-shadow: inset 0 0 0 2px #667eea;' : '';
        
        let resumoHtml = '';
        if (!isDataPassada && (totalDisp > 0 || totalIndisp > 0)) {
            resumoHtml = `
                <div style="font-size: 0.7rem; margin-top: 0.25rem;">
                    ${totalDisp > 0 ? `<div style="color: #28a745;">✅ ${totalDisp}</div>` : ''}
                    ${totalIndisp > 0 ? `<div style="color: #dc3545;">❌ ${totalIndisp}</div>` : ''}
                </div>
            `;
        } else if (isDataPassada && (totalDisp > 0 || totalIndisp > 0)) {
            resumoHtml = `
                <div style="font-size: 0.7rem; margin-top: 0.25rem; opacity: 0.6;">
                    ${totalDisp > 0 ? `<div style="color: #666;">✅ ${totalDisp}</div>` : ''}
                    ${totalIndisp > 0 ? `<div style="color: #666;">❌ ${totalIndisp}</div>` : ''}
                </div>
            `;
        }
        
        html += `
            <div style="background: ${corCard}; border: 2px solid ${borderColor}; border-radius: 8px; padding: 0.5rem; min-height: 100px; cursor: pointer; transition: all 0.3s; ${hojeStyle}"
                 onclick="mostrarDetalhesData('${dataStr}')"
                 onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)';"
                 onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                <div style="font-weight: 600; font-size: 1.1rem;">${dia} ${icone}</div>
                ${resumoHtml}
            </div>
        `;
    }
    
    container.innerHTML = html;
}

/**
 * Mudar mês do calendário da equipe
 */
function mudarMesCalendarioEquipe(delta) {
    window.calendarioEquipeMes += delta;
    if (window.calendarioEquipeMes < 0) {
        window.calendarioEquipeMes = 11;
        window.calendarioEquipeAno--;
    }
    if (window.calendarioEquipeMes > 11) {
        window.calendarioEquipeMes = 0;
        window.calendarioEquipeAno++;
    }
    renderizarCalendarioEquipe(window.calendarioEquipeMes, window.calendarioEquipeAno);
}

/**
 * Mostrar detalhes de uma data específica
 */
function mostrarDetalhesData(dataStr) {
    const disponibilidades = disponibilidadesCache || verificarDisponibilidadeEquipe();
    const elenco = JSON.parse(localStorage.getItem('elenco_cadastrados') || '[]');
    const motoristas = JSON.parse(localStorage.getItem('motoristas_cadastrados') || '[]');
    
    const [ano, mes, dia] = dataStr.split('-');
    const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const isDataPassada = dataObj < hoje;
    
    const dispData = disponibilidades[dataStr];
    const disponiveis = dispData ? dispData.disponiveis : [];
    const indisponiveis = dispData ? dispData.indisponiveis : [];
    
    // Calcular totais
    let totalDisponivel = dispData ? dispData.totalDisponivel : 0;
    let totalIndisponivel = dispData ? dispData.totalIndisponivel : 0;
    
    let html = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;" id="modalDetalhesData" onclick="if(event.target.id==='modalDetalhesData') fecharDetalhesData()">
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 1000px; width: 95%; max-height: 85vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0; text-transform: capitalize;">📅 ${dataFormatada} ${isDataPassada ? '(DATA PASSADA)' : ''}</h3>
                    <button onclick="fecharDetalhesData()" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">✖ Fechar</button>
                </div>
                
                <!-- Resumo de valores -->
                <div style="background: #e8f4fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h4 style="margin: 0 0 0.5rem 0;">💰 Resumo Financeiro</h4>
                    <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                        <div><strong>✅ Valor disponível:</strong> <span style="color: #28a745; font-weight: bold;">R$ ${totalDisponivel.toFixed(2)}</span></div>
                        <div><strong>❌ Valor indisponível:</strong> <span style="color: #dc3545; font-weight: bold;">R$ ${totalIndisponivel.toFixed(2)}</span></div>
                        <div><strong>💰 Total geral:</strong> <span style="font-weight: bold;">R$ ${(totalDisponivel + totalIndisponivel).toFixed(2)}</span></div>
                    </div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #2c3e50; color: white;">
                            <th style="padding: 12px; text-align: left;">Nome</th>
                            <th style="padding: 12px; text-align: left;">Tipo</th>
                            <th style="padding: 12px; text-align: left;">Horário</th>
                            <th style="padding: 12px; text-align: left;">Status</th>
                            <th style="padding: 12px; text-align: left;">Cachê</th>
                            <th style="padding: 12px; text-align: left;">Observação</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (disponiveis.length === 0 && indisponiveis.length === 0) {
        html += '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #6c757d;">📭 Nenhum membro informou disponibilidade para esta data</td></tr>';
    } else {
        for (const disp of disponiveis) {
            html += `
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px;">${disp.nome}</td>
                    <td style="padding: 10px;">${disp.tipo}</td>
                    <td style="padding: 10px;">${disp.horarioInicio || '-'}</td>
                    <td style="padding: 10px;"><span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px;">✅ Disponível</span></td>
                    <td style="padding: 10px; font-weight: bold; color: #28a745;">R$ ${disp.cache.toFixed(2)}</td>
                    <td style="padding: 10px;">${disp.obs || '-'}</td>
                </tr>
            `;
        }
        
        for (const disp of indisponiveis) {
            html += `
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px;">${disp.nome}</td>
                    <td style="padding: 10px;">${disp.tipo}</td>
                    <td style="padding: 10px;">${disp.horarioInicio || '-'}</td>
                    <td style="padding: 10px;"><span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 4px;">❌ Indisponível</span></td>
                    <td style="padding: 10px; font-weight: bold; color: #dc3545;">R$ ${disp.cache.toFixed(2)}</td>
                    <td style="padding: 10px;">${disp.obs || '-'}</td>
                 </tr>
            `;
        }
    }
    
    html += `
                    </tbody>
                 </table>
            </div>
        </div>
    `;
    
    const modalExistente = document.getElementById('modalDetalhesData');
    if (modalExistente) modalExistente.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Fechar modal de detalhes
 */
function fecharDetalhesData() {
    const modal = document.getElementById('modalDetalhesData');
    if (modal) modal.remove();
}

/**
 * Fechar modal principal
 */
function fecharModalDisponibilidade() {
    const modal = document.getElementById('modalDisponibilidade');
    if (modal) modal.remove();
}

/**
 * Visualizar disponibilidades de uma empresa específica
 */
function visualizarDisponibilidadesEmpresa(empresaId) {
    const empresaDispKey = `disponibilidades_empresa_${empresaId}`;
    let disponibilidades = JSON.parse(localStorage.getItem(empresaDispKey) || '[]');
    
    const uniqueMap = new Map();
    for (const disp of disponibilidades) {
        const key = `${disp.cpf}|${disp.data}`;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, disp);
        }
    }
    disponibilidades = Array.from(uniqueMap.values());
    
    if (disponibilidades.length === 0) {
        alert('Nenhum membro informou disponibilidade para esta empresa.');
        return;
    }
    
    const porData = {};
    for (const disp of disponibilidades) {
        if (!porData[disp.data]) {
            porData[disp.data] = { disponiveis: [], indisponiveis: [] };
        }
        if (disp.status === 'disponivel') {
            porData[disp.data].disponiveis.push(disp);
        } else {
            porData[disp.data].indisponiveis.push(disp);
        }
    }
    
    const datasOrdenadas = Object.keys(porData).sort();
    
    let html = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;" onclick="if(event.target===this) this.remove()">
            <div style="background: white; padding: 1.5rem; border-radius: 12px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3>📅 Disponibilidade da Equipe (${datasOrdenadas.length} datas)</h3>
                    <button onclick="this.closest('div').parentElement.remove()" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">✖ Fechar</button>
                </div>
    `;
    
    for (const data of datasOrdenadas) {
        const [ano, mes, dia] = data.split('-');
        const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const dados = porData[data];
        
        html += `
            <div style="margin-bottom: 1.5rem; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background: #f8f9fa; padding: 0.75rem; border-bottom: 1px solid #ddd;">
                    <strong>📅 ${dataFormatada}</strong>
                </div>
                <div style="padding: 0.75rem;">
                    ${dados.disponiveis.length > 0 ? `
                        <div style="margin-bottom: 0.5rem;">
                            <strong style="color: #28a745;">✅ Disponíveis (${dados.disponiveis.length}):</strong>
                            <div style="margin-left: 1rem;">
                                ${dados.disponiveis.map(d => `
                                    <div>• ${d.nome} (${d.tipo === 'elenco' ? '🎭 Elenco' : '🚗 Motorista'})${d.horario ? ` - ${d.horario}` : ''} - 💰 R$ ${(d.cache || 0).toFixed(2)}${d.observacao ? ` - ${d.observacao}` : ''}</div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${dados.indisponiveis.length > 0 ? `
                        <div>
                            <strong style="color: #dc3545;">❌ Indisponíveis (${dados.indisponiveis.length}):</strong>
                            <div style="margin-left: 1rem;">
                                ${dados.indisponiveis.map(d => `
                                    <div>• ${d.nome} (${d.tipo === 'elenco' ? '🎭 Elenco' : '🚗 Motorista'})${d.horario ? ` - ${d.horario}` : ''} - 💰 R$ ${(d.cache || 0).toFixed(2)}${d.observacao ? ` - ${d.observacao}` : ''}</div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    html += `</div></div>`;
    
    const modalExistente = document.querySelector('div[style*="position: fixed"][style*="z-index: 10000"]');
    if (modalExistente && modalExistente.innerHTML.includes('Disponibilidade da Equipe')) {
        modalExistente.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Formatar data local
 */
function formatarDataLocal(dataStr) {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Exportar funções para uso global
window.verificarDisponibilidadeEquipe = verificarDisponibilidadeEquipe;
window.mostrarDisponibilidadeElenco = mostrarDisponibilidadeElenco;
window.mostrarDetalhesData = mostrarDetalhesData;
window.fecharDetalhesData = fecharDetalhesData;
window.fecharModalDisponibilidade = fecharModalDisponibilidade;
window.visualizarDisponibilidadesEmpresa = visualizarDisponibilidadesEmpresa;
window.formatarDataLocal = formatarDataLocal;
window.renderizarCalendarioEquipe = renderizarCalendarioEquipe;
window.mudarMesCalendarioEquipe = mudarMesCalendarioEquipe;

console.log('✅ disponibilidade-elenco.js carregado (versão corrigida)');