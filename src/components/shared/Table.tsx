import React from "react";
import { cn } from "../../utils/tailwindClassesMerge";

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table ref={ref} className={cn("w-full rounded-lg", className)} {...props} />
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={cn(
        "border-b border-tableBorderBottom !bg-tableHeader",
        className
      )}
      {...props}
    />
  );
});
TableHeader.displayName = "TableHeader";

export const TableHeaderRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => {
  return <tr ref={ref} className={cn("capitalize", className)} {...props} />;
});

TableHeaderRow.displayName = "TableHeaderRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-[36px] flex justify-start items-center px-4 font-primary text-brand-divider text-sm",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("border-b border-tableBorderBottom", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "text-brand-divider font-primary md:text-sm text-xs py-3 flex justify-start break-all items-start h-full text-left px-4",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";
