const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function fetchApi(path, options) {
  try {
    return await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot reach the GeneScan server. Start the Java server on port 8081 and try again."
      );
    }

    throw error;
  }
}

async function readResponse(response, fallbackMessage) {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The Java server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }

  return data;
}

export async function checkServerHealth() {
  const response = await fetchApi("/health");

  return readResponse(response, "GeneScan Java server is not available.");
}

export async function extractDNA(text) {
  const response = await fetchApi("/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  return readResponse(response, "DNA extraction failed.");
}

export async function extractDNAFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchApi("/extract-file", {
    method: "POST",
    body: formData,
  });

  return readResponse(response, "DNA file extraction failed.");
}

export async function analyzeDNA(sequence, motif, algorithm = "boyerMoore", metadata = {}) {
  const cleanMotif = motif
    .replace(/\s+/g, "")
    .toUpperCase()
    .trim();

  const response = await fetchApi("/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sequence,
      motif: cleanMotif,
      algorithm,
      inputType: metadata.inputType,
      fileName: metadata.fileName,
    }),
  });

  return readResponse(response, "DNA analysis failed.");
}

export async function analyzeDNAFile(file, motif, algorithm = "boyerMoore") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("motif", motif.replace(/\s+/g, "").toUpperCase().trim());
  formData.append("algorithm", algorithm);

  const response = await fetchApi("/analyze-file", {
    method: "POST",
    body: formData,
  });

  return readResponse(response, "DNA file analysis failed.");
}

