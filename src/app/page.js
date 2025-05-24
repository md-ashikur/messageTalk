import InboxPage from "./inbox/page";
import ProtectedPage from "@/components/ProtectedPage/ProtectedPage";

export default function HomePage() {
   <ProtectedPage>
      <InboxPage />
    </ProtectedPage>
}