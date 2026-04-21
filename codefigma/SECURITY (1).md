# Security Policy

## 🔒 Security Commitment

EduCourse takes the security of our software and user data seriously. This document outlines our security practices and how to report vulnerabilities.

---

## ✅ Supported Versions

We release security updates for the following versions:

| Version | Supported          | Status        |
| ------- | ------------------ | ------------- |
| 2.0.x   | ✅ Yes            | Current       |
| 1.0.x   | ⚠️ Limited         | Legacy        |
| < 1.0   | ❌ No             | End of Life   |

---

## 🛡️ Security Features

### Authentication & Authorization
- ✅ JWT-based authentication with refresh tokens
- ✅ Secure password hashing (SHA-256 client-side demo, bcrypt recommended for production)
- ✅ Session management with automatic timeout
- ✅ Role-based access control (RBAC)
- ✅ Password strength validation
- ✅ Account lockout after failed attempts (ready to implement)

### Data Protection
- ✅ XSS protection with DOMPurify
- ✅ CSRF token validation
- ✅ Input sanitization
- ✅ SQL injection prevention (when using database)
- ✅ Secure HTTP headers
- ✅ Content Security Policy (CSP)
- ✅ HTTPS enforcement in production

### API Security
- ✅ Rate limiting
- ✅ Request throttling
- ✅ API key authentication
- ✅ CORS configuration
- ✅ Request validation with Zod schemas
- ✅ Error handling without information leakage

### Code Security
- ✅ TypeScript strict mode
- ✅ ESLint security rules
- ✅ Dependency vulnerability scanning
- ✅ No hardcoded secrets
- ✅ Environment variable protection
- ✅ Secure random ID generation (nanoid)

---

## 🚨 Reporting a Vulnerability

### How to Report

If you discover a security vulnerability, please do **NOT** open a public issue. Instead:

**1. Email us directly:**
```
security@educourse.vn
```

**2. Include the following information:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

**3. Use encrypted communication (optional):**
```
PGP Key: [Key ID will be provided]
```

### Response Timeline

| Stage | Timeframe |
|-------|-----------|
| Initial Response | Within 24 hours |
| Vulnerability Assessment | Within 3 business days |
| Fix Development | Depends on severity |
| Patch Release | As soon as possible |
| Public Disclosure | After patch release |

### What to Expect

1. **Acknowledgment** - We will acknowledge receipt within 24 hours
2. **Investigation** - We will investigate and assess the severity
3. **Updates** - We will keep you informed of our progress
4. **Fix** - We will develop and test a fix
5. **Release** - We will release a security patch
6. **Credit** - We will credit you in the security advisory (if desired)

---

## 🎯 Severity Levels

We use the following severity levels:

### Critical 🔴
- Remote code execution
- SQL injection
- Authentication bypass
- Data breach

**Response Time:** Immediate (< 24 hours)

### High 🟠
- XSS vulnerabilities
- CSRF attacks
- Privilege escalation
- Sensitive data exposure

**Response Time:** < 3 days

### Medium 🟡
- Security misconfigurations
- Weak authentication
- Information disclosure
- Missing security headers

**Response Time:** < 7 days

### Low 🟢
- Minor security improvements
- Best practice violations
- Deprecated dependencies

**Response Time:** Next regular release

---

## 🔐 Best Practices for Users

### For Administrators

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Include uppercase, lowercase, numbers, and symbols
   - Use a password manager
   - Never reuse passwords

2. **Enable 2FA** (when available)
   - Use authenticator app (not SMS)
   - Keep backup codes secure

3. **Keep Software Updated**
   - Apply security patches immediately
   - Monitor security advisories
   - Subscribe to security notifications

4. **Secure Environment Variables**
   - Never commit `.env` files
   - Use strong secrets (32+ characters)
   - Rotate keys regularly
   - Use different keys for each environment

5. **Monitor Logs**
   - Review activity logs regularly
   - Set up alerts for suspicious activity
   - Investigate anomalies

### For Developers

1. **Code Security**
   - Never commit secrets
   - Use environment variables
   - Validate all inputs
   - Sanitize outputs
   - Follow OWASP Top 10

2. **Dependencies**
   - Keep dependencies updated
   - Run `npm audit` regularly
   - Use `npm audit fix`
   - Review security advisories

3. **Testing**
   - Write security tests
   - Test authentication flows
   - Test authorization rules
   - Test input validation

4. **Reviews**
   - Require code reviews
   - Review security-sensitive changes carefully
   - Use security checklists

---

## 🔍 Security Checklist

### Pre-Deployment

- [ ] All dependencies are up to date
- [ ] No critical vulnerabilities (`npm audit`)
- [ ] Environment variables are set correctly
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] CSP is properly configured
- [ ] Rate limiting is enabled
- [ ] Error messages don't leak sensitive info
- [ ] Logging is configured (no sensitive data)
- [ ] Authentication flows are tested
- [ ] Authorization rules are tested
- [ ] Input validation is comprehensive
- [ ] XSS protection is enabled
- [ ] CSRF protection is enabled

### Post-Deployment

- [ ] Monitor error rates
- [ ] Review security logs
- [ ] Test in production environment
- [ ] Verify all endpoints require authentication
- [ ] Check for open security issues
- [ ] Review access logs
- [ ] Test backup and recovery

---

## 📚 Security Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [SonarQube](https://www.sonarqube.org/)

### Learning
- [Web Security Academy](https://portswigger.net/web-security)
- [HackerOne University](https://www.hackerone.com/hackers/hacker101)
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)

---

## 🏆 Security Hall of Fame

We recognize and thank security researchers who responsibly disclose vulnerabilities:

<!-- Will be updated as reports come in -->

---

## 📝 Security Advisories

All security advisories will be published at:
- [GitHub Security Advisories](https://github.com/educourse/educourse/security/advisories)
- [Security Page](https://educourse.vn/security)

Subscribe to receive notifications:
```bash
# Watch repository -> Custom -> Security alerts
```

---

## 🤝 Security Team

For security-related inquiries:

- **Email:** security@educourse.vn
- **Response Time:** 24 hours
- **PGP Key:** Available upon request

---

## ⚖️ Legal

### Responsible Disclosure

By reporting vulnerabilities responsibly, you help us:
- Protect our users
- Improve our security
- Build trust in our platform

### Safe Harbor

We support security research and will not pursue legal action against researchers who:
- Make good faith efforts to comply with this policy
- Do not access or modify user data
- Do not disrupt our services
- Do not publicly disclose vulnerabilities before we fix them

---

## 📅 Last Updated

This security policy was last updated on: **April 6, 2026**

---

Thank you for helping keep EduCourse and our users safe! 🛡️
