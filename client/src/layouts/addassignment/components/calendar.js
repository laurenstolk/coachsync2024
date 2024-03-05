import * as React from "react";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import PropTypes from "prop-types"; // Import PropTypes

// export default function DateCalendarValue() {
//     const [value, setValue] = React.useState(dayjs());

//     return (
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <DemoContainer components={['DateCalendar']}>
//                 <DemoItem>
//                     <DateCalendar value={value} onChange={(newValue) => setValue(newValue)} />
//                 </DemoItem>
//             </DemoContainer>
//         </LocalizationProvider>
//     );
// }

export default function DateCalendarValue({ value, onChange }) {
  DateCalendarValue.propTypes = {
    value: PropTypes.object.isRequired, // Assuming value is a Date object, adjust as needed
    onChange: PropTypes.func.isRequired,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DateCalendar"]}>
        <DemoItem>
          <DateCalendar value={value} onChange={onChange} />
        </DemoItem>
      </DemoContainer>
    </LocalizationProvider>
  );
}
