import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Header } from './components/Header';
import { AuthPage } from './components/AuthPage';
import { Main } from './components/Main';
import { Footer } from './components/Footer';
import { theme } from './theme';
import UserGestor from "./components/UserGestor";
import UserRegister from "./components/UserRegister"; // novo componente
import QuestionarioStepper from "./components/QuestionarioStepper";
import ResumoCircunferencia from "./components/ResumoCircunferencia";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  // --- Fluxo original comentado ---
  // const [currentPage, setCurrentPage] = useState('home'); 
  // const [isLoginMode, setIsLoginMode] = useState(true);

  // const handleSwitchToLogin = () => {
  //   setIsLoginMode(true);
  //   setCurrentPage('auth');
  // };

  // const handleSwitchToRegister = () => {
  //   setIsLoginMode(false);
  //   setCurrentPage('auth');
  // };

  // const handleBackToHome = () => {
  //   setCurrentPage('home');
  // };

  // const renderCurrentPage = () => {
  //   switch (currentPage) {
  //     case 'auth':
  //       return (
  //         <AuthPage 
  //           isLoginMode={isLoginMode}
  //           onToggleMode={() => setIsLoginMode(!isLoginMode)}
  //           onBackToHome={handleBackToHome}
  //         />
  //       );
  //     case 'home':
  //     default:
  //       return (
  //         <Main 
  //           onSwitchToLogin={handleSwitchToLogin}
  //           onSwitchToRegister={handleSwitchToRegister}
  //         />
  //       );
  //   }
  // };

  // return (
  //   <ThemeProvider theme={theme}>
  //     <CssBaseline />
  //     <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', flexDirection: 'column', minHeight: '100vh' }}>
  //       {currentPage === 'home' ? (
  //         renderCurrentPage()
  //       ) : (
  //         <>
  //           <Header 
  //             onSwitchToLogin={handleSwitchToLogin}
  //             onSwitchToRegister={handleSwitchToRegister}
  //             onBackToHome={handleBackToHome}
  //           />
  //           <Box sx={{ flex: 1 }}>
  //             {renderCurrentPage()}
  //           </Box>
  //         </>
  //       )}
  //       <Footer />
  //     </Box>
  //   </ThemeProvider>
  // );

  // --- Navegação por estado entre UserGestor e UserRegister ---
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Routes>
            <Route path="/" element={<UserGestor />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/questionario" element={<QuestionarioStepper />} />
            <Route path="/resumo-circunferencia" element={<ResumoCircunferencia />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
