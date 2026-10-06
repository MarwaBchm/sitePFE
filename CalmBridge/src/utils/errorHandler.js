export function getFriendlyErrorMessage(err) {
  if (!err) return 'An unexpected error occurred. Please try again.'

  const message = err.response?.data?.message || err.message || String(err)
  const lowerMsg = message.toLowerCase()
  
  if (lowerMsg.includes('network error') || lowerMsg.includes('err_internet_disconnected') || lowerMsg.includes('failed to fetch')) {
    return 'Please check your internet connection and try again.'
  }
  
  if (lowerMsg.includes('503') || lowerMsg.includes('service unavailable') || lowerMsg.includes('timeout')) {
    return 'The server is waking up or temporarily unavailable. Please wait a few seconds and try again.'
  }
  
  if (lowerMsg.includes('database') || lowerMsg.includes('prisma') || lowerMsg.includes('connect')) {
    return 'We are experiencing a temporary connection issue. Please try again later.'
  }
  
  if (lowerMsg.includes('401') || lowerMsg.includes('unauthorized')) {
    return 'Invalid credentials or your session has expired. Please log in again.'
  }
  
  if (lowerMsg.includes('403') || lowerMsg.includes('forbidden')) {
    return 'You do not have permission to perform this action.'
  }

  // If it's a known non-technical backend message, just return it
  if (err.response?.data?.message && typeof err.response.data.message === 'string') {
    return err.response.data.message
  }

  return 'An unexpected error occurred. Please try again.'
}
