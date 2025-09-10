import { api } from "@/trpc/server";
import Header from "components/header";

export default async function Home() {
  void api.post.getLatest.prefetch();

  return <Header>Home</Header>;
}
