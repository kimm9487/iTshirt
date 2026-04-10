import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchItems } from '../api/client'
import { withPricing } from '../utils/catalog'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProducts() {
    try {
      const data = await fetchItems()
      setProducts((data || []).map(withPricing))
      setError('')
    } catch {
      setError('상품 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    async function run() {
      setLoading(true)
      try {
        const data = await fetchItems()
        if (!mounted) return
        setProducts((data || []).map(withPricing))
        setError('')
      } catch {
        if (!mounted) return
        setError('상품 정보를 불러오지 못했습니다.')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set(products.map((item) => item.category))
    return ['전체', ...Array.from(set)]
  }, [products])

  const value = {
    products,
    categories,
    loading,
    error,
    refreshProducts: loadProducts,
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) {
    throw new Error('useProducts must be used within ProductProvider')
  }
  return ctx
}
