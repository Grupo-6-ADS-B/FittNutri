function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-content">
        <p>FittNUtri, software para nutricionistas &copy; {currentYear}</p>
      </div>
    </footer>
  );
}

export default Footer;
