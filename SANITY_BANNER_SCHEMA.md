# Sanity Banner Schema

Create a document type named `banner` in Sanity Studio with these fields:

| Field name | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | String | Yes | Headline title displayed on the hero banner |
| `message` | Text | No | Subtitle or promotional description (e.g. discount details) |
| `image` | Image | Yes | Promotional banner image uploaded to Sanity Studio |
| `discount` | String | No | Optional badge text, e.g. `30%` or `Special Offer` |
| `buttonText` | String | No | Button label; defaults to `Shop Product` |
| `link` | String | No | Destination link; defaults to `shop.html` |
| `active` | Boolean | No | Set to `false` to hide a banner; defaults to visible |

Publish the document after saving it. The website reads published documents from:

- Project ID: `uudpeglz`
- Dataset: `production`
- Document type: `banner`

The homepage automatically loads and displays all active banners in the top hero billboard swiper as well as the promotional banner section. If multiple banners are published, Swiper enables auto-play and arrow navigation.
