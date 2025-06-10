import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, 'dist', 'public');

// Ensure build directory exists
if (!fs.existsSync(path.dirname(buildDir))) {
  fs.mkdirSync(path.dirname(buildDir), { recursive: true });
}
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
            background: #f8fafc;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
        .btn-primary { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary { background: #e5e7eb; color: #374151; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
        .btn-secondary:hover { background: #d1d5db; }
        .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 24px; margin-bottom: 16px; }
        .input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; }
        .input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        .flex { display: flex; }
        .flex-between { justify-content: space-between; }
        .flex-center { align-items: center; }
        .space-y-4 > * + * { margin-top: 16px; }
        .space-y-2 > * + * { margin-top: 8px; }
        .text-center { text-align: center; }
        .text-xl { font-size: 1.25rem; font-weight: 600; }
        .text-2xl { font-size: 1.5rem; font-weight: 700; }
        .text-3xl { font-size: 1.875rem; font-weight: 800; }
        .text-gray-600 { color: #6b7280; }
        .text-green-600 { color: #059669; }
        .text-red-600 { color: #dc2626; }
        .text-red-800 { color: #991b1b; }
        .bg-gray-50 { background: #f9fafb; }
        .bg-red-50 { background: #fef2f2; }
        .bg-blue-50 { background: #eff6ff; }
        .border-red-500 { border-left: 4px solid #ef4444; }
        .rounded { border-radius: 8px; }
        .p-3 { padding: 12px; }
        .p-4 { padding: 16px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mt-2 { margin-top: 8px; }
        .hidden { display: none; }
        .overdue-task { background: #fef2f2; border-left: 4px solid #ef4444; }
        .overdue-label { font-size: 12px; color: #dc2626; margin-top: 4px; }
        
        .family-member {
            background: white;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.2s;
            border: 2px solid transparent;
        }
        .family-member:hover { transform: translateY(-2px); }
        .family-member.selected { 
            border-color: #3b82f6; 
            box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }
        
        .avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 20px;
            color: white;
        }
        .avatar-blue { background: #3b82f6; }
        .avatar-pink { background: #ec4899; }
        .avatar-green { background: #10b981; }
        .avatar-purple { background: #8b5cf6; }
    </style>
</head>
<body>
    <div id="root">Loading...</div>
    
    <script>
        const { useState, useEffect } = React;
        const { createRoot } = ReactDOM;
        
        let currentUser = null;
        let householdData = null;
        
        function LoginPage() {
            const [email, setEmail] = useState('');
            const [password, setPassword] = useState('');
            const [isLoading, setIsLoading] = useState(false);
            
            const handleSubmit = async (e) => {
                e.preventDefault();
                setIsLoading(true);
                
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        currentUser = data;
                        householdData = data;
                        renderApp();
                    } else {
                        alert('Invalid email or password');
                    }
                } catch (error) {
                    alert('Login failed. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            };
            
            const quickLogin = () => {
                setEmail('family@example.com');
                setPassword('password123');
            };
            
            return React.createElement('div', { 
                style: { 
                    minHeight: '100vh', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }
            }, [
                React.createElement('div', { key: 'login-card', className: 'card', style: { maxWidth: '400px', width: '100%' } }, [
                    React.createElement('h1', { key: 'title', className: 'text-3xl text-center mb-6' }, 'Welcome to Chorly'),
                    React.createElement('form', { key: 'form', onSubmit: handleSubmit, className: 'space-y-4' }, [
                        React.createElement('div', { key: 'email-field' }, [
                            React.createElement('label', { key: 'email-label', style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Email'),
                            React.createElement('input', {
                                key: 'email-input',
                                type: 'email',
                                className: 'input',
                                value: email,
                                onChange: (e) => setEmail(e.target.value),
                                required: true
                            })
                        ]),
                        React.createElement('div', { key: 'password-field' }, [
                            React.createElement('label', { key: 'password-label', style: { display: 'block', marginBottom: '8px', fontWeight: '500' } }, 'Password'),
                            React.createElement('input', {
                                key: 'password-input',
                                type: 'password',
                                className: 'input',
                                value: password,
                                onChange: (e) => setPassword(e.target.value),
                                required: true
                            })
                        ]),
                        React.createElement('button', {
                            key: 'submit-btn',
                            type: 'submit',
                            className: 'btn-primary',
                            style: { width: '100%' },
                            disabled: isLoading
                        }, isLoading ? 'Signing in...' : 'Sign In')
                    ]),
                    React.createElement('div', { key: 'demo-section', className: 'mt-6 p-4 bg-blue-50 rounded' }, [
                        React.createElement('h3', { key: 'demo-title', style: { fontWeight: '600', marginBottom: '8px' } }, 'Demo Login:'),
                        React.createElement('p', { key: 'demo-email', style: { fontSize: '14px', color: '#1e40af' } }, 'Email: family@example.com'),
                        React.createElement('p', { key: 'demo-password', style: { fontSize: '14px', color: '#1e40af' } }, 'Password: password123'),
                        React.createElement('button', {
                            key: 'demo-btn',
                            type: 'button',
                            className: 'btn-secondary',
                            style: { marginTop: '8px' },
                            onClick: quickLogin
                        }, 'Use Demo Login')
                    ])
                ])
            ]);
        }
        
        function Dashboard() {
            const [dashboardData, setDashboardData] = useState(null);
            const [selectedPerson, setSelectedPerson] = useState(null);
            const [isLoading, setIsLoading] = useState(true);
            
            useEffect(() => {
                loadDashboard();
            }, []);
            
            const loadDashboard = async () => {
                try {
                    const response = await fetch(\`/api/dashboard?householdId=\${householdData.householdId}\`);
                    const data = await response.json();
                    setDashboardData(data);
                } catch (error) {
                    console.error('Failed to load dashboard:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            
            const completeTask = async (taskId) => {
                if (!selectedPerson) return;
                
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
            };
            
            const selectPerson = (person) => {
                setSelectedPerson(person);
            };
            
            const logout = () => {
                currentUser = null;
                householdData = null;
                renderApp();
            };
            
            if (isLoading) {
                return React.createElement('div', { 
                    style: { 
                        minHeight: '100vh', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    } 
                }, 'Loading dashboard...');
            }
            
            if (!dashboardData) {
                return React.createElement('div', { 
                    style: { 
                        minHeight: '100vh', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    } 
                }, 'Failed to load dashboard');
            }
            
            return React.createElement('div', { style: { minHeight: '100vh', background: '#f8fafc' } }, [
                React.createElement('header', { key: 'header', style: { background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px 0' } }, [
                    React.createElement('div', { key: 'header-content', className: 'container flex flex-between flex-center' }, [
                        React.createElement('h1', { key: 'header-title', className: 'text-2xl' }, 'Chorly'),
                        React.createElement('button', {
                            key: 'logout-btn',
                            className: 'btn-secondary',
                            onClick: logout
                        }, 'Logout')
                    ])
                ]),
                React.createElement('main', { key: 'main', className: 'container', style: { paddingTop: '32px' } }, [
                    React.createElement('div', { key: 'family-section', className: 'mb-6' }, [
                        React.createElement('h2', { key: 'family-title', className: 'text-xl mb-4' }, 'Family Members'),
                        React.createElement('div', { key: 'family-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' } }, 
                            dashboardData.people.map(person => 
                                React.createElement('div', { 
                                    key: person.id, 
                                    className: \`family-member \${selectedPerson?.id === person.id ? 'selected' : ''}\`,
                                    onClick: () => selectPerson(person),
                                    style: { cursor: 'pointer' }
                                }, [
                                    React.createElement('div', { 
                                        key: 'avatar', 
                                        className: \`avatar avatar-\${person.avatar}\`
                                    }, person.nickname.charAt(0)),
                                    React.createElement('h3', { key: 'name', style: { fontWeight: '600', marginBottom: '4px' } }, person.nickname),
                                    React.createElement('p', { key: 'points', className: 'text-gray-600' }, \`\${person.totalPoints} points\`),
                                    React.createElement('p', { key: 'streak', className: 'text-gray-600' }, \`\${person.currentStreak} day streak\`)
                                ])
                            )
                        )
                    ]),
                    React.createElement('div', { key: 'tasks-section' }, [
                        React.createElement('h2', { key: 'tasks-title', className: 'text-xl mb-4' }, 'Today\\'s Tasks'),
                        React.createElement('div', { key: 'tasks-list', className: 'space-y-2' },
                            dashboardData.taskInstances.map(task => {
                                const canComplete = selectedPerson && task.assignedTo === selectedPerson.id;
                                const buttonText = task.isCompleted ? '✓' : 'Complete';
                                
                                return React.createElement('div', { 
                                    key: task.id, 
                                    className: \`flex flex-between flex-center p-3 rounded \${task.isOverdue ? 'overdue-task' : 'bg-gray-50'}\`
                                }, [
                                    React.createElement('div', { key: 'task-info' }, [
                                        React.createElement('span', { 
                                            key: 'task-title', 
                                            style: { fontWeight: '500', color: task.isOverdue ? '#991b1b' : 'inherit' } 
                                        }, task.task?.title || 'Task'),
                                        task.isOverdue ? React.createElement('div', { 
                                            key: 'overdue-label', 
                                            className: 'overdue-label' 
                                        }, 'Overdue') : null
                                    ]),
                                    React.createElement('button', {
                                        key: 'complete-btn',
                                        className: 'btn-secondary',
                                        style: { 
                                            color: canComplete ? '#059669' : '#6b7280',
                                            cursor: canComplete ? 'pointer' : 'not-allowed'
                                        },
                                        onClick: canComplete ? () => completeTask(task.id) : undefined,
                                        disabled: !canComplete
                                    }, buttonText)
                                ]);
                            })
                        )
                    ])
                ])
            ]);
        }
        
        function App() {
            if (!currentUser) {
                return React.createElement(LoginPage);
            }
            
            return React.createElement(Dashboard);
        }
        
        function renderApp() {
            const root = document.getElementById('root');
            const reactRoot = createRoot(root);
            reactRoot.render(React.createElement(App));
        }
        
        // Initialize app
        renderApp();
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(buildDir, 'index.html'), htmlContent);
console.log('React production build completed successfully!');
console.log('Created:', path.join(buildDir, 'index.html'));