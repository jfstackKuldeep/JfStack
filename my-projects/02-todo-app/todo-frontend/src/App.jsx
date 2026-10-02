import { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8081/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token]);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLoginView ? '/auth/login' : '/auth/register';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Authentication failed');
      }

      if (isLoginView) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setToken(data.token);
        setUsername(data.username);
      } else {
        alert('Registration successful! Please login.');
        setIsLoginView(true);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken('');
    setUsername('');
    setTodos([]);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle, completed: false })
      });

      if (response.ok) {
        setNewTitle('');
        fetchTodos();
      }
    } catch (err) {
      console.error('Failed to add todo:', err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  // ---------------- UI RENDER ----------------
  if (!token) {
    return (
      <div className="app-card">
        <div className="auth-header">
          <h2>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {isLoginView ? 'Please sign in to continue' : 'Sign up for enterprise todo manager'}
          </p>
        </div>

        {authError && <div className="error-banner">{authError}</div>}
        
        <form onSubmit={handleAuthSubmit} className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={authForm.username}
            onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            required
            className="input-field"
          />
          <button type="submit" className="btn-primary">
            {isLoginView ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="toggle-text">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); }}
            className="link-btn"
          >
            {isLoginView ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="app-card">
      <div className="header-bar">
        <div>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>User</span>
          <div className="user-badge">{username}</div>
        </div>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>

      <div className="auth-header" style={{ textAlign: 'left', marginBottom: '1rem' }}>
        <h2>Dashboard</h2>
      </div>

      <form onSubmit={handleAddTodo} className="form-group" style={{ flexDirection: 'row' }}>
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.25rem' }}>
          Add
        </button>
      </form>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '1rem' }}>No tasks found</p>
        ) : (
          todos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <span>{todo.title}</span>
              <button onClick={() => handleDeleteTodo(todo.id)} className="btn-delete">
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
