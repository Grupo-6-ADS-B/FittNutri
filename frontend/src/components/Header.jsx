import logo from '/logo.jpg'; 

function Header() {
  return (
    <header className="main-header">
      <div className="logo">
        <img src={logo} alt="FittNutri Logo" />
        <span>FittNutri</span>
        <p>Software para nutricionistas</p>
      </div>
      <nav className="main-nav">
        <ul>
          <li><a href="#">Funcionalidades</a></li>
          <li><a href="#">Sobre</a></li>
          <li><a href="#">Fale conosco</a></li>
        </ul>
      </nav>
      <div className="header-buttons">
        <button className="btn-login">Entrar</button>
        <button className="btn-register">Cadastrar</button>
      </div>
    </header>
  );
}

export default Header;
