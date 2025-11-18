import React, { useState, useEffect, useRef } from 'react';
import { Genre } from '../services/tmdbApi';
import { ChevronDown } from 'lucide-react';

interface GenreFilterProps {
  genres: Genre[];
  selectedGenre: number | null;
  onSelectGenre: (genreId: number | null) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ genres, selectedGenre, onSelectGenre }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedGenreName = genres.find(g => g.id === selectedGenre)?.name || 'All Genres';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (genreId: number | null) => {
    onSelectGenre(genreId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedGenreName}
          <ChevronDown className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
        >
          <div className="py-1 max-h-60 overflow-y-auto" role="none">
            <a
              href="#"
              className={`block px-4 py-2 text-sm ${selectedGenre === null ? 'bg-yellow-400/10 text-yellow-400' : 'text-gray-300 hover:bg-gray-700'}`}
              role="menuitem"
              onClick={(e) => { e.preventDefault(); handleSelect(null); }}
            >
              All Genres
            </a>
            {genres.map(genre => (
              <a
                href="#"
                key={genre.id}
                className={`block px-4 py-2 text-sm ${selectedGenre === genre.id ? 'bg-yellow-400/10 text-yellow-400' : 'text-gray-300 hover:bg-gray-700'}`}
                role="menuitem"
                onClick={(e) => { e.preventDefault(); handleSelect(genre.id); }}
              >
                {genre.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreFilter;