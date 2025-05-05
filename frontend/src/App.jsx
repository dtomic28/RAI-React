// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider, UserContext } from './context/userContext'; // Import UserProvider and UserContext

import Header from './components/Header';
import Photos from './components/Photos';
import Login from './components/Login';
import Register from './components/Register';
import Logout from './components/Logout';
import Publish from './components/Publish';
import PhotoDetail from './components/PhotoDetail';
import './App.css';
import PrivateRoute from './components/PrivateRoute';  // Import the PrivateRoute component

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <div className="App bg-gray-100 min-h-screen flex flex-col">
          <Header title="Slikice app" />
          <Routes>
            <Route path="/" element={<Photos />} />
            <Route path="/hot" element={<Photos isHot="true"/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/publish" element={<PrivateRoute element={<Publish/>} />} />
            <Route path="/photo/:id" element={<PhotoDetail />} />
          </Routes>
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
