import "./App.css";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AnalysisPanel from "./components/AnalysisPanel";

function DNAHelix({ className }) {
  return (
    <svg
      className={`dna-decoration ${className}`}
      viewBox="0 0 120 360"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path
        d="M22 10 C100 55 100 85 22 125 C-5 140 -5 175 22 190 C100 235 100 265 22 305"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      <path
        d="M98 10 C20 55 20 85 98 125 C125 140 125 175 98 190 C20 235 20 265 98 305"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      <g stroke="currentColor" strokeWidth="2.2" opacity="0.55">
        <line x1="34" y1="30" x2="86" y2="30" />
        <line x1="26" y1="68" x2="94" y2="68" />
        <line x1="22" y1="106" x2="98" y2="106" />
        <line x1="24" y1="144" x2="96" y2="144" />
        <line x1="32" y1="180" x2="88" y2="180" />
        <line x1="24" y1="218" x2="96" y2="218" />
        <line x1="22" y1="256" x2="98" y2="256" />
        <line x1="28" y1="294" x2="92" y2="294" />
      </g>
    </svg>
  );
}

function AlgorithmBadge() {
  return (
    <div className="floating-badge algorithm-badge">
      <div className="badge-icon">ϟ</div>

      <div>
        <small>ALGORITHM</small>
        <strong>Boyer–Moore</strong>
      </div>
    </div>
  );
}

function PerformanceBadge() {
  return (
    <div className="floating-badge performance-badge">
      <div className="performance-bars">
        <span />
        <span />
        <span />
      </div>

      <strong className="performance-value">96.5%</strong>

      <div className="performance-copy">
        <small>FEWER COMPARISONS</small>
        <span>vs Naïve Search</span>
      </div>
    </div>
  );
}

function HeroAnalysisCard({ onAnalyze }) {
  return (
    <div className="hero-analysis-card">
      <div className="hero-card-header">
        <div>
          <span className="live-sequence">LIVE SEQUENCE</span>

          <h2>
            DNA Pattern <span>Analysis</span>
          </h2>
        </div>

        <div className="ready-indicator">
          <i />
          Ready
        </div>
      </div>

      <div className="sequence-preview">
        <div className="sequence-line">
          <b>01</b>
          <span>ATGCGTAC</span>
          <mark>GTAGCTAG</mark>
          <span>CTAGCTAG</span>
        </div>

        <div className="sequence-line">
          <b>02</b>
          <span>GCTAGCAT</span>
          <mark>GCTAGCTA</mark>
          <span>GATCGTAC</span>
        </div>

        <div className="sequence-line">
          <b>03</b>
          <span>TAGCTAGC</span>
          <span>TAGCTACG</span>
          <mark>GCTAGCTA</mark>
        </div>

        <div className="sequence-line">
          <b>04</b>
          <span>CGATCGTA</span>
          <span>CGTAGCTA</span>
          <span>GATCGATC</span>
        </div>
      </div>

      <div className="match-result">
        <div className="success-icon">✓</div>

        <div className="match-copy">
          <small>PATTERN DETECTED</small>
          <strong>GCTAGCTA</strong>
        </div>

        <div className="match-count">
          <strong>03</strong>
          <span>MATCHES</span>
        </div>
      </div>

      <div className="hero-controls">
        <button type="button">← Previous</button>

        <button
          type="button"
          className="hero-play"
          onClick={onAnalyze}
        >
          ▶ Play
        </button>

        <button
          type="button"
          onClick={onAnalyze}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const goToAnalysis = () => navigate("/analysis");

  return (
    <div className="app">

      <div className="page-glow" />

      <DNAHelix className="dna-left" />
      <DNAHelix className="dna-right" />

      <div className="particle p1" />
      <div className="particle p2" />
      <div className="particle p3" />
      <div className="particle p4" />


      {/* ================= NAVBAR ================= */}

      <header className="navbar">

        <div className="brand">
          <div className="brand-symbol">🧬</div>

          <div>
            <div className="brand-name">
              Gene<span>Scan</span>
            </div>

            <div className="brand-subtitle">
              DNA SEQUENCE ANALYSIS TOOL
            </div>
          </div>
        </div>


        <nav className="navigation">

          <a href="#home">Home</a>

          <Link to="/analysis">Analyze</Link>

          <a href="#algorithm">Boyer–Moore</a>

          <a href="#comparison">Comparison</a>

          <a href="#applications">Applications</a>

        </nav>


        <button
          type="button"
          className="nav-button"
          onClick={goToAnalysis}
        >
          Start Analysis
        </button>

      </header>


      {/* ================= HERO ================= */}

      <main>

        <section className="hero" id="home">

          <div className="hero-content">

            <div className="hero-eyebrow">
              <span />
              BOYER–MOORE STRING MATCHING
            </div>


            <h1>
              Analyze DNA.
              <br />
              <span>Find Patterns Faster.</span>
            </h1>


            <p>
              GeneScan is a DNA sequence analysis platform
              built around the Boyer–Moore string matching
              algorithm. Search motifs, inspect matches,
              measure comparisons and visualize the algorithm.
            </p>


            <div className="hero-buttons">

              <button
                type="button"
                className="primary-action"
                onClick={goToAnalysis}
              >
                Start DNA Analysis
                <span>→</span>
              </button>


              <a
                className="secondary-action"
                href="#algorithm"
              >
                Learn Boyer–Moore
              </a>

            </div>


            <div className="hero-stats">

              <div>
                <strong>01</strong>
                <span>DNA Input</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Motif Search</span>
              </div>

              <div>
                <strong>03</strong>
                <span>DSA Trace</span>
              </div>

              <div>
                <strong>04</strong>
                <span>Performance</span>
              </div>

            </div>

          </div>


          {/* ================= HERO VISUAL ================= */}

          <div className="hero-visual">

            <AlgorithmBadge />

            <HeroAnalysisCard onAnalyze={goToAnalysis} />

            <PerformanceBadge />

          </div>

        </section>


        {/* ================= ALGORITHM ================= */}

        <section
          className="site-section"
          id="algorithm"
        >

          <div className="section-heading">

            <span>02 / DSA CORE</span>

            <h2>
              Understand the
              <strong> algorithm.</strong>
            </h2>

            <p>
              GeneScan exposes the internal mechanics of
              Boyer–Moore rather than hiding them.
            </p>

          </div>


          <div className="algorithm-grid">

            <article>
              <span>01</span>

              <h3>
                Right → Left
              </h3>

              <p>
                Boyer–Moore compares the pattern starting
                from its rightmost character.
              </p>

              <code>
                P[m-1] → P[m-2] → ... → P[0]
              </code>
            </article>


            <article>
              <span>02</span>

              <h3>
                Bad Character
              </h3>

              <p>
                A mismatching character can allow the
                pattern to jump several positions.
              </p>

              <code>
                shift = j - lastOccurrence(c)
              </code>
            </article>


            <article>
              <span>03</span>

              <h3>
                Good Suffix
              </h3>

              <p>
                A suffix already matched can be reused
                to avoid unnecessary comparisons.
              </p>

              <code>
                suffixShift = goodSuffix[j + 1]
              </code>
            </article>


            <article>
              <span>04</span>

              <h3>
                Performance
              </h3>

              <p>
                GeneScan records comparisons, shifts,
                matches and execution time.
              </p>

              <code>
                comparisons • shifts • time
              </code>
            </article>

          </div>

        </section>


        {/* ================= COMPARISON ================= */}

        <section
          className="site-section"
          id="comparison"
        >

          <div className="section-heading">

            <span>03 / EXPERIMENT</span>

            <h2>
              Boyer–Moore
              <strong> vs Naïve.</strong>
            </h2>

            <p>
              Run both algorithms on the same sequence and
              motif and inspect their measured behavior.
            </p>

          </div>


          <div className="comparison-cards">

            <div className="comparison-card active-card">

              <small>ALGORITHM A</small>

              <h3>
                Boyer–Moore
              </h3>

              <div>
                <span>Comparison direction</span>
                <strong>Right → Left</strong>
              </div>

              <div>
                <span>Heuristics</span>
                <strong>
                  Bad Character + Good Suffix
                </strong>
              </div>

            </div>


            <div className="vs-circle">
              VS
            </div>


            <div className="comparison-card">

              <small>ALGORITHM B</small>

              <h3>
                Naïve Search
              </h3>

              <div>
                <span>Comparison direction</span>
                <strong>Left → Right</strong>
              </div>

              <div>
                <span>Shifting</span>
                <strong>
                  One position at a time
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= APPLICATIONS ================= */}

        <section
          className="site-section"
          id="applications"
        >

          <div className="section-heading">

            <span>04 / USE CASES</span>

            <h2>
              Where sequence
              <strong> searching is useful.</strong>
            </h2>

          </div>


          <div className="applications-grid">

            <article>
              <span>01</span>
              <h3>Mutation Detection</h3>
              <p>
                Search DNA for predefined nucleotide motifs
                associated with mutation analysis.
              </p>
            </article>


            <article>
              <span>02</span>
              <h3>Genome Comparison</h3>
              <p>
                Locate common sequence patterns across
                biological datasets.
              </p>
            </article>


            <article>
              <span>03</span>
              <h3>Disease Marker Search</h3>
              <p>
                Search genomic sequences for known
                sequence markers.
              </p>
            </article>


            <article>
              <span>04</span>
              <h3>CRISPR Guide Search</h3>
              <p>
                Demonstrate rapid pattern searching within
                long DNA sequences.
              </p>
            </article>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div>
          <strong>
            🧬 GeneScan
          </strong>

          <span>
            DNA Sequence Analysis Tool
          </span>
        </div>

        <p>
          Powered by Boyer–Moore String Matching
        </p>

        <small>
          DSA3 Project
        </small>

      </footer>

    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/analysis/*" element={<AnalysisPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;