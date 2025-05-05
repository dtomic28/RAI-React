// src/components/Header.js
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext'; // Import UserContext

function Header({ title }) {
  const { user, setUserContext } = useContext(UserContext); // Get user from context
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  const handleLogout = () => {
    navigate('/logout');
    setUserContext(null);
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/">
        <h1 className="text-xl font-semibold">{title}</h1>
      </Link>
      <nav>
        <ul className="flex space-x-4">
          <li><Link className="hover:text-gray-300" to="/">Home</Link></li>
          <li><Link className="hover:text-gray-300" to="/hot">Trending</Link></li>
          {isLoggedIn ? (
            <>
              <li><Link className="hover:text-gray-300" to="/publish">Publish</Link></li>
              <li><button className="hover:text-gray-300" onClick={handleLogout}>Logout</button></li>  {/* Changed this to a button */}
            </>
          ) : (
            <>
              <li><Link className="hover:text-gray-300" to="/login">Login</Link></li>
              <li><Link className="hover:text-gray-300" to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
