import { ComponentSettings, Manager } from '@managed-components/types'

export default async function (manager: Manager, _settings: ComponentSettings) {
  // 1. Listener for Standard E-commerce Events (Only if enabled in settings)
  if (_settings.ecommerce) {
    manager.addEventListener('ecommerce', async event => {
      const { client, payload } = event

      try {
        // Get User ID if available
        const userId = client.get('user_id') || 'anonymous'

        // Log the raw payload to Server Logs for debugging
        console.log(
          `SERVER LOG: E-commerce event received from User ${userId}:`,
          JSON.stringify(payload)
        )

        // 2. Handle specific E-commerce actions (e.g., 'Order Completed')
        // The event name usually comes in payload.name or is implied by the trigger
        if (payload.name === 'Order Completed' || payload.name === 'Purchase') {
          // Example: Increment a "total_purchases" counter
          const currentTotalStr = client.get('total_purchases')
          const newTotal = (parseInt(currentTotalStr ?? '0', 10) || 0) + 1
          client.set('total_purchases', newTotal.toString())

          // Send confirmation to Browser Console
          client.execute(
            `console.log('🛒 Zaraz MC: Order processed! Total orders: ${newTotal}')`
          )
        } else {
          // Log other e-commerce events (Add to Cart, View Content, etc.)
          client.execute(
            `console.log('🛒 Zaraz MC: ${payload.name} event received')`
          )
        }
      } catch (err) {
        console.error(
          `SERVER ERROR (E-commerce): ${
            err instanceof Error ? err.message : err
          }`
        )
      }
    })
  }

  // 2. Keep the Pageview listener for basic tracking
  manager.addEventListener('pageview', async event => {
    const { client } = event
    try {
      console.log('SERVER LOG: Pageview received')
      const visits = (parseInt(client.get('visit_count') ?? '0', 10) || 0) + 1
      client.set('visit_count', visits.toString())
    } catch (err) {
      console.error(`SERVER ERROR (Pageview): ${err}`)
    }
  })
}
