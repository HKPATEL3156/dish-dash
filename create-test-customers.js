// Test script to create sample customers
// You can run this in the browser console on your frontend

const createTestCustomers = async () => {
  const customers = [
    {
      username: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    },
    {
      username: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123'
    },
    {
      username: 'Mike Johnson',
      email: 'mike@example.com',
      password: 'password123'
    }
  ]

  for (const customer of customers) {
    try {
      const response = await fetch('http://localhost:4000/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customer)
      })

      const result = await response.json()
      console.log(`Created customer ${customer.username}:`, result)
    } catch (error) {
      console.error(`Error creating customer ${customer.username}:`, error)
    }
  }
}

// Run this in browser console:
// createTestCustomers();

console.log('To create test customers, run: createTestCustomers()')
