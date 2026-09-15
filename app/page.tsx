'use client'

import { useState, useEffect } from 'react'
import LoginPage from '@/components/LoginPage'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [operator, setOperator] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('axon_operator')
    if (saved) setOperator(saved)
  }, [])

  const handleAuth = (username: string) => {
    setOperator(username)
    localStorage.setItem('axon_operator', username)
  }

  const handleLogout = () => {
    setOperator(null)
    localStorage.removeItem('axon_operator')
  }

  if (!mounted) return null

  if (!operator) return <LoginPage onAuth={handleAuth} />
  return <Dashboard operator={operator} onLogout={handleLogout} />
}
