type AtmosphericFieldProps = {
  className?: string;
};

export function AtmosphericField({ className = "" }: AtmosphericFieldProps) {
  return <div aria-hidden className={`atmosphere-grid ${className}`.trim()} />;
}