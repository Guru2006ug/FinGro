package DTO;

public class LoginResponse {
    
    private String token;
    private String email;
    private String fullname;
    private String message;

    public LoginResponse() {
    }

    public LoginResponse(String token, String email, String fullname, String message) {
        this.token = token;
        this.email = email;
        this.fullname = fullname;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
