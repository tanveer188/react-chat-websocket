import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface FileInputProps {
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}


export function FileInput({ selectedFiles, setSelectedFiles }: FileInputProps) {
  const [selectedFileType, setSelectedFileType] = useState<string>("file")
  const [showDropdown, setShowDropdown] = useState(false)

  const fileTypes = [
    { value: "file", label: "File" },
    { value: "video", label: "Video" },
    { value: "other", label: "Other" },
  ]

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);
    }
  };
  return (
    <div className="grid w-fit max-w-sm items-center gap-1.5">
     
      <div className="relative inline-block">   
        {/* {showDropdown && (
          <div className="absolute bg-white shadow-md border rounded-md p-2 w-32">
            {fileTypes.map((type) => (
              <button
                key={type.value}
                className="w-full text-left px-2 py-1 hover:bg-gray-200"
                onClick={() => {
                  setSelectedFileType(type.value)
                  document.getElementById("file")?.click()
                  setShowDropdown(false)
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        )} */}
        <input
          id="file"
          type="file"
          className="hidden"
          accept={selectedFileType === "video" ? "video/*" : undefined}
          onChange={handleFileChange}
          multiple
        />
        <Button size="sm" onClick={() => {document.getElementById("file")?.click()}}>
          +
        </Button>

        
      </div>
    </div>
  )
}
