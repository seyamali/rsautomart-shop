'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Minus, Plus, ShoppingCart, Zap, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import ProductGrid from '@/components/product/ProductGrid';
import { useCart } from '@/hooks/useCart';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, getDiscountPercent, getStockStatusColor, getStockStatusText } from '@/lib/utils';
import api from '@/lib/api';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { addItem, removeItem, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);
        if (data.product.variants?.length > 0) {
          setSelectedVariant(data.product.variants[0].value);
        }
        // Load reviews
        api.get(`/products/${data.product._id}/reviews`)
          .then(({ data: reviewData }) => setReviews(reviewData.reviews))
          .catch(() => {});
        // Load related
        api.get(`/products?category=${data.product.category?._id}&limit=4`)
          .then(({ data: relData }) => setRelatedProducts(relData.products.filter((p: any) => p._id !== data.product._id)))
          .catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/shop" className="text-brand-red mt-4 inline-block">Go to Shop</Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const isWished = isInWishlist(product._id);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center flex-wrap gap-1.5 md:gap-2 text-xs md:text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-red whitespace-nowrap shrink-0">Home</Link>
        <ChevronRight size={14} className="shrink-0" />
        <Link href="/shop" className="hover:text-brand-red whitespace-nowrap shrink-0">Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={14} className="shrink-0" />
            <Link href={`/shop/${product.category.slug}`} className="hover:text-brand-red whitespace-nowrap shrink-0">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="shrink-0" />
        <span className="text-gray-800 line-clamp-1 break-all md:break-normal">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 mb-4">
            {product.images?.[selectedImage]?.url ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
            )}
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1">
                -{getDiscountPercent(product.price, product.discountPrice)}%
              </Badge>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    i === selectedImage ? 'border-brand-red' : 'border-gray-200'
                  }`}
                >
                  <Image src={img.url} alt="" width={80} height={80} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            {product.ratings?.count > 0 && (
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.ratings.average}</span>
                <span className="text-sm text-gray-500">({product.ratings.count} reviews)</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-brand-red">{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Stock */}
          <p className={`text-sm font-medium mb-4 ${getStockStatusColor(product.stock?.status)}`}>
            {getStockStatusText(product.stock?.status, product.stock?.quantity)}
          </p>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">
                {product.variants[0]?.type ? product.variants[0].type.charAt(0).toUpperCase() + product.variants[0].type.slice(1) : 'Option'}:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.value}
                    onClick={() => setSelectedVariant(v.value)}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      selectedVariant === v.value
                        ? 'border-brand-red bg-brand-red-light text-brand-red-dark'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 border-x font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              className="flex-1 bg-brand-red hover:bg-brand-red-dark"
              size="lg"
              onClick={() => addToCart(product, quantity, selectedVariant || undefined)}
              disabled={product.stock?.status === 'out_of_stock'}
            >
              <ShoppingCart size={18} className="mr-2" /> Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                addToCart(product, quantity, selectedVariant || undefined);
                window.location.href = '/checkout';
              }}
              disabled={product.stock?.status === 'out_of_stock'}
            >
              <Zap size={18} className="mr-2" /> Buy Now
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              className="shrink-0"
              onClick={() => isWished ? removeItem(product._id) : addItem({
                _id: product._id, name: product.name, slug: product.slug,
                price: product.price, discountPrice: product.discountPrice, images: product.images,
              })}
            >
              <Heart size={18} className={isWished ? 'fill-red-500 text-red-500' : ''} />
            </Button>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-gray-600 mb-4">{product.shortDescription}</p>
          )}
          {product.warranty && (
            <p className="text-sm text-green-600 font-medium">{product.warranty}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-10">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4 prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </TabsContent>
        <TabsContent value="specifications" className="mt-4">
          {product.specifications?.length > 0 ? (
            <table className="w-full max-w-lg">
              <tbody>
                {product.specifications.map((spec: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2 font-medium text-sm">{spec.key}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No specifications available</p>
          )}
        </TabsContent>
        <TabsContent value="reviews" className="mt-4 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{review.user?.name}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  {review.isVerifiedPurchase && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <Separator className="mb-8" />
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
