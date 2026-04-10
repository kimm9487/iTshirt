import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'

export function HomePage() {
  const { products, categories, loading, error } = useProducts()
  const { addItem } = useCart()

  const featured = products.slice(0, 8)

  return (
    <div>
      <section className="hero-banner">
        <div>
          <p className="hero-label">2026 SPRING COLLECTION</p>
          <h1>당신의 하루를 입는 가장 쉬운 방법</h1>
          <p className="hero-sub">iTshirt Store는 기본에 감각을 더한 데일리 스타일을 제안합니다.</p>
          <div className="hero-actions">
            <Link to="/products" className="primary-link">신상 전체보기</Link>
            <Link to="/category/%ED%8B%B0%EC%85%94%EC%B8%A0" className="ghost-link">티셔츠 모아보기</Link>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h2>카테고리</h2>
        </div>
        <div className="chip-grid">
          {categories.filter((item) => item !== '전체').map((category) => (
            <Link key={category} className="chip" to={`/category/${encodeURIComponent(category)}`}>
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h2>추천 상품</h2>
          <Link to="/products">더보기</Link>
        </div>

        {loading ? <p>상품을 불러오는 중입니다...</p> : null}
        {error ? <p>{error}</p> : null}

        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addItem} />
          ))}
        </div>
      </section>
    </div>
  )
}
