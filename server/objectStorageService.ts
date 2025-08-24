import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";

export enum ObjectPermission {
  READ = "read",
  WRITE = "write",
}

export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: process.env.GCP_PROJECT_ID || "",
});

export class ObjectStorageService {
  getPublicObjectSearchPaths(): string[] {
    const raw = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Configure at least one bucket path."
      );
    }

    return [...new Set(paths)];
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR;
    if (!dir) {
      throw new Error("PRIVATE_OBJECT_DIR not set.");
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const file = objectStorageClient.bucket(bucketName).file(objectName);

      try {
        const [exists] = await file.exists();
        if (exists) return file;
      } catch (err) {
        console.error("Error checking public object existence:", err);
      }
    }
    return null;
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const entityId = objectPath.slice("/objects/".length);
    const fullPath = `${this.getPrivateObjectDir()}/uploads/${entityId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    const file = objectStorageClient.bucket(bucketName).file(objectName);

    const [exists] = await file.exists();
    if (!exists) throw new ObjectNotFoundError();

    return file;
  }

  async downloadObject(
    file: File,
    res: Response,
    cacheTtlSec = 3600
  ): Promise<void> {
    try {
      const [metadata] = await file.getMetadata();

      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `private, max-age=${cacheTtlSec}`,
      });

      const stream = file.createReadStream();

      // Handle early disconnect
      res.on("close", () => stream.destroy());

      stream.on("error", (err) => {
        console.error("Download stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (err) {
      console.error("Error downloading object:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    const fullPath = `${this.getPrivateObjectDir()}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) return rawPath;

    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
    const base = this.getPrivateObjectDir();

    if (!rawObjectPath.startsWith(base)) return rawObjectPath;

    const entityId = rawObjectPath.slice(base.length).replace(/^\/+/, "");
    return `/objects/${entityId}`;
  }

  async canAccessObjectEntity({
    userId,
  }: {
    userId?: string;
    objectFile: File;
  }): Promise<boolean> {
    // Simple rule: require authentication
    return !!userId;
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  const parts = path.replace(/^\//, "").split("/");
  if (parts.length < 2) {
    throw new Error(`Invalid object path: ${path}`);
  }
  return {
    bucketName: parts[0],
    objectName: parts.slice(1).join("/"),
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket_name: bucketName,
        object_name: objectName,
        method,
        expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL (${response.status}): ${response.statusText}`
    );
  }

  const { signed_url } = await response.json();
  return signed_url;
}
