
import InboxPage from "@/components/InboxPage/InboxPage";
import ProtectedPage from "@/components/ProtectedPage/ProtectedPage";

export default function HomePage() {
  return (
    <ProtectedPage>
      <InboxPage />
    </ProtectedPage>
  );
}