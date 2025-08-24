import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[]; // NEW: restrict file types
  caseId: string; // NEW: link to transplant case
  userId: string; // NEW: track who uploaded
  userRole: string; // NEW: track RBAC context
  onGetUploadParameters: () => Promise<{ method: "PUT"; url: string }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * Secure File Uploader for AORTA Mesh
 * Features:
 * - Restricts file types & sizes
 * - Logs upload with caseId, userId, userRole
 * - Uses presigned S3 URLs (no direct credentials)
 * - Provides audit trail integration
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB
  allowedFileTypes = [".pdf", ".jpg", ".jpeg", ".png", ".tif", ".docx"],
  caseId,
  userId,
  userRole,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes, // enforce file type restrictions
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        // 🔒 Secure logging for audit binder
        console.log("📂 Upload completed:", {
          caseId,
          userId,
          userRole,
          files: result.successful.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        });

        toast({
          title: "Upload Complete",
          description: `${result.successful.length} file(s) uploaded successfully.`,
        });

        onComplete?.(result);
      })
  );

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName}>
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        note={`Allowed: ${allowedFileTypes.join(", ")} | Max size: ${
          maxFileSize / 1024 / 1024
        } MB`}
      />
    </div>
  );
}
