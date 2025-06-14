import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store user role in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      });

      // Sign out the user after signup
      await auth.signOut();

      // Redirect to login page
      navigate('/login');
    } catch (err) {
      setError('Failed to create an account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="w-full max-w-md bg-white bg-opacity-95 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col gap-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center font-sans mb-2">Create your account</h2>
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
            autoComplete="new-password"
            required
            className="rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            id="role"
            name="role"
            required
            className="rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Customer">Customer</option>
            <option value="Vendor">Vendor</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-lg shadow transition-all duration-150"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <div className="text-center mt-2">
          <Link to="/login" className="text-indigo-600 hover:underline text-sm">
            Already have an account? <span className="font-semibold">Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 