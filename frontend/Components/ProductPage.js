// ... existing imports ...
import ProductGallery from "./ProductPage/ProductGallery";
import ProductSpecs from "./ProductPage/ProductSpecs";
import ProductReviews from "./ProductPage/ProductReviews";

/**
 * @typedef {Object} Product
 * @property {string} id - Product ID
 * @property {string} title - Product title
 * @property {number} price - Product price
 * @property {Object} media - Media object with images and videos
 * @property {Object} reviewSummary - Review summary with average rating
 * @property {Object} specs - Product specifications
 */

function ProductPage() {
  const [product, setProduct] = useState(null);
  const [galleryAssets, setGalleryAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch product data and manage gallery state
    const fetchProduct = async () => {
      try {
        const response = await productsAPI.getById(productId);
        const productData = response.data.data;
        setProduct(productData);
        setGalleryAssets(productData.media?.images || []);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) return <Spinner />;
  if (!product) return <Error />;

  return (
    <div className="product-page">
      <div className="product-main">
        <ProductGallery images={galleryAssets} productTitle={product.title} />
        <div className="product-info">
          <h1>{product.title}</h1>
          <div className="product-price">
            <span className="price">${product.price}</span>
            <span className="discount">${Math.round(product.price * 1.66)}</span>
          </div>
          {/* Add to cart, wishlist buttons */}
        </div>
      </div>
      <ProductSpecs specs={product.specs} />
      <ProductReviews 
        reviews={product.reviewSummary?.reviews || []} 
        averageRating={product.reviewSummary?.averageRating || 0}
      />
    </div>
  );
}

export default ProductPage;

