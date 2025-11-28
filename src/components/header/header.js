import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

const NavBarLinks = [
    { key: 'home', path: '/', label: 'Home' },
    { key: 'about', path: '/about/', label: 'About Us' },
    { key: 'privacy-policy', path: '/privacy-policy/', label: 'Privacy Policy' },
    { key: 'contact', path: '/contact/', label: 'Contact Us' },
];

const NavbarLink = ({ item }) => (
    <Link to={item.path} className="text-stone-700 text-center hover:text-gray-300 hover:no-underline mx-2">
        {item.label}
    </Link>
);

const Header = () => {
    return (
        <div className="shadow-sm p-6 items-center px-4 bg-white flex flex-col md:flex-row justify-center">
            <div className="flex items-center space-x-4">
                <span className="text-xl text-stone-700">Videoglancer</span>
            </div>
            {/* <div className="flex md:items-center md:justify-center flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-2 md:mt-0">
                {NavBarLinks.map(item => (
                    <NavbarLink key={item.key} item={item} />
                ))}
            </div> */}
        </div>
    );
};

export default Header;
