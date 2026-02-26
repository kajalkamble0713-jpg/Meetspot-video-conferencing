// Quick test script for password reset functionality
// Run with: node test-password-reset.js

import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1/users';

async function testPasswordReset() {
    console.log('🧪 Testing Password Reset Functionality\n');

    try {
        // Test 1: Forgot Password
        console.log('📧 Test 1: Sending forgot password request...');
        const forgotResponse = await axios.post(`${BASE_URL}/forgot-password`, {
            username: 'testuser' // Change this to an existing username in your DB
        });
        console.log('✅ Success:', forgotResponse.data.message);
        console.log('📬 Email sent to:', forgotResponse.data.email);
        console.log('\n⚠️  Check your backend console for the email preview URL!\n');

        // Note: In a real test, you would extract the token from the email
        // and use it to test the reset password endpoint
        console.log('📝 Next steps:');
        console.log('1. Copy the preview URL from backend console');
        console.log('2. Open it in browser to see the email');
        console.log('3. Click the reset link or copy the token');
        console.log('4. Use the token to reset password\n');

    } catch (error) {
        console.error('❌ Error:', error.response?.data?.message || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n⚠️  Make sure the backend server is running!');
            console.log('Run: cd backend && npm start\n');
        }
    }
}

// Run the test
testPasswordReset();
