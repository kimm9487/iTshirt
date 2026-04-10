import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'

export function CategoryPage() {
  const { categorySlug } = useParams()
  const category = decodeURIComponent(categorySlug || '').trim()
  const { products } = useProducts()
  const { addItem } = useCart()

  const filteredProducts = useMemo(() => {
    if (!category || category === '전체') {
      return products
    }
    return products.filter((item) => item.category === category)
  }, [category, products])

  return (
    <section className="section-block">
      <div className="section-head">
        <h2>{category || '전체'} 카테고리</h2>
        <Link to="/products">전체 상품 보기</Link>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addItem} />
        ))}
      </div>
      {filteredProducts.length === 0 ? <p>이 카테고리에는 상품이 없습니다.</p> : null}
    </section>
  )
}
