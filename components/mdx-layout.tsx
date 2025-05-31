export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[60ch] mx-auto w-full space-y-6 pb-12">
      {children}
    </div>
  );
}
