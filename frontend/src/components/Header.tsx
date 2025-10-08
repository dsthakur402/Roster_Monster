import React from "react";
import UserMenu from "./UserMenu";

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center px-4 bg-white text-white h-[50px]">
      <h2 className="text-lg font-bold">Roster Monster</h2>

      {/* User Menu on Top Right */}
      <UserMenu />
    </header>
  );
};

export default Header;
