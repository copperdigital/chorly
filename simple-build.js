const fs = require('fs');
const path = require('path');

// Create build directory
const buildDir = 'dist/public';
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Create simple HTML with embedded JavaScript (no template literals)
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chorly - Family Chore Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    </style>
</head>
<body>
    <div id="root">
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">Welcome to Chorly</h1>
                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input id="email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input id="password" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                        Sign In
                    </button>
                </form>
                <div class="mt-4 p-4 bg-blue-50 rounded-md">
                    <h3 class="font-semibold text-blue-900 mb-2">Demo Account:</h3>
                    <p class="text-sm text-blue-700">Email: family@example.com</p>
                    <p class="text-sm text-blue-700">Password: password123</p>
                    <button onclick="quickLogin()" class="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200">
                        Use Demo Login
                    </button>
                    <div class="mt-2 text-xs text-blue-600">
                        <p>PINs: Dad(1234), Mum(5678), Seb(9999), Tessa(1111)</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentPage = 'login';
        let userData = null;
        let currentUser = null;

        function quickLogin() {
            document.getElementById('email').value = 'family@example.com';
            document.getElementById('password').value = 'password123';
        }

        function showLogin() {
            const root = document.getElementById('root');
            root.innerHTML = \`
                <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">Welcome to Chorly</h1>
                        <form id="loginForm" class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input id="email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input id="password" type="password" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                                Sign In
                            </button>
                        </form>
                        <div class="mt-4 p-4 bg-blue-50 rounded-md">
                            <h3 class="font-semibold text-blue-900 mb-2">Demo Account:</h3>
                            <p class="text-sm text-blue-700">Email: family@example.com</p>
                            <p class="text-sm text-blue-700">Password: password123</p>
                            <button onclick="quickLogin()" class="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200">
                                Use Demo Login
                            </button>
                            <div class="mt-2 text-xs text-blue-600">
                                <p>PINs: Dad(1234), Mum(5678), Seb(9999), Tessa(1111)</p>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
            document.getElementById('loginForm').onsubmit = handleLogin;
        }

        function showProfileSelect() {
            const root = document.getElementById('root');
            let profilesHtml = '';
            
            if (userData && userData.people) {
                userData.people.forEach(function(person) {
                    profilesHtml += \`
                        <div class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onclick="selectProfile(\${person.id}, '\${person.nickname}')">
                            <div class="flex items-center space-x-3">
                                <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                    \${person.nickname.charAt(0)}
                                </div>
                                <div>
                                    <h3 class="font-semibold text-gray-900">\${person.nickname}</h3>
                                    \${person.isAdmin ? '<span class="text-xs text-blue-600">Admin</span>' : ''}
                                </div>
                            </div>
                        </div>
                    \`;
                });
            } else {
                profilesHtml = '<p class="text-gray-500 text-center">No family members found</p>';
            }

            root.innerHTML = \`
                <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">Select Your Profile</h1>
                        <div class="space-y-4">
                            \${profilesHtml}
                        </div>
                    </div>
                </div>
            \`;
        }

        function showDashboard() {
            const root = document.getElementById('root');
            root.innerHTML = \`
                <div class="min-h-screen bg-gray-50">
                    <nav class="bg-white shadow-sm border-b">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div class="flex justify-between items-center h-16">
                                <h1 class="text-2xl font-bold text-gray-900">Chorly</h1>
                                <div class="flex space-x-4">
                                    <button onclick="logout()" class="text-gray-600 hover:text-gray-900">Logout</button>
                                </div>
                            </div>
                        </div>
                    </nav>
                    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div id="dashboard-content" class="text-center py-12">
                            <div class="animate-spin rounded-full border-4 border-blue-500 border-t-transparent w-8 h-8 mx-auto mb-4"></div>
                            <p>Loading dashboard...</p>
                        </div>
                    </main>
                </div>
            \`;
            loadDashboard();
        }

        async function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });
                
                if (response.ok) {
                    userData = await response.json();
                    localStorage.setItem('user', JSON.stringify(userData));
                    currentPage = 'profile-select';
                    showProfileSelect();
                } else {
                    alert('Login failed. Please check your credentials.');
                }
            } catch (error) {
                alert('Login failed. Please try again.');
            }
        }

        async function selectProfile(personId, nickname) {
            const pin = prompt('Enter PIN for ' + nickname + ':');
            if (!pin) return;

            try {
                const response = await fetch('/api/auth/profile-select', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ personId: personId, pin: pin })
                });

                if (response.ok) {
                    currentUser = await response.json();
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    currentPage = 'dashboard';
                    showDashboard();
                } else {
                    alert('Invalid PIN. Please try again.');
                }
            } catch (error) {
                alert('Profile selection failed. Please try again.');
            }
        }

        async function loadDashboard() {
            try {
                const stored = localStorage.getItem('currentUser');
                if (stored) {
                    currentUser = JSON.parse(stored);
                }
                
                const householdId = currentUser && currentUser.household ? currentUser.household.id : 1;
                const url = '/api/dashboard?householdId=' + householdId;
                
                const response = await fetch(url);
                const data = await response.json();
                
                let peopleHtml = '';
                if (data.people) {
                    data.people.forEach(function(person) {
                        peopleHtml += \`
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <span class="font-medium">\${person.nickname}</span>
                                <span class="text-sm text-gray-600">\${person.totalPoints} pts</span>
                            </div>
                        \`;
                    });
                }

                let tasksHtml = '';
                if (data.taskInstances) {
                    data.taskInstances.forEach(function(task) {
                        const title = task.task ? task.task.title : 'Task';
                        const buttonText = task.isCompleted ? '✓' : 'Complete';
                        tasksHtml += \`
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <span class="font-medium">\${title}</span>
                                <button onclick="completeTask(\${task.id})" class="text-green-600 hover:text-green-800">
                                    \${buttonText}
                                </button>
                            </div>
                        \`;
                    });
                }
                
                const content = document.getElementById('dashboard-content');
                content.innerHTML = \`
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white rounded-lg shadow p-6">
                            <h2 class="text-xl font-semibold mb-4">Family Members</h2>
                            <div class="space-y-2">
                                \${peopleHtml}
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow p-6">
                            <h2 class="text-xl font-semibold mb-4">Today's Tasks</h2>
                            <div class="space-y-2">
                                \${tasksHtml}
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow p-6">
                            <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
                            <div class="space-y-2">
                                <button class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                    Manage Tasks
                                </button>
                            </div>
                        </div>
                    </div>
                \`;
            } catch (error) {
                const content = document.getElementById('dashboard-content');
                content.innerHTML = \`
                    <div class="text-center py-12">
                        <p class="text-red-600 mb-4">Failed to load dashboard</p>
                        <button onclick="showLogin()" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            Back to Login
                        </button>
                    </div>
                \`;
            }
        }

        async function completeTask(taskId) {
            try {
                const response = await fetch('/api/tasks/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskInstanceId: taskId })
                });
                
                if (response.ok) {
                    loadDashboard();
                }
            } catch (error) {
                alert('Failed to complete task');
            }
        }

        function logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('currentUser');
            userData = null;
            currentUser = null;
            currentPage = 'login';
            showLogin();
        }

        // Initialize
        const stored = localStorage.getItem('user');
        if (stored) {
            userData = JSON.parse(stored);
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
                currentPage = 'dashboard';
                showDashboard();
            } else {
                currentPage = 'profile-select';
                showProfileSelect();
            }
        } else {
            document.getElementById('loginForm').onsubmit = handleLogin;
        }
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(buildDir, 'index.html'), html);
console.log('Build completed successfully!');
console.log('Output: ' + path.join(buildDir, 'index.html'));