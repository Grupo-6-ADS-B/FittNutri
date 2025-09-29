import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus, CheckCircle, XCircle } from 'lucide-react';

export default function LoginCard() {
  const [isLogin, setIsLogin] = useState(true);
  const [modal, setModal] = useState({ show: false, message: '', type: 'success' });

  const showModal = (message, type) => {
    setModal({ show: true, message, type });
    setTimeout(() => setModal({ ...modal, show: false }), 2500);
  };

  return (
    <div className="login-bg">
      <div className="card-container">
        <div className={`card login-card ${isLogin ? 'active' : ''}`}>
          <h2 className="card-title">Login</h2>
          <LoginForm setIsLogin={setIsLogin} showModal={showModal} />
        </div>
        <div className={`card register-card ${!isLogin ? 'active' : ''}`}>
          <h2 className="card-title">Cadastro</h2>
          <RegisterForm setIsLogin={setIsLogin} showModal={showModal} />
        </div>
      </div>
      {modal.show && (
        <div className={`modal-msg ${modal.type}`}>
          {modal.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{modal.message}</span>
        </div>
      )}
    </div>
  );
}

function LoginForm({ setIsLogin, showModal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return showModal("Preencha todos os campos.", 'error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return showModal("Email inválido.", 'error');
    showModal("Login realizado com sucesso!", 'success');
  };
  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="input-group">
        <Mail className="input-icon" size={20} />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      </div>
      <div className="input-group">
        <Lock className="input-icon" size={20} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required />
      </div>
      <button type="submit" className="btn login-btn"><LogIn size={18} className="mr-1" />Entrar</button>
      <div className="switch-link">
        Não tem uma conta?{' '}
        <button type="button" onClick={() => setIsLogin(false)}>Cadastre-se</button>
      </div>
    </form>
  );
}

function RegisterForm({ setIsLogin, showModal }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return showModal("Preencha todos os campos.", 'error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return showModal("Email inválido.", 'error');
    if (password !== confirmPassword) return showModal("As senhas não coincidem.", 'error');
    showModal("Cadastro realizado com sucesso!", 'success');
  };
  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="input-group">
        <User className="input-icon" size={20} />
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome" required />
      </div>
      <div className="input-group">
        <Mail className="input-icon" size={20} />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      </div>
      <div className="input-group">
        <Lock className="input-icon" size={20} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required />
      </div>
      <div className="input-group">
        <Lock className="input-icon" size={20} />
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar Senha" required />
      </div>
      <button type="submit" className="btn register-btn"><UserPlus size={18} className="mr-1" />Cadastrar</button>
      <div className="switch-link">
        Já tem uma conta?{' '}
        <button type="button" onClick={() => setIsLogin(true)}>Fazer Login</button>
      </div>
    </form>
  );
}