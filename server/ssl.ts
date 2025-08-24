import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import type { Express } from "express";

export const sslConfig = {
  letsEncrypt: {
    enabled:
      process.env.NODE_ENV === "production" &&
      process.env.ENABLE_SSL === "true",
    email: process.env.SSL_EMAIL || "admin@aortatrace.org",
    domains:
      process.env.REPLIT_DOMAINS?.split(",").map((d) => d.trim()) || [
        "aortatrace.org",
        "www.aortatrace.org",
      ],
    staging: process.env.SSL_STAGING === "true",
    configDir: path.resolve("ssl", "greenlock.d"),
    cluster: false,
    packageRoot: path.resolve(),
  },
  development: {
    key: path.resolve("ssl", "dev-key.pem"),
    cert: path.resolve("ssl", "dev-cert.pem"),
  },
};

export function ensureSSLDirectory() {
  const sslDir = path.resolve("ssl");
  const greenlockDir = sslConfig.letsEncrypt.configDir;

  [sslDir, greenlockDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

export function generateDevCertificates(): { key: string; cert: string } | null {
  const keyPath = sslConfig.development.key;
  const certPath = sslConfig.development.cert;

  try {
    // Check if certs already exist
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return { key: keyPath, cert: certPath };
    }

    console.log("🔐 Generating self-signed SSL certificates for development...");
    ensureSSLDirectory();

    execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: "ignore" });
    execSync(
      `openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/C=US/ST=State/L=City/O=AORTA Mesh/CN=localhost"`,
      { stdio: "ignore" }
    );

    console.log("✅ Self-signed SSL certificates generated");
    return { key: keyPath, cert: certPath };
  } catch (error) {
    console.warn(
      "⚠️ Could not generate self-signed certificates, falling back to HTTP:",
      (error as Error).message
    );
    return null;
  }
}

export function setupSSL(app: Express) {
  const isProduction = process.env.NODE_ENV === "production";
  const enableSSL = process.env.ENABLE_SSL === "true";

  if (!isProduction || !enableSSL) {
    console.log("🔓 Running in HTTP mode (development or SSL disabled)");
    return { app, ssl: false, type: "http" as const };
  }

  try {
    ensureSSLDirectory();

    const greenlock = require("greenlock-express");
    const glx = greenlock.init({
      packageRoot: sslConfig.letsEncrypt.packageRoot,
      configDir: sslConfig.letsEncrypt.configDir,
      maintainerEmail: sslConfig.letsEncrypt.email,
      cluster: sslConfig.letsEncrypt.cluster,
      staging: sslConfig.letsEncrypt.staging,
    });

    sslConfig.letsEncrypt.domains.forEach((domain: string) => {
      glx.manager.defaults({
        agreeToTerms: true,
        subscriberEmail: sslConfig.letsEncrypt.email,
        subject: domain,
        altnames: [domain],
      });
    });

    const httpsApp = glx.serve(app);

    console.log(
      "🔒 Let's Encrypt SSL enabled for domains:",
      sslConfig.letsEncrypt.domains
    );
    return { app: httpsApp, ssl: true, type: "letsencrypt" as const };
  } catch (error) {
    console.error(
      "❌ Let's Encrypt setup failed, falling back to self-signed certs:",
      (error as Error).message
    );

    const devCerts = generateDevCertificates();
    if (!devCerts?.key || !devCerts?.cert) {
      console.log("🔓 Falling back to HTTP mode");
      return { app, ssl: false, type: "http" as const };
    }

    const https = require("https");
    const httpsServer = https.createServer(
      {
        key: fs.readFileSync(devCerts.key),
        cert: fs.readFileSync(devCerts.cert),
      },
      app
    );

    console.log("🔒 Using self-signed SSL certificates (development fallback)");
    return { app: httpsServer, ssl: true, type: "self-signed" as const };
  }
}
