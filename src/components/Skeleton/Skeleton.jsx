import style from "./_skeleton.module.css";

function Skeleton({ width, height, radius, circle = false, className = "" }) {
  return (
    <span
      className={`${style.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? "50%" : radius,
      }}
    />
  );
}

export function SkeletonCard({ lines = 1, chart = false, grande = false }) {
  return (
    <div className={`${style.card} ${grande ? style.cardGrande : ""}`}>
      <div className={style.cardHead}>
        <Skeleton width="45%" height={12} />
        <Skeleton width={36} height={36} radius={12} />
      </div>

      {chart ? (
        <Skeleton
          width="100%"
          height={typeof chart === "number" ? chart : 240}
          radius={12}
        />
      ) : (
        <>
          <Skeleton width="60%" height={28} />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} width={i === lines - 1 ? "40%" : "80%"} height={12} />
          ))}
        </>
      )}
    </div>
  );
}

export default Skeleton;
