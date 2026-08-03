package com.aichat.backend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

        try (

                PDDocument document =
                        Loader.loadPDF(
                                file.getBytes()
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

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Failed to extract text from PDF.",
                    exception
            );
        }

    }

}