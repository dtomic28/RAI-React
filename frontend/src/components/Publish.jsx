import { useState, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_BACKEND_URL;

function Publish() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file); // Store the image file itself
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !name || !description) {
      setError("All fields are required (image, name, description)");
      return;
    }

    // Create a FormData object to send the file and form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image', image); // Append the image file

    try {
      const response = await fetch(`${apiUrl}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,  // Add the Authorization header with the JWT token
        },
        body: formData, // Send the form data (including image file)
      });

      const data = await response.json();

      if (response.ok) {
        // Successfully uploaded the photo
        navigate('/');  // Redirect to home page or elsewhere
      } else {
        setError(data.message || "Failed to upload image");
      }
    } catch (err) {
      setError("An error occurred while uploading the image");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Publish Photo</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">Photo Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium">Image</label>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md"
            accept="image/*"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Publish Photo
        </button>
      </form>
    </div>
  );
}

export default Publish;
