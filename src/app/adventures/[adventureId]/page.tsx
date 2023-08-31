"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="grid grid-cols-2">
          <div className="flex flex-col">
            <div className="text-black bg-white rounded-xl h-[450px] mb-2 p-2 overflow-y-auto">
              {entries?.map((entry) => {
                return (
                  <div
                    key={entry._id}
                    className="flex flex-col gap-2 text-black"
                  >
                    <div>{entry.input}</div>
                    <div>{entry.response}</div>
                  </div>
                );
              })}
            </div>

            <form
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
                className="p-1 rounded text-black"
                name="user-prompt"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button>Submit</button>
            </form>
          </div>

          <div className="flex flex-col">
            <div className="flex">
              <div>
                {lastEntry && lastEntry.imageUrl ? (
                  <img src={lastEntry.imageUrl} className="h-[300px] w-full" />
                ) : (
                  <span>loading...</span>
                )}
              </div>

              <div>
                {new Array(lastEntry?.health).fill("").map((_, idx) => {
                  return (
                    <svg
                      key={idx}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 text-red-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
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
                      <div className="flex flex-col text-center">
                        <img
                          src={
                            items.find((item) => item.itemName === itemName)
                              ?.imageUrl
                          }
                        />
                        {itemName}
                      </div>
                    ) : (
                      <div>{itemName}</div>
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
