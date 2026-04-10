import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearCartItems,
  fetchCartItems,
  pushCartItem,
  removeCartItem,
  setCartItemQuantity,
} from '../api/client'
import { useAuth } from './AuthContext'

const LOCAL_CART_KEY = 'shop_cart_items'
const CartContext = createContext(null)

function readLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '{}')
  } catch {
    return {}
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readLocalCart)
  const mergedFromServer = useRef(false)
  const { user } = useAuth()

  useEffect(() => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (!user || user.source !== 'server' || mergedFromServer.current) {
      return
    }

    async function syncFromServer() {
      try {
        const serverItems = await fetchCartItems()
        const synced = {}
        ;(serverItems || []).forEach((item) => {
          const key = String(item.itemId)
          synced[key] = Number(item.quantity || 0)
        })
        setItems((prev) => ({ ...prev, ...synced }))
      } catch {
        // keep local cart only
      } finally {
        mergedFromServer.current = true
      }
    }

    syncFromServer()
  }, [user])

  async function addItem(product, quantity = 1) {
    if (!product?.id) return

    setItems((prev) => {
      const key = String(product.id)
      return {
        ...prev,
        [key]: (prev[key] || 0) + quantity,
      }
    })

    if (user?.source === 'server') {
      for (let i = 0; i < quantity; i += 1) {
        try {
          await pushCartItem(product.id)
        } catch {
          break
        }
      }
    }
  }

  async function updateItem(productId, quantity) {
    const key = String(productId)

    setItems((prev) => {
      const next = { ...prev }
      if (quantity <= 0) {
        delete next[key]
        return next
      }
      next[key] = quantity
      return next
    })

    if (user?.source === 'server') {
      try {
        if (quantity <= 0) {
          await removeCartItem(productId)
        } else {
          await setCartItemQuantity(productId, quantity)
        }
      } catch {
        // ignore server sync failure
      }
    }
  }

  async function removeItem(productId) {
    await updateItem(productId, 0)
  }

  async function clearCart() {
    setItems({})

    if (user?.source === 'server') {
      try {
        await clearCartItems()
      } catch {
        // ignore server sync failure
      }
    }
  }

  const totalItemCount = useMemo(
    () => Object.values(items).reduce((sum, qty) => sum + Number(qty || 0), 0),
    [items],
  )

  const value = {
    items,
    totalItemCount,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider')
  }
  return ctx
}
