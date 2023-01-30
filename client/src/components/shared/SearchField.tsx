import React, { ChangeEvent, LegacyRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";

const SearchField = ({
  value,
  placeholder,
  changeHandler,
  SearchIconComponent,
  inputRef,
}: {
  value: string;
  placeholder: string;
  changeHandler: (e: ChangeEvent<HTMLInputElement>) => void;
  SearchIconComponent?: React.FunctionComponent<{ className: string }>;
  inputRef?: LegacyRef<HTMLInputElement>;
}) => {
  return (
    <div className="flex items-center border py-2 px-4 rounded-full bg-white md:w-2/3 mb-4 shadow-sm">
      {SearchIconComponent ? (
        <SearchIconComponent className="text-primary text-3xl mr-2" />
      ) : (
        <AiOutlineSearch className="text-primary text-3xl mr-2" />
      )}
      <input
        ref={inputRef}
        className="outline-none flex-grow p-2"
        name="search"
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={changeHandler}
      />
    </div>
  );
};

export default SearchField;
