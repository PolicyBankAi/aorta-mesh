# SSL/TLS Configuration for AORTA Mesh™

## Overview

AORTA Mesh™ includes automatic Let's Encrypt SSL certificate management for production deployments, providing enterprise-grade security with minimal configuration.

## Environment Variables

To enable SSL/TLS, configure the following environment variables:

### Required for SSL
```bash
NODE_ENV=production
ENABLE_SSL=true
SSL_EMAIL=admin@aortatrace.org
REPLIT_DOMAINS=aortatrace.org,www.aortatrace.org
```

### Optional SSL Configuration
```bash
SSL_STAGING=false  # Set to 'true' for Let's Encrypt staging (testing)
```

## How It Works

### Production SSL (Let's Encrypt)
- Automatically obtains and renews SSL certificates
- Uses ACME HTTP-01 challenge for domain validation
- Certificates stored in `ssl/greenlock.d/` directory
- Supports multiple domains/subdomains
- Automatic renewal every 90 days

### Development Mode
- Generates self-signed certificates if OpenSSL available
- Falls back to HTTP if SSL setup fails
- No manual certificate management required

## SSL Certificate Process

1. **Automatic Setup**: When `ENABLE_SSL=true` and `NODE_ENV=production`
2. **Domain Validation**: Let's Encrypt validates domain ownership via HTTP-01 challenge
3. **Certificate Installation**: Certificates automatically installed and configured
4. **HTTPS Redirect**: HTTP traffic automatically redirected to HTTPS
5. **Auto-Renewal**: Certificates renewed automatically before expiration

## Security Features

- **HSTS**: HTTP Strict Transport Security enabled
- **Perfect Forward Secrecy**: Modern cipher suites only
- **TLS 1.2+**: Older protocols disabled
- **Certificate Transparency**: All certificates logged to CT logs

## Deployment Checklist

### Before Enabling SSL
- [ ] Domain DNS pointed to deployment server
- [ ] Firewall allows HTTP (80) and HTTPS (443) traffic
- [ ] Valid email address for Let's Encrypt notifications
- [ ] Backup strategy for SSL certificates

### Environment Configuration
- [ ] `NODE_ENV=production`
- [ ] `ENABLE_SSL=true`
- [ ] `SSL_EMAIL` set to admin email
- [ ] `REPLIT_DOMAINS` includes all domains/subdomains

### Testing
- [ ] Test with `SSL_STAGING=true` first
- [ ] Verify certificate installation
- [ ] Check HTTPS redirect works
- [ ] Validate all domains in certificate

## Troubleshooting

### Common Issues

**SSL Setup Failed**
- Check domain DNS configuration
- Verify firewall allows port 80/443
- Ensure email address is valid
- Check Let's Encrypt rate limits

**Certificate Not Renewing**
- Check disk space in `ssl/greenlock.d/`
- Verify domain still points to server
- Check Let's Encrypt logs

**Development Issues**
- SSL disabled in development by default
- Self-signed certificates auto-generated if needed
- Falls back to HTTP if certificate generation fails

### Logs
SSL setup logs include:
- Certificate acquisition status
- Renewal attempts
- Error messages with troubleshooting hints

## Security Best Practices

1. **Use Strong Domains**: Avoid easily guessable subdomains
2. **Monitor Certificates**: Set up alerts for expiration
3. **Regular Updates**: Keep SSL dependencies updated
4. **Backup Certificates**: Include SSL certificates in backups
5. **Test Renewals**: Periodically test automatic renewal

## Production Deployment

For `aortatrace.org` deployment:

```bash
# Environment Variables
NODE_ENV=production
ENABLE_SSL=true
SSL_EMAIL=admin@aortatrace.org
REPLIT_DOMAINS=aortatrace.org,www.aortatrace.org
```

The system will automatically:
1. Obtain SSL certificates for both domains
2. Configure HTTPS with security headers
3. Redirect HTTP to HTTPS
4. Set up automatic renewal

## Support

For SSL-related issues:
- Check application logs for SSL setup messages
- Verify domain configuration
- Contact support with specific error messages
- Include SSL staging test results