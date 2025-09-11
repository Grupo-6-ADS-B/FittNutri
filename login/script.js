document.addEventListener('DOMContentLoaded', () => {
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

    document.querySelector('.btn-login').addEventListener('click', loginFunction);
    document.querySelector('.btn-register').addEventListener('click', registerFunction);
    document.querySelector('.switch-form a[onclick="registerFunction()"]').addEventListener('click', (e) => {
        e.preventDefault();
        registerFunction();
    });
    document.querySelector('.switch-form a[onclick="loginFunction()"]').addEventListener('click', (e) => {
        e.preventDefault();
        loginFunction();
    });

    loginFunction();

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const phone = document.getElementById("reg-phone").value;
        const cpf = document.getElementById("reg-cpf").value;
        const crn = document.getElementById("reg-crn").value;
        const password = document.getElementById("reg-pass").value;
        const confirmPassword = document.getElementById("reg-confirm-pass").value;
        
        if (!email.includes('@')) {
            showNotification('O e-mail deve conter um "@".', 'error');
            return;
        }
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/;
        if (!passwordRegex.test(password)) {
            showNotification('A senha deve ter no mínimo 6 caracteres, um número e um caractere especial.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showNotification('As senhas não coincidem.', 'error');
            return;
        }
        
        const newUserData = { name, email, phone, cpf, crn, password };

        fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUserData),
        })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao cadastrar usuário');
            return response.json();
        })
        .then(data => {
            showNotification('Cadastro realizado com sucesso!', 'success');
            loginFunction(); 
        })
        .catch(error => {
            showNotification('Ocorreu um erro ao cadastrar. Tente novamente.', 'error');
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

        fetch(`http://localhost:3000/users?email=${email}`)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao buscar usuário.');
                return response.json();
            })
            .then(users => {
                if (users.length === 0) {
                    showNotification('Usuário não encontrado.', 'error');
                    return;
                }
                const user = users[0];
                if (user.password === password) {
                    showNotification(`Login realizado com sucesso! Bem-vindo(a), ${user.name}!`, 'success');
                } else {
                    showNotification('Senha incorreta.', 'error');
                }
            })
            .catch(error => {
                showNotification('Ocorreu um erro ao fazer login. Tente novamente.', 'error');
            });
    });
});