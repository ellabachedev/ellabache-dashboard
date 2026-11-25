// The ONLY place the app calls the backend. Every request goes to /api/... on our own server.

// Turn { state: ['NSW', 'VIC'], limit: 10 } into "state=NSW&state=VIC&limit=10".
// Empty values and empty lists are left out (empty list = "all").
export function toQueryString(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item))
    } else if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value))
    }
  }
  return search.toString()
}

export async function apiGet(path, params = {}) {
  const query = toQueryString(params)
  const response = await fetch(`/api${path}${query ? `?${query}` : ''}`)
  if (!response.ok) {
    // The backend sends a friendly message in "detail"; never show raw errors.
    const body = await response.json().catch(() => ({}))
    const detail = typeof body.detail === 'string' ? body.detail : null
    throw new Error(detail || 'Something went wrong loading this data.')
  }
  return response.json()
}
