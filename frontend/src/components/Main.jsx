import { Header } from "./Header";
import { Hero } from "./Hero";
import { Carousel } from './Carousel';
import { Values } from './Values';
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

    const scrollToValues = () => {
    const valuesSection = document.querySelector('[data-section="values"]');
    if (valuesSection) {
      valuesSection.scrollIntoView({ 
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
        scrollToCarousel={scrollToCarousel}
        onScrollToValues={scrollToValues}
      /> 
      <Hero 
        onScrollToCarousel={scrollToCarousel}
        onSwitchToRegister={onSwitchToRegister}
      />
      <Carousel />
      <Values />
    </>
  );
}

export { Main };