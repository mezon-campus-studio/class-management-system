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
    <div className="flex flex-col h-full bg-white font-sans">
      {/* THANH MENU CON 
          - flex-nowrap: ép nằm trên 1 hàng
          - overflow-x-auto: cho phép kéo ngang trên mobile
          - no-scrollbar: (optional) ẩn thanh cuộn để trông chuyên nghiệp hơn
      */}
      <div className="flex items-center border-b px-4 bg-white sticky top-0 z-20 flex-nowrap overflow-x-auto no-scrollbar shadow-sm">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path === "" ? `/class/${classId}` : `/class/${classId}/${item.path}`}
            // end={item.path === ""} // Nên dùng end cho path trống để tránh highlight nhầm
            className={({ isActive }) =>
              `px-5 py-4 text-[13px] md:text-sm font-bold transition-all border-b-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Nội dung trang con */}
      <div className="p-4 md:p-6 overflow-y-auto w-full">
        <Outlet />
      </div>
    </div>
  );
};