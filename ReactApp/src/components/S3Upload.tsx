import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Link } from "lucide-react";
import { toast } from "sonner";

interface S3UploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function S3Upload({ value, onChange, label = "Image" }: S3UploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/presigned-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!res.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, fileUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload to S3");
      }

      onChange(fileUrl);
      toast.success("Image uploaded!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      try {
        new URL(urlInput.trim());
        onChange(urlInput.trim());
        setUrlInput("");
        setShowUrlInput(false);
        toast.success("Image URL added!");
      } catch {
        toast.error("Invalid URL");
      }
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
            onClick={() => onChange("")}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" disabled={uploading} asChild>
              <label>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowUrlInput(!showUrlInput)}>
              <Link className="w-4 h-4" />
            </Button>
          </div>
          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button type="button" onClick={handleUrlSubmit}>Add</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
