import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DotsVerticalIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { ColorPicker } from './ColorPicker';
import './Menu.css';

interface LaneMenuProps {
  onRename: () => void;
  onChangeColor: (color: string) => void;
  onDelete: () => void;
  currentColor: string;
}

export function LaneMenu({ onRename, onChangeColor, onDelete, currentColor }: LaneMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="menu-trigger" aria-label="Lane options">
          <DotsVerticalIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu-content" sideOffset={5}>
          <DropdownMenu.Item className="menu-item" onSelect={onRename}>
            <Pencil1Icon />
            <span>Rename</span>
          </DropdownMenu.Item>

          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="menu-item">
              <div className="color-indicator" style={{ backgroundColor: currentColor }} />
              <span>Change Color</span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className="menu-content" sideOffset={8}>
                <ColorPicker currentColor={currentColor} onColorSelect={onChangeColor} />
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator className="menu-separator" />

          <DropdownMenu.Item className="menu-item danger" onSelect={onDelete}>
            <TrashIcon />
            <span>Delete</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
