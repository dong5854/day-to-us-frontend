import { useRef, useEffect, type FC, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SNAP_OPEN = -80;
const SNAP_THRESHOLD = -40;
const TAP_MAX_DISTANCE = 8;
const TAP_MAX_DURATION = 250;

export const SwipeableCard: FC<Props> = ({ children, onEdit, onDelete }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0); // 현재 스냅된 offset (state 없이 ref로 관리)

  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    directionLocked: false, // true = 수평 확정
    isVertical: false,      // true = 수직 스크롤 확정 → 무시
  });

  const setTransform = (x: number, animated: boolean) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = animated ? 'transform 0.22s ease-out' : 'none';
    el.style.transform = `translateX(${x}px)`;
  };

  const snapTo = (x: number) => {
    offsetRef.current = x;
    setTransform(x, true);
  };

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      drag.current = {
        active: true,
        startX: t.clientX,
        startY: t.clientY,
        startTime: Date.now(),
        directionLocked: false,
        isVertical: false,
      };
      // transition 즉시 제거 → 손가락 움직임에 지연 없이 즉각 반응
      el.style.transition = 'none';
    };

    const onTouchMove = (e: TouchEvent) => {
      const d = drag.current;
      if (!d.active || d.isVertical) return;

      const t = e.touches[0];
      const diffX = t.clientX - d.startX;
      const diffY = t.clientY - d.startY;

      // 방향 미확정: 최소 이동 후 판단
      if (!d.directionLocked) {
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);
        if (absX < 6 && absY < 6) return;
        if (absY > absX) {
          d.isVertical = true; // 수직 스크롤 → 이후 무시
          return;
        }
        d.directionLocked = true;
      }

      const newX = Math.max(SNAP_OPEN, Math.min(0, offsetRef.current + diffX));
      // rAF 없이 직접 DOM 조작 → 최저 지연, 가장 부드러운 추적
      el.style.transform = `translateX(${newX}px)`;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const d = drag.current;
      if (!d.active) return;
      d.active = false;

      const t = e.changedTouches[0];
      const diffX = t.clientX - d.startX;
      const diffY = t.clientY - d.startY;
      const duration = Date.now() - d.startTime;

      // 탭 판정: X·Y 이동 모두 작고 시간이 짧을 때
      const isTap =
        duration < TAP_MAX_DURATION &&
        Math.abs(diffX) < TAP_MAX_DISTANCE &&
        Math.abs(diffY) < TAP_MAX_DISTANCE;

      if (isTap) {
        if (offsetRef.current < 0) {
          snapTo(0); // 열린 상태 → 닫기만
        } else {
          if (onEdit) onEdit(); // 닫힌 상태 → 수정
        }
        return;
      }

      if (!d.directionLocked) return; // 수직 스크롤이었으면 스냅 안 함

      // el.style.transform 에서 현재 위치 직접 읽기 (getComputedStyle보다 빠름)
      const matrix = new DOMMatrix(el.style.transform);
      snapTo(matrix.m41 < SNAP_THRESHOLD ? SNAP_OPEN : 0);
    };

    // passive: true → 브라우저가 스크롤을 JS 없이 즉시 처리
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEdit, onDelete]);

  // ── 마우스 이벤트 (데스크톱) ──
  const mouse = useRef({ down: false, startX: 0, moved: false });

  const handleMouseDown = (e: React.MouseEvent) => {
    mouse.current = { down: true, startX: e.clientX, moved: false };
    const el = cardRef.current;
    if (el) el.style.transition = 'none';
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouse.current.down) return;
    const diffX = e.clientX - mouse.current.startX;
    if (Math.abs(diffX) > 4) mouse.current.moved = true;
    const newX = Math.max(SNAP_OPEN, Math.min(0, offsetRef.current + diffX));
    const el = cardRef.current;
    if (el) el.style.transform = `translateX(${newX}px)`;
  };
  const handleMouseUpOrLeave = () => {
    if (!mouse.current.down) return;
    mouse.current.down = false;
    if (!mouse.current.moved) {
      if (offsetRef.current < 0) snapTo(0);
      else if (onEdit) onEdit();
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    const matrix = new DOMMatrix(el.style.transform);
    snapTo(matrix.m41 < SNAP_THRESHOLD ? SNAP_OPEN : 0);
  };

  return (
    // outer: bg 없음(투명) → 빠른 스크롤 시 빨간 박스 비침 제거
    // isolation: isolate → GPU 합성 레이어 분리, overflow-hidden 클리핑 보장
    <div
      className="relative overflow-hidden rounded-xl shadow-sm"
      style={{ isolation: 'isolate' }}
    >
      {/* 삭제 버튼 — 카드 뒤에 숨어있다가 스와이프 시 노출 */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-center w-[80px] bg-red-500">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
            snapTo(0);
          }}
          className="w-full h-full flex flex-col items-center justify-center text-white hover:bg-red-600 active:bg-red-700 transition-colors"
        >
          <Trash2 className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">삭제</span>
        </button>
      </div>

      {/* 카드 본체
          touch-action: pan-y → 수직 스크롤은 브라우저가 네이티브로 처리 */}
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
