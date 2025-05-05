import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Feed = {
    id: string,
    bTitle: string,
    bSubTitle: string,
    bContent: string,
    bCreationDate: string
}

const NewPage: React.FC = () => {
    const [feed, setFeed] = useState<Feed[]>([]);
    
    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
        fetch(`${apiUrl}/feed`)
            .then(response => response.json())
            .then(data => {
                setFeed(data);
                console.log(data);
            })
            .catch(error => {
                console.error("Error fetching feed:", error);
            });
    }, []);

    return (
        <div className="relative flex flex-col px-4 min-h-screen bg-black text-white text-center">
            <Link to="/" className='pb-4 mx-[40%] border'>Return...</Link>
            
            <h1 className='font-bold mt-8'>Posts</h1>
            
            {feed.length === 0 ? (
                <p>Loading posts...</p>
            ) : (
                <div className="border p-2">
                    {feed.map((post) => (
                        <div key={post.id} className="border p-2 m-4">
                            <h2 className='font-bold text-red-500'>{post.bTitle}</h2>
                            <p className='underline'>{post.bSubTitle} - Posted on: {new Date(post.bCreationDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}</p>
                            <p className='px-40'>{post.bContent}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewPage;