type CardProps = {
  title?: string;
  children: React.ReactNode;
};

function Card({ children, title }: CardProps) {
  return (
    <section
      className="mb-9 rounded-xl bg-white p-3 md:p-9"
      style={{ boxShadow: "0px 2px 8px 0px #00000033" }}
    >
      {title && <h1 className="text-center">{title}</h1>}
      {children}
    </section>
  );
}

export { Card };
