'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        aria-label="Accueil"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-foreground font-medium">
              {item.icon}
              <span>{item.label}</span>
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
