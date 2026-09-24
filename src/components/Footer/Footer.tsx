import "./Footer.css";

interface FooterProps {
  lang: string;
}

export default function Footer({ lang }: FooterProps) {
  const isEnglish = lang === "en";

  const text = {
    home: isEnglish ? "Home" : "მთავარი",
    about: isEnglish ? "About us" : "ჩვენ შესახებ",
    services: isEnglish ? "Services" : "სერვისები",
    ads: isEnglish ? "Advertising" : "რეკლამა",
    disclaimer: isEnglish
      ? "The information published on the website is protected by copyright."
      : "ვებგვერდზე განთავსებული ინფორმაცია დაცულია საავტორო უფლებებით.",
    termsOfUse: isEnglish
      ? "Terms of use"
      : "მოხმარების წესები",
    address: isEnglish
      ? "Tbilisi, Georgia"
      : "თბილისი, საქართველო",
    copyright: isEnglish
      ? "© IPN — InterPressNews"
      : "© IPN — ინტერპრესნიუსი",
  };

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-left">
          <nav className="footer-nav">
            <a href="#">{text.home}</a>

            <span className="divider">|</span>

            <a href="#">{text.about}</a>

            <span className="divider">|</span>

            <a href="#">{text.services}</a>

            <span className="divider">|</span>

            <a href="#">{text.ads}</a>
          </nav>

          <p className="footer-disclaimer">
            {text.disclaimer}
            <br />
            {text.termsOfUse}
          </p>
        </div>

        <div className="footer-middle">
          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <span>{text.address}</span>
          </div>

          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <span>(+995 32) 2 38 78 00</span>
          </div>

          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <span>ipnnews@ipn.ge</span>
          </div>
        </div>

        <div className="footer-right">
          <div className="partner-logo">
            <span className="logo-placeholder">
              <img
                src="/topge.png"
                alt="Top logo"
              />
            </span>
          </div>

          <p className="copyright-text">
            {text.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}