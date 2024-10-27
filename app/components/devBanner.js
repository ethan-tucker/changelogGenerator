import Link from 'next/link';

export function DevBanner() {
  return (
    <div className="bg-blue-600 text-white py-2 px-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <span className="font-medium">Marimo Developer Portal</span>
        <Link 
          href="/"
          className="text-white hover:text-blue-100 transition-colors flex items-center gap-1 text-sm"
        >
          View Public Changelog
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}