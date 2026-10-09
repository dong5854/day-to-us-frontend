import { useRef, useEffect, type FC, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SNAP_OPEN = -80;
const SNAP_THRESHOLD = -40;   // 위치 기반 스냅 임계값
const VELOCITY_THRESHOLD = 0.3; // px/ms — 이 이상 빠른 플릭은 즉시 스냅
const TAP_MAX_DISTANCE = 8;
const TAP_MAX_DURATION = 250;

// 스프링 이징: 목표를 살짝 지나쳤다 돌아오는 쫀쫀한 느낌
const SPRING_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
// 닫힐 때: 부드럽게 슥 닫히는 느낌
const CLOSE_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

export const SwipeableCard: FC<Props> = ({ children, onEdit, onDelete }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    directionLocked: false,
    isVertical: false,
  });

  // 속도 계산용: 최근 터치 포인트 기록
  const recentTouches = useRef<{ x: number; t: number }[]>([]);

  const setTransform = (x: number, easing: string, duration: number) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = `transform ${duration}ms ${easing}`;
    el.style.transform = `translateX(${x}px)`;
  };

  const snapTo = (x: number) => {
    offsetRef.current = x;
    const isOpening = x < 0;
    if (isOpening) {
      setTransform(x, SPRING_EASING, 380); // 열릴 때: 스프링감
    } else {
      setTransform(x, CLOSE_EASING, 250);  // 닫힐 때: 부드럽게
    }
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
      recentTouches.current = [{ x: t.clientX, t: Date.now() }];
      el.style.transition = 'none';
    };

    const onTouchMove = (e: TouchEvent) => {
      const d = drag.current;
      if (!d.active || d.isVertical) return;

      const t = e.touches[0];
      const diffX = t.clientX - d.startX;
      const diffY = t.clientY - d.startY;

      if (!d.directionLocked) {
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);
        if (absX < 6 && absY < 6) return;
        if (absY > absX) {
          d.isVertical = true;
          return;
        }
        d.directionLocked = true;
      }

      // 최근 터치 기록 (최대 6개, 약 100ms치)
      const now = Date.now();
      recentTouches.current.push({ x: t.clientX, t: now });
      if (recentTouches.current.length > 6) recentTouches.current.shift();

      const newX = Math.max(SNAP_OPEN, Math.min(0, offsetRef.current + diffX));
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

      // 탭 판정
      const isTap =
        duration < TAP_MAX_DURATION &&
        Math.abs(diffX) < TAP_MAX_DISTANCE &&
        Math.abs(diffY) < TAP_MAX_DISTANCE;

      if (isTap) {
        if (offsetRef.current < 0) snapTo(0);
        else if (onEdit) onEdit();
        return;
      }

      if (!d.directionLocked) return;

      // 속도 계산: 최근 포인트들로 px/ms 속도 산출
      let velocity = 0;
      const pts = recentTouches.current;
      if (pts.length >= 2) {
        const oldest = pts[0];
        const newest = pts[pts.length - 1];
        const dt = newest.t - oldest.t;
        if (dt > 0) velocity = (newest.x - oldest.x) / dt;
      }

      // 속도 기반 스냅 (거리 무관 — 플릭하면 즉시 스냅)
      if (velocity < -VELOCITY_THRESHOLD) {
        snapTo(SNAP_OPEN); // 빠르게 왼쪽 → 열기
        return;
      }
      if (velocity > VELOCITY_THRESHOLD) {
        snapTo(0); // 빠르게 오른쪽 → 닫기
        return;
      }

      // 위치 기반 스냅
      const matrix = new DOMMatrix(el.style.transform);
      snapTo(matrix.m41 < SNAP_THRESHOLD ? SNAP_OPEN : 0);
    };

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
    <div
      className="relative overflow-hidden rounded-xl shadow-sm"
      style={{ isolation: 'isolate' }}
    >
      {/* 삭제 버튼 */}
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

      {/* 카드 본체 */}
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
