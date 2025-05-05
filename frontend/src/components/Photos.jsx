import { useState, useEffect } from 'react';
import Photo from './Photo';

const apiUrl = import.meta.env.BACKEND_URL;

function Photos(){
    const [photos, setPhotos] = useState([]);
    useEffect(function(){
        const getPhotos = async function(){
            const res = await fetch(`${apiUrl}/photos`);
            const data = await res.json();
            setPhotos(data);
        }
        getPhotos();
    }, []);

    return(
        <div>
            <h3>Photos:</h3>
            <ul>
                {photos.map(photo=>(<Photo photo={photo} key={photo._id}></Photo>))}
            </ul>
        </div>
    );
}

export default Photos;