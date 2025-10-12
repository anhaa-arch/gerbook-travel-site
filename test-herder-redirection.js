// Test script to verify Herder user redirection logic

// Mock the necessary objects and functions
const mockRouter = {
  push: (path) => {
    console.log(`Redirecting to: ${path}`);
    return path;
  }
};

const mockToast = {
  toast: ({ title, description }) => {
    console.log(`Toast notification: ${title} - ${description}`);
  }
};

// Mock localStorage
const mockLocalStorage = {
  storage: {},
  getItem: function(key) {
    return this.storage[key] || null;
  },
  setItem: function(key, value) {
    this.storage[key] = value;
    console.log(`localStorage.setItem('${key}', '${value}')`);
  },
  removeItem: function(key) {
    delete this.storage[key];
    console.log(`localStorage.removeItem('${key}')`);
  }
};

// Mock saveUserData function
const mockSaveUserData = async (user) => {
  console.log(`Saving user data: ${JSON.stringify(user)}`);
  return user;
};

// Test cases for different user roles
const testCases = [
  { role: "HERDER", name: "Herder User", email: "herder@example.com" },
  { role: "herder", name: "Lowercase Herder", email: "lowercase.herder@example.com" },
  { role: "CUSTOMER", name: "Customer User", email: "customer@example.com" },
  { role: "ADMIN", name: "Admin User", email: "admin@example.com" },
  { role: "unknown", name: "Unknown Role", email: "unknown@example.com" }
];

// Function to simulate the login redirection logic
async function testLoginRedirection(user) {
  console.log(`\nTesting login redirection for user: ${user.name} (${user.email}) with role: ${user.role}`);
  
  // Set isHerder flag in localStorage if user is a herder
  const isHerder = user.role === "HERDER" || user.role.toLowerCase() === "herder";
  if (isHerder) {
    mockLocalStorage.setItem('isHerder', 'true');
  } else {
    mockLocalStorage.removeItem('isHerder');
  }
  
  await mockSaveUserData(user);

  mockToast.toast({ 
    title: "Амжилттай нэвтэрлээ", 
    description: `${user.name || user.email}` 
  });

  // Route based on normalized role
  const userRole = user.role.toString().toUpperCase();
  const dashboardRoutes = {
    "ADMIN": "/admin-dashboard",
    "HERDER": "/herder-dashboard",
    "CUSTOMER": "/user-dashboard",
  };
  
  // Ensure herder users are redirected to herder dashboard
  if (isHerder) {
    return mockRouter.push("/herder-dashboard");
  } else {
    return mockRouter.push(dashboardRoutes[userRole] || "/user-dashboard");
  }
}

// Run the tests
async function runTests() {
  console.log("Starting redirection tests...");
  
  for (const testCase of testCases) {
    const redirectPath = await testLoginRedirection(testCase);
    
    // Verify the redirection
    if (testCase.role === "HERDER" || testCase.role.toLowerCase() === "herder") {
      if (redirectPath === "/herder-dashboard") {
        console.log("✅ PASS: Herder user correctly redirected to Herder Dashboard");
      } else {
        console.log(`❌ FAIL: Herder user incorrectly redirected to ${redirectPath}`);
      }
    } else if (testCase.role === "CUSTOMER") {
      if (redirectPath === "/user-dashboard") {
        console.log("✅ PASS: Customer user correctly redirected to User Dashboard");
      } else {
        console.log(`❌ FAIL: Customer user incorrectly redirected to ${redirectPath}`);
      }
    } else if (testCase.role === "ADMIN") {
      if (redirectPath === "/admin-dashboard") {
        console.log("✅ PASS: Admin user correctly redirected to Admin Dashboard");
      } else {
        console.log(`❌ FAIL: Admin user incorrectly redirected to ${redirectPath}`);
      }
    } else {
      if (redirectPath === "/user-dashboard") {
        console.log("✅ PASS: Unknown role user correctly redirected to User Dashboard");
      } else {
        console.log(`❌ FAIL: Unknown role user incorrectly redirected to ${redirectPath}`);
      }
    }
  }
  
  console.log("\nTest summary:");
  console.log("- Herder users (both uppercase and lowercase) should be redirected to /herder-dashboard");
  console.log("- Customer users should be redirected to /user-dashboard");
  console.log("- Admin users should be redirected to /admin-dashboard");
  console.log("- Unknown role users should be redirected to /user-dashboard");
}

// Run the tests
runTests();