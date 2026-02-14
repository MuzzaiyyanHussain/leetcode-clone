"use server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, error: "No Authenticated users found" }
        }
        const { id, firstName, lastName, imageUrl, emailAddresses } = user;
        const newUser = await db.user.upsert({where:{clerkId:id}, {update:{firstName:firstName||null}, lastName:lastName || null}, })
    } catch (error) {

    }
}