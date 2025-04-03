import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie");

  // Get all search parameters
  const searchParams = req.nextUrl.searchParams;
  const breeds = searchParams.getAll("breeds");
  const minAge = searchParams.get("minAge");
  const maxAge = searchParams.get("maxAge");
  const sort = searchParams.get("sort");
  const zips = searchParams.getAll("zipCodes");

  // Build query parameters for external API
  const queryParams = new URLSearchParams();

  if (minAge) queryParams.append("ageMin", minAge);
  if (maxAge) queryParams.append("ageMax", maxAge);
  if (sort) queryParams.append("sort", sort);

  // Add all breeds to the query
  if (breeds && breeds.length > 0) {
    breeds.forEach((breed) => {
      queryParams.append("breeds", breed);
    });
  }

  if (zips && zips.length > 0) {
    zips.forEach((zip) => {
      queryParams.append("zipCodes", zip);
    });
  }

  if (!cookie) {
    return redirect("/login");
  }

  try {
    // Make the request to the external API
    const response = await fetch(
      `${process.env.BASE_URL}/dogs/search?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          cookie,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch dogs" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch dogs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the array of IDs from the request body
    const dogIds = await req.json();

    const cookie = req.headers.get("cookie");

    if (!cookie) {
      return redirect("/login");
    }

    // Validate that we received an array
    if (!Array.isArray(dogIds)) {
      return NextResponse.json(
        { error: "Invalid request body: expected an array of dog IDs" },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const response = await fetch(`${process.env.BASE_URL}/dogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify(dogIds), // Send the array directly as the body
      credentials: "include", // Forward cookies for auth
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch dogs by IDs" },
        { status: response.status }
      );
    }

    // Return the data from the external API
    const dogs = await response.json();
    return NextResponse.json(dogs);
  } catch (error) {
    console.error("Error fetching dogs by IDs:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
