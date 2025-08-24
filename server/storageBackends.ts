// server/storageBackends.ts
// Stubs for CloudTrail and Elasticsearch backends used in immutableAuditLog.ts

import { AuditStorageBackend, ImmutableAuditEntry, AuditSearchQuery } from "./immutableAuditLog";

export class CloudTrailStorage implements AuditStorageBackend {
  async append(entry: ImmutableAuditEntry): Promise<void> {
    // TODO: real AWS CloudTrail integration
    return;
  }
  async verify(entries: ImmutableAuditEntry[]): Promise<boolean> {
    return true;
  }
  async search(query: AuditSearchQuery): Promise<ImmutableAuditEntry[]> {
    return [];
  }
  async export(startDate: Date, endDate: Date): Promise<ImmutableAuditEntry[]> {
    return [];
  }
}

export class ElasticsearchWORMStorage implements AuditStorageBackend {
  async append(entry: ImmutableAuditEntry): Promise<void> {
    // TODO: real Elasticsearch WORM integration
    return;
  }
  async verify(entries: ImmutableAuditEntry[]): Promise<boolean> {
    return true;
  }
  async search(query: AuditSearchQuery): Promise<ImmutableAuditEntry[]> {
    return [];
  }
  async export(startDate: Date, endDate: Date): Promise<ImmutableAuditEntry[]> {
    return [];
  }
}

