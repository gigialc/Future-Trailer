export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center space-y-4 p-8 bg-gray-50 rounded-lg border">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium">Generating your video</p>
        <p className="text-xs text-gray-500">This may take a few minutes...</p>
      </div>
    </div>
  )
} 