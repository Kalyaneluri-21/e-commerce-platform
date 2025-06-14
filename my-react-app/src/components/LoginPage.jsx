import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'Vendor') {
          navigate('/vendor-dashboard');
        } else {
          navigate('/customer-dashboard');
        }
      }
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="w-full max-w-md bg-white bg-opacity-95 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col gap-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center font-sans mb-2">Sign in to your account</h2>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-lg shadow transition-all duration-150"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="text-center mt-2">
          <Link to="/signup" className="text-indigo-600 hover:underline text-sm">
            Don't have an account? <span className="font-semibold">Sign up</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 