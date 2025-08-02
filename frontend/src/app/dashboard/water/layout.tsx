import DashboardTopMenu from "@/components/ui/dashboard/DashboardTopMenu";
import { MdWaterDrop } from "react-icons/md";

export default function WaterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardTopMenu
        title="Hídrico"
        icon={MdWaterDrop}
      />
      {children}
    </>
  );
}