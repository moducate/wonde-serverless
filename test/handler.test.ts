import { handleRequest } from '../src/handler'
import makeServiceWorkerEnv from 'service-worker-mock'
import nock from 'nock'
import { $fetch } from 'ohmyfetch'

declare var global: any

describe('handle', () => {
  beforeAll(() => {
    if (typeof fetch === 'undefined') {
      global.fetch = $fetch
    }
  })

  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })

  test('handle GET', async () => {
    nock('https://api.wonde.com')
      .get('/v1.0/schools/a1234567890/students')
      .reply(200, {
        data: [
          {
            id: 'A1749191433',
            upi: '8d444684b7aa79bc97f8594a4aab7ce3',
            mis_id: '9919',
            initials: 'RB',
            surname: 'Bennett',
            forename: 'Ruth',
            middle_names: null,
            legal_surname: 'Bennett',
            legal_forename: 'Ruth',
            gender: 'FEMALE',
            date_of_birth: {
              date: '2002-09-29 00:00:00.000000',
              timezone_type: 3,
              timezone: 'Europe/London',
            },
            last_modified: {
              date: '2015-10-22 20:11:20.000000',
              timezone_type: 3,
              timezone: 'UTC',
            },
          },
        ],
      })

    const result = await handleRequest(new FetchEvent('fetch', {
      request: new Request('/schools/a1234567890/students', { method: 'GET', headers: {} })
    }))
    expect(result.status).toEqual(200)
    const { data } = await result.json()
    expect(data).toHaveLength(1)
  })

  test('handle paginated responses from Wonde', async () => {
    nock('https://api.wonde.com')
      .get('/v1.0/schools/a1234567890/students')
      .reply(200, {
        data: [
          {
            id: 'A1749191433',
            upi: '8d444684b7aa79bc97f8594a4aab7ce3',
            mis_id: '9919',
            initials: 'RB',
            surname: 'Bennett',
            forename: 'Ruth',
            middle_names: null,
            legal_surname: 'Bennett',
            legal_forename: 'Ruth',
            gender: 'FEMALE',
            date_of_birth: {
              date: '2002-09-29 00:00:00.000000',
              timezone_type: 3,
              timezone: 'Europe/London',
            },
            last_modified: {
              date: '2015-10-22 20:11:20.000000',
              timezone_type: 3,
              timezone: 'UTC',
            },
          },
        ],
        meta: {
          pagination: {
            next: 'https://api.wonde.com/v1.0/schools/a1234567890/students2',
          },
        },
      })

      nock('https://api.wonde.com')
      .get('/v1.0/schools/a1234567890/students2')
      .reply(200, {
        data: [
          {
            id: 'A1749191433',
            upi: '8d444684b7aa79bc97f8594a4aab7ce3',
            mis_id: '9919',
            initials: 'RB',
            surname: 'Bennett',
            forename: 'Ruth',
            middle_names: null,
            legal_surname: 'Bennett',
            legal_forename: 'Ruth',
            gender: 'FEMALE',
            date_of_birth: {
              date: '2002-09-29 00:00:00.000000',
              timezone_type: 3,
              timezone: 'Europe/London',
            },
            last_modified: {
              date: '2015-10-22 20:11:20.000000',
              timezone_type: 3,
              timezone: 'UTC',
            },
          },
        ],
      })

    const result = await handleRequest(new FetchEvent('fetch', {
      request: new Request('/schools/a1234567890/students', { method: 'GET', headers: {} })
    }))
    expect(result.status).toEqual(200)
    const { data } = await result.json()
    expect(data).toHaveLength(2)
  })
})
