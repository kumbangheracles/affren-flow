import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

export interface ModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    onCloseModal?: () => void;
}

export interface ModalContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    hideClose?: boolean;
}

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalClose = DialogPrimitive.Close;
const ModalPortal = DialogPrimitive.Portal;

const ModalOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            className,
        )}
        {...props}
    />
));
ModalOverlay.displayName = 'ModalOverlay';

const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[calc(100vw-2rem)]',
};

const ModalContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, ModalContentProps>(
    ({ className, children, size = 'md', hideClose = false, ...props }, ref) => (
        <ModalPortal>
            <ModalOverlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    'fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
                    'bg-card text-card-foreground border-border rounded-xl border shadow-lg',
                    'flex flex-col', // ← tetap ada
                    'max-h-[90vh]', // ← hapus overflow-y-auto dari sini
                    'transition-all duration-200',
                    'data-[state=open]:animate-in data-[state=closed]:animate-out',
                    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    'data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2',
                    sizeMap[size],
                    className,
                )}
                {...props}
            >
                {children}
                {!hideClose && (
                    <ModalClose
                        className={cn(
                            'absolute top-4 right-4 rounded-md p-1',
                            'text-muted-foreground hover:text-foreground hover:bg-muted',
                            'transition-all duration-150',
                            'focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_25%,transparent)] focus:outline-none',
                            'disabled:pointer-events-none',
                        )}
                    >
                        <X className="h-4 w-4 cursor-pointer" />
                        <span className="sr-only">Close</span>
                    </ModalClose>
                )}
            </DialogPrimitive.Content>
        </ModalPortal>
    ),
);
ModalContent.displayName = 'ModalContent';

const ModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('border-border flex flex-col gap-1 border-b px-6 pt-6 pb-4', className)} {...props} />
);
ModalHeader.displayName = 'ModalHeader';

const ModalTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
    ({ className, ...props }, ref) => (
        <DialogPrimitive.Title ref={ref} className={cn('text-foreground text-base leading-none font-medium', className)} {...props} />
    ),
);
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />);
ModalDescription.displayName = 'ModalDescription';

const ModalBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)} {...props} />
);
ModalBody.displayName = 'ModalBody';

const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('border-border flex flex-shrink-0 items-center justify-end gap-2 border-t px-6 py-4', className)} {...props} />
);
ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalBody, ModalClose, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger };
