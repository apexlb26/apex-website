export default function AP_GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`ap-gradient-text ${className}`}>{children}</span>;
}
