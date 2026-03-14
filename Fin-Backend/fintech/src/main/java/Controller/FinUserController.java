package Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import DTO.LoginRequest;
import DTO.LoginResponse;
import Model.FinUser;
import Service.FinUserService;

@RestController
@RequestMapping("/api/auth")
public class FinUserController {
    
    @Autowired
    private FinUserService finUserService;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;
    
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody FinUser user) {
        String result = finUserService.registerUser(user);
        
        if (result.equals("Registration successful")) {
            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = finUserService.loginUser(loginRequest);
        
        if (response.getToken() != null) {
            // Set JWT as HttpOnly cookie — the token is NOT included in the JSON body
            ResponseCookie jwtCookie = ResponseCookie.from("jwt", response.getToken())
                    .httpOnly(true)
                    .secure(false) // set to true in production (HTTPS)
                    .path("/")
                    .maxAge(jwtExpirationMs / 1000) // convert ms to seconds
                    .sameSite("Lax")
                    .build();

            // Strip the raw token from the response so it's never exposed in JSON
            LoginResponse safeResponse = new LoginResponse(null, response.getEmail(), response.getFullname(), response.getMessage());

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .body(safeResponse);
        } else {
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser() {
        // Clear the JWT cookie by setting maxAge to 0
        ResponseCookie clearCookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body("Logged out successfully");
    }
}
