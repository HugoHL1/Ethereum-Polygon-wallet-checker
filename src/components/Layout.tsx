import Header from "./Header";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen font-sans bg-cover bg-center" style={{ backgroundImage: `url('/images/bg-image.svg')` }}>
      <Header />
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
