import Header from './components/Header';
import AuthPage from './components/AuthPage';
import Footer from './components/Footer';
import './App.css'; 
import './index.css'; 

function App() {
  return (
    <div className="main-container">
      <Header />
      <AuthPage />
      <Footer />
    </div>
  );
}

export default App;
