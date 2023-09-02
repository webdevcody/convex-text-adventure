import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  mutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";
const openai = new OpenAI();

export const visualizeLatestEntries = internalAction({
  args: {
    adventureId: v.id("adventures"),
    entryId: v.id("entries"),
  },
  handler: async (ctx, args) => {
    const adventure = await ctx.runQuery(internal.adventure.getAdventure, {
      adventureId: args.adventureId,
    });

    if (!adventure) {
      throw new Error("Adventure not found");
    }

    const entries = await ctx.runQuery(internal.chat.getEntriesForAdventure, {
      adventureId: args.adventureId,
    });

    const previousEntriesCombined = entries
      .map((entry) => {
        return `${entry.input}\n\n${entry.response}`;
      })
      .join("\n\n");

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${previousEntriesCombined} 
          
          Using the above adventure history, please describe the current scene so that I can use the description to draw a picture.
          
          Please summerize using a single descriptive sentence.`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const response = completion.choices[0].message.content ?? "";

    const imageFetchResponse = await fetch(
      `https://api.openai.com/v1/images/generations`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt: response + " illustration, dark, fantasy",
          n: 1,
          size: "256x256",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const imageResponse = await imageFetchResponse.json();
    console.log("imageResponse", imageResponse);
    const imageUrl = imageResponse.data[0].url;
    const imageData = await fetch(imageUrl);
    const image = await imageData.blob();
    const storageId = await ctx.storage.store(image);

    await ctx.runMutation(internal.visualize.addEntryVisualization, {
      entryId: args.entryId,
      imageUrl: (await ctx.storage.getUrl(storageId)) ?? "",
    });
  },
});

export const addEntryVisualization = internalMutation({
  args: {
    entryId: v.id("entries"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.entryId, {
      imageUrl: args.imageUrl,
    });
  },
});
