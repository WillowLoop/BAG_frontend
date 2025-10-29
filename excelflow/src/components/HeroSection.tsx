/**
 * HeroSection Component
 *
 * Displays the main hero section with title, subtitle, and value proposition.
 * Features a gradient text effect on the title for visual appeal.
 */

export function HeroSection() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ExcelFlow
        </span>
      </h1>
      <h2 className="text-xl md:text-2xl text-gray-700 font-semibold mb-4">
        Transformeer je Excel-bestanden in seconden
      </h2>
      <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
        Upload je Excel-bestanden en laat ze direct analyseren via onze externe API.
        Snel, veilig en gebruiksvriendelijk.
      </p>
    </div>
  );
}
