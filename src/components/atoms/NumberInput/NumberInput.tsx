import { isNil, isObject } from "lodash-es";
import { forwardRef, useCallback, useRef } from "react";

import {
  FormatNumberOptions,
  NumberLike,
  formatNumber,
  stringToNumber,
} from "../../../tools/number.js";
import {
  FormattedInputParse,
  FormattedInputProps,
} from "../FormattedInput/FormattedInput.js";
import { FormattedInput } from "../FormattedInput/index.js";

export interface NumberInputProps
  extends Omit<FormattedInputProps, "format" | "parse" | "value"> {
  format?: FormatNumberOptions | boolean;
  parse?: boolean;
  value?: number | string;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ format, parse, value, ...props }, ref) => {
    const textValueRef = useRef<NumberLike>();

    const formatFunction = useCallback(
      (value: NumberLike) => {
        if (!format || isNil(value)) {
          textValueRef.current = value;
          return;
        }
        value = value.toString();
        textValueRef.current = value;
        if (value.endsWith(".") || value === "-") {
          return value;
        }
        const nullValue = value ? "0" : "";
        const formatOptions = isObject(format) ? format : {};
        const formattedValue = formatNumber(value, {
          minimumFractionDigits: 0,
          nullValue,
          ...formatOptions,
        });
        if (formattedValue === undefined) return "";
        if (
          value.split(".")[1]?.length > formattedValue.split(".")[1]?.length
        ) {
          const newSplits = value.split(".");
          textValueRef.current = `${newSplits[0]}.${
            formattedValue.split(".")[1]
          }`;
        }
        return formattedValue;
      },
      [format],
    );

    const parseFunction = useCallback<FormattedInputParse>(
      (formattedValue, emptyValue) => {
        const textValue = textValueRef.current;
        if (isNil(textValue)) return emptyValue;
        const unformattedValue = format
          ? stringToNumber(formattedValue as number | string, emptyValue)
          : textValue;
        return parse || isNil(unformattedValue)
          ? unformattedValue
          : unformattedValue.toString();
      },
      [format, parse],
    );

    return (
      <FormattedInput
        format={format ? formatFunction : undefined}
        hiddenInputProps={{ type: "number" }}
        inputMode="decimal"
        parse={parseFunction}
        ref={ref}
        value={value?.toString()}
        {...props}
      />
    );
  },
);

export default NumberInput;
