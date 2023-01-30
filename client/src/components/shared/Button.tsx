const Button = ({
  text,
  varientColor,
  size,
}: {
  text: string;
  varientColor: string;
  size?: string;
}) => {
  return (
    <button
      className={`border ${
        varientColor == "primary"
          ? "border-[var(--clr-primary)] text-primary"
          : varientColor == "delete"
          ? "border-red-500 text-red-500"
          : ""
      } ${
        size == "sm" ? "text-sm" : size == "lg" ? "text-lg" : ""
      } rounded-lg font-semibold lg:px-3 lg:py-2 p-1`}
    >
      {text}
    </button>
  );
};

export default Button;
