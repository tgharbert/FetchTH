import { useMemo } from "react";
import DogCard from "./DogCard";

export default function DogList({
  dogs,
  breedViewSelector,
  addToFavorites,
  setIsAlphaSort,
  isAlpha,
}: {
  dogs: Dog[];
  breedViewSelector: (e: React.MouseEvent<HTMLButtonElement>) => void;
  addToFavorites: (dogId: string) => void;
  setIsAlphaSort: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isAlpha: boolean;
}) {
  // FIX -- need to be able to reverse the order of the dogs
  // is alpha state
  // const [reverseAlpha, setReverseAlpha] = useState(false);

  const sortedDogs = useMemo(() => {
    return [...dogs].sort((a, b) =>
      a.breed.localeCompare(b.breed, "en", { sensitivity: "base" })
    );
  }, [dogs]);

  // const reorderBreeds = () => {
  //   setReverseAlpha((prev) => !prev);
  //   if (reverseAlpha) {
  //     sortedDogs.sort((a, b) =>
  //       a.breed.localeCompare(b.breed, "en", { sensitivity: "base" })
  //     );
  //   }
  //   if (!reverseAlpha) {
  //     sortedDogs.sort((a, b) =>
  //       b.breed.localeCompare(a.breed, "en", { sensitivity: "base" })
  //     );
  //   }
  // };

  return (
    <div className="w-1/2">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <button
          onClick={(e) => breedViewSelector(e)}
          className="flex items-center bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 font-medium hover:-translate-y-0.5 mr-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Breeds
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">
          Available Dogs
        </h2>
        <button onClick={setIsAlphaSort}>
          {isAlpha ? "reverse" : "normal"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {sortedDogs.map((dog: Dog) => (
          <DogCard key={dog.id} dog={dog} addToFavorites={addToFavorites} />
        ))}
      </div>
    </div>
  );
}
