export const http = (statusCode, message) => ({ statusCode, body: JSON.stringify({ success:false, error: message }) });
export const ok = (data) => ({ statusCode: 200, body: JSON.stringify({ success:true, ...data }) });
export const created = (data) => ({ statusCode: 201, body: JSON.stringify({ success:true, ...data }) });