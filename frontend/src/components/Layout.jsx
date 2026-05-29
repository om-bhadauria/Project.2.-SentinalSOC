import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = ({ children, currentUser, onLogout }) => {
  return (
    <div className="min-h-screen text-textMain flex">
      <Sidebar />
      <TopNav currentUser={currentUser} onLogout={onLogout} />
      {/* Mobile-first: no left margin until md breakpoint */}
      <main className="flex-1 md:ml-72 mt-16 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-[1720px] mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
