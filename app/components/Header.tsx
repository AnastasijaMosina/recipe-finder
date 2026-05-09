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
        <nav className="recipe-nav" aria-label="Primary navigation">
          <Link
            href="/"
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            🏠 Home
          </Link>
          <Link
            href="/search"
            className={`nav-link ${pathname === '/search' ? 'active' : ''}`}
            aria-current={pathname === '/search' ? 'page' : undefined}
          >
            🔍 Search
          </Link>
          <Link
            href="/favorites"
            className={`nav-link ${pathname === '/favorites' ? 'active' : ''}`}
            aria-current={pathname === '/favorites' ? 'page' : undefined}
            aria-label={
              favorites.length > 0
                ? `Favorites, ${favorites.length} saved ${favorites.length === 1 ? 'recipe' : 'recipes'}`
                : 'Favorites'
            }
          >
            ⭐ Favorites {favorites.length > 0 && `(${favorites.length})`}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
