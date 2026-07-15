<script lang="ts">
  export let color: string = '#ffffff';
  export let density: number = 48;
  export let opacity: number = 0.07;
  export let origin: 'center' | 'bottom-center' | 'top-center' | 'left-center' = 'center';
  export let animated: boolean = false;

  const originMap = {
    'center':        { cx: 50, cy: 50 },
    'bottom-center': { cx: 50, cy: 90 },
    'top-center':    { cx: 50, cy: 10 },
    'left-center':   { cx: 10, cy: 50 },
  };

  $: ({ cx, cy } = originMap[origin] || originMap['center']);

  $: lines = Array.from({ length: density }, (_, i) => {
    const angle = (i / density) * 360;
    const rad = (angle * Math.PI) / 180;
    const nearDist = 5 + (i % 3) * 3;
    const farDist = 90 + (i % 5) * 4;
    const x1 = cx + Math.cos(rad) * nearDist;
    const y1 = cy + Math.sin(rad) * nearDist;
    const x2 = cx + Math.cos(rad) * farDist;
    const y2 = cy + Math.sin(rad) * farDist;
    const w = i % 4 === 0 ? 0.6 : i % 7 === 0 ? 0.9 : 0.3;
    return { x1, y1, x2, y2, w };
  });
</script>

<svg class="mg-sl" viewBox="0 0 100 100" preserveAspectRatio="none"
     style="position: absolute; inset: -20%; width: 140%; height: 140%; pointer-events: none; opacity: {opacity}; z-index: 0; {animated ? 'animation: mgSpin 24s linear infinite;' : ''}"
     aria-hidden="true">
  {#each lines as line}
    <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={color} stroke-width={line.w} vector-effect="non-scaling-stroke" />
  {/each}
</svg>
