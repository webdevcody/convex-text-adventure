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
  const entries = useQuery(api.chat.getAllEntries, {
    adventureId,
  });
  const [message, setMessage] = useState("");

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
        </div>
      </div>
    </main>
  );
}
