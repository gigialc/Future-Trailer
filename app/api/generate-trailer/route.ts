import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import sharp from "sharp"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const images = formData.getAll("images") as File[]
  const currentState = formData.get("currentState") as string
  const futureState = formData.get("futureState") as string
  const pathToFuture = formData.get("pathToFuture") as string

  if (images.length === 0 || !currentState || !futureState || !pathToFuture) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Process images
  const processedImages = await Promise.all(
    images.map(async (image) => {
      const buffer = Buffer.from(await image.arrayBuffer())
      const processedBuffer = await sharp(buffer).resize(300, 300, { fit: "inside" }).toBuffer()
      return processedBuffer.toString("base64")
    }),
  )

  // Generate content using AI
  const prompt = `Based on the following information and images, create a short, inspiring script for a future trailer:
    Images: ${processedImages.map((img, i) => `Image ${i + 1}: [base64 encoded image]`).join("\n")}
    Current State: ${currentState}
    Future State: ${futureState}
    Path to Future: ${pathToFuture}
    
    The script should be dramatic and inspiring, suitable for a short video trailer about the user's journey from their current state to their desired future. Include specific details from the images and the provided information. Structure the script in three parts:
    1. The Present: Describe the user's current situation, highlighting both challenges and achievements.
    2. The Future: Paint a vivid picture of the user's desired future state, emphasizing their goals and aspirations.
    3. The Journey: Outline the path from present to future, incorporating the user's strategy and milestones.
    
    Use emotive language and create a sense of progression and transformation throughout the script.`

  const result = streamText({
    model: openai("gpt-4o"),
    prompt,
  })

  const { text: script } = await result.text

  // For now, we'll return the script. In a real application, you'd use this script to generate a video.
  return NextResponse.json({ script })
}

export const maxDuration = 60 // Set max duration to 60 seconds

