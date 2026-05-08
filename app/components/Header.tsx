'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFavorites } from '../domain/favorites/FavoritesContext';

const Header = () => {
  const pathname = usePathname();
  const { favorites } = useFavorites();

  return (
    <header className="recipe-header">
      <div className="recipe-header-content">
        <h1 className="recipe-title">Recipe Finder</h1>
        <nav className="recipe-nav">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            🏠 Home
          </Link>
          <Link href="/search" className={`nav-link ${pathname === '/search' ? 'active' : ''}`}>
            🔍 Search
          </Link>
          <Link
            href="/favorites"
            className={`nav-link ${pathname === '/favorites' ? 'active' : ''}`}
          >
            ⭐ Favorites {favorites.length > 0 && `(${favorites.length})`}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
