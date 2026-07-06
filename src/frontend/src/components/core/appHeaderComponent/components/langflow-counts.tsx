import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";

export const LangflowCounts = () => {
  const navigate = useCustomNavigate();

  const menuItems = [
    { label: "项目管理", path: "/flows" },
    { label: "本体语义", path: "/ontol-semantic" },
    { label: "本体建模", path: "/ontol-modeling" },
    { label: "沙盘推演", path: "/ontol-sandbox" },
  ];

  return (
    <div className="flex items-center gap-1">
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(item.path)}
          className="hit-area-hover rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default LangflowCounts;
