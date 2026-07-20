"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadFileMutation } from "@/store/api/uploadApi";
import { useUpdateProjectThumbnailMutation } from "@/store/api/projectsApi";
import { toast } from "sonner";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface UpdateThumbnailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  currentThumbnail?: string;
}

export function UpdateThumbnailModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  currentThumbnail,
}: UpdateThumbnailModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [updateThumbnail, { isLoading: isUpdating }] =
    useUpdateProjectThumbnailMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const uploadResponse = await uploadFile({ formData }).unwrap();
      
      if (!uploadResponse.success || !uploadResponse.data?.url) {
        throw new Error("Failed to upload image");
      }

      // 2. Update project with new URL
      await updateThumbnail({
        projectId,
        thumbnailUrl: uploadResponse.data.url,
      }).unwrap();

      toast.success("Thumbnail updated successfully");
      onClose();
    } catch (error: any) {
      console.error("Failed to update thumbnail:", error);
      toast.error(error?.data?.message || "Failed to update thumbnail");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Thumbnail</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 gap-4">
          <div className="relative w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted flex items-center justify-center">
            {previewUrl || currentThumbnail ? (
              <img
                src={previewUrl || currentThumbnail}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="w-10 h-10" />
                <span className="text-sm">No image selected</span>
              </div>
            )}
            
            {previewUrl && (
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background shadow-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="w-full">
            <Label
              htmlFor="thumbnail-upload"
              className="flex items-center justify-center gap-2 w-full h-12 bg-muted hover:bg-muted/80 rounded-lg cursor-pointer transition-colors border border-border"
            >
              <Upload className="w-4 h-4" />
              <span className="font-medium">Choose File</span>
              <Input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isUploading || isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!selectedFile || isUploading || isUpdating}
            className="bg-primary text-primary-foreground min-w-[100px]"
          >
            {isUploading || isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
