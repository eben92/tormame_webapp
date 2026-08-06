import { permanentRedirect } from "next/navigation";

/**
 * The landing page moved to `/`. This route stays so older links, bookmarks and
 * anything already indexed keep working, and hands its ranking over with a 308.
 */
export default function LobbyPage() {
  permanentRedirect("/");
}
