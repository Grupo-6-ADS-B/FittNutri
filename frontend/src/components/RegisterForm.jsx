import React, { useState } from 'react';

function RegisterForm({ onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [crn, setCrn] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCpfChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    setCpf(v);
  };

  const handleCrnChange = (e) => {
    let v = e.target.value.replace(/[^\dA-Za-z]/g, '');
    v = v.replace(/(\d{1,6})([A-Za-z]{0,2})/, (m, n, uf) => uf ? n + '/' + uf.toUpperCase() : n);
    setCrn(v);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!email.includes('@')) {
      setError('O e-mail deve conter um "@".');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const newUserData = {
      nome: name,
      email,
      cpf,
      crn,
      senha: password,
    };

    try {
      const response = await fetch('http://localhost:8080/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData),
      });

      if (response.status === 409) {
        throw new Error('E-mail, CPF ou CRN já cadastrado.');
      }
      if (!response.ok) {
        throw new Error('Erro ao cadastrar usuário.');
      }

      const data = await response.json();
      setSuccess('Cadastro realizado com sucesso!');
   
      onSwitchToLogin(); 

    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao cadastrar. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form" autoComplete="off">
      <div className="input-box">
        <input 
          type="text" 
          className="input-field" 
          id="reg-name" 
          required 
          value={name}
          onChange={(e) => setName(e.target.value)} 
        />
        <label htmlFor="reg-name" className="label">Nome</label>
        <i className='bx bx-user icon'></i>
        <span className="error-label" id="name-error"></span>
      </div>
      <div className="input-box">
        <input 
          type="text" 
          className="input-field" 
          id="reg-email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <label htmlFor="reg-email" className="label">Email</label>
        <i className='bx bx-envelope icon'></i>
        <span className="error-label" id="email-error"></span>
      </div>
      <div className="input-box">
        <input 
          type="text" 
          className="input-field" 
          id="reg-cpf" 
          required 
          value={cpf}
          onChange={handleCpfChange} 
          maxLength="14" 
        />
        <label htmlFor="reg-cpf" className="label">CPF</label>
        <i className='bx bx-id-card icon'></i>
        <span className="error-label" id="cpf-error"></span>
      </div>
      <div className="input-box">
        <input 
          type="text" 
          className="input-field" 
          id="reg-crn" 
          required 
          value={crn}
          onChange={handleCrnChange} 
          maxLength="9" 
        />
        <label htmlFor="reg-crn" className="label">CRN</label>
        <i className='bx bx-food-menu icon'></i>
        <span className="error-label" id="crn-error"></span>
      </div>
      <div className="input-box">
        <input 
          type="password" 
          className="input-field" 
          id="reg-pass" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        <label htmlFor="reg-pass" className="label">Senha</label>
        <i className='bx bx-lock-alt icon'></i>
        <span className="error-label" id="pass-error"></span>
      </div>
      <div className="input-box">
        <input 
          type="password" 
          className="input-field" 
          id="reg-confirm-pass" 
          required 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} 
        />
        <label htmlFor="reg-confirm-pass" className="label">Confirmar Senha</label>
        <i className='bx bx-lock-alt icon'></i>
        <span className="error-label" id="confirm-pass-error"></span>
      </div>
      <div className="input-box">
        <button type="submit" className="btn-submit" id="SignUpBtn">
          Cadastre-se <i className='bx bx-user-plus'></i>
        </button>
      </div>

      {}
      {error && <p className="message-text error-text">{error}</p>}
      {success && <p className="message-text success-text">{success}</p>}

      <div className="switch-form">
        <span>Já tem uma conta? <a href="#" onClick={onSwitchToLogin}>Faça login</a></span>
      </div>
    </form>
  );
}

export default RegisterForm;
