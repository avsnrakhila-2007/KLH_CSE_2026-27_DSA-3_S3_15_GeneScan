import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { analyzeDNA, extractDNA, extractDNAFile } from "../api";
import "./AnalysisPanel.css";

const SAMPLE_SEQUENCE = "ATGCGTACGTAGCTAGCTAGCTAGCTAGCTA";
const SAMPLE_MOTIF = "GCTAGCTA";
const EMPTY_RESULTS = { boyerMoore: null, naive: null };

const ALGORITHMS = {
  boyerMoore: {
    label: "Boyer–Moore",
    route: "/analysis/boyer-moore",
    button: "Run Boyer–Moore Analysis",
    description: "Right-to-left comparisons with bad-character and good-suffix shifts.",
  },
  naive: {
    label: "Naive String Matching",
    route: "/analysis/naive",
    button: "Run Naive Analysis",
    description: "Left-to-right character comparisons at every possible alignment.",
  },
};

function AlgorithmResult({ result, algorithm, resultsMatch }) {
  const isBoyerMoore = algorithm === "boyerMoore";

  return (
    <section className="results-container dedicated-result">
      <div className="results-heading">
        <div>
          <span>{isBoyerMoore ? "BOYER–MOORE DNA ANALYSIS" : "NAIVE STRING MATCHING"}</span>
          <h3>{ALGORITHMS[algorithm].label} Result</h3>
        </div>
        <div className="success-badge">Analysis complete</div>
      </div>

      <div className="analysis-result-meta">
        <span>Input type: <strong>{result.inputType}</strong></span>
        {result.fileName && <span>File: <strong>{result.fileName}</strong></span>}
        <span>Sequence length: <strong>{result.sequenceLength} bases</strong></span>
        <span>Motif: <strong className="sequence-value">{result.motif}</strong></span>
        <span>Algorithm status: <strong>Completed</strong></span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>SEQUENCE LENGTH</span>
          <strong>{result.sequenceLength}</strong>
          <small>bases</small>
        </div>
        <div className="stat-card">
          <span>MATCHES FOUND</span>
          <strong className="green-value">{result.matchCount}</strong>
          <small>occurrences</small>
        </div>
        <div className="stat-card">
          <span>CHARACTER COMPARISONS</span>
          <strong>{result.comparisons}</strong>
          <small>measured checks</small>
        </div>
        <div className="stat-card">
          <span>SHIFTS</span>
          <strong>{isBoyerMoore ? result.shifts : "N/A"}</strong>
          <small>{isBoyerMoore ? "pattern movements" : "not applicable"}</small>
        </div>
        <div className="stat-card">
          <span>EXECUTION TIME</span>
          <strong>{Number(result.executionTimeMilliseconds).toFixed(6)}</strong>
          <small>milliseconds</small>
        </div>
      </div>

      <div className="result-section">
        <div className="result-section-heading">
          <span>MATCH POSITIONS</span>
          <small>0-indexed</small>
        </div>
        {result.matchPositions.length ? (
          <div className="position-list">
            {result.matchPositions.slice(0, 100).map((position, index) => (
              <div className="position-chip" key={`${position}-${index}`}>
                <span>#{index + 1}</span>
                <strong>{position}</strong>
              </div>
            ))}
            {result.matchPositions.length > 100 && (
              <div className="position-overflow">+{result.matchPositions.length - 100} more positions</div>
            )}
          </div>
        ) : (
          <div className="no-match">No occurrences of the motif were found.</div>
        )}
      </div>

      {isBoyerMoore && (
        <>
          <div className="result-section">
            <div className="result-section-heading">
              <span>BAD CHARACTER TABLE</span>
              <small>Last occurrence</small>
            </div>
            <div className="heuristic-grid">
              {["A", "C", "G", "T"].map((base) => (
                <div className="heuristic-card" key={base}>
                  <strong>{base}</strong>
                  <span>{result.badCharacterTable[base]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="result-section">
            <div className="result-section-heading">
              <span>GOOD SUFFIX TABLE</span>
              <small>Shift values</small>
            </div>
            <div className="suffix-table">
              {result.goodSuffixTable.map((shift, index) => (
                <div className="suffix-cell" key={`${index}-${shift}`}>
                  <span>{index}</span>
                  <strong>{shift}</strong>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {resultsMatch !== null && (
        <div className={resultsMatch ? "verification-banner" : "verification-banner verification-failed"}>
          <strong>{resultsMatch ? "RESULTS VERIFIED" : "ALGORITHM RESULTS DO NOT MATCH"}</strong>
          <span>
            {resultsMatch
              ? "Both algorithms found identical match positions."
              : "The algorithms returned different match positions for the same input."}
          </span>
        </div>
      )}
    </section>
  );
}

function milliseconds(result) {
  return `${Number(result.executionTimeMilliseconds).toFixed(6)} ms`;
}

function ComparisonView({ boyerMoore, naive }) {
  const sameInput = boyerMoore.sequence === naive.sequence && boyerMoore.motif === naive.motif;
  const samePositions = sameInput
    && boyerMoore.matchCount === naive.matchCount
    && boyerMoore.matchPositions.length === naive.matchPositions.length
    && boyerMoore.matchPositions.every((position, index) => position === naive.matchPositions[index]);
  const comparisonsWinner = boyerMoore.comparisons === naive.comparisons
    ? null
    : boyerMoore.comparisons < naive.comparisons ? "Boyer–Moore" : "Naive";
  const boyerTime = Number(boyerMoore.executionTimeNanoseconds);
  const naiveTime = Number(naive.executionTimeNanoseconds);
  const timeClose = Math.abs(boyerTime - naiveTime)
    <= Math.max(10_000, Math.max(boyerTime, naiveTime) * 0.05);
  const timeWinner = timeClose || boyerTime === naiveTime
    ? null
    : boyerTime < naiveTime ? "Boyer–Moore" : "Naive";

  let insight;
  if (comparisonsWinner && timeWinner && comparisonsWinner !== timeWinner) {
    insight = `Performance is mixed for this input: ${comparisonsWinner} used fewer comparisons, while ${timeWinner} had lower measured execution time.`;
  } else if (comparisonsWinner && comparisonsWinner === timeWinner) {
    insight = `For this input, ${comparisonsWinner} used fewer comparisons and had lower measured execution time.`;
  } else if (comparisonsWinner && timeClose) {
    insight = `For this input, ${comparisonsWinner} used fewer comparisons. Execution times are very close; comparison count provides additional evidence.`;
  } else if (comparisonsWinner) {
    insight = `For this input, ${comparisonsWinner} used fewer comparisons; execution times were tied.`;
  } else if (timeWinner) {
    insight = `Comparison counts were equal; measured execution time favored ${timeWinner} for this input.`;
  } else {
    insight = "Both comparison counts and execution times are tied or too close to distinguish a winner for this input.";
  }

  const comparisonMax = Math.max(1, boyerMoore.comparisons, naive.comparisons);
  const timeMax = Math.max(1, boyerTime, naiveTime);
  const rows = [
    ["Match count", boyerMoore.matchCount, naive.matchCount],
    ["Match positions", samePositions ? "SAME" : "DIFFERENT", samePositions ? "SAME" : "DIFFERENT"],
    ["Character comparisons", boyerMoore.comparisons, naive.comparisons],
    ["Execution time", milliseconds(boyerMoore), milliseconds(naive)],
    ["Shifts", boyerMoore.shifts, "N/A"],
    ["Correctness", samePositions ? "PASS" : "FAIL", samePositions ? "PASS" : "FAIL"],
  ];

  return (
    <div className="comparison-view">
      <div className="results-heading">
        <div>
          <span>ALGORITHM COMPARISON</span>
          <h3>Boyer–Moore vs Naive</h3>
        </div>
        <div className={samePositions ? "success-badge" : "comparison-fail-badge"}>
          {samePositions ? "Results match" : "Results differ"}
        </div>
      </div>

      <div className="comparison-facts">
        <div><span>SEQUENCE LENGTH</span><strong>{boyerMoore.sequenceLength} bases</strong></div>
        <div><span>MOTIF</span><strong className="sequence-value">{boyerMoore.motif}</strong></div>
        <div><span>INPUT TYPE</span><strong>{boyerMoore.inputType}</strong></div>
        {boyerMoore.fileName && <div><span>FILE NAME</span><strong>{boyerMoore.fileName}</strong></div>}
      </div>

      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <thead><tr><th>Metric</th><th>Boyer–Moore</th><th>Naive</th></tr></thead>
          <tbody>
            {rows.map(([label, boyerValue, naiveValue]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{boyerValue}</td>
                <td>{naiveValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="metric-comparison-cards">
        <MetricCard
          title="CHARACTER COMPARISONS"
          boyerValue={`${boyerMoore.comparisons}`}
          naiveValue={`${naive.comparisons}`}
          boyerPercent={boyerMoore.comparisons / comparisonMax * 100}
          naivePercent={naive.comparisons / comparisonMax * 100}
        />
        <MetricCard
          title="EXECUTION TIME"
          boyerValue={milliseconds(boyerMoore)}
          naiveValue={milliseconds(naive)}
          boyerPercent={boyerTime / timeMax * 100}
          naivePercent={naiveTime / timeMax * 100}
        />
        <div className="metric-card">
          <span>BOYER–MOORE SHIFTS</span>
          <strong>{boyerMoore.shifts}</strong>
          <small>Naive advances one alignment at a time; shifts are not reported.</small>
        </div>
      </div>

      <div className="algorithm-summary recommendation-summary">
        <div className="summary-icon">↗</div>
        <div>
          <span>GENESCAN PERFORMANCE INSIGHT</span>
          <strong>{insight}</strong>
          <p>
            Uses measured comparisons first and execution time as supporting evidence.
            {timeClose && " Execution times are very close for this input."}
            {` Boyer–Moore completed ${boyerMoore.shifts} shifts.`}
          </p>
        </div>
      </div>

      <div className="complexity-note">
        <span>THEORETICAL COMPLEXITY</span>
        <p>Naive: O(n × m) worst case.</p>
        <p>Boyer–Moore: often sublinear in practice; actual shifts depend on its heuristics.</p>
      </div>

      {!samePositions && (
        <div className="analysis-error">Correctness check failed: the algorithms returned different positions.</div>
      )}
    </div>
  );
}

function MetricCard({ title, boyerValue, naiveValue, boyerPercent, naivePercent }) {
  return (
    <div className="metric-card">
      <span>{title}</span>
      <div className="metric-bar-row">
        <small>Boyer–Moore</small><strong>{boyerValue}</strong>
      </div>
      <div className="metric-track"><i style={{ width: `${boyerPercent}%` }} /></div>
      <div className="metric-bar-row">
        <small>Naive</small><strong>{naiveValue}</strong>
      </div>
      <div className="metric-track naive-track"><i style={{ width: `${naivePercent}%` }} /></div>
    </div>
  );
}

function AnalysisPanel() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sourceText, setSourceText] = useState(SAMPLE_SEQUENCE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [motif, setMotif] = useState(SAMPLE_MOTIF);
  const [analysis, setAnalysis] = useState(null);
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const activeView = pathname === "/analysis"
    ? "analysis"
    : pathname.endsWith("/boyer-moore")
      ? "boyerMoore"
      : pathname.endsWith("/naive")
        ? "naive"
        : "comparison";
  const validMotif = motif.length > 0 && [...motif].every((character) => "ACGT".includes(character));
  const inputReady = Boolean(analysis) && validMotif;
  const boyerMooreResult = results.boyerMoore;
  const naiveResult = results.naive;
  const bothComplete = Boolean(boyerMooreResult && naiveResult);
  const resultsMatch = bothComplete
    ? boyerMooreResult.sequence === naiveResult.sequence
      && boyerMooreResult.motif === naiveResult.motif
      && boyerMooreResult.matchCount === naiveResult.matchCount
      && boyerMooreResult.matchPositions.length === naiveResult.matchPositions.length
      && boyerMooreResult.matchPositions.every((position, index) => position === naiveResult.matchPositions[index])
    : null;
  const completedCount = Number(Boolean(boyerMooreResult)) + Number(Boolean(naiveResult));
  const remainingAlgorithm = boyerMooreResult ? "naive" : "boyerMoore";

  useEffect(() => {
    if (activeView !== "analysis" && (!analysis || !validMotif)) {
      navigate("/analysis", { replace: true });
    }
    if (activeView === "comparison" && !bothComplete) {
      navigate("/analysis", { replace: true });
    }
  }, [activeView, analysis, validMotif, bothComplete, navigate]);

  const clearResults = () => setResults(EMPTY_RESULTS);

  const handleSourceTextChange = (value) => {
    setSourceText(value);
    setSelectedFile(null);
    setAnalysis(null);
    clearResults();
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
    setAnalysis(null);
    clearResults();
    setError("");
  };

  const handleMotifChange = (value) => {
    setMotif(value.toUpperCase());
    clearResults();
    setError("");
    if (pathname === "/analysis/comparison") navigate("/analysis");
  };

  const extractInput = async () => {
    setError("");
    if (!selectedFile && !sourceText.trim()) {
      setError("Paste DNA text or choose a file first.");
      return;
    }
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setError("Files must be 10 MB or smaller.");
      return;
    }

    setLoading("extract");
    try {
      const extracted = selectedFile
        ? await extractDNAFile(selectedFile)
        : await extractDNA(sourceText);
      setAnalysis({ ...extracted, sourceText, fileName: extracted.fileName || "" });
      clearResults();
    } catch (requestError) {
      setAnalysis(null);
      setError(requestError.message || "Unable to extract DNA from this input.");
    } finally {
      setLoading("");
    }
  };

  const executeAlgorithm = async (algorithm, navigateAfter = false) => {
    if (!analysis) {
      setError("Extract and validate DNA before running an algorithm.");
      return;
    }
    if (!validMotif) {
      setError("The motif must contain only A, C, G, and T.");
      return;
    }

    setError("");
    setLoading(algorithm);
    try {
      const result = await analyzeDNA(analysis.sequence, motif, algorithm, {
        inputType: analysis.inputType,
        fileName: analysis.fileName,
      });
      setResults((current) => ({
        ...current,
        [algorithm]: {
          ...result,
          inputType: result.inputType === "DIRECT" ? "Direct input" : result.inputType,
          fileName: result.fileName || analysis.fileName,
        },
      }));
      if (navigateAfter) navigate(ALGORITHMS[algorithm].route);
    } catch (requestError) {
      setError(requestError.message || "Unable to complete DNA analysis.");
    } finally {
      setLoading("");
    }
  };

  const selectAlgorithm = async (algorithm) => {
    if (!inputReady) {
      setError(analysis ? "Enter a valid DNA motif before continuing." : "Extract and validate DNA first.");
      if (pathname !== "/analysis") navigate("/analysis");
      return;
    }
    navigate(ALGORITHMS[algorithm].route);
    if (!results[algorithm]) await executeAlgorithm(algorithm);
  };

  const runRemainingAlgorithm = () => executeAlgorithm(remainingAlgorithm);

  return (
    <div className="app workspace-app">
      <div className="page-glow" />
      <header className="workspace-header">
        <Link className="workspace-brand" to="/">
          <span className="brand-symbol">🧬</span>
          <span><strong>Gene<span>Scan</span></strong><small>DNA SEQUENCE ANALYSIS</small></span>
        </Link>
        <Link className="workspace-home-link" to="/">Back to dashboard</Link>
      </header>

      <div className="workspace-shell">
        <aside className="workspace-sidebar">
          <span className="workspace-sidebar-label">ANALYSIS WORKSPACE</span>
          <nav className="workspace-nav" aria-label="Analysis workspace">
            <button
              type="button"
              className={activeView === "analysis" ? "workspace-nav-item active" : "workspace-nav-item"}
              aria-current={activeView === "analysis" ? "page" : undefined}
              onClick={() => navigate("/analysis")}
            >
              <span className="workspace-nav-mark">{analysis ? "✓" : "01"}</span>
              <span>Analysis</span>
            </button>
            <button
              type="button"
              className={activeView === "boyerMoore" ? "workspace-nav-item active" : "workspace-nav-item"}
              aria-current={activeView === "boyerMoore" ? "page" : undefined}
              disabled={!inputReady}
              onClick={() => selectAlgorithm("boyerMoore")}
            >
              <span className="workspace-nav-mark">{boyerMooreResult ? "✓" : "02"}</span>
              <span>Boyer–Moore</span>
            </button>
            <button
              type="button"
              className={activeView === "naive" ? "workspace-nav-item active" : "workspace-nav-item"}
              aria-current={activeView === "naive" ? "page" : undefined}
              disabled={!inputReady}
              onClick={() => selectAlgorithm("naive")}
            >
              <span className="workspace-nav-mark">{naiveResult ? "✓" : "03"}</span>
              <span>Naive</span>
            </button>
            <button
              type="button"
              className={activeView === "comparison" ? "workspace-nav-item active" : "workspace-nav-item"}
              aria-current={activeView === "comparison" ? "page" : undefined}
              disabled={!bothComplete}
              onClick={() => navigate("/analysis/comparison")}
            >
              <span className="workspace-nav-mark">{bothComplete ? "✓" : "04"}</span>
              <span>Comparison</span>
            </button>
          </nav>
          <div className="workspace-sidebar-status">
            <span className={inputReady ? "status-dot ready" : "status-dot"} />
            {completedCount} of 2 algorithms completed
          </div>
        </aside>

        <main className="workspace-main">
          {error && <div className="analysis-error"><span>!</span>{error}</div>}

          {activeView === "analysis" && (
            <section className="workspace-screen">
              <div className="workspace-screen-heading">
                <span>01 / DNA INPUT</span>
                <h1>Analysis</h1>
                <p>Provide DNA text or upload a document. GeneScan extracts and previews the validated sequence before search.</p>
              </div>

              <div className="analysis-input-grid workspace-input-grid">
                <div className="input-card">
                  <div className="input-card-header">
                    <label htmlFor="dna-sequence">DNA SOURCE</label>
                    <span>PASTE OR TYPE</span>
                  </div>
                  <textarea
                    id="dna-sequence"
                    value={sourceText}
                    onChange={(event) => handleSourceTextChange(event.target.value)}
                    placeholder="Paste DNA sequence, multiline DNA, or text containing a DNA sequence..."
                    spellCheck="false"
                  />
                  <div className="file-upload workspace-file-upload">
                    <label htmlFor="dna-file">Or upload a file</label>
                    <input
                      ref={fileInputRef}
                      id="dna-file"
                      type="file"
                      accept=".txt,.pdf,.doc,.docx,.fasta,.fa,.fna,.seq,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
                    />
                    <p>Accepted: TXT, PDF, DOC, DOCX</p>
                    {selectedFile && <div className="selected-file">{selectedFile.name}</div>}
                  </div>
                </div>

                <div className="input-card motif-card">
                  <div className="input-card-header">
                    <label htmlFor="dna-motif">DNA MOTIF / PATTERN</label>
                    <span>A / C / G / T</span>
                  </div>
                  <input
                    id="dna-motif"
                    type="text"
                    value={motif}
                    onChange={(event) => handleMotifChange(event.target.value)}
                    placeholder="Example: GCTAGCTA"
                    spellCheck="false"
                  />
                  <div className="motif-preview">
                    {motif
                      ? motif.split("").map((character, index) => <span key={`${character}-${index}`}>{character}</span>)
                      : <span className="empty-motif">Enter a motif</span>}
                  </div>
                  {motif && !validMotif && <p className="motif-validation">Use only A, C, G, and T.</p>}
                </div>
              </div>

              <button
                className="analyze-button extract-button"
                type="button"
                onClick={extractInput}
                disabled={loading === "extract"}
              >
                {loading === "extract" ? <><span className="button-spinner" />Extracting DNA...</> : "Extract and Validate DNA"}
              </button>

              {analysis && (
                <div className="extraction-preview">
                  <div className="results-heading">
                    <div>
                      <span>DNA EXTRACTION COMPLETE</span>
                      <h3>Extracted DNA</h3>
                    </div>
                    <div className="success-badge">Validated</div>
                  </div>
                  <div className="extraction-facts">
                    <div><span>INPUT TYPE</span><strong>{analysis.inputType === "DIRECT" ? "Direct input" : analysis.inputType}</strong></div>
                    {analysis.fileName && <div><span>FILE NAME</span><strong>{analysis.fileName}</strong></div>}
                    <div><span>SEQUENCE LENGTH</span><strong>{analysis.sequenceLength} bases</strong></div>
                  </div>
                  <textarea className="extracted-sequence" value={analysis.sequence} readOnly aria-label="Extracted DNA sequence" />
                  <div className="analysis-actions">
                    <span>Choose an algorithm to run on this exact sequence and motif.</span>
                    <div>
                      <button type="button" onClick={() => selectAlgorithm("boyerMoore")} disabled={!validMotif || Boolean(loading)}>
                        {ALGORITHMS.boyerMoore.button}
                      </button>
                      <button type="button" onClick={() => selectAlgorithm("naive")} disabled={!validMotif || Boolean(loading)}>
                        {ALGORITHMS.naive.button}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {(activeView === "boyerMoore" || activeView === "naive") && (
            <section className="workspace-screen">
              <div className="workspace-screen-heading">
                <span>{activeView === "boyerMoore" ? "02 / BOYER–MOORE" : "03 / NAIVE STRING MATCHING"}</span>
                <h1>{activeView === "boyerMoore" ? "Boyer–Moore DNA Analysis" : "Naive String Matching"}</h1>
                <p>Running against the extracted DNA sequence and motif retained from Analysis.</p>
              </div>

              {loading && <div className="workspace-loading"><span className="button-spinner" />Running {ALGORITHMS[loading].label} on the retained input...</div>}

              {!loading && activeView === "boyerMoore" && !boyerMooreResult && (
                <button className="analyze-button" type="button" onClick={() => executeAlgorithm("boyerMoore")}>
                  {ALGORITHMS.boyerMoore.button}
                </button>
              )}
              {!loading && activeView === "naive" && !naiveResult && (
                <button className="analyze-button" type="button" onClick={() => executeAlgorithm("naive")}>
                  {ALGORITHMS.naive.button}
                </button>
              )}

              {boyerMooreResult && (
                <AlgorithmResult result={boyerMooreResult} algorithm="boyerMoore" resultsMatch={resultsMatch} />
              )}
              {naiveResult && (
                <AlgorithmResult result={naiveResult} algorithm="naive" resultsMatch={resultsMatch} />
              )}

              {completedCount === 1 && !loading && (
                <div className="remaining-prompt">
                  <div>
                    <strong>REMAINING ALGORITHM</strong>
                    <p>{ALGORITHMS[remainingAlgorithm].label} will use the same extracted sequence and motif. No re-upload is needed.</p>
                  </div>
                  <button type="button" onClick={runRemainingAlgorithm}>
                    {`Run ${remainingAlgorithm === "naive" ? "Naive" : "Boyer–Moore"} Analysis`}
                  </button>
                </div>
              )}

              {bothComplete && (
                <div className="verification-banner">
                  <strong>{resultsMatch ? "RESULTS VERIFIED" : "ALGORITHM RESULTS DO NOT MATCH"}</strong>
                  <span>{resultsMatch ? "Both algorithms found identical match positions." : "Review both result sets; their positions differ."}</span>
                </div>
              )}
            </section>
          )}

          {activeView === "comparison" && bothComplete && (
            <section className="workspace-screen">
              <div className="workspace-screen-heading">
                <span>04 / MEASURED RESULTS</span>
                <h1>Comparison</h1>
                <p>Both algorithms ran with the same extracted sequence and motif.</p>
              </div>
              <ComparisonView boyerMoore={boyerMooreResult} naive={naiveResult} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AnalysisPanel;