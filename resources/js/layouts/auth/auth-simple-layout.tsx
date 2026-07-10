import { Toaster } from '@/components/ui-shadcn/sonner';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthSimpleLayout({ children }: AuthLayoutProps) {
    return (
        <div className="">
            {' '}
            <Toaster closeButton position="top-right" />
            {children}
        </div>
    );
}
