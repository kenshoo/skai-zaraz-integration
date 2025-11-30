# SkaiZarazCustom Managed Component

## 📦 About

This Managed Component tracks user clicks and conversions for Skai. It sends event data to Skai’s tracking endpoint, enabling advanced analytics and conversion attribution.

## Documentation

Managed Components docs are published at **https://managedcomponents.dev** .

Find out more about Managed Components [here](https://blog.cloudflare.com/zaraz-open-source-managed-components-and-webcm/) for inspiration and motivation details.

[![Released under the Apache license.](https://img.shields.io/badge/license-apache-blue.svg)](./LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 🛠️ Building Locally

1. Make sure you're running node version >=18.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the component:
   ```bash
   npm run build
   ```
   The output will be in the `dist` folder.

## 🚀 Deploying to Cloudflare

Use the following command to deploy the built component as a Cloudflare Worker:
```bash
npx managed-component-to-cloudflare-worker ./dist/index.js skai-zaraz ./wrangler.toml
```
This will package and deploy your component using the configuration in `wrangler.toml`.

## 🏷️ Installing in Cloudflare Tag Setup

To use this as a custom Managed Component in Cloudflare Zaraz:

1. Go to Cloudflare Zaraz Tag setup.
2. Add a new Custom Managed Component.
3. Upload or reference your deployed Worker.
4. Fill in the required fields before activation:
   - `trackingUrl`: The Skai endpoint to send tracking data.
   - `profileToken`: Your Skai profile token for authentication.

These fields must be configured for the component to function correctly.

## 📋 Required Fields

| Field         | Description                                 | Required |
|---------------|---------------------------------------------|----------|
| `trackingUrl` | Skai endpoint for event tracking            | Yes      |
| `profileToken`| Token for authenticating with Skai services | Yes      |

## 💻 Example: Triggering a Purchase Event in the Browser

Below is an example of how to trigger an e-commerce conversion event using Zaraz from the browser:

> **Note:** The conversion type is determined by the Zaraz e-commerce event name you use (for example, `Order Completed` in this example). You can override this by specifying a custom value in the `conversionType` field. For the full list of supported e-commerce event names, see the [Zaraz E-commerce API documentation](https://www.cloudflare.com/apps/zaraz/docs/ecommerce-api/):
>
> - `Order Completed`
> - `Product Added`
> - `Product Removed`
> - `Checkout Started`
> - `Payment Info Entered`
> - `Shipping Info Entered`
> - `Cart Viewed`
> - `Product Viewed`
> - `Product List Viewed`
> - `Promotion Viewed`
> - `Promotion Clicked`
> - `Refund Issued`
> - ...and more

```javascript
function triggerPurchase() {
    const orderId = 'ORD-' + Math.floor(Math.random() * 10000);
    // Use the Standard E-commerce API
    if (window.zaraz) {
        window.zaraz.ecommerce('Order Completed', {
            checkout_id: orderId,
            conversionType: "My custom Conversion",
            total: 29.99,
            currency: 'USD',
            products: [
                {
                    product_id: '998877',
                    sku: 'RED-TSHIRT-M',
                    name: 'Red T-Shirt',
                    price: 29.99,
                    quantity: 1
                }
            ]
        });
        console.log('Client: Sent zaraz.ecommerce("Order Completed")');
        alert('Order Completed event sent! Check Server Logs.');
    } else {
        alert('Zaraz not loaded');
    }
}
```

## 📝 License

Licensed under the [Apache License](./LICENSE).
