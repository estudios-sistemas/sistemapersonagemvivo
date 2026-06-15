// ==================== APP UNIFICADO DE ESCALAS - VERSÃO COMPLETA ====================

let app = null;

class AppUnificadoEscalas {
    constructor() {
        this.usuarioLogado = null;
        this.cpfUsuario = null;
        this.empresas = [];
        this.eventosPorEmpresa = {};
        this.disponibilidades = [];
        this.mesAtual = new Date().getMonth();
        this.anoAtual = new Date().getFullYear();
        this.filtroAtual = {
            periodo: 'todos',
            empresa: 'todas',
            pagamento: 'todos'
        };
        this.filtroDisponibilidadeEmpresa = 'todas';
        this.filtroResumoEmpresa = 'todas';
    }
    
    async init() {
        console.log('🚀 Inicializando App de Escalas...');
        
        this.usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogadoUnificado') || 'null');
        
        if (!this.usuarioLogado) {
            window.location.href = 'login-unificado.html';
            return;
        }
        
        this.cpfUsuario = this.usuarioLogado.cpf;
        console.log(`✅ Usuário logado: ${this.usuarioLogado.nome}`);
        
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.innerHTML = `👤 ${this.usuarioLogado.nome} | ${this.usuarioLogado.tipo === 'elenco' ? '🎬 Elenco' : '🚗 Motorista'}`;
        }
        
        await this.carregarTodasEmpresas();
        await this.carregarDisponibilidades();
        await this.sincronizarDisponibilidadesComEventos();
        
        this.renderizarEmpresas();
        this.renderizarEventos();
        this.renderizarCalendario();
        this.renderizarDisponibilidades();
        this.renderizarResumo();
        
        console.log(`✅ App inicializado! Empresas: ${this.empresas.length}`);
    }
    
    async carregarDisponibilidades() {
        const disponibilidadesKey = `disponibilidades_usuario_${this.cpfUsuario}`;
        const dadosSalvos = localStorage.getItem(disponibilidadesKey);
        
        if (dadosSalvos) {
            this.disponibilidades = JSON.parse(dadosSalvos);
        } else {
            this.disponibilidades = [];
        }
        this.disponibilidades = this.disponibilidades.filter(disp => disp && disp.data);
    }
    
    salvarDisponibilidades() {
        const disponibilidadesKey = `disponibilidades_usuario_${this.cpfUsuario}`;
        localStorage.setItem(disponibilidadesKey, JSON.stringify(this.disponibilidades));
    }
    
    async sincronizarDisponibilidadesComEventos() {
        console.log('🔄 Sincronizando disponibilidades com eventos...');
        
        for (const empresa of this.empresas) {
            const eventos = this.eventosPorEmpresa[empresa.id] || [];
            
            for (const evento of eventos) {
                const dispIndex = this.disponibilidades.findIndex(d => 
                    d.empresaId === empresa.id && d.data === evento.data
                );
                
                if (dispIndex !== -1) {
                    if (evento.cache > 0) {
                        this.disponibilidades[dispIndex].cache = evento.cache;
                        this.disponibilidades[dispIndex].statusPagamento = evento.statusPagamento;
                        this.disponibilidades[dispIndex].horario = evento.horario;
                        this.disponibilidades[dispIndex].cliente = evento.cliente;
                        this.disponibilidades[dispIndex].local = evento.local;
                        this.disponibilidades[dispIndex].funcao = evento.funcao;
                        this.disponibilidades[dispIndex].statusEscala = 'escalado';
                        console.log(`✅ Disponibilidade atualizada: ${evento.data} - R$ ${evento.cache}`);
                    }
                } else if (evento.cache > 0) {
                    this.disponibilidades.push({
                        empresaId: empresa.id,
                        empresaNome: empresa.nome,
                        data: evento.data,
                        status: 'disponivel',
                        statusEscala: 'escalado',
                        cache: evento.cache,
                        statusPagamento: evento.statusPagamento,
                        horario: evento.horario,
                        cliente: evento.cliente,
                        local: evento.local,
                        funcao: evento.funcao,
                        dataCadastro: new Date().toISOString()
                    });
                    console.log(`✅ Nova disponibilidade criada a partir de escala: ${evento.data}`);
                }
            }
        }
        this.salvarDisponibilidades();
    }
    
    async carregarTodasEmpresas() {
        console.log('🔍 Buscando empresas para o CPF:', this.cpfUsuario);
        this.empresas = [];
        this.eventosPorEmpresa = {};
        
        const empresasMap = new Map();
        
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            
            if (chave && chave.includes('usuarios_app_')) {
                try {
                    const usuarios = JSON.parse(localStorage.getItem(chave) || '[]');
                    const usuarioEncontrado = usuarios.find(u => u.cpf === this.cpfUsuario);
                    
                    if (usuarioEncontrado) {
                        let empresaId = chave.replace('usuarios_app_', '');
                        let empresaNome = `Empresa ${empresaId.substring(0, 6)}`;
                        
                        const empresaData = localStorage.getItem(`empresa_${empresaId}`);
                        if (empresaData) {
                            try {
                                const empresa = JSON.parse(empresaData);
                                if (empresa.nome) empresaNome = empresa.nome;
                            } catch(e) {}
                        }
                        
                        if (empresaId && empresaId !== 'undefined' && empresaId !== 'null') {
                            empresasMap.set(empresaId, {
                                id: empresaId,
                                nome: empresaNome,
                                cor: this.gerarCorEmpresa(empresaId),
                                tipo_usuario: usuarioEncontrado.tipo
                            });
                        }
                    }
                } catch(e) {}
            }
        }
        
        this.empresas = Array.from(empresasMap.values());
        console.log(`📊 ${this.empresas.length} empresas encontradas`);
        
        for (const empresa of this.empresas) {
            await this.carregarEventosDaEmpresa(empresa);
        }
    }
    
    gerarCorEmpresa(empresaId) {
        let hash = 0;
        for (let i = 0; i < empresaId.length; i++) {
            hash = empresaId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 50%)`;
    }
    
    async carregarEventosDaEmpresa(empresa) {
        this.eventosPorEmpresa[empresa.id] = [];
        
        let escalas = [];
        const chavesEscalas = [`${empresa.id}_escalas_eventos`, `escalas_eventos_${empresa.id}`, `escalas_eventos`];
        for (const chave of chavesEscalas) {
            const dados = localStorage.getItem(chave);
            if (dados && dados !== '[]') {
                escalas = JSON.parse(dados);
                break;
            }
        }
        
        let eventos = [];
        const chavesEventos = [`${empresa.id}_eventos_cadastrados`, `eventos_cadastrados_${empresa.id}`, `eventos_cadastrados`];
        for (const chave of chavesEventos) {
            const dados = localStorage.getItem(chave);
            if (dados && dados !== '[]') {
                eventos = JSON.parse(dados);
                break;
            }
        }
        
        const minhasEscalas = escalas.filter(escala => {
            return (escala.elenco_cpfs || []).includes(this.cpfUsuario) || escala.motorista_cpf === this.cpfUsuario;
        });
        
        for (const escala of minhasEscalas) {
            const evento = eventos.find(e => e.id == escala.evento_id);
            if (!evento) continue;
            
            let cache = 0;
            let funcao = '';
            
            if ((escala.elenco_cpfs || []).includes(this.cpfUsuario)) {
                funcao = '🎭 Elenco';
                cache = escala.cache_elenco || 0;
            } else if (escala.motorista_cpf === this.cpfUsuario) {
                funcao = '🚗 Motorista';
                cache = escala.cache_motorista || 0;
            }
            
            const dataEvento = new Date(evento.data_evento);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const statusPagamento = dataEvento < hoje ? 'Pago' : 'A Receber';
            
            this.eventosPorEmpresa[empresa.id].push({
                id: evento.id,
                empresaId: empresa.id,
                empresaNome: empresa.nome,
                empresaCor: empresa.cor,
                cliente: evento.nome_cliente_evento || 'Cliente',
                telefone: evento.telefone_cliente_evento || '-',
                data: evento.data_evento,
                horario: evento.hora_evento || 'Não informado',
                local: evento.nome_local_evento || 'Local não informado',
                funcao: funcao,
                cache: cache,
                statusPagamento: statusPagamento,
                observacoes: escala.observacoes || ''
            });
        }
    }
    
    renderizarEmpresas() {
        this.popularSelectsEmpresa();
        this.popularSelectResumo();
    }
    
    popularSelectsEmpresa() {
        const selectEscalas = document.getElementById('filtroEmpresaEscalas');
        if (selectEscalas) {
            selectEscalas.innerHTML = '<option value="todas">🏢 Todas as empresas</option>';
            this.empresas.forEach(empresa => {
                selectEscalas.innerHTML += `<option value="${empresa.id}">🏢 ${empresa.nome}</option>`;
            });
        }
        
        const selectDispEmpresa = document.getElementById('dispEmpresa');
        if (selectDispEmpresa) {
            selectDispEmpresa.innerHTML = '<option value="">Selecione a empresa</option>';
            this.empresas.forEach(empresa => {
                selectDispEmpresa.innerHTML += `<option value="${empresa.id}">${empresa.nome}</option>`;
            });
        }
        
        const selectFiltroDisp = document.getElementById('filtroDispEmpresa');
        if (selectFiltroDisp) {
            selectFiltroDisp.innerHTML = '<option value="todas">Todas as empresas</option>';
            this.empresas.forEach(empresa => {
                selectFiltroDisp.innerHTML += `<option value="${empresa.id}">${empresa.nome}</option>`;
            });
        }
    }
    
    popularSelectResumo() {
        const selectResumo = document.getElementById('filtroResumoEmpresa');
        if (selectResumo) {
            selectResumo.innerHTML = '<option value="todas">🏢 Todas as empresas</option>';
            this.empresas.forEach(empresa => {
                selectResumo.innerHTML += `<option value="${empresa.id}">🏢 ${empresa.nome}</option>`;
            });
            selectResumo.onchange = () => {
                this.filtroResumoEmpresa = selectResumo.value;
                this.renderizarResumo();
            };
        }
    }
    
    renderizarEventos() {
        const container = document.getElementById('eventosGrid');
        if (!container) return;
        
        let todosEventos = [];
        for (const empresa of this.empresas) {
            if (this.filtroAtual.empresa !== 'todas' && empresa.id !== this.filtroAtual.empresa) {
                continue;
            }
            todosEventos.push(...(this.eventosPorEmpresa[empresa.id] || []));
        }
        
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        let eventosFiltrados = todosEventos.filter(evento => {
            const dataEvento = new Date(evento.data);
            dataEvento.setHours(0, 0, 0, 0);
            
            switch(this.filtroAtual.periodo) {
                case 'proximos': return dataEvento >= hoje;
                case 'passados': return dataEvento < hoje;
                case 'hoje': return dataEvento.getTime() === hoje.getTime();
                case 'semana':
                    const semana = new Date();
                    semana.setDate(hoje.getDate() + 7);
                    return dataEvento >= hoje && dataEvento <= semana;
                case 'mes':
                    const mes = new Date();
                    mes.setDate(hoje.getDate() + 30);
                    return dataEvento >= hoje && dataEvento <= mes;
                default: return true;
            }
        });
        
        eventosFiltrados = eventosFiltrados.filter(evento => {
            switch(this.filtroAtual.pagamento) {
                case 'pago': return evento.statusPagamento === 'Pago';
                case 'pendente': return evento.statusPagamento === 'A Receber';
                default: return true;
            }
        });
        
        eventosFiltrados.sort((a, b) => new Date(a.data) - new Date(b.data));
        
        const disponibilidadesPendentes = this.disponibilidades.filter(disp => {
            const eventoRelacionado = this.buscarEventoPorData(disp.empresaId, disp.data);
            const naoEscalado = !eventoRelacionado || eventoRelacionado.cache === 0;
            const empresaFiltro = this.filtroAtual.empresa === 'todas' || disp.empresaId === this.filtroAtual.empresa;
            return naoEscalado && empresaFiltro && disp.status !== 'indisponivel';
        });
        
        if (eventosFiltrados.length === 0 && disponibilidadesPendentes.length > 0) {
            this.renderizarQuadroDisponibilidades(container, disponibilidadesPendentes);
            return;
        }
        
        if (eventosFiltrados.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: white; border-radius: 12px;">
                    <div style="font-size: 3rem;">📭</div>
                    <p style="margin-top: 1rem; color: #666;">Nenhum evento encontrado.</p>
                    <button onclick="mudarAba('disponibilidade')" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 6px;">📝 Cadastrar Disponibilidade</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `<div class="eventos-grid">
            ${eventosFiltrados.map(evento => {
                const estaPago = evento.statusPagamento === 'Pago';
                const corFundo = estaPago ? '#d4edda' : '#fff3cd';
                const corBorda = estaPago ? '#28a745' : '#ffc107';
                const statusTexto = estaPago ? '✅ PAGO' : '⏳ PENDENTE';
                const corCache = estaPago ? '#28a745' : '#ffc107';
                
                return `
                    <div class="evento-card" style="border-left: 4px solid ${corBorda};">
                        <div class="evento-header" style="background: ${corFundo}; padding: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: bold;">🏢 ${evento.empresaNome}</span>
                                <span style="background: ${corBorda}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${statusTexto}</span>
                            </div>
                        </div>
                        <div class="evento-body" style="padding: 0.75rem;">
                            <div><strong>📅 Data/Hora:</strong> ${new Date(evento.data).toLocaleDateString('pt-BR')} • ${evento.horario}</div>
                            <div><strong>👤 Cliente:</strong> ${evento.cliente}</div>
                            <div><strong>📍 Local:</strong> ${evento.local}</div>
                            <div><strong>🎭 Função:</strong> ${evento.funcao}</div>
                            <div><strong>💰 Cachê:</strong> <span style="color: ${corCache}; font-weight: bold;">R$ ${evento.cache.toFixed(2)}</span></div>
                            <button onclick="window.excluirEscala('${evento.id}', '${evento.empresaId}', '${evento.data}')" style="margin-top: 0.5rem; padding: 0.5rem; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%;">🗑️ Cancelar Escala</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>`;
    }
    
    renderizarQuadroDisponibilidades(container, disponibilidades) {
        disponibilidades.sort((a, b) => new Date(a.data) - new Date(b.data));
        
        container.innerHTML = `
            <div class="eventos-grid">
                ${disponibilidades.map(disp => {
                    const empresa = this.empresas.find(e => e.id === disp.empresaId);
                    const empresaNome = empresa ? empresa.nome : disp.empresaNome || 'Empresa';
                    const dataFormatada = new Date(disp.data + 'T12:00:00').toLocaleDateString('pt-BR');
                    const index = this.disponibilidades.findIndex(d => d.data === disp.data && d.empresaId === disp.empresaId);
                    
                    return `
                        <div class="evento-card" style="border-left: 4px solid #ffc107; background: white;">
                            <div class="evento-header" style="background: #fff3cd; padding: 0.75rem; border-radius: 8px 8px 0 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: bold; color: #333 !important;">🏢 ${empresaNome}</span>
                                    <span style="font-size: 0.9rem; color: #333 !important;">🟡 Disponível - Pendente de Escala</span>
                                </div>
                            </div>
                            <div class="evento-body" style="padding: 0.75rem; color: #333 !important;">
                                <div><strong>📅 Data:</strong> ${dataFormatada} ${disp.horario ? `• ${disp.horario}` : ''}</div>
                                <div><strong>💰 Cachê:</strong> <span style="color: #856404;">Aguardando definição da empresa</span></div>
                                ${disp.observacao ? `<div><strong>📝 Obs:</strong> ${disp.observacao}</div>` : ''}
                                <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #856404;"><strong>📢 Status:</strong> Aguardando confirmação da empresa</div>
                                <button onclick="app.removerDisponibilidade(${index})" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">🗑️ Remover</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    renderizarDisponibilidades() {
        const container = document.getElementById('listaDisponibilidades');
        if (!container) return;
        
        let disponibilidadesFiltradas = [...this.disponibilidades];
        if (this.filtroDisponibilidadeEmpresa !== 'todas') {
            disponibilidadesFiltradas = disponibilidadesFiltradas.filter(d => d.empresaId === this.filtroDisponibilidadeEmpresa);
        }
        
        disponibilidadesFiltradas.sort((a, b) => new Date(a.data) - new Date(b.data));
        
        if (disponibilidadesFiltradas.length === 0) {
            container.innerHTML = `<div style="text-align: center; padding: 2rem; background: white; border-radius: 12px;"><div style="font-size: 3rem;">📭</div><p>Nenhuma disponibilidade cadastrada.</p></div>`;
            return;
        }
        
        let html = '<div class="eventos-grid">';
        
        for (const disp of disponibilidadesFiltradas) {
            const empresa = this.empresas.find(e => e.id === disp.empresaId);
            const empresaNome = empresa ? empresa.nome : disp.empresaNome || 'Empresa';
            const dataFormatada = new Date(disp.data + 'T12:00:00').toLocaleDateString('pt-BR');
            const eventoRelacionado = this.buscarEventoPorData(disp.empresaId, disp.data);
            const estaEscalado = eventoRelacionado && eventoRelacionado.cache > 0;
            const estaPago = eventoRelacionado && eventoRelacionado.statusPagamento === 'Pago';
            const index = this.disponibilidades.findIndex(d => d.data === disp.data && d.empresaId === disp.empresaId);
            
            let statusIcon = '', statusTexto = '', corFundo = '', corBorda = '';
            
            if (disp.status === 'indisponivel') {
                statusIcon = '🔴';
                statusTexto = 'Indisponível';
                corFundo = '#f8d7da';
                corBorda = '#dc3545';
            } else if (estaEscalado && estaPago) {
                statusIcon = '✅';
                statusTexto = 'Escalado - Pago';
                corFundo = '#d4edda';
                corBorda = '#28a745';
            } else if (estaEscalado) {
                statusIcon = '📌';
                statusTexto = 'Escalado - Pendente';
                corFundo = '#fff3cd';
                corBorda = '#ffc107';
            } else {
                statusIcon = '🟡';
                statusTexto = 'Disponível - Pendente de Escala';
                corFundo = '#fff3cd';
                corBorda = '#ffc107';
            }
            
            html += `
                <div class="evento-card" style="border-left: 4px solid ${corBorda};">
                    <div class="evento-header" style="background: ${corFundo}; padding: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: bold;">🏢 ${empresaNome}</span>
                            <span style="font-size: 0.9rem;">${statusIcon} ${statusTexto}</span>
                        </div>
                    </div>
                    <div class="evento-body" style="padding: 0.75rem;">
                        <div><strong>📅 Data:</strong> ${dataFormatada} ${eventoRelacionado ? `• ${eventoRelacionado.horario}` : (disp.horario ? `• ${disp.horario}` : '')}</div>
                        <div><strong>💰 Cachê:</strong> ${eventoRelacionado ? `R$ ${eventoRelacionado.cache.toFixed(2)}` : (disp.cache ? `R$ ${disp.cache.toFixed(2)}` : 'Aguardando empresa')}</div>
                        <button onclick="app.removerDisponibilidade(${index})" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">🗑️ Remover</button>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    buscarEventoPorData(empresaId, data) {
        const eventos = this.eventosPorEmpresa[empresaId] || [];
        return eventos.find(e => e.data === data);
    }
    
    removerDisponibilidade(index) {
        if (!confirm('Remover esta disponibilidade?')) return;
        this.disponibilidades.splice(index, 1);
        this.salvarDisponibilidades();
        this.renderizarDisponibilidades();
        this.renderizarResumo();
        this.renderizarEventos();
        this.renderizarCalendario();
        alert('✅ Removida!');
    }
    
    adicionarDisponibilidade() {
        const empresaId = document.getElementById('dispEmpresa').value;
        const data = document.getElementById('dispData').value;
        const status = document.getElementById('dispStatus').value;
        const horario = document.getElementById('dispHorario').value;
        const observacao = document.getElementById('dispObs').value;
        
        if (!empresaId) { alert('❌ Selecione a empresa!'); return; }
        if (!data) { alert('❌ Selecione uma data!'); return; }
        
        const existe = this.disponibilidades.some(d => d.empresaId === empresaId && d.data === data);
        if (existe) { alert('⚠️ Disponibilidade já existe!'); return; }
        
        const empresa = this.empresas.find(e => e.id === empresaId);
        
        this.disponibilidades.push({
            empresaId: empresaId,
            empresaNome: empresa ? empresa.nome : 'Empresa',
            data: data,
            status: status,
            cache: 0,
            horario: horario,
            observacao: observacao,
            dataCadastro: new Date().toISOString()
        });
        
        this.salvarDisponibilidades();
        this.renderizarDisponibilidades();
        this.renderizarResumo();
        this.renderizarEventos();
        this.renderizarCalendario();
        
        document.getElementById('dispData').value = '';
        document.getElementById('dispHorario').value = '';
        document.getElementById('dispObs').value = '';
        alert('✅ Disponibilidade adicionada!');
    }
    
    filtrarDisponibilidadesPorEmpresa() {
        const filtro = document.getElementById('filtroDispEmpresa');
        this.filtroDisponibilidadeEmpresa = filtro ? filtro.value : 'todas';
        this.renderizarDisponibilidades();
    }
    
    renderizarCalendario() {
        const container = document.getElementById('calendarioGrid');
        const mesAno = document.getElementById('mesAnoAtual');
        if (!container || !mesAno) return;
        
        const data = new Date(this.anoAtual, this.mesAtual, 1);
        const primeiroDia = data.getDay();
        const diasNoMes = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();
        
        mesAno.textContent = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        let html = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;">';
        html += ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(dia => 
            `<div style="text-align:center;font-weight:600;padding:0.5rem;color:#667eea;">${dia}</div>`
        ).join('');
        
        for (let i = 0; i < primeiroDia; i++) html += `<div></div>`;
        
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const dataStr = `${this.anoAtual}-${String(this.mesAtual+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
            
            const eventosDoDia = [];
            for (const empresa of this.empresas) {
                const eventos = this.eventosPorEmpresa[empresa.id] || [];
                eventosDoDia.push(...eventos.filter(e => e.data === dataStr));
            }
            
            const disponibilidadesDoDia = this.disponibilidades.filter(disp => {
                const eventoRelacionado = this.buscarEventoPorData(disp.empresaId, disp.data);
                const naoEscalado = !eventoRelacionado || eventoRelacionado.cache === 0;
                return disp.data === dataStr && naoEscalado && disp.status !== 'indisponivel';
            });
            
            const temEvento = eventosDoDia.length > 0;
            const temDisponibilidade = disponibilidadesDoDia.length > 0;
            
            let bgColor = '#f8f9fa';
            let borderColor = '#e0e0e0';
            let eventoHtml = '';
            
            if (temEvento) {
                bgColor = '#d4edda';
                borderColor = '#28a745';
                const primeiroEvento = eventosDoDia[0];
                eventoHtml = `<div style="font-size:0.65rem; margin-top:0.25rem; background:#28a74520; border-radius:4px; padding:2px;">
                    <span>🏢 ${primeiroEvento.empresaNome.substring(0,12)}</span><br>
                    <span>🕐 ${primeiroEvento.horario}</span><br>
                    <span>🎭 ${primeiroEvento.funcao}</span>
                </div>`;
                if (eventosDoDia.length > 1) {
                    eventoHtml += `<div style="font-size:0.6rem; color:#666;">+${eventosDoDia.length-1} outro(s)</div>`;
                }
            } else if (temDisponibilidade) {
                bgColor = '#fff3cd';
                borderColor = '#ffc107';
                const primeiraDisp = disponibilidadesDoDia[0];
                eventoHtml = `<div style="font-size:0.65rem; margin-top:0.25rem; background:#ffc10720; border-radius:4px; padding:2px;">
                    <span>🏢 ${primeiraDisp.empresaNome ? primeiraDisp.empresaNome.substring(0,12) : 'Empresa'}</span><br>
                    <span>🟡 Disponível</span>
                </div>`;
                if (disponibilidadesDoDia.length > 1) {
                    eventoHtml += `<div style="font-size:0.6rem; color:#856404;">+${disponibilidadesDoDia.length-1} outra(s)</div>`;
                }
            }
            
            html += `
                <div class="calendario-dia" style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 0.5rem; cursor: pointer; transition: all 0.3s;" 
                     onclick="verEventosDoDia('${dataStr}')"
                     onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)';"
                     onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                    <div class="dia-numero" style="font-weight: 600;">${dia}</div>
                    ${eventoHtml}
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    renderizarResumo() {
        const container = document.getElementById('resumoFinanceiro');
        if (!container) return;
        
        let totalPago = 0;
        let totalReceber = 0;
        let totalGeral = 0;
        
        for (const empresa of this.empresas) {
            if (this.filtroResumoEmpresa !== 'todas' && empresa.id !== this.filtroResumoEmpresa) {
                continue;
            }
            
            const eventos = this.eventosPorEmpresa[empresa.id] || [];
            for (const evento of eventos) {
                if (evento.statusPagamento === 'Pago') {
                    totalPago += evento.cache;
                } else {
                    totalReceber += evento.cache;
                }
                totalGeral += evento.cache;
            }
        }
        
        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <label style="font-weight: 600;">🏢 Filtrar por empresa:</label>
                <select id="filtroResumoEmpresa" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ddd; border-radius: 6px;"></select>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">R$ ${totalGeral.toFixed(2)}</div>
                    <div>💰 Total Geral</div>
                </div>
                <div style="background: #28a745; color: white; padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">R$ ${totalPago.toFixed(2)}</div>
                    <div>✅ Recebido</div>
                </div>
                <div style="background: #ffc107; color: #f9f5f5; padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">R$ ${totalReceber.toFixed(2)}</div>
                    <div>⏳ A Receber</div>
                </div>
            </div>
        `;
        
        const selectResumo = document.getElementById('filtroResumoEmpresa');
        if (selectResumo && selectResumo.options.length <= 1) {
            selectResumo.innerHTML = '<option value="todas">🏢 Todas as empresas</option>';
            this.empresas.forEach(empresa => {
                selectResumo.innerHTML += `<option value="${empresa.id}">🏢 ${empresa.nome}</option>`;
            });
            selectResumo.value = this.filtroResumoEmpresa;
            selectResumo.onchange = () => {
                this.filtroResumoEmpresa = selectResumo.value;
                this.renderizarResumo();
            };
        }
    }
    
    mudarMes(delta) {
        this.mesAtual += delta;
        if (this.mesAtual < 0) { this.mesAtual = 11; this.anoAtual--; }
        if (this.mesAtual > 11) { this.mesAtual = 0; this.anoAtual++; }
        this.renderizarCalendario();
    }
    
    verEventosDoDia(dataStr) {
        let eventos = [];
        for (const empresa of this.empresas) {
            eventos.push(...(this.eventosPorEmpresa[empresa.id] || []).filter(e => e.data === dataStr));
        }
        
        const disponibilidades = this.disponibilidades.filter(disp => {
            const eventoRelacionado = this.buscarEventoPorData(disp.empresaId, disp.data);
            const naoEscalado = !eventoRelacionado || eventoRelacionado.cache === 0;
            return disp.data === dataStr && naoEscalado && disp.status !== 'indisponivel';
        });
        
        const dataFormatada = new Date(dataStr).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        
        let mensagem = `📅 ${dataFormatada.toUpperCase()}\n\n`;
        
        if (eventos.length === 0 && disponibilidades.length === 0) {
            mensagem += '📭 Nenhum evento ou disponibilidade neste dia.';
            alert(mensagem);
            return;
        }
        
        if (eventos.length > 0) {
            mensagem += `✅ EVENTOS ESCALADOS (${eventos.length}):\n`;
            mensagem += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            eventos.forEach((e, i) => {
                const statusPagamento = e.statusPagamento === 'Pago' ? '✅ PAGO' : '⏳ PENDENTE';
                mensagem += `\n${i+1}. 🏢 ${e.empresaNome}\n`;
                mensagem += `   📅 ${new Date(e.data).toLocaleDateString('pt-BR')} • ${e.horario}\n`;
                mensagem += `   👤 Cliente: ${e.cliente}\n`;
                mensagem += `   📍 Local: ${e.local}\n`;
                mensagem += `   🎭 Função: ${e.funcao}\n`;
                mensagem += `   💰 Cachê: R$ ${e.cache.toFixed(2)}\n`;
                mensagem += `   💵 Status: ${statusPagamento}\n`;
            });
        }
        
        if (disponibilidades.length > 0) {
            if (eventos.length > 0) mensagem += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
            mensagem += `\n🟡 DISPONIBILIDADES PENDENTES (${disponibilidades.length}):\n`;
            mensagem += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            disponibilidades.forEach((d, i) => {
                const empresa = this.empresas.find(e => e.id === d.empresaId);
                const empresaNome = empresa ? empresa.nome : d.empresaNome || 'Empresa';
                mensagem += `\n${i+1}. 🏢 ${empresaNome}\n`;
                mensagem += `   📅 ${new Date(d.data).toLocaleDateString('pt-BR')}\n`;
                mensagem += `   🟡 Status: Disponível - Aguardando Escala\n`;
                if (d.horario) mensagem += `   🕐 Horário informado: ${d.horario}\n`;
                if (d.observacao) mensagem += `   📝 Obs: ${d.observacao}\n`;
            });
        }
        
        alert(mensagem);
    }
    
    sair() {
        if (confirm('Sair?')) {
            sessionStorage.removeItem('usuarioLogadoUnificado');
            window.location.href = 'login-unificado.html';
        }
    }
}

// Função Global excluirEscala
window.excluirEscala = function(eventoId, empresaId, dataEvento) {
    if (!confirm('⚠️ Tem certeza que deseja cancelar esta escala?')) return;
    
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogadoUnificado') || '{}');
    const cpfUsuario = usuarioLogado.cpf;
    if (!cpfUsuario) { alert('❌ Usuário não identificado!'); return; }
    
    const chavesEscalas = [`${empresaId}_escalas_eventos`, `escalas_eventos_${empresaId}`, `escalas_eventos`];
    for (const chave of chavesEscalas) {
        const dados = localStorage.getItem(chave);
        if (dados && dados !== '[]') {
            let escalas = JSON.parse(dados);
            const escalaIndex = escalas.findIndex(e => e.evento_id == eventoId);
            if (escalaIndex !== -1) {
                const escala = escalas[escalaIndex];
                if (escala.elenco_cpfs) escala.elenco_cpfs = escala.elenco_cpfs.filter(cpf => cpf !== cpfUsuario);
                if (escala.motorista_cpf === cpfUsuario) escala.motorista_cpf = null;
                
                const temElenco = escala.elenco_cpfs && escala.elenco_cpfs.length > 0;
                const temMotorista = escala.motorista_cpf && escala.motorista_cpf !== null;
                if (!temElenco && !temMotorista) escalas.splice(escalaIndex, 1);
                else escalas[escalaIndex] = escala;
                
                localStorage.setItem(chave, JSON.stringify(escalas));
                break;
            }
        }
    }
    
    if (app && app.disponibilidades) {
        const idx = app.disponibilidades.findIndex(d => d.empresaId === empresaId && d.data === dataEvento);
        if (idx !== -1) { app.disponibilidades.splice(idx, 1); app.salvarDisponibilidades(); }
    }
    
    setTimeout(async () => {
        await app.carregarTodasEmpresas();
        await app.carregarDisponibilidades();
        await app.sincronizarDisponibilidadesComEventos();
        app.renderizarEventos();
        app.renderizarDisponibilidades();
        app.renderizarCalendario();
        app.renderizarResumo();
    }, 500);
    
    alert('✅ Escala cancelada!');
};

// Funções Globais
function mudarAba(aba) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) window.event.target.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const abaElem = document.getElementById(`aba-${aba}`);
    if (abaElem) abaElem.classList.add('active');
}

function mudarMes(delta) { app?.mudarMes(delta); }
function verEventosDoDia(data) { app?.verEventosDoDia(data); }
function adicionarDisponibilidade() { app?.adicionarDisponibilidade(); }
function removerDisponibilidade(index) { app?.removerDisponibilidade(index); }
function filtrarDisponibilidadesPorEmpresa() { app?.filtrarDisponibilidadesPorEmpresa(); }
function sair() { app?.sair(); }

function aplicarFiltros() {
    if (!app) return;
    const periodo = document.getElementById('filtroPeriodo')?.value || 'todos';
    const empresa = document.getElementById('filtroEmpresaEscalas')?.value || 'todas';
    const pagamento = document.getElementById('filtroPagamento')?.value || 'todos';
    app.filtroAtual = { periodo, empresa, pagamento };
    app.renderizarEventos();
}

document.addEventListener('DOMContentLoaded', () => {
    app = new AppUnificadoEscalas();
    app.init();
});