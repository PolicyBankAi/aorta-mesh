# 🔐 SSL/TLS Configuration for AORTA Mesh™

## 🌍 Overview
**AORTA Mesh™** includes **automatic Let's Encrypt SSL certificate management** for production deployments, delivering enterprise-grade encryption with minimal configuration.

---

## ⚙️ Environment Variables

### ✅ Required for SSL
```bash
NODE_ENV=production
ENABLE_SSL=true
SSL_EMAIL=admin@aortatrace.org
REPLIT_DOMAINS=aortatrace.org,www.aortatrace.org
⚙️ Optional
bash
Copy
Edit
SSL_STAGING=false   # Set to 'true' for Let's Encrypt staging (safe testing)
🔧 How It Works
🔑 Production SSL (Let's Encrypt)
Automated certificate issuance and renewal

Domain validation via ACME HTTP-01 challenge

Certificates stored in ssl/greenlock.d/

Multi-domain / subdomain support

Auto-renew every 90 days

🛠 Development Mode
Self-signed certificates auto-generated (if OpenSSL available)

Falls back to HTTP if SSL setup fails

No manual cert management required

📜 Certificate Lifecycle
Setup → Triggered when ENABLE_SSL=true & NODE_ENV=production

Validation → Let's Encrypt validates via HTTP-01 challenge

Installation → Certificates written and configured automatically

Enforcement → All HTTP redirected to HTTPS

Renewal → Auto-renewal before expiry (90-day cycle)

🛡 Security Features
HSTS → Strict Transport Security enabled

Perfect Forward Secrecy → Modern cipher suites only

TLS 1.2+ enforced → Older protocols disabled

Certificate Transparency → Logged in public CT logs

✅ Deployment Checklist
🔎 Pre-SSL
 DNS records point to production server

 Firewall allows ports 80 (HTTP) & 443 (HTTPS)

 Valid admin email configured

 Backup plan for SSL certs in place

⚙️ Environment Setup
 NODE_ENV=production

 ENABLE_SSL=true

 SSL_EMAIL configured

 REPLIT_DOMAINS includes all required domains/subdomains

🧪 Testing
 Test with SSL_STAGING=true before production

 Verify cert issuance success

 Confirm HTTP → HTTPS redirect

 Ensure all subdomains included in cert

🚨 Troubleshooting
Common Issues
❌ SSL Setup Failed

Check DNS propagation

Verify firewall ports 80/443

Confirm SSL_EMAIL is valid

Review Let's Encrypt rate limits

❌ Certificate Not Renewing

Check available disk space (ssl/greenlock.d/)

Confirm DNS points to server

Review Let's Encrypt renewal logs

⚙️ Development Mode

SSL disabled by default

Self-signed certs auto-generated if OpenSSL available

Falls back to HTTP if cert fails

🔎 Logs
SSL setup logs capture:

Certificate acquisition status

Renewal attempts

Error messages w/ troubleshooting guidance

🔐 Security Best Practices
Use strong domain naming conventions

Monitor certificate expiry (alerts recommended)

Keep SSL-related dependencies updated

Include certs in your backup strategy

Test renewal flow periodically

🚀 Production Deployment (aortatrace.org)
bash
Copy
Edit
NODE_ENV=production
ENABLE_SSL=true
SSL_EMAIL=admin@aortatrace.org
REPLIT_DOMAINS=aortatrace.org,www.aortatrace.org
When deployed, the system will automatically:

Issue SSL certs for aortatrace.org + www.aortatrace.org

Enforce HTTPS w/ secure headers

Redirect HTTP → HTTPS

Manage auto-renewal seamlessly

📞 Support
For SSL-related issues:

Inspect application logs for SSL setup output

Verify domain DNS configuration

Re-test with SSL_STAGING=true

Contact support with:

Error logs

Domain info

Staging test results
