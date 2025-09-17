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
            paths.forEach(path => drawPath(path));
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

  const drawPath = (path: any) => {
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
      ctx.strokeRect(path.x, path.y, path.width, path.height);
    } else if (path.type === 'circle') {
      ctx.beginPath();
      ctx.arc(path.x, path.y, path.radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (path.type === 'text') {
      ctx.font = `${path.fontSize}px Arial`;
      ctx.fillStyle = path.color;
      ctx.fillText(path.text, path.x, path.y);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
        drawPath(newPath);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool !== 'pen') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !ctxRef.current) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctxRef.current) {
      ctxRef.current.beginPath();
    }
  };

  const handleToolChange = (tool: DrawingTool) => {
    setCurrentTool(tool);
  };

  const handleUndo = () => {
    if (paths.length > 0) {
      const newPaths = paths.slice(0, -1);
      setPaths(newPaths);
      
      // Clear canvas and redraw
      if (ctxRef.current && canvasRef.current) {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctxRef.current.fillStyle = '#ffffff';
        ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        newPaths.forEach(path => drawPath(path));
      }
    }
  };

  const handleClear = () => {
    setPaths([]);
    if (ctxRef.current && canvasRef.current) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctxRef.current.fillStyle = '#ffffff';
      ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
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
      <div className="flex-shrink-0 bg-gray-100 border-b border-gray-300 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Palette className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Whiteboard</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                isSaved 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Tools */}
          <div className="flex items-center space-x-2">
            {tools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => handleToolChange(tool.name as DrawingTool)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors ${
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
          <div className="flex items-center space-x-4">
            {/* Color Palette */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm">Color:</span>
              <div className="flex space-x-1">
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
                className="w-20"
              />
              <span className="text-gray-600 text-sm w-6">{strokeWidth}px</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUndo}
                className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>

              <button
                onClick={handleClear}
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
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
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Instructions */}
      <div className="flex-shrink-0 bg-gray-50 border-t border-gray-300 p-3">
        <div className="text-sm text-gray-600 text-center">
          Use the whiteboard to design systems, draw diagrams, or illustrate your solution for: 
          <span className="font-medium text-purple-600 ml-1">{question.question}</span>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;