import { ReactNode } from 'react';

type PageLayoutProps = {
  title: string;
  children: ReactNode;
};

export default function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      {children}
    </div>
  );
}
