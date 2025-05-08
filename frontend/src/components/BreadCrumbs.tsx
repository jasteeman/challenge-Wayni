import { Breadcrumb } from "antd";
import { Link, useLocation, useParams } from "react-router-dom";

export const Breadcrumbs = () => {
  const { id } = useParams();
  const location = useLocation();

  // Definición de los "crumbs" basados en la ruta actual
  const crumbs = [
    { path: '/Home', label: 'Home' }, 
    { path: '/entidades', label: 'Gestión de Entidades' }, 
    id ? { path: `/entidades/deudores/${id}`, label: 'Deudores' } : null,
    { path: '/users', label: 'Gestión de Usuarios' },
  ].filter(crumb => crumb !== null && location.pathname.includes(crumb.path)); // Filtra los "crumbs" por la ruta actual y no nulos

  // Convertir los crumbs en el formato esperado por `items`
  const breadcrumbItems = crumbs.map((crumb: any) => ({
    title: <Link to={crumb.path}>{crumb.label}</Link>,
  }));

  return (
    <div className="ml-5 mt-2 mb-2">
      <Breadcrumb separator=">" items={breadcrumbItems} />
    </div>
  );
};
