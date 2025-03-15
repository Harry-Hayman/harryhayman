// Type definitions for jsmediatags
declare module 'jsmediatags' {
  interface Picture {
    data: number[];
    format: string;
  }

  interface Tags {
    title: string;
    artist: string;
    picture?: Picture;
  }

  interface ID3Tags {
    tags: Tags;
  }

  interface Callbacks {
    onSuccess: (tags: ID3Tags) => void;
    onError: (error: Error) => void;
  }

  function read(url: string, callbacks: Callbacks): void;
}

declare const jsmediatags: {
  read: typeof read;
};