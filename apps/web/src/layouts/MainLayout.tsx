import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

interface MainLayoutProps {
  transparentNavbarOnHome?: boolean
}

export function MainLayout({ transparentNavbarOnHome = true }: MainLayoutProps) {
  return (
    <div>
      <Navbar transparentOnHome={transparentNavbarOnHome} />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
