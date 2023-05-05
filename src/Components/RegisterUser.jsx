import React from 'react';
import CreateUser from './CreateUser';
import ExistingUser from './ExistingUser';

const RegisterUser = () => {
  const [activePage, setActivePage] = React.useState('ExistingUser');

  React.useEffect(() => {
    localStorage.removeItem('currentUser');
  }, []);

  const pages = {
    ExistingUser: <ExistingUser setActivePage={setActivePage} />,
    NewUser: <CreateUser setActivePage={setActivePage} />,
  };
  return pages[activePage];
};

export default RegisterUser;
