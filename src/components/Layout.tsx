import { useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import styles from './Layout.module.css';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/merchants', label: 'Merchants' },
  {
    to: '/users',
    label: 'Users',
    children: [{ to: '/users/at-risk', label: 'At-Risk' }],
  },
  { to: '/reservations', label: 'Reservations' },
  { to: '/boxes', label: 'Boxes' },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  useEffect(() => {
    window.addEventListener('auth-failed', handleLogout);
    return () => window.removeEventListener('auth-failed', handleLogout);
  }, [handleLogout]);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>FreshToGo Admin</div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <div key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                {item.label}
              </NavLink>
              {item.children?.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${styles.subLink} ${isActive ? styles.active : ''}`
                  }
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Log out
        </button>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
