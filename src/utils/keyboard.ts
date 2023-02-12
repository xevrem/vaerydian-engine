import { KeyType } from './constants';

type KeyState = {
  up: boolean;
  down: boolean;
  press: boolean;
};

export type KeyboardKeyState = {
  [key: string]: KeyState;
};

export type KeyboardState = {
  prev: KeyboardKeyState;
  curr: KeyboardKeyState;
};

export class KeyboardManager {
  static state: KeyboardState;

  static init(): void {
    KeyboardManager.state = { prev: {}, curr: {} };
    window.addEventListener('keydown', KeyboardManager.handleKeyDown, {
      passive: true,
    });
    window.addEventListener('keyup', KeyboardManager.handleKeyUp, {
      passive: true,
    });
    window.addEventListener('keypress', KeyboardManager.handleKeyPress, {
      passive: true,
    });
  }

  static preProcess(event: KeyboardEvent): void {
    if (!KeyboardManager.state.curr.hasOwnProperty(event.key)) {
      KeyboardManager.state.curr[event.key] = {
        up: false,
        down: false,
        press: false,
      };
    }
    KeyboardManager.state.prev = KeyboardManager.state.curr;
  }

  static handleKeyDown(event: KeyboardEvent): void {
    // console.log('km:hkd::', event);
    KeyboardManager.preProcess(event);
    KeyboardManager.state.curr[event.key].down = true;
    KeyboardManager.state.curr[event.key].up = false;
  }

  static handleKeyUp(event: KeyboardEvent): void {
    // console.log('km:hku::', event);
    KeyboardManager.preProcess(event);
    KeyboardManager.state.curr[event.key].up = true;
    KeyboardManager.state.curr[event.key].down = false;
    KeyboardManager.state.curr[event.key].press = false;
  }

  static handleKeyPress(event: KeyboardEvent): void {
    // console.log('km:hkp::', event);
    KeyboardManager.preProcess(event);
    KeyboardManager.state.curr[event.key].press = true;
    KeyboardManager.state.curr[event.key].up = false;
  }

  static isKeyPressed(key: KeyType): boolean {
    // console.log(key, KeyboardManager.state);
    return (
      (KeyboardManager?.state?.curr?.[key]?.press ?? false) &&
      (KeyboardManager?.state?.prev?.[key]?.press ?? false)
    );
  }
}
