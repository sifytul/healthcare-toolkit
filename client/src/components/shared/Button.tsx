const Button = ({
  type = "button",
  Icon,
  text,
  varientColor,
  size,
}: {
  type?: "button" | "submit" | "reset";
  Icon?: React.FunctionComponent<{ className?: string }>;
  text: string;
  varientColor: string;
  size?: string;
}) => {
  return (
    <button
      className={`border ${Icon && "flex items-center gap-2"} ${
        varientColor == "primary"
          ? "border-[var(--clr-primary)] text-primary"
          : varientColor == "delete"
          ? "border-red-500 text-red-500"
          : ""
      } ${
        size == "sm" ? "text-sm" : size == "lg" ? "text-lg" : ""
      } rounded-lg font-semibold lg:px-3 lg:py-2 p-1`}
      type={type}
    >
      {Icon && <Icon />}
      {text}
    </button>
  );
};

export default Button;
