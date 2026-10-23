import "./Hero.css";

function Hero() {
  return (
    <section className="hero" id="about">
      <div className="hero-content">
        <span className="hero-eyebrow">
          SOFTWARE DEVELOPER · BUILDER · LEARNER
        </span>

        <h1>
          I build things,
          <br />
          understand how they work,
          <br />
          and <span>write about it.</span>
        </h1>

        <p className="hero-description">
          I'm a developer exploring the world of software
          engineering. This is where I document the projects
          I build, the concepts I learn, the problems I solve,
          and the lessons I discover along the way.
        </p>

        <div className="hero-actions">
          <a href="#writing" className="hero-primary-btn">
            Explore my writing <span>↓</span>
          </a>

          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="hero-secondary-btn"
          >
            GitHub ↗
          </a>
        </div>
      </div>

      
    </section>
  );
}

export default Hero;