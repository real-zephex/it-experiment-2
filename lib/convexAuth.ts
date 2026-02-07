import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function getConvexUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await fetchQuery(api.functions.queries.getUserByClerkId, {
    clerk_user_id: userId,
  });

  return user;
}
