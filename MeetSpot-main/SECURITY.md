# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

We take the security of MeetSpot seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not:

* Open a public GitHub issue for security vulnerabilities
* Disclose the vulnerability publicly before it has been addressed

### Please Do:

1. **Email us directly** at: security@meetspot.com (or your email)
2. **Provide detailed information** including:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect:

* **Acknowledgment**: Within 48 hours
* **Initial Assessment**: Within 1 week
* **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: 4-8 weeks

### Security Measures in Place:

* **Password Hashing**: Bcrypt with 10 salt rounds
* **Token Security**: SHA-256 hashing for reset tokens
* **Session Management**: Secure token-based authentication
* **Input Validation**: Both frontend and backend validation
* **CORS Protection**: Configured CORS policies
* **WebRTC Encryption**: DTLS-SRTP for media streams
* **Environment Variables**: Sensitive data in .env files
* **SQL Injection Prevention**: Mongoose ODM with parameterized queries

### Best Practices for Users:

* Use strong passwords (8+ characters, uppercase, number, special character)
* Don't share your password with anyone
* Log out after using shared computers
* Keep your browser updated
* Use HTTPS in production
* Don't click suspicious links in emails

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release patches as soon as possible

Thank you for helping keep MeetSpot and our users safe!
