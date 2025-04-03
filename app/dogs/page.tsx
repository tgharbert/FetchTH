"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DogList from "../components/dogs/DogList";
import Header from "../components/header/Header";
import SearchDogsForm from "../components/searchdogsform/SearchDogsForm";
import useDogSearch from "../lib/hooks/useDogSearch";
import Loading from "../components/loading/Loading";

export default function Dogs() {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [minAge, setMinAge] = useState<number>(0);
  const [maxAge, setMaxAge] = useState<number>(25);
  const [view, setView] = useState<string>("breeds");
  const [zip, setZip] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(25);
  const [favorites, setFavorites] = useState<string[]>([]);

  // FIX -- REMOVE THIS LOG
  console.log("favorites: ", favorites);

  // custom hook to fetch dogs
  const { dogs, loading, error, searchDogs } = useDogSearch();

  const handleSubmitSearch = (
    e: React.MouseEvent<HTMLButtonElement>,
    breeds: string[],
    zipCode: string | null,
    radius: number,
    minAge: number,
    maxAge: number
  ) => {
    setView("dogs");
    searchDogs(e, selectedBreeds, zip, radius, minAge, maxAge);
  };

  const setUserRadius = (
    e: React.ChangeEvent<HTMLSelectElement>,
    radius: number
  ) => {
    e.preventDefault();
    setRadius(radius);
  };

  // a function for a user to set the zip code
  const setUserZip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const zipCodeValue = e.target.value;

    if (!zipCodeValue) {
      setZip(null);
      return;
    }

    // Verify the zip code is valid
    const isValidZip = /^\d{5}(-\d{4})?$/.test(zipCodeValue);

    if (isValidZip) {
      setZip(zipCodeValue);
    }
  };

  const addToFavorites = (dogId: string) => {
    setFavorites((prev) => {
      if (prev.includes(dogId)) {
        return prev;
      }
      return [...prev, dogId];
    });
  };

  const router = useRouter();

  const breedViewSelector = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setView("breeds");
  };

  const addBreed = (e: React.MouseEvent<HTMLButtonElement>, breed: string) => {
    e.preventDefault();
    setSelectedBreeds((prev) => {
      if (prev.includes(breed)) {
        return prev;
      }
      return [...prev, breed];
    });
  };

  const removeBreed = (
    e: React.MouseEvent<HTMLButtonElement>,
    breed: string
  ) => {
    e.preventDefault();
    setSelectedBreeds((prev) => prev.filter((b) => b !== breed));
  };

  const cachedBreeds = useCallback(async () => {
    try {
      const res = await fetch(`/api/breeds`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (res.status === 401) {
        router.push("/login");
      }
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      setBreeds(data);
    } catch (error) {
      console.error(error);
    }
  }, [router]);

  useEffect(() => {
    cachedBreeds();
  }, [cachedBreeds]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Header />
      {error && (
        <div className="flex flex-col items-center justify-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      )}
      <main className="w-full max-w-6xl flex flex-col items-center justify-center gap-8">
        {/* FIX -- ABSTRACT INTO SEPARATE COMPONENT LATER */}
        {loading ? (
          <Loading />
        ) : view === "dogs" ? (
          <DogList
            dogs={dogs}
            breedViewSelector={breedViewSelector}
            addToFavorites={addToFavorites}
          />
        ) : (
          <SearchDogsForm
            breeds={breeds}
            setUserZip={setUserZip}
            setUserRadius={setUserRadius}
            selectedBreeds={selectedBreeds}
            addBreed={addBreed}
            zip={zip}
            radius={radius}
            removeBreed={removeBreed}
            minAge={minAge}
            setMinAge={setMinAge}
            maxAge={maxAge}
            setMaxAge={setMaxAge}
            handleSubmitSearch={handleSubmitSearch}
          />
        )}
      </main>
    </div>
  );
}
