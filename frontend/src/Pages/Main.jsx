import { Hero } from "../components/Hero";
import { Carousel } from '../components/Carousel';
import { Values } from '../components/Values';
import { Avaliation } from "../components/Avaliation";
import { ContactForm } from "../components/ContactForm";
import { Footer } from '../components/Footer';
function Main() {

  return (
    <>
      <Hero />  
      <Carousel />
      <Values />
      <Avaliation />
      <ContactForm  />
      <Footer />

    </>
  );
}

export { Main };