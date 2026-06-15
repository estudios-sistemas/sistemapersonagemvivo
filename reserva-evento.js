// ==================== RESERVA DE EVENTO - VERSÃO CORRIGIDA COM ID AUTOMÁTICO ====================

// Gerar ID para evento
function gerarIDEvento() {
    const ano = new Date().getFullYear();
    const mes = String(new Date().getMonth() + 1).padStart(2, '0');
    const dia = String(new Date().getDate()).padStart(2, '0');
    const horas = String(new Date().getHours()).padStart(2, '0');
    const minutos = String(new Date().getMinutes()).padStart(2, '0');
    const segundos = String(new Date().getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EV-${ano}${mes}${dia}-${horas}${minutos}${segundos}-${random}`;
}

// Mostrar ID do evento na tela (opcional)
function mostrarIDEvento() {
    const eventoIdField = document.getElementById('evento_id');
    const eventoIdDisplay = document.getElementById('evento_id_display');
    
    if (eventoIdField && eventoIdField.value) {
        if (eventoIdDisplay) {
            eventoIdDisplay.innerHTML = `<div style="background: #e8f4fd; padding: 8px 12px; border-radius: 6px; margin-bottom: 15px;">
                <strong>🆔 ID do Evento:</strong> ${eventoIdField.value}
            </div>`;
        }
    }
}

// Carregar casas de festa no select
function carregarCasasDeFesta() {
    const casas = JSON.parse(localStorage.getItem('casa_de_festas_cadastrados') || '[]');
    const select = document.getElementById('casa_festa_select');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">selecione</option>';
    
    casas.forEach(casa => {
        const option = document.createElement('option');
        option.value = casa.id || casa.ID_casa_de_festas;
        option.textContent = casa.nome_casa_de_festas || 'Casa sem nome';
        option.dataset.casa = JSON.stringify(casa);
        select.appendChild(option);
    });
}

// Carregar personagens no select
function carregarPersonagens() {
    const personagens = JSON.parse(localStorage.getItem('personagens_cadastrados') || '[]');
    const select = document.getElementById('personagem_select');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">selecione</option>';
    
    personagens.forEach(personagem => {
        const option = document.createElement('option');
        option.value = personagem.id || personagem.ID_personagens;
        option.textContent = personagem.nome_personagens || 'Personagem sem nome';
        option.dataset.personagem = JSON.stringify(personagem);
        select.appendChild(option);
    });
}

// Calcular hora de saída automaticamente
function calcularHoraSaida() {
    const horaEvento = document.getElementById('hora_evento').value;
    const duracao = parseFloat(document.getElementById('duracao').value) || 0;
    
    if (!horaEvento || duracao <= 0) {
        document.getElementById('hora_saida').value = '';
        return;
    }
    
    const [horas, minutos] = horaEvento.split(':').map(Number);
    const totalMinutos = (horas * 60) + minutos + (duracao * 60);
    
    const novasHoras = Math.floor(totalMinutos / 60) % 24;
    const novosMinutos = totalMinutos % 60;
    
    const horaSaida = `${String(novasHoras).padStart(2, '0')}:${String(novosMinutos).padStart(2, '0')}`;
    document.getElementById('hora_saida').value = horaSaida;
}

// Mostrar detalhes do personagem selecionado
function mostrarDetalhesPersonagem() {
    const select = document.getElementById('personagem_select');
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption.value) {
        document.getElementById('tema_personagem').value = '';
        document.getElementById('figurino_personagem').value = '';
        return;
    }
    
    const personagem = JSON.parse(selectedOption.dataset.personagem);
    
    document.getElementById('tema_personagem').value = personagem.tema || '';
    document.getElementById('figurino_personagem').value = personagem.figurino || '';
}

// Adicionar personagem ao evento
function adicionarPersonagemEvento() {
    const select = document.getElementById('personagem_select');
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption.value) {
        mostrarMensagemToast('❌ Selecione um personagem!', true);
        return;
    }
    
    const personagem = JSON.parse(selectedOption.dataset.personagem);
    const container = document.getElementById('personagensSelecionados');
    
    // Verificar se já foi adicionado
    const existing = container.querySelector(`[data-personagem-id="${personagem.id}"]`);
    if (existing) {
        mostrarMensagemToast('⚠️ Este personagem já foi adicionado!', true);
        return;
    }
    
    // Criar elemento do personagem adicionado
    const personagemDiv = document.createElement('div');
    personagemDiv.className = 'personagem-adicionado';
    personagemDiv.setAttribute('data-personagem-id', personagem.id);
    personagemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; padding: 8px 12px; margin-bottom: 8px; border-radius: 6px;';
    
    personagemDiv.innerHTML = `
        <div>
            <strong>${personagem.nome_personagens || personagem.nome}</strong><br>
            <small>Tema: ${personagem.tema || '-'} | Figurino: ${personagem.figurino || '-'}</small>
        </div>
        <div>
            <span style="font-weight: bold; color: #28a745;">R$ ${(personagem.valor_personagens || 0).toFixed(2).replace('.', ',')}</span>
            <button type="button" class="btn small" onclick="removerPersonagemEvento(this)" style="background: #dc3545; color: white; margin-left: 10px;">🗑️</button>
        </div>
    `;
    
    container.appendChild(personagemDiv);
    
    // Limpar seleção
    select.value = '';
    document.getElementById('tema_personagem').value = '';
    document.getElementById('figurino_personagem').value = '';
    
    // Calcular total
    calcularTotalEvento();
}

function removerPersonagemEvento(button) {
    button.closest('.personagem-adicionado').remove();
    calcularTotalEvento();
}

function calcularTotalEvento() {
    const container = document.getElementById('personagensSelecionados');
    const personagens = container.querySelectorAll('.personagem-adicionado');
    let total = 0;
    
    personagens.forEach(p => {
        const valorSpan = p.querySelector('span[style*="color: #28a745"]');
        if (valorSpan) {
            const valorTexto = valorSpan.textContent.replace('R$ ', '').replace('.', '').replace(',', '.');
            total += parseFloat(valorTexto) || 0;
        }
    });
    
    const valorTotalInput = document.getElementById('valor_total');
    if (valorTotalInput) {
        valorTotalInput.value = 'R$ ' + total.toFixed(2).replace('.', ',');
    }
    
    // Recalcular valores
    calcularValoresEvento();
}

// Adicionar casa selecionada
function adicionarCasaSelecionada() {
    const select = document.getElementById('casa_festa_select');
    const dadosContainer = document.getElementById('dadosCasaSelecionada');
    
    if (!select || !dadosContainer) return;
    
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption.value) {
        mostrarMensagemToast('❌ Selecione uma casa de festa!', true);
        return;
    }
    
    const casa = JSON.parse(selectedOption.dataset.casa);
    
    dadosContainer.innerHTML = `
        <div style="background: #e8f4fd; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
            <h4>Casa Selecionada:</h4>
            <p><strong>Nome:</strong> ${casa.nome_casa_de_festas || '-'}</p>
            <p><strong>Telefone:</strong> ${casa.telefone_casa_de_festas || '-'}</p>
            <p><strong>Endereço:</strong> ${casa.logradouro_casa_de_festas || ''}, ${casa.numero_casa_de_festas || ''} - ${casa.cidade_casa_de_festas || ''}</p>
            <button class="btn small" onclick="removerCasaSelecionada()" style="background:#dc3545;color:white;">Remover</button>
        </div>
    `;
    
    document.getElementById('outro_local_container').style.display = 'none';
}

function removerCasaSelecionada() {
    document.getElementById('dadosCasaSelecionada').innerHTML = '';
    document.getElementById('casa_festa_select').value = '';
}

function toggleOutroLocal() {
    const container = document.getElementById('outro_local_container');
    
    if (container.style.display === 'none' || !container.style.display) {
        container.style.display = 'block';
        removerCasaSelecionada();
    } else {
        container.style.display = 'none';
    }
}

// Função para limpar formulário de evento e gerar novo ID
function limparFormularioEvento() {
    const form = document.getElementById('eventoForm');
    if (form) {
        form.reset();
    }
    
    // Limpar áreas dinâmicas
    const dadosCasa = document.getElementById('dadosCasaSelecionada');
    if (dadosCasa) dadosCasa.innerHTML = '';
    
    const outroLocal = document.getElementById('outro_local_container');
    if (outroLocal) outroLocal.style.display = 'none';
    
    const personagensContainer = document.getElementById('personagensSelecionados');
    if (personagensContainer) personagensContainer.innerHTML = '';
    
    const clienteInfo = document.getElementById('clienteInfo');
    if (clienteInfo) clienteInfo.style.display = 'none';
    
    const dadosCliente = document.getElementById('dadosClienteEvento');
    if (dadosCliente) dadosCliente.style.display = 'none';
    
    const clienteNotFound = document.getElementById('clienteNotFound');
    if (clienteNotFound) clienteNotFound.style.display = 'none';
    
    // Resetar campos de documento
    const inputCpf = document.getElementById('doc_evento_cadastros_cpf');
    const inputCnpj = document.getElementById('doc_evento_cadastros_cnpj');
    if (inputCpf) inputCpf.value = '';
    if (inputCnpj) inputCnpj.value = '';
    
    // Resetar valores financeiros
    const valorTotal = document.getElementById('valor_total');
    if (valorTotal) valorTotal.value = 'R$ 0,00';
    
    const valorFalta = document.getElementById('valor_falta_receber');
    if (valorFalta) valorFalta.value = 'R$ 0,00';
    
    // Gerar novo ID para próximo evento
    const eventoIdField = document.getElementById('evento_id');
    const eventoIdEdicao = document.getElementById('evento_id_edicao');
    
    if (eventoIdField) {
        const novoId = gerarIDEvento();
        eventoIdField.value = novoId;
        console.log(`🆔 Novo ID de evento gerado: ${novoId}`);
    }
    
    if (eventoIdEdicao) {
        eventoIdEdicao.value = '';
    }
    
    // Mostrar ID na tela
    mostrarIDEvento();
    
    mostrarMensagemToast('🧹 Formulário limpo! Novo ID gerado.');
}

// Função para salvar evento completo
function salvarEventoCompleto() {
    console.log('💾 Salvando evento...');
    
    // Obter ID (se for edição, usa o ID existente, senão gera novo)
    const eventoIdEdicao = document.getElementById('evento_id_edicao');
    const eventoIdField = document.getElementById('evento_id');
    
    let id = '';
    let isEdicao = false;
    
    if (eventoIdEdicao && eventoIdEdicao.value) {
        id = eventoIdEdicao.value;
        isEdicao = true;
        console.log(`✏️ Editando evento existente com ID: ${id}`);
    } else if (eventoIdField && eventoIdField.value) {
        id = eventoIdField.value;
        console.log(`📝 Usando ID existente: ${id}`);
    } else {
        id = gerarIDEvento();
        console.log(`🆕 Novo ID gerado: ${id}`);
    }
    
    // Atualizar campo de ID
    if (eventoIdField) eventoIdField.value = id;
    
    // Coletar personagens selecionados
    const personagensSelecionados = [];
    const container = document.getElementById('personagensSelecionados');
    if (container) {
        const personagensDivs = container.querySelectorAll('.personagem-adicionado');
        personagensDivs.forEach(div => {
            const nome = div.querySelector('strong')?.textContent || '';
            const valorTexto = div.querySelector('span[style*="color: #28a745"]')?.textContent.replace('R$ ', '').replace('.', '').replace(',', '.') || '0';
            personagensSelecionados.push({
                nome: nome,
                valor: parseFloat(valorTexto)
            });
        });
    }
    
    // Coletar dados do formulário
    const evento = {
        id: id,
        data_evento: document.getElementById('data_evento')?.value || '',
        hora_evento: document.getElementById('hora_evento')?.value || '',
        duracao: document.getElementById('duracao')?.value || '',
        hora_saida: document.getElementById('hora_saida')?.value || '',
        cliente_nome: document.getElementById('nome_cliente_evento')?.value || '',
        cliente_telefone: document.getElementById('telefone_cliente_evento')?.value || '',
        cliente_email: document.getElementById('email_cliente_evento')?.value || '',
        local: document.getElementById('nome_local_evento')?.value || '',
        logradouro_local: document.getElementById('logradouro_local_evento')?.value || '',
        numero_local: document.getElementById('numero_local_evento')?.value || '',
        bairro_local: document.getElementById('bairro_local_evento')?.value || '',
        cidade_local: document.getElementById('cidade_local_evento')?.value || '',
        estado_local: document.getElementById('estado_local_evento')?.value || '',
        observacoes: document.getElementById('observacoes')?.value || '',
        valor_total: document.getElementById('valor_total')?.value || 'R$ 0,00',
        valor_sinal: document.getElementById('valor_sinal')?.value || 'R$ 0,00',
        desconto: document.getElementById('desconto')?.value || 'R$ 0,00',
        deslocamento: document.getElementById('deslocamento')?.value || 'R$ 0,00',
        valor_avulso: document.getElementById('valor_avulso')?.value || 'R$ 0,00',
        forma_pagamento_sinal: document.getElementById('forma_pagamento_sinal')?.value || '',
        forma_pagamento_restante: document.getElementById('forma_pagamento_restante')?.value || '',
        sinal_pago_status: document.getElementById('sinal_pago_status')?.value === 'true',
        valor_avulso_pago: document.getElementById('valor_avulso_pago')?.value === 'true',
        valor_restante_recebido: document.getElementById('valor_restante_recebido')?.value === 'true',
        status_evento: 'Reservado',
        status_pagamento: document.getElementById('status_pagamento_atual')?.value || 'Pendente',
        personagens: personagensSelecionados,
        dataAtualizacao: new Date().toISOString()
    };
    
    if (!isEdicao) {
        evento.dataCadastro = new Date().toISOString();
    }
    
    // Validar campos obrigatórios
    if (!evento.data_evento) {
        mostrarMensagemToast('❌ Selecione a data do evento!', true);
        return;
    }
    
    if (!evento.hora_evento) {
        mostrarMensagemToast('❌ Selecione o horário do evento!', true);
        return;
    }
    
    if (!evento.cliente_nome) {
        mostrarMensagemToast('❌ Busque um cliente antes de salvar!', true);
        return;
    }
    
    // Salvar no localStorage
    let eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const index = eventos.findIndex(e => e.id === id);
    
    if (index !== -1) {
        eventos[index] = { ...eventos[index], ...evento, id: id };
        mostrarMensagemToast(`✅ Evento atualizado com sucesso! ID: ${id}`);
    } else {
        eventos.push(evento);
        mostrarMensagemToast(`✅ Evento reservado com sucesso! ID: ${id}`);
    }
    
    localStorage.setItem('eventos_cadastrados', JSON.stringify(eventos));
    console.log('📦 Evento salvo:', evento);
    
    // Limpar formulário e gerar novo ID para próximo evento (se não for edição)
    if (!isEdicao) {
        limparFormularioEvento();
    } else {
        // Se foi edição, limpar apenas o modo edição
        if (eventoIdEdicao) eventoIdEdicao.value = '';
        mostrarMensagemToast('✅ Alterações salvas com sucesso!');
        
        // Voltar para lista de eventos
        setTimeout(() => {
            if (typeof showPage === 'function') {
                showPage('todos_eventos');
            }
        }, 1500);
    }
}

// Função para carregar evento na edição (chamada pelo relatório)
function carregarEventoParaEdicao(evento) {
    console.log('📝 Carregando evento para edição:', evento);
    
    // Preencher ID de edição
    const eventoIdEdicao = document.getElementById('evento_id_edicao');
    if (eventoIdEdicao) {
        eventoIdEdicao.value = evento.id;
    }
    
    // Preencher campo de ID visível
    const eventoIdField = document.getElementById('evento_id');
    if (eventoIdField) {
        eventoIdField.value = evento.id;
    }
    
    // Preencher campos
    const dataEvento = document.getElementById('data_evento');
    if (dataEvento) dataEvento.value = evento.data_evento || '';
    
    const horaEvento = document.getElementById('hora_evento');
    if (horaEvento) horaEvento.value = evento.hora_evento || '';
    
    const duracao = document.getElementById('duracao');
    if (duracao) duracao.value = evento.duracao || '';
    
    const nomeCliente = document.getElementById('nome_cliente_evento');
    if (nomeCliente) nomeCliente.value = evento.cliente_nome || '';
    
    const telefoneCliente = document.getElementById('telefone_cliente_evento');
    if (telefoneCliente) telefoneCliente.value = evento.cliente_telefone || '';
    
    const emailCliente = document.getElementById('email_cliente_evento');
    if (emailCliente) emailCliente.value = evento.cliente_email || '';
    
    const nomeLocal = document.getElementById('nome_local_evento');
    if (nomeLocal) nomeLocal.value = evento.local || '';
    
    const observacoes = document.getElementById('observacoes');
    if (observacoes) observacoes.value = evento.observacoes || '';
    
    const valorTotal = document.getElementById('valor_total');
    if (valorTotal) valorTotal.value = evento.valor_total || 'R$ 0,00';
    
    const valorSinal = document.getElementById('valor_sinal');
    if (valorSinal) valorSinal.value = evento.valor_sinal || 'R$ 0,00';
    
    const desconto = document.getElementById('desconto');
    if (desconto) desconto.value = evento.desconto || 'R$ 0,00';
    
    const deslocamento = document.getElementById('deslocamento');
    if (deslocamento) deslocamento.value = evento.deslocamento || 'R$ 0,00';
    
    const valorAvulso = document.getElementById('valor_avulso');
    if (valorAvulso) valorAvulso.value = evento.valor_avulso || 'R$ 0,00';
    
    const formaSinal = document.getElementById('forma_pagamento_sinal');
    if (formaSinal && evento.forma_pagamento_sinal) formaSinal.value = evento.forma_pagamento_sinal;
    
    const formaRestante = document.getElementById('forma_pagamento_restante');
    if (formaRestante && evento.forma_pagamento_restante) formaRestante.value = evento.forma_pagamento_restante;
    
    const sinalPago = document.getElementById('sinal_pago_status');
    if (sinalPago) sinalPago.value = evento.sinal_pago_status ? 'true' : 'false';
    
    // Mostrar ID na tela
    mostrarIDEvento();
    
    // Calcular valores
    if (typeof calcularValoresEvento === 'function') {
        calcularValoresEvento();
    }
    
    // Mostrar mensagem
    mostrarMensagemToast(`📝 Evento carregado para edição! ID: ${evento.id}`);
}

// Alternar entre CPF e CNPJ
function selecionarTipoFormulario(tipo, modulo) {
    const btnCpf = document.getElementById(`btnCpf_${modulo}`);
    const btnCnpj = document.getElementById(`btnCnpj_${modulo}`);
    const inputCpf = document.getElementById(`doc_${modulo}_cadastros_cpf`);
    const inputCnpj = document.getElementById(`doc_${modulo}_cadastros_cnpj`);
    
    if (!btnCpf || !btnCnpj) return;
    
    btnCpf.classList.remove('active');
    btnCnpj.classList.remove('active');
    
    if (tipo === 'cpf') {
        btnCpf.classList.add('active');
        if (inputCpf) {
            inputCpf.style.display = 'inline-block';
            inputCpf.value = '';
        }
        if (inputCnpj) {
            inputCnpj.style.display = 'none';
            inputCnpj.value = '';
        }
    } else {
        btnCnpj.classList.add('active');
        if (inputCpf) {
            inputCpf.style.display = 'none';
            inputCpf.value = '';
        }
        if (inputCnpj) {
            inputCnpj.style.display = 'inline-block';
            inputCnpj.value = '';
        }
    }
}

function formatDocumentFormulario(modulo) {
    const inputCpf = document.getElementById(`doc_${modulo}_cadastros_cpf`);
    const inputCnpj = document.getElementById(`doc_${modulo}_cadastros_cnpj`);
    
    if (inputCpf && inputCpf.style.display !== 'none') {
        let valor = inputCpf.value.replace(/\D/g, '');
        if (valor.length <= 11) {
            if (valor.length > 3) valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
            if (valor.length > 6) valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
            if (valor.length > 9) valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        inputCpf.value = valor;
    }
    
    if (inputCnpj && inputCnpj.style.display !== 'none') {
        let valor = inputCnpj.value.replace(/\D/g, '');
        if (valor.length <= 14) {
            if (valor.length > 2) valor = valor.replace(/(\d{2})(\d)/, '$1.$2');
            if (valor.length > 5) valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
            if (valor.length > 8) valor = valor.replace(/(\d{3})(\d)/, '$1/$2');
            if (valor.length > 12) valor = valor.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        }
        inputCnpj.value = valor;
    }
}

function searchClientes() {
    const inputCpf = document.getElementById('doc_evento_cadastros_cpf');
    const inputCnpj = document.getElementById('doc_evento_cadastros_cnpj');
    
    let docValue = '';
    if (inputCpf && inputCpf.style.display !== 'none') {
        docValue = inputCpf.value;
    } else if (inputCnpj && inputCnpj.style.display !== 'none') {
        docValue = inputCnpj.value;
    }
    
    if (!docValue) {
        mostrarMensagemToast('❌ Digite um CPF ou CNPJ!', true);
        return;
    }
    
    const doc = docValue.replace(/\D/g, '');
    const clientes = JSON.parse(localStorage.getItem('clientes_cadastrados') || '[]');
    
    const cliente = clientes.find(c => {
        const docCliente = (c.doc_clientes_cadastros_cpf || c.doc_clientes_cadastros_cnpj || '').replace(/\D/g, '');
        return docCliente === doc;
    });
    
    const dadosClienteEvento = document.getElementById('dadosClienteEvento');
    const clienteNotFound = document.getElementById('clienteNotFound');
    
    if (cliente) {
        if (clienteNotFound) clienteNotFound.style.display = 'none';
        if (dadosClienteEvento) dadosClienteEvento.style.display = 'block';
        
        const nomeInput = document.getElementById('nome_cliente_evento');
        if (nomeInput) nomeInput.value = cliente.nome_clientes || '';
        
        const telefoneInput = document.getElementById('telefone_cliente_evento');
        if (telefoneInput) telefoneInput.value = cliente.telefone_cliente || '';
        
        const emailInput = document.getElementById('email_cliente_evento');
        if (emailInput) emailInput.value = cliente.email_cliente || '';
        
        mostrarMensagemToast('✅ Cliente encontrado!');
    } else {
        if (dadosClienteEvento) dadosClienteEvento.style.display = 'none';
        if (clienteNotFound) clienteNotFound.style.display = 'block';
        mostrarMensagemToast('❌ Cliente não encontrado!', true);
    }
}

function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor === '') {
        input.value = 'R$ 0,00';
        return;
    }
    valor = (parseInt(valor) / 100).toFixed(2);
    input.value = 'R$ ' + valor.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function calcularValoresEvento() {
    const valorTotalTexto = document.getElementById('valor_total')?.value || 'R$ 0,00';
    const valorSinalTexto = document.getElementById('valor_sinal')?.value || 'R$ 0,00';
    const valorAvulsoTexto = document.getElementById('valor_avulso')?.value || 'R$ 0,00';
    const sinalPago = document.getElementById('sinal_pago_status')?.value === 'true';
    const avulsoPago = document.getElementById('valor_avulso_pago')?.value === 'true';
    
    const valorTotal = parseFloat(valorTotalTexto.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
    const valorSinal = parseFloat(valorSinalTexto.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
    const valorAvulso = parseFloat(valorAvulsoTexto.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
    
    let valorFalta = valorTotal;
    if (sinalPago) valorFalta -= valorSinal;
    if (avulsoPago) valorFalta -= valorAvulso;
    
    const valorFaltaInput = document.getElementById('valor_falta_receber');
    if (valorFaltaInput) {
        valorFaltaInput.value = 'R$ ' + valorFalta.toFixed(2).replace('.', ',');
    }
    
    // Atualizar status de pagamento
    const statusInput = document.getElementById('status_pagamento_atual');
    if (statusInput) {
        if (valorFalta <= 0) {
            statusInput.value = 'Pago';
        } else if (valorSinal > 0 || valorAvulso > 0) {
            statusInput.value = 'Parcialmente Pago';
        } else {
            statusInput.value = 'Pendente';
        }
    }
}

function formatarTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 10) {
        valor = valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    input.value = valor;
}

function formatarCEP(input) {
    let cep = input.value.replace(/\D/g, '');
    if (cep.length > 5) {
        cep = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    input.value = cep;
}

function mostrarMensagemToast(mensagem, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast-mensagem';
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
        z-index: 10000;
    `;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    const reservarEvento = document.getElementById('reservar_evento');
    
    if (reservarEvento) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class' && reservarEvento.classList.contains('active')) {
                    carregarCasasDeFesta();
                    carregarPersonagens();
                    
                    // Gerar ID se não existir
                    const eventoIdField = document.getElementById('evento_id');
                    if (eventoIdField && !eventoIdField.value) {
                        const novoId = gerarIDEvento();
                        eventoIdField.value = novoId;
                        console.log(`🆔 ID gerado automaticamente: ${novoId}`);
                        mostrarIDEvento();
                    }
                    
                    // Verificar se há evento para editar
                    const dadosEdicao = sessionStorage.getItem('editarEventoDados');
                    if (dadosEdicao) {
                        const evento = JSON.parse(dadosEdicao);
                        carregarEventoParaEdicao(evento);
                        sessionStorage.removeItem('editarEventoDados');
                        sessionStorage.removeItem('editarEventoId');
                    }
                }
            });
        });
        
        observer.observe(reservarEvento, { attributes: true });
        
        if (reservarEvento.classList.contains('active')) {
            carregarCasasDeFesta();
            carregarPersonagens();
            
            const eventoIdField = document.getElementById('evento_id');
            if (eventoIdField && !eventoIdField.value) {
                const novoId = gerarIDEvento();
                eventoIdField.value = novoId;
                mostrarIDEvento();
            }
        }
    }
});

// Exportar funções
window.calcularHoraSaida = calcularHoraSaida;
window.carregarCasasDeFesta = carregarCasasDeFesta;
window.carregarPersonagens = carregarPersonagens;
window.mostrarDetalhesPersonagem = mostrarDetalhesPersonagem;
window.adicionarPersonagemEvento = adicionarPersonagemEvento;
window.removerPersonagemEvento = removerPersonagemEvento;
window.adicionarCasaSelecionada = adicionarCasaSelecionada;
window.removerCasaSelecionada = removerCasaSelecionada;
window.toggleOutroLocal = toggleOutroLocal;
window.searchClientes = searchClientes;
window.selecionarTipoFormulario = selecionarTipoFormulario;
window.formatDocumentFormulario = formatDocumentFormulario;
window.formatarMoeda = formatarMoeda;
window.calcularValoresEvento = calcularValoresEvento;
window.limparFormularioEvento = limparFormularioEvento;
window.salvarEventoCompleto = salvarEventoCompleto;
window.gerarIDEvento = gerarIDEvento;
window.mostrarMensagemToast = mostrarMensagemToast;
window.formatarTelefone = formatarTelefone;
window.formatarCEP = formatarCEP;

console.log('✅ reserva-evento.js carregado com sucesso!');