

type KeyState = {
  up: boolean;
  down: boolean;
  press: boolean;
}

export type KeyboardKeyState = {
  [key: string]: KeyState;
};

export type KeyboardState = {
  prev: KeyboardKeyState;
  curr: KeyboardKeyState;
}


export class KeyboardManager {
  static state: KeyboardState

  static init(){
    KeyboardManager.state = { prev:{}, curr:{}};
    window.addEventListener('keydown', KeyboardManager.handleKeyDown);
    window.addEventListener('keyup', KeyboardManager.handleKeyUp);
    window.addEventListener('keypress', KeyboardManager.handleKeyPress);
  }

  static handleKeyDown(event: KeyboardEvent){
    console.log('km:hkd::',event);
    KeyboardManager.state.curr[event.key].down = true;
  }

  static handleKeyUp(event: KeyboardEvent){
    console.log('km:hku::',event);
  }

  static handleKeyPress(event: KeyboardEvent){
    console.log('km:hkp::',event);
  }
}
