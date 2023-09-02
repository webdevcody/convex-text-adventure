"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Main() {
  const createAdventure = useMutation(api.adventure.createAdventure);
  const router = useRouter();
  const [selectedCharacter, setSelectedCharacter] = useState("warrior");

  return (
    <div className="flex justify-center items-center w-full h-screen font-chakra flex-col gap-8">
      <h1 className="text-4xl text-white">
        Welcome to the Text Based RPG Game
      </h1>

      <div className="grid grid-cols-3 gap-8">
        {["warrior", "wizard", "archer"].map((character) => {
          return (
            <div
              key={character}
              className="flex flex-col items-center gap-2 text-2xl"
            >
              <img
                onClick={() => setSelectedCharacter(character)}
                src={`/${character}.png`}
                className={
                  selectedCharacter === character ? "border border-white" : ""
                }
              />
              {character}
            </div>
          );
        })}
      </div>

      <button
        className="bg-gray-500 hover:bg-gray-400 px-2 py-1 rounded-md"
        onClick={async () => {
          const adventureId = await createAdventure({
            character: selectedCharacter,
          });
          router.push(`/adventures/${adventureId}`);
        }}
      >
        Start an Adventure
      </button>
    </div>
  );
}
