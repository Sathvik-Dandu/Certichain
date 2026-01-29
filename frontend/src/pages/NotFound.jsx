import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1 style={{ fontSize: "4rem", color: "var(--primary)", marginBottom: "1rem" }}>404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            <p className="text-secondary mb-6">The page you are looking for does not exist or has been moved.</p>
            <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
    );
};

export default NotFound;
