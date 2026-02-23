import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DotsVerticalIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { ColorPicker } from './ColorPicker';
import './Menu.css';

interface CardMenuProps {
  onEdit: () => void;
  onChangeColor: (color: string) => void;
  onDelete: () => void;
  currentColor: string;
}

export function CardMenu({ onEdit, onChangeColor, onDelete, currentColor }: CardMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="menu-trigger card-menu-trigger"
          aria-label="Card options"
          onClick={(e) => e.stopPropagation()}
        >
          <DotsVerticalIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu-content" sideOffset={5}>
          <DropdownMenu.Item className="menu-item" onSelect={onEdit}>
            <Pencil1Icon />
            <span>Edit</span>
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
