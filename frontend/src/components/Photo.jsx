const apiUrl = import.meta.env.BACKEND_URL;

function Photo(props){
    return (
        <div className="card bg-dark text-dark mb-2">
            <img className="card-img" src={apiUrl+props.photo.path} alt={props.photo.name}/>
            <div className="card-img-overlay">
                <h5 className="card-title">{props.photo.name}</h5>
            </div>
        </div>
    );
}

export default Photo;