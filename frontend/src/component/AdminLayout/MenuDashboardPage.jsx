import { useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import MenuDashboard from "./MenuDashboard";
import { findMenuById } from "./adminMenuTree";

const MenuDashboardPage = () => {
  const params = useParams();
  const menuId = String(params.menuId || "workspace").trim().toLowerCase();
  const menuNode = findMenuById(menuId);
  const title = menuNode ? `${menuNode.label} Dashboard` : "Menu Dashboard";

  return (
    <AdminLayout
      title={title}
      subtitle="Menu-specific dashboard cards and configuration."
    >
      <MenuDashboard menuId={menuId} />
    </AdminLayout>
  );
};

export default MenuDashboardPage;
