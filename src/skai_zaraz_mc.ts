import { ComponentSettings, Manager, Client } from '@managed-components/types'

const SKAI_UUID_KEY = '_skai_uuid'

export default async function (manager: Manager, settings: ComponentSettings) {
  // Helper to ensure the tracker URL doesn't end with a slash
  const getBaseUrl = () => {
    const url = (settings.trackerUrl as string) || 'https://1111.xg4ken.com/'
    return url.endsWith('/') ? url.slice(0, -1) : url
  }

  // Helper: Get/Generate User ID using Zaraz's Persistent Storage
  // Note: scope: 'infinite' creates a persistent cookie that survives session resets.
  const getSkaiUuid = (client: Client) => {
    let uuid = client.get(SKAI_UUID_KEY)
    if (!uuid) {
      uuid = crypto.randomUUID()
      client.set(SKAI_UUID_KEY, uuid, { scope: 'infinite' })
    }
    return uuid
  }

  // ---------------------------------------------------------------------------
  // 1. Pageview Listener (Click Reporting)
  // ---------------------------------------------------------------------------
  manager.addEventListener('pageview', async event => {
    const { client, payload } = event
    const baseUrl = getBaseUrl()

    try {
      const url = new URL(client.url.href)
      const searchParams = url.searchParams
      const skaiUuid = getSkaiUuid(client)

      // Log the Event Payload
      client.execute(
        `console.log('🔍 Skai MC Pageview Payload:', ${JSON.stringify(
          payload
        )})`
      )

      // Only report click if 'campaignid' exists in URL
      if (searchParams.has('campaignid')) {
        const reportingParams = new URLSearchParams(searchParams.toString())
        reportingParams.set('k_user_id', skaiUuid)

        // Explicitly typed as string to satisfy compiler
        const clickEndpoint: string = `${baseUrl}/trk/v1?${reportingParams.toString()}`

        // Use manager.fetch for server-side requests
        // @ts-expect-error workaround for linter issue
        manager
          .fetch(clickEndpoint, {
            method: 'GET',
          })
          .catch(e => console.error('Skai Click fetch failed', e))

        client.execute(
          `console.log('✅ Skai MC: Click reported. UUID: ${skaiUuid}')`
        )

        // SEPARATE SERVER LOGS
        console.log(
          `SERVER LOG: Skai Click Payload: ${JSON.stringify(payload)}`
        )
        console.log(`SERVER LOG: Skai Click Reported URL: ${clickEndpoint}`)
      }
    } catch (err) {
      console.error(
        `SERVER ERROR (Pageview): ${err instanceof Error ? err.message : err}`
      )
    }
  })

  // ---------------------------------------------------------------------------
  // 2. E-commerce Listener (Conversion Reporting)
  // ---------------------------------------------------------------------------
  if (settings.ecommerce) {
    manager.addEventListener('ecommerce', async event => {
      const { client, payload } = event
      const baseUrl = getBaseUrl()

      try {
        const skaiUuid = getSkaiUuid(client)

        // Log the full payload for debugging
        client.execute(
          `console.log('🔍 Skai MC E-commerce Payload:', ${JSON.stringify(
            payload
          )})`
        )

        // Helper to extract data from either root or nested 'ecommerce' object
        const data = payload.ecommerce || payload

        // ------------------------------------------------------------
        // LOGIC: Process EVERY event.
        // Conversion Type Priority:
        // 1. Explicit 'conversionType' in payload
        // 2. Event Name (e.g. 'Order Completed', 'Add to Cart')
        // 3. Fallback to 'conv'
        // ------------------------------------------------------------

        const params = new URLSearchParams()

        // Fixed Skai Params
        params.append('track', '1')
        // Updated to use profileToken
        params.append('token', (settings.profileToken as string) || '')
        params.append('k_user_id', skaiUuid)

        // Determine Conversion Type
        const convType =
          payload.conversionType ||
          payload.conversion_type ||
          data.conversionType ||
          payload.name ||
          'conv'

        params.append('conversionType', convType)

        // Revenue Fallback
        const revenue =
          data.total ||
          data.value ||
          data.revenue ||
          payload.total ||
          payload.value ||
          payload.revenue ||
          0
        params.append('revenue', String(revenue))

        const currency = data.currency || payload.currency || 'USD'
        params.append('currency', currency)

        // Order ID / Transaction ID
        const orderId =
          data.checkout_id ||
          data.order_id ||
          data.transaction_id ||
          payload.checkout_id ||
          payload.order_id ||
          payload.transaction_id ||
          ''
        params.append('orderId', orderId)

        // Optional Promo Code
        const coupon = data.coupon || payload.coupon
        if (coupon) {
          params.append('promoCode', coupon)
        }

        // Send Request
        const conversionEndpoint: string = `${baseUrl}/pixel/v1?${params.toString()}`

        // Use manager.fetch for server-side requests
        await manager.fetch(conversionEndpoint, {
          method: 'GET',
        })

        client.execute(
          `console.log('💰 Skai MC: Event sent! Type: ${convType}, Rev: ${revenue}')`
        )

        // SEPARATE SERVER LOGS
        console.log(
          `SERVER LOG: Skai Conversion Payload: ${JSON.stringify(payload)}`
        )
        console.log(
          `SERVER LOG: Skai Conversion Reported URL: ${conversionEndpoint}`
        )
      } catch (err) {
        console.error(
          `SERVER ERROR (E-commerce): ${
            err instanceof Error ? err.message : err
          }`
        )
      }
    })
  }
}
