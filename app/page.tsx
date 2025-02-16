"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import { LoadingAnimation } from "./components/loading-animation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Settings } from "lucide-react"

function SettingsDialog({ apiToken, onApiTokenChange }: { apiToken: string, onApiTokenChange: (token: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Replicate API Token</label>
            <Input
              type="password"
              value={apiToken}
              onChange={(e) => onApiTokenChange(e.target.value)}
              placeholder="Enter your API token"
            />
            <p className="text-xs text-gray-500">
              Get your API token from{" "}
              <a href="https://replicate.com/account" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                replicate.com/account
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [currentState, setCurrentState] = useState("")
  const [apiToken, setApiToken] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('replicateApiToken') || ""
    }
    return ""
  })
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

    try {
      setError("Uploading image and generating video (this may take a few minutes)...")
      
      const formData = new FormData()
      formData.append("image", imageFile)
      formData.append("prompt", currentState)
      formData.append("apiToken", apiToken)

      const response = await fetch("/api/generate-trailer", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate video")
      }

      setError("")
      setVideoUrl(data.present.video_url)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Failed to generate video. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApiTokenChange = (token: string) => {
    setApiToken(token)
    localStorage.setItem('replicateApiToken', token)
  }

  return (
    <main className="container max-w-2xl mx-auto p-4">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Future Trailer Generator</CardTitle>
            <SettingsDialog 
              apiToken={apiToken}
              onApiTokenChange={handleApiTokenChange}
            />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && !isLoading && (
            <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="mt-6">
              <LoadingAnimation />
              <div className="mt-4 text-sm text-blue-600 bg-blue-50 rounded-lg border border-blue-200 p-3">
                {error || "Processing your request..."}
              </div>
            </div>
          )}

          {videoUrl && !isLoading && (
            <div className="mt-6 space-y-2">
              <div className="rounded-lg border overflow-hidden">
                <video 
                  controls 
                  className="w-full"
                  src={videoUrl}
                  poster={imagePreview}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Video generated successfully!
                </p>
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
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

