import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_ROLES = [
  { id: 'citizen', name: 'Citizen (Basavaraj)', role: 'citizen', dept: null, badge: 'Citizen' },
  { id: 'officer_kuwsdb', name: 'Er. Santosh Kulkarni', role: 'officer', dept: 'KUWSDB', badge: 'KUWS&DB Officer' },
  { id: 'officer_pwd', name: 'Er. Rajeshwari H.', role: 'officer', dept: 'PWD', badge: 'PWD Engineer' },
  { id: 'officer_tmc', name: 'Shri M. B. Patil', role: 'officer', dept: 'TMC', badge: 'TMC Chief Officer' },
  { id: 'officer_hescom', name: 'Er. Vinayaka Hegde', role: 'officer', dept: 'HESCOM', badge: 'HESCOM Officer' },
  { id: 'admin', name: 'Dr. Anand Rao', role: 'admin', dept: null, badge: 'DC / Civic Admin' }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('civicfix_user');
    return saved ? JSON.parse(saved) : DEMO_ROLES[0];
  });

  const switchRole = (roleId) => {
    const target = DEMO_ROLES.find(r => r.id === roleId) || DEMO_ROLES[0];
    setCurrentUser(target);
    localStorage.setItem('civicfix_user', JSON.stringify(target));
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchRole, DEMO_ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
