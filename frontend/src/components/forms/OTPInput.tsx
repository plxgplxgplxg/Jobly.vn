import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  onResend?: () => void
  isLoading?: boolean
}

export function OTPInput({ length = 6, onComplete, onResend, isLoading = false }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  useEffect(() => {
    // Auto focus input đầu tiên
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    // Chỉ cho phép số
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Chỉ lấy ký tự cuối

    setOtp(newOtp)

    // Auto focus input tiếp theo
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check complete
    if (newOtp.every(digit => digit !== '')) {
      onComplete(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Focus input trước đó nếu input hiện tại rỗng
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length)
    
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < length) {
        newOtp[index] = char
      }
    })

    setOtp(newOtp)

    // Focus input cuối cùng hoặc input tiếp theo sau paste
    const nextIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[nextIndex]?.focus()

    // Check complete
    if (newOtp.every(digit => digit !== '')) {
      onComplete(newOtp.join(''))
    }
  }

  const handleResend = () => {
    if (canResend && onResend) {
      onResend()
      setCountdown(60)
      setCanResend(false)
      setOtp(Array(length).fill(''))
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {onResend && (
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
            >
              Gửi lại mã OTP
            </button>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gửi lại mã sau {countdown}s
            </p>
          )}
        </div>
      )}
    </div>
  )
}
