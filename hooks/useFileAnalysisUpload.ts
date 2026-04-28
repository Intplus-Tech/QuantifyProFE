import { useState, useCallback } from "react";
import { 
  useUploadBimFileMutation, 
  useUploadPdfBoqMutation, 
  useUploadMultiBoqMutation 
} from "@/store/api/projectsApi";
import { toast } from "sonner";

export interface UploadResult {
  success: boolean;
  message?: string;
  data?: {
    jobId?: string;
    urn?: string;
  };
}

export function useFileAnalysisUpload() {
  const [uploadBimFile] = useUploadBimFileMutation();
  const [uploadPdfBoq] = useUploadPdfBoqMutation();
  const [uploadMultiBoq] = useUploadMultiBoqMutation();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = useCallback(async (
    files: File[], 
    formValues: { projectType?: string; location?: string; description?: string },
    supportedFormats: Record<string, string[]>
  ) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const onProgress = (percent: number) => setUploadProgress(percent);

      if (files.length > 1) {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));

        const hintParams = [formValues.projectType, formValues.location, formValues.description].filter(Boolean);
        if (hintParams.length > 0) {
          formData.append("documentHint", hintParams.join(", "));
        }

        const response = await uploadMultiBoq({ formData, onProgress }).unwrap();
        return { type: "multi", response };
      } else {
        const file = files[0];
        const formData = new FormData();
        formData.append("file", file);

        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        const isBimOrCad = 
          supportedFormats["3D_BIM"].includes(extension) || 
          supportedFormats["2D_CAD"].includes(extension);

        if (isBimOrCad) {
          const response = await uploadBimFile({ formData, onProgress }).unwrap();
          return { type: "bim", response };
        } else if (extension === ".pdf") {
          const response = await uploadPdfBoq({ formData, onProgress }).unwrap();
          return { type: "pdf", response };
        }
        throw new Error("Unsupported file format");
      }
    } catch (error: any) {
      console.error("Upload hook failed", error);
      toast.error(error?.data?.message || "File upload failed. Please try again.");
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [uploadBimFile, uploadPdfBoq, uploadMultiBoq]);

  return {
    isUploading,
    uploadProgress,
    handleUpload
  };
}

