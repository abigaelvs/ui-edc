import { Component } from '@angular/core';

import { EdcService } from './edc.service';
import { EdcGenerateMessageRequest, EdcGenerateMessageResponse, EdcParseMessageRequest } from './edc';
import { SerialPort, SerialOptions } from './serial';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-edc';

  constructor(private edcService: EdcService) {}

  parseMessage(bank: string, body: EdcParseMessageRequest) {
    this.edcService.parseMessage(bank, body).subscribe(
      result => {
        console.log("=== EDC RESPONSE ===");
        console.log(result);
      }
    )
  }

  generateMessage(bank: string, body: EdcGenerateMessageRequest) {
    let edc: EdcGenerateMessageResponse = {}
    this.edcService.generateMessage(bank, body).toPromise().then(
      result => {
        edc = result!;
      }
    )
    return edc;
  }

  async triggerBni() {
    const bank: string = "BNI";
    let body = {
      transaction_type: "Sale",
      amount: 1,
      edc_id: 76
    };

    let edc: EdcGenerateMessageResponse = {};
    await this.edcService.generateMessage(bank, body).toPromise().then(
      data => {
        edc = data!;
      }
    );
    await this.triggerEdc(bank, edc);
  }

  async triggerCimb() {
    const bank: string = "CIMB";
    let body = {
      transaction_type: "Sale-Online",
      amount: 1,
      edc_id: 75
    };
    let edc: EdcGenerateMessageResponse = {};
    await this.edcService.generateMessage(bank, body).toPromise().then(
      data => {
        edc = data!;
      }
    );
    await this.triggerEdc(bank, edc);
  }

  async triggerEdc(bank: string, edcMessage?: EdcGenerateMessageResponse) {
    if (!("serial" in navigator)) {
      console.log(`The Web serial API doesn\'t seem to be enabled or supported in your browser.
                    Please use Chrome, Edge, or Opera browser.`);
      return;
    }

    try {
      const ports = await navigator.serial.getPorts();
      const filtered = [...ports].filter(x => x.getInfo().usbProductId == edcMessage?.usb_product_id && x.getInfo().usbVendorId == edcMessage.usb_vendor_id)[0]
      const port = filtered != null ? filtered : await navigator.serial.requestPort({});

      // Open Port for EDC
      await port.open({
        baudRate: edcMessage?.baudrate,
        dataBits: edcMessage?.databits,
        stopBits: edcMessage?.stopbits,
        parity: edcMessage?.parity
      });

      // Write Message to EDC
      const writer = port.writable.getWriter();
      const fromHexString = (hexString: string) => 
      new Uint8Array(hexString.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
      await writer.write(fromHexString(edcMessage?.message!));
      writer.releaseLock();

      const reader = port.readable.getReader();

      let done = false;
      const edcParse: EdcParseMessageRequest = {}

      // Read message from EDC
      while (true) {
        let { value } = await reader.read();

        if (value) {
          let decodedValue = new TextDecoder("utf-8").decode(value);
          
          if (done) {
            edcParse.response_desc = decodedValue;
            reader.releaseLock();
            break;
          }
          else {
            edcParse.response_code = decodedValue;
          }
        }
        done = true;
      }

      // Translate message (POST to API)
      this.parseMessage(bank, edcParse);

      await port.close();
    }
    catch (error) {
      console.log(error);
    }
  }
}
