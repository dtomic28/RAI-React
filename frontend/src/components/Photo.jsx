import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { Link } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_BACKEND_URL;  // Ensure the backend URL is correctly set in the environment variables

function Photo({ photo }) {
  const { user } = useContext(UserContext);
  const [likes, setLikes] = useState(photo.likes);
  const [dislikes, setDislikes] = useState(photo.dislikes);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [userHasDisliked, setUserHasDisliked] = useState(false);

  useEffect(() => {
    if (user) {
      console.log("User context is set:", user);
      // Initialize the like/dislike state based on the user context
      setUserHasLiked(photo.likesBy.includes(user._id));
      setUserHasDisliked(photo.dislikesBy.includes(user._id));
    }
  }, [user, photo.likesBy, photo.dislikesBy]);  // Re-run whenever user or photo data changes

  const handleVote = async (voteType) => {
    if (!user) {
      alert('You must be logged in to vote on this photo');
      return;
    }

    const response = await fetch(`${apiUrl}/photos/${photo._id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,  // Add the Authorization header with the JWT token
      },
      body: JSON.stringify({ voteType }),
    });

    if (response.ok) {
      const updatedPhoto = await response.json();
      if (voteType === 'like') {
        setLikes(updatedPhoto.likes);
        setUserHasLiked(true);
        setUserHasDisliked(false);
      } else if (voteType === 'removeLike') {
        setLikes(updatedPhoto.likes);
        setUserHasLiked(false);
      } else if (voteType === 'dislike') {
        setDislikes(updatedPhoto.dislikes);
        setUserHasDisliked(true);
        setUserHasLiked(false);
      } else if (voteType === 'removeDislike') {
        setDislikes(updatedPhoto.dislikes);
        setUserHasDisliked(false);
      }
    }
  };

  return (
    <div className="w-full rounded overflow-hidden shadow-lg mb-4 bg-white">
      {/* Construct the image URL using the backend base URL */}
      <Link to={`/photo/${photo._id}`}>
      <img className="w-full h-64 object-cover" src={`${apiUrl}${photo.imagePath}`} alt={photo.name} />
      </Link>
      <div className="px-6 py-4">
        <h5 className="font-semibold text-xl text-gray-900">{photo.name}</h5>
        <p className="text-gray-600 text-base">{photo.description}</p>
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-3">
            {/* Like/Remove Like Button */}
            {user && !userHasLiked ? (
              <button
                onClick={() => handleVote('like')}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Like
              </button>
            ) : userHasLiked ? (
              <button
                onClick={() => handleVote('removeLike')}
                className="bg-blue-300 text-white px-4 py-2 rounded-md hover:bg-blue-400"
              >
                Remove Like
              </button>
            ) : null}

            {/* Dislike/Remove Dislike Button */}
            {user && !userHasDisliked ? (
              <button
                onClick={() => handleVote('dislike')}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Dislike
              </button>
            ) : userHasDisliked ? (
              <button
                onClick={() => handleVote('removeDislike')}
                className="bg-red-300 text-white px-4 py-2 rounded-md hover:bg-red-400"
              >
                Remove Dislike
              </button>
            ) : null}
          </div>
          <div>
            <p className="text-sm text-gray-500">{likes} Likes</p>
            <p className="text-sm text-gray-500">{dislikes} Dislikes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Photo;
