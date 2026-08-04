package com.aichat.backend.config;

import com.aichat.backend.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();
configuration.setAllowedOriginPatterns(
        List.of(
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "https://ai-personal-assistant-sable.vercel.app",
                "https://ai-personal-assistant-*.vercel.app"
        )
);

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        HttpHeaders.AUTHORIZATION,
                        HttpHeaders.CONTENT_TYPE,
                        HttpHeaders.ACCEPT,
                        "Cache-Control",
                        "X-Requested-With"
                )
        );

        configuration.setExposedHeaders(
                List.of(
                        HttpHeaders.AUTHORIZATION,
                        HttpHeaders.CONTENT_TYPE
                )
        );

        /*
         * JWT is sent through the Authorization header.
         * Cookies are not required for this frontend.
         */
        configuration.setAllowCredentials(false);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource
    ) throws Exception {

        http
                .csrf(csrf ->
                        csrf.disable()
                )

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * Browser CORS preflight requests must be
                         * accepted before JWT authentication.
                         */
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/auth/**",
                                "/error"
                        ).permitAll()

                        .requestMatchers(
                                "/api/user/**",
                                "/api/conversations/**",
                                "/api/messages/**",
                                "/api/chat",
                                "/api/chat/**"
                        ).authenticated()
.requestMatchers(
        HttpMethod.POST,
        "/api/feedback"
).authenticated()

.requestMatchers(
        HttpMethod.GET,
        "/api/feedback"
).hasRole("ADMIN")
                        .anyRequest()
                        .authenticated()
                )

                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint(
                                (
                                        request,
                                        response,
                                        authException
                                ) -> {

                                    response.setStatus(
                                            HttpServletResponse
                                                    .SC_UNAUTHORIZED
                                    );

                                    response.setContentType(
                                            "application/json"
                                    );

                                    response.getWriter().write(
                                            """
                                            {
                                              "error": "Unauthorized",
                                              "message": "A valid JWT token is required"
                                            }
                                            """
                                    );
                                }
                        )

                        .accessDeniedHandler(
                                (
                                        request,
                                        response,
                                        accessDeniedException
                                ) -> {

                                    response.setStatus(
                                            HttpServletResponse
                                                    .SC_FORBIDDEN
                                    );

                                    response.setContentType(
                                            "application/json"
                                    );

                                    response.getWriter().write(
                                            """
                                            {
                                              "error": "Forbidden",
                                              "message": "You do not have permission to access this resource"
                                            }
                                            """
                                    );
                                }
                        )
                )

                .httpBasic(httpBasic ->
                        httpBasic.disable()
                )

                .formLogin(formLogin ->
                        formLogin.disable()
                )

                .logout(logout ->
                        logout.disable()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}