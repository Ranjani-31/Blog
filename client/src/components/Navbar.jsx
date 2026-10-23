import "./Navbar.css";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        &lt; / &gt;<span>.</span>
      </Link>

      <nav className="navbar-links">
        
        <Link to="/about">About</Link>
        <a href="https://github.com/Ranjani-31" target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}

export default Navbar;
