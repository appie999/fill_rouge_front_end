# Backend API Requirements for Clinique Frontend

This document outlines the backend API endpoints and configurations required to support the Angular frontend authentication system.

## Required Backend Endpoints

### 1. Authentication Controller (`/auth`)

#### Login Endpoint
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (Success - 200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (Error - 401):
{
  "message": "Invalid credentials"
}
```

#### Register Endpoint
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "PATIENT"  // or "DOCTOR"
}

Response (Success - 201):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (Error - 409):
{
  "message": "User already exists"
}
```

## JWT Token Structure

The JWT token must contain the following claims:
```json
{
  "id": 123,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "PATIENT",
  "exp": 1640995200,
  "iat": 1640908800
}
```

## Required Backend Configuration

### 1. CORS Configuration
```java
@Configuration
@EnableWebSecurity
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 2. Security Configuration
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/doctor/**").hasRole("DOCTOR")
                .requestMatchers("/patient/**").hasRole("PATIENT")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 3. JWT Utility Class
```java
@Component
public class JwtUtil {
    
    private String secret = "mySecretKey";
    private int jwtExpiration = 86400000; // 24 hours
    
    public String generateToken(UserDetails userDetails, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("firstName", ((CustomUser) userDetails).getFirstName());
        claims.put("lastName", ((CustomUser) userDetails).getLastName());
        
        return createToken(claims, userDetails.getUsername());
    }
    
    // Additional JWT methods...
}
```

## Database Schema

### User Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('DOCTOR', 'PATIENT') NOT NULL,
    specialization VARCHAR(100), -- Only for doctors
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Test Frontend-Backend Integration

1. Start your Spring Boot backend on `http://localhost:8080`
2. Start the Angular frontend: `ng serve`
3. Navigate to `http://localhost:4200/auth/register`
4. Register a new user
5. Navigate to `http://localhost:4200/auth/login`
6. Login with the registered user
7. Verify role-based redirection works

## Error Handling

The backend should return appropriate HTTP status codes:
- 200: Success
- 201: Created (for registration)
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid credentials)
- 409: Conflict (user already exists)
- 500: Internal Server Error

## Next Steps

1. Implement the backend endpoints as described
2. Test the integration with the frontend
3. Add authentication guards to protect routes
4. Implement proper error handling and validation
5. Add password strength requirements
6. Consider implementing refresh tokens for better security