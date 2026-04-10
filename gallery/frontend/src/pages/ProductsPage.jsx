import { ProductCard } from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'

export function ProductsPage() {
  const { products, loading, error } = useProducts()
  const { addItem } = useCart()

  return (
    <section className="section-block">
      <div className="section-head">
        <h2>전체 상품</h2>
        <p>{products.length}개 상품</p>
      </div>

      {loading ? <p>상품을 불러오는 중입니다...</p> : null}
      {error ? <p>{error}</p> : null}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addItem} />
        ))}
      </div>
    </section>
  )
}
