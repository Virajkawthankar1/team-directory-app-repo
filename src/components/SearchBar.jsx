import { useRef } from "react";

export const SearchBar = ({ searchText, onSearchChange }) => {
  // A ref holds a value that survives renders but does NOT cause a re-render when changed
  const changeCount = useRef(0);

  const handleChange = (e) => {
    changeCount.current += 1;
    console.log(`Search text changed ${changeCount.current} times`);
    onSearchChange(e.target.value);
  };

  return (
    <input
      type="text"
      className="form-control my-3"
      placeholder="Search members..."
      value={searchText}
      onChange={handleChange}
    />
  );
};