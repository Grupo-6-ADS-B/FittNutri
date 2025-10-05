import { Container } from  '@mui/material';
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Carousel } from './Carousel';
function Main({ onSwitchToLogin, onSwitchToRegister }) {
  const scrollToCarousel = () => {
    const carouselSection = document.querySelector('[data-section="carousel"]');
    if (carouselSection) {
      carouselSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      <Header 
        onSwitchToLogin={onSwitchToLogin}
        onSwitchToRegister={onSwitchToRegister}
      /> 
      <Hero 
        onScrollToCarousel={scrollToCarousel}
        onSwitchToRegister={onSwitchToRegister}
      />
      <Carousel />
    </>
  );
}

export { Main };