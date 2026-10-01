
public class CompareAlgorithms {

    public static void main(String[] args) {

        // =====================================================
        // TEST DNA SEQUENCE
        // =====================================================

        String dna =
                "ATGCGTACGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA";

        String motif =
                "GCTAGCTA";


        // =====================================================
        // HEADER
        // =====================================================

        System.out.println();
        System.out.println(
                "=================================================="
        );

        System.out.println(
                "       GENESCAN ALGORITHM COMPARISON"
        );

        System.out.println(
                "=================================================="
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


        // =====================================================
        // BOYER-MOORE
        // =====================================================

        BoyerMoore boyerMoore =
                new BoyerMoore(motif);

        BoyerMoore.SearchResult bmResult =
                boyerMoore.search(dna);


        // =====================================================
        // NAIVE SEARCH
        // =====================================================

        NaiveSearch naiveSearch =
                new NaiveSearch();

        NaiveSearch.SearchResult naiveResult =
                naiveSearch.search(
                        dna,
                        motif
                );


        // =====================================================
        // BOYER-MOORE RESULTS
        // =====================================================

        System.out.println();

        System.out.println(
                "---------------- BOYER-MOORE ----------------"
        );

        System.out.println(
                "Matches      : "
                        + bmResult.getMatchCount()
        );

        System.out.println(
                "Positions    : "
                        + bmResult.getMatchPositions()
        );

        System.out.println(
                "Comparisons  : "
                        + bmResult.getComparisons()
        );

        System.out.println(
                "Shifts       : "
                        + bmResult.getShifts()
        );

        System.out.printf(
                "Time         : %.6f ms%n",
                bmResult.getExecutionTimeMilliseconds()
        );


        // =====================================================
        // NAIVE RESULTS
        // =====================================================

        System.out.println();

        System.out.println(
                "------------------- NAIVE --------------------"
        );

        System.out.println(
                "Matches      : "
                        + naiveResult.getMatchCount()
        );

        System.out.println(
                "Positions    : "
                        + naiveResult.getMatchPositions()
        );

        System.out.println(
                "Comparisons  : "
                        + naiveResult.getComparisons()
        );

        System.out.println(
                "Shifts       : "
                        + naiveResult.getShifts()
        );

        System.out.printf(
                "Time         : %.6f ms%n",
                naiveResult.getExecutionTimeMilliseconds()
        );


        // =====================================================
        // CORRECTNESS CHECK
        // =====================================================

        boolean sameMatchPositions =
                bmResult
                        .getMatchPositions()
                        .equals(
                                naiveResult
                                        .getMatchPositions()
                        );


        boolean sameMatchCount =
                bmResult.getMatchCount()
                        ==
                naiveResult.getMatchCount();


        System.out.println();

        System.out.println(
                "=================================================="
        );

        System.out.println(
                "              CORRECTNESS CHECK"
        );

        System.out.println(
                "=================================================="
        );

        System.out.println(
                "Same match positions : "
                        + sameMatchPositions
        );

        System.out.println(
                "Same match count     : "
                        + sameMatchCount
        );


        if (
                sameMatchPositions
                        &&
                sameMatchCount
        ) {

            System.out.println(
                    "STATUS               : PASS"
            );

        } else {

            System.out.println(
                    "STATUS               : FAIL"
            );
        }


        // =====================================================
        // PERFORMANCE COMPARISON
        // =====================================================

        System.out.println();

        System.out.println(
                "=================================================="
        );

        System.out.println(
                "             PERFORMANCE ANALYSIS"
        );

        System.out.println(
                "=================================================="
        );


        long bmComparisons =
                bmResult.getComparisons();

        long naiveComparisons =
                naiveResult.getComparisons();


        long comparisonDifference =
                naiveComparisons
                        -
                bmComparisons;


        System.out.println(
                "Boyer-Moore comparisons : "
                        + bmComparisons
        );

        System.out.println(
                "Naive comparisons       : "
                        + naiveComparisons
        );

        System.out.println(
                "Comparison difference   : "
                        + comparisonDifference
        );


        if (naiveComparisons > 0) {

            double reduction =
                    (
                            1.0
                                    -
                            (
                                    (double) bmComparisons
                                            /
                                    naiveComparisons
                            )
                    )
                            * 100.0;


            System.out.printf(
                    "Comparison reduction    : %.2f%%%n",
                    reduction
            );
        }


        System.out.println();

        System.out.println(
                "=================================================="
        );
    }
}