"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function Main() {
  const createAdventure = useMutation(api.adventure.createAdventure);
  const router = useRouter();

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <button
        onClick={async () => {
          const adventureId = await createAdventure();
          router.push(`/adventures/${adventureId}`);
        }}
      >
        Start an Adventure
      </button>
    </div>
  );
}
