// ==================== BOTÕES DE ESCALAR EM TODOS OS EVENTOS ====================

function adicionarBotoesEscalarEventos() {
    const tbody = document.getElementById('tabelaTodosEventos');
    if (!tbody) return;
    
    const eventos = JSON.parse(localStorage.getItem('eventos_cadastrados') || '[]');
    
    tbody.innerHTML = '';
    
    if (eventos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">Nenhum evento cadastrado</td></tr>';
        return;
    }
    
    eventos.forEach((evento, index) => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${evento.id || '-'}</td>
            <td>${evento.data_evento || '-'}<br>${evento.hora_evento || '-'}</td>
            <td>${evento.nome_cliente_evento || '-'}</td>
            <td>${evento.nome_local_evento || evento.casa_festa || '-'}</td>
            <td>${(evento.personagensSelecionados || []).map(p => p.nome).join(', ') || '-'}</td>
            <td>${evento.valor_total || 'R$ 0,00'}</td>
            <td><span class="status-badge">${evento.statusPagamento || 'Pendente'}</span></td>
            <td><span class="status-badge ${evento.status}">${evento.status || 'Reservado'}</span></td>
            <td>
                <button class="btn small" onclick="visualizarEvento(${index})" title="Ver Evento" style="background:#007bff;color:white;margin:2px;">
                    Ver
                </button>
                <button class="btn small" onclick="editarEvento(${index})" title="Editar Evento" style="background:#ffc107;color:#333;margin:2px;">
                    Editar
                </button>
                <button class="btn small" onclick="escalarEventoRapido('${evento.id}')" title="Escalar Equipe" style="background:#28a745;color:white;margin:2px;">
                    Escalar
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function escalarEventoRapido(eventoId) {
    // Salvar ID do evento
    sessionStorage.setItem('eventoPara_escalar', eventoId);
    
    // Navegar para página de escalas
    if (typeof showPage === 'function') {
        showPage('escalas');
    }
    
    // Abrir escala do evento
    setTimeout(() => {
        if (typeof abrirEscalaEvento === 'function') {
            abrirEscalaEvento(eventoId);
        }
    }, 300);
}

// Carregar Ação abrir página de todos os eventos
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'todos_eventos' && mutation.target.classList.contains('active')) {
                adicionarBotoesEscalarEventos();
            }
        });
    });
    
    const todosEventos = document.getElementById('todos_eventos');
    if (todosEventos) {
        observer.observe(todosEventos, { attributes: true, attributeFilter: ['class'] });
    }
});

window.adicionarBotoesEscalarEventos = adicionarBotoesEscalarEventos;
window.escalarEventoRapido = escalarEventoRapido;

console.log('botoes-escalar-eventos.js carregado');

