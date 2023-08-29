import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI();

export const handlePlayerAction = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: args.message }],
      model: "gpt-3.5-turbo",
    });

    const input = args.message;
    const response = completion.choices[0].message.content ?? "";

    await ctx.runMutation(api.chat.insertEntry, {
      input,
      response,
    });

    return completion;
  },
});

export const insertEntry = mutation({
  args: {
    input: v.string(),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("entries", {
      input: args.input,
      response: args.response,
    });
  },
});

export const getAllEntries = query({
  handler: async (ctx) => {
    const entries = await ctx.db.query("entries").collect();
    return entries;
  },
});
