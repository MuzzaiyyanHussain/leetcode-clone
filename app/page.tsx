import { UserButton } from "@clerk/nextjs";
import {onBoardUser} from "@/modules/auth"

export default async function Home() {
  await onBoardUser()
  return (
    <div>
      <UserButton afterSignOutUrl="/sign-in"  />
    </div>
  );
}
