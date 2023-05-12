import { collection, getDocs } from 'firebase/firestore';
import React from 'react';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';

const ExistingUser = ({ setActivePage }) => {
  const navigate = useNavigate();
  const [users, setUsers] = React.useState([]);
  const usersCollectionRef = collection(db, 'users');

  React.useEffect(() => {
    const users = async () => {
      const data = await getDocs(usersCollectionRef);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    users();
  }, []);

  const userSelectHandler = (e) => {
    const userId = e.target.value;

    localStorage.setItem('currentUser', JSON.stringify(users.find((u) => u.id === userId)));
    navigate("/map");
  };
  return (
    <div className='h-screen bg-gray-100 flex justify-center items-center'>
      <div className='w-full max-w-xs'>
        <form className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='selectUser'>
              Select User
            </label>
            <select
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='selectUser'
              placeholder='Select user'
              onChange={userSelectHandler}
            >
              <option value={''}>Select User...</option>
              {users.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.userName}
                </option>
              ))}
            </select>
          </div>
          <div className='flex justify-between mt-4'>
            <p
              onClick={() => setActivePage('NewUser')}
              className='inline-block align-baseline cursor-pointer font-bold text-sm text-blue-500 hover:text-blue-800'
            >
              Create a new user
            </p>
            <Link
              onClick={() => localStorage.setItem('currentUser', JSON.stringify({ role: 'Admin' }))}
              className='inline-block align-baseline cursor-pointer font-bold text-sm text-blue-500 hover:text-blue-800'
              to={'/map'}
            >
              Continue as Admin
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExistingUser;
