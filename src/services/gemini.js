const MODEL_ID = 'gemini-2.5-flash'

const findApiKey = () => {
  const env = import.meta.env

  let key = env.VITE_GEMINI_API_KEY
  if (key) return key

  const matchedEnvKey = Object.keys(env).find((k) => {
    const normalized = k.replace(/^\uFEFF/, '').trim()
    return normalized === 'VITE_GEMINI_API_KEY'
  })

  if (matchedEnvKey) {
    key = env[matchedEnvKey]
  }

  return key
}

export const hasGeminiApiKey = () => {
  return Boolean(findApiKey())
}

const getApiKey = () => {
  const key = findApiKey()
  if (!key) {
    throw new Error('Missing VITE_GEMINI_API_KEY')
  }
  return key
}

export async function askGeminiAboutBook(book, question) {
  const context = {
    title: book?.title,
    author: book?.author,
    description: book?.description,
    isbn: book?.isbn,
    price: book?.price,
    stock: book?.stock,
    category: book?.category?.name,
  }

  const prompt = [
    'You are a helpful assistant for a bookstore staff member.',
    'Given this book record (JSON) and the user question, answer clearly and concisely.',
    'If you are unsure, say so. Do not invent ISBNs or factual claims that are not supported.',
    '',
    `BOOK_JSON: ${JSON.stringify(context)}`,
    '',
    `QUESTION: ${question || 'Provide additional details and a short summary.'}`,
  ].join('\n')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${encodeURIComponent(getApiKey())}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }],
      }],
    }),
  })

  const json = await response.json().catch(() => null)
  if (!response.ok) {
    const details = json?.error?.message || json?.error || JSON.stringify(json) || response.statusText
    throw new Error(`Gemini API error (${response.status}): ${details}`)
  }

  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join('\n')
  if (!text) {
    throw new Error('Gemini returned an empty response')
  }

  return text
}
