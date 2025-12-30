import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadFile, summarizeText } from './api'
import { getInitialTheme, toggleTheme, applyTheme } from './theme'
import { motion, AnimatePresence } from 'framer-motion'

const lengthOptions = [
  { value: 'short', label: 'Short', icon: '📝' },
  { value: 'medium', label: 'Medium', icon: '📄' },
  { value: 'long', label: 'Long', icon: '📑' },
]

function Spinner() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
    >
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-5 w-5 text-gradient-to-r from-purple-500 to-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </motion.svg>
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Processing...
      </motion.span>
    </motion.div>
  )
}

function FileIcon({ type }) {
  if (type?.includes('pdf')) return '📄'
  if (type?.includes('image')) return '🖼️'
  return '📎'
}

export default function App() {
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [summary, setSummary] = useState('')
  const [length, setLength] = useState('medium')
  const [loadingExtract, setLoadingExtract] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(getInitialTheme())
  const [isUploaded, setIsUploaded] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      setFile(acceptedFiles[0])
      setExtractedText('')
      setSummary('')
      setError('')
      setIsUploaded(true)
      
      // Reset uploaded state after animation
      setTimeout(() => setIsUploaded(false), 2000)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    }
  })

  const border = useMemo(() => {
    if (isDragReject) return 'border-red-400'
    if (isDragActive) return 'border-blue-400'
    return 'border-gray-300'
  }, [isDragActive, isDragReject])

  const handleExtract = async () => {
    try {
      setError('')
      setLoadingExtract(true)
      const { text } = await uploadFile(file)
      setExtractedText(text)
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to extract text')
    } finally {
      setLoadingExtract(false)
    }
  }

  const handleSummarize = async () => {
    try {
      setError('')
      setLoadingSummary(true)
      const { summary } = await summarizeText(extractedText, length)
      setSummary(summary)
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to summarize')
    } finally {
      setLoadingSummary(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#0b1220] dark:via-[#0f172a] dark:to-[#1e293b] transition-all duration-500"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 md:mb-12"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1"
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  Document Summary Assistant
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg mt-2 max-w-2xl">
                  Upload PDF or images, extract text instantly, and generate intelligent summaries powered by Gemini AI
                </p>
              </motion.div>
              
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
                onClick={() => setTheme(toggleTheme())}
                className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 text-gray-700 dark:text-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white dark:hover:bg-slate-800"
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    {theme === 'dark' ? (
                      <path d="M21.64 13A9 9 0 1111 2.36a7 7 0 1010.64 10.64z" />
                    ) : (
                      <path d="M12 3a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zm0 14a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm9-5a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM6 12a1 1 0 01-1 1H3a1 1 0 110-2h2a1 1 0 011 1zm11.657-6.657a1 1 0 010 1.414L16.243 8.17a1 1 0 11-1.414-1.415l1.414-1.414a1 1 0 011.414 0zM9.172 16.243a1 1 0 010 1.414L7.757 19.07a1 1 0 01-1.414-1.414l1.415-1.414a1 1 0 011.414 0zm9.9 1.414a1 1 0 00-1.414 0l-1.415 1.414a1 1 0 101.415 1.414l1.414-1.414a1 1 0 000-1.414zM8.586 5.757a1 1 0 00-1.414 0L5.757 7.171A1 1 0 107.17 8.586l1.415-1.415a1 1 0 000-1.414z" />
                    )}
                  </svg>
                </motion.div>
                <span className="font-medium hidden sm:inline">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </motion.button>
            </div>
          </motion.header>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Controls */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1 space-y-8"
            >
              {/* Upload Zone */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div 
                  {...getRootProps()} 
                  className={`relative p-8 border-3 ${border} border-dashed rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden`}
                >
                  <input {...getInputProps()} />
                  <div className="relative z-10 text-center">
                    <motion.div
                      animate={isUploaded ? { scale: [1, 1.1, 1] } : {}}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-4"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                    </motion.div>
                    <p className="text-gray-800 dark:text-gray-100 font-semibold text-lg mb-1">Drag & drop your file</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Supports PDF, PNG, JPG files</p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isDragActive ? 1 : 0 }}
                      className="text-blue-500 dark:text-blue-400 text-sm mt-2"
                    >
                      Drop it here! 📁
                    </motion.p>
                  </div>
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
              </motion.div>

              {/* Selected File */}
              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{FileIcon(file)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{file.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFile(null)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 dark:text-red-400"
                      >
                        ✕
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6 p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl"
              >
                {/* Length Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Summary Length</label>
                  <div className="flex gap-2">
                    {lengthOptions.map(opt => (
                      <motion.button
                        key={opt.value}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setLength(opt.value)}
                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                          length === opt.value 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' 
                            : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                        }`}
                      >
                        <span className="text-2xl mb-2">{opt.icon}</span>
                        <span className={`font-medium ${
                          length === opt.value 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {opt.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleExtract}
                    disabled={!file || loadingExtract}
                  >
                    {loadingExtract ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </span>
                    ) : (
                      'Extract Text ✨'
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSummarize}
                    disabled={!extractedText || loadingSummary}
                  >
                    {loadingSummary ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </span>
                    ) : (
                      'Summarize 🚀'
                    )}
                  </motion.button>
                </div>

                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800/30">
                        <div className="flex items-start gap-3">
                          <div className="text-red-500 dark:text-red-400 text-xl">⚠️</div>
                          <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Right Panel - Results */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Extracted Text Section */}
              <motion.section
                whileHover={{ y: -5 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                      Extracted Text
                    </h2>
                    {extractedText && (
                      <span className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                        {extractedText.split(' ').length} words
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {loadingExtract ? (
                    <div className="flex items-center justify-center h-48">
                      <Spinner />
                    </div>
                  ) : (
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-100 leading-relaxed">
                        {extractedText || (
                          <div className="text-center text-gray-400 dark:text-gray-500 py-12">
                            <div className="text-4xl mb-4">📄</div>
                            <p className="text-lg">No text extracted yet</p>
                            <p className="text-sm mt-2">Upload a file and click "Extract Text" to begin</p>
                          </div>
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.section>

              {/* Summary Section */}
              <motion.section
                whileHover={{ y: -5 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                      AI Summary
                      <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full ml-2">
                        Gemini AI
                      </span>
                    </h2>
                    {summary && (
                      <span className="text-sm px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">
                        {length.charAt(0).toUpperCase() + length.slice(1)} length
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {loadingSummary ? (
                    <div className="flex items-center justify-center h-48">
                      <Spinner />
                    </div>
                  ) : (
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-100 leading-relaxed">
                        {summary || (
                          <div className="text-center text-gray-400 dark:text-gray-500 py-12">
                            <div className="text-4xl mb-4">🤖</div>
                            <p className="text-lg">Summary will appear here</p>
                            <p className="text-sm mt-2">Extract text first, then click "Summarize"</p>
                          </div>
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.section>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-800"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Document Summary Assistant</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Powered by Gemini AI • Made with ❤️ by Jatin</p>
              </div>
              <div className="flex items-center gap-6">
                <a 
                  href="https://github.com/jatin009v" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors flex items-center gap-2 group"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-slate-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                  <span className="text-sm">GitHub</span>
                </a>
                <div className="text-gray-500 dark:text-gray-500 text-sm">
                  v1.0.0 • © {new Date().getFullYear()}
                </div>
              </div>
            </div>
          </motion.footer>
        </div>
      </div>
    </motion.div>
  )
}