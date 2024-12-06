import {
  UseFormHandleSubmit,
  SubmitHandler,
  FieldValues,
} from 'react-hook-form';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Loader2 } from 'lucide-react';

type ModalFormProps<T extends FieldValues> = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  buttonTitle?: string;
  handleSubmit: UseFormHandleSubmit<T>; // Generic type for form data
  onSubmit: SubmitHandler<T>; // Generic type for the onSubmit callback
  children: React.ReactNode;
  description?: string;
  title: string;
  isValid?: boolean;
  isPending?: boolean;
};

export default function ModalForm<T extends FieldValues>({
  isOpen,
  setIsOpen,
  buttonTitle,
  onSubmit,
  handleSubmit,
  children,
  description,
  title,
  isValid,
  isPending,
}: ModalFormProps<T>) {
  const onOpenChange = () => {
    setIsOpen(false);
  };

  const handleSave = () => {
    handleSubmit(onSubmit)();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div>{children}</div>
        <DialogFooter className='sm:justify-end'>
          <DialogClose asChild>
            <Button type='button' variant='secondary' onClick={onOpenChange}>
              Close
            </Button>
          </DialogClose>
          <Button
            type='submit'
            onClick={handleSave}
            disabled={!isValid || isPending}
          >
            {isPending && <Loader2 className='w-6 h-6' />}
            {buttonTitle ?? 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
