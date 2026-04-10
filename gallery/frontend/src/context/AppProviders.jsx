import { AuthProvider } from './AuthContext'
import { CartProvider } from './CartContext'
import { ProductProvider } from './ProductContext'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>{children}</CartProvider>
      </ProductProvider>
    </AuthProvider>
  )
}
