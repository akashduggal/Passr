import { createContext, useContext, useState } from 'react';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [selectedLivingCommunities, setSelectedLivingCommunities] = useState([]);
  const [distance, setDistance] = useState(5);
  const [selectedCampuses, setSelectedCampuses] = useState([]);

  const resetFilters = () => {
    setSelectedLivingCommunities([]);
    setDistance(5);
    setSelectedCampuses([]);
  };

  return (
    <FilterContext.Provider
      value={{
        selectedLivingCommunities,
        setSelectedLivingCommunities,
        distance,
        setDistance,
        selectedCampuses,
        setSelectedCampuses,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
