// Quick test to verify MongoDB connection and registration endpoint
import fetch from 'node-fetch';

const testRegistration = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });

    const data = await response.json();
    console.log('Registration test:', response.status, data);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Test health endpoint first
const testHealth = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/health');
    const data = await response.json();
    console.log('Health check:', response.status, data);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
};

console.log('Testing server connection...');
testHealth();
setTimeout(testRegistration, 1000);