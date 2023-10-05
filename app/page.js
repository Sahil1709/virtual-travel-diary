import { Button } from 'antd'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-orange-200 text-9xl font-bold font-nano">VIRTUAL TRAVEL DIARY</h1>
      <Link href="/testAuthentication">User Authentication</Link>
      <Link href="/testDiaries">Diaries</Link>
      <Link href="/testImages">Multimedia Integration</Link>
      <Button type="primary">TEst</Button>
    </main>

  )
}
