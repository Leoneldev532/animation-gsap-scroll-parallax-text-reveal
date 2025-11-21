document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(SplitText, ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on("scroll", ScrollTrigger.update);

  const lines = document.querySelectorAll(".line");

  const moreInfos = document.querySelectorAll(".more-info h2");

  const splitWords = Array.from(moreInfos).map((h2) =>
    SplitText.create(h2, { type: "words" })
  );

  const LINE_HEIGHT = lines[0]?.offsetHeight || 0;
  const CLIP_PERCENTAGE = 84;
  const Y_OFFSET = (LINE_HEIGHT * (100 - CLIP_PERCENTAGE)) / 100;

  const linesArray = Array.from(lines);

  lines.forEach((line, index) => {
    gsap.set(line, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });

    const tlEnter = gsap.timeline({ paused: true });
    const tlLeave = gsap.timeline({ paused: true });

    const followingLines = linesArray.slice(index + 1);
    const currentOffset = -Y_OFFSET * (index + 1);
    const previousOffset = -Y_OFFSET * index;

    tlEnter
      .to(
        line,
        {
          clipPath: `polygon(0% 0%, 100% 0%, 100% ${CLIP_PERCENTAGE}%, 0% ${CLIP_PERCENTAGE}%)`,
          duration: 0.8,
          ease: "power2.out",
        },
        0
      )
      .to(
        followingLines,
        {
          y: currentOffset,
          duration: 0.8,
          ease: "power2.out",
        },
        0
      );

    const moreInfoH2s = line.querySelectorAll(".more-info h2");
    moreInfoH2s.forEach((h2, i) => {
      const split = splitWords.find((s) => s.elements[0] === h2);
      if (split) {
        tlEnter.to(
          split.words,
          {
            y: 0,
            opacity: 1,
            stagger: 0.02,
            duration: 0.2,
            ease: "power2.out",
          },
          i * 0.1
        );
      }
    });

    tlLeave
      .to(
        line,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.8,
          ease: "power2.out",
        },
        0
      )
      .to(
        followingLines,
        {
          y: previousOffset,
          duration: 0.8,
          ease: "power2.out",
        },
        0
      );

    moreInfoH2s.forEach((h2, i) => {
      const split = splitWords.find((s) => s.elements[0] === h2);
      if (split) {
        tlLeave.to(split.words, {
          y: 20,
          opacity: 0,
          duration: 0.1,
          ease: "power2.in",
        });
      }
    });

    ScrollTrigger.create({
      trigger: line,
      start: "top 70%",
      end: "+=200",

      onEnter: () => tlEnter.restart(),
      onLeaveBack: () => tlLeave.restart(),
    });
  });
});
