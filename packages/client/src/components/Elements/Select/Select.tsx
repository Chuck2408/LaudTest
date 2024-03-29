import React, { ReactNode, Fragment } from "react";
import { ElementType } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

export interface SelectProps {
  value: any;
  options: {
    title?: string;
    value: string | number;
    disabled?: boolean;
    subtitle?: string;
  }[];
  id: string;
  name?: string;
  autoWidth?: boolean;
  children?: React.ReactNode;
  customButtonClass?: Object;
  defaultOpen?: boolean;
  defaultValue?: any;
  displayEmpty?: boolean;
  arrowIcon?: ElementType;
  input?: React.ReactElement;
  inputProps?: object;
  subtitle?: string;
  label?: string | ReactNode;
  labelId?: string;
  labelShrink?: boolean;
  MenuProps?: object;
  multipleSelections?: boolean;
  placeholder?: string;
  // native?: boolean,
  isOpen?: boolean;
  sx?: object;
  variant?: "filled" | "outlined" | "standard";
  // SelectDisplayProps?: boolean,
  // renderValue?: ReactNode,
  onChange: (v: any) => void;
  onClose?: (e: object) => void;
  onOpen?: (e: object) => void;
  renderValue?: (value: any) => React.ReactNode;
  disabled?: boolean;
  tick?: boolean;
}

const Select = (props: SelectProps) => {
  const {
    value,
    children,
    options,
    autoWidth,
    customButtonClass,
    defaultOpen,
    defaultValue,
    displayEmpty,
    arrowIcon = ChevronUpDownIcon,
    id,
    name,
    input,
    inputProps,
    label,
    labelId,
    labelShrink,
    multipleSelections,
    isOpen,
    sx,
    variant = "standard",
    placeholder,
    onChange,
    onClose,
    onOpen,
    renderValue,
    disabled,
    tick,
  } = props;
  return (
    <>
      <div className="relative">
        <Listbox
          defaultValue={defaultValue}
          disabled={disabled}
          value={value}
          onChange={onChange}
          multiple={multipleSelections}
          name={name}
        >
          <Listbox.Button
            className={`${customButtonClass} relative min-h-[30px] cursor-pointer w-full rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-cyan-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-300 sm:text-sm`}
          >
            {(renderValue && renderValue(value)) ||
              options.find((item) => item.value === value)?.title ||
              value}
            {children}
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 overflow-y-scroll max-h-[300px] rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm !z-[1000000] top-[100%]">
              {options.map((option, i) => (
                <Listbox.Option
                  key={i}
                  value={option.value}
                  className={({ active }) =>
                    `select-none py-2 px-4 ${
                      option.disabled
                        ? "cursor-default bg-slate-200"
                        : "cursor-pointer"
                    } ${active ? "bg-cyan-100 text-cyan-400" : "text-gray-900"}`
                  }
                  disabled={option.disabled || false}
                >
                  <div className="flex justify-between">
                    <div>
                      <div>{option.title || option.value}</div>
                      {option.subtitle && (
                        <div className="text-gray-400">{option.subtitle}</div>
                      )}
                    </div>
                    {tick &&
                      (value === option.value ||
                        (value[0] && value.includes(option.value))) && (
                        <span className="rounded-[50%] aspect-[1] w-[20px] h-[20px] bg-[#4FA198] text-white flex justify-center items-center">
                          ✔
                        </span>
                      )}
                  </div>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>

      {/* {label && (
        <InputLabel id={id} shrink={labelShrink}>
          {label}
        </InputLabel>
      )}
      <MuiSelect
        id={id}
        value={value}
        autoWidth={autoWidth}
        classes={customClass}
        defaultOpen={defaultOpen}
        defaultValue={defaultValue}
        displayEmpty={displayEmpty}
        IconComponent={arrowIcon}
        input={input}
        inputProps={inputProps}
        label={label}
        labelId={labelId}
        multiple={multipleSelections}
        open={isOpen}
        sx={sx}
        variant={variant}
        placeholder={placeholder}
        onChange={onChange}
        onClose={onClose}
        onOpen={onOpen}
        renderValue={renderValue}
        name={name}
      >
        {children}
      </MuiSelect> */}
    </>
  );
};

export default Select;
