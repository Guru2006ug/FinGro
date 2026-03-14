package Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import Config.JwtUtil;
import DTO.LoginRequest;
import DTO.LoginResponse;
import Model.FinUser;
import Repository.FinUserRepository;

@Service
public class FinUserService {
    
    @Autowired
    private FinUserRepository finUserRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public String registerUser(FinUser user) {
        // Check if email already exists
        if (finUserRepository.existsByEmail(user.getEmail())) {
            return "Email already registered";
        }
        
        // Validate password and confirm password match
        if (user.getPassword() == null || user.getConfirmPassword() == null) {
            return "Password and Confirm Password are required";
        }
        
        if (!user.getPassword().equals(user.getConfirmPassword())) {
            return "Password and Confirm Password do not match";
        }
        
        // Validate password strength (minimum 8 characters)
        if (user.getPassword().length() < 8) {
            return "Password must be at least 8 characters long";
        }
        
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Save user to database
        finUserRepository.save(user);
        
        return "Registration successful";
    }
    
    public LoginResponse loginUser(LoginRequest loginRequest) {
        // Check if user exists
        FinUser user = finUserRepository.findByEmail(loginRequest.getEmail()).orElse(null);
        
        if (user == null) {
            return new LoginResponse(null, null, null, "User not found");
        }
        
        // Validate password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return new LoginResponse(null, null, null, "Invalid password");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());
        
        return new LoginResponse(token, user.getEmail(), user.getFullname(), "Login successful");
    }
    
    public FinUser findByEmail(String email) {
        return finUserRepository.findByEmail(email).orElse(null);
    }
}
