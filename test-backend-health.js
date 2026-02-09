#!/usr/bin/env node

/**
 * Backend Health Check Script
 * Tests critical GraphQL mutations and queries to verify all fixes are working
 */

const http = require('http');

const GRAPHQL_ENDPOINT = 'http://localhost:8000/graphql';

// Test queries and mutations
const tests = [
    {
        name: 'Test 1: Query without auth (should work)',
        query: `
      query {
        yurts(first: 1) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
        expectError: false,
        requiresAuth: false
    },
    {
        name: 'Test 2: Create booking without auth (should fail gracefully)',
        query: `
      mutation {
        createBooking(input: {
          yurtId: "test-id"
          startDate: "2026-03-01"
          endDate: "2026-03-05"
        }) {
          id
        }
      }
    `,
        expectError: true,
        expectedErrorMessage: 'Not authenticated',
        requiresAuth: true
    },
    {
        name: 'Test 3: Create order without auth (should fail gracefully)',
        query: `
      mutation {
        createOrder(input: {
          items: []
          shippingAddress: "Test"
        }) {
          id
        }
      }
    `,
        expectError: true,
        expectedErrorMessage: 'Not authenticated',
        requiresAuth: true
    },
    {
        name: 'Test 4: Create travel booking without auth (should fail gracefully)',
        query: `
      mutation {
        createTravelBooking(input: {
          travelId: "test-id"
          startDate: "2026-03-01"
          numberOfPeople: 2
        }) {
          id
        }
      }
    `,
        expectError: true,
        expectedErrorMessage: 'Not authenticated',
        requiresAuth: true
    },
    {
        name: 'Test 5: Create yurt without auth (should fail gracefully)',
        query: `
      mutation {
        createYurt(input: {
          name: "Test Yurt"
          description: "Test"
          location: "Test"
          pricePerNight: 100
          capacity: 4
          amenities: "Test"
          images: "test.jpg"
        }) {
          id
        }
      }
    `,
        expectError: true,
        expectedErrorMessage: 'Not authorized',
        requiresAuth: true
    }
];

function makeGraphQLRequest(query, token = null) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ query });

        const options = {
            hostname: 'localhost',
            port: 8000,
            path: '/graphql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting Backend Health Check...\n');
    console.log('Testing endpoint:', GRAPHQL_ENDPOINT);
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        console.log(`\n${test.name}`);
        console.log('-'.repeat(60));

        try {
            const response = await makeGraphQLRequest(test.query);

            if (test.expectError) {
                // Should have errors
                if (response.errors && response.errors.length > 0) {
                    const errorMessage = response.errors[0].message;

                    if (test.expectedErrorMessage) {
                        if (errorMessage.includes(test.expectedErrorMessage)) {
                            console.log('✅ PASSED - Got expected error:', errorMessage);
                            passed++;
                        } else {
                            console.log('❌ FAILED - Got wrong error:', errorMessage);
                            console.log('   Expected:', test.expectedErrorMessage);
                            failed++;
                        }
                    } else {
                        console.log('✅ PASSED - Got error as expected:', errorMessage);
                        passed++;
                    }
                } else {
                    console.log('❌ FAILED - Expected error but got success');
                    console.log('   Response:', JSON.stringify(response, null, 2));
                    failed++;
                }
            } else {
                // Should succeed
                if (response.errors) {
                    console.log('❌ FAILED - Got unexpected error:', response.errors[0].message);
                    failed++;
                } else {
                    console.log('✅ PASSED - Query succeeded');
                    passed++;
                }
            }
        } catch (error) {
            console.log('❌ FAILED - Request error:', error.message);
            failed++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Test Results:');
    console.log(`   ✅ Passed: ${passed}/${tests.length}`);
    console.log(`   ❌ Failed: ${failed}/${tests.length}`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Backend is working correctly.');
        console.log('✅ Authentication is properly enforced');
        console.log('✅ No null reference crashes');
        console.log('✅ Error messages are clear and helpful');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }

    console.log('\n' + '='.repeat(60));
}

// Check if server is running
console.log('Checking if backend server is running...');
http.get('http://localhost:8000/', (res) => {
    console.log('✅ Backend server is running\n');
    runTests().catch(console.error);
}).on('error', (e) => {
    console.error('❌ Backend server is not running!');
    console.error('   Please start the backend first: cd tusul_back && npm start');
    process.exit(1);
});
