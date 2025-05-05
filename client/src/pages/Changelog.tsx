import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import "../Changelog.css";

const Changelog: React.FC = () => {
    const [markdown, setMarkdown] = useState('');
    useEffect(() => {
        fetch('CHANGELOG.md')
          .then(response => response.text())
          .then(text => setMarkdown(text));
      }, []);
    return (
        <div className="relative flex flex-col px-4 min-h-screen bg-black text-white text-center">
            <Link to="/" className='pb-4 mx-[40%] border'>Return...</Link>
            <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
    )
}

export default Changelog;