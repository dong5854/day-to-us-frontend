import { useRef, useEffect, type FC, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SNAP_OPEN = -80;
const SNAP_THRESHOLD = -40;
const TAP_MAX_DISTANCE = 8;   // px — 이 이하면 탭으로 인정
const TAP_MAX_DURATION = 250; // ms — 이 이하면 탭으로 인정

export const SwipeableCard: FC<Props> = ({ children, onEdit, onDelete }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // 드래그 상태 (모두 ref로 관리 — setState 호출 없음)
  const state = useRef({
    offsetX: 0,          // 현재 스냅된 위치
    startX: 0,
    startY: 0,
    active: false,
    startTime: 0,
    maxDiffX: 0,
    maxDiffY: 0,
    pendingX: 0,         // rAF에서 적용할 다음 transform 값
    directionLocked: false, // 방향 확정 여부 (horizontal)
  }).current;

  const setTransform = (x: number, animated: boolean) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = animated ? 'transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    el.style.transform = `translateX(${x}px)`;
  };

  const snapTo = (x: number) => {
    state.offsetX = x;
    setTransform(x, true);
  };

  // rAF 루프: 드래그 중 매 프레임마다 transform 적용
  const scheduleUpdate = (newX: number) => {
    state.pendingX = newX;
    if (rafRef.current !== null) return; // 이미 예약됨
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setTransform(state.pendingX, false);
    });
  };

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      state.startX = t.clientX;
      state.startY = t.clientY;
      state.active = true;
      state.startTime = Date.now();
      state.maxDiffX = 0;
      state.maxDiffY = 0;
      state.directionLocked = false;
      // 드래그 시작 시 transition 즉시 제거
      el.style.transition = 'none';
    };

    // passive: true → 브라우저가 스크롤을 JS 없이 즉시 처리 (jank 제거)
    const onTouchMove = (e: TouchEvent) => {
      if (!state.active) return;
      const t = e.touches[0];
      const diffX = t.clientX - state.startX;
      const diffY = t.clientY - state.startY;

      state.maxDiffX = Math.max(state.maxDiffX, Math.abs(diffX));
      state.maxDiffY = Math.max(state.maxDiffY, Math.abs(diffY));

      // 수직 이동이 우세하면 무시 (touch-action: pan-y 와 이중 보호)
      if (!state.directionLocked) {
        if (state.maxDiffX < 6 && state.maxDiffY < 6) return;
        if (state.maxDiffY > state.maxDiffX) {
          state.active = false; // 수직 스크롤로 판정 → 이후 move 무시
          return;
        }
        state.directionLocked = true;
      }

      const newX = Math.max(SNAP_OPEN, Math.min(0, state.offsetX + diffX));
      scheduleUpdate(newX);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!state.active) return;
      state.active = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const t = e.changedTouches[0];
      const diffX = t.clientX - state.startX;
      const diffY = t.clientY - state.startY;
      const duration = Date.now() - state.startTime;

      // 탭 판정
      const isTap =
        duration < TAP_MAX_DURATION &&
        Math.abs(diffX) < TAP_MAX_DISTANCE &&
        Math.abs(diffY) < TAP_MAX_DISTANCE;

      if (isTap) {
        if (state.offsetX < 0) {
          snapTo(0);
        } else {
          if (onEdit) onEdit();
        }
        return;
      }

      if (!state.directionLocked) return;

      // 현재 transform 읽어서 스냅 결정
      const matrix = new DOMMatrix(getComputedStyle(el).transform);
      if (matrix.m41 < SNAP_THRESHOLD) {
        snapTo(SNAP_OPEN);
      } else {
        snapTo(0);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEdit, onDelete]);

  // ── 마우스 이벤트 (데스크톱) ──
  const mouse = useRef({ down: false, startX: 0, moved: false });

  const handleMouseDown = (e: React.MouseEvent) => {
    mouse.current = { down: true, startX: e.clientX, moved: false };
    setTransform(state.offsetX, false);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouse.current.down) return;
    const diffX = e.clientX - mouse.current.startX;
    if (Math.abs(diffX) > 4) mouse.current.moved = true;
    const newX = Math.max(SNAP_OPEN, Math.min(0, state.offsetX + diffX));
    scheduleUpdate(newX);
  };
  const handleMouseUpOrLeave = (_e: React.MouseEvent) => {
    if (!mouse.current.down) return;
    mouse.current.down = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (!mouse.current.moved) {
      if (state.offsetX < 0) snapTo(0);
      else if (onEdit) onEdit();
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    if (matrix.m41 < SNAP_THRESHOLD) snapTo(SNAP_OPEN);
    else snapTo(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-red-500 shadow-sm border border-red-500">
      {/* 삭제 버튼 */}
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

      {/* 카드 본체
          touch-action: pan-y → 브라우저가 수직 스크롤을 JS 개입 없이 즉시 처리
          will-change: transform → GPU 레이어로 분리 */}
      <div
        ref={cardRef}
        className="relative z-10 w-full bg-white h-full select-none"
        style={{
          transform: 'translateX(0px)',
          willChange: 'transform',
          touchAction: 'pan-y',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {children}
      </div>
    </div>
  );
};
