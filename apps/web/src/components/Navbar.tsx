import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Icon, Icons } from './Icons'

interface NavbarProps {
  transparentOnHome?: boolean
}

export default function Navbar({ transparentOnHome = true }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const isHomePage = location.pathname === '/'

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all
      ${isHomePage && transparentOnHome
        ? 'bg-transparent'
        : 'bg-white/80 backdrop-blur-xl border-b border-gray-200'
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              <Icon path={Icons.sparkles} size={16} className="text-white" />
            </div>
            <span className={`
              text-lg font-bold transition-colors duration-300
              ${isHomePage && transparentOnHome
                ? 'text-white'
                : 'text-gray-900'
              }
            `}>
              开演AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className={`
                px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                ${isHomePage && transparentOnHome
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <Icon path={Icons.user} size={16} />
              登录
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
            >
              <Icon path={Icons.sparkles} size={16} />
              注册
            </Link>
          </div>

          <button
            className={`
              md:hidden p-2 rounded-lg transition-colors
              ${isHomePage && transparentOnHome
                ? 'text-white hover:bg-white/10'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Icon path={isMenuOpen ? Icons.x : Icons.menu} size={20} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon path={Icons.user} size={18} />
              登录
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon path={Icons.sparkles} size={18} />
              注册
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
