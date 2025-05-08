import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { CBadge } from '@coreui/react'
import authService from 'src/services/auth.service'

export const AppSidebarNav = ({ items }) => {
  const location = useLocation()
  const [userRoles, setUserRoles] = useState([])
  const [loading, setLoading] = useState(true) // Añadido para manejar el estado de carga

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const { data } = await authService.getCurrentUser()
        setUserRoles([data.body.rol]) // Asegúrate de que 'rol' es un array, si es un string, ajústalo
        setLoading(false) // Marca como cargado una vez se obtienen los roles
      } catch (error) {
        console.error('Error fetching roles:', error)
        setLoading(false) // Asegúrate de marcarlo como cargado aunque haya un error
      }
    }
    fetchUserRoles()
  }, [])

  const hasAccess = (roles) => {
    if (!roles || roles.length === 0) return true // Acceso libre si no hay roles definidos en el meta
    return roles.some((role) => userRoles.includes(role)) // Verifica si alguno de los roles está en los roles del usuario
  }

  const navLink = (name, icon, badge) => (
    <>
      {icon && icon}
      {name && name}
      {badge && (
        <CBadge color={badge.color} className="ms-auto">
          {badge.text}
        </CBadge>
      )}
    </>
  )

  const navItem = (item, index) => {
    const { component, name, badge, icon, meta, ...rest } = item
    const Component = component

    if (!hasAccess(meta?.role || [])) return null // Verifica el acceso antes de renderizar

    return (
      <Component
        {...(rest.to && !rest.items && { component: NavLink })}
        key={index}
        {...rest}
      >
        {navLink(name, icon, badge)}
      </Component>
    )
  }

  const navGroup = (item, index) => {
    const { component, name, icon,meta, to, ...rest } = item
    const Component = component

    if (!hasAccess(meta?.role || [])) return null // Verifica el acceso antes de renderizar

    return (
      <Component
        idx={String(index)}
        key={index}
        toggler={navLink(name, icon)}
        visible={location.pathname.startsWith(to)}
        {...rest}
      >
        {item.items?.map((child, childIndex) =>
          child.items ? navGroup(child, childIndex) : navItem(child, childIndex),
        )}
      </Component>
    )
  }

  if (loading) {
    return <div>Loading...</div> // Indicador de carga mientras se obtienen los roles
  }

  console.log(items)
  return (
    <>
      {items &&
        items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
