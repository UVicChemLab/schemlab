import ProtectedNavBar from "~/components/ProtectedNavBar";

const ProtectedHomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="">
      <ProtectedNavBar />
      {children}
    </div>
  );
};

export default ProtectedHomeLayout;
