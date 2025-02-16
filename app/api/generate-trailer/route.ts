import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get("image") as File
    const prompt = formData.get("prompt") as string
    const apiToken = formData.get("apiToken") as string

    if (!image || !prompt || !apiToken) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    // Convert File to Buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const replicate = new Replicate({
      auth: apiToken,
    })

    console.log('Starting video generation...')
    
    const output = await replicate.run(
      "minimax/video-01",
      {
        input: {
          prompt: prompt,
          subject_reference: buffer
        }
      }
    )

    console.log('Generation complete:', output)

    return NextResponse.json({ 
      present: {
        script: prompt,
        video_url: output
      }
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate video"
    }, { status: 500 })
  }
}

export const maxDuration = 300 // 5 minutes

