# Sanity Product Schema

Create a document type named `product` in Sanity Studio with these fields:

| Field name | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | String | Yes | Product name shown on the shop page |
| `price` | Number | Yes | Price in Naira, entered as a number |
| `category` | String | Yes | Use `Mobile Phones`, `Smart Watches`, or `Everyday Essentials` |
| `image` | Image | Yes | Upload the product image in Sanity Studio |
| `available` | Boolean | No | Set to false to hide a product; defaults to visible |
| `description` | Text | No | Optional for future product details |

Publish the document after saving it. The website reads published documents from:

- Project ID: `uudpeglz`
- Dataset: `production`
- Document type: `product`

The shop page refreshes its catalog when it loads. If no valid products have been published yet, it temporarily displays the built-in catalog so the store remains usable.
