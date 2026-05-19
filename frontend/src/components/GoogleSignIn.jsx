import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function GoogleSignIn({ onSuccess, onError, text = 'continue_with' }) {
  const { loginWithGoogle } = useAuth()
  const btnRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    if (window.google?.accounts) {
      initGoogle()
      return
    }

    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
    if (existing) {
      existing.addEventListener('load', initGoogle)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogle
    document.head.appendChild(script)
  }, [])

  function initGoogle() {
    if (!window.google?.accounts || !btnRef.current) return
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    })
    window.google.accounts.id.renderButton(btnRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text,
      width: 360,
      logo_alignment: 'left',
    })
    setReady(true)
  }

  async function handleCredentialResponse(response) {
    try {
      await loginWithGoogle(response.credential)
      onSuccess?.()
    } catch (err) {
      const msg = err.response?.data?.error || 'Google sign-in failed'
      onError?.(msg)
    }
  }

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <>
      <div ref={btnRef} className="google-btn-wrapper" />
      <style>{`
        .google-btn-wrapper {
          display: flex;
          justify-content: center;
          margin: 0.75rem 0;
        }
      `}</style>
    </>
  )
}
