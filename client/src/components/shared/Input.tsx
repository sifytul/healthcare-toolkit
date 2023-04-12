import React, { ChangeEvent, useState } from "react";
import { BsEyeFill, BsEyeSlashFill } from "../../assets/icons/react-icons";

type Props = {
  passwordField?: boolean;
  name: string;
  placeholder: string;
  Icon: React.FunctionComponent<{ className?: string }>;
  value: string;
  changeHandler: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({
  name,
  placeholder,
  Icon,
  value,
  changeHandler,
  passwordField,
}: Props) => {
  const [passwordOpen, setPasswordOpen] = useState(false);
  return (
    <div className="flex items-center space-x-2 border border-gray p-2 rounded-lg">
      {Icon && <Icon className="text-primary text-xl" />}
      <input
        className="outline-none flex-grow bg-inherit"
        name={name}
        placeholder={placeholder}
        type={passwordField? passwordOpen? "text": "password": "text"}
        value={value}
        onChange={changeHandler}
      />
      {passwordField && (
        <div
          className="text-primary text-xl"
          onClick={() => setPasswordOpen(!passwordOpen)}
        >
          {passwordOpen ? <BsEyeSlashFill /> : <BsEyeFill />}
        </div>
      )}
    </div>
  );
};

export default Input;
