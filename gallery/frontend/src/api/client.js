const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const error = new Error('Request failed')
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export function fetchItems() {
  return request('/api/items')
}

export function loginAccount(email, password) {
  return request('/api/account/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function checkAccount() {
  return request('/api/account/check')
}

export function fetchMyAccount() {
  return request('/api/account/me')
}

export function signupAccount(payload) {
  return request('/api/account/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logoutAccount() {
  return request('/api/account/logout', {
    method: 'POST',
  })
}

export function fetchCartItems() {
  return request('/api/cart/items')
}

export function pushCartItem(itemId) {
  return request(`/api/cart/items/${itemId}`, {
    method: 'POST',
  })
}

export function setCartItemQuantity(itemId, quantity) {
  return request(`/api/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })
}

export function removeCartItem(itemId) {
  return request(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
  })
}

export function clearCartItems() {
  return request('/api/cart/items', {
    method: 'DELETE',
  })
}

export function checkoutOrder() {
  return request('/api/orders/checkout', {
    method: 'POST',
  })
}

export function fetchOrders() {
  return request('/api/orders')
}

export function cancelOrder(orderId, reason = '') {
  return request(`/api/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export function createAdminItem(payload) {
  return request('/api/admin/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createAdminItemMultipart(payload, file) {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('category', payload.category ?? '')
  formData.append('price', String(payload.price))
  formData.append('discountPer', String(payload.discountPer ?? 0))
  formData.append('stock', String(payload.stock))
  if (file) {
    formData.append('file', file)
  }

  return fetch(`${API_BASE_URL}/api/admin/items`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const error = new Error('Request failed')
      error.status = res.status
      throw error
    }
    const text = await res.text()
    return text ? JSON.parse(text) : null
  })
}

export function updateAdminItemStock(itemId, stock) {
  return request(`/api/admin/items/${itemId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  })
}

  export function updateAdminItemMultipart(itemId, payload, file) {
    const formData = new FormData()
    formData.append('name', payload.name)
    formData.append('category', payload.category ?? '')
    formData.append('price', String(payload.price))
    formData.append('discountPer', String(payload.discountPer ?? 0))
    if (file) {
      formData.append('file', file)
    }
    return fetch(`${API_BASE_URL}/api/admin/items/${itemId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const error = new Error('Request failed')
        error.status = res.status
        throw error
      }
      const text = await res.text()
      return text ? JSON.parse(text) : null
    })
  }

  export function deleteAdminItem(itemId) {
    return request(`/api/admin/items/${itemId}`, {
      method: 'DELETE',
    })
  }

  export { API_BASE_URL }
