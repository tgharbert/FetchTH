"use client";

import React, { useEffect, useState, useCallback } from "react";
import BreedList from "../components/breeds/BreedList";
import { useRouter } from "next/navigation";
import DogList from "../components/dogs/DogList";
import Searchbar from "../components/searchbar/Searchbar";
import SelectMinMaxAge from "../components/selectage/SelectMinMaxAge";

export default function Dogs() {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [minAge, setMinAge] = useState<number>(0);
  const [maxAge, setMaxAge] = useState<number>(25);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<string>("breeds");
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);

  const router = useRouter();

  const breedViewSelector = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setDogs([]);
    setSelectedBreed(null);
    setLoading(false);
    setView("breeds");
  };

  const addBreed = (e: React.MouseEvent<HTMLButtonElement>, breed: string) => {
    e.preventDefault();
    setLoading(true);
    setSelectedBreeds((prev) => [...prev, breed]);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedBreed) {
      setLoading(true);
      const fetchDogs = async () => {
        try {
          const res = await fetch(`/api/dogs/${selectedBreed}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          if (res.status === 401) {
            setLoading(false);
            router.push("/login");
          }
          if (!res.ok) {
            setLoading(false);
            setError("Failed to fetch dogs");
            throw new Error("Network response was not ok");
          }
          // const data = await res.json();
          // send data.resultIds to post route for fetching dog
          setLoading(false);
        } catch (error) {
          console.error(error);
        }
      };
      fetchDogs();
    }
  }, [selectedBreed, router]);

  // // FIX -- THIS FUNCTION IS A MESS -- WILL BE THE MAIN SUBMIT SEARCH FUNC -- FIX LATER
  // const handleBreedClick = async (
  //   e: React.MouseEvent<HTMLButtonElement>,
  //   breed: string
  // ) => {
  //   e.preventDefault(); // Prevent default behavior if needed
  //   setSelectedBreed(breed);
  //   setView("dogs");
  //   try {
  //     const res = await fetch(`/api/dogs/${breed}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //     });
  //     if (res.status === 401) {
  //       router.push("/login");
  //     }
  //     if (!res.ok) {
  //       setError("Failed to fetch dogs");
  //       throw new Error("Network response was not ok");
  //     }
  //     const data = await res.json();

  //     const response = await fetch(`/api/dogs/${breed}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data.resultIds),
  //       credentials: "include",
  //     });

  //     if (response.status === 401) {
  //       router.push("/login");
  //       return;
  //     }
  //     if (!response.ok) {
  //       setError("Failed to fetch dogs by IDs");
  //       throw new Error("Network response was not ok");
  //     }

  //     const dogsData = await response.json();
  //     setLoading(false);
  //     setView("dogs");
  //     setDogs(dogsData);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // FIX -- THIS FUNCTION IS A MESS -- WILL BE THE MAIN SUBMIT SEARCH FUNC -- FIX LATER
  const handleSubmitSearch = async (
    e: React.MouseEvent<HTMLButtonElement>,
    breed: string,
    minAge?: number,
    maxAge?: number
  ) => {
    e.preventDefault();
    setSelectedBreed(breed);
    setView("dogs");
    setLoading(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (minAge !== undefined && minAge >= 0)
        params.append("minAge", minAge.toString());
      if (maxAge !== undefined && maxAge < Infinity)
        params.append("maxAge", maxAge.toString());

      // First API call - get dog IDs
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/dogs/${breed}${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (res.status === 401) {
        setLoading(false);
        router.push("/login");
        return;
      }

      if (!res.ok) {
        setLoading(false);
        setError("Failed to fetch dogs");
        throw new Error("Network response was not ok");
      }

      const data = await res.json();

      if (!data.resultIds || data.resultIds.length === 0) {
        setLoading(false);
        setDogs([]);
        return;
      }

      // Second API call - get dog details by IDs
      const response = await fetch(`/api/dogs/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.resultIds),
        credentials: "include",
      });

      if (response.status === 401) {
        setLoading(false);
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setLoading(false);
        setError("Failed to fetch dogs by IDs");
        throw new Error("Network response was not ok");
      }

      const dogsData = await response.json();

      console.log("dogsData", dogsData);
      setDogs(dogsData);
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching dogs");
    } finally {
      setLoading(false);
    }
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
        // FIX THE ERROR MESSAGE/HANDLING LATER
        setError("Failed to fetch breeds");
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      setBreeds(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }, [router]);

  useEffect(() => {
    cachedBreeds();
    setLoading(false);
  }, [cachedBreeds]);

  // THE CONDITIONAL RENDER IS A MESS HERE!!!!! -- FIX LATER
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-black">FETCH TAKEHOME</h1>
      {/* FIX -- ABSTRACT INTO SEPARATE COMPONENT LATER */}
      {loading && (
        <div className="flex justify-center items-center">
          <p className="text-black">Loading...</p>
        </div>
      )}
      {error ? (
        // FIX -- ABSTRACT INTO SEPARATE COMPONENT LATER
        <div className="flex justify-center items-center">
          {/* FIX THIS ERROR MESSAGE/HANDLING LATER */}
          <p className="text-black">Error: {error}</p>
        </div>
      ) : view === "dogs" ? (
        <DogList dogs={dogs} breedViewSelector={breedViewSelector} />
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="w-full max-w-md mx-auto">
            <Searchbar
              breeds={breeds}
              onSelectBreed={(breed) => {
                addBreed(new MouseEvent("click") as any, breed);
              }}
            />
            <SelectMinMaxAge
              minAge={minAge}
              setMinAge={setMinAge}
              maxAge={maxAge}
              setMaxAge={setMaxAge}
            />
          </div>
          <BreedList
            selectedBreeds={selectedBreeds}
            handleBreedClick={addBreed}
          />
          <button
            onClick={(e) =>
              handleSubmitSearch(e, selectedBreeds[0], minAge, maxAge)
            }
            className="bg-orange-400 text-white"
          >
            SUBMIT SEARCH
          </button>
        </div>
      )}
    </div>
  );
}
