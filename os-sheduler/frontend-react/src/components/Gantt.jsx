/**
 * Gantt Chart Component
 * Visual timeline of process execution with zoom, pan, and hover
 */

import React, { useRef, useEffect, useState } from 'react';
import { getProcessColor } from '../lib/colors';

export default function Gantt({ segments, currentTick, onTickClick }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const prevSegmentsLengthRef = useRef(segments.length);

  const rowHeight = 40;
  const padding = 10;
  const labelWidth = 60;
  
  // Detect if we're getting live updates
  useEffect(() => {
    if (segments.length > prevSegmentsLengthRef.current) {
      setIsLive(true);
      const timer = setTimeout(() => setIsLive(false), 1000);
      return () => clearTimeout(timer);
    }
    prevSegmentsLengthRef.current = segments.length;
  }, [segments]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 100;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate scaling
    const maxTick = Math.max(...segments.map(s => s.end));
    const availableWidth = width - labelWidth - padding * 2;
    const pixelsPerTick = (availableWidth / maxTick) * zoom;

    // Draw segments
    segments.forEach((segment) => {
      const x = labelWidth + padding + (segment.start * pixelsPerTick) + pan;
      const segmentWidth = (segment.end - segment.start) * pixelsPerTick;
      const y = padding;

      // Get color for process
      const color = segment.pid === -1 ? '#9ca3af' : getProcessColor(segment.pid);

      // Draw segment
      ctx.fillStyle = color;
      ctx.fillRect(x, y, segmentWidth, rowHeight);

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, segmentWidth, rowHeight);

      // Draw PID label if segment is wide enough
      if (segmentWidth > 30) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = segment.pid === -1 ? 'IDLE' : `P${segment.pid}`;
        ctx.fillText(label, x + segmentWidth / 2, y + rowHeight / 2);
      }
    });

    // Draw current tick indicator
    if (currentTick !== undefined && currentTick !== null) {
      const tickX = labelWidth + padding + (currentTick * pixelsPerTick) + pan;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tickX, 0);
      ctx.lineTo(tickX, height);
      ctx.stroke();
    }

    // Draw time axis
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let tick = 0; tick <= maxTick; tick += Math.ceil(maxTick / 10)) {
      const x = labelWidth + padding + (tick * pixelsPerTick) + pan;
      if (x > labelWidth && x < width) {
        ctx.fillText(tick.toString(), x, height - 5);
      }
    }

  }, [segments, currentTick, zoom, pan]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const deltaX = e.clientX - dragStart;
      setPan(prev => prev + deltaX);
      setDragStart(e.clientX);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find hovered segment
    const maxTick = Math.max(...segments.map(s => s.end));
    const availableWidth = canvas.width - labelWidth - padding * 2;
    const pixelsPerTick = (availableWidth / maxTick) * zoom;

    const hovered = segments.find(segment => {
      const segX = labelWidth + padding + (segment.start * pixelsPerTick) + pan;
      const segWidth = (segment.end - segment.start) * pixelsPerTick;
      const segY = padding;

      return x >= segX && x <= segX + segWidth && y >= segY && y <= segY + rowHeight;
    });

    setHoveredSegment(hovered || null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-2 transition-colors ${
      isLive 
        ? 'border-green-400 dark:border-green-500' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📊 Gantt Chart
          </h3>
          {isLive && (
            <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Updating...
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(5, prev * 1.2))}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
            aria-label="Reset zoom"
          >
            Reset
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev * 0.8))}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
            aria-label="Zoom out"
          >
            -
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredSegment(null)}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <canvas ref={canvasRef} />

        {hoveredSegment && (
          <div className="absolute bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none"
               style={{ top: '70px', left: '50%', transform: 'translateX(-50%)' }}>
            PID: {hoveredSegment.pid === -1 ? 'IDLE' : hoveredSegment.pid} |
            Range: [{hoveredSegment.start}, {hoveredSegment.end}] |
            {hoveredSegment.priority !== undefined && ` Priority: ${hoveredSegment.priority} |`}
            {hoveredSegment.remaining !== undefined && ` Remaining: ${hoveredSegment.remaining}`}
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Scroll to zoom, drag to pan
      </div>
    </div>
  );
}
