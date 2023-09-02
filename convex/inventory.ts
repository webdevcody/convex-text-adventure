import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";
const openai = new OpenAI();

export const summarizeInventory = internalAction({
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
          content: `Summarize the following adventure of a text based rpg and return a json string with the following format so that I can know what inventory items i have, and also what my health points are.  
          
          // typescript type
          {
            health: number,
            inventory: string[]
          }

          here is the history of the adventure with the most recent events being at the end: 
          
          "${previousEntriesCombined}"
          
          please only give us JSON, no other output`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const response = completion.choices[0].message.content ?? "";

    const stats = JSON.parse(response);

    await ctx.runMutation(internal.inventory.storeStatsIntoEntry, {
      entryId: args.entryId,
      health: stats.health,
      inventory: stats.inventory,
    });

    await Promise.all(
      stats.inventory.map((itemName: string) => {
        return ctx.runAction(internal.inventory.generateInventoryIcon, {
          itemName,
        });
      })
    );
  },
});

export const storeStatsIntoEntry = internalMutation({
  args: {
    entryId: v.id("entries"),
    health: v.number(),
    inventory: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.entryId, {
      health: args.health,
      inventory: args.inventory,
    });
  },
});

export const generateInventoryIcon = internalAction({
  args: {
    itemName: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.runQuery(internal.inventory.getItemByName, {
      itemName: args.itemName,
    });

    if (item) return;

    const imageFetchResponse = await fetch(
      `https://api.openai.com/v1/images/generations`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt: args.itemName + ", black background",
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
    const imageUrl = imageResponse.data[0].url;
    const response = await fetch(imageUrl);
    const image = await response.blob();
    const storageId = await ctx.storage.store(image);

    await ctx.runMutation(internal.inventory.storeItemImage, {
      itemName: args.itemName,
      imageUrl: (await ctx.storage.getUrl(storageId)) ?? "",
    });
  },
});

export const getItemByName = internalQuery({
  args: {
    itemName: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("itemName"), args.itemName))
      .first();

    return item;
  },
});

export const storeItemImage = internalMutation({
  args: {
    itemName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("itemName"), args.itemName))
      .first();

    if (!item) {
      await ctx.db.insert("items", {
        itemName: args.itemName,
        imageUrl: args.imageUrl,
      });
    }
  },
});

export const getAllItems = query({
  handler: async (ctx) => {
    return await ctx.db.query("items").collect();
  },
});
