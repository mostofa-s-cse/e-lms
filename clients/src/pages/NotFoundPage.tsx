import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
    <p className="mb-6">The page you are looking for does not exist.</p>
    <Link to="/" className="text-blue-600 hover:underline">Go Home</Link>
  </div>
);

export default NotFoundPage; 