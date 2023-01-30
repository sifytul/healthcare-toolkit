import React, { ChangeEvent } from "react";
import { AiOutlineSearch } from "react-icons/ai";

const SearchField = ({
  searchedText,
  placeholder,
  changeHandler,
  SearchIconComponent,
}: {
  searchedText: string;
  placeholder: string;
  changeHandler: (e: ChangeEvent<HTMLInputElement>) => void;
  SearchIconComponent?: React.FunctionComponent<{ className: string }>;
}) => {
  return (
    <div className="flex items-center border p-2 rounded-lg md:w-2/3 mb-4">
      {SearchIconComponent ? (
        <SearchIconComponent className="text-primary text-3xl mr-2" />
      ) : (
        <AiOutlineSearch className="text-primary text-3xl mr-2" />
      )}
      <input
        className="outline-none flex-grow  p-2"
        name="search"
        type="search"
        placeholder={placeholder}
        value={searchedText}
        onChange={changeHandler}
      />
    </div>
  );
};

export default SearchField;
