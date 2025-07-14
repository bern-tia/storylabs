import { motion } from 'framer-motion'

interface LandingPageProps {
  onStart: () => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              💰 Financial Literacy
              <span className="block text-green-600">StoryLabs</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Interactive AI-powered stories that teach kids about money
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-lg p-6 shadow-lg"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Age-Appropriate</h3>
              <p className="text-gray-600">
                Financial concepts tailored to your child's age and understanding level
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-lg p-6 shadow-lg"
            >
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Interactive</h3>
              <p className="text-gray-600">
                Voice-based choices and engaging scenarios that make learning fun
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white rounded-lg p-6 shadow-lg"
            >
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Personalized</h3>
              <p className="text-gray-600">
                Stories featuring your child's name and interests
              </p>
            </motion.div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">What Your Child Will Learn</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">Ages 4-6: Basic Concepts</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• What is money?</li>
                  <li>• Needs vs. wants</li>
                  <li>• Simple saving</li>
                  <li>• Counting coins</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-600">Ages 7-9: Money Management</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Earning money</li>
                  <li>• Smart spending</li>
                  <li>• Simple budgeting</li>
                  <li>• Sharing & donating</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-600">Ages 10-12: Advanced Concepts</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Goal setting</li>
                  <li>• Comparing prices</li>
                  <li>• Interest & growth</li>
                  <li>• Entrepreneurship</li>
                </ul>
              </div>
            </div>
          </div>

          <motion.button
            onClick={onStart}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Learning About Money! 🚀
          </motion.button>

          <div className="mt-8 text-sm text-gray-500">
            <p>Safe, educational, and designed for young learners</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 