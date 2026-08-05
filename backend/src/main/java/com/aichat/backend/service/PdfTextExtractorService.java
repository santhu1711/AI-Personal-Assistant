package com.aichat.backend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

@Service
public class PdfTextExtractorService {

    public String extractText(
            MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException(
                    "PDF file is empty."
            );
        }

        File temporaryFile = null;

        try {

            temporaryFile =
                    Files.createTempFile(
                            "uploaded-document-",
                            ".pdf"
                    ).toFile();

            file.transferTo(
                    temporaryFile
            );

            try (
                    PDDocument document =
                            Loader.loadPDF(
                                    temporaryFile
                            )
            ) {

                PDFTextStripper stripper =
                        new PDFTextStripper();

                String text =
                        stripper.getText(
                                document
                        );

                if (
                        text == null ||
                        text.isBlank()
                ) {
                    throw new RuntimeException(
                            "No readable text found inside the PDF."
                    );
                }

                return text.trim();
            }

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Failed to extract text from PDF.",
                    exception
            );

        } finally {

            if (
                    temporaryFile != null &&
                    temporaryFile.exists()
            ) {
                try {
                    Files.deleteIfExists(
                            temporaryFile.toPath()
                    );
                } catch (IOException exception) {
                    System.err.println(
                            "Could not delete temporary PDF file: "
                                    + temporaryFile.getAbsolutePath()
                    );
                }
            }
        }
    }
}