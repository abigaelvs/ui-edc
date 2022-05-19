export interface EdcGenerateMessageResponse {
    baudrate?: number;
    databits?: number;
    stopbits?: number;
    parity?: string;
    usb_product_id?: string;
    usb_vendor_id?: string;
    message?: string;
}

export interface EdcParseMessageRequest {
    response_code?: string,
    response_desc?: string
}

export interface EdcGenerateMessageRequest {
    transaction_type?: string,
    amount?: number
    edc_id?: number
}

export interface EdcParseMessageResponse {
    edc_response_code?: string,
    tid?: string,
    merchant_id?: string,
    card_no?: string
    card_holder_name?: string,
    bank?: string,
    approval_code?: string,
    transaction_id?: string,
    card_expiry_date?: string
}
