import { MetadataRoute } from 'next'
import { VERIFIED_CATEGORIES, VERIFIED_PRODUCTS } from '@/lib/product-specs'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.goodwinbatteries.com'

  const categoryEntries: MetadataRoute.Sitemap = VERIFIED_CATEGORIES.map((category) => ({
    url: `${baseUrl}/products/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: category.status === 'active' ? 0.85 : 0.7,
  }))

  const productEntries: MetadataRoute.Sitemap = VERIFIED_PRODUCTS.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/applications`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/upcoming-products`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/battery-finder`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dealers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...categoryEntries,
    ...productEntries,
  ]
}
