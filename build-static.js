import fs from 'fs';
import path from 'path';

// Create a simple static build without Vite complexity
const buildDir = 'dist/public';
const clientDir = 'client';

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy HTML file and modify for production
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chorly - Family Chore Management</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        .loading { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">
            <div class="text-center">
                <div class="animate-spin rounded-full border-4 border-blue-500 border-t-transparent w-8 h-8 mx-auto mb-4"></div>
                <p>Loading Chorly...</p>
            </div>
        </div>
    </div>
    <script>
        // Simple SPA router for Chorly
        const routes = {
            '/': 'dashboard',
            '/login': 'login',
            '/admin': 'admin',
            '/profile-select': 'profile-select'
        };
        
        function navigate(path) {
            window.history.pushState({}, '', path);
            render();
        }
        
        function render() {
            const path = window.location.pathname;
            const route = routes[path] || 'dashboard';
            
            const root = document.getElementById('root');
            
            if (route === 'login') {
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
                                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                                    Sign In
                                </button>
                            </form>
                            <div class="mt-6 text-center">
                                <button onclick="showRegister()" class="text-blue-600 hover:text-blue-800">
                                    Create New Household
                                </button>
                            </div>
                            <div class="mt-4 p-4 bg-blue-50 rounded-md">
                                <h3 class="font-semibold text-blue-900 mb-2">Demo Login:</h3>
                                <p class="text-sm text-blue-700">Email: family@example.com</p>
                                <p class="text-sm text-blue-700">Password: password123</p>
                                <button onclick="quickLogin()" class="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200">
                                    Use Demo Login
                                </button>
                            </div>
                        </div>
                    </div>
                \`;
                
                document.getElementById('loginForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    
                    try {
                        const response = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password })
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            localStorage.setItem('user', JSON.stringify(data));
                            navigate('/profile-select');
                        } else {
                            alert('Login failed. Please check your credentials.');
                        }
                    } catch (error) {
                        alert('Login failed. Please try again.');
                    }
                };
            } else if (route === 'dashboard') {
                root.innerHTML = \`
                    <div class="min-h-screen bg-gray-50">
                        <nav class="bg-white shadow-sm border-b">
                            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div class="flex justify-between items-center h-16">
                                    <h1 class="text-2xl font-bold text-gray-900">Chorly</h1>
                                    <div class="flex space-x-4">
                                        <button onclick="navigate('/admin')" class="text-gray-600 hover:text-gray-900">Admin</button>
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
            } else if (route === 'profile-select') {
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                root.innerHTML = \`
                    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                            <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">Select Your Profile</h1>
                            <div class="space-y-4">
                                \${userData.people?.map(person => \`
                                    <div class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onclick="selectProfile(\${person.id}, '\${person.nickname}')">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-12 h-12 rounded-full bg-\${person.avatar}-500 flex items-center justify-center text-white font-bold">
                                                \${person.nickname.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 class="font-semibold text-gray-900">\${person.nickname}</h3>
                                                \${person.isAdmin ? '<span class="text-xs text-blue-600">Admin</span>' : ''}
                                            </div>
                                        </div>
                                    </div>
                                \`).join('') || '<p class="text-gray-500 text-center">No family members found</p>'}
                            </div>
                        </div>
                    </div>
                \`;
            } else {
                root.innerHTML = \`
                    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div class="text-center">
                            <h1 class="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                            <button onclick="navigate('/')" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                \`;
            }
        }
        
        async function loadDashboard() {
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const householdId = currentUser.household?.id || 1; // Default to demo household
                
                const response = await fetch(`/api/dashboard?householdId=${householdId}`);
                const data = await response.json();
                
                const content = document.getElementById('dashboard-content');
                content.innerHTML = \`
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white rounded-lg shadow p-6">
                            <h2 class="text-xl font-semibold mb-4">Family Members</h2>
                            <div class="space-y-2">
                                \${data.people.map(person => \`
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <span class="font-medium">\${person.nickname}</span>
                                        <span class="text-sm text-gray-600">\${person.totalPoints} pts</span>
                                    </div>
                                \`).join('')}
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow p-6">
                            <h2 class="text-xl font-semibold mb-4">Today's Tasks</h2>
                            <div class="space-y-2">
                                \${data.taskInstances.map(task => \`
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <span class="font-medium">\${task.task?.title || 'Task'}</span>
                                        <button onclick="completeTask(\${task.id})" class="text-green-600 hover:text-green-800">
                                            \${task.isCompleted ? '✓' : 'Complete'}
                                        </button>
                                    </div>
                                \`).join('')}
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow p-6">
                            <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
                            <div class="space-y-2">
                                <button onclick="navigate('/admin')" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                                    Manage Tasks
                                </button>
                                <button onclick="addFamily()" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                                    Add Family Member
                                </button>
                            </div>
                        </div>
                    </div>
                \`;
            } catch (error) {
                document.getElementById('dashboard-content').innerHTML = \`
                    <div class="text-center py-12">
                        <p class="text-red-600 mb-4">Failed to load dashboard</p>
                        <button onclick="navigate('/login')" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            Go to Login
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
                    loadDashboard(); // Reload to show updated state
                }
            } catch (error) {
                alert('Failed to complete task');
            }
        }
        
        function logout() {
            localStorage.removeItem('user');
            navigate('/login');
        }
        
        function showRegister() {
            const email = prompt('Enter household email:');
            const password = prompt('Enter password:');
            const name = prompt('Enter household name (e.g., "The Smith Family"):');
            if (email && password && name) {
                register(email, password, name);
            }
        }
        
        function quickLogin() {
            document.getElementById('email').value = 'family@example.com';
            document.getElementById('password').value = 'password123';
        }

        async function selectProfile(personId, nickname) {
            const pin = prompt('Enter PIN for ' + nickname + ':');
            if (!pin) return;

            try {
                const response = await fetch('/api/auth/profile-select', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ personId, pin })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('currentUser', JSON.stringify(data));
                    navigate('/');
                } else {
                    alert('Invalid PIN. Please try again.');
                }
            } catch (error) {
                alert('Profile selection failed. Please try again.');
            }
        }

        async function register(email, password, name) {
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name })
                });
                
                if (response.ok) {
                    alert('Household created! Please log in.');
                } else {
                    const error = await response.json();
                    alert('Registration failed: ' + (error.error || 'Unknown error'));
                }
            } catch (error) {
                alert('Registration failed: ' + error.message);
            }
        }
        
        // Initialize app
        window.addEventListener('popstate', render);
        
        // Check if user is logged in
        const user = localStorage.getItem('user');
        if (!user && window.location.pathname !== '/login') {
            navigate('/login');
        } else {
            render();
        }
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(buildDir, 'index.html'), htmlContent);

console.log('Static build completed successfully!');
console.log('Created:', path.join(buildDir, 'index.html'));