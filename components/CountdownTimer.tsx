'use client'

import { useState, useEffect } from 'react'

export default function CountdownTimer() {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [count])

  return (
    <div className="text-6xl font-bold">{count}</div>
  )
}

