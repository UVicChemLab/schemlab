import NavBar from "~/components/NavBar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <NavBar />
      {children}
    </div>
  );
};

export default HomeLayout;
