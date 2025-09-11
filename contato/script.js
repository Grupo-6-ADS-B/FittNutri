document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    alert(`Formulário enviado!\nNome: ${name}\nE-mail: ${email}\nMensagem: ${message}`);
    
    // Aqui você poderia adicionar a lógica para enviar os dados para um servidor, por exemplo:
    // fetch('sua_url_de_api', { ... })
});