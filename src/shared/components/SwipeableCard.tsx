import { useState, useRef, type FC, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

// 탭으로 인정할 최대 이동 거리 (px)
const TAP_THRESHOLD = 8;
// 탭으로 인정할 최대 지속 시간 (ms)
const TAP_DURATION = 250;

export const SwipeableCard: FC<Props> = ({ children, onEdit, onDelete }) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const currentOffsetRef = useRef(0); // offsetX의 ref 버전 (핸들러 내부에서 최신 값 참조용)
  const dragStartTimeRef = useRef<number>(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const movedRef = useRef(false); // 실제로 의미있게 움직였는지 여부

  const setOffset = (val: number) => {
    currentOffsetRef.current = val;
    setOffsetX(val);
  };

  const handleDragStart = (x: number, y: number) => {
    startXRef.current = x;
    startYRef.current = y;
    isHorizontalSwipeRef.current = null;
    movedRef.current = false;
    dragStartTimeRef.current = Date.now();
    setIsDragging(true);
  };

  const handleDragMove = (x: number, y: number) => {
    if (startXRef.current === null || startYRef.current === null) return;

    const diffX = x - startXRef.current;
    const diffY = y - startYRef.current;

    // 방향이 아직 결정되지 않은 경우: 더 많이 움직인 방향으로 결정
    if (isHorizontalSwipeRef.current === null) {
      const absDiffX = Math.abs(diffX);
      const absDiffY = Math.abs(diffY);
      if (absDiffX > 8 || absDiffY > 8) {
        isHorizontalSwipeRef.current = absDiffX > absDiffY;
      }
      return; // 방향 결정 전엔 이동 안 함
    }

    if (!isHorizontalSwipeRef.current) return; // 수직 스크롤이면 아무것도 안 함

    movedRef.current = true;

    if (diffX < 0) {
      // 왼쪽 스와이프: 삭제 버튼 노출
      setOffset(Math.max(diffX, -80));
    } else if (diffX > 0 && currentOffsetRef.current < 0) {
      // 이미 열린 상태에서 오른쪽으로 닫기
      setOffset(Math.min(0, currentOffsetRef.current + diffX));
    }
  };

  const handleDragEnd = (x: number, y: number) => {
    setIsDragging(false);
    if (startXRef.current === null || startYRef.current === null) return;

    const diffX = x - startXRef.current;
    const diffY = y - startYRef.current;
    const dragDuration = Date.now() - dragStartTimeRef.current;

    startXRef.current = null;
    startYRef.current = null;

    // 탭 판정: 시간 짧고, X/Y 이동 모두 작고, 실제 드래그가 없었을 때
    const isTap =
      dragDuration < TAP_DURATION &&
      Math.abs(diffX) < TAP_THRESHOLD &&
      Math.abs(diffY) < TAP_THRESHOLD &&
      !movedRef.current;

    if (isTap) {
      if (currentOffsetRef.current < 0) {
        // 이미 열린 상태이면 닫기만 (edit 호출 안 함)
        setOffset(0);
      } else {
        // 닫힌 상태일 때만 edit 호출
        if (onEdit) onEdit();
      }
      return;
    }

    // 스냅 로직: 절반 이상 열렸으면 완전히 열기, 아니면 닫기
    if (currentOffsetRef.current < -40) {
      setOffset(-80);
    } else {
      setOffset(0);
    }
  };

  // ── Touch handlers ──
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    handleDragEnd(touch.clientX, touch.clientY);
  };

  // ── Mouse handlers (데스크톱 지원) ──
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (startXRef.current === null) return;
    handleDragMove(e.clientX, e.clientY);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (startXRef.current === null) return;
    handleDragEnd(e.clientX, e.clientY);
  };
  const handleMouseLeave = (e: React.MouseEvent) => {
    if (startXRef.current !== null) {
      handleDragEnd(e.clientX, e.clientY);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-red-500 shadow-sm border border-red-500">
      {/* 뒤에 숨겨진 삭제 버튼 */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-center w-[80px]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
            setOffset(0);
          }}
          className="w-full h-full flex flex-col items-center justify-center text-white bg-red-500 transition-colors hover:bg-red-600 active:bg-red-700"
        >
          <Trash2 className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">삭제</span>
        </button>
      </div>

      {/* 앞면 카드 콘텐츠 */}
      <div
        className={`relative z-10 w-full bg-white h-full ${
          isDragging ? '' : 'transition-transform duration-200 ease-out'
        }`}
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
