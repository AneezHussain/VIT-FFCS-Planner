// Global type declarations

interface Window {
  gapi: any;
}

declare global {
  interface Window {
    gapi: any;
  }
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

export {}; 