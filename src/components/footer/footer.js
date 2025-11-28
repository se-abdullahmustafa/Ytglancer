import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gray-800 mt-32 text-white py-8">
            <div className="container mx-auto flex flex-col md:flex-row justify-center items-center md:space-x-12">
                {/* <div className="mb-4 md:mb-0 w-64 flex justify-center items-center md:ml-0">
                    <img src={require('../../assets/logo.png')} alt="Video Glancer" className="h-12" />
                </div> */}
                <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4 mb-4 md:mb-0">
                    <Link to="/" className="text-white hover:text-gray-300 hover:no-underline">Home</Link>
                    {/* <Link to="/about/" className="text-white hover:text-gray-300 hover:no-underline">About Us</Link> */}
                    {/* <Link to="/privacy-policy/" className="text-white hover:text-gray-300 hover:no-underline">Privacy Policy</Link> */}
                    {/* <Link to="/contact/" className="text-white hover:text-gray-300 hover:no-underline">Contact Us</Link> */}
                    {/* <Link to="/disclaimer/" className="text-white hover:text-gray-300 hover:no-underline">Disclaimer</Link> */}
                    {/* <Link to="/terms-and-conditions/" className="text-white hover:text-gray-300 hover:no-underline">Terms and Conditions</Link> */}
                </div>
                {/* <div className="flex w-64 justify-center space-x-4">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
                        <FaFacebook size={24} />
                    </a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
                        <FaTwitter size={24} />
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
                        <FaInstagram size={24} />
                    </a>
                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
                        <FaLinkedin size={24} />
                    </a>
                </div> */}
                {/* <div className="mb-4 opacity-0 md:mb-0 w-64 flex justify-center items-center md:ml-0">
                    <img src={require('../../assets/logo.png')} alt="Video Glancer" className="h-12" />
                </div> */}
            </div>
            <div className="text-center mt-4">
                <p className="text-sm text-gray-400">&copy; 2025 | Ytglancer</p>
            </div>
        </footer>
    );
};

export default Footer;
