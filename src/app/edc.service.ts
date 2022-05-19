import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EdcGenerateMessageRequest, EdcGenerateMessageResponse, EdcParseMessageRequest, EdcParseMessageResponse } from './edc';

@Injectable({
  providedIn: 'root'
})
export class EdcService {

  constructor(private http: HttpClient) { }

  private cimbUrl = "https://localhost:7161/edccimb";
  private bniUrl = "https://localhost:7162/edcbni";

  // Sample value (Original value was get from Gateway)
  private headers = new HttpHeaders().set("ref_id", "16527610239361").set("hope_organization_id", "3");

  generateMessage(bank: string, body: EdcGenerateMessageRequest) {
    let url = this.getBankUrl(bank);
    return this.http.post<EdcGenerateMessageResponse>(`${url}/generatemessage`, body, {headers: this.headers});
  }

  parseMessage(bank: string, body: EdcParseMessageRequest) {
    let url = this.getBankUrl(bank);
    return this.http.post<EdcParseMessageResponse>(`${url}/parsemessage`, body);
  }
  
  getBankUrl(bank: string) {
    switch (bank) {
      case "BNI":
        return this.bniUrl;
      case "CIMB":
        return this.cimbUrl;
      default:
        return "";
    } 
  }
}
