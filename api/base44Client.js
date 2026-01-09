export const base44 = {
  auth: {
    me: () => Promise.resolve({ email: 'user@example.com', role: 'admin' })
  },
  entities: {
    CleanerProfile: {
      filter: (query) => Promise.resolve([]),
      list: (sort) => Promise.resolve([]),
      update: (id, data) => Promise.resolve({ id, ...data }),
      create: (data) => Promise.resolve({ id: Date.now(), ...data })
    },
    Withdrawal: {
      filter: (query, sort) => Promise.resolve([]),
      create: (data) => Promise.resolve({ id: Date.now(), ...data })
    },
    User: {
      list: () => Promise.resolve([]),
      create: (data) => Promise.resolve({ id: Date.now(), ...data }),
      update: (id, data) => Promise.resolve({ id, ...data })
    }
  },
  api: {
    uploadFile: (file) => Promise.resolve({ url: 'uploaded' }),
    sendInvite: (data) => Promise.resolve()
  }
};