import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <main className="about-page">
      <div className="about-container">
        <Link to="/" className="about-back-link">
          ← Back to home
        </Link>

        <header className="about-header">
          <span className="about-eyebrow">
            A LITTLE ABOUT ME
          </span>

          <h1>
            I'm a developer who loves
            <span> understanding how things work.</span>
          </h1>

          <p className="about-intro">
            I'm Siva, a software developer exploring how
            ideas turn into useful software. I enjoy building
            projects, solving technical problems, and
            understanding the engineering decisions behind
            the applications we use every day.
          </p>
        </header>

        <section className="about-section">
          <h2>My journey</h2>

          <p>
            My journey into software development started
            with computer science and grew through hands-on
            projects. I use projects as a way to understand
            concepts beyond tutorials and to discover how
            different parts of an application work together.
          </p>

          <p>
            I enjoy working across the stack, from designing
            interfaces with React to building APIs with
            Node.js and working with MongoDB. I'm also
            interested in backend architecture, system design,
            and the engineering trade-offs involved in
            building reliable software.
          </p>
        </section>

        <section className="about-section">
          <h2>What I'm exploring</h2>

          <ul className="about-list">
            <li>
              <span>01</span>
              <div>
                <strong>Full-stack development</strong>
                <p>
                  Building complete applications with React,
                  Node.js, Express, and MongoDB.
                </p>
              </div>
            </li>

            <li>
              <span>02</span>
              <div>
                <strong>Backend engineering</strong>
                <p>
                  Understanding APIs, databases, caching,
                  authentication, and system design.
                </p>
              </div>
            </li>

            <li>
              <span>03</span>
              <div>
                <strong>AI engineering</strong>
                <p>
                  Exploring how AI models and tools can
                  become useful features in real products.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="about-section about-why">
          <h2>Why I write</h2>

          <p>
            Writing helps me turn what I learn into something
            I can explain clearly. When I solve a difficult
            bug or understand a new concept, I want to
            document the process — not just the final answer.
          </p>

          <p>
            This blog is my public developer journal. It
            captures what I build, what I learn, what goes
            wrong, and how my understanding improves over time.
          </p>

          <Link to="/" className="about-writing-link">
            Explore my writing ↗
          </Link>
        </section>
      </div>
    </main>
  );
}

export default About;