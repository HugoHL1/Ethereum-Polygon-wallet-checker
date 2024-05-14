import Header from "./Header";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen font-sans">
      <Header />
      <main className="container">
        {children}
      </main>
    </div>
  );
};

export default Layout;
