/// <reference types="node" />

declare namespace firebase {
  export function generateKey(): string;
  export const auth: any;
  export const provider: any;

  export interface api {
    load(path: string): Promise<any>; // any refers to the snapshot that firebase returns. not sure what type it is
    create(key: string, data: object): Promise<void>;
    save(path: string, data: object): Promise<void>;
    add(path: string, data: object): Promise<any>;
    remove(path: string): Promise<void>;
  }
}