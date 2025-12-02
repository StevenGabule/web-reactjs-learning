/* eslint-disable @typescript-eslint/no-explicit-any */

interface Window {
  dataLayer?: any[];
  gtag: (command: any, ...rest: any[]) => void;
}
