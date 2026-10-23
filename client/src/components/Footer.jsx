import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
               &lt; / &gt;<span>.</span>
            </Link>

            <p>
              Building, learning, and sharing.
              <br />
              One article at a time.
            </p>
          </div>

          <nav className="footer-links" aria-label="Footer">
            <Link to="/">Writing</Link>
            <Link to="/about">About</Link>

            <a
              href="https://github.com/Ranjani-31"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>
            © {currentYear} &lt; / &gt; . All rights reserved.
          </span>

          <span>Made with curiosity.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;