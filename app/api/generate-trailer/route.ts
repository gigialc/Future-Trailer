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
      num_frames: 24,
      fps: 8,
      width: 576,
      height: 320,
      guidance_scale: 7.5,
      num_inference_steps: 30
    }

    // Add image if provided
    if (image) {
      const bytes = await image.arrayBuffer()
      const base64Image = Buffer.from(bytes).toString('base64')
      const dataUrl = `data:${image.type};base64,${base64Image}`
      modelInput.subject_reference = dataUrl
    }

    console.log('Starting video generation...')
    
    const prediction = await replicate.run(
      "minimax/video-01",
      { input: modelInput }
    )

    console.log('Raw prediction:', prediction)

    // Get the video URL from the prediction output
    const videoUrl = typeof prediction === 'object' && prediction !== null
      ? (prediction as any).output
      : prediction

    if (!videoUrl || typeof videoUrl !== 'string') {
      console.error('Invalid video URL:', videoUrl)
      throw new Error('Invalid video URL received from API')
    }

    return NextResponse.json({ 
      present: {
        script: prompt,
        video_url: videoUrl
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

