import { Button } from "@repo/ui/button"
import { Header } from "@repo/ui/header"
import { Title } from "@repo/ui/title"
export default function Home() {
  return (
    <div className="">
      <Header />
      <Title text="Excalidraw ❤️" />

      <Button children={"Hi there"} size="md" variant="primary" />
    </div>
  )
}
