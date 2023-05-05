import { addDoc, collection } from 'firebase/firestore';
import React from 'react';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const CreateUser = ({ setActivePage }) => {
  const [currentRole, setCurrentRole] = React.useState(null);
  const formRef = React.useRef(null);
  const usersCollectionRef = collection(db, 'users');

  const createUser = async (e) => {
    e.preventDefault();
    let role = e.target[0].value;
    let userName = e.target[1].value;
    let vehicleNo = e.target[2].value;
    const userData = {
      role,
      userName,
      ...(currentRole === 'Driver' && { vehicleNo }),
    };
    await addDoc(usersCollectionRef, userData);

    formRef.current.reset();
  };

  return (
    <div className='h-screen bg-gray-100 flex justify-center items-center'>
      <div className='w-full max-w-xs'>
        <form ref={formRef} onSubmit={createUser} className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='role'>
              Role
            </label>
            <select
              required
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='role'
              placeholder='role'
              onChange={(e) => setCurrentRole(e.target.value)}
            >
              <option value={''}>Select role...</option>
              <option>Driver</option>
              <option>House keeper</option>
            </select>
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='username'>
              Username
            </label>
            <input
              required
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='username'
              type='text'
              placeholder='Username'
            />
          </div>
          {currentRole === 'Driver' && (
            <div className='mb-4'>
              <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='vehicleNo'>
                Vehicle no
              </label>
              <input
                required
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='vehicleNo'
                type='text'
                placeholder='Vehicle no'
              />
            </div>
          )}
          <div className='flex items-center justify-between'>
            <button
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
              type='submit'
            >
              Submit
            </button>
          </div>
          <div className='flex justify-between mt-4'>
            <p
              onClick={() => setActivePage('ExistingUser')}
              className='inline-block align-baseline cursor-pointer font-bold text-sm text-blue-500 hover:text-blue-800'
            >
              Select Existing User
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

export default CreateUser;
