import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>404</h1>
            <p style={styles.text}>Oops! Page not found.</p>
            <Link to="/" style={styles.link}>Go back to homepage</Link>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
    },
    heading: {
        fontSize: '6rem',
        margin: '0',
        color: '#333',
    },
    text: {
        fontSize: '1.5rem',
        margin: '1rem 0',
        color: '#666',
    },
    link: {
        fontSize: '1rem',
        color: '#0077cc',
        textDecoration: 'none',
        border: '1px solid #0077cc',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
    },
};

export default NotFound;