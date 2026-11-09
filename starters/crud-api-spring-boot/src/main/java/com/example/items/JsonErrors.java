package com.example.items;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/** Every error leaves as {"error": "..."}. */
@RestControllerAdvice
public class JsonErrors extends ResponseEntityExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(JsonErrors.class);

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
                                                             HttpStatusCode status, WebRequest request) {
        String message = ex instanceof ResponseStatusException r && r.getReason() != null
                ? r.getReason()
                : HttpStatus.valueOf(status.value()).getReasonPhrase();
        return ResponseEntity.status(status).headers(headers).body(Map.of("error", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> unexpected(Exception ex) {
        log.error("Request failed", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Something went wrong"));
    }
}
