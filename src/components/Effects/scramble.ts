// Svelte Action Directive for Text Scrambling Glitch Effect

interface ScrambleParams {
  text: string;
  speed?: number;
  delay?: number;
}

export function scramble(node: HTMLElement, params: ScrambleParams) {
  let interval: any;
  let text = params.text;
  let speed = params.speed ?? 25;
  let delay = params.delay ?? 0;
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*_+?/';

  function start() {
    clearInterval(interval);
    let frame = 0;
    const maxFrames = Math.min(text.length * 3, 60);

    setTimeout(() => {
      interval = setInterval(() => {
        if (frame >= maxFrames) {
          node.innerText = text;
          clearInterval(interval);
          return;
        }

        node.innerText = text.split('').map((char, index) => {
          if (char === ' ') return ' ';
          const progress = frame / maxFrames;
          if (index / text.length < progress) {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');

        frame += 1;
      }, speed);
    }, delay);
  }

  start();

  return {
    update(newParams: ScrambleParams) {
      if (newParams.text !== text) {
        text = newParams.text;
        speed = newParams.speed ?? 25;
        delay = newParams.delay ?? 0;
        start();
      }
    },
    destroy() {
      clearInterval(interval);
    }
  };
}
