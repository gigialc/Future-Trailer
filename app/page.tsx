"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [currentState, setCurrentState] = useState("")
  const [apiToken, setApiToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [error, setError] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return

    setIsLoading(true)
    setVideoUrl("")
    setError("")

    const formData = new FormData()
    formData.append("image", imageFile)
    formData.append("prompt", currentState)
    formData.append("apiToken", apiToken)

    try {
      const response = await fetch("/api/generate-trailer", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate video")
      }

      setVideoUrl(data.present.video_url)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Failed to generate video. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl mx-auto p-4">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl">Video Generator</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter Replicate API Token"
              className="w-full px-3 py-2 text-sm border rounded"
              required
            />

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                  required
                />
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('imageUpload')?.click()}
                  variant="outline"
                  size="sm"
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Button>
                {imagePreview && (
                  <span className="text-sm text-green-600">
                    ✓ Image selected
                  </span>
                )}
              </div>
              
              {imagePreview && (
                <div className="border rounded-lg p-2 bg-gray-50">
                  <h3 className="text-sm font-medium mb-2">Reference Image:</h3>
                  <Image
                    width={300}
                    height={300}
                    src={imagePreview}
                    alt="Reference"
                    className="rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Textarea
                value={currentState}
                onChange={(e) => setCurrentState(e.target.value)}
                placeholder="Describe what you want to see in the video..."
                className="h-20"
                required
              />
              <Button
                type="submit"
                disabled={!imageFile || !currentState || !apiToken || isLoading}
                size="sm"
              >
                {isLoading ? "Generating..." : "Generate Video"}
              </Button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {videoUrl && (
            <div className="mt-6 space-y-2">
              <video 
                controls 
                className="w-full rounded-lg border"
                src={videoUrl}
              />
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto"
                asChild
              >
                <a 
                  href={videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Open in new tab
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

