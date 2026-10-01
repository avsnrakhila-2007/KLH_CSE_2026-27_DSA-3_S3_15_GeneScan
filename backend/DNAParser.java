import java.util.Locale;

public final class DNAParser {

    private DNAParser() {
    }

    public static boolean isDNACharacter(char character) {
        return character == 'A'
                || character == 'C'
                || character == 'G'
                || character == 'T';
    }

    public static String normalizeSequence(String rawSequence) {
        return extractBestSequence(rawSequence);
    }

    public static String normalizeMotif(String rawMotif) {
        if (rawMotif == null) {
            return "";
        }

        StringBuilder motif = new StringBuilder();
        for (int i = 0; i < rawMotif.length(); i++) {
            char character = rawMotif.charAt(i);
            if (!Character.isWhitespace(character)) {
                motif.append(Character.toUpperCase(character));
            }
        }
        return motif.toString();
    }

    public static String extractBestSequence(String rawInput) {
        if (rawInput == null) {
            return "";
        }

        String text = rawInput
                .replace('\r', '\n')
                .toUpperCase(Locale.ROOT)
                .trim();

        if (text.isEmpty()) {
            return "";
        }

        String bestCandidate = "";
        StringBuilder sequenceLines = new StringBuilder();

        for (String line : text.split("\\R")) {
            String trimmed = line.trim();

            if (trimmed.startsWith(">")) {
                bestCandidate = longer(bestCandidate, sequenceLines.toString());
                sequenceLines.setLength(0);
                continue;
            }

            if (trimmed.isEmpty()) {
                continue;
            }

            if (isSequenceLine(trimmed)) {
                appendSequenceCharacters(trimmed, sequenceLines);
                continue;
            }

            bestCandidate = longer(bestCandidate, sequenceLines.toString());
            sequenceLines.setLength(0);

            StringBuilder run = new StringBuilder();
            for (int i = 0; i < trimmed.length(); i++) {
                char character = trimmed.charAt(i);
                if (isDNACharacter(character)) {
                    run.append(character);
                } else {
                    if (run.length() >= 8) {
                        bestCandidate = longer(bestCandidate, run.toString());
                    }
                    run.setLength(0);
                }
            }
            if (run.length() >= 8) {
                bestCandidate = longer(bestCandidate, run.toString());
            }
        }

        return longer(bestCandidate, sequenceLines.toString());
    }

    private static boolean isSequenceLine(String line) {
        boolean hasBase = false;
        for (int i = 0; i < line.length(); i++) {
            char character = Character.toUpperCase(line.charAt(i));
            if (isDNACharacter(character)) {
                hasBase = true;
            } else if (!Character.isWhitespace(character) && !Character.isDigit(character)) {
                return false;
            }
        }
        return hasBase;
    }

    private static void appendSequenceCharacters(String line, StringBuilder output) {
        for (int i = 0; i < line.length(); i++) {
            char character = Character.toUpperCase(line.charAt(i));
            if (isDNACharacter(character)) {
                output.append(character);
            }
        }
    }

    private static String longer(String current, String candidate) {
        return candidate.length() > current.length() ? candidate : current;
    }

    public static String validateSequence(String sequence) {
        if (sequence == null || sequence.trim().isEmpty()) {
            return "DNA sequence is required.";
        }

        for (int i = 0; i < sequence.length(); i++) {
            char character = sequence.charAt(i);

            if (!isDNACharacter(character)) {
                return "Invalid DNA sequence. Allowed characters are A, C, G and T.";
            }
        }

        return null;
    }

    public static String validateMotif(String motif) {
        if (motif == null || motif.trim().isEmpty()) {
            return "DNA motif is required.";
        }

        for (int i = 0; i < motif.length(); i++) {
            char character = motif.charAt(i);

            if (!isDNACharacter(character)) {
                return "Invalid DNA motif. Allowed characters are A, C, G and T.";
            }
        }

        return null;
    }
}
