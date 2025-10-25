'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building2, Loader2 } from 'lucide-react';
import { fetchAutocomplete, transformToAutocompleteItems, AutocompleteItem } from '@/lib/api';

interface HotelAutosuggestProps {
  onPick: (item: AutocompleteItem) => void;
  placeholder?: string;
  className?: string;
  searchType?: 'all' | 'cities' | 'hotels' | 'countries';
}

export default function HotelAutosuggest({ 
  onPick, 
  placeholder = "Search cities or hotels...",
  className = "",
  searchType = 'all'
}: HotelAutosuggestProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search function
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetchAutocomplete(query);
        let items = transformToAutocompleteItems(response);
        
        // Filter based on searchType
        if (searchType === 'cities') {
          items = items.filter(item => item.type === 'city');
        } else if (searchType === 'hotels') {
          items = items.filter(item => item.type === 'hotel');
        } else if (searchType === 'countries') {
          items = items.filter(item => item.type === 'country');
        }
        
        setSuggestions(items);
        setIsOpen(items.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (item: AutocompleteItem) => {
    setQuery(item.label);
    setIsOpen(false);
    setSelectedIndex(-1);
    onPick(item);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const getItemIcon = (type: 'country' | 'city' | 'hotel') => {
    switch (type) {
      case 'country': return MapPin;
      case 'city': return MapPin;
      case 'hotel': return Building2;
      default: return MapPin;
    }
  };

  const getItemBadgeColor = (type: 'country' | 'city' | 'hotel') => {
    switch (type) {
      case 'country': return 'bg-purple-100 text-purple-800';
      case 'city': return 'bg-blue-100 text-blue-800';
      case 'hotel': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-500"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <div className="h-5 w-5" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              No suggestions found
            </div>
          ) : (
            suggestions.map((item, index) => {
              const Icon = getItemIcon(item.type);
              const isSelected = index === selectedIndex;
              
              return (
                <div
                  key={`${item.type}-${item.code}`}
                  onClick={() => handleSelect(item)}
                  className={`px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center space-x-3 ${
                    isSelected 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {item.label}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getItemBadgeColor(item.type)}`}>
                        {item.type === 'country' ? 'Country' : item.type === 'city' ? 'City' : 'Hotel'}
                      </span>
                    </div>
                    {item.city && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.city}
                      </p>
                    )}
                    {item.country && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.country}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
