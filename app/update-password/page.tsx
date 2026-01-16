async function verifyRecoverySession() {
  try {
    // Get token from URL
    const params = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    const type = params.get('type')
    
    if (type !== 'recovery' || !tokenHash) {
      setError('Invalid or expired reset link. Please request a new one.')
      setVerifying(false)
      return
    }

    // Verify the recovery token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery'
    })

    if (error || !data.session) {
      setError('Invalid or expired reset link. Please request a new one.')
      setVerifying(false)
      return
    }

    // Session is now set
    setVerifying(false)
  } catch (err) {
    console.error('Session verification error:', err)
    setError('Something went wrong. Please request a new reset link.')
    setVerifying(false)
  }
}