"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Dice from "react-dice-roll";

function Spinner() {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-20 h-20 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-white"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default function Adventure(props: {
  params: { adventureId: Id<"adventures"> };
}) {
  const handlePlayerAction = useAction(api.chat.handlePlayerAction);
  const adventureId = props.params.adventureId;
  const items = useQuery(api.inventory.getAllItems, {});
  const entries = useQuery(api.chat.getAllEntries, {
    adventureId,
  });
  const [message, setMessage] = useState("");

  const lastEntry = entries && entries[entries.length - 1];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 font-chakra">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-white rounded-xl h-[450px] mb-2 p-2 overflow-y-auto">
              {entries?.map((entry, idx) => {
                return (
                  <div
                    key={entry._id}
                    className="p-2 flex flex-col gap-8 text-xl"
                  >
                    {idx > 0 && (
                      <div className="flex flex-col gap-1">
                        You:
                        <hr />
                        {entry.input}
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      Dungeon Master:
                      <hr />
                      {entry.response}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Dice
                size={40}
                onRoll={(value) => setMessage(value.toString())}
              />
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePlayerAction({
                    message,
                    adventureId,
                  });
                  setMessage("");
                }}
              >
                <input
                  className="px-2 p-1 rounded text-white flex-grow bg-gray-700 text-xl"
                  name="user-prompt"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="rounded-md bg-gray-500 hover:bg-gray-400 px-3 py-1">
                  Submit
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div>
                {lastEntry && lastEntry.imageUrl ? (
                  <img
                    src={lastEntry.imageUrl}
                    className="h-[300px] w-full rounded-xl"
                  />
                ) : (
                  <div>
                    <Spinner /> Loading image...
                  </div>
                )}
              </div>

              <div className="flex-grow grid grid-cols-3 h-fit gap-2">
                {new Array(lastEntry?.health).fill("").map((_, idx) => {
                  return (
                    <div key={idx} className="flex justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-red-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {lastEntry?.inventory.map((itemName, idx) => {
                const item = items?.find((item) => item.itemName === itemName);

                return (
                  <div key={idx}>
                    {item && item.imageUrl ? (
                      <div className="flex flex-col text-center text-xl">
                        <img
                          className="rounded-xl border-gray-500 border"
                          src={
                            items.find((item) => item.itemName === itemName)
                              ?.imageUrl
                          }
                        />
                        {itemName}
                      </div>
                    ) : (
                      <div className="text-xl flex flex-col items-center">
                        <Spinner />
                        {itemName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
