'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserBanner } from './userBanner';

export default function ChangelogViewer() {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [lastTimestamp, setLastTimestamp] = React.useState(null);
  const pageSize = 10;

  // Fetch data from API
  React.useEffect(() => {
    const fetchChangelogs = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          pageSize: pageSize.toString(),
          ...(lastTimestamp && { lastTimestamp })
        });
        
        const response = await fetch(`/api/changelogs?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch changelogs');
        }
        const newData = await response.json();
        setData(newData);
        if (newData.lastTimestamp) {
          setLastTimestamp(newData.lastTimestamp);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChangelogs();
  }, []);

  const renderChangelogTitle = (changelog) => {
    const hasVersion = !!changelog.version;
    const hasTitle = !!changelog.title;
    const dateRange = `${new Date(changelog.startDate).toLocaleDateString()} → ${new Date(changelog.endDate).toLocaleDateString()}`;

    if (!hasVersion && !hasTitle) {
      return (
        <CardTitle className="flex justify-between items-center">
          <span className="text-xl text-gray-900">
            Changelog entry for date range: {dateRange}
          </span>
        </CardTitle>
      );
    }

    return (
      <div className="space-y-1">
        <CardTitle className="flex justify-between items-center">
          <span className="text-xl text-gray-900">
            {[
              changelog.version,
              changelog.title
            ].filter(Boolean).join(' - ')}
          </span>
        </CardTitle>
        <p className="text-sm text-gray-500">
          Changelog entry for date range: {dateRange}
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-red-500 text-center p-4">
          Error loading changelogs: {error}
        </div>
      </div>
    );
  }

  return (
    <>
    <UserBanner />
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Changelog</h1>
        
        <div className="space-y-6">
          {data?.items?.map((changelog) => (
            <Card 
              key={changelog.id} 
              className="w-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="border-b border-gray-100">
                {renderChangelogTitle(changelog)}
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  {changelog.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-6 last:mb-0">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {section.heading}
                      </h3>
                      <ul className="list-none pl-4 space-y-2">
                        {section.bulletPoints.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="text-gray-700 flex items-start group">
                            <span className="text-gray-400 mr-2">•</span>
                            <div className="flex-1">
                              {bullet.bulletPointDetails}
                              {bullet.linkToRelevantCommit && (
                                <a
                                  href={bullet.linkToRelevantCommit}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-500 text-sm"
                                >
                                  <svg 
                                    className="inline-block w-4 h-4" 
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
                                </a>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {data?.hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                const currentLastTimestamp = data.lastTimestamp;
                if (currentLastTimestamp) {
                  setLastTimestamp(currentLastTimestamp);
                }
              }}
              className="px-6 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}