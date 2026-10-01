import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class AnalysisResult {

    private final String sequence;
    private final String motif;
    private final NaiveSearch.SearchResult naiveResult;
    private final BoyerMoore.SearchResult boyerMooreResult;
    private final int[] badCharacterTable;
    private final int[] goodSuffixTable;
    private final boolean resultsMatch;
    private final String error;
    private final String inputType;
    private final String extractedSequence;

    public AnalysisResult(
            String sequence,
            String motif,
            NaiveSearch.SearchResult naiveResult,
            BoyerMoore.SearchResult boyerMooreResult,
            int[] badCharacterTable,
            int[] goodSuffixTable,
            boolean resultsMatch,
            String error,
            String inputType,
            String extractedSequence
    ) {
        this.sequence = sequence;
        this.motif = motif;
        this.naiveResult = naiveResult;
        this.boyerMooreResult = boyerMooreResult;
        this.badCharacterTable = badCharacterTable;
        this.goodSuffixTable = goodSuffixTable;
        this.resultsMatch = resultsMatch;
        this.error = error;
        this.inputType = inputType;
        this.extractedSequence = extractedSequence;
    }

    public String getSequence() {
        return sequence;
    }

    public String getMotif() {
        return motif;
    }

    public NaiveSearch.SearchResult getNaiveResult() {
        return naiveResult;
    }

    public BoyerMoore.SearchResult getBoyerMooreResult() {
        return boyerMooreResult;
    }

    public boolean isResultsMatch() {
        return resultsMatch;
    }

    public String getError() {
        return error;
    }

    public String getInputType() {
        return inputType;
    }

    public String getExtractedSequence() {
        return extractedSequence;
    }

    public String toJson() {
        StringBuilder json = new StringBuilder();

        json.append("{");

        json.append("\"sequence\":\"")
                .append(escapeJson(sequence))
                .append("\",");

        json.append("\"sequenceLength\":")
                .append(sequence.length())
                .append(",");

        json.append("\"motif\":\"")
                .append(escapeJson(motif))
                .append("\",");

        if (inputType != null) {
            json.append("\"inputType\":\"")
                    .append(escapeJson(inputType))
                    .append("\",");
        }

        if (extractedSequence != null) {
            json.append("\"extractedSequence\":\"")
                    .append(escapeJson(extractedSequence))
                    .append("\",");
        }

        json.append("\"naive\":{");
        json.append("\"matchCount\":")
                .append(naiveResult.getMatchCount())
                .append(",");
        json.append("\"matchPositions\":");
        appendIntegerList(json, naiveResult.getMatchPositions());
        json.append(",");
        json.append("\"comparisons\":")
                .append(naiveResult.getComparisons())
                .append(",");
        json.append("\"executionTimeNanoseconds\":")
                .append(naiveResult.getExecutionTimeNanoseconds())
                .append(",");
        json.append("\"executionTimeMilliseconds\":")
                .append(String.format(Locale.US, "%.6f", naiveResult.getExecutionTimeMilliseconds()));
        json.append("},");

        json.append("\"boyerMoore\":{");
        json.append("\"matchCount\":")
                .append(boyerMooreResult.getMatchCount())
                .append(",");
        json.append("\"matchPositions\":");
        appendIntegerList(json, boyerMooreResult.getMatchPositions());
        json.append(",");
        json.append("\"comparisons\":")
                .append(boyerMooreResult.getComparisons())
                .append(",");
        json.append("\"shifts\":")
                .append(boyerMooreResult.getShifts())
                .append(",");
        json.append("\"executionTimeNanoseconds\":")
                .append(boyerMooreResult.getExecutionTimeNanoseconds())
                .append(",");
        json.append("\"executionTimeMilliseconds\":")
                .append(String.format(Locale.US, "%.6f", boyerMooreResult.getExecutionTimeMilliseconds()));
        json.append("},");

        json.append("\"matchCount\":")
                .append(boyerMooreResult.getMatchCount())
                .append(",");

        json.append("\"matchPositions\":");
        appendIntegerList(json, boyerMooreResult.getMatchPositions());
        json.append(",");

        json.append("\"comparisons\":")
                .append(boyerMooreResult.getComparisons())
                .append(",");

        json.append("\"shifts\":")
                .append(boyerMooreResult.getShifts())
                .append(",");

        json.append("\"executionTimeNanoseconds\":")
                .append(boyerMooreResult.getExecutionTimeNanoseconds())
                .append(",");

        json.append("\"executionTimeMilliseconds\":")
                .append(String.format(Locale.US, "%.6f", boyerMooreResult.getExecutionTimeMilliseconds()))
                .append(",");

        json.append("\"badCharacterTable\":{");
        json.append("\"A\":").append(badCharacterTable['A']).append(",");
        json.append("\"C\":").append(badCharacterTable['C']).append(",");
        json.append("\"G\":").append(badCharacterTable['G']).append(",");
        json.append("\"T\":").append(badCharacterTable['T']);
        json.append("},");

        json.append("\"goodSuffixTable\":[");
        for (int i = 0; i < goodSuffixTable.length; i++) {
            if (i > 0) {
                json.append(",");
            }
            json.append(goodSuffixTable[i]);
        }
        json.append("],");

        json.append("\"resultsMatch\":")
                .append(resultsMatch);

        if (error != null) {
            json.append(",\"error\":\"")
                    .append(escapeJson(error))
                    .append("\"");
        }

        json.append("}");

        return json.toString();
    }

    private static void appendIntegerList(StringBuilder json, List<Integer> values) {
        json.append("[");

        for (int i = 0; i < values.size(); i++) {
            if (i > 0) {
                json.append(",");
            }

            json.append(values.get(i));
        }

        json.append("]");
    }

    private static String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
