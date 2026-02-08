import * as fc from 'fast-check'

// Arbitraries cho các data types thường dùng

// Email hợp lệ
export const emailArbitrary = fc.emailAddress()

// Số điện thoại Việt Nam (10 chữ số)
export const phoneArbitrary = fc.tuple(
  fc.constantFrom('03', '05', '07', '08', '09'),
  fc.integer({ min: 10000000, max: 99999999 })
).map(([prefix, num]) => prefix + num.toString())

// Password (6-50 ký tự)
export const passwordArbitrary = fc.string({ 
  minLength: 6, 
  maxLength: 50 
})

// Tên người (1-50 ký tự, không có số)
export const nameArbitrary = fc.string({ 
  minLength: 1, 
  maxLength: 50 
}).filter(s => /^[a-zA-ZÀ-ỹ\s]+$/.test(s))

// User role
export const userRoleArbitrary = fc.constantFrom('candidate', 'employer', 'admin')

// Job type
export const jobTypeArbitrary = fc.constantFrom('full_time', 'part_time', 'contract', 'internship')

// Application status
export const applicationStatusArbitrary = fc.constantFrom('pending', 'reviewed', 'accepted', 'rejected')

// Salary range (min: 0-50M, max: min+1M đến 100M)
export const salaryRangeArbitrary = fc.integer({ min: 0, max: 50000000 }).chain(min =>
  fc.record({
    min: fc.constant(min),
    max: fc.integer({ min: min + 1000000, max: 100000000 })
  })
)

// Date trong tương lai
export const futureDateArbitrary = fc.date({ 
  min: new Date(Date.now() + 86400000) // Ít nhất 1 ngày sau
})

// URL hợp lệ
export const urlArbitrary = fc.webUrl()
