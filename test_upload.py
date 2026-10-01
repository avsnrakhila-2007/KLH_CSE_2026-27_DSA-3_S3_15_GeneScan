import uuid
import json
import urllib.request
import urllib.error

sequence = "ATGCGTACGTA\nGCTAGCTAGCTAGCTAGCTA"
motif = "GCTAGCTA"
boundary = "----WebKitFormBoundary" + uuid.uuid4().hex
content = (
    f"--{boundary}\r\n"
    "Content-Disposition: form-data; name=\"motif\"\r\n\r\n"
    f"{motif}\r\n"
    f"--{boundary}\r\n"
    "Content-Disposition: form-data; name=\"algorithm\"\r\n\r\n"
    "boyerMoore\r\n"
    f"--{boundary}\r\n"
    "Content-Disposition: form-data; name=\"file\"; filename=\"sample.fasta\"\r\n"
    "Content-Type: text/plain\r\n\r\n"
    f">header\n{sequence}\nMore text\r\n"
    f"--{boundary}--\r\n"
).encode("utf-8")

req = urllib.request.Request(
    "http://localhost:8081/api/analyze-file",
    data=content,
    method="POST",
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
)

try:
    with urllib.request.urlopen(req, timeout=20) as response:
        file_result = json.loads(response.read().decode("utf-8"))
except urllib.error.HTTPError as error:
    print(error.read().decode("utf-8"))
    raise

assert file_result["algorithm"] == "boyerMoore"
assert file_result["inputType"] == "FASTA"
assert file_result["sequence"] == sequence.replace("\n", "")

extract_file_request = urllib.request.Request(
    "http://localhost:8081/api/extract-file",
    data=content,
    method="POST",
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
)
with urllib.request.urlopen(extract_file_request, timeout=20) as response:
    extracted_file = json.loads(response.read().decode("utf-8"))
assert extracted_file["sequence"] == sequence.replace("\n", "")
assert extracted_file["fileName"] == "sample.fasta"
assert extracted_file["inputType"] == "FASTA"

extract_text_request = urllib.request.Request(
    "http://localhost:8081/api/extract",
    data=json.dumps({"text": sequence}).encode("utf-8"),
    method="POST",
    headers={"Content-Type": "application/json"},
)
with urllib.request.urlopen(extract_text_request, timeout=20) as response:
    extracted_text = json.loads(response.read().decode("utf-8"))
assert extracted_text["sequence"] == sequence.replace("\n", "")

prose_request = urllib.request.Request(
    "http://localhost:8081/api/extract",
    data=json.dumps({"text": "This is a normal English sentence."}).encode("utf-8"),
    method="POST",
    headers={"Content-Type": "application/json"},
)
try:
    urllib.request.urlopen(prose_request, timeout=20)
    raise AssertionError("Ordinary prose must not be accepted as DNA.")
except urllib.error.HTTPError as error:
    assert error.code == 400
    assert "No meaningful DNA sequence" in error.read().decode("utf-8")

results = {}
for algorithm in ("boyerMoore", "naive"):
    request = urllib.request.Request(
        "http://localhost:8081/api/analyze",
        data=json.dumps({
            "sequence": sequence,
            "motif": motif,
            "algorithm": algorithm,
        }).encode("utf-8"),
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        results[algorithm] = json.loads(response.read().decode("utf-8"))

assert results["boyerMoore"]["matchPositions"] == results["naive"]["matchPositions"]
assert file_result["matchPositions"] == results["boyerMoore"]["matchPositions"]
assert results["boyerMoore"]["algorithm"] == "boyerMoore"
assert results["naive"]["algorithm"] == "naive"
assert results["boyerMoore"]["comparisons"] >= 0
assert results["naive"]["comparisons"] >= 0
print("Upload extraction and both algorithm results passed.")
print(f"Match positions: {results['boyerMoore']['matchPositions']}")
