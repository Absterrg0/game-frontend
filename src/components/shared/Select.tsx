import Select, { GroupBase, MultiValue, SingleValue } from "react-select";

interface props {
  dropdownItems: (
    | { value: string; label: string }
    | GroupBase<{ value: string; label: string }>
  )[];
  selectedOption?:
    | { value: string; label: string }
    | null
    | { value: string; label: string }[];
  setSelectedOption: (
    e:
      | MultiValue<{ value: string; label: string }>
      | SingleValue<{ value: string; label: string }>
  ) => void;
  height?: string;
  minHeight?: string;
  width?: string;
  placeholder?: string;
  borderRadius?: string;
  backgroundColor?: string;
  menuBackgroundColor?: string;
  menuHover?: string;
  menuHeight?: string;
  isDisabled?: boolean;
  required?: boolean;
  defaultValue?: { value: string; label: string } | null;
  id: string;
  isMulti?: boolean;
  disabledBackgroundColor?: string;
  className?: string;
  noOptionsMessage?: string;
}

const CustomSelect = ({
  selectedOption,
  setSelectedOption,
  dropdownItems,
  placeholder,
  required = false,
  height = "36px",
  minHeight,
  width = "100%",
  backgroundColor = "white",
  menuBackgroundColor = "white",
  menuHeight = "200px",
  isDisabled,
  borderRadius = "8px",
  defaultValue,
  id,
  isMulti = false,
  className,
  noOptionsMessage,
}: props) => {
  return (
    <Select
      isMulti={isMulti}
      id={id}
      defaultValue={defaultValue}
      isDisabled={isDisabled}
      value={selectedOption}
      onChange={setSelectedOption}
      options={dropdownItems}
      placeholder={placeholder}
      required={required}
      components={{ IndicatorSeparator: () => null }}
      isSearchable={true}
      className={className}
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? `No match for "${inputValue}"`
          : noOptionsMessage ?? "No option"
      }
      styles={{
        valueContainer: (provided, state) => ({
          ...provided,
          height: height,
          minHeight: minHeight,
        }),
        control: (baseStyles, state) => ({
          ...baseStyles,
          border: "1px solid #C6C4D5",
          fontFamily: "Inter",
          fontWeight: 400,
          fontSize: "16px",
          "&:hover": {
            border: state.isFocused ? "1px solid #C6C4D5" : "",
          },
          boxShadow: "none",
          background: isDisabled ? backgroundColor : backgroundColor,
          width: width,
          height: height,
          minHeight: "unset",
          borderRadius: borderRadius,
          cursor: "pointer",
        }),
        menu: (base) => ({
          ...base,
          overflow: "hidden",
          border: "1px solid #C6C4D5",
          background: menuBackgroundColor,
          borderRadius: borderRadius,
          zIndex: 100,
          fontWeight: 400,
        }),
        menuList: (base) => ({
          ...base,
          padding: 0,
          maxHeight: menuHeight,
          fontWeight: 400,
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected
            ? "#F4C95D"
            : state.isFocused
            ? "#FFFFFF"
            : "transparent",
          color: state.isSelected ? "#010A04" : "#010A04",
          "&:hover": {
            cursor: "pointer",
            backgroundColor: "#F4C95D",
          },
        }),
      }}
    />
  );
};

export default CustomSelect;
