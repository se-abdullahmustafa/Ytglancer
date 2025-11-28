import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from '../pages/home';
import About from '../pages/about';
import PrivacyPolicy from '../pages/privacyPolicy';
import Contact from '../pages/contact';
import Layout from '../components/layout/layout';
import TermsAndConditions from '../pages/termsAndConditions';
import Disclaimer from '../pages/disclaimer';
import NotFound from '../pages/notFound';

const AppRoute = () => {
    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="about/" element={<About />} />
                    <Route path="privacy-policy/" element={<PrivacyPolicy />} />
                    <Route path="contact/" element={<Contact />} />
                    <Route path="terms-and-conditions/" element={<TermsAndConditions />} />
                    <Route path="disclaimer/" element={<Disclaimer />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRoute;
