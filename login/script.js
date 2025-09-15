document.addEventListener('DOMContentLoaded', () => {
    // Máscara CPF
    var cpfInput = document.getElementById('reg-cpf');
    cpfInput.addEventListener('input', function(e) {
        let v = cpfInput.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
        v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        cpfInput.value = v;
    });

    // Máscara CRN (ex: 12345/SP)
    var crnInput = document.getElementById('reg-crn');
    crnInput.addEventListener('input', function(e) {
        let v = crnInput.value.replace(/[^\dA-Za-z]/g, '');
        v = v.replace(/(\d{1,6})([A-Za-z]{0,2})/, (m, n, uf) => uf ? n + '/' + uf.toUpperCase() : n);
        crnInput.value = v;
    });
    const body = document.body;
    const wrapper = document.querySelector('.wrapper');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const header = document.querySelector('.main-header');
    const footer = document.querySelector('.main-footer');
    const titleLogin = document.querySelector('.title-login');
    const titleRegister = document.querySelector('.title-register');

    function showNotification(message, type) {
        const popup = document.getElementById('notification-popup');
        const messageText = popup.querySelector('.message-text');
        const progressBar = popup.querySelector('.progress-bar');

        popup.classList.remove('success', 'error');
        popup.classList.add(type);
        messageText.innerText = message;

        popup.classList.add('show');
        
        progressBar.style.animation = 'none';
        progressBar.offsetHeight;
        progressBar.style.animation = null;

        setTimeout(() => {
            popup.classList.remove('show');
        }, 4000);
    }

    function loginFunction() {
        body.classList.remove('register-mode');
        body.classList.add('login-mode');
    }

    function registerFunction() {
        body.classList.remove('login-mode');
        body.classList.add('register-mode');
    }

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        document.body.style.setProperty('--x', `${x}px`);
        document.body.style.setProperty('--y', `${y}px`);
    });

    // Botão do topo: Entrar
    document.querySelector('.btn-login').onclick = function(e) {
        e.preventDefault();
        loginFunction();
    };
    // Botão do topo: Cadastrar
    document.querySelector('.btn-register').onclick = function(e) {
        e.preventDefault();
        registerFunction();
    };
    // Link "Cadastre-se" abaixo do login
    document.querySelector('.login-form .switch-form a').onclick = function(e) {
        e.preventDefault();
        registerFunction();
    };
    // Link "Faça login" abaixo do cadastro
    document.querySelector('.register-form .switch-form a').onclick = function(e) {
        e.preventDefault();
        loginFunction();
    };

    loginFunction();

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
    const nome = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const cpf = document.getElementById("reg-cpf").value;
    const crn = document.getElementById("reg-crn").value;
    const senha = document.getElementById("reg-pass").value;
    const confirmPassword = document.getElementById("reg-confirm-pass").value;
        
        if (!email.includes('@')) {
            showNotification('O e-mail deve conter um "@".', 'error');
            return;
        }
        if (senha.length < 6) {
            showNotification('A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }
        if (senha !== confirmPassword) {
            showNotification('As senhas não coincidem.', 'error');
            return;
        }

        const newUserData = { nome, email, cpf, crn, senha };

        fetch('http://localhost:8080/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUserData),
        })
        .then(response => {
            if (response.status === 409) {
                throw new Error('Email, CPF ou CRN já cadastrado.');
            }
            if (!response.ok) throw new Error('Erro ao cadastrar usuário');
            return response.json();
        })
        .then(data => {
            showNotification('Cadastro realizado com sucesso!', 'success');
            loginFunction(); 
        })
        .catch(error => {
            showNotification(error.message || 'Ocorreu um erro ao cadastrar. Tente novamente.', 'error');
        });
    });

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById("log-email").value;
        const password = document.getElementById("log-pass").value;

        if (!email.includes('@')) {
            showNotification('O e-mail deve conter um "@".', 'error');
            return;
        }
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/;
        if (!passwordRegex.test(password)) {
            showNotification('A senha deve ter no mínimo 6 caracteres, um número e um caractere especial.', 'error');
            return;
        }

        fetch('http://localhost:8080/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, senha: password })
        })
        .then(response => {
            if (response.status === 401) {
                return response.text().then(msg => { throw new Error(msg); });
            }
            if (!response.ok) throw new Error('Erro ao autenticar usuário.');
            return response.json();
        })
        .then(user => {
            showNotification(`Login realizado com sucesso! Bem-vindo(a), ${user.nome}!`, 'success');
            // Aqui você pode redirecionar ou salvar dados do usuário logado
        })
        .catch(error => {
            showNotification(error.message || 'Ocorreu um erro ao fazer login. Tente novamente.', 'error');
        });
    });
});