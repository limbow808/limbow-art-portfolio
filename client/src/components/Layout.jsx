import Nav from './Nav'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import ScrollProgress from './ScrollProgress'

export default function Layout({ children }) {
  return (
    <>
      <ScrollProgress />
      <div className="page-wrapper">
        <CustomCursor />
        <Nav />
        <main className="page-content">
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}
