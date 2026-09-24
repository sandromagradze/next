interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <header>
        Header
      </header>

      <nav aria-label="Main navigation">
        Navbar
      </nav>

      <main>{children}</main>

      <footer>
        Footer
      </footer>
    </>
  );
}