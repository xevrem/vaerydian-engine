declare module 'url:*' {
  type URLString = string;
  export default URLString;
}

declare module '*.png' {
  const value: any;
  export = value;
}




