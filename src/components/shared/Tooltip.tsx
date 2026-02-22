type Props = {
  children: React.ReactNode;
  text: string;
};

function Tooltip({ children, text }: Props) {
  return (
    <div className="tooltip">
      {children}
      <span className="tooltiptext whitespace-nowrap">{text}</span>
    </div>
  );
}

export default Tooltip;
