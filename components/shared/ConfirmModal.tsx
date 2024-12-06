import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

type ConfirmModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClick: () => void;
  title?: string;
  reset?: () => void;
};

export default function ConfirmModal({
  isOpen,
  setIsOpen,
  onClick,
  title,
  reset,
  ...props
}: ConfirmModalProps) {
  const onOpenChange = () => {
    setIsOpen(false);
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          {title && <AlertDialogDescription>{title}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
