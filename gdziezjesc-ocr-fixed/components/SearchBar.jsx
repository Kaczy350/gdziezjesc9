
import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [dish, setDish] = useState("");
  const [city, setCity] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(dish, city);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <input
        type="text"
        placeholder="np. pizza hawajska"
        value={dish}
        onChange={(e) => setDish(e.target.value)}
        onKeyDown={handleKeyDown}
        className="p-2 border rounded w-full"
      />
      <input
        type="text"
        placeholder="np. Opole"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyDown}
        className="p-2 border rounded w-full"
      />
      <button
        onClick={() => onSearch(dish, city)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Szukaj
      </button>
    </div>
  );
}
