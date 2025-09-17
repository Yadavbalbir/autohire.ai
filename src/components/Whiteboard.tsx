import React, { useRef, useEffect, useState } from 'react';
import { 
  Pen, 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Eraser, 
  Trash2, 
  Download, 
  Undo, 
  Move,
  Triangle as TriangleIcon,
  ArrowRight,
  Palette,
  Save,
  CheckCircle
} from 'lucide-react';

interface InterviewQuestion {
  id: string;
  type: 'behavioral' | 'technical' | 'coding' | 'system_design';
  question: string;
  description?: string;
  hints?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface WhiteboardProps {
  question: InterviewQuestion;
}

type DrawingTool = 'pen' | 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'text' | 'eraser' | 'select';

const Whiteboard: React.FC<WhiteboardProps> = ({ question }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [paths, setPaths] = useState<any[]>([]);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [selectedPathIndices, setSelectedPathIndices] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const storageKey = `whiteboard_${question.id}`;

  // Load from local storage on mount
  useEffect(() => {
    const savedPaths = localStorage.getItem(storageKey);
    if (savedPaths) {
      setPaths(JSON.parse(savedPaths));
    }
  }, [storageKey]);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(paths));
  }, [paths, storageKey]);

  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
  ];

  const tools = [
    { name: 'select', icon: Move, label: 'Select' },
    { name: 'pen', icon: Pen, label: 'Draw' },
    { name: 'rectangle', icon: Square, label: 'Rectangle' },
    { name: 'circle', icon: CircleIcon, label: 'Circle' },
    { name: 'triangle', icon: TriangleIcon, label: 'Triangle' },
    { name: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { name: 'text', icon: Type, label: 'Text' },
    { name: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctxRef.current = ctx;
        
        // Set canvas size
        const resizeCanvas = () => {
          const container = canvas.parentElement;
          if (container) {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height - 100;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Redraw all paths
            paths.forEach((path, index) => drawPath(path, selectedPathIndices.includes(index)));
          }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
          window.removeEventListener('resize', resizeCanvas);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = currentColor;
      ctxRef.current.lineWidth = strokeWidth;
    }
  }, [currentColor, strokeWidth]);

  useEffect(() => {
    if (ctxRef.current && canvasRef.current) {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      paths.forEach((path, index) => drawPath(path, selectedPathIndices.includes(index)));

      if (isMarqueeSelecting && marqueeRect) {
        ctx.strokeStyle = 'rgba(0, 102, 204, 0.7)';
        ctx.fillStyle = 'rgba(0, 102, 204, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(marqueeRect.x, marqueeRect.y, marqueeRect.width, marqueeRect.height);
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [paths, selectedPathIndices, isMarqueeSelecting, marqueeRect]);

  // Hit detection for shapes
  const isPointInPath = (point: { x: number; y: number }, path: any): boolean => {
    const tolerance = 5; // Pixels tolerance for selection
    
    if (path.type === 'pen') {
      return path.points.some((p: any, index: number) => {
        if (index === 0) return false;
        const prevP = path.points[index - 1];
        return distanceToLineSegment(point, prevP, p) <= tolerance;
      });
    } else if (path.type === 'rectangle') {
      return (
        point.x >= path.x - tolerance &&
        point.x <= path.x + path.width + tolerance &&
        point.y >= path.y - tolerance &&
        point.y <= path.y + path.height + tolerance &&
        (point.x <= path.x + tolerance || point.x >= path.x + path.width - tolerance ||
         point.y <= path.y + tolerance || point.y >= path.y + path.height - tolerance)
      );
    } else if (path.type === 'circle') {
      const distance = Math.sqrt(Math.pow(point.x - path.x, 2) + Math.pow(point.y - path.y, 2));
      return Math.abs(distance - path.radius) <= tolerance;
    } else if (path.type === 'triangle') {
      // Check if point is near any of the triangle edges
      return (
        distanceToLineSegment(point, { x: path.x1, y: path.y1 }, { x: path.x2, y: path.y2 }) <= tolerance ||
        distanceToLineSegment(point, { x: path.x2, y: path.y2 }, { x: path.x3, y: path.y3 }) <= tolerance ||
        distanceToLineSegment(point, { x: path.x3, y: path.y3 }, { x: path.x1, y: path.y1 }) <= tolerance
      );
    } else if (path.type === 'arrow') {
      return distanceToLineSegment(
        point,
        { x: path.startX, y: path.startY },
        { x: path.endX, y: path.endY }
      ) <= tolerance;
    }
    
    return false;
  };

  // Helper function to calculate distance from point to line segment
  const distanceToLineSegment = (
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx: number, yy: number;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const drawPath = (path: any, isSelected: boolean = false) => {
    if (!ctxRef.current) return;
    
    const ctx = ctxRef.current;
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    
    if (path.type === 'pen') {
      ctx.beginPath();
      path.points.forEach((point: any, index: number) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    } else if (path.type === 'rectangle') {
      ctx.beginPath();
      ctx.strokeRect(path.x, path.y, path.width, path.height);
    } else if (path.type === 'circle') {
      ctx.beginPath();
      ctx.arc(path.x, path.y, path.radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (path.type === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(path.x1, path.y1);
      ctx.lineTo(path.x2, path.y2);
      ctx.lineTo(path.x3, path.y3);
      ctx.closePath();
      ctx.stroke();
    } else if (path.type === 'arrow') {
      ctx.beginPath();
      // Arrow line
      ctx.moveTo(path.startX, path.startY);
      ctx.lineTo(path.endX, path.endY);
      
      // Arrow head
      const angle = Math.atan2(path.endY - path.startY, path.endX - path.startX);
      const headLength = 20;
      
      ctx.moveTo(path.endX, path.endY);
      ctx.lineTo(
        path.endX - headLength * Math.cos(angle - Math.PI / 6),
        path.endY - headLength * Math.sin(angle - Math.PI / 6)
      );
      
      ctx.moveTo(path.endX, path.endY);
      ctx.lineTo(
        path.endX - headLength * Math.cos(angle + Math.PI / 6),
        path.endY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    } else if (path.type === 'text') {
      ctx.font = `${path.fontSize}px Arial`;
      ctx.fillStyle = path.color;
      ctx.fillText(path.text, path.x, path.y);
    }

    // Render text inside shapes if text property exists
    if (path.text && path.type !== 'text') {
      ctx.fillStyle = path.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const bounds = getPathBounds(path);
      if (bounds) {
        const centerX = bounds.x1 + (bounds.x2 - bounds.x1) / 2;
        const centerY = bounds.y1 + (bounds.y2 - bounds.y1) / 2;
        ctx.fillText(path.text, centerX, centerY);
      }
    }

    // Draw selection handles if shape is selected
    if (isSelected) {
      ctx.strokeStyle = '#0066CC';
      ctx.fillStyle = '#0066CC';
      ctx.lineWidth = 2;
      
      if (path.type === 'rectangle') {
        // Draw selection and resize handles
        const handles = [
          { x: path.x, y: path.y, position: 'nw' },
          { x: path.x + path.width, y: path.y, position: 'ne' },
          { x: path.x + path.width, y: path.y + path.height, position: 'se' },
          { x: path.x, y: path.y + path.height, position: 'sw' },
          { x: path.x + path.width / 2, y: path.y, position: 'n' },
          { x: path.x + path.width / 2, y: path.y + path.height, position: 's' },
          { x: path.x, y: path.y + path.height / 2, position: 'w' },
          { x: path.x + path.width, y: path.y + path.height / 2, position: 'e' },
        ];
        
        handles.forEach(handle => {
          ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8);
        });
      } else if (path.type === 'circle') {
        // Draw selection handles for circle
        const handles = [
          { x: path.x - path.radius, y: path.y, position: 'w' },
          { x: path.x + path.radius, y: path.y, position: 'e' },
          { x: path.x, y: path.y - path.radius, position: 'n' },
          { x: path.x, y: path.y + path.radius, position: 's' },
        ];
        
        handles.forEach(handle => {
          ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8);
        });
      }
    }
  };

  const getResizeHandle = (point: { x: number; y: number }, path: any): string | null => {
    if (path.type === 'rectangle') {
      const handles = [
        { x: path.x, y: path.y, position: 'nw' },
        { x: path.x + path.width, y: path.y, position: 'ne' },
        { x: path.x + path.width, y: path.y + path.height, position: 'se' },
        { x: path.x, y: path.y + path.height, position: 'sw' },
        { x: path.x + path.width / 2, y: path.y, position: 'n' },
        { x: path.x + path.width / 2, y: path.y + path.height, position: 's' },
        { x: path.x, y: path.y + path.height / 2, position: 'w' },
        { x: path.x + path.width, y: path.y + path.height / 2, position: 'e' },
      ];
      
      for (const handle of handles) {
        const distance = Math.sqrt(Math.pow(point.x - handle.x, 2) + Math.pow(point.y - handle.y, 2));
        if (distance <= 8) {
          return handle.position;
        }
      }
    } else if (path.type === 'circle') {
      const handles = [
        { x: path.x - path.radius, y: path.y, position: 'w' },
        { x: path.x + path.radius, y: path.y, position: 'e' },
        { x: path.x, y: path.y - path.radius, position: 'n' },
        { x: path.x, y: path.y + path.radius, position: 's' },
      ];
      
      for (const handle of handles) {
        const distance = Math.sqrt(Math.pow(point.x - handle.x, 2) + Math.pow(point.y - handle.y, 2));
        if (distance <= 8) {
          return handle.position;
        }
      }
    }
    
    return null;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = { x, y };

    setStartPoint(point);

    if (currentTool === 'select') {
      // Check if clicking on a resize handle first
      if (selectedPathIndices.length === 1) {
        const selectedPath = paths[selectedPathIndices[0]];
        const handle = getResizeHandle(point, selectedPath);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          return;
        }
      }

      // Find the topmost shape that contains this point
      let foundIndex = -1;
      for (let i = paths.length - 1; i >= 0; i--) {
        if (isPointInPath(point, paths[i])) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex !== -1) {
        setSelectedPathIndices([foundIndex]);
        setIsDragging(true);
        const selectedPath = paths[foundIndex];
        
        // Calculate drag offset based on shape type
        let offsetX = 0, offsetY = 0;
        if (selectedPath.type === 'rectangle') {
          offsetX = x - selectedPath.x;
          offsetY = y - selectedPath.y;
        } else if (selectedPath.type === 'circle') {
          offsetX = x - selectedPath.x;
          offsetY = y - selectedPath.y;
        } else if (selectedPath.type === 'triangle') {
          offsetX = x - selectedPath.x1;
          offsetY = y - selectedPath.y1;
        } else if (selectedPath.type === 'arrow') {
          offsetX = x - selectedPath.startX;
          offsetY = y - selectedPath.startY;
        }
        
        setDragOffset({ x: offsetX, y: offsetY });
        
      } else {
        setSelectedPathIndices([]);
        setIsMarqueeSelecting(true);
        setMarqueeRect({ x, y, width: 0, height: 0 });
      }
      return;
    }

    setIsDrawing(true);

    if (currentTool === 'pen') {
      const newPath = {
        type: 'pen',
        points: [{ x, y }],
        color: currentColor,
        width: strokeWidth,
      };
      setPaths(prev => [...prev, newPath]);
    } else if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text && text.trim()) {
        const newPath = {
          type: 'text',
          text,
          x,
          y,
          color: currentColor,
          fontSize: 20,
        };
        setPaths(prev => [...prev, newPath]);
        drawPath(newPath, false);
      }
      setIsDrawing(false);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !ctxRef.current) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle resizing
    if (isResizing && selectedPathIndices.length === 1 && resizeHandle) {
      const pathIndex = selectedPathIndices[0];
      const path = paths[pathIndex];
      
      setPaths(prev => {
        const newPaths = [...prev];
        const newPath = { ...newPaths[pathIndex] };
        
        if (path.type === 'rectangle') {
          switch (resizeHandle) {
            case 'nw':
              newPath.width = (path.x + path.width) - x;
              newPath.height = (path.y + path.height) - y;
              newPath.x = x;
              newPath.y = y;
              break;
            case 'ne':
              newPath.width = x - path.x;
              newPath.height = (path.y + path.height) - y;
              newPath.y = y;
              break;
            case 'se':
              newPath.width = x - path.x;
              newPath.height = y - path.y;
              break;
            case 'sw':
              newPath.width = (path.x + path.width) - x;
              newPath.height = y - path.y;
              newPath.x = x;
              break;
            case 'n':
              newPath.height = (path.y + path.height) - y;
              newPath.y = y;
              break;
            case 's':
              newPath.height = y - path.y;
              break;
            case 'w':
              newPath.width = (path.x + path.width) - x;
              newPath.x = x;
              break;
            case 'e':
              newPath.width = x - path.x;
              break;
          }
          
          // Ensure minimum size
          if (newPath.width < 10) newPath.width = 10;
          if (newPath.height < 10) newPath.height = 10;
        } else if (path.type === 'circle') {
          const centerX = path.x;
          const centerY = path.y;
          const newRadius = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          newPath.radius = Math.max(newRadius, 5);
        }
        
        newPaths[pathIndex] = newPath;
        return newPaths;
      });
      
      return;
    }

    // Handle dragging selected shapes
    if (isDragging && selectedPathIndices.length > 0 && dragOffset) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      
      setPaths(prev => {
        const newPaths = prev.map((path, index) => {
          if (!selectedPathIndices.includes(index)) {
            return path;
          }

          const newPath = { ...path };

          if (newPath.type === 'pen') {
            const deltaX = newX - (path.points[0].x || 0);
            const deltaY = newY - (path.points[0].y || 0);
            
            if (path.points.every((p: any) => typeof p.x === 'number' && typeof p.y === 'number')) {
                newPath.points = path.points.map((point: { x: number; y: number }) => ({
                    x: point.x + deltaX,
                    y: point.y + deltaY
                }));
            }
          } else if (newPath.type === 'rectangle' || newPath.type === 'circle') {
            newPath.x = newX;
            newPath.y = newY;
          } else if (newPath.type === 'triangle') {
            const deltaX = newX - path.x1;
            const deltaY = newY - path.y1;
            newPath.x1 = path.x1 + deltaX;
            newPath.y1 = path.y1 + deltaY;
            newPath.x2 = path.x2 + deltaX;
            newPath.y2 = path.y2 + deltaY;
            newPath.x3 = path.x3 + deltaX;
            newPath.y3 = path.y3 + deltaY;
          } else if (newPath.type === 'arrow') {
            const deltaX = newX - path.startX;
            const deltaY = newY - path.startY;
            newPath.startX = path.startX + deltaX;
            newPath.startY = path.startY + deltaY;
            newPath.endX = path.endX + deltaX;
            newPath.endY = path.endY + deltaY;
          }
          return newPath;
        });
        return newPaths;
      });
      
      return;
    }

    if (isMarqueeSelecting) {
      setMarqueeRect(prev => {
        if (!prev) return null;
        return {
          ...prev,
          width: x - prev.x,
          height: y - prev.y,
        };
      });
      return;
    }

    // Regular drawing logic
    if (!isDrawing) return;

    if (currentTool === 'pen') {
      setPaths(prev => {
        const newPaths = [...prev];
        const lastPath = newPaths[newPaths.length - 1];
        if (lastPath && lastPath.type === 'pen') {
          lastPath.points.push({ x, y });
          
          // Draw line to current position
          ctxRef.current!.strokeStyle = lastPath.color;
          ctxRef.current!.lineWidth = lastPath.width;
          ctxRef.current!.lineTo(x, y);
          ctxRef.current!.stroke();
          ctxRef.current!.beginPath();
          ctxRef.current!.moveTo(x, y);
        }
        return newPaths;
      });
    } else if (['rectangle', 'circle', 'triangle', 'arrow'].includes(currentTool)) {
      // For shapes, we'll draw a preview (this will be redrawn on mouse up)
      if (canvasRef.current) {
        // Clear canvas and redraw all paths
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctxRef.current.fillStyle = '#ffffff';
        ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        paths.forEach((path, index) => drawPath(path, selectedPathIndices.includes(index)));
        
        // Draw preview of current shape (stroke only, no fill)
        ctxRef.current.strokeStyle = currentColor;
        ctxRef.current.lineWidth = strokeWidth;
        ctxRef.current.fillStyle = 'transparent';
        
        if (currentTool === 'rectangle') {
          ctxRef.current.beginPath();
          ctxRef.current.strokeRect(
            Math.min(startPoint.x, x),
            Math.min(startPoint.y, y),
            Math.abs(x - startPoint.x),
            Math.abs(y - startPoint.y)
          );
        } else if (currentTool === 'circle') {
          const radius = Math.sqrt(
            Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
          );
          ctxRef.current.beginPath();
          ctxRef.current.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
          ctxRef.current.stroke();
        } else if (currentTool === 'triangle') {
          const midX = (startPoint.x + x) / 2;
          ctxRef.current.beginPath();
          ctxRef.current.moveTo(midX, startPoint.y);
          ctxRef.current.lineTo(startPoint.x, y);
          ctxRef.current.lineTo(x, y);
          ctxRef.current.closePath();
          ctxRef.current.stroke();
        } else if (currentTool === 'arrow') {
          ctxRef.current.beginPath();
          // Arrow line
          ctxRef.current.moveTo(startPoint.x, startPoint.y);
          ctxRef.current.lineTo(x, y);
          
          // Arrow head
          const angle = Math.atan2(y - startPoint.y, x - startPoint.x);
          const headLength = 20;
          
          ctxRef.current.moveTo(x, y);
          ctxRef.current.lineTo(
            x - headLength * Math.cos(angle - Math.PI / 6),
            y - headLength * Math.sin(angle - Math.PI / 6)
          );
          
          ctxRef.current.moveTo(x, y);
          ctxRef.current.lineTo(
            x - headLength * Math.cos(angle + Math.PI / 6),
            y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctxRef.current.stroke();
        }
      }
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    // If we were resizing, stop resizing
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      return;
    }

    // If we were dragging, stop dragging
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(null);
      return;
    }

    if (isMarqueeSelecting) {
      setIsMarqueeSelecting(false);
      if (marqueeRect) {
        const selectedIndices = paths.reduce((acc: number[], path, index) => {
          if (isPathInRect(path, marqueeRect)) {
            acc.push(index);
          }
          return acc;
        }, []);
        setSelectedPathIndices(selectedIndices);
      }
      setMarqueeRect(null);
      return;
    }
    
    if (!isDrawing) return;
    
    setIsDrawing(false);

    if (e && ['rectangle', 'circle', 'triangle', 'arrow'].includes(currentTool)) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let newPath: any = {
        color: currentColor,
        width: strokeWidth,
      };

      if (currentTool === 'rectangle') {
        newPath = {
          ...newPath,
          type: 'rectangle',
          x: Math.min(startPoint.x, x),
          y: Math.min(startPoint.y, y),
          width: Math.abs(x - startPoint.x),
          height: Math.abs(y - startPoint.y),
        };
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
        );
        newPath = {
          ...newPath,
          type: 'circle',
          x: startPoint.x,
          y: startPoint.y,
          radius,
        };
      } else if (currentTool === 'triangle') {
        const midX = (startPoint.x + x) / 2;
        newPath = {
          ...newPath,
          type: 'triangle',
          x1: midX,
          y1: startPoint.y,
          x2: startPoint.x,
          y2: y,
          x3: x,
          y3: y,
        };
      } else if (currentTool === 'arrow') {
        newPath = {
          ...newPath,
          type: 'arrow',
          startX: startPoint.x,
          startY: startPoint.y,
          endX: x,
          endY: y,
        };
      }

      setPaths(prev => [...prev, newPath]);
      
      // Clear and redraw everything
      if (ctxRef.current && canvasRef.current) {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctxRef.current.fillStyle = '#ffffff';
        ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        [...paths, newPath].forEach((path, index) => drawPath(path, selectedPathIndices.includes(index)));
      }
    }

    if (ctxRef.current) {
      ctxRef.current.beginPath();
    }
  };

  const isPathInRect = (path: any, rect: { x: number; y: number; width: number; height: number }): boolean => {
    const pathBounds = getPathBounds(path);
    if (!pathBounds) return false;

    const rectX1 = Math.min(rect.x, rect.x + rect.width);
    const rectX2 = Math.max(rect.x, rect.x + rect.width);
    const rectY1 = Math.min(rect.y, rect.y + rect.height);
    const rectY2 = Math.max(rect.y, rect.y + rect.height);

    return (
      pathBounds.x1 < rectX2 &&
      pathBounds.x2 > rectX1 &&
      pathBounds.y1 < rectY2 &&
      pathBounds.y2 > rectY1
    );
  };

  const getPathBounds = (path: any): { x1: number; y1: number; x2: number; y2: number } | null => {
    if (path.type === 'pen') {
      if (path.points.length === 0) return null;
      let minX = path.points[0].x;
      let minY = path.points[0].y;
      let maxX = path.points[0].x;
      let maxY = path.points[0].y;
      path.points.forEach((p: any) => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
      return { x1: minX, y1: minY, x2: maxX, y2: maxY };
    } else if (path.type === 'rectangle') {
      return { x1: path.x, y1: path.y, x2: path.x + path.width, y2: path.y + path.height };
    } else if (path.type === 'circle') {
      return { x1: path.x - path.radius, y1: path.y - path.radius, x2: path.x + path.radius, y2: path.y + path.radius };
    } else if (path.type === 'triangle') {
      const minX = Math.min(path.x1, path.x2, path.x3);
      const minY = Math.min(path.y1, path.y2, path.y3);
      const maxX = Math.max(path.x1, path.x2, path.x3);
      const maxY = Math.max(path.y1, path.y2, path.y3);
      return { x1: minX, y1: minY, x2: maxX, y2: maxY };
    } else if (path.type === 'arrow') {
      const minX = Math.min(path.startX, path.endX);
      const minY = Math.min(path.startY, path.endY);
      const maxX = Math.max(path.startX, path.endX);
      const maxY = Math.max(path.startY, path.endY);
      return { x1: minX, y1: minY, x2: maxX, y2: maxY };
    }
    return null;
  };

  const isPointInShape = (point: { x: number; y: number }, path: any): boolean => {
    if (path.type === 'rectangle') {
        return (
            point.x >= path.x &&
            point.x <= path.x + path.width &&
            point.y >= path.y &&
            point.y <= path.y + path.height
        );
    } else if (path.type === 'circle') {
        const distance = Math.sqrt(Math.pow(point.x - path.x, 2) + Math.pow(point.y - path.y, 2));
        return distance <= path.radius;
    } else if (path.type === 'triangle') {
        // Using barycentric coordinates to check if point is inside the triangle
        const p0 = { x: path.x1, y: path.y1 };
        const p1 = { x: path.x2, y: path.y2 };
        const p2 = { x: path.x3, y: path.y3 };

        const s = p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * point.x + (p0.x - p2.x) * point.y;
        const t = p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * point.x + (p1.x - p0.x) * point.y;

        if ((s < 0) != (t < 0) && s != 0 && t != 0) {
            return false;
        }

        const A = -p1.y * p2.x + p0.y * (p2.x - p1.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y;
        
        return A < 0 ? (s <= 0 && s + t >= A) : (s >= 0 && s + t <= A);
    }
    return false;
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = { x, y };

    let clickedPathIndex = -1;

    // Find the topmost shape that contains this point
    for (let i = paths.length - 1; i >= 0; i--) {
        const path = paths[i];
        if (isPointInShape(point, path)) {
            clickedPathIndex = i;
            break;
        }
    }

    if (clickedPathIndex !== -1) {
        const text = prompt('Enter text:', paths[clickedPathIndex].text || '');
        if (text !== null) {
            const newPaths = [...paths];
            newPaths[clickedPathIndex] = { ...newPaths[clickedPathIndex], text };
            setPaths(newPaths);
        }
    }
  };

  const handleToolChange = (tool: DrawingTool) => {
    setCurrentTool(tool);
  };

  const handleUndo = () => {
    if (paths.length > 0) {
      const newPaths = paths.slice(0, -1);
      setPaths(newPaths);
      setSelectedPathIndices([]);
    }
  };

  const handleClear = () => {
    setPaths([]);
    setSelectedPathIndices([]);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    console.log('Saving whiteboard for question:', question.id);
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `whiteboard_${question.id}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-gray-100 border-b border-gray-300 p-3">
        {/* Top Row - Title and Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Palette className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Whiteboard</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                isSaved 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>

        {/* Bottom Row - Tools and Controls */}
        <div className="space-y-3">
          {/* Tools */}
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => handleToolChange(tool.name as DrawingTool)}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg font-medium transition-colors text-sm ${
                  currentTool === tool.name
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
                title={tool.label}
              >
                <tool.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Color Palette */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm">Color:</span>
              <div className="flex flex-wrap gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      currentColor === color 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm">Width:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-16"
              />
              <span className="text-gray-600 text-sm w-8">{strokeWidth}px</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUndo}
                className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1.5 rounded-lg font-medium transition-colors text-sm"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
                <span className="hidden lg:inline">Undo</span>
              </button>

              <button
                onClick={handleClear}
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded-lg font-medium transition-colors text-sm"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden lg:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 relative bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className="border-none outline-none cursor-crosshair"
          style={{ 
            width: '100%', 
            height: '100%',
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={() => stopDrawing()}
          onDoubleClick={handleDoubleClick}
        />
      </div>

      {/* Instructions */}
      <div className="flex-shrink-0 bg-gray-50 border-t border-gray-300 p-3">
        <div className="text-sm text-gray-600 text-center">
          Use the whiteboard to design systems, draw diagrams, or illustrate your solution for: 
          <span className="font-medium text-purple-600 ml-1">{question.question}</span>
          <br />
          <span className="text-xs text-gray-500 mt-1 block">
            💡 Tip: Double-click inside shapes to add text • Select shapes to resize with handles
          </span>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;