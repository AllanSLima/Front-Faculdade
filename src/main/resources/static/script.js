// URL da API
const API_URL = 'http://localhost:8080/alunos';

// Variável global para armazenar todos os alunos
let todosAlunos = [];

// Carregar alunos quando a página carregar
document.addEventListener('DOMContentLoaded', function () {
    listarAlunos();

    // Event listener para o formulário
    document.getElementById('alunoForm').addEventListener('submit', cadastrarAluno);

    // Event listener para busca em tempo real
    document.getElementById('searchInput').addEventListener('input', filtrarAlunos);
});

// Listar todos os alunos
function listarAlunos() {
    fetch(API_URL)
        .then(response => response.json())
        .then(alunos => {
            todosAlunos = alunos; // Armazena todos os alunos
            renderizarTabela(alunos);
        })
        .catch(error => {
            console.error('Erro ao listar alunos:', error);
            alert('Erro ao carregar lista de alunos!');
        });
}

// Renderizar tabela de alunos
function renderizarTabela(alunos) {
    const tbody = document.getElementById('alunosBody');
    tbody.innerHTML = '';

    if (alunos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum aluno encontrado</td></tr>';
        return;
    }

    alunos.forEach(aluno => {
        const tr = document.createElement('tr');

        const statusClass = aluno.ativo ? 'text-success fw-bold' : 'text-danger fw-bold';
        const statusText = aluno.ativo ? 'Ativo' : 'Inativo';

        tr.innerHTML = `
            <td>${aluno.id}</td>
            <td>${aluno.nomeCompleto}</td>
            <td>${aluno.ra}</td>
            <td>${aluno.email}</td>
            <td>R$ ${aluno.mensalidade.toFixed(2)}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarAluno('${aluno.ra}')">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="desativarAluno('${aluno.ra}')">Desativar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Filtrar alunos em tempo real
function filtrarAlunos() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    // Se o campo de busca estiver vazio, mostra todos
    if (searchTerm === '') {
        renderizarTabela(todosAlunos);
        return;
    }

    // Filtra os alunos que correspondem ao termo de busca
    const alunosFiltrados = todosAlunos.filter(aluno => {
        return aluno.nomeCompleto.toLowerCase().includes(searchTerm) ||
            aluno.ra.toLowerCase().includes(searchTerm) ||
            aluno.email.toLowerCase().includes(searchTerm) ||
            aluno.mensalidade.toString().includes(searchTerm);
    });

    renderizarTabela(alunosFiltrados);
}


// Recarregar lista (limpa busca e recarrega do servidor)
function recarregarLista() {
    document.getElementById('searchInput').value = ''; // Limpa o campo de busca
    listarAlunos(); // Recarrega os dados
}



// Cadastrar novo aluno
function cadastrarAluno(event) {
    event.preventDefault();

    const aluno = {
        nomeCompleto: document.getElementById('nomeCompleto').value,
        ra: document.getElementById('ra').value,
        email: document.getElementById('email').value,
        mensalidade: parseFloat(document.getElementById('mensalidade').value),
        ativo: document.getElementById('ativo').checked
    };

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aluno)
    })
        .then(async response => {
            if (response.ok) {
                alert('Aluno cadastrado com sucesso!');
                document.getElementById('alunoForm').reset();
                document.getElementById('ativo').checked = true;
                listarAlunos();
            } else {
                const errorMessage = await response.text();
                alert(errorMessage);
            }
        })
        .catch(error => {
            console.error('Erro ao cadastrar aluno:', error);
            alert('Erro ao conectar com o servidor!');
        });
}

// Editar aluno (simplificado - preenche o formulário)
function editarAluno(ra) {
    fetch(`${API_URL}/ra/${ra}`)
        .then(response => response.json())
        .then(aluno => {
            document.getElementById('nomeCompleto').value = aluno.nomeCompleto;
            document.getElementById('ra').value = aluno.ra;
            document.getElementById('email').value = aluno.email;
            document.getElementById('mensalidade').value = aluno.mensalidade;
            document.getElementById('ativo').checked = aluno.ativo;

            // Alterar comportamento do formulário para atualizar
            const form = document.getElementById('alunoForm');
            form.onsubmit = function (e) {
                e.preventDefault();
                atualizarAluno(ra);
            };

            // Mudar texto do botão
            const btn = form.querySelector('button[type="submit"]');
            btn.textContent = 'Atualizar Aluno';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-warning');
        })
        .catch(error => {
            console.error('Erro ao buscar aluno:', error);
            alert('Erro ao carregar dados do aluno!');
        });
}

// Atualizar aluno
function atualizarAluno(ra) {
    const aluno = {
        nomeCompleto: document.getElementById('nomeCompleto').value,
        ra: document.getElementById('ra').value,
        email: document.getElementById('email').value,
        mensalidade: parseFloat(document.getElementById('mensalidade').value),
        ativo: document.getElementById('ativo').checked
    };

    fetch(`${API_URL}/ra/${ra}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aluno)
    })
        .then(async response => {
            if (response.ok) {
                alert('Aluno atualizado com sucesso!');
                resetarFormulario();
                listarAlunos();
            } else {
                const errorMessage = await response.text();
                alert(errorMessage);
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar aluno:', error);
            alert('Erro ao conectar com o servidor!');
        });
}

// Desativar aluno (soft delete)
function desativarAluno(ra) {
    if (confirm('Deseja realmente desativar este aluno?')) {
        fetch(`${API_URL}/ra/${ra}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('Aluno desativado com sucesso!');
                    listarAlunos();
                } else {
                    alert('Erro ao desativar aluno!');
                }
            })
            .catch(error => {
                console.error('Erro ao desativar aluno:', error);
                alert('Erro ao desativar aluno!');
            });
    }
}

// Resetar formulário
function resetarFormulario() {
    const form = document.getElementById('alunoForm');
    form.reset();
    document.getElementById('ativo').checked = true;

    // Voltar comportamento original do formulário
    form.onsubmit = cadastrarAluno;

    // Voltar texto do botão
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Cadastrar Aluno';
    btn.classList.remove('btn-warning');
    btn.classList.add('btn-primary');
}
