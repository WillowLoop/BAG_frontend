import { FileUploadSection } from "./components/FileUploadSection";
import { FileAnalyzer } from "./components/FileAnalyzer";
import { useState } from "react";

export default function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1>Excel Analyzer</h1>
              <p className="text-sm text-gray-600">Analyze your Excel files in seconds</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!uploadedFile ? (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2>Powerful Excel File Analysis</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Upload your Excel files and get instant analysis with customizable settings.
                Fast, secure, and easy to use.
              </p>
            </div>

            {/* Upload Section */}
            <FileUploadSection onFileUpload={setUploadedFile} />

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3>Lightning Fast</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Process your files in seconds with our optimized analysis engine
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3>Customizable</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Configure analysis settings to match your specific needs
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3>Secure</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Your files are processed locally and never stored on our servers
                </p>
              </div>
            </div>
          </div>
        ) : (
          <FileAnalyzer
            file={uploadedFile}
            onBack={() => setUploadedFile(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-white/50">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 Excel Analyzer. Process your data with confidence.</p>
        </div>
      </footer>
    </div>
  );
}
