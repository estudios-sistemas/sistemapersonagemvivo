// Função para gerar notificação de pagamentos pendentes
function gerarNotificacaoPagamentosPendentes(dados) {
    const sinalPago = dados.sinal_pago_status === 'true';
    const avulsoPago = dados.valor_avulso_pago === 'true';
    const restanteRecebido = dados.valor_restante_recebido === 'true';
    
    const pendentes = [];
    if (!sinalPago) pendentes.push('sinal');
    if (!avulsoPago) pendentes.push('valor avulso');
    if (!restanteRecebido) pendentes.push('valor restante');
    
    if (pendentes.length > 0) {
        return `Pagamento pendente: ${pendentes.join(', ')}.`;
    }
    return '';
}

// Formatar campo de moeda com R$
function formatarMoedaEvento(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (!valor) {
        input.value = '';
        calcularValoresEvento();
        return;
    }
    
    valor = (parseInt(valor) / 100).toFixed(2);
    input.value = `R$ ${valor.replace('.', ',')}`;
    
    calcularValoresEvento();
}

// Adicionar personagem ao evento e calcular valores
function adicionarPersonagemEvento() {
    const selectPersonagem = document.getElementById('personagem_select');
    const selectedOption = selectPersonagem.options[selectPersonagem.selectedIndex];
    
    if (!selectedOption.value) {
        alert('Selecione um personagem!');
        return;
    }
    
    const personagem = JSON.parse(selectedOption.dataset.personagem);
    
    const container = document.getElementById('personagensSelecionados');
    const div = document.createElement('div');
    div.className = 'personagem-item';
    div.style.cssText = 'background: #f8f9fa; padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;';
    div.dataset.valor = personagem.valor_personagens || '0';
    
    div.innerHTML = `
        <span><strong>${personagem.nome_personagens}</strong> - ${personagem.tema} - ${personagem.valor_personagens}</span>
        <button type="button" class="btn small" onclick="removerPersonagemEvento(this)">Excluir</button>
    `;
    
    container.appendChild(div);
    
    calcularValoresEvento();
    
    selectPersonagem.value = '';
    document.getElementById('tema_personagem').value = '';
    document.getElementById('figurino_personagem').value = '';
}

// Remover personagem
function removerPersonagemEvento(btn) {
    btn.parentElement.remove();
    calcularValoresEvento();
}

// Calcular todos os valores do evento
function calcularValoresEvento() {
    let valorPersonagens = 0;
    const personagens = document.querySelectorAll('#personagensSelecionados > div');
    personagens.forEach(div => {
        const valor = parseFloat((div.dataset.valor || '0').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        valorPersonagens += valor;
    });
    
    const desconto = parseFloat((document.getElementById('desconto')?.value || '').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const deslocamento = parseFloat((document.getElementById('deslocamento')?.value || '').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    
    let valorTotal = valorPersonagens - desconto + deslocamento;
    
    document.getElementById('valor_total').value = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
    
    const valorSinal = parseFloat((document.getElementById('valor_sinal')?.value || '').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const sinalPago = document.getElementById('sinal_pago_status')?.value === 'true';
    
    const valorAvulso = parseFloat((document.getElementById('valor_avulso')?.value || '').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const avulsoPago = document.getElementById('valor_avulso_pago')?.value === 'true';
    
    const restanteRecebido = document.getElementById('valor_restante_recebido')?.value === 'true';
    
    let valorFaltaReceber = valorTotal;
    
    if (sinalPago) {
        valorFaltaReceber -= valorSinal;
    }
    
    if (avulsoPago) {
        valorFaltaReceber -= valorAvulso;
    }
    
    if (restanteRecebido) {
        valorFaltaReceber = 0;
    }
    
    valorFaltaReceber = Math.max(0, valorFaltaReceber);
    
    document.getElementById('valor_falta_receber').value = `R$ ${valorFaltaReceber.toFixed(2).replace('.', ',')}`;
    document.getElementById('valor_restante').value = valorFaltaReceber.toFixed(2);
    
    // Calcular status de pagamento
    const statusPagamento = (sinalPago && avulsoPago && restanteRecebido) ? 'Quitado' : 'Pendente';
    const statusElement = document.getElementById('status_pagamento_atual');
    if (statusElement) {
        statusElement.value = statusPagamento;
        statusElement.style.color = statusPagamento === 'Quitado' ? 'green' : 'red';
    }
}

// Coletar dados do formulário de evento
function coletarDadosFormularioEvento() {
    const sinalPago = document.getElementById('sinal_pago_status')?.value === 'true';
    const avulsoPago = document.getElementById('valor_avulso_pago')?.value === 'true';
    const restanteRecebido = document.getElementById('valor_restante_recebido')?.value === 'true';
    
    const statusPagamento = (sinalPago && avulsoPago && restanteRecebido) ? 'Quitado' : 'Pendente';
    
    return {
        data_evento: document.getElementById('data_evento')?.value || '',
        hora_evento: document.getElementById('hora_evento')?.value || '',
        hora_saida: document.getElementById('hora_saida')?.value || '',
        duracao: document.getElementById('duracao')?.value || '',

        nome_cliente_evento: document.getElementById('nome_cliente_evento')?.value || '',
        telefone_cliente_evento: document.getElementById('telefone_cliente_evento')?.value || '',
        email_cliente_evento: document.getElementById('email_cliente_evento')?.value || '',

        casa_festa: document.getElementById('casa_festa_select')?.options[document.getElementById('casa_festa_select')?.selectedIndex]?.text || '',
        nome_local_evento: document.getElementById('nome_local_evento')?.value || '',
        cep_local_evento: document.getElementById('cep_local_evento')?.value || '',
        logradouro_local_evento: document.getElementById('logradouro_local_evento')?.value || '',
        numero_local_evento: document.getElementById('numero_local_evento')?.value || '',
        complemento_local_evento: document.getElementById('complemento_local_evento')?.value || '',
        bairro_local_evento: document.getElementById('bairro_local_evento')?.value || '',
        cidade_local_evento: document.getElementById('cidade_local_evento')?.value || '',
        estado_local_evento: document.getElementById('estado_local_evento')?.value || '',
        referencia_local_evento: document.getElementById('referencia_local_evento')?.value || '',
        telefone_local_evento: document.getElementById('telefone_local_evento')?.value || '',
        tipo_local: document.getElementById('tipo_local')?.value || '',

        personagens_selecionados: Array.from(document.querySelectorAll('#personagensSelecionados .personagem-item')).map(div => ({
            id: div.getAttribute('data-personagem-id'),
            nome: div.querySelector('strong')?.textContent?.trim() || div.textContent.replace('Remover','').trim()
        })),
        personagens: Array.from(document.querySelectorAll('#personagensSelecionados > div')).map(div => div.textContent.replace('Excluir', '').trim()),

        valor_total: document.getElementById('valor_total')?.value || 'R$ 0,00',
        valor_sinal: document.getElementById('valor_sinal')?.value || 'R$ 0,00',
        sinal_pago_status: document.getElementById('sinal_pago_status')?.value || 'false',
        forma_pagamento_sinal: document.getElementById('forma_pagamento_sinal')?.value || '',
        desconto: document.getElementById('desconto')?.value || 'R$ 0,00',
        deslocamento: document.getElementById('deslocamento')?.value || 'R$ 0,00',
        valor_avulso: document.getElementById('valor_avulso')?.value || 'R$ 0,00',
        forma_pagamento_avulso: document.getElementById('forma_pagamento_avulso')?.value || '',
        valor_avulso_pago: document.getElementById('valor_avulso_pago')?.value || 'false',
        valor_falta_receber: document.getElementById('valor_falta_receber')?.value || 'R$ 0,00',
        forma_pagamento_restante: document.getElementById('forma_pagamento_restante')?.value || '',
        valor_restante_recebido: document.getElementById('valor_restante_recebido')?.value || 'false',

        status_pagamento: statusPagamento,

        observacoes: document.getElementById('observacoes')?.value || ''
    };
}

// Salvar evento completo (novo ou edição)
function salvarEventoCompleto() {
    const dataEvento = document.getElementById('data_evento')?.value;
    const horaEvento = document.getElementById('hora_evento')?.value;

    if (!dataEvento || !horaEvento) {
        alert('Preencha data e horário do evento!');
        return;
    }

    const dados = coletarDadosFormularioEvento();
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');

    // Verificar se é edição
    const idEdicao = document.getElementById('evento_id_edicao')?.value;
    const indexEdicao = sessionStorage.getItem('eventoEditandoIndex');

    if (idEdicao || indexEdicao !== null) {
        // Encontrar o evento a editar
        let idx = -1;

        if (idEdicao) {
            idx = eventos.findIndex(e => String(e.id) === String(idEdicao));
        }
        if (idx === -1 && indexEdicao !== null) {
            idx = parseInt(indexEdicao);
        }

        if (idx >= 0 && idx < eventos.length) {
            // Preservar campos que não estão no formulário
            const eventoOriginal = eventos[idx];
            eventos[idx] = Object.assign({}, eventoOriginal, dados, {
                id: eventoOriginal.id,
                dataCadastro: eventoOriginal.dataCadastro,
                dataAtualizacao: new Date().toISOString()
            });

            localStorage.setItem('eventos_cadastrados', JSON.stringify(eventos));

            // Notificar pagamentos pendentes se houver
            const notificacao = gerarNotificacaoPagamentosPendentes(dados);
            if (notificacao) {
                alert(`Evento atualizado com sucesso!\n${notificacao}`);
            } else {
                alert('Evento atualizado com sucesso!');
            }

            // Limpar estado de edição
            sessionStorage.removeItem('eventoEditandoIndex');
            sessionStorage.removeItem('eventoEditandoId');

            limparFormularioEvento();
            return;
        }
    }

    // Novo evento
    const novoEvento = Object.assign(dados, {
        id: `EVT-${Date.now()}`,
        status: 'reservado',
        dataCadastro: new Date().toISOString()
    });

    eventos.push(novoEvento);
    localStorage.setItem('eventos_cadastrados', JSON.stringify(eventos));

    // Notificar pagamentos pendentes se houver
    const notificacao = gerarNotificacaoPagamentosPendentes(dados);
    if (notificacao) {
        alert(`Evento reservado com sucesso!\n${notificacao}`);
    } else {
        alert('Evento reservado com sucesso!');
    }

    limparFormularioEvento();
}

// Limpar formulário
function limparFormularioEvento() {
    document.getElementById('eventoForm')?.reset();
    const container = document.getElementById('personagensSelecionados');
    if (container) container.innerHTML = '';
    const dadosCliente = document.getElementById('dadosClienteEvento');
    if (dadosCliente) dadosCliente.style.display = 'none';
    const dadosCasa = document.getElementById('dadosCasaSelecionada');
    if (dadosCasa) dadosCasa.innerHTML = '';

    // Limpar estado de edição
    const campoId = document.getElementById('evento_id_edicao');
    if (campoId) campoId.value = '';
    sessionStorage.removeItem('eventoEditandoIndex');
    sessionStorage.removeItem('eventoEditandoId');

    // Restaurar botão
    const btnSalvar = document.getElementById('btnSalvarEvento');
    if (btnSalvar) {
        btnSalvar.textContent = 'Reservar Evento';
        btnSalvar.style.background = '';
        btnSalvar.style.color = '';
    }

    calcularValoresEvento();
}

// Buscar CEP para outro local
function buscarCEPOutroLocal() {
    const cep = document.getElementById('cep_local_evento')?.value.replace(/\D/g, '');
    
    if (!cep || cep.length !== 8) {
        return;
    }
    
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                alert('CEP não encontrado!');
                return;
            }
            
            document.getElementById('logradouro_local_evento').value = data.logradouro || '';
            document.getElementById('bairro_local_evento').value = data.bairro || '';
            document.getElementById('cidade_local_evento').value = data.localidade || '';
            document.getElementById('estado_local_evento').value = data.uf || '';
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
            alert('Erro ao buscar CEP. Tente novamente.');
        });
}

// Verificar eventos finalizados
function verificarEventosFinalizados() {
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    const agora = new Date();
    
    let atualizou = false;
    
    eventos.forEach(evento => {
        if (evento.status !== 'finalizado' && evento.data_evento && evento.hora_saida) {
            const dataHoraFim = new Date(`${evento.data_evento}T${evento.hora_saida}`);
            dataHoraFim.setMinutes(dataHoraFim.getMinutes() + 1);
            
            if (agora >= dataHoraFim) {
                evento.status = 'finalizado';
                atualizou = true;
            }
        }
    });
    
    if (atualizou) {
        localStorage.setItem('eventos_cadastrados', JSON.stringify(eventos));
    }
}

setInterval(verificarEventosFinalizados, 60000);

// Exportar funções
window.formatarMoedaEvento = formatarMoedaEvento;
window.adicionarPersonagemEvento = adicionarPersonagemEvento;
window.removerPersonagemEvento = removerPersonagemEvento;
window.calcularValoresEvento = calcularValoresEvento;
window.coletarDadosFormularioEvento = coletarDadosFormularioEvento;
window.salvarEventoCompleto = salvarEventoCompleto;
window.limparFormularioEvento = limparFormularioEvento;
window.buscarCEPOutroLocal = buscarCEPOutroLocal;
window.verificarEventosFinalizados = verificarEventosFinalizados;

console.log('calculos-evento.js carregado');
