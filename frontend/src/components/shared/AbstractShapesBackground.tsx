const AbstractShapesBackground = () => {
  const shapes = [
    {
      id: 1,
      color: '#F4A28D',
      rotate: 'rotate(12deg)',
      m: { top: '2.5rem', left: '1.25rem', size: 'w-12 h-12' },
      d: { top: '5rem', left: '2.5rem', size: 'md:w-32 md:h-32' },
    },
    {
      id: 2,
      color: '#2C3E50',
      rotate: 'rotate(-12deg)',
      m: { top: '5rem', right: '1.25rem', size: 'w-10 h-10' },
      d: { top: '10rem', right: '2.5rem', size: 'md:w-24 md:h-24' },
    },
    {
      id: 3,
      color: '#87CEEB',
      rotate: 'rotate(45deg)',
      m: { top: '7.5rem', left: '25%', size: 'w-10 h-10' },
      d: { top: '15rem', left: '25%', size: 'md:w-28 md:h-28' },
    },
    {
      id: 4,
      color: '#4CAF50',
      rotate: 'rotate(-30deg)',
      m: { top: '10rem', right: '1.25rem', size: 'w-14 h-14' },
      d: { top: '20rem', right: '33.333333%', size: 'md:w-36 md:h-36' },
    },
    {
      id: 5,
      color: '#FFD700',
      rotate: 'rotate(60deg)',
      m: { top: '1.25rem', right: '50%', size: 'w-8 h-8' },
      d: { top: '8rem', right: '50%', size: 'md:w-20 md:h-20' },
    },
    {
      id: 6,
      color: '#FF69B4',
      rotate: 'rotate(-45deg)',
      m: { top: '12.5rem', left: '33.333333%', size: 'w-12 h-12' },
      d: { top: '1.75rem', left: '60%', size: 'md:w-[7.5rem] md:h-[7.5rem]' },
    },
  ];

  return (
    <div
      className="abstract-shapes-container absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {shapes.map((s) => (
        <div
          key={s.id}
          className={`absolute rounded-full opacity-20 transition-none ${s.m.size} ${s.d.size} shape-node-${s.id}`}
          style={{
            backgroundColor: s.color,
            transform: `${s.rotate} translateZ(0)`,

            top: s.m.top,
            left: s.m.left || 'auto',
            right: s.m.right || 'auto',
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @media (min-width: 768px) {
              .shape-node-${s.id} {
                top: ${s.d.top} !important;
                left: ${s.d.left || 'auto'} !important;
                right: ${s.d.right || 'auto'} !important;
              }
            }
          `,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default AbstractShapesBackground;
