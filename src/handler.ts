export async function handleRequest(event: FetchEvent): Promise<Response> {
  const { method, url, headers } = event.request

  if (method !== 'GET')
    return new Response(JSON.stringify({ data: [] }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    })

  const schools = (headers.get('x-schools') || '').split(',')

  if (schools.length < 1)
    return new Response(JSON.stringify({
      error: true,
      message: 'Please provide a comma-separated list of Wonde School IDs via the `X-Schools` HTTP header!'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })

  const { search, pathname } = new URL(url)

  const cacheKey = new Request(url.toString(), event.request)
  const cache = caches.default

  let response = await cache?.match(cacheKey)

  if (!response) {
    const resp = {
      data: [] as any[],
    }

    for (const school of schools) {
      let next: any = `https://api.wonde.com/v1.0/schools/${school}${pathname}`
      search && (next += search)

      while (next) {
        const res = await fetch(next, {
          method,
          headers: {
            Authorization: headers.get('authorization') || '',
          },
          cf: {
            cacheTtlByStatus: {
              '200-299': 86400,
              404: 1,
              '500-599': 0,
            },
          },
        })

        const { data, meta }: {
          data: any[],
          meta?: {
            pagination?: {
              next?: string
            }
          }
        } = await res.json()
        resp.data.push(...(data.map(x => ({ ...x, _school: school }))))
        next = meta?.pagination?.next
      }
    }

    response = new Response(JSON.stringify(resp), {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    response.headers.append('Cache-Control', 's-maxage=86400')
    cache && event.waitUntil(cache.put(cacheKey, response.clone()))
  }

  return response
}
