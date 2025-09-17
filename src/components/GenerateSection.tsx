export default function GenerateSection() {
  const tools = [
    {
      title: "Image (New)",
      description: "Generate images with custom styles in Flux and Ideogram.",
      buttonText: "Open"
    },
    {
      title: "Video",
      description: "Generate videos with Halluo, Pika, Runway Luma, and more.",
      buttonText: "Open"
    },
    {
      title: "Realtime",
      description: "Realtime AI rendering on a canvas. Instant feedback loops.",
      buttonText: "Open"
    },
    {
      title: "Enhancer (New)",
      description: "Upscale and enhance images and videos up to 22K.",
      buttonText: "Open"
    },
    {
      title: "Edit (New)",
      description: "Add objects, change style, or expand photos and generations.",
      buttonText: "Open"
    },
    {
      title: "Video Lipsync (New)",
      description: "Lip sync any video to any audio.",
      buttonText: "Open"
    },
    {
      title: "Motion Transfer (New)",
      description: "Transfer motion to images and animate characters.",
      buttonText: "Open"
    },
    {
      title: "Train",
      description: "Teach Krea to replicate your style, products, or characters.",
      buttonText: "Open"
    }
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Generate</h2>
          <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            Show all
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool, index) => (
            <div key={index} className="bg-white dark:bg-krea-gray rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {tool.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {tool.description}
              </p>
              <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                {tool.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}