'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DevBanner } from "./devBanner";

export default function ChangelogGenerator() {
  const [page, setPage] = useState(0);
  const [commits, setCommits] = useState(null);
  const [isLoadingCommits, setIsLoadingCommits] = useState(true);
  const [commitsError, setCommitsError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChangelog, setGeneratedChangelog] = useState(null);
  const [changelogId, setChangelogId] = useState(null);

  // Fetch commits when page or dates change
  useEffect(() => {
    const fetchCommits = async () => {
      try {
        setIsLoadingCommits(true);
        const queryParams = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          startDate,
          endDate
        });

        const response = await fetch(`/api/commits?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch commits');
        }
        const data = await response.json();
        setCommits(data.items);
        setTotalPages(data.totalPages);
        setCommitsError(null);
      } catch (err) {
        setCommitsError(err.message);
      } finally {
        setIsLoadingCommits(false);
      }
    };

    fetchCommits();
  }, [page, startDate, endDate]);

  // Reset page when date range changes
  useEffect(() => {
    setPage(0);
  }, [startDate, endDate]);

  const generateChangelog = async () => {
    setIsGenerating(true);
    setGeneratedChangelog(null);
    setChangelogId(null);

    try {
      const response = await fetch('/api/changelogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          version: version.trim() || undefined,
          title: title.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate changelog');
      }

      const { id } = await response.json();
      setChangelogId(id);

      // Start polling for results
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/changelogs/status/${id}`);
        const status = await statusResponse.json();

        if (status.completed) {
          clearInterval(pollInterval);
          setGeneratedChangelog(status.changelog);
          setIsGenerating(false);
        } else if (status.error) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          console.error('Error generating changelog:', status.error);
        }
      }, 2000);

    } catch (error) {
      console.error('Error generating changelog:', error);
      setIsGenerating(false);
    }
  };

  const renderResult = () => {
    if (isGenerating) {
      return (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-center space-x-3 text-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            <span>Generating changelog...</span>
          </div>
          {changelogId && (
            <div className="text-sm text-gray-600 text-center">
              Job ID: {changelogId}
            </div>
          )}
        </div>
      );
    }

    if (generatedChangelog) {
      return (
        <div className="mt-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-green-700 font-medium">Changelog generated successfully!</span>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>View in changelog</span>
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
              </a>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            {generatedChangelog.version && (
              <p className="text-sm text-gray-600 mb-2">Version: {generatedChangelog.version}</p>
            )}
            {generatedChangelog.title && (
              <p className="text-sm text-gray-600 mb-4">Title: {generatedChangelog.title}</p>
            )}
            <div className="prose max-w-none">
              {generatedChangelog.changes.map((change, index) => (
                <div key={index} className="mb-4">
                  <h4 className="font-semibold">{change.category}</h4>
                  <ul className="list-disc pl-5">
                    {change.items.map((item, idx) => (
                      <li key={idx} className="group">
                        {item.description}
                        {item.commitLink && (
                          <a
                            href={item.commitLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-500 text-sm inline-flex items-center"
                          >
                            <svg
                              className="w-3 h-3"
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
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (commitsError) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading commits: {commitsError}
      </div>
    );
  }

  return (
    <>
      <DevBanner />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 pt-4">Changelog Generator</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configure Next Changelog Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Version Number (optional)</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g., v1.2.0"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title (optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Major Feature Release"
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={generateChangelog}
                  disabled={isGenerating || !commits || commits.length === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  {isGenerating ? 'Generating...' :
                    !commits || commits.length === 0 ? 'No commits in selected date range' :
                      'Generate Changelog'}
                </button>
                {(!commits || commits.length === 0) && !isGenerating && (
                  <p className="text-sm text-red-500 text-center">
                    Please select a date range that contains commits
                  </p>
                )}
              </div>

              {renderResult()}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Commits Within Selected Time Frame</h2>
          </div>

          {isLoadingCommits ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : commits?.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No commits found in the selected date range
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {commits?.map((commit) => (
                <AccordionItem key={commit.sha} value={commit.sha}>
                  <AccordionTrigger className="hover:bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium">{commit.message.split('\n')[0]}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(commit.date).toLocaleDateString()}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{commit.message}</p>
                      <div className="text-sm">
                        <span className="font-medium">Author:</span> {commit.author}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">SHA:</span>{" "}
                        <a
                          href={commit.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                        >
                          {commit.sha.substring(0, 7)}
                          <svg
                            className="w-3 h-3"
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
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {commits?.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}