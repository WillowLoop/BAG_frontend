/**
 * Footer Component
 *
 * Application footer with copyright information and links.
 * Always positioned at the bottom of the page.
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-20 py-8 bg-white/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {currentYear} ExcelFlow. Verwerk je data met vertrouwen.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Voorwaarden
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
