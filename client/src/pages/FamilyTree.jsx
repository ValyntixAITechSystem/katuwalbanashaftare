import React, { useState, useEffect, useCallback, useRef } from 'react';
import { familyService } from '../services/familyService';
import { socketService } from '../services/socketService';
import { Tree, TreeNode } from 'react-organizational-chart';
import { ZoomIn, ZoomOut, Move, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const FamilyTree = () => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0 });
  const containerRef = useRef(null);

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      const response = await familyService.getTree();
      setTreeData(response.data);
    } catch (error) {
      toast.error('Failed to load family tree');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
    const socket = socketService.connect();

    socket.on('family:updated', fetchTree);

    return () => {
      socket.off('family:updated');
    };
  }, [fetchTree]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragRef.current.startX = e.clientX - position.x;
    dragRef.current.startY = e.clientY - position.y;
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragRef.current.startX,
        y: e.clientY - dragRef.current.startY,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const renderTree = (node) => {
    if (!node) return null;

    return (
      <TreeNode
        label={
          <div
            className="bg-white rounded-lg shadow-md p-3 border-2 border-blue-500 min-w-[120px] cursor-pointer hover:shadow-lg transition"
           onClick={() => {
  if (node._id) {
    window.location.href = `/profile/${node._id}`;
  }
}}
 // onClick={() => node._id && window.location.href = `/profile/${node._id}`}
          >
            <div className="flex flex-col items-center">
              <img
                src={node.photo || '/default-avatar.png'}
                alt={node.name}
                className="w-12 h-12 rounded-full object-cover mb-2"
              />
              <div className="text-sm font-semibold text-center">{node.name}</div>
              <div className="text-xs text-gray-600">{node.relation}</div>
            </div>
          </div>
        }
        key={node._id}
      >
        {node.children && node.children.map(child => renderTree(child))}
      </TreeNode>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Family Tree</h1>
          <p className="text-gray-600">Interactive family genealogy visualization</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Maximize2 size={20} />
          </button>
          <span className="text-sm text-gray-600 ml-2">{Math.round(scale * 100)}%</span>
        </div>
      </div>

      <motion.div
        ref={containerRef}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden relative h-[600px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <motion.div
          animate={{
            scale: scale,
            x: position.x,
            y: position.y,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {treeData ? (
            <Tree
              lineWidth="2px"
              lineColor="#94a3b8"
              lineBorderRadius="4px"
              label={
                <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4 min-w-[140px]">
                  <div className="flex flex-col items-center">
                    <div className="font-bold">{treeData.name}</div>
                    <div className="text-xs opacity-90">{treeData.relation}</div>
                  </div>
                </div>
              }
            >
              {treeData.children && treeData.children.map(child => renderTree(child))}
            </Tree>
          ) : (
            <div className="text-gray-500">No family data available</div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FamilyTree;