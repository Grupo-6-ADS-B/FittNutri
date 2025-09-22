import React, { useState } from 'react';

function LoginForm({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!email.includes('@')) {
      setError('O e-mail deve conter um "@".');
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/;
    if (!passwordRegex.test(password)) {
      setError('A senha deve ter no mínimo 6 caracteres, um número e um caractere especial.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      if (response.status === 401) {
        const msg = await response.text();
        throw new Error(msg);
      }
      if (!response.ok) {
        throw new Error('Erro ao autenticar usuário.');
      }

      const user = await response.json();
      setSuccess(`Login realizado com sucesso! Bem-vindo(a), ${user.nome}!`);

    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
      <div className="input-box">
        <input 
          type="text" 
          className="input-field" 
          id="log-email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <label htmlFor="log-email" className="label">Email</label>
        <i className='bx bx-envelope icon'></i>
      </div>
      <div className="input-box">
        <input 
          type="password" 
          className="input-field" 
          id="log-pass" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        <label htmlFor="log-pass" className="label">Senha</label>
        <i className='bx bx-lock-alt icon'></i>
      </div>
      <div className="form-cols">
        <div className="col-1"></div>
        <div className="col-2">
          <a href="#">Esqueceu a senha?</a>
        </div>
      </div>
      <div className="input-box">
        <button type="submit" className="btn-submit" id="SignInBtn">
          Acessar <i className='bx bx-log-in'></i>
        </button>
      </div>
      
      {}
      {error && <p className="message-text error-text">{error}</p>}
      {success && <p className="message-text success-text">{success}</p>}

      <div className="social-login">
        <div className="social-text">Faça login com:</div>
        <button type="button" className="google-btn">
          <i className='bx bxl-google'></i> Google
        </button>
        <button type="button" className="btn-submit instagram-btn">
          <i className='bx bxl-instagram'></i> Instagram
        </button>
      </div>
      <div className="switch-form">
        <span>Ainda não tem uma conta? <a href="#" onClick={onSwitchToRegister}>Cadastre-se</a></span>
      </div>
    </form>
  );
}

export default LoginForm;
