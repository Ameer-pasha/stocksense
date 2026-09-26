const assert = require('assert');
const http = require('http');
const app = require('../../backend/src/app');

async function runAuthTests() {
  console.log('--- Phase 5 Test: Authentication & User Session Wiring ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Login with valid credentials
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ameer@stocksense.io', password: 'password123' })
    });
    assert.strictEqual(loginRes.status, 200, 'Valid login should return 200 OK');
    const loginJson = await loginRes.json();
    assert.strictEqual(loginJson.success, true, 'Login should succeed');
    assert(loginJson.data.token, 'Login should return auth token');
    assert.strictEqual(loginJson.data.user.name, 'Ameer Pasha', 'User name should match');
    assert.strictEqual(loginJson.data.user.role, 'admin', 'User role should match');
    console.log('✓ Valid login returns token and user payload');

    // 2. Login with invalid credentials
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ameer@stocksense.io', password: 'wrongpassword' })
    });
    assert.strictEqual(badLoginRes.status, 401, 'Bad password should return 401 Unauthorized');
    const badLoginJson = await badLoginRes.json();
    assert.strictEqual(badLoginJson.success, false, 'Bad login should fail');
    console.log('✓ Invalid password correctly rejected with 401');

    // 3. Signup with new user
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Operator',
        email: 'operator@stocksense.io',
        password: 'password123'
      })
    });
    assert.strictEqual(signupRes.status, 201, 'Signup should return 201 Created');
    const signupJson = await signupRes.json();
    assert.strictEqual(signupJson.success, true, 'Signup should succeed');
    assert.strictEqual(signupJson.data.user.email, 'operator@stocksense.io');
    console.log('✓ User signup creates new account with JWT token');

    // 4. Duplicate signup rejection
    const dupSignupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Operator',
        email: 'operator@stocksense.io',
        password: 'password123'
      })
    });
    assert.strictEqual(dupSignupRes.status, 409, 'Duplicate signup should return 409 Conflict');
    console.log('✓ Duplicate registration correctly rejected with 409 Conflict');

    // 5. Forgot password flow
    const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'operator@stocksense.io' })
    });
    assert.strictEqual(forgotRes.status, 200, 'Forgot password should return 200 OK');
    const forgotJson = await forgotRes.json();
    assert.strictEqual(forgotJson.success, true);
    assert.strictEqual(forgotJson.data.otp, '4829', 'Expected mock OTP returned');
    console.log('✓ Forgot password dispatches OTP');

    // 6. Verify OTP
    const verifyOtpRes = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: '4829' })
    });
    assert.strictEqual(verifyOtpRes.status, 200, 'OTP verification should return 200 OK');
    const verifyOtpJson = await verifyOtpRes.json();
    assert.strictEqual(verifyOtpJson.success, true);
    console.log('✓ OTP verification validated successfully');

    // 7. Reset password
    const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'newpassword123' })
    });
    assert.strictEqual(resetRes.status, 200, 'Reset password should return 200 OK');
    console.log('✓ Password reset completed successfully');

    // 8. Auth /me endpoint
    const meRes = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(meRes.status, 200, 'Auth /me should return 200 OK');
    const meJson = await meRes.json();
    assert(meJson.data.user, 'Auth /me should return user info');
    console.log('✓ Auth /me endpoint active');

    console.log(' All Phase 5 Authentication assertions passed successfully!\n');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

if (require.main === module) {
  runAuthTests().catch((err) => {
    console.error('Phase 5 Test Failed:', err);
    process.exit(1);
  });
}

module.exports = runAuthTests;
