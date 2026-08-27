import { useRef, type FC, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SNAP_OPEN = -80;       // 완전히 열렸을 때 X offset (px)
const SNAP_THRESHOLD = -40;  // 이 이상 열리면 스냅 오픈, 미만이면 스냅 닫힘
const TAP_THRESHOLD = 8;     // 탭으로 인정할 최대 이동 거리 (px)
const TAP_DURATION = 250;    // 탭으로 인정할 최대 지속 시간 (ms)
const DIRECTION_THRESHOLD = 8; // 방향 결정에 필요한 최소 이동 거리 (px)

export const SwipeableCard: FC<Props> = ({ children, onEdit, onDelete }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const currentOffsetRef = useRef(0);  // 현재 열림 위치 (스냅된 값)
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const dragStartTimeRef = useRef<number>(0);
  const isHorizontalRef = useRef<boolean | null>(null);
  const movedRef = useRef(false);

  // React state 없이 DOM을 직접 조작해 리렌더링 없이 부드럽게 이동
  const applyTransform = (offset: number, animated: boolean) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = animated ? 'transform 0.2s ease-out' : 'none';
    el.style.transform = `translateX(${offset}px)`;
  };

  const snapTo = (offset: number) => {
    currentOffsetRef.current = offset;
    applyTransform(offset, true);
  };

  // ── 공통 드래그 로직 ──
  const onDragStart = (x: number, y: number) => {
    startXRef.current = x;
    startYRef.current = y;
    isHorizontalRef.current = null;
    movedRef.current = false;
    dragStartTimeRef.current = Date.now();
    // 드래그 시작 시 transition 제거 (즉각 반응)
    applyTransform(currentOffsetRef.current, false);
  };

  const onDragMove = (x: number, y: number) => {
    if (startXRef.current === null || startYRef.current === null) return;

    const diffX = x - startXRef.current;
    const diffY = y - startYRef.current;

    // 방향 미결정 구간: 임계값 이상 움직여야 방향 확정
    if (isHorizontalRef.current === null) {
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);
      if (absX < DIRECTION_THRESHOLD && absY < DIRECTION_THRESHOLD) return;
      isHorizontalRef.current = absX > absY;
    }

    if (!isHorizontalRef.current) return; // 수직 스크롤이면 무시

    movedRef.current = true;

    // 현재 스냅 위치에서 delta를 더해 새 offset 계산
    const newOffset = Math.max(SNAP_OPEN, Math.min(0, currentOffsetRef.current + diffX));
    applyTransform(newOffset, false);
  };

  const onDragEnd = (x: number, y: number) => {
    if (startXRef.current === null || startYRef.current === null) return;

    const diffX = x - startXRef.current;
    const diffY = y - startYRef.current;
    const duration = Date.now() - dragStartTimeRef.current;

    startXRef.current = null;
    startYRef.current = null;

    // 탭 판정: 시간·이동거리 모두 작고 실제 드래그 없었을 때
    const isTap =
      duration < TAP_DURATION &&
      Math.abs(diffX) < TAP_THRESHOLD &&
      Math.abs(diffY) < TAP_THRESHOLD &&
      !movedRef.current;

    if (isTap) {
      if (currentOffsetRef.current < 0) {
        snapTo(0); // 열린 상태면 닫기만
      } else {
        if (onEdit) onEdit(); // 닫힌 상태일 때만 수정
      }
      return;
    }

    if (!isHorizontalRef.current) return; // 수직 스크롤이었으면 스냅 안 함

    // 현재 offset 기준으로 스냅 결정
    const el = cardRef.current;
    if (!el) return;
    const currentTransformX = new DOMMatrix(getComputedStyle(el).transform).m41;

    if (currentTransformX < SNAP_THRESHOLD) {
      snapTo(SNAP_OPEN);
    } else {
      snapTo(0);
    }
  };

  // ── Touch 이벤트 ──
  const handleTouchStart = (e: React.TouchEvent) => {
    onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    onDragMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  };

  // ── Mouse 이벤트 (데스크톱) ──
  const handleMouseDown = (e: React.MouseEvent) => {
    onDragStart(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (startXRef.current === null) return;
    onDragMove(e.clientX, e.clientY);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (startXRef.current === null) return;
    onDragEnd(e.clientX, e.clientY);
  };
  const handleMouseLeave = (e: React.MouseEvent) => {
    if (startXRef.current !== null) {
      onDragEnd(e.clientX, e.clientY);
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
            snapTo(0);
          }}
          className="w-full h-full flex flex-col items-center justify-center text-white bg-red-500 transition-colors hover:bg-red-600 active:bg-red-700"
        >
          <Trash2 className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">삭제</span>
        </button>
      </div>

      {/* 앞면 카드 — ref로 DOM 직접 조작, React 리렌더링 없이 부드러운 애니메이션 */}
      <div
        ref={cardRef}
        className="relative z-10 w-full bg-white h-full"
        style={{ transform: 'translateX(0px)', willChange: 'transform' }}
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
