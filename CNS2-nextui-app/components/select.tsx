import {Select, SelectSection, SelectItem} from "@nextui-org/select";

export const termSelect = () => {
  const listDays = [
    {key: "day", label: "１日"},
    {key: "week", label: "１週"},
    {key: "month", label: "１か月"},
  ];

  return(
    <Select 
      variant="underlined"
      label="Select a term" 
      className="min-w-xs" 
    >
    {listDays.map((listDays) => (
      <SelectItem key={listDays.key}>
        {listDays.label}
      </SelectItem>
    ))}
  </Select>
  )
};
