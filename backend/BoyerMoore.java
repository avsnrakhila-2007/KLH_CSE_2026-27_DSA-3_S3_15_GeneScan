import java.util.ArrayList;
import java.util.List;

public class BoyerMoore {

    private final String pattern;

    // Last occurrence position for each character.
    private final int[] badCharacterTable;

    // Good suffix shift table.
    private final int[] goodSuffixTable;

    // Statistics.
    private long comparisons;
    private long shifts;

    // Complete execution trace.
    private final List<TraceStep> traceSteps;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public BoyerMoore(String pattern) {

        if (pattern == null || pattern.isEmpty()) {
            throw new IllegalArgumentException(
                    "Pattern cannot be empty."
            );
        }

        this.pattern = pattern.toUpperCase();

        this.badCharacterTable =
                buildBadCharacterTable();

        this.goodSuffixTable =
                buildGoodSuffixTable();

        this.traceSteps =
                new ArrayList<>();
    }


    // =========================================================
    // BAD CHARACTER HEURISTIC
    // =========================================================

    private int[] buildBadCharacterTable() {

        int[] table =
                new int[Character.MAX_VALUE + 1];

        for (int i = 0; i < table.length; i++) {
            table[i] = -1;
        }

        for (int i = 0; i < pattern.length(); i++) {

            table[pattern.charAt(i)] = i;
        }

        return table;
    }


    // =========================================================
    // GOOD SUFFIX HEURISTIC
    // =========================================================

    private int[] buildGoodSuffixTable() {

        int m = pattern.length();

        int[] shift = new int[m + 1];

        int[] borderPosition = new int[m + 1];

        preprocessStrongSuffix(
                shift,
                borderPosition,
                m
        );

        preprocessCase2(
                shift,
                borderPosition,
                m
        );

        return shift;
    }


    private void preprocessStrongSuffix(
            int[] shift,
            int[] borderPosition,
            int m
    ) {

        int i = m;

        int j = m + 1;

        borderPosition[i] = j;

        while (i > 0) {

            while (
                    j <= m &&
                    pattern.charAt(i - 1)
                            !=
                    pattern.charAt(j - 1)
            ) {

                if (shift[j] == 0) {
                    shift[j] = j - i;
                }

                j = borderPosition[j];
            }

            i--;
            j--;

            borderPosition[i] = j;
        }
    }


    private void preprocessCase2(
            int[] shift,
            int[] borderPosition,
            int m
    ) {

        int j = borderPosition[0];

        for (int i = 0; i <= m; i++) {

            if (shift[i] == 0) {
                shift[i] = j;
            }

            if (i == j) {
                j = borderPosition[j];
            }
        }
    }


    // =========================================================
    // SEARCH
    // =========================================================

    public SearchResult search(String text) {

        if (text == null || text.isEmpty()) {
            throw new IllegalArgumentException(
                    "DNA sequence cannot be empty."
            );
        }

        text = text.toUpperCase();

        comparisons = 0;
        shifts = 0;
        traceSteps.clear();

        List<Integer> matches =
                new ArrayList<>();

        int n = text.length();
        int m = pattern.length();

        long startTime = System.nanoTime();


        if (m > n) {

            long endTime = System.nanoTime();

            return new SearchResult(
                    pattern,
                    matches,
                    comparisons,
                    shifts,
                    endTime - startTime,
                    new ArrayList<>(traceSteps)
            );
        }


        int alignment = 0;


        // =====================================================
        // BOYER-MOORE MAIN LOOP
        // =====================================================

        while (alignment <= n - m) {

            TraceStep step =
                    new TraceStep(
                            traceSteps.size() + 1,
                            alignment
                    );

            int j = m - 1;


            // -------------------------------------------------
            // RIGHT TO LEFT COMPARISON
            // -------------------------------------------------

            while (j >= 0) {

                char patternChar =
                        pattern.charAt(j);

                char textChar =
                        text.charAt(
                                alignment + j
                        );

                boolean matched =
                        patternChar == textChar;

                comparisons++;


                step.addComparison(
                        new ComparisonDetail(
                                j,
                                alignment + j,
                                patternChar,
                                textChar,
                                matched
                        )
                );


                if (matched) {

                    j--;

                } else {

                    break;
                }
            }


            // -------------------------------------------------
            // COMPLETE MATCH
            // -------------------------------------------------

            if (j < 0) {

                matches.add(alignment);

                int appliedShift =
                        goodSuffixTable[0];


                step.setMatchFound(true);

                step.setBadCharacter(
                        null
                );

                step.setBadCharacterShift(0);

                step.setGoodSuffixShift(
                        appliedShift
                );

                step.setAppliedShift(
                        appliedShift
                );


                alignment += appliedShift;

                shifts++;
            }


            // -------------------------------------------------
            // MISMATCH
            // -------------------------------------------------

            else {

                char badCharacter =
                        text.charAt(
                                alignment + j
                        );


                int lastOccurrence =
                        badCharacterTable[
                                badCharacter
                        ];


                int badCharacterShift =
                        j - lastOccurrence;


                if (badCharacterShift < 1) {

                    badCharacterShift = 1;
                }


                int goodSuffixShift =
                        goodSuffixTable[j + 1];


                int appliedShift =
                        Math.max(
                                badCharacterShift,
                                goodSuffixShift
                        );


                step.setMatchFound(false);

                step.setBadCharacter(
                        badCharacter
                );

                step.setBadCharacterShift(
                        badCharacterShift
                );

                step.setGoodSuffixShift(
                        goodSuffixShift
                );

                step.setAppliedShift(
                        appliedShift
                );


                alignment += appliedShift;

                shifts++;
            }


            traceSteps.add(step);
        }


        long endTime = System.nanoTime();


        return new SearchResult(
                pattern,
                matches,
                comparisons,
                shifts,
                endTime - startTime,
                new ArrayList<>(traceSteps)
        );
    }


    // =========================================================
    // TABLE GETTERS
    // =========================================================

    public int[] getBadCharacterTable() {

        return badCharacterTable.clone();
    }


    public int[] getGoodSuffixTable() {

        return goodSuffixTable.clone();
    }


    public List<TraceStep> getTraceSteps() {

        return new ArrayList<>(traceSteps);
    }


    // =========================================================
    // PRINT BAD CHARACTER TABLE
    // =========================================================

    public void printBadCharacterTable() {

        System.out.println();

        System.out.println(
                "========== BAD CHARACTER TABLE =========="
        );

        System.out.println(
                "Character\tLast Position"
        );


        boolean[] printed =
                new boolean[Character.MAX_VALUE + 1];


        for (int i = 0; i < pattern.length(); i++) {

            char c = pattern.charAt(i);

            if (!printed[c]) {

                System.out.println(
                        c
                                +
                        "\t\t"
                                +
                        badCharacterTable[c]
                );

                printed[c] = true;
            }
        }


        System.out.println(
                "=========================================="
        );
    }


    // =========================================================
    // PRINT GOOD SUFFIX TABLE
    // =========================================================

    public void printGoodSuffixTable() {

        System.out.println();

        System.out.println(
                "========== GOOD SUFFIX TABLE =========="
        );

        System.out.println(
                "Index\tShift"
        );


        for (int i = 0;
             i < goodSuffixTable.length;
             i++) {

            System.out.println(
                    i
                            +
                    "\t"
                            +
                    goodSuffixTable[i]
            );
        }


        System.out.println(
                "========================================"
        );
    }


    // =========================================================
    // PRINT EXECUTION TRACE
    // =========================================================

    public void printTrace(String text) {

        if (traceSteps.isEmpty()) {

            System.out.println(
                    "\nNo execution trace available."
            );

            return;
        }

        text = text.toUpperCase();


        System.out.println();

        System.out.println(
                "======================================================"
        );

        System.out.println(
                "            BOYER-MOORE EXECUTION TRACE"
        );

        System.out.println(
                "======================================================"
        );


        for (TraceStep step : traceSteps) {

            System.out.println();

            System.out.println(
                    "STEP "
                            +
                    step.getStepNumber()
            );

            System.out.println(
                    "Alignment Position : "
                            +
                    step.getAlignment()
            );


            // DNA line
            System.out.println(
                    "DNA                 : "
                            +
                    text
            );


            // Pattern line
            System.out.println(
                    "Pattern             : "
                            +
                    createPatternLine(
                            step.getAlignment()
                    )
                            +
                    pattern
            );


            System.out.println(
                    "Comparisons:"
            );


            for (
                    ComparisonDetail comparison
                    :
                    step.getComparisons()
            ) {

                System.out.println(
                        "  Pattern["
                                +
                        comparison.getPatternIndex()
                                +
                        "] "
                                +
                        comparison.getPatternCharacter()
                                +
                        "  vs  DNA["
                                +
                        comparison.getTextIndex()
                                +
                        "] "
                                +
                        comparison.getTextCharacter()
                );


                if (
                        comparison.isMatched()
                ) {

                    System.out.println(
                            "     ✓ MATCH"
                    );

                } else {

                    System.out.println(
                            "     ✗ MISMATCH"
                    );
                }
            }


            if (
                    step.isMatchFound()
            ) {

                System.out.println(
                        "Result              : ✓ MATCH FOUND"
                );

                System.out.println(
                        "Good Suffix Shift   : "
                                +
                        step.getGoodSuffixShift()
                );

                System.out.println(
                        "Applied Shift       : "
                                +
                        step.getAppliedShift()
                );

            } else {

                System.out.println(
                        "Bad Character       : "
                                +
                        step.getBadCharacter()
                );

                System.out.println(
                        "Bad Character Shift : "
                                +
                        step.getBadCharacterShift()
                );

                System.out.println(
                        "Good Suffix Shift   : "
                                +
                        step.getGoodSuffixShift()
                );

                System.out.println(
                        "Applied Shift       : "
                                +
                        step.getAppliedShift()
                );
            }


            System.out.println(
                    "------------------------------------------------------"
            );
        }


        System.out.println();

        System.out.println(
                "Total comparisons : "
                        +
                comparisons
        );

        System.out.println(
                "Total shifts      : "
                        +
                shifts
        );

        System.out.println(
                "======================================================"
        );
    }


    private String createPatternLine(
            int alignment
    ) {

        StringBuilder builder =
                new StringBuilder();


        for (int i = 0;
             i < alignment;
             i++) {

            builder.append(' ');
        }


        return builder.toString();
    }


    // =========================================================
    // SEARCH RESULT
    // =========================================================

    public static class SearchResult {

        private final String pattern;

        private final List<Integer> matchPositions;

        private final long comparisons;

        private final long shifts;

        private final long executionTimeNanoseconds;

        private final List<TraceStep> traceSteps;


        public SearchResult(
                String pattern,
                List<Integer> matchPositions,
                long comparisons,
                long shifts,
                long executionTimeNanoseconds,
                List<TraceStep> traceSteps
        ) {

            this.pattern = pattern;

            this.matchPositions =
                    new ArrayList<>(
                            matchPositions
                    );

            this.comparisons =
                    comparisons;

            this.shifts =
                    shifts;

            this.executionTimeNanoseconds =
                    executionTimeNanoseconds;

            this.traceSteps =
                    new ArrayList<>(
                            traceSteps
                    );
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


        public List<TraceStep> getTraceSteps() {

            return new ArrayList<>(
                    traceSteps
            );
        }


        public void printResult() {

            System.out.println();

            System.out.println(
                    "========== BOYER-MOORE RESULT =========="
            );

            System.out.println(
                    "Pattern           : "
                            +
                    pattern
            );

            System.out.println(
                    "Matches Found     : "
                            +
                    getMatchCount()
            );

            System.out.println(
                    "Match Positions   : "
                            +
                    matchPositions
            );

            System.out.println(
                    "Comparisons Made  : "
                            +
                    comparisons
            );

            System.out.println(
                    "Shifts Performed  : "
                            +
                    shifts
            );

            System.out.printf(
                    "Execution Time    : %.6f ms%n",
                    getExecutionTimeMilliseconds()
            );

            System.out.println(
                    "Trace Steps       : "
                            +
                    traceSteps.size()
            );

            System.out.println(
                    "=========================================="
            );
        }
    }


    // =========================================================
    // TRACE STEP
    // =========================================================

    public static class TraceStep {

        private final int stepNumber;

        private final int alignment;

        private final List<ComparisonDetail> comparisons;

        private boolean matchFound;

        private Character badCharacter;

        private int badCharacterShift;

        private int goodSuffixShift;

        private int appliedShift;


        public TraceStep(
                int stepNumber,
                int alignment
        ) {

            this.stepNumber =
                    stepNumber;

            this.alignment =
                    alignment;

            this.comparisons =
                    new ArrayList<>();

            this.matchFound =
                    false;
        }


        public void addComparison(
                ComparisonDetail comparison
        ) {

            comparisons.add(
                    comparison
            );
        }


        public int getStepNumber() {
            return stepNumber;
        }


        public int getAlignment() {
            return alignment;
        }


        public List<ComparisonDetail>
        getComparisons() {

            return new ArrayList<>(
                    comparisons
            );
        }


        public boolean isMatchFound() {
            return matchFound;
        }


        public void setMatchFound(
                boolean value
        ) {

            matchFound = value;
        }


        public Character getBadCharacter() {
            return badCharacter;
        }


        public void setBadCharacter(
                Character value
        ) {

            badCharacter = value;
        }


        public int getBadCharacterShift() {
            return badCharacterShift;
        }


        public void setBadCharacterShift(
                int value
        ) {

            badCharacterShift = value;
        }


        public int getGoodSuffixShift() {
            return goodSuffixShift;
        }


        public void setGoodSuffixShift(
                int value
        ) {

            goodSuffixShift = value;
        }


        public int getAppliedShift() {
            return appliedShift;
        }


        public void setAppliedShift(
                int value
        ) {

            appliedShift = value;
        }
    }


    // =========================================================
    // COMPARISON DETAIL
    // =========================================================

    public static class ComparisonDetail {

        private final int patternIndex;

        private final int textIndex;

        private final char patternCharacter;

        private final char textCharacter;

        private final boolean matched;


        public ComparisonDetail(
                int patternIndex,
                int textIndex,
                char patternCharacter,
                char textCharacter,
                boolean matched
        ) {

            this.patternIndex =
                    patternIndex;

            this.textIndex =
                    textIndex;

            this.patternCharacter =
                    patternCharacter;

            this.textCharacter =
                    textCharacter;

            this.matched =
                    matched;
        }


        public int getPatternIndex() {
            return patternIndex;
        }


        public int getTextIndex() {
            return textIndex;
        }


        public char getPatternCharacter() {
            return patternCharacter;
        }


        public char getTextCharacter() {
            return textCharacter;
        }


        public boolean isMatched() {
            return matched;
        }
    }


    // =========================================================
    // TEST
    // =========================================================

    public static void main(String[] args) {

        String dna =
                "ATGCGTACGTAGCTAGCTAGCTAGCTAGCTA";

        String motif =
                "GCTAGCTA";


        System.out.println();

        System.out.println(
                "=================================================="
        );

        System.out.println(
                "        GENESCAN BOYER-MOORE ENGINE"
        );

        System.out.println(
                "=================================================="
        );

        System.out.println(
                "DNA Sequence : "
                        +
                dna
        );

        System.out.println(
                "DNA Length   : "
                        +
                dna.length()
        );

        System.out.println(
                "Motif        : "
                        +
                motif
        );


        BoyerMoore boyerMoore =
                new BoyerMoore(motif);


        SearchResult result =
                boyerMoore.search(dna);


        result.printResult();

        boyerMoore.printBadCharacterTable();

        boyerMoore.printGoodSuffixTable();

        boyerMoore.printTrace(dna);


        System.out.println();

        System.out.println(
                "Boyer-Moore analysis completed."
        );
    }
}