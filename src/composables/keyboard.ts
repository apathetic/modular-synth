import { EVENT } from '@/events';

interface UseKeyboardProps {
  noteOn: (note: number, vel: number) => void;
  noteOff: (note: number) => void;
}

/**
 * Use the computer keboard to send noteOn events
 * @param {object} props A reactive alias for the
 * @param {Function} props.noteOn
 * @param {Function} props.noteOff
 */
export function useKeyboard({ noteOn, noteOff }: UseKeyboardProps) {

  function keydown(evt: KeyboardEvent) {
    switch (evt.code) {
      case 'KeyA':
        noteOn(63, 127);
        break;
      case 'KeyS':
        noteOn(65, 127);
        break;
      case 'KeyD':
        noteOn(66, 127);
        break;
      case 'KeyF':
        noteOn(68, 127);
        break;
      case 'KeyG':
        noteOn(70, 127);
        break;

      default:
        break;
    }
  }

  function keyup(evt: KeyboardEvent) {
    switch (evt.code) {
      case 'KeyA':
        noteOff(63);
        break;
      case 'KeyS':
        noteOff(65);
        break;
      case 'KeyD':
        noteOff(66);
        break;
      case 'KeyF':
        noteOff(68);
        break;
      case 'KeyG':
        noteOff(70);
        break;

      default:
        break;
    }
  }

  function unsubscribe() {
    window.removeEventListener(EVENT.KEY_DOWN, keydown as EventListener);
    window.removeEventListener(EVENT.KEY_UP, keyup as EventListener);
  }

  window.addEventListener(EVENT.KEY_DOWN, keydown as EventListener);
  window.addEventListener(EVENT.KEY_UP, keyup as EventListener);

  return unsubscribe;
}
