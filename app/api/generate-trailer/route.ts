import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get("image") as File
    const prompt = formData.get("prompt") as string
    const apiToken = formData.get("apiToken") as string

    if (!prompt || !apiToken) {
      return NextResponse.json({ 
        error: "Prompt and API token are required" 
      }, { status: 400 })
    }

    const replicate = new Replicate({
      auth: apiToken,
    })

    let modelInput: any = {
      mode: "text-to-video",
      prompt: prompt,
      num_frames: 150,
      fps: 25,
      width: 1280,
      height: 720,
      guidance_scale: 7.5,
      num_inference_steps: 50
    }

    // Add image if provided
    if (image) {
      const bytes = await image.arrayBuffer()
      const base64Image = Buffer.from(bytes).toString('base64')
      const dataUrl = `data:${image.type};base64,${base64Image}`
      modelInput.subject_reference = dataUrl
    }

    console.log('Starting video generation...')
    
    const output = await replicate.run(
      "minimax/video-01",
      { input: modelInput }
    )

    console.log('Generation complete:', output)

    return NextResponse.json({ 
      present: {
        script: prompt,
        video_url: Array.isArray(output) ? output[0] : output
      }
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate video"
    }, { status: 500 })
  }
}

export const maxDuration = 300

