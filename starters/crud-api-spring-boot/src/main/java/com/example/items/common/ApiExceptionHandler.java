package com.example.items.common;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.example.items.item.ItemNotFoundException;

/** Every error leaves as {"error": "..."}: validation, unknown routes, bad JSON and failures. */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ItemNotFoundException.class)
    public ResponseEntity<Map<String, String>> notFound(ItemNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> unexpected(Exception ex) {
        log.error("Request failed", ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");
    }

    /** Spring's own exceptions (400, 404, 405, 415 ...) all pass through here. */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
                                                             HttpStatusCode status, WebRequest request) {
        String message = switch (ex) {
            case MethodArgumentNotValidException e when e.getFieldError() != null -> e.getFieldError().getDefaultMessage();
            case HandlerMethodValidationException e when !e.getAllErrors().isEmpty() -> e.getAllErrors().get(0).getDefaultMessage();
            case MethodArgumentTypeMismatchException e -> e.getName() + " must be a whole number";
            case HttpMessageNotReadableException e -> "Send a JSON object with a string name and an optional string description";
            default -> HttpStatus.valueOf(status.value()).getReasonPhrase();
        };
        return ResponseEntity.status(status).headers(headers).body(Map.of("error", message));
    }

    private static ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
