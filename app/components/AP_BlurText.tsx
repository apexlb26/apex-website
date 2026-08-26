export default function AP_BlurText({
  text,
  className = "",
  delay = 70,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, index) => (
        <span
          aria-hidden="true"
          className="ap-blur-word"
          style={{ animationDelay: `${index * delay}ms` }}
          key={`${word}-${index}`}
        >
          {word}{index < words.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </span>
  );
}
