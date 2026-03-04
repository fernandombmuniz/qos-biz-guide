import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AppBackground from './AppBackground';

const AppLayout = () => {
    return (
        <div className="relative min-h-screen">
            <AppBackground />
            <Navbar />
            <main className="pt-20 pb-12">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
