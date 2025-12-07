/**
 * LiveConsole Component
 * Displays stderr messages with auto-scroll
 */

import React, { useEffect, useRef, useState } from 'react';

export default function LiveConsole({ messages }) {
  const [isVisible, setIsVisible] = useState(true);
  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current && isVisible) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages, isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Show Console ({messages.length})
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Console ({messages.length})
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
        >
          Hide
        </button>
      </div>

      <div
        ref={consoleRef}
        className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-xs"
      >
        {messages.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">
            No console messages
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="text-red-700 dark:text-red-300 mb-1">
              {msg}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
