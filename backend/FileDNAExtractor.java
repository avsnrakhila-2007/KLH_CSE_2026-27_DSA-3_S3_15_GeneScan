import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public final class FileDNAExtractor {

    private FileDNAExtractor() {
    }

    public static String detectInputType(String fileName, byte[] fileBytes) {
        String lowerName = fileName.toLowerCase(Locale.ROOT);
        if (lowerName.endsWith(".pdf") || startsWith(fileBytes, "%PDF-")) {
            return "PDF";
        }
        if (lowerName.endsWith(".docx")) {
            return "DOCX";
        }
        if (lowerName.endsWith(".doc")) {
            return "DOC";
        }
        if (lowerName.endsWith(".fasta")
                || lowerName.endsWith(".fa")
                || lowerName.endsWith(".fna")
                || lowerName.endsWith(".seq")) {
            return "FASTA";
        }
        if (lowerName.endsWith(".txt")) {
            return "TXT";
        }
        throw new IllegalArgumentException("Unsupported file type. Upload TXT, FASTA, PDF, DOC, or DOCX.");
    }

    public static String extractText(String fileName, byte[] fileBytes, String inputType) throws IOException {
        try {
            switch (inputType) {
                case "PDF":
                    try (PDDocument document = Loader.loadPDF(fileBytes)) {
                        return new PDFTextStripper().getText(document);
                    }
                case "DOC":
                    try (HWPFDocument document = new HWPFDocument(new ByteArrayInputStream(fileBytes));
                         WordExtractor extractor = new WordExtractor(document)) {
                        return extractor.getText();
                    }
                case "DOCX":
                    try (XWPFDocument document = new XWPFDocument(new ByteArrayInputStream(fileBytes));
                         XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
                        return extractor.getText();
                    }
                default:
                    String text = new String(fileBytes, StandardCharsets.UTF_8);
                    if (text.indexOf('\0') >= 0) {
                        throw new IllegalArgumentException("Unsupported file. Upload TXT, PDF, DOC, or DOCX content.");
                    }
                    return text;
            }
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalArgumentException("Could not read the uploaded " + inputType + " file.", exception);
        }
    }

    private static boolean startsWith(byte[] bytes, String prefix) {
        if (bytes.length < prefix.length()) {
            return false;
        }
        for (int i = 0; i < prefix.length(); i++) {
            if (bytes[i] != (byte) prefix.charAt(i)) {
                return false;
            }
        }
        return true;
    }
}