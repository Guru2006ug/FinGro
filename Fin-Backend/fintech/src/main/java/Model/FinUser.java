package Model;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.Version;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "fin_user")
public class FinUser {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank(message = "Full name is required")
	@Column(name = "fullname", nullable = false)
	private String fullname;
	
	@NotBlank(message = "Email is required")
	@Email(message = "Please provide a valid email address")
	@Column(name = "email", unique = true, nullable = false)
	private String email;
	
	@NotBlank(message = "Password is required")
	@Size(min = 8, message = "Password must be at least 8 characters long")
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	@Column(name = "password", nullable = false)
	private String password;

	@Column(name = "balance", nullable = false, columnDefinition = "DOUBLE DEFAULT 1000000.00")
	private Double balance = 1000000.00; // ₹10,00,000 paper money

	/** Optimistic lock — prevents lost-update race conditions on concurrent trades. */
	@Version
	@Column(columnDefinition = "BIGINT DEFAULT 0")
	private Long version = 0L;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String confirmPassword;

	public FinUser() {
	}

	public FinUser(String fullname, String email, String password) {
		this.fullname = fullname;
		this.email = email;
		this.password = password;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFullname() {
		return fullname;
	}

	public void setFullname(String fullname) {
		this.fullname = fullname;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Double getBalance() {
		return balance;
	}

	public void setBalance(Double balance) {
		this.balance = balance;
	}

	public String getConfirmPassword() {
		return confirmPassword;
	}

	public void setConfirmPassword(String confirmPassword) {
		this.confirmPassword = confirmPassword;
	}

	@Override
	public String toString() {
		return "FinUser [id=" + id + ", fullname=" + fullname + ", email=" + email + "]";
	}
}
