/**
 * Secrets Management Service
 * Integration with HashiCorp Vault and cloud KMS providers
 * Automated key rotation and secure secrets handling
 */

import crypto from 'crypto';
import { securityLogger } from './security';

// Configuration for different secret backends
export interface SecretsConfig {
  provider: 'vault' | 'aws-kms' | 'gcp-kms' | 'azure-kv' | 'local';
  endpoint?: string;
  auth?: {
    token?: string;
    roleId?: string;
    secretId?: string;
    awsRegion?: string;
    gcpProjectId?: string;
    azureTenantId?: string;
  };
}

// Secret metadata for tracking and rotation
export interface SecretMetadata {
  key: string;
  version: number;
  createdAt: string;
  rotatedAt?: string;
  nextRotation: string;
  algorithm: string;
  keyLength: number;
}

/**
 * Abstract base class for secrets management
 */
abstract class SecretsProvider {
  protected config: SecretsConfig;
  
  constructor(config: SecretsConfig) {
    this.config = config;
  }
  
  abstract getSecret(key: string): Promise<string | null>;
  abstract setSecret(key: string, value: string, metadata?: Partial<SecretMetadata>): Promise<void>;
  abstract rotateSecret(key: string): Promise<string>;
  abstract deleteSecret(key: string): Promise<void>;
  abstract listSecrets(): Promise<SecretMetadata[]>;
}

/**
 * HashiCorp Vault implementation
 */
class VaultSecretsProvider extends SecretsProvider {
  private vaultToken: string;
  
  constructor(config: SecretsConfig) {
    super(config);
    this.vaultToken = config.auth?.token || process.env.VAULT_TOKEN || '';
  }
  
  async getSecret(key: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.config.endpoint}/v1/secret/data/${key}`, {
        headers: {
          'X-Vault-Token': this.vaultToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Vault error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data?.data?.value || null;
    } catch (error) {
      securityLogger.error('Vault: Failed to get secret', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
  
  async setSecret(key: string, value: string, metadata?: Partial<SecretMetadata>): Promise<void> {
    try {
      const secretData = {
        data: {
          value,
          metadata: {
            ...metadata,
            createdAt: new Date().toISOString(),
            provider: 'vault'
          }
        }
      };
      
      const response = await fetch(`${this.config.endpoint}/v1/secret/data/${key}`, {
        method: 'POST',
        headers: {
          'X-Vault-Token': this.vaultToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(secretData)
      });
      
      if (!response.ok) {
        throw new Error(`Vault error: ${response.statusText}`);
      }
      
      securityLogger.info('Vault: Secret stored successfully', { key });
    } catch (error) {
      securityLogger.error('Vault: Failed to set secret', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
  
  async rotateSecret(key: string): Promise<string> {
    try {
      // Generate new encryption key
      const newSecret = crypto.randomBytes(32).toString('hex');
      
      // Store new secret with rotation metadata
      await this.setSecret(key, newSecret, {
        rotatedAt: new Date().toISOString(),
        nextRotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
      });
      
      securityLogger.info('Vault: Secret rotated successfully', { key });
      return newSecret;
    } catch (error) {
      securityLogger.error('Vault: Failed to rotate secret', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
  
  async deleteSecret(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.endpoint}/v1/secret/metadata/${key}`, {
        method: 'DELETE',
        headers: {
          'X-Vault-Token': this.vaultToken
        }
      });
      
      if (!response.ok) {
        throw new Error(`Vault error: ${response.statusText}`);
      }
      
      securityLogger.info('Vault: Secret deleted successfully', { key });
    } catch (error) {
      securityLogger.error('Vault: Failed to delete secret', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
  
  async listSecrets(): Promise<SecretMetadata[]> {
    try {
      const response = await fetch(`${this.config.endpoint}/v1/secret/metadata`, {
        method: 'LIST',
        headers: {
          'X-Vault-Token': this.vaultToken
        }
      });
      
      if (!response.ok) {
        throw new Error(`Vault error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data?.keys?.map((key: string) => ({
        key,
        version: 1,
        createdAt: new Date().toISOString(),
        nextRotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        algorithm: 'AES-256-GCM',
        keyLength: 256
      })) || [];
    } catch (error) {
      securityLogger.error('Vault: Failed to list secrets', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

/**
 * AWS KMS implementation
 */
class AWSKMSSecretsProvider extends SecretsProvider {
  async getSecret(key: string): Promise<string | null> {
    // TODO: Implement AWS KMS integration
    // Use AWS SDK to decrypt secrets
    securityLogger.info('AWS KMS: Getting secret', { key });
    return process.env[key] || null;
  }
  
  async setSecret(key: string, value: string): Promise<void> {
    // TODO: Implement AWS KMS secret storage
    securityLogger.info('AWS KMS: Setting secret', { key });
  }
  
  async rotateSecret(key: string): Promise<string> {
    // TODO: Implement AWS KMS key rotation
    const newSecret = crypto.randomBytes(32).toString('hex');
    securityLogger.info('AWS KMS: Rotating secret', { key });
    return newSecret;
  }
  
  async deleteSecret(key: string): Promise<void> {
    securityLogger.info('AWS KMS: Deleting secret', { key });
  }
  
  async listSecrets(): Promise<SecretMetadata[]> {
    return [];
  }
}

/**
 * Local development secrets provider
 */
class LocalSecretsProvider extends SecretsProvider {
  private secrets: Map<string, { value: string; metadata: SecretMetadata }> = new Map();
  
  async getSecret(key: string): Promise<string | null> {
    // First check environment variables
    const envValue = process.env[key];
    if (envValue) return envValue;
    
    // Then check in-memory storage
    const stored = this.secrets.get(key);
    return stored?.value || null;
  }
  
  async setSecret(key: string, value: string, metadata?: Partial<SecretMetadata>): Promise<void> {
    const secretMetadata: SecretMetadata = {
      key,
      version: 1,
      createdAt: new Date().toISOString(),
      nextRotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      algorithm: 'AES-256-GCM',
      keyLength: 256,
      ...metadata
    };
    
    this.secrets.set(key, { value, metadata: secretMetadata });
    securityLogger.info('Local: Secret stored', { key });
  }
  
  async rotateSecret(key: string): Promise<string> {
    const newSecret = crypto.randomBytes(32).toString('hex');
    await this.setSecret(key, newSecret, {
      rotatedAt: new Date().toISOString()
    });
    return newSecret;
  }
  
  async deleteSecret(key: string): Promise<void> {
    this.secrets.delete(key);
    securityLogger.info('Local: Secret deleted', { key });
  }
  
  async listSecrets(): Promise<SecretMetadata[]> {
    return Array.from(this.secrets.values()).map(s => s.metadata);
  }
}

/**
 * Secrets Manager - Main interface
 */
export class SecretsManager {
  private provider: SecretsProvider;
  
  constructor(config: SecretsConfig = { provider: 'local' }) {
    switch (config.provider) {
      case 'vault':
        this.provider = new VaultSecretsProvider(config);
        break;
      case 'aws-kms':
        this.provider = new AWSKMSSecretsProvider(config);
        break;
      case 'local':
      default:
        this.provider = new LocalSecretsProvider(config);
        break;
    }
    
    securityLogger.info('Secrets Manager initialized', { provider: config.provider });
  }
  
  async getSecret(key: string): Promise<string | null> {
    return this.provider.getSecret(key);
  }
  
  async setSecret(key: string, value: string, metadata?: Partial<SecretMetadata>): Promise<void> {
    return this.provider.setSecret(key, value, metadata);
  }
  
  async rotateSecret(key: string): Promise<string> {
    securityLogger.info('Rotating secret', { key });
    return this.provider.rotateSecret(key);
  }
  
  async rotateAllSecrets(): Promise<void> {
    const secrets = await this.provider.listSecrets();
    const now = new Date();
    
    for (const secret of secrets) {
      const nextRotation = new Date(secret.nextRotation);
      if (now >= nextRotation) {
        try {
          await this.rotateSecret(secret.key);
          securityLogger.info('Automatic rotation completed', { key: secret.key });
        } catch (error) {
          securityLogger.error('Automatic rotation failed', {
            key: secret.key,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
  }
  
  async deleteSecret(key: string): Promise<void> {
    return this.provider.deleteSecret(key);
  }
  
  async listSecrets(): Promise<SecretMetadata[]> {
    return this.provider.listSecrets();
  }
}

// Global secrets manager instance
export const secretsManager = new SecretsManager({
  provider: process.env.SECRETS_PROVIDER as any || 'local',
  endpoint: process.env.VAULT_ENDPOINT,
  auth: {
    token: process.env.VAULT_TOKEN,
    awsRegion: process.env.AWS_REGION,
    gcpProjectId: process.env.GCP_PROJECT_ID
  }
});

/**
 * Schedule automatic key rotation
 */
export function scheduleKeyRotation(): void {
  // Check for keys to rotate every 6 hours
  setInterval(async () => {
    try {
      await secretsManager.rotateAllSecrets();
    } catch (error) {
      securityLogger.error('Scheduled key rotation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, 6 * 60 * 60 * 1000); // 6 hours
  
  securityLogger.info('Automatic key rotation scheduled');
}

/**
 * Initialize secrets on startup
 */
export async function initializeSecrets(): Promise<void> {
  try {
    // Generate database encryption key if not exists
    const dbEncryptionKey = await secretsManager.getSecret('DATABASE_ENCRYPTION_KEY');
    if (!dbEncryptionKey) {
      const newKey = crypto.randomBytes(32).toString('hex');
      await secretsManager.setSecret('DATABASE_ENCRYPTION_KEY', newKey, {
        algorithm: 'AES-256-GCM',
        keyLength: 256
      });
      securityLogger.info('Database encryption key generated');
    }
    
    // Generate session secret if not exists
    const sessionSecret = await secretsManager.getSecret('SESSION_SECRET');
    if (!sessionSecret) {
      const newSecret = crypto.randomBytes(64).toString('hex');
      await secretsManager.setSecret('SESSION_SECRET', newSecret);
      securityLogger.info('Session secret generated');
    }
    
    // Initialize JWT secrets
    const jwtSecret = await secretsManager.getSecret('JWT_SECRET');
    if (!jwtSecret) {
      const newSecret = crypto.randomBytes(64).toString('hex');
      await secretsManager.setSecret('JWT_SECRET', newSecret);
      securityLogger.info('JWT secret generated');
    }
    
    securityLogger.info('Secrets initialization completed');
  } catch (error) {
    securityLogger.error('Secrets initialization failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}