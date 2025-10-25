'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChatbotQuery } from '@/hooks/use-enhancements'
import { ChatMessage } from '@/types/enhancements'

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      message: 'Hi! I\'m your travel assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
      options: [
        { label: 'Book a flight', value: 'book_flight', action: 'navigate' },
        { label: 'My bookings', value: 'my_bookings', action: 'navigate' },
        { label: 'FAQs', value: 'faqs', action: 'reply' }
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatbotQuery = useChatbotQuery()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      message: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Get bot response
    try {
      const response = await chatbotQuery.mutateAsync(inputValue)
      setMessages(prev => [...prev, response])
    } catch (error) {
      console.error('Chatbot error:', error)
    }
  }

  const handleOptionClick = (option: any) => {
    if (option.action === 'navigate') {
      // Handle navigation
      console.log('Navigate to:', option.value)
    } else if (option.action === 'reply') {
      handleSend()
      setInputValue(option.label)
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-sapphire-900 to-emerald-900 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-sapphire-900 to-emerald-900 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Travel Assistant</h3>
                  <p className="text-xs text-white/80">Online • Instant replies</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-sapphire-900 to-emerald-900 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    
                    {/* Options */}
                    {message.options && message.options.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleOptionClick(option)}
                            className="w-full text-left text-sm px-3 py-2 bg-sapphire-50 hover:bg-sapphire-100 text-sapphire-900 rounded-lg transition-colors"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {chatbotQuery.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-sapphire-900" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={chatbotQuery.isPending}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || chatbotQuery.isPending}
                  size="icon"
                  className="bg-gradient-to-r from-sapphire-900 to-emerald-900"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Powered by AI • Available 24/7
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
