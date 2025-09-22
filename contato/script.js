document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const nome = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const mensagem = document.getElementById('message').value;

        fetch('http://localhost:3000/contatos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email, mensagem })
        })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao enviar mensagem');
            return response.json();
        })
        .then(data => {
            alert('Mensagem enviada com sucesso!');
            form.reset();
        })
        .catch(error => {
            alert(error.message || 'Ocorreu um erro ao enviar. Tente novamente.');
        });
    });
});