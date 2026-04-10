import { Navigate, Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer.jsx'
import { Header } from './components/Header.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { CategoryPage } from './pages/CategoryPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { MyPage } from './pages/MyPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ProductDetailPage } from './pages/ProductDetailPage.jsx'
import { ProductsPage } from './pages/ProductsPage.jsx'
import { SignupPage } from './pages/SignupPage.jsx'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
