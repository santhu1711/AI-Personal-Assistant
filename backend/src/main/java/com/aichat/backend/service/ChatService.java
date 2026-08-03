package com.aichat.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    public String askGemini(String message) {

        try {

            String url = "https://openrouter.ai/api/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            headers.set("HTTP-Referer", "http://localhost:8080");
            headers.set("X-Title", "AI Chat Widget");

            Map<String, Object> request = new HashMap<>();

            request.put("model", "openai/gpt-oss-20b:free");

            request.put(
                    "messages",
                    List.of(
                            Map.of(
                                    "role", "user",
                                    "content", message
                            )
                    )
            );

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(request, headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            entity,
                            String.class
                    );

            System.out.println("======================================");
            System.out.println("OPENROUTER RAW RESPONSE");
            System.out.println("======================================");
            System.out.println(response.getBody());
            System.out.println("======================================");

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());

            if (root.has("error")) {
                return "OpenRouter Error: "
                        + root.get("error").get("message").asText();
            }

            JsonNode choices = root.get("choices");

            if (choices == null || choices.size() == 0) {
                return "No response returned from AI.";
            }

            JsonNode content =
                    choices.get(0)
                           .get("message")
                           .get("content");

            if (content == null) {
                return "AI returned an empty message.";
            }

            return content.asText();

        } catch (Exception e) {

            e.printStackTrace();
            return "Error: " + e.getMessage();

        }

    }
}