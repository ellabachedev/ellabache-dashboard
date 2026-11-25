import Layout from './components/Layout.jsx'
import ProductsPage from './pages/ProductsPage/ProductsPage.jsx'

// One page for now. React Router will be added when the second page is built.
export default function App() {
  return (
    <Layout activePage="products">
      <ProductsPage />
    </Layout>
  )
}
