"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function Home() {
  const [images, setImages] = useState<File[]>([])
  const [currentState, setCurrentState] = useState("")
  const [futureState, setFutureState] = useState("")
  const [pathToFuture, setPathToFuture] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [script, setScript] = useState("")
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [apiToken, setApiToken] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    images.forEach((image) => formData.append("images", image))
    formData.append("currentState", currentState)
    formData.append("futureState", futureState)
    formData.append("pathToFuture", pathToFuture)
    formData.append("apiToken", apiToken)

    try {
      const response = await fetch("/api/generate-trailer", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to generate trailer")
      }

      const data = await response.json()
      setScript(data.script)
      setVideoUrl(data.video_url)
    } catch (error) {
      console.error("Error generating trailer:", error)
      alert("Failed to generate trailer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Future Trailer Generator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Your Future Trailer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiToken" className="block text-sm font-medium mb-2">
                Replicate API Token
              </label>
              <Input
                id="apiToken"
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your Replicate API token"
                required
              />
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium mb-2">
                Upload Images (2-5 recommended)
              </label>
              <Input id="images" type="file" accept="image/*" multiple onChange={handleImageUpload} />
            </div>
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <Image
                  key={index}
                  src={URL.createObjectURL(image) || "/placeholder.svg"}
                  alt={`Uploaded image ${index + 1}`}
                  width={100}
                  height={100}
                  className="object-cover rounded"
                />
              ))}
            </div>
            <div>
              <label htmlFor="currentState" className="block text-sm font-medium mb-2">
                Where are you in life right now?
              </label>
              <Textarea
                id="currentState"
                value={currentState}
                onChange={(e) => setCurrentState(e.target.value)}
                placeholder="Describe your current situation, challenges, and achievements"
              />
            </div>
            <div>
              <label htmlFor="futureState" className="block text-sm font-medium mb-2">
                Where do you want to be in the future?
              </label>
              <Textarea
                id="futureState"
                value={futureState}
                onChange={(e) => setFutureState(e.target.value)}
                placeholder="Describe your goals, aspirations, and ideal future state"
              />
            </div>
            <div>
              <label htmlFor="pathToFuture" className="block text-sm font-medium mb-2">
                How do you plan to get there?
              </label>
              <Textarea
                id="pathToFuture"
                value={pathToFuture}
                onChange={(e) => setPathToFuture(e.target.value)}
                placeholder="Outline your strategy, steps, or milestones to achieve your future goals"
              />
            </div>
            <Button
              type="submit"
              disabled={images.length === 0 || !currentState || !futureState || !pathToFuture || !apiToken || isLoading}
            >
              {isLoading ? "Generating..." : "Generate Future Trailer"}
            </Button>
          </form>
        </CardContent>
        {(script || videoUrl) && (
          <CardFooter>
            <div className="w-full space-y-8">
              {script && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Your Future Trailer Script</h2>
                  <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{script}</pre>
                </div>
              )}
              {videoUrl && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Your Generated Video</h2>
                  <video 
                    controls 
                    className="w-full rounded border"
                    src={videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <a 
                    href={videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mt-2 inline-block"
                  >
                    Open video in new tab
                  </a>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </main>
  )
}

