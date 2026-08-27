import { useState, useRef, type FC, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SwipeableCard: FC<Props> = ({ children, onEdit, onDelete }) => {
  const [offsetX, setOffsetX] = useState(0);
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef<number>(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
    isHorizontalSwipeRef.current = null;
    dragStartTimeRef.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || startXRef.current === null || startYRef.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;
    
    // Determine scroll direction if not determined yet
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
        isHorizontalSwipeRef.current = true;
      } else if (Math.abs(diffY) > 5) {
        isHorizontalSwipeRef.current = false;
      }
    }

    if (isHorizontalSwipeRef.current) {
      // Allow swiping left (to reveal delete)
      if (diffX < 0) {
        setOffsetX(Math.max(diffX, -80));
      } else if (diffX > 0 && offsetX < 0) {
        setOffsetX(Math.min(0, -80 + diffX)); // if it was already open and user swipes right
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    
    const dragDuration = Date.now() - dragStartTimeRef.current;
    
    // Tap to edit
    if (dragDuration < 200 && Math.abs(offsetX) < 10) {
      if (onEdit) onEdit();
      setOffsetX(0);
      return;
    }

    // Snap logic
    if (offsetX < -40) {
      setOffsetX(-80);
    } else {
      setOffsetX(0);
    }
    startXRef.current = null;
    startYRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    isDraggingRef.current = true;
    isHorizontalSwipeRef.current = null;
    dragStartTimeRef.current = Date.now();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || startXRef.current === null || startYRef.current === null) return;
    const currentX = e.clientX;
    const currentY = e.clientY;
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;
    
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
        isHorizontalSwipeRef.current = true;
      } else if (Math.abs(diffY) > 5) {
        isHorizontalSwipeRef.current = false;
      }
    }

    if (isHorizontalSwipeRef.current) {
      if (diffX < 0) {
        setOffsetX(Math.max(diffX, -80));
      } else if (diffX > 0 && offsetX < 0) {
        setOffsetX(Math.min(0, -80 + diffX));
      }
    }
  };

  const handleMouseUp = () => {
    handleTouchEnd();
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      handleTouchEnd();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-red-500 shadow-sm border border-red-500">
      <div className="absolute inset-y-0 right-0 flex items-center justify-center w-[80px]">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
            setOffsetX(0);
          }}
          className="w-full h-full flex flex-col items-center justify-center text-white bg-red-500 transition-colors hover:bg-red-600 active:bg-red-700"
        >
          <Trash2 className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">삭제</span>
        </button>
      </div>
      <div 
        className="relative z-10 w-full bg-white transition-transform duration-200 ease-out will-change-transform h-full"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </div>
  );
};
