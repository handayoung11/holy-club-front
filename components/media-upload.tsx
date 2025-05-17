"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"

interface MediaUploadProps {
  onImagesChange: (images: string[]) => void
  initialImages?: string[]
}

export function MediaUpload({ onImagesChange, initialImages = [] }: MediaUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      const updatedImages = [...images, ...newImages]
      setImages(updatedImages)
      onImagesChange(updatedImages)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border shadow-sm">
              <img
                src={image || "/placeholder.svg"}
                alt={`업로드 이미지 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div
        className="flex items-center justify-center border border-dashed rounded-lg h-32 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center">
          <Camera className="h-8 w-8 mb-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">스크린타임 등록</span>
          <span className="text-xs text-muted-foreground mt-1">사진을 업로드하세요</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          aria-label="미디어 이미지 업로드"
        />
      </div>
    </div>
  )
}
