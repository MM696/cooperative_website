export default function Footer() {
  return (
    <footer className="bg-krea-gray dark:bg-krea-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-white font-semibold text-lg">Krea AI</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                Legal
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </button>
            </div>
            <div className="text-gray-400 text-sm">
              curated by Mobbin
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}