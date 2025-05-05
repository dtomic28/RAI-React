import { useState, useEffect } from 'react';
import Photo from './Photo';

const apiUrl = import.meta.env.VITE_BACKEND_URL; // Ensure the env variable is set correctly

function Photos({isHot}) {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const getPhotos = async () => {
            try {
                const res = await fetch(isHot ? `${apiUrl}/photos/hot` : `${apiUrl}/photos`);
                if (!res.ok) throw new Error('Failed to fetch photos');
                
                const data = await res.json();
                setPhotos(data.photos || data);  // Adjust based on the response structure
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        getPhotos();
    }, [isHot]);

    return (
        <div className="container mx-auto px-8 p-4 w-full md:w-1/2">
            <h3 className="text-2xl font-semibold mb-4">Photos</h3>
            {loading ? (
                <p className="text-lg text-gray-500">Loading...</p>
            ) : error ? (
                <p className="text-lg text-red-500">Error: {error}</p>
            ) : (
                <div className="space-y-6">  {/* Add space between each photo */}
                    {photos.map(photo => (
                        <Photo key={photo._id} photo={photo} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Photos;
