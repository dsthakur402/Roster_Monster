declare module 'vite-plugin-copy' {
    export const copy: (options: { targets: Array<{ src: string | string[], dest: string }> }) => any;
} 