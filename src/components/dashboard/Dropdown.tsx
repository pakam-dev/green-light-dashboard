import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface dropDownItemProp {
  name: string;
  handleClick: () => void;
  style?: string;
}
interface DropdownProps {
  trigger: React.ReactNode;
  items: dropDownItemProp[];
}

const Dropdown = ({ trigger, items }: DropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent
        className="border border-ui-border shadow w-[120px] bg-white rounded-2xl"
        align="start"
      >
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            className={`text-[12px] text-primary-gray leading-[150%] font-[400] cursor-pointer ${item.style}`}
            onClick={item.handleClick}
          >
            {item.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
