import React from 'react';
import Header from '../header/header';
import Footer from '../footer/footer';
import { Outlet } from 'react-router-dom';
import './layout.css';

const Layout = () => {
    return (
        <div className="layout">
            <Header className="layout-header" />
            <div className="layout-content">
                <Outlet />
            </div>
            <Footer className="layout-footer" />
        </div>
    );
};

export default Layout;
