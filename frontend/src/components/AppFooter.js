import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  const date= new Date().getFullYear()
  return (
    <CFooter>
      <div>
        <a href="" target="_blank" rel="noopener noreferrer">
          Challenge
        </a>
        <span className="ms-1">&copy; {date} - Sistema Empresa</span>
      </div>
      {/* <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          CoreUI React Admin &amp; Dashboard Template
        </a>
      </div> */}
    </CFooter>
  )
}

export default React.memo(AppFooter)
