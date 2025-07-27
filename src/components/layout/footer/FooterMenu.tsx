import { footerColumns } from './footer.config';
import FooterColumn from './FooterColumn';
import Copyright from './Copyright';

export default function FooterMenu() {
  return (
    <footer className="bg-secondary border-t border-border ">
      <div className="h-120 sm:h-96 mx-auto max-w-5xl p-4 space-y-6 flex flex-col justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 w-72 w-full mx-auto">
          {footerColumns.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>
        <div className="border-t border-border">
          <Copyright />
        </div>
      </div>
    </footer>
  );
}
