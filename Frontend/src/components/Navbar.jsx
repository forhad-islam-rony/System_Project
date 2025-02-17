import {useEffect, useRef, useContext} from 'react';
import logo from '../assets/images/logo.png';
import userImg from '../assets/images/avatar-icon.png';
import { Link, NavLink } from 'react-router-dom';
import { BiMenu } from 'react-icons/bi';
import { AuthContext } from '../context/AuthContext';
import '../styles/header.css';

const navLinks = [
  {
    path: '/',
    display: 'Home',
  },
  {
    path: '/community',
    display: 'Community',
  },
  {
    path: '/doctors',
    display: 'Find a Doctor',
  },
  {
    path: '/about',
    display: 'Services',
  },
  {
    path: '/contact',
    display: 'Contact',
  },
  {
    path: '/pharmacy',
    display: 'Pharmacy',
  },
];

const Navbar = () => {

  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const {user, role, token } = useContext(AuthContext);

  const handleStickyHeader = () => {
    const handleScroll = () => {
      if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        headerRef.current.classList.add('sticky_header')
      } else {
        headerRef.current.classList.remove('sticky_header')
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  };

  useEffect(() => {
    const cleanup = handleStickyHeader();
    return cleanup;
  }, []);

  const toggleMenu = () => menuRef.current.classList.toggle('show__menu');

  const getProfilePath = () => {
    const userRole = localStorage.getItem('role');
    return userRole === 'doctor' ? '/doctors/profile/me' : '/users/profile/me';
  };

  return (
    <header className="header flex items-center" ref={headerRef}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/* logo */}
        <div>
        <img src={logo} alt="Logo" />
        </div>
           {/* Menu */}
           <div className="navigation" ref={menuRef} onClick={toggleMenu}>
          <ul className="menu flex items-center gap-[2.7rem]">
            {navLinks.map((link, index) => (
              <li key={index}>
                <NavLink
                  to={link.path}
                  className={(navClass) =>
                    navClass.isActive
                      ? "text-primaryColor text-[16px] leading-7 font-[600]"
                      : "text-textColor text-[16px] leading-9 font-[500] hover:text-primaryColor"
                  }
                >
                  {link.display}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* nav right */}

        <div className="flex items-center gap-4">
          {token && user ? (
            <div>
              <Link to={getProfilePath()}>
                <figure className='w-[35px] h-[35px] rounded-full cursor-pointer'>
                  <img 
                    src={user?.photo || userImg} 
                    className="w-full rounded-full" 
                    alt="user profile" 
                  />
                </figure>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to='/register'>
                <button className="bg-transparent text-primaryColor border border-primaryColor py-2 px-6 font-[600] h-[44px] flex items-center justify-center rounded-[50px] hover:bg-primaryColor hover:text-white transition duration-300">
                  Sign Up
                </button>
              </Link>
              <Link to='/login'>
                <button className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center justify-center rounded-[50px] hover:bg-primaryColor/90 transition duration-300">
                  Login
                </button>
              </Link>
            </div>
          )}

          <span className='md:hidden' onClick={toggleMenu}>
            <BiMenu className="w-6 h-6 cursor-pointer" />
          </span>
        </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;