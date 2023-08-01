import { AsYouType, parsePhoneNumber } from "libphonenumber-js";
import { isNil, isString } from "lodash-es";
import { forwardRef, useCallback, useRef, useState } from "react";

import { NumberLike } from "../../../tools/number.js";
import FormattedInput, {
  FormattedInputParse,
  FormattedInputProps,
} from "../FormattedInput/FormattedInput.js";

// offset between uppercase ascii and regional indicator symbols
const OFFSET = 127_397;

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replaceAll(/./g, (char) =>
      String.fromCodePoint((char.codePointAt(0) as number) + OFFSET),
    );
}

const PhoneNumberInput = forwardRef<HTMLInputElement, FormattedInputProps>(
  (props, ref) => {
    const textValueRef = useRef<NumberLike>();
    const [flag, setFlag] = useState(getFlagEmoji("IN"));

    const formatFunction = useCallback((value: NumberLike) => {
      if (isNil(value)) {
        textValueRef.current = value;
        return;
      }
      value = value.toString();
      textValueRef.current = value;
      const phoneNumber = parsePhoneNumber(value, "IN");
      if (phoneNumber?.country) {
        setFlag(getFlagEmoji(phoneNumber.country));
        return new AsYouType().input(value);
      }
      return textValueRef.current.replaceAll(/[^\d+]/g, "");
    }, []);

    const parseFunction = useCallback<FormattedInputParse>((formattedValue) => {
      const textValue = textValueRef.current;
      if (isNil(textValue) || isNil(formattedValue)) return;
      return isString(formattedValue)
        ? formattedValue.replaceAll(" ", "")
        : formattedValue;
    }, []);

    return (
      <FormattedInput
        defaultValue="+91"
        format={formatFunction}
        iconBefore={flag}
        parse={parseFunction}
        ref={ref}
        {...props}
      />
    );
  },
);

export default PhoneNumberInput;
