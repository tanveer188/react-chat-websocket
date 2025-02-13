import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface FileInputProps {
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export function FileInput({ selectedFiles, setSelectedFiles }: FileInputProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const uniqueFiles = filesArray.filter(
        (file) => !selectedFiles.some((f) => f.name === file.name)
      );
      setSelectedFiles((prevFiles) => [...prevFiles, ...uniqueFiles]);
      setUploading(true);
      for (const file of uniqueFiles) {
        await uploadFile(file);
      }
      setUploading(false);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("http://localhost:3001/file/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: { loaded: number; total: number; }) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((prev) => ({ ...prev, [file.name]: percent }));
        },
      });
      console.log(`File uploaded: ${response.data.path}`);
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
    }
  };

  return (
    <div className="grid w-fit max-w-sm items-center gap-1.5">
      <input
        id="file"
        type="file"
        className="hidden"
        onChange={handleFileChange}
        multiple
      />
      <Button size="sm" onClick={() => document.getElementById("file")?.click()} disabled={uploading}>
        {uploading ? "Uploading..." : "+"}
      </Button>
    </div>
  );
}
