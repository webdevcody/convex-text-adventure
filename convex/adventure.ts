import { v } from "convex/values";
import { internalAction, internalQuery, mutation } from "./_generated/server";
import OpenAI from "openai";
import { api, internal } from "./_generated/api";

const openai = new OpenAI();

export const createAdventure = mutation({
  args: {
    character: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("adventures", {
      characterClass: args.character,
    });

    await ctx.scheduler.runAfter(0, internal.adventure.setupAdventureEntries, {
      adventureId: id,
    });

    return id;
  },
});

export const getAdventure = internalQuery({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.adventureId);
  },
});

export const setupAdventureEntries = internalAction({
  args: {
    adventureId: v.id("adventures"),
  },
  handler: async (ctx, args) => {
    const adventure = await ctx.runQuery(internal.adventure.getAdventure, args);

    if (!adventure) {
      throw new Error("Adventure not found");
    }

    const input = `
    You are a dungeon master who is going to run a text based adventure RPG for me.
    You will need to setup an adventure for me which will involve having
    me fight random enemy encounters, reward me with loot after killing enemies,
    give me goals and quests, and finally let me know when I finish the overall adventure.

    When I am fighting enemies, please ask me to roll 6 sided dices, with a 1 being the worst outcome
    of the scenario, and a 6 being the best outcome of the scenario.  Do not roll the dice for me,
    I as the player should input this and you need to describe the outcome with my input.

    During this entire time, please track my health points which will start at 10, 
    my character class which is a ${adventure.characterClass}, and my inventory which will start with 
    - a broad sword that deals a base damage of 1
    - a bronze helmet
    - an a health potion which heals for 3 hp

    the adventure should have some of the following
    - the hero must clear out a dungeon from undead enemies
    - the dungeon has 3 levels
    - each level has 1 set of enemies to fight
    - the final level has a boss
    - the final level has a chest filled with one steel sword which deals base damage of 2

    Given this scenario, please ask the player for their initial actions.

    PLEASE MAKE SURE TO NEVER ROLL FOR THE PLAYER.  YOU SHOULD ALWAYS ASK THE PLAYER FOR HIS NEXT STEPS.
  `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    // const input = args.message;
    const response = completion.choices[0].message.content ?? "";
    await ctx.runMutation(api.chat.insertEntry, {
      input,
      response,
      adventureId: args.adventureId,
    });
  },
});
