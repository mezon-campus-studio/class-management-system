import { NavLink, Outlet, useParams } from "react-router-dom";

export const ClassLayout = () => {
  const { classId } = useParams();

  const menuItems = [
    { path: "", label: "Sơ đồ lớp" },
    { path: "quy", label: "Quỹ lớp" },
    { path: "thidua", label: "Thi đua" },
    { path: "nghiphep", label: "Nghỉ phép" },
    { path: "hoatdong", label: "Hoạt động" },
  ];

  return (
    // Xóa min-h-screen hoặc các padding dư thừa ở đây
    <div className="flex flex-col h-full bg-white">
      {/* Thanh Menu con - Sát lên trên */}
      <div className="flex items-center border-b px-6 bg-white sticky top-0 z-20">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path === "" ? `/class/${classId}` : `/class/${classId}/${item.path}`}
            end
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-bold transition-all border-b-2 ${
                isActive
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Nội dung trang con - Chỉ padding ở đây để nội dung không dính sát lề */}
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
};