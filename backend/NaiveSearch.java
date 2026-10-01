import java.util.ArrayList;
import java.util.List;

public class NaiveSearch {

    private long comparisons;
    private long shifts;

    public SearchResult search(String text, String pattern) {

        if (text == null || text.isEmpty()) {
            throw new IllegalArgumentException(
                    "DNA sequence cannot be empty."
            );
        }

        if (pattern == null || pattern.isEmpty()) {
            throw new IllegalArgumentException(
                    "Pattern cannot be empty."
            );
        }

        text = text.toUpperCase();
        pattern = pattern.toUpperCase();

        comparisons = 0;
        shifts = 0;

        List<Integer> matchPositions =
                new ArrayList<>();

        int n = text.length();
        int m = pattern.length();

        long startTime = System.nanoTime();

        if (m <= n) {

            for (int i = 0; i <= n - m; i++) {

                shifts++;

                int j = 0;

                while (j < m) {

                    comparisons++;

                    if (
                            text.charAt(i + j)
                                    !=
                            pattern.charAt(j)
                    ) {
                        break;
                    }

                    j++;
                }

                if (j == m) {
                    matchPositions.add(i);
                }
            }
        }

        long endTime = System.nanoTime();

        return new SearchResult(
                pattern,
                matchPositions,
                comparisons,
                shifts,
                endTime - startTime
        );
    }


    public static class SearchResult {

        private final String pattern;
        private final List<Integer> matchPositions;
        private final long comparisons;
        private final long shifts;
        private final long executionTimeNanoseconds;

        public SearchResult(
                String pattern,
                List<Integer> matchPositions,
                long comparisons,
                long shifts,
                long executionTimeNanoseconds
        ) {
            this.pattern = pattern;

            this.matchPositions =
                    new ArrayList<>(matchPositions);

            this.comparisons = comparisons;
            this.shifts = shifts;

            this.executionTimeNanoseconds =
                    executionTimeNanoseconds;
        }

        public String getPattern() {
            return pattern;
        }

        public List<Integer> getMatchPositions() {
            return matchPositions;
        }

        public int getMatchCount() {
            return matchPositions.size();
        }

        public long getComparisons() {
            return comparisons;
        }

        public long getShifts() {
            return shifts;
        }

        public long getExecutionTimeNanoseconds() {
            return executionTimeNanoseconds;
        }

        public double getExecutionTimeMilliseconds() {
            return executionTimeNanoseconds
                    / 1_000_000.0;
        }

        public void printResult() {

            System.out.println(
                    "\n========== NAIVE SEARCH RESULT =========="
            );

            System.out.println(
                    "Pattern           : "
                            + pattern
            );

            System.out.println(
                    "Matches Found     : "
                            + getMatchCount()
            );

            System.out.println(
                    "Match Positions   : "
                            + matchPositions
            );

            System.out.println(
                    "Comparisons Made  : "
                            + comparisons
            );

            System.out.println(
                    "Shifts Performed  : "
                            + shifts
            );

            System.out.printf(
                    "Execution Time    : %.6f ms%n",
                    getExecutionTimeMilliseconds()
            );

            System.out.println(
                    "=========================================="
            );
        }
    }


    public static void main(String[] args) {

        String dna =
                "ATGCGTACGTAGCTAGCTAGCTAGCTAGCTA";

        String motif =
                "GCTAGCTA";

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "          GENESCAN NAIVE SEARCH"
        );

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "DNA Sequence : " + dna
        );

        System.out.println(
                "DNA Length   : " + dna.length()
        );

        System.out.println(
                "Motif        : " + motif
        );

        NaiveSearch naiveSearch =
                new NaiveSearch();

        SearchResult result =
                naiveSearch.search(
                        dna,
                        motif
                );

        result.printResult();
    }
}