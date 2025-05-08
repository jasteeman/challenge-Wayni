import { useState, useEffect } from 'react';
import { Dropdown, Layout, Menu, MenuProps } from 'antd';
import { HomeOutlined, MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import logo from '../assets/react.svg';
import inicial from '../assets/logo.png';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Content } from 'antd/es/layout/layout';
import { Breadcrumbs } from './BreadCrumbs';
import { logout } from '../auth/AuthService';
import { useDispatch } from 'react-redux'; 
import { userLoggedOut } from '../redux/slices/authSlices';

const { Sider } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const { VITE_MODE, VITE_VERSION } = import.meta.env;

  const handleLogout = () => {
    logout();
    dispatch(userLoggedOut());
    navigate('/login');
  };

  const menuBase = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: <Link title='Home' to={'/home'}>Home</Link>
    },
    {
      key: '/entidades',
      icon: < BookOutlined/>,
      label: <Link title='Home' to={'/entidades'}>Entidades</Link>
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link title='Users' to={'/users'}>Users</Link>
    },
  ]; 

  const userMenu: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a onClick={handleLogout}>
          Logout
        </a>
      ),
    },
  ];

  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Función para manejar el cambio de tamaño de la ventana
  const handleResize = () => {
    if (window.innerWidth < 768) {
      setCollapsed(true); // Colapsar si la pantalla es pequeña
    } else {
      setCollapsed(false); // Expandir si la pantalla es grande
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Verificar el tamaño inicial

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Layout>
      <Sider
        trigger={<div className="bg-white text-black border-r-2">{collapsed ? <MenuUnfoldOutlined className='text-2xl' /> : <MenuFoldOutlined className='text-2xl' />}</div>}
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapse}
        className="bg-white text-black h-screen border-r-2 w-1/12"
      >
        <div className="flex items-center justify-center h-16">
          {collapsed ? (
            <div className='flex flex-col items-center'>
              <img alt="Logo" src={inicial} className="h-7" />
              <span className='text-gray-300 text-xs self-end'>{`${VITE_MODE} - ${VITE_VERSION}`}</span>
            </div>
          ) : (
            <div className='flex flex-col items-center'>
              <img alt="Logo"  src={logo} className="h-15 w-auto" />
              <span className='text-gray-300 text-xs self-end'>{`${VITE_MODE} - ${VITE_VERSION}`}</span>
            </div>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuBase}
        />
        <Dropdown menu={{ items: userMenu }}>
          <div className="absolute bottom-0 w-full flex items-center justify-center h-16 mb-10 cursor-pointer">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center text-white">
                <UserOutlined />
              </div>
            </div>
          </div>
        </Dropdown>
      </Sider>

      <Layout>
        <Breadcrumbs />
        <Content className='mt-1 ml-5 mr-5 mb-5'>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
