import Nav from '@/components/Nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Nav />
      <main className="ml-56 flex-1 min-h-screen bg-[#f4f3ef]">
        {children}
      </main>
    </div>
  )
}
