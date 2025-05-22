import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/userContext';

const apiUrl = import.meta.env.VITE_BACKEND_URL;

function PhotoDetail() {
  const { id } = useParams(); // Get the photo ID from the URL
  const { user } = useContext(UserContext); // Get the user context
  const [photo, setPhoto] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const res = await fetch(`${apiUrl}/photos/${id}`);
        if (!res.ok) throw new Error('Failed to fetch photo details');
        
        const data = await res.json();
        setPhoto(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPhoto();
  }, [id]);

  const handleAddComment = async () => {
    if (!user) {
      alert('You must be logged in to comment');
      return;
    }
  
    if (!newComment) {
      alert('Please enter a comment');
      return;
    }
  
    try {
      const response = await fetch(`${apiUrl}/photos/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Ensure the newly posted comment includes the 'postedBy.username'
        const newCommentWithUser = {
          _id: data._id,
          text: data.text,
          postedBy: data.postedBy, // The postedBy object already includes the username
        };
  
        // Add the new comment to the state, which includes the username
        setPhoto(prevState => ({
          ...prevState,
          comments: [
            ...prevState.comments,
            newCommentWithUser, // Add the new comment with the populated username
          ],
        }));
  
        setNewComment(''); // Clear the input field after posting the comment
      } else {
        setError(data.message || 'Failed to add comment');
      }
    } catch (err) {
      setError('An error occurred while adding the comment');
      console.error(err);
    }
  };

  // Flag the photo as inappropriate
  const handleFlagPhoto = async () => {
    if (!user) {
      alert('You must be logged in to flag a photo');
      return;
    }
    
    try {
      const response = await fetch(`${apiUrl}/photos/${id}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the flags count
        setPhoto((prevState) => ({
          ...prevState,
          flags: prevState.flags + 1,
        }));
      } else {
        setError(data.message || 'Failed to flag photo');
      }
    } catch (err) {
      setError('An error occurred while flagging the photo');
      console.error(err);
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!photo) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Photo Details</h2>
      
      <div className="w-full rounded overflow-hidden shadow-lg mb-4 bg-white">
        <img className="w-full h-96 object-cover" src={`${apiUrl}${photo.imagePath}`} alt={photo.name} />
        <div className="px-6 py-4">
          <h3 className="font-semibold text-2xl text-gray-900">{photo.name}</h3>
          <p className="text-gray-600 text-base">{photo.description}</p>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Likes: {photo.likes}</p>
            <p className="text-sm text-gray-500">Dislikes: {photo.dislikes}</p>
            <p className="text-sm text-gray-500">Flags: {photo.flags}</p>
          </div>

          {/* Flag Photo Button */}
          {user && (
            <div className="mt-4">
              <button
                onClick={handleFlagPhoto}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Flag as Inappropriate
              </button>
            </div>  
          )}
          

          {/* Comments Section */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold">Comments</h4>
            <div className="space-y-4">
              {photo.comments.length === 0 ? (
                <p className="text-gray-500">No comments yet.</p>
              ) : (
                photo.comments.map((comment) => (
                  <div key={comment._id} className="border-b pb-2">
                    <p className="text-sm text-gray-700">
                      <strong>{comment.postedBy.username}:</strong> {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Section */}
            {user && (
              <div className="mt-4">
                <textarea
                  className="w-full p-2 border rounded-md"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button
                  onClick={handleAddComment}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Add Comment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoDetail;
