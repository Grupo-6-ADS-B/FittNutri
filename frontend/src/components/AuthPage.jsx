import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  const modeClass = isLoginMode ? 'login-mode' : 'register-mode';

  return (
    <div className={`app-container ${modeClass}`}>
      <div className="wrapper">
        <div className="form-header">
          <div className="titles">
            <div className="title-login">Login</div>
            <div className="title-register">Cadastro</div>
          </div>
        </div>
        
        {isLoginMode ? (
          <LoginForm onSwitchToRegister={handleToggleMode} />
        ) : (
          <RegisterForm onSwitchToLogin={handleToggleMode} />
        )}
      </div>
    </div>
  );
}

export default AuthPage;
