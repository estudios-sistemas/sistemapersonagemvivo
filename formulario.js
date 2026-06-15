// ==================== FORMULARIO.JS - SISTEMA DE CÁLCULOS ====================

// Variáveis globais para controle
let reservaConfigurada = false;

// Função para alternar entre CPF e CNPJ
function selecionarTipoFormulario(tipo, modulo) {
    // Pega os elementos
    const btnCpf = document.getElementById(`btnCpf_${modulo}`);
    const btnCnpj = document.getElementById(`btnCnpj_${modulo}`);
    const inputDoc = document.getElementById(`doc_${modulo}_cadastro`);
    
    // Remove a classe 'active' de ambos os botões
    btnCpf.classList.remove('active');
    btnCnpj.classList.remove('active');
    
    // Adiciona a classe 'active' apenas no botão clicado
    if (tipo === 'cpf') {
        btnCpf.classList.add('active');
        // Muda placeholder e maxlength para CPF
        inputDoc.placeholder = '000.000.000-00';
        inputDoc.maxLength = 14;
        inputDoc.value = ''; // Limpa o campo
    } else {
        btnCnpj.classList.add('active');
        // Muda placeholder e maxlength para CNPJ
        inputDoc.placeholder = '00.000.000/0000-00';
        inputDoc.maxLength = 18;
        inputDoc.value = ''; // Limpa o campo
    }
}

// Função para converter valor monetário string para número
function converterParaNumero(valorString) {
    if (!valorString || valorString.trim() === '') return 0;
    
    try {
        // Remove tudo exceto números, vírgula e ponto
        let valorLimpo = valorString.toString().replace(/[^\d,.-]/g, '');
        
        // Se terminar com vírgula ou ponto, remove
        valorLimpo = valorLimpo.replace(/[,.]$/, '');
        
        // Se tiver vírgula como separador decimal
        if (valorLimpo.includes(',') && !valorLimpo.includes('.')) {
            // Substitui vírgula por ponto para parseFloat
            valorLimpo = valorLimpo.replace(',', '.');
        }
        // Se tiver ponto como separador de milhar e vírgula como decimal
        else if (valorLimpo.includes('.') && valorLimpo.includes(',')) {
            // Remove pontos de milhar, mantém vírgula como decimal
            valorLimpo = valorLimpo.replace(/\./g, '').replace(',', '.');
        }
        
        const numero = parseFloat(valorLimpo);
        return isNaN(numero) ? 0 : numero;
    } catch (error) {
        console.error('Erro ao converter para número:', error, valorString);
        return 0;
    }
}

// Função para formatar número para moeda brasileira
function formatarParaMoeda(numero) {
    if (isNaN(numero)) numero = 0;
    return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para formatar input enquanto digita
function formatarMoeda(input) {
    if (!input || !input.value) return;
    
    let value = input.value.replace(/\D/g, '');
    
    if (value === '') {
        input.value = '';
        return;
    }
    
    // Converte para número
    let numero = parseInt(value) / 100;
    
    // Formata como moeda brasileira
    input.value = numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para formatar input de moeda enquanto digita mantendo cursor
function formatarMoedaInput(input) {
    // Salva a posição do cursor
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;
    
    // Formata o valor
    formatarMoeda(input);
    
    // Restaura a posição do cursor (ajustada para a nova formatação)
    const newLength = input.value.length;
    const lengthDiff = newLength - originalLength;
    input.setSelectionRange(cursorPos + lengthDiff, cursorPos + lengthDiff);
}

// Função para obter valor do personagem do localStorage
function obterValorPersonagem(personagemId) {
    try {
        const personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
        const personagem = personagens.find(p => 
            String(p.id) === String(personagemId) || 
            String(p.ID) === String(personagemId) ||
            String(p.codigo) === String(personagemId)
        );
        
        if (personagem) {
            // Retorna o valor do personagem
            if (personagem.valor_hora) return converterParaNumero(personagem.valor_hora);
            if (personagem.valor) return converterParaNumero(personagem.valor);
            if (personagem.preco) return converterParaNumero(personagem.preco);
        }
    } catch (error) {
        console.error('Erro ao obter valor do personagem:', error);
    }
    
    return 0;
}

// Função principal para calcular todos os valores - CORRIGIDA
function calcularValoresEvento() {
    console.log('CALCULANDO VALORES DO EVENTO');
    
    try {
        let valorTotal = 0;
        let valorAReceber = 0;
        
        // 1. SOMA DOS PERSONAGENS
        const personagensDivs = document.querySelectorAll('#personagensSelecionados .personagem-item');
        console.log(`Personagens encontrados: ${personagensDivs.length}`);
        
        personagensDivs.forEach((div, index) => {
            const personagemId = div.getAttribute('data-personagem-id');
            if (personagemId) {
                const valor = obterValorPersonagem(personagemId);
                valorTotal += valor;
                console.log(`   Personagem ${index + 1} (ID: ${personagemId}): ${formatarParaMoeda(valor)}`);
            }
        });
        
        // 2. ADICIONA DESLOCAMENTO
        const deslocamentoInput = document.getElementById('deslocamento');
        if (deslocamentoInput) {
            const deslocamento = converterParaNumero(deslocamentoInput.value);
            valorTotal += deslocamento;
            if (deslocamento > 0) {
                console.log(`   Deslocamento: +${formatarParaMoeda(deslocamento)}`);
            }
        }
        
        // 3. SUBTRAI DESCONTO
        const descontoInput = document.getElementById('desconto');
        if (descontoInput) {
            const desconto = converterParaNumero(descontoInput.value);
            valorTotal -= desconto;
            if (desconto > 0) {
                console.log(`   Desconto: -${formatarParaMoeda(desconto)}`);
            }
        }
        
        // Garante que o total não seja negativo
        valorTotal = Math.max(0, valorTotal);
        
        // VALOR A RECEBER COMEÇA IGUAL AO TOTAL
        valorAReceber = valorTotal;
        console.log(`VALOR TOTAL: ${formatarParaMoeda(valorTotal)}`);
        
        // 4. SUBTRAI SINAL SE PAGO
        const sinalPagoSelect = document.getElementById('sinal_pago_status');
        const valorSinalInput = document.getElementById('valor_sinal');
        
        if (sinalPagoSelect && valorSinalInput) {
            const isSinalPago = sinalPagoSelect.value === 'true';
            const valorSinal = converterParaNumero(valorSinalInput.value);
            
            if (isSinalPago && valorSinal > 0) {
                valorAReceber -= valorSinal;
                console.log(`   Sinal pago (SIM): -${formatarParaMoeda(valorSinal)}`);
            }
        }
        
        // 5. SUBTRAI VALOR AVULSO
         const valorAvulsoPagoSelect = document.getElementById('valor_avulso_pago');
        const valorAvulsoInput = document.getElementById('valor_avulso');

        if (valorAvulsoPagoSelect && valorAvulsoInput) {
            const isValorAvulsoPago = valorAvulsoPagoSelect.value === 'true';
            const valorAvulso = converterParaNumero(valorAvulsoInput.value);

            if (isValorAvulsoPago && valorAvulso > 0) {
                valorAReceber -= valorAvulso;
                console.log(`   Valor avulso (SIM): -${formatarParaMoeda(valorAvulso)}`);
            } else if (!isValorAvulsoPago) {
                console.log(`   Valor avulso (NÃO): Não subtraído`);
            }
        }
        
        // 6. SUBTRAI VALOR RESTANTE SE RECEBIDO
        const restanteRecebidoSelect = document.getElementById('valor_restante_recebido');
const valorRestanteInput = document.getElementById('valor_restante');

if (restanteRecebidoSelect && valorRestanteInput) {
    const isRestanteRecebido = restanteRecebidoSelect.value === 'true';
    const valorRestante = converterParaNumero(valorRestanteInput.value);
    
    if (isRestanteRecebido) {
        // Quando SIM é selecionado, subtrai o valor restante completo
        // Isso zera o "Valor que Falta Receber"
        valorAReceber = 0;
        console.log(`   Restante recebido (SIM): Valor a receber ZERADO`);
    } else {
        // Quando NÃO é selecionado, não subtrai nada
        console.log(`   Restante recebido (NÃO): Mantém valor atual`);
    }
}
        
        // Garante que não fique negativo
        valorAReceber = Math.max(0, valorAReceber);
        
        console.log(`VALOR A RECEBER: ${formatarParaMoeda(valorAReceber)}`);
        
        // ATUALIZA OS CAMPOS (APENAS LEITURA)
        const valorTotalField = document.getElementById('valor_total');
        const valorAReceberField = document.getElementById('valor_falta_receber');
        
        if (valorTotalField) {
            valorTotalField.value = formatarParaMoeda(valorTotal);
            console.log(`Campo "Total" atualizado: ${valorTotalField.value}`);
        }
        
        if (valorAReceberField) {
            valorAReceberField.value = formatarParaMoeda(valorAReceber);
            console.log(`Campo "Valor que Falta Receber" atualizado: ${valorAReceberField.value}`);
        }
        
        return { valorTotal, valorAReceber };
        
    } catch (error) {
        console.error('Erro Ação calcular valores:', error);
        return { valorTotal: 0, valorAReceber: 0 };
    }
}

// Função para adicionar personagem Ação evento
function adicionarPersonagemEvento() {
    console.log('ADICIONANDO PERSONAGEM');
    
    const select = document.getElementById('personagem_select');
    if (!select || !select.value) {
        alert('Selecione um personagem');
        return;
    }
    
    const personagemId = select.value;
    const personagemNome = select.options[select.selectedIndex].text;
    
    // Busca informações do localStorage
    const personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
    const personagem = personagens.find(p => 
        String(p.id) === String(personagemId) || 
        String(p.ID) === String(personagemId)
    );
    
    // Cria elemento do personagem
    const container = document.getElementById('personagensSelecionados');
    if (!container) {
        console.error('Container de personagens não encontrado!');
        return;
    }
    
    // Verifica se o personagem já foi adicionado
    const personagemExistente = Array.from(container.querySelectorAll('.personagem-item'))
        .some(div => div.getAttribute('data-personagem-id') === personagemId);
    
    if (personagemExistente) {
        alert('Este personagem já foi adicionado Ação evento!');
        return;
    }
    
    const div = document.createElement('div');
    div.className = 'personagem-item';
    div.setAttribute('data-personagem-id', personagemId);
    
    let valorTexto = '';
    let valorNumero = 0;
    let tema = '';
    let figurino = '';
    
    if (personagem) {
        // Obtém valor
        if (personagem.valor_hora) {
            valorNumero = converterParaNumero(personagem.valor_hora);
            valorTexto = formatarParaMoeda(valorNumero);
        } else if (personagem.valor) {
            valorNumero = converterParaNumero(personagem.valor);
            valorTexto = formatarParaMoeda(valorNumero);
        }
        
        // Obtém tema e figurino
        tema = personagem.tema || personagem.Tema || '';
        figurino = personagem.figurino || personagem.Figurino || '';
        
        // Atualiza campos de tema e figurino
        const temaField = document.getElementById('tema_evento');
        const figurinoField = document.getElementById('figurino_evento');
        
        if (temaField && !temaField.value) temaField.value = tema;
        if (figurinoField && !figurinoField.value) figurinoField.value = figurino;
    }
    
    // HTML do personagem
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; 
                    padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 5px; border: 1px solid #ddd;">
            <div style="flex: 1;">
                <strong style="display: block;">${personagemNome}</strong>
                <small style="display: block; color: #666;">Tema: ${tema} | Figurino: ${figurino}</small>
                ${valorTexto ? `<div style="color: #28a745; font-weight: bold; margin-top: 5px;">Valor: ${valorTexto}</div>` : ''}
            </div>
            <button type="button" onclick="removerPersonagem(this)" 
                    style="background: #dc3545; color: white; border: none; padding: 5px 10px; 
                           border-radius: 3px; cursor: pointer; font-size: 12px; margin-left: 10px;">
                Remover
            </button>
        </div>
    `;
    
    container.appendChild(div);
    
    // Limpa seleção
    select.value = '';
    
    // Limpa os campos de detalhes
    const temaPersonagemField = document.getElementById('tema_personagem');
    const figurinoPersonagemField = document.getElementById('figurino_personagem');
    if (temaPersonagemField) temaPersonagemField.value = '';
    if (figurinoPersonagemField) figurinoPersonagemField.value = '';
    
    // Atualiza cálculos
    calcularValoresEvento();
    
    console.log(`Personagem "${personagemNome}" adicionado com sucesso! Valor: ${valorTexto}`);
}

// Função para remover personagem
function removerPersonagem(button) {
    const div = button.closest('.personagem-item');
    if (div) {
        div.remove();
        calcularValoresEvento();
        console.log('Personagem removido');
    }
}

// Função para mostrar detalhes do personagem no select
function mostrarDetalhesPersonagem() {
    const select = document.getElementById('personagem_select');
    const temaField = document.getElementById('tema_personagem');
    const figurinoField = document.getElementById('figurino_personagem');
    
    if (!select || !select.value) {
        if (temaField) temaField.value = '';
        if (figurinoField) figurinoField.value = '';
        return;
    }
    
    const personagemId = select.value;
    const personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
    const personagem = personagens.find(p => 
        p.id == personagemId || 
        p.ID == personagemId || 
        p.codigo == personagemId
    );
    
    if (personagem) {
        if (temaField) temaField.value = personagem.tema || personagem.Tema || '';
        if (figurinoField) figurinoField.value = personagem.figurino || personagem.Figurino || '';
    } else {
        if (temaField) temaField.value = '';
        if (figurinoField) figurinoField.value = '';
    }
}

// Configura todos os listeners para a página de reserva
function configurarReservaEvento() {
    if (reservaConfigurada) {
        console.log('Reserva já configurada, ignorando...');
        return;
    }
    
    console.log('CONFIGURANDO SISTEMA DE CÁLCULOS PARA RESERVA');
    
    // Verifica se estamos na página correta
    const paginaReserva = document.getElementById('reservar_evento');
    if (!paginaReserva) {
        console.log('Página de reserva não encontrada');
        return;
    }
    
    // Configura listeners para campos monetários (que disparam cálculos)
    const camposMonetarios = [
        'deslocamento',
        'desconto',
        'valor_sinal',
        'valor_avulso'
    ];
    
    camposMonetarios.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            console.log(`Configurando campo: ${id}`);
            
            // Formata valor inicial se existir
            if (campo.value) {
                formatarMoeda(campo);
            }
            
            // Adiciona listener para input
            campo.addEventListener('input', function() {
                formatarMoedaInput(this);
                setTimeout(calcularValoresEvento, 50);
            });
            
            // Adiciona listener para blur (quando sai do campo)
            campo.addEventListener('blur', function() {
                calcularValoresEvento();
            });
            
            // Adiciona listener para change (para selects)
            campo.addEventListener('change', function() {
                setTimeout(calcularValoresEvento, 50);
            });
        } else {
            console.warn(`Campo não encontrado: ${id}`);
        }
    });
    
    // Configura listeners para selects
    const selects = ['sinal_pago_status', 'valor_restante_recebido', 'valor_avulso_pago'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            console.log(`Configurando select: ${id}`);
            select.addEventListener('change', calcularValoresEvento);
        }
    });
    
    // Configura observer para monitorar mudanças na lista de personagens
    const containerPersonagens = document.getElementById('personagensSelecionados');
    if (containerPersonagens) {
        const observer = new MutationObserver(function() {
            setTimeout(calcularValoresEvento, 100);
        });
        
        observer.observe(containerPersonagens, { childList: true });
        console.log('Observer configurado para personagens');
    }
    
    // Torna os campos de total e valor a receber somente leitura
    const valorTotalField = document.getElementById('valor_total');
    const valorAReceberField = document.getElementById('valor_falta_receber');
    
    if (valorTotalField) {
        valorTotalField.readOnly = true;
        valorTotalField.style.backgroundColor = '#f8f9fa';
        valorTotalField.style.cursor = 'not-allowed';
        valorTotalField.style.color = '#057001';
        valorTotalField.style.fontWeight = 'bold';
        console.log('Campo "Total" configurado como somente leitura');
    }
    
    if (valorAReceberField) {
        valorAReceberField.readOnly = true;
        valorAReceberField.style.backgroundColor = '#f8f9fa';
        valorAReceberField.style.cursor = 'not-allowed';
        valorAReceberField.style.color = '#da040d';
        valorAReceberField.style.fontWeight = 'bold';
        console.log('Campo "Valor que Falta Receber" configurado como somente leitura');
    }
    
    // Carrega personagens no select
    const selectPersonagens = document.getElementById('personagem_select');
    if (selectPersonagens) {
        try {
            const personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
            if (personagens.length > 0) {
                // Salva a opção padrão
                const defaultOption = selectPersonagens.querySelector('option[value=""]');
                selectPersonagens.innerHTML = '';
                if (defaultOption) {
                    selectPersonagens.appendChild(defaultOption);
                }
                
                // Adiciona personagens
                personagens.forEach(p => {
                    const option = document.createElement('option');
                    const id = p.id || p.ID || '';
                    const nome = p.nome || p.Nome || 'Personagem sem nome';
                    const valor = p.valor_hora || p.valor || '';
                    
                    option.value = id;
                    option.textContent = `${nome} ${valor ? `(${valor})` : ''}`;
                    selectPersonagens.appendChild(option);
                });
                
                console.log(`${personagens.length} personagens carregados`);
            }
        } catch (error) {
            console.error('Erro Ação carregar personagens:', error);
        }
    }
    
    // Adiciona listener para o botão de adicionar personagem
    const addPersonagemBtn = document.getElementById('addPersonagemBtn');
    if (addPersonagemBtn) {
        addPersonagemBtn.addEventListener('click', adicionarPersonagemEvento);
    }
    
    // Adiciona listener para mudanças no select de personagens
    if (selectPersonagens) {
        selectPersonagens.addEventListener('change', mostrarDetalhesPersonagem);
    }
    
    // Executa cálculo inicial
    setTimeout(calcularValoresEvento, 500);
    
    reservaConfigurada = true;
    console.log('SISTEMA DE CÁLCULOS CONFIGURADO COM SUCESSO!');
}
  // ==================== FUNÇÃO PARA PREVIEW DE FOTOS ====================
// Em formulario.js, garantir que a função está correta:
function previewFotoPersonagem(input) {
    console.log('📸 previewFotoPersonagem chamado');
    
    if (!input || !input.files || !input.files[0]) {
        return;
    }
    
    const file = input.files[0];
    
    if (!file.type.startsWith('image/')) {
        mostrarMensagemToast('❌ Por favor, selecione apenas arquivos de imagem!', true);
        input.value = '';
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        mostrarMensagemToast('❌ A imagem deve ter no máximo 5MB!', true);
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewContainer = document.getElementById('previewContainer');
        const fotoPreview = document.getElementById('fotoPreview');
        const previewText = document.getElementById('previewText');
        
        if (fotoPreview) {
            fotoPreview.src = e.target.result;
            fotoPreview.style.display = 'block';
            if (previewText) previewText.style.display = 'none';
            if (previewContainer) {
                previewContainer.style.border = '2px solid #28a745';
                previewContainer.style.backgroundColor = '#f0fff4';
            }
            console.log('✅ Imagem carregada no preview');
        } else {
            console.error('Elemento fotoPreview não encontrado');
        }
    };
    reader.onerror = function() {
        console.error('Erro ao ler o arquivo');
        mostrarMensagemToast('❌ Erro ao carregar a imagem!', true);
    };
    reader.readAsDataURL(file);
}
  

// ==================== SALVAR PERSONAGEM COM FOTO ====================
function salvarPersonagem() {
    const form = document.getElementById('personagensForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Coleta dados do formulário
        const nome = document.getElementById('nome_personagens').value;
        const figurino = document.getElementById('figurino').value;
        const tema = document.getElementById('tema').value;
        const quantidade = document.getElementById('quantidade').value;
        const valor = document.getElementById('valor_personagens').value;
        const fotoInput = document.getElementById('foto_personagem');
        
        // Validações básicas
        if (!nome) {
            alert('Preencha o nome do personagem');
            return;
        }
        
        // Gera ID único
        const id = gerarID('personagens');
        
        // Processa a foto (se houver)
        let fotoBase64 = '';
        if (fotoInput.files && fotoInput.files[0]) {
            const file = fotoInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                fotoBase64 = e.target.result;
                salvarPersonagemNoLocalStorage();
            }
            
            reader.readAsDataURL(file);
        } else {
            salvarPersonagemNoLocalStorage();
        }
        
        function salvarPersonagemNoLocalStorage() {
            // Cria objeto do personagem
            const personagem = {
                id: id,
                nome: nome,
                figurino: figurino,
                tema: tema,
                quantidade: parseInt(quantidade) || 1,
                valor: valor,
                valor_hora: valor, // Para compatibilidade com o sistema de reservas
                foto: fotoBase64,
                data_cadastro: new Date().toISOString()
            };
            
            // Recupera personagens existentes
            let personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
            
            // Adiciona novo personagem
            personagens.push(personagem);
            
            // Salva no localStorage
            localStorage.setItem('personagens', JSON.stringify(personagens));
            
            // Mostra mensagem de sucesso
            const successDiv = document.getElementById('personagensSuccess');
            if (successDiv) {
                successDiv.textContent = 'Personagem cadastrado com sucesso!';
                successDiv.style.display = 'block';
                successDiv.style.color = '#28a745';
                successDiv.style.padding = '10px';
                successDiv.style.marginTop = '10px';
                successDiv.style.borderRadius = '4px';
                successDiv.style.backgroundColor = '#d4edda';
            }
            
            // Limpa formulário após 2 segundos
            setTimeout(() => {
                form.reset();
                if (successDiv) successDiv.style.display = 'none';
                
                // Limpa preview da foto
                const fotoPreview = document.getElementById('fotoPreview');
                const previewText = document.getElementById('previewText');
                const previewContainer = document.getElementById('previewContainer');
                
                if (fotoPreview) {
                    fotoPreview.src = '';
                    fotoPreview.style.display = 'none';
                }
                if (previewText) {
                    previewText.style.display = 'block';
                }
                if (previewContainer) {
                    previewContainer.style.border = '2px dashed #ccc';
                    previewContainer.style.padding = '0';
                }
            }, 2000);
            
            console.log('Personagem salvo:', personagem);
        }
    });
}

// ==================== CONFIGURAR LISTENERS PARA FORMULÁRIOS ====================
function configurarFormularios() {
    // Personagens
    const formPersonagens = document.getElementById('personagensForm');
    if (formPersonagens) {
        formPersonagens.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarPersonagem();
        });
    }
    
    // Outros formulários (clientes, elenco, etc.)
    const forms = ['clientesForm', 'casaDeFestasForm', 'elencoForm', 'motoristasForm', 'fornecedoresForm', 'funcionariosForm'];
    
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                salvarCadastroGenerico(formId.replace('Form', ''));
            });
        }
    });
}

// ==================== FUNÇÃO GENÉRICA PARA SALVAR CADASTROS ====================
function salvarCadastroGenerico(tipo) {
    const form = document.getElementById(`${tipo}Form`);
    if (!form) return;
    
    // Coleta dados dos campos (ajuste conforme seu formulário)
    const inputs = form.querySelectorAll('input, select, textarea');
    const dados = {};
    
    inputs.forEach(input => {
        if (input.id && !input.id.includes('ID_')) {
            const campo = input.id.replace(`${tipo}_`, '');
            dados[campo] = input.value;
        }
    });
    
    // Gera ID
    const id = gerarID(tipo);
    dados.id = id;
    dados.data_cadastro = new Date().toISOString();
    
    // Recupera dados existentes
    let cadastros = JSON.parse(localStorage.getItem(tipo) || '[]');
    
    // Adiciona novo
    cadastros.push(dados);
    
    // Salva no localStorage
    localStorage.setItem(tipo, JSON.stringify(cadastros));
    
    // Mostra mensagem
    alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} cadastrado com sucesso!`);
    
    // Limpa formulário
    form.reset();
    
    console.log('${tipo} salvo:`, dados);
}

// ==================== FUNÇÃO PRINCIPAL DE CÁLCULO DE IDADE ====================
// Função que calcula idade a partir da data de nascimento
function calcularIdade(dataNascimento) {
    if (!dataNascimento) return '';
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    
    if (isNaN(nascimento.getTime())) return '';
    
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesDiff = hoje.getMonth() - nascimento.getMonth();
    
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    
    return idade >= 0 ? idade : '';
}

// Função que calcula tempo de empresa a partir da data de abertura
function calcularTempoEmpresa(dataAbertura) {
    if (!dataAbertura) return '';
    
    const hoje = new Date();
    const abertura = new Date(dataAbertura);
    
    if (isNaN(abertura.getTime())) return '';
    
    let anos = hoje.getFullYear() - abertura.getFullYear();
    const mesDiff = hoje.getMonth() - abertura.getMonth();
    
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < abertura.getDate())) {
        anos--;
    }
    
    return anos >= 0 ? anos : '';
}

// Função principal para calcular idade ou tempo (chamada pelos eventos)
function calcularIdadeOuTempo(tipo, element = null) {
    console.log(`📊 Calculando idade/tempo para: ${tipo}`);
    
    let dataValue = '';
    let campoIdade = null;
    
    // Se recebeu um elemento diretamente
    if (element && element.value !== undefined) {
        dataValue = element.value;
        // Tentar encontrar o campo de idade correspondente
        const dataId = element.id;
        if (dataId.includes('data_nascimento')) {
            const idadeId = dataId.replace('data_nascimento', 'idade');
            campoIdade = document.getElementById(idadeId);
        } else if (dataId.includes('data_abertura')) {
            const idadeId = dataId.replace('data_abertura', 'idade');
            campoIdade = document.getElementById(idadeId);
        }
    } else {
        // Mapeamento de tipos para IDs
        const mapeamento = {
            'clientes': { dataId: 'data_nascimento_clientes', idadeId: 'idade_clientes', tipoCalculo: 'idade' },
            'elenco': { dataId: 'data_nascimento_elenco', idadeId: 'idade_elenco', tipoCalculo: 'idade' },
            'motoristas': { dataId: 'data_nascimento_motoristas', idadeId: 'idade_motoristas', tipoCalculo: 'idade' },
            'funcionarios': { dataId: 'data_nascimento_funcionarios', idadeId: 'idade_funcionarios', tipoCalculo: 'idade' },
            'fornecedores': { dataId: 'data_abertura_fornecedores', idadeId: 'idade_fornecedores', tipoCalculo: 'tempo' },
            'casa_de_festas': { dataId: 'data_abertura_casa_de_festas', idadeId: 'idade_casa_de_festas', tipoCalculo: 'tempo' }
        };
        
        const config = mapeamento[tipo];
        if (config) {
            const dataInput = document.getElementById(config.dataId);
            if (dataInput) {
                dataValue = dataInput.value;
                campoIdade = document.getElementById(config.idadeId);
            }
        }
    }
    
    if (!campoIdade) {
        console.log(`⚠️ Campo de idade não encontrado para ${tipo}`);
        return '';
    }
    
    if (!dataValue) {
        campoIdade.value = '';
        return '';
    }
    
    let resultado;
    if (tipo === 'fornecedores' || tipo === 'casa_de_festas') {
        resultado = calcularTempoEmpresa(dataValue);
        campoIdade.value = resultado ? `${resultado} anos` : '';
    } else {
        resultado = calcularIdade(dataValue);
        campoIdade.value = resultado ? `${resultado} anos` : '';
    }
    
    console.log(`✅ ${tipo}: ${dataValue} -> ${campoIdade.value}`);
    return resultado;
}

// ==================== CONFIGURAR CÁLCULO AUTOMÁTICO DE IDADE ====================
function configurarCalculoIdadeGlobal() {
    console.log('🔥 Configurando cálculo automático de idade/tempo...');
    
    // Mapeamento de todos os campos de data
    const mapeamento = [
        { dataId: 'data_nascimento_clientes', tipo: 'clientes' },
        { dataId: 'data_nascimento_elenco', tipo: 'elenco' },
        { dataId: 'data_nascimento_motoristas', tipo: 'motoristas' },
        { dataId: 'data_nascimento_funcionarios', tipo: 'funcionarios' },
        { dataId: 'data_abertura_fornecedores', tipo: 'fornecedores' },
        { dataId: 'data_abertura_casa_de_festas', tipo: 'casa_de_festas' }
    ];
    
    // Função handler unificada
    const createHandler = (tipo) => {
        return function(event) {
            console.log(`🔄 Evento em ${this.id}: ${this.value}`);
            calcularIdadeOuTempo(tipo, this);
        };
    };
    
    // Configurar cada campo
    mapeamento.forEach(item => {
        const dataInput = document.getElementById(item.dataId);
        
        if (dataInput) {
            // Verificar se já foi configurado
            if (dataInput.hasAttribute('data-idade-configurado')) {
                return;
            }
            
            console.log(`✅ Configurando: ${item.dataId} -> tipo: ${item.tipo}`);
            
            const handler = createHandler(item.tipo);
            
            // Adicionar eventos
            dataInput.addEventListener('input', handler);
            dataInput.addEventListener('change', handler);
            dataInput.addEventListener('blur', handler);
            
            // Marcar como configurado
            dataInput.setAttribute('data-idade-configurado', 'true');
            
            // Se já tiver valor, calcular agora
            if (dataInput.value) {
                setTimeout(() => calcularIdadeOuTempo(item.tipo, dataInput), 100);
            }
        } else {
            console.log(`⚠️ Campo não encontrado: ${item.dataId}`);
        }
    });
    
    // Configurar observer para campos adicionados dinamicamente
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mapeamento.forEach(item => {
                    const dataInput = document.getElementById(item.dataId);
                    if (dataInput && !dataInput.hasAttribute('data-idade-configurado')) {
                        console.log(`🔄 Configurando campo dinâmico: ${item.dataId}`);
                        const handler = createHandler(item.tipo);
                        dataInput.addEventListener('input', handler);
                        dataInput.addEventListener('change', handler);
                        dataInput.addEventListener('blur', handler);
                        dataInput.setAttribute('data-idade-configurado', 'true');
                        
                        if (dataInput.value) {
                            setTimeout(() => calcularIdadeOuTempo(item.tipo, dataInput), 100);
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('🎉 Sistema de cálculo de idade configurado com sucesso!');
}

// ==================== FUNÇÃO MANUAL PARA TESTE ====================
window.forcarCalculoIdade = function() {
    console.log('🔄 Forçando recálculo de todas as idades...');
    
    const dataInputs = [
        'data_nascimento_clientes', 'data_nascimento_elenco', 'data_nascimento_motoristas',
        'data_nascimento_funcionarios', 'data_abertura_fornecedores', 'data_abertura_casa_de_festas'
    ];
    
    dataInputs.forEach(dataId => {
        const input = document.getElementById(dataId);
        if (input && input.value) {
            console.log(`📅 Recalculando: ${dataId} = ${input.value}`);
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }
    });
    
    console.log('✅ Recálculo finalizado!');
};

// ==================== FUNÇÃO PARA ALTERNAR ENTRE CPF E CNPJ ====================
function selecionarTipoFormulario(tipo, modulo) {
    const btnCpf = document.getElementById(`btnCpf_${modulo}`);
    const btnCnpj = document.getElementById(`btnCnpj_${modulo}`);
    const inputDoc = document.getElementById(`doc_${modulo}_cadastro`);
    const inputDocCpf = document.getElementById(`doc_${modulo}_cadastros_cpf`);
    const inputDocCnpj = document.getElementById(`doc_${modulo}_cadastros_cnpj`);
    
    // Remove active de ambos
    if (btnCpf) btnCpf.classList.remove('active');
    if (btnCnpj) btnCnpj.classList.remove('active');
    
    // Adiciona active no selecionado
    if (tipo === 'cpf') {
        if (btnCpf) btnCpf.classList.add('active');
        if (inputDocCpf) {
            inputDocCpf.style.display = 'block';
            inputDocCpf.placeholder = '000.000.000-00';
            inputDocCpf.maxLength = 14;
        }
        if (inputDocCnpj) inputDocCnpj.style.display = 'none';
        if (inputDoc) {
            inputDoc.placeholder = '000.000.000-00';
            inputDoc.maxLength = 14;
        }
    } else {
        if (btnCnpj) btnCnpj.classList.add('active');
        if (inputDocCnpj) {
            inputDocCnpj.style.display = 'block';
            inputDocCnpj.placeholder = '00.000.000/0000-00';
            inputDocCnpj.maxLength = 18;
        }
        if (inputDocCpf) inputDocCpf.style.display = 'none';
        if (inputDoc) {
            inputDoc.placeholder = '00.000.000/0000-00';
            inputDoc.maxLength = 18;
        }
    }
    
    // Limpar valor do documento
    if (inputDocCpf) inputDocCpf.value = '';
    if (inputDocCnpj) inputDocCnpj.value = '';
    if (inputDoc) inputDoc.value = '';
}

// ==================== FUNÇÕES DE FORMATAÇÃO DE MOEDA ====================
function converterParaNumero(valorString) {
    if (!valorString || valorString.trim() === '') return 0;
    
    try {
        let valorLimpo = valorString.toString().replace(/[^\d,.-]/g, '');
        valorLimpo = valorLimpo.replace(/[,.]$/, '');
        
        if (valorLimpo.includes(',') && !valorLimpo.includes('.')) {
            valorLimpo = valorLimpo.replace(',', '.');
        } else if (valorLimpo.includes('.') && valorLimpo.includes(',')) {
            valorLimpo = valorLimpo.replace(/\./g, '').replace(',', '.');
        }
        
        const numero = parseFloat(valorLimpo);
        return isNaN(numero) ? 0 : numero;
    } catch (error) {
        console.error('Erro ao converter para número:', error);
        return 0;
    }
}

function formatarParaMoeda(numero) {
    if (isNaN(numero)) numero = 0;
    return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatarMoeda(input) {
    if (!input || !input.value) return;
    
    let value = input.value.replace(/\D/g, '');
    if (value === '') {
        input.value = '';
        return;
    }
    
    let numero = parseInt(value) / 100;
    input.value = numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatarMoedaInput(input) {
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;
    formatarMoeda(input);
    const newLength = input.value.length;
    const lengthDiff = newLength - originalLength;
    input.setSelectionRange(cursorPos + lengthDiff, cursorPos + lengthDiff);
}

// ==================== FUNÇÕES PARA EVENTOS ====================
function obterValorPersonagem(personagemId) {
    try {
        const personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
        const personagem = personagens.find(p => 
            String(p.id) === String(personagemId) || 
            String(p.ID) === String(personagemId) ||
            String(p.codigo) === String(personagemId)
        );
        
        if (personagem) {
            if (personagem.valor_hora) return converterParaNumero(personagem.valor_hora);
            if (personagem.valor) return converterParaNumero(personagem.valor);
            if (personagem.preco) return converterParaNumero(personagem.preco);
        }
    } catch (error) {
        console.error('Erro ao obter valor do personagem:', error);
    }
    return 0;
}

function calcularValoresEvento() {
    console.log('CALCULANDO VALORES DO EVENTO');
    
    try {
        let valorTotal = 0;
        let valorAReceber = 0;
        
        const personagensDivs = document.querySelectorAll('#personagensSelecionados .personagem-item');
        
        personagensDivs.forEach((div) => {
            const personagemId = div.getAttribute('data-personagem-id');
            if (personagemId) {
                valorTotal += obterValorPersonagem(personagemId);
            }
        });
        
        const deslocamentoInput = document.getElementById('deslocamento');
        if (deslocamentoInput) {
            valorTotal += converterParaNumero(deslocamentoInput.value);
        }
        
        const descontoInput = document.getElementById('desconto');
        if (descontoInput) {
            valorTotal -= converterParaNumero(descontoInput.value);
        }
        
        valorTotal = Math.max(0, valorTotal);
        valorAReceber = valorTotal;
        
        const sinalPagoSelect = document.getElementById('sinal_pago_status');
        const valorSinalInput = document.getElementById('valor_sinal');
        
        if (sinalPagoSelect && valorSinalInput) {
            const isSinalPago = sinalPagoSelect.value === 'true';
            const valorSinal = converterParaNumero(valorSinalInput.value);
            if (isSinalPago && valorSinal > 0) {
                valorAReceber -= valorSinal;
            }
        }
        
        const valorAvulsoPagoSelect = document.getElementById('valor_avulso_pago');
        const valorAvulsoInput = document.getElementById('valor_avulso');
        
        if (valorAvulsoPagoSelect && valorAvulsoInput) {
            const isValorAvulsoPago = valorAvulsoPagoSelect.value === 'true';
            const valorAvulso = converterParaNumero(valorAvulsoInput.value);
            if (isValorAvulsoPago && valorAvulso > 0) {
                valorAReceber -= valorAvulso;
            }
        }
        
        const restanteRecebidoSelect = document.getElementById('valor_restante_recebido');
        if (restanteRecebidoSelect) {
            const isRestanteRecebido = restanteRecebidoSelect.value === 'true';
            if (isRestanteRecebido) {
                valorAReceber = 0;
            }
        }
        
        valorAReceber = Math.max(0, valorAReceber);
        
        const valorTotalField = document.getElementById('valor_total');
        const valorAReceberField = document.getElementById('valor_falta_receber');
        
        if (valorTotalField) {
            valorTotalField.value = formatarParaMoeda(valorTotal);
        }
        
        if (valorAReceberField) {
            valorAReceberField.value = formatarParaMoeda(valorAReceber);
        }
        
        return { valorTotal, valorAReceber };
        
    } catch (error) {
        console.error('Erro ao calcular valores:', error);
        return { valorTotal: 0, valorAReceber: 0 };
    }
}

function adicionarPersonagemEvento() {
    const select = document.getElementById('personagem_select');
    if (!select || !select.value) {
        alert('Selecione um personagem');
        return;
    }
    
    const personagemId = select.value;
    const personagemNome = select.options[select.selectedIndex].text;
    
    const personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
    const personagem = personagens.find(p => 
        String(p.id) === String(personagemId) || 
        String(p.ID) === String(personagemId)
    );
    
    const container = document.getElementById('personagensSelecionados');
    if (!container) return;
    
    const personagemExistente = Array.from(container.querySelectorAll('.personagem-item'))
        .some(div => div.getAttribute('data-personagem-id') === personagemId);
    
    if (personagemExistente) {
        alert('Este personagem já foi adicionado!');
        return;
    }
    
    const div = document.createElement('div');
    div.className = 'personagem-item';
    div.setAttribute('data-personagem-id', personagemId);
    
    let valorTexto = '';
    let tema = '';
    let figurino = '';
    
    if (personagem) {
        if (personagem.valor_hora || personagem.valor) {
            const valorNumero = converterParaNumero(personagem.valor_hora || personagem.valor);
            valorTexto = formatarParaMoeda(valorNumero);
        }
        tema = personagem.tema || personagem.Tema || '';
        figurino = personagem.figurino || personagem.Figurino || '';
    }
    
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; 
                    padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 5px; border: 1px solid #ddd;">
            <div style="flex: 1;">
                <strong>${personagemNome}</strong>
                <small style="display: block; color: #666;">Tema: ${tema} | Figurino: ${figurino}</small>
                ${valorTexto ? `<div style="color: #28a745; font-weight: bold;">Valor: ${valorTexto}</div>` : ''}
            </div>
            <button type="button" onclick="removerPersonagem(this)" 
                    style="background: #dc3545; color: white; border: none; padding: 5px 10px; 
                           border-radius: 3px; cursor: pointer;">
                Remover
            </button>
        </div>
    `;
    
    container.appendChild(div);
    select.value = '';
    calcularValoresEvento();
}

function removerPersonagem(button) {
    const div = button.closest('.personagem-item');
    if (div) {
        div.remove();
        calcularValoresEvento();
    }
}

function mostrarDetalhesPersonagem() {
    const select = document.getElementById('personagem_select');
    const temaField = document.getElementById('tema_personagem');
    const figurinoField = document.getElementById('figurino_personagem');
    
    if (!select || !select.value) {
        if (temaField) temaField.value = '';
        if (figurinoField) figurinoField.value = '';
        return;
    }
    
    const personagemId = select.value;
    const personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
    const personagem = personagens.find(p => 
        p.id == personagemId || p.ID == personagemId
    );
    
    if (personagem) {
        if (temaField) temaField.value = personagem.tema || '';
        if (figurinoField) figurinoField.value = personagem.figurino || '';
    }
}

function configurarReservaEvento() {
    if (reservaConfigurada) return;
    
    console.log('CONFIGURANDO SISTEMA DE CÁLCULOS PARA RESERVA');
    
    const camposMonetarios = ['deslocamento', 'desconto', 'valor_sinal', 'valor_avulso'];
    
    camposMonetarios.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            if (campo.value) formatarMoeda(campo);
            campo.addEventListener('input', function() {
                formatarMoedaInput(this);
                setTimeout(calcularValoresEvento, 50);
            });
            campo.addEventListener('change', () => setTimeout(calcularValoresEvento, 50));
        }
    });
    
    const selects = ['sinal_pago_status', 'valor_restante_recebido', 'valor_avulso_pago'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) select.addEventListener('change', calcularValoresEvento);
    });
    
    reservaConfigurada = true;
    console.log('SISTEMA DE CÁLCULOS CONFIGURADO!');
}

// ==================== PREVIEW DE FOTOS ====================
function previewFotoPersonagem(input) {
    if (!input || !input.files || !input.files[0]) return;
    
    const file = input.files[0];
    
    if (!file.type.startsWith('image/')) {
        mostrarMensagemToast('❌ Selecione apenas arquivos de imagem!', true);
        input.value = '';
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        mostrarMensagemToast('❌ A imagem deve ter no máximo 5MB!', true);
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const fotoPreview = document.getElementById('fotoPreview');
        const previewText = document.getElementById('previewText');
        const previewContainer = document.getElementById('previewContainer');
        
        if (fotoPreview) {
            fotoPreview.src = e.target.result;
            fotoPreview.style.display = 'block';
            if (previewText) previewText.style.display = 'none';
            if (previewContainer) {
                previewContainer.style.border = '2px solid #28a745';
            }
        }
    };
    reader.readAsDataURL(file);
}

// ==================== SALVAR PERSONAGEM ====================
function salvarPersonagem() {
    const nome = document.getElementById('nome_personagens')?.value;
    const figurino = document.getElementById('figurino')?.value;
    const tema = document.getElementById('tema')?.value;
    const quantidade = document.getElementById('quantidade')?.value;
    const valor = document.getElementById('valor_personagens')?.value;
    const fotoInput = document.getElementById('foto_personagem');
    
    if (!nome || !figurino || !tema || !quantidade || !valor) {
        alert('Preencha todos os campos obrigatórios!');
        return false;
    }
    
    const id = gerarID('personagens');
    let fotoBase64 = '';
    
    const salvarNoStorage = (foto = '') => {
        const personagem = {
            id: id,
            nome: nome,
            figurino: figurino,
            tema: tema,
            quantidade: parseInt(quantidade) || 1,
            valor: valor,
            valor_hora: valor,
            foto: foto,
            data_cadastro: new Date().toISOString()
        };
        
        let personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
        personagens.push(personagem);
        localStorage.setItem('personagens', JSON.stringify(personagens));
        
        alert('Personagem cadastrado com sucesso!');
        document.getElementById('personagensForm')?.reset();
        
        const fotoPreview = document.getElementById('fotoPreview');
        const previewText = document.getElementById('previewText');
        if (fotoPreview) {
            fotoPreview.src = '';
            fotoPreview.style.display = 'none';
        }
        if (previewText) previewText.style.display = 'block';
    };
    
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            salvarNoStorage(e.target.result);
        };
        reader.readAsDataURL(fotoInput.files[0]);
    } else {
        salvarNoStorage('');
    }
    
    return false;
}

// ==================== FUNÇÕES AUXILIARES ====================
function gerarID(prefixo) {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = String(data.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefixo}-${ano}${mes}${dia}-${horas}${minutos}${segundos}-${random}`;
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
    `;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
// ==================== FUNÇÕES PARA CONTROLE DO FAZ DRIVE ====================

// Função principal para mostrar/esconder campos do motorista
function toggleCamposMotorista() {
    console.log('🔄 toggleCamposMotorista chamado');
    
    const fazDriveSelect = document.getElementById('faz_drive_elenco');
    const camposMotorista = document.getElementById('campos_drive_elenco');
    
    if (!fazDriveSelect) {
        console.error('❌ Select "faz_drive_elenco" não encontrado!');
        return;
    }
    
    if (!camposMotorista) {
        console.error('❌ Container "campos_drive_elenco" não encontrado!');
        return;
    }
    
    const valorSelecionado = fazDriveSelect.value;
    console.log(`📋 Valor selecionado: ${valorSelecionado}`);
    
    if (valorSelecionado === 'sim') {
        camposMotorista.style.display = 'block';
        console.log('✅ Campos do motorista VISÍVEIS');
    } else {
        camposMotorista.style.display = 'none';
        console.log('✅ Campos do motorista OCULTOS');
        
        // Limpar os campos quando ocultar
        const cnh = document.getElementById('cnh_motorista_elenco');
        const modelo = document.getElementById('modelo_carro_elenco');
        const placa = document.getElementById('placa_carro_elenco');
        if (cnh) cnh.value = '';
        if (modelo) modelo.value = '';
        if (placa) placa.value = '';
    }
}

// Função para configurar o evento do select Faz Drive
function configurarFazDriveEvent() {
    console.log('🔧 Configurando evento do Faz Drive...');
    
    const fazDriveSelect = document.getElementById('faz_drive_elenco');
    
    if (fazDriveSelect) {
        // Remover listener anterior para evitar duplicação
        fazDriveSelect.removeEventListener('change', toggleCamposMotorista);
        // Adicionar novo listener
        fazDriveSelect.addEventListener('change', toggleCamposMotorista);
        
        console.log('✅ Evento configurado no select "faz_drive_elenco"');
        
        // Executar uma vez para definir o estado inicial
        setTimeout(() => {
            toggleCamposMotorista();
        }, 100);
    } else {
        console.warn('⚠️ Select "faz_drive_elenco" não encontrado, tentando novamente...');
        setTimeout(configurarFazDriveEvent, 500);
    }
}

// ==================== FUNÇÃO PARA SALVAR ELENCO COMPLETO ====================
function salvarElencoCompleto() {
    console.log('💾 Salvando elenco...');
    
    const fazDriveSelect = document.getElementById('faz_drive_elenco');
    if (!fazDriveSelect) {
        mostrarMensagemToast('❌ Erro ao salvar!', true);
        return false;
    }
    
    const fazDrive = fazDriveSelect.value;
    const cnh = document.getElementById('cnh_motorista_elenco')?.value || '';
    const modelo = document.getElementById('modelo_carro_elenco')?.value || '';
    const placa = document.getElementById('placa_carro_elenco')?.value || '';
    
    // Validação para quem faz drive
    if (fazDrive === 'sim') {
        if (!cnh || cnh.trim() === '') {
            mostrarMensagemToast('❌ CNH é obrigatória para quem faz drive!', true);
            document.getElementById('cnh_motorista_elenco').focus();
            return false;
        }
        if (!modelo || modelo.trim() === '') {
            mostrarMensagemToast('❌ Modelo do carro é obrigatório para quem faz drive!', true);
            document.getElementById('modelo_carro_elenco').focus();
            return false;
        }
        if (!placa || placa.trim() === '') {
            mostrarMensagemToast('❌ Placa do veículo é obrigatória para quem faz drive!', true);
            document.getElementById('placa_carro_elenco').focus();
            return false;
        }
    }
    
    // Gerar ID se não existir
    let idField = document.getElementById('ID_elenco');
    let id = idField?.value || '';
    if (!id) {
        id = gerarID('elenco');
        if (idField) idField.value = id;
    }
    
    // Coletar dados do formulário
    const dados = {
        id: id,
        nome_elenco: document.getElementById('nome_elenco')?.value || '',
        doc_elenco_cadastro: document.getElementById('doc_elenco_cadastro')?.value.replace(/\D/g, '') || '',
        data_nascimento_elenco: document.getElementById('data_nascimento_elenco')?.value || '',
        idade_elenco: document.getElementById('idade_elenco')?.value || '',
        aceita_producao_elenco: document.getElementById('aceita_producao_elenco')?.value || 'nao',
        telefone_elenco: document.getElementById('telefone_elenco')?.value || '',
        email_elenco: document.getElementById('email_elenco')?.value || '',
        faz_drive_elenco: fazDrive,
        chave_pix_elenco: document.getElementById('chave_pix_elenco')?.value || '',
        cnh_motorista_elenco: fazDrive === 'sim' ? cnh : '',
        modelo_carro_elenco: fazDrive === 'sim' ? modelo : '',
        placa_carro_elenco: fazDrive === 'sim' ? placa : '',
        cep_elenco: document.getElementById('cep_elenco')?.value || '',
        logradouro_elenco: document.getElementById('logradouro_elenco')?.value || '',
        numero_elenco: document.getElementById('numero_elenco')?.value || '',
        complemento_elenco: document.getElementById('complemento_elenco')?.value || '',
        bairro_elenco: document.getElementById('bairro_elenco')?.value || '',
        cidade_elenco: document.getElementById('cidade_elenco')?.value || '',
        estado_elenco: document.getElementById('estado_elenco')?.value || '',
        data_cadastro: new Date().toISOString()
    };
    
    // Salvar no localStorage
    let elenco = JSON.parse(localStorage.getItem('elenco_cadastrados') || '[]');
    const index = elenco.findIndex(e => e.id === id);
    
    if (index !== -1) {
        elenco[index] = dados;
        mostrarMensagemToast('✅ Elenco atualizado com sucesso!');
    } else {
        elenco.push(dados);
        mostrarMensagemToast('✅ Elenco cadastrado com sucesso!');
    }
    
    localStorage.setItem('elenco_cadastrados', JSON.stringify(elenco));
    console.log('Elenco salvo:', dados);
    
    // Limpar formulário
    limparFormularioElenco();
    
    return true;
}

// ==================== FUNÇÃO PARA LIMPAR FORMULÁRIO ELENCO ====================
function limparFormularioElenco() {
    console.log('🧹 Limpando formulário elenco');
    
    const form = document.getElementById('elencoForm');
    if (form) form.reset();
    
    // Esconder campos do motorista
    const camposMotorista = document.getElementById('campos_drive_elenco');
    if (camposMotorista) {
        camposMotorista.style.display = 'none';
    }
    
    // Resetar select Faz Drive
    const fazDriveSelect = document.getElementById('faz_drive_elenco');
    if (fazDriveSelect) {
        fazDriveSelect.value = 'nao';
    }
    
    // Limpar valores dos campos de motorista
    const cnh = document.getElementById('cnh_motorista_elenco');
    const modelo = document.getElementById('modelo_carro_elenco');
    const placa = document.getElementById('placa_carro_elenco');
    if (cnh) cnh.value = '';
    if (modelo) modelo.value = '';
    if (placa) placa.value = '';
    
    // Gerar novo ID
    const idField = document.getElementById('ID_elenco');
    if (idField) {
        idField.value = gerarID('elenco');
    }
    
    // Liberar campo nome
    const nomeField = document.getElementById('nome_elenco');
    if (nomeField) {
        nomeField.value = '';
        nomeField.readOnly = false;
        nomeField.style.backgroundColor = '#ffffff';
    }
    
    mostrarMensagemToast('🧹 Formulário limpo!');
}

// ==================== OBSERVER PARA PÁGINA ELENCO ====================
function observarPaginaElenco() {
    const paginaElenco = document.getElementById('elenco');
    
    if (paginaElenco) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (paginaElenco.classList.contains('active')) {
                        console.log('📄 Página Elenco ativada');
                        setTimeout(configurarFazDriveEvent, 200);
                    }
                }
            });
        });
        
        observer.observe(paginaElenco, { attributes: true });
        console.log('✅ Observer da página Elenco configurado');
    }
}

// ==================== EXPORTAR FUNÇÕES DO FAZ DRIVE ====================
window.toggleCamposMotorista = toggleCamposMotorista;
window.configurarFazDriveEvent = configurarFazDriveEvent;
window.salvarElencoCompleto = salvarElencoCompleto;
window.limparFormularioElenco = limparFormularioElenco;


// ==================== INICIALIZAÇÃO PRINCIPAL ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistemas...');
    
    // Configurar cálculo automático de idade
    configurarCalculoIdadeGlobal();
    
    // Configurar reserva de evento
    setTimeout(configurarReservaEvento, 500);
    
    // Configurar Faz Drive do Elenco
    setTimeout(configurarFazDriveEvent, 500);
    observarPaginaElenco();
    
    console.log('✅ Todos os sistemas inicializados!');
});

// Exportar funções globais
window.selecionarTipoFormulario = selecionarTipoFormulario;
window.calcularIdadeOuTempo = calcularIdadeOuTempo;
window.calcularValoresEvento = calcularValoresEvento;
window.adicionarPersonagemEvento = adicionarPersonagemEvento;
window.removerPersonagem = removerPersonagem;
window.mostrarDetalhesPersonagem = mostrarDetalhesPersonagem;
window.configurarReservaEvento = configurarReservaEvento;
window.previewFotoPersonagem = previewFotoPersonagem;
window.salvarPersonagem = salvarPersonagem;
window.formatarMoeda = formatarMoeda;
window.formatarMoedaInput = formatarMoedaInput;
window.converterParaNumero = converterParaNumero;
window.formatarParaMoeda = formatarParaMoeda;
window.mostrarMensagemToast = mostrarMensagemToast;
window.gerarID = gerarID;
window.forcarCalculoIdade = forcarCalculoIdade;

console.log('✅ Todas as funções do formulario.js foram exportadas!');

    
   

