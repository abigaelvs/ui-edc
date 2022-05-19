
export type SerialOptions = {
    baudRate?: number;
    dataBits?: number;
    stopBits?: number;
    parity?: string;
  };
  
interface SerialPortInfo {
  readonly usbVendorId: string;
  readonly usbProductId: string;
}

export interface SerialPort {
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  readonly readable: ReadableStream;
  readonly writable: WritableStream;
  readonly in: ReadableStream;
  readonly out: WritableStream;
  getInfo(): SerialPortInfo;
}
  
declare global {
  export const ParityType: {
    NONE: "none";
    EVEN: "even";
    ODD: "odd";
    MARK: "mark";
    SPACE: "space";
  };

  interface Navigator {
    serial: {
      requestPort(options: {}): Promise<SerialPort>;
      getPorts(): Promise<Iterable<SerialPort>>;
    };
  }
}
  