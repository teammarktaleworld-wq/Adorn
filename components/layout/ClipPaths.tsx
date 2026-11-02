// Shared clip shapes (object bounding box units), used by arch frames across the site.
export function ClipPaths() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        {/* Mughal cusped arch: a pointed top made of small lobes */}
        <clipPath id="clip-arch" clipPathUnits="objectBoundingBox">
          <path d="M0 1V.36C0 .3.02.25.06.22.05.18.08.14.12.13.13.09.17.06.22.06.25.03.29.02.33.03.37 0 .43-.01.5-.04.57-.01.63 0 .67.03.71.02.75.03.78.06.83.06.87.09.88.13.92.14.95.18.94.22.98.25 1 .3 1 .36V1Z" />
        </clipPath>
        {/* Rounded jharokha window */}
        <clipPath id="clip-jharokha" clipPathUnits="objectBoundingBox">
          <path d="M0 1V.42C0 .19.22 0 .5 0S1 .19 1 .42V1Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
